import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, Loader2, AlertTriangle, Sparkles, Edit, X, Plus, Minus, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { analyzeMealImageWithAi, findNutritionalInfoForFood } from '../services/aiService';
import { processAnalyzedMealResult, calculateTotalRecipeMacros, parseServingSizeToGrams } from '../services/recipeService';
import { ProcessedAnalyzedMeal, Recipe, Macros, RecipeCategory, AiAnalyzedMeal, FoodItem, AnalyzedIngredient } from '../types';
import AddFoodForm from './AddFoodForm';
import {
    ANALYZE_MEAL_FROM_PHOTO_TITLE, ANALYZE_MEAL_FROM_PHOTO_DESCRIPTION, TAKE_PHOTO_BUTTON, CHOOSE_FROM_GALLERY_BUTTON,
    ANALYZING_IMAGE_MESSAGE, ANALYSIS_RESULTS_TITLE, ADJUST_QUANTITIES_PROMPT, SAVE_AS_RECIPE_BUTTON, MACRO_DISTRIBUTION_CHART_TITLE,
    UNMATCHED_INGREDIENTS_WARNING_TITLE, UNMATCHED_INGREDIENTS_WARNING_BODY, IMAGE_ANALYSIS_ERROR_MESSAGE, START_OVER_BUTTON,
    CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL, SEARCH_AND_ADD_BUTTON, AI_SEARCH_FAILED_ERROR, SEARCHING_FOR_INFO
} from '../constants';

const ConfidenceBar: React.FC<{ score: number }> = ({ score }) => {
    const confidence = score * 100;
    let color = 'bg-red-500';
    let widthClass = 'w-1/3';
    if (confidence >= 80) {
        color = 'bg-green-500';
        widthClass = 'w-full';
    } else if (confidence >= 60) {
        color = 'bg-yellow-500';
        widthClass = 'w-2/3';
    }
    
    return (
        <div className="w-12 h-2 bg-inputBg rounded-full overflow-hidden group relative flex-shrink-0" title={`ثقة ${Math.round(confidence)}%`}>
            <div className={`h-full rounded-full ${color} ${widthClass} transition-all duration-300`}></div>
        </div>
    );
};


const AnalyzeMealFromPhotoView: React.FC = () => {
    const { allFoodItems, setEditingRecipe, setCurrentView, handleAddNewFoodItem, showTemporaryNotification } = useAppContext();
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [rawAiResponse, setRawAiResponse] = useState<AiAnalyzedMeal | null>(null);
    const [processedMeal, setProcessedMeal] = useState<ProcessedAnalyzedMeal | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [mealName, setMealName] = useState('');
    const [modalData, setModalData] = useState<{ initialName?: string; prefilled?: Omit<FoodItem, 'id' | 'isCustom' | 'userId'> } | null>(null);
    const [searchingIngredient, setSearchingIngredient] = useState<string | null>(null);

    useEffect(() => {
        if (rawAiResponse) {
            const reProcessed = processAnalyzedMealResult(rawAiResponse, allFoodItems);
            setProcessedMeal(reProcessed);
        }
    }, [allFoodItems, rawAiResponse]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Use createImageBitmap for a more memory-efficient way to handle images, especially on mobile.
        // This avoids creating a large base64 string for the original image in memory.
        createImageBitmap(file)
            .then(imageBitmap => {
                const MAX_DIMENSION = 1024;
                let { width, height } = imageBitmap;

                // Maintain aspect ratio while resizing to a max dimension.
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round(height * (MAX_DIMENSION / width));
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round(width * (MAX_DIMENSION / height));
                        height = MAX_DIMENSION;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    setError("متصفحك لا يدعم معالجة الصور اللازمة لهذه الميزة.");
                    imageBitmap.close(); // Release memory even on error
                    return;
                }
                
                ctx.drawImage(imageBitmap, 0, 0, width, height);
                // Use a slightly lower quality to further reduce file size, improving reliability on slow networks.
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                const base64String = dataUrl.split(',')[1];
                
                imageBitmap.close(); // Explicitly release memory held by the bitmap.

                setImageBase64(base64String);
                triggerAnalysis(base64String);
            })
            .catch(err => {
                console.error("Error creating image bitmap:", err);
                setError("تعذر معالجة ملف الصورة. يرجى التأكد من أنه تنسيق صورة قياسي (مثل JPEG أو PNG).");
            });
    };

    const triggerAnalysis = async (b64String: string) => {
        setIsLoading(true);
        setError(null);
        setProcessedMeal(null);
        setRawAiResponse(null);
        try {
            const result = await analyzeMealImageWithAi(b64String, mealName);
            setRawAiResponse(result);
            // The useEffect will handle the initial processing
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError(IMAGE_ANALYSIS_ERROR_MESSAGE);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveNewFood = (newFoodData: Omit<FoodItem, 'id' | 'isCustom' | 'userId'>) => {
        const success = handleAddNewFoodItem(newFoodData);
        if (success) {
            setModalData(null); // This closes the modal
            // The useEffect watching `allFoodItems` will re-process the meal.
        }
    };

    const handleSearchAndAdd = async (unmatchedName: string) => {
        setSearchingIngredient(unmatchedName);
        try {
            const foodInfo = await findNutritionalInfoForFood(unmatchedName);
            setModalData({ prefilled: foodInfo });
        } catch (error) {
            showTemporaryNotification('error', AI_SEARCH_FAILED_ERROR);
            setModalData({ initialName: unmatchedName }); // Fallback to manual add
        } finally {
            setSearchingIngredient(null);
        }
    };

    const handleQuantityChange = (index: number, newQuantityGram: number) => {
        if (!processedMeal) return;
        const safeNewQuantity = Math.max(1, newQuantityGram);

        const updatedIngredients = [...processedMeal.matchedIngredients];
        const ingredientToUpdate: AnalyzedIngredient = { ...updatedIngredients[index] };
        
        const foodItem = allFoodItems.find(f => f.id === ingredientToUpdate.foodItemId);
        if(!foodItem) return;

        const baseWeight = parseServingSizeToGrams(foodItem.servingSize);
        if (!baseWeight) return;

        ingredientToUpdate.quantityGram = safeNewQuantity;
        ingredientToUpdate.calories = (foodItem.calories / baseWeight) * safeNewQuantity;
        ingredientToUpdate.protein = (foodItem.protein / baseWeight) * safeNewQuantity;
        ingredientToUpdate.carbs = (foodItem.carbs / baseWeight) * safeNewQuantity;
        ingredientToUpdate.fat = (foodItem.fat / baseWeight) * safeNewQuantity;

        updatedIngredients[index] = ingredientToUpdate;

        const newTotalMacros = calculateTotalRecipeMacros(updatedIngredients);

        setProcessedMeal({
            ...processedMeal,
            matchedIngredients: updatedIngredients,
            totalMacros: newTotalMacros
        });
    };
    
    const handleSaveAsRecipe = () => {
        if(!processedMeal) return;

        const partialRecipeForEdit: Partial<Recipe> = {
            name: mealName.trim() || `وجبة محفوظة - ${new Date().toLocaleDateString('ar-EG')}`,
            description: "تم تحليل هذه الوجبة تلقائيًا من صورة.",
            category: RecipeCategory.NONE,
            servings: 1,
            tags: [],
            imageUrl: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : '',
            ingredients: processedMeal.matchedIngredients.map(({ confidence, ...rest }) => rest), // Remove confidence before saving
            totalMacros: processedMeal.totalMacros,
            perServingMacros: processedMeal.totalMacros,
        };
        setEditingRecipe(partialRecipeForEdit as Recipe);
        setCurrentView('recipeCreation');
    };

    const handleStartOver = () => {
        setImageBase64(null);
        setProcessedMeal(null);
        setRawAiResponse(null);
        setError(null);
        setIsLoading(false);
        setMealName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const MacroPieChart: React.FC<{ data: Macros }> = ({ data }) => {
        const pieData = [
            { name: PROTEIN_LABEL, value: data.protein * 4 },
            { name: CARBS_LABEL, value: data.carbs * 4 },
            { name: FAT_LABEL, value: data.fat * 9 },
        ].filter(d => d.value > 0);

        const COLORS = ['#F87171', '#34D399', '#60A5FA'];
        const totalCalories = data.calories;
        if (totalCalories === 0) return null;

        return (
            <div className="w-full h-56">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" labelLine={false}
                             label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                 const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                 const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                 return (
                                     <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                                         {`${(percent * 100).toFixed(0)}%`}
                                     </text>
                                 );
                             }}>
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number, name) => [`${(value / totalCalories * 100).toFixed(0)}%`, name]}/>
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderInitialState = () => {
        const buttonClass = "w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-primary/40 transition-transform transform [@media(hover:hover)]:hover:scale-105 cursor-pointer";
        return (
            <div className="w-full max-w-lg text-center p-6 space-y-6">
                <Sparkles size={48} className="mx-auto text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light">{ANALYZE_MEAL_FROM_PHOTO_TITLE}</h2>
                <p className="text-textMuted">{ANALYZE_MEAL_FROM_PHOTO_DESCRIPTION}</p>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="mealName" className="block text-sm font-medium text-textBase mb-2">اسم الوجبة (اختياري، لزيادة الدقة)</label>
                        <input
                            type="text"
                            id="mealName"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            className="w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm"
                            placeholder="مثال: كبسة دجاج"
                        />
                    </div>
                     <div className="p-3 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs rounded-lg border border-blue-500/20 flex items-start gap-2 text-right">
                        <Info size={18} className="flex-shrink-0 mt-0.5"/>
                        <span>نصيحة: للحصول على أفضل النتائج، ضع شوكة أو عملة معدنية بجانب الطبق كمرجع للحجم.</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
                        <label htmlFor="camera-input" className={buttonClass}>
                            <CameraIcon size={22} /> {TAKE_PHOTO_BUTTON}
                        </label>
                        <label htmlFor="file-input" className={buttonClass}>
                            <ImageIcon size={22} /> {CHOOSE_FROM_GALLERY_BUTTON}
                        </label>
                    </div>
                </div>
                <input type="file" accept="image/*" capture="environment" id="camera-input" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                <input type="file" accept="image/*" id="file-input" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            </div>
        );
    };
    
    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <h3 className="text-lg font-semibold text-primary-light">جاري التحليل...</h3>
            <p className="text-textMuted text-sm">{ANALYZING_IMAGE_MESSAGE}</p>
        </div>
    );

    const renderError = () => (
         <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <AlertTriangle className="text-accent" size={48} />
            <h3 className="text-lg font-semibold text-accent">{IMAGE_ANALYSIS_ERROR_MESSAGE}</h3>
            {error && <p className="text-textMuted text-sm">{error}</p>}
            <button onClick={handleStartOver} className="mt-4 bg-primary text-white font-semibold py-2 px-6 rounded-lg">
                {START_OVER_BUTTON}
            </button>
        </div>
    );

    const renderResults = () => (
        processedMeal && imageBase64 &&
        <div className="w-full max-w-4xl space-y-6 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{ANALYSIS_RESULTS_TITLE}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Analyzed meal" className="rounded-xl shadow-lg w-full" />
                    <div className="p-4 bg-card/70 rounded-xl shadow-md space-y-3">
                        <h3 className="text-lg font-semibold text-primary-light">{MACRO_DISTRIBUTION_CHART_TITLE}</h3>
                        <MacroPieChart data={processedMeal.totalMacros} />
                    </div>
                </div>

                <div className="space-y-4 p-4 bg-card/70 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-primary-light">المكونات المكتشفة</h3>
                    <p className="text-xs text-textMuted">{ADJUST_QUANTITIES_PROMPT}</p>
                    
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {processedMeal.matchedIngredients.map((ing, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-inputBg/50 rounded-md">
                                <div className="flex-grow flex items-center gap-2">
                                    <ConfidenceBar score={ing.confidence} />
                                    <span className="text-sm text-textBase">{ing.foodItemName}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button onClick={() => handleQuantityChange(index, ing.quantityGram - 10)} className="w-8 h-8 rounded-md bg-subtleButton-bg hover:bg-subtleButton-hover flex items-center justify-center font-bold">-</button>
                                    <input 
                                        type="number" 
                                        value={Math.round(ing.quantityGram)} 
                                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 0)}
                                        className="w-14 bg-inputBg border border-border text-textBase rounded-md p-1.5 text-center text-sm"
                                    />
                                    <button onClick={() => handleQuantityChange(index, ing.quantityGram + 10)} className="w-8 h-8 rounded-md bg-subtleButton-bg hover:bg-subtleButton-hover flex items-center justify-center font-bold">+</button>
                                </div>
                                <span className="text-xs text-textMuted">جرام</span>
                            </div>
                        ))}
                    </div>

                    {processedMeal.unmatchedIngredientNames.length > 0 && (
                        <div className="p-3 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-400/50 text-xs space-y-2">
                            <p className="font-bold">{UNMATCHED_INGREDIENTS_WARNING_TITLE}</p>
                            <p>{UNMATCHED_INGREDIENTS_WARNING_BODY}</p>
                            <ul className="space-y-1.5 pt-1">
                                {processedMeal.unmatchedIngredientNames.map(name => (
                                    <li key={name} className="flex justify-between items-center bg-yellow-500/10 p-1.5 rounded">
                                        <span className="text-sm">{name}</span>
                                        <button 
                                            onClick={() => handleSearchAndAdd(name)}
                                            disabled={searchingIngredient === name}
                                            className="text-xs bg-yellow-600 text-white font-semibold py-1 px-2.5 rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-wait"
                                        >
                                            {searchingIngredient === name ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin me-1" />
                                                    {SEARCHING_FOR_INFO}
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={12} className="me-1"/>
                                                    {SEARCH_AND_ADD_BUTTON}
                                                </>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-border/50 space-y-2">
                        <h4 className="text-md font-semibold text-secondary">إجمالي السعرات والماكروز</h4>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                             <p><strong className="text-textMuted">{CALORIES_LABEL}:</strong> <span className="font-semibold text-textBase">{processedMeal.totalMacros.calories.toFixed(0)}</span></p>
                             <p><strong className="text-textMuted">{PROTEIN_LABEL}:</strong> <span className="font-semibold text-textBase">{processedMeal.totalMacros.protein.toFixed(1)}ج</span></p>
                             <p><strong className="text-textMuted">{CARBS_LABEL}:</strong> <span className="font-semibold text-textBase">{processedMeal.totalMacros.carbs.toFixed(1)}ج</span></p>
                             <p><strong className="text-textMuted">{FAT_LABEL}:</strong> <span className="font-semibold text-textBase">{processedMeal.totalMacros.fat.toFixed(1)}ج</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={handleStartOver} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-6 rounded-lg transition-colors shadow">
                    {START_OVER_BUTTON}
                </button>
                <button onClick={handleSaveAsRecipe} className="flex-1 bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-secondary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105">
                    <Edit size={18} /> {SAVE_AS_RECIPE_BUTTON}
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="w-full flex justify-center">
            {isLoading ? renderLoading() : error ? renderError() : processedMeal ? renderResults() : renderInitialState()}
            {modalData && (
                <AddFoodForm 
                    initialFoodName={modalData.initialName}
                    prefilledData={modalData.prefilled}
                    onSubmit={handleSaveNewFood}
                    onCancel={() => setModalData(null)}
                />
            )}
        </div>
    );
};

export default AnalyzeMealFromPhotoView;