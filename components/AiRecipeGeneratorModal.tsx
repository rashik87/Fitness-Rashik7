
import React, { useState } from 'react';
import { AiGeneratedRecipe, RecipeCategory, ProcessedAiRecipe } from '../types';
import { generateRecipeWithAi } from '../services/aiService';
import { processAiRecipeResult } from '../services/recipeService';
import { useAppContext } from '../contexts/AppContext';
import { 
    AI_RECIPE_GENERATOR_TITLE, AI_RECIPE_GENERATOR_DESCRIPTION, AI_PROMPT_INGREDIENTS_LABEL, AI_PROMPT_INGREDIENTS_PLACEHOLDER,
    AI_PROMPT_MEAL_TYPE_LABEL, AI_PROMPT_DIET_STYLE_LABEL, AI_PROMPT_DIET_STYLE_PLACEHOLDER, GENERATE_RECIPE_BUTTON,
    GENERATING_RECIPE_MESSAGE, AI_RECIPE_RESULT_TITLE, EDIT_AND_SAVE_AI_RECIPE_BUTTON, AI_ERROR_MESSAGE, CANCEL_BUTTON, RECIPE_CATEGORY_OPTIONS,
    AI_PROMPT_MIN_CALORIES_LABEL, AI_PROMPT_MAX_CALORIES_LABEL,
    TOTAL_RECIPE_MACROS_LABEL, PER_SERVING_MACROS_LABEL, CALORIES_UNIT, PROTEIN_UNIT, CARBS_UNIT, FAT_UNIT,
} from '../constants';
import { Sparkles, Loader2, X, AlertTriangle, ChevronsRight, FileWarning } from 'lucide-react';

interface AiRecipeGeneratorModalProps {
    onClose: () => void;
    onRecipeGenerated: (recipe: ProcessedAiRecipe) => void;
}

const AiRecipeGeneratorModal: React.FC<AiRecipeGeneratorModalProps> = ({ onClose, onRecipeGenerated }) => {
    const { allFoodItems } = useAppContext();
    const [ingredients, setIngredients] = useState('');
    const [mealType, setMealType] = useState<RecipeCategory>(RecipeCategory.LUNCH);
    const [dietStyle, setDietStyle] = useState('');
    const [minCalories, setMinCalories] = useState('');
    const [maxCalories, setMaxCalories] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedRecipe, setProcessedRecipe] = useState<ProcessedAiRecipe | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!ingredients.trim()) {
            setError('يرجى إدخال مكون واحد على الأقل.');
            return;
        }

        const minCals = minCalories ? parseInt(minCalories, 10) : undefined;
        const maxCals = maxCalories ? parseInt(maxCalories, 10) : undefined;
        
        if (minCals && maxCals && minCals > maxCals) {
            setError('الحد الأقصى للسعرات يجب أن يكون أكبر من أو يساوي الحد الأدنى.');
            return;
        }

        setIsLoading(true);
        setProcessedRecipe(null);

        try {
            const result = await generateRecipeWithAi({
                ingredients,
                mealType,
                dietStyle,
                minCalories: minCals,
                maxCalories: maxCals,
                foodDb: allFoodItems
            });
            
            const processed = processAiRecipeResult(result, allFoodItems);
            setProcessedRecipe(processed);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(AI_ERROR_MESSAGE);
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
    const labelClass = "block text-sm font-medium text-textBase mb-2 text-right";

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <h3 className="text-lg font-semibold text-primary-light">جاري الإعداد...</h3>
                    <p className="text-textMuted text-sm">{GENERATING_RECIPE_MESSAGE}</p>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <AlertTriangle className="text-accent" size={48} />
                    <h3 className="text-lg font-semibold text-accent">{AI_ERROR_MESSAGE}</h3>
                    <p className="text-textMuted text-sm">{error}</p>
                    <button onClick={() => { setError(null); setIsLoading(false); }} className="mt-4 bg-primary text-white font-semibold py-2 px-6 rounded-lg">
                        حاول مرة أخرى
                    </button>
                </div>
            );
        }

        if (processedRecipe) {
            return (
                <div className="text-right space-y-4">
                    <h3 className="text-xl font-bold text-secondary text-center">{AI_RECIPE_RESULT_TITLE}</h3>
                    <div className="p-4 bg-inputBg/50 rounded-lg max-h-[55vh] overflow-y-auto space-y-3">
                         <h4 className="text-lg font-semibold text-primary-light">{processedRecipe.recipeName}</h4>
                         <p className="text-sm text-textMuted italic">"{processedRecipe.description}"</p>
                         <p className="text-xs text-textMuted">حصص: {processedRecipe.servings}</p>
                         
                         {processedRecipe.unmatchedIngredientNames.length > 0 && (
                            <div className="p-3 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-400/50 text-xs">
                                <p className="font-bold flex items-center gap-2"><FileWarning size={16}/> تنبيه: المكونات التالية لم يتم العثور عليها في قاعدة البيانات:</p>
                                <ul className="list-disc ps-5 mt-1">
                                    {processedRecipe.unmatchedIngredientNames.map(name => <li key={name}>{name}</li>)}
                                </ul>
                                <p className="mt-1">الماكروز المحسوبة لا تشمل هذه المكونات. يرجى إضافتها يدويًا للحصول على دقة كاملة.</p>
                            </div>
                         )}

                         <div>
                            <h5 className="font-semibold text-textBase mb-1 mt-2">المكونات المحسوبة:</h5>
                             <ul className="text-sm text-textMuted list-disc ps-5">
                                {processedRecipe.matchedIngredients.map(ing => (
                                    <li key={ing.foodItemId}>{ing.foodItemName}: {ing.quantityGram} جرام</li>
                                ))}
                             </ul>
                         </div>
                         
                         <div className="space-y-2 pt-2 border-t border-border/50">
                            <h5 className="font-semibold text-textBase">{TOTAL_RECIPE_MACROS_LABEL}</h5>
                            <p className="text-sm text-textMuted">{processedRecipe.totalMacros.calories.toFixed(0)} {CALORIES_UNIT} • {processedRecipe.totalMacros.protein.toFixed(1)} {PROTEIN_UNIT} • {processedRecipe.totalMacros.carbs.toFixed(1)} {CARBS_UNIT} • {processedRecipe.totalMacros.fat.toFixed(1)} {FAT_UNIT}</p>
                            <h5 className="font-semibold text-textBase mt-2">{PER_SERVING_MACROS_LABEL}</h5>
                            <p className="text-sm text-textMuted">{processedRecipe.perServingMacros.calories.toFixed(0)} {CALORIES_UNIT} • {processedRecipe.perServingMacros.protein.toFixed(1)} {PROTEIN_UNIT} • {processedRecipe.perServingMacros.carbs.toFixed(1)} {CARBS_UNIT} • {processedRecipe.perServingMacros.fat.toFixed(1)} {FAT_UNIT}</p>
                        </div>
                         
                         <div>
                            <h5 className="font-semibold text-textBase mb-1 mt-2">طريقة التحضير:</h5>
                            <p className="text-sm text-textMuted whitespace-pre-wrap">{processedRecipe.instructions}</p>
                         </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                         <button onClick={onClose} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg shadow">
                            {CANCEL_BUTTON}
                         </button>
                        <button onClick={() => onRecipeGenerated(processedRecipe)} className="flex-1 bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-secondary/40 flex items-center justify-center gap-2">
                            <span>{EDIT_AND_SAVE_AI_RECIPE_BUTTON}</span>
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            );
        }

        // Default: show form
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center">
                    <div className="mx-auto w-fit p-3 bg-accent/20 rounded-full mb-3">
                         <Sparkles size={28} className="text-accent" />
                    </div>
                    <h2 id="ai-recipe-title" className="text-xl font-bold text-primary-light">{AI_RECIPE_GENERATOR_TITLE}</h2>
                    <p className="text-textMuted text-sm mt-2">{AI_RECIPE_GENERATOR_DESCRIPTION}</p>
                </div>
                
                <div>
                    <label htmlFor="ingredients" className={labelClass}>{AI_PROMPT_INGREDIENTS_LABEL}</label>
                    <textarea id="ingredients" value={ingredients} onChange={e => setIngredients(e.target.value)} rows={3} className={inputClass} placeholder={AI_PROMPT_INGREDIENTS_PLACEHOLDER} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="mealType" className={labelClass}>{AI_PROMPT_MEAL_TYPE_LABEL}</label>
                        <select id="mealType" value={mealType} onChange={e => setMealType(e.target.value as RecipeCategory)} className={inputClass}>
                           {RECIPE_CATEGORY_OPTIONS.filter(o => o.value !== RecipeCategory.NONE).map(opt => (
                               <option key={opt.value} value={opt.value}>{opt.label}</option>
                           ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="dietStyle" className={labelClass}>{AI_PROMPT_DIET_STYLE_LABEL}</label>
                        <input type="text" id="dietStyle" value={dietStyle} onChange={e => setDietStyle(e.target.value)} className={inputClass} placeholder={AI_PROMPT_DIET_STYLE_PLACEHOLDER}/>
                    </div>
                    <div>
                        <label htmlFor="minCalories" className={labelClass}>{AI_PROMPT_MIN_CALORIES_LABEL}</label>
                        <input type="number" id="minCalories" value={minCalories} onChange={e => setMinCalories(e.target.value)} className={inputClass} placeholder="مثال: 300" min="0" step="10"/>
                    </div>
                    <div>
                        <label htmlFor="maxCalories" className={labelClass}>{AI_PROMPT_MAX_CALORIES_LABEL}</label>
                        <input type="number" id="maxCalories" value={maxCalories} onChange={e => setMaxCalories(e.target.value)} className={inputClass} placeholder="مثال: 600" min="0" step="10"/>
                    </div>
                </div>
                 <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="button" onClick={onClose} className="sm:w-1/3 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg shadow">
                        {CANCEL_BUTTON}
                    </button>
                    <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-accent to-accent-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-accent/40 disabled:opacity-50 disabled:cursor-not-allowed">
                        {GENERATE_RECIPE_BUTTON}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true" aria-labelledby="ai-recipe-title">
            <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-primary/20 relative animate-scaleIn max-h-[90vh] overflow-y-auto">
                {!isLoading && !processedRecipe && (
                    <button onClick={onClose} className="absolute top-4 left-4 text-textMuted hover:text-textBase transition-colors p-1" aria-label="إغلاق">
                        <X size={20} />
                    </button>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default AiRecipeGeneratorModal;