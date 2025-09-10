
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recipe, RecipeIngredient, FoodItem, Macros, RecipeCategory, RecipeTag } from '../types';
import {
  calculateNutrientsForIngredientQuantity,
  calculateTotalRecipeMacros,
  calculatePerServingMacros,
  parseServingSizeToGrams,
} from '../services/recipeService';
import {
  ADD_RECIPE_TITLE, EDIT_RECIPE_TITLE, RECIPE_NAME_LABEL, RECIPE_DESCRIPTION_LABEL,
  RECIPE_IMAGE_LABEL, UPLOAD_IMAGE_BUTTON, CHANGE_IMAGE_BUTTON, IMAGE_PREVIEW_ALT, IMAGE_UPLOAD_NOTE, ERROR_IMAGE_UPLOAD_SIZE, ERROR_IMAGE_UPLOAD_TYPE, ERROR_IMAGE_LOAD_PREVIEW,
  RECIPE_SERVINGS_LABEL, ADD_INGREDIENT_BUTTON, INGREDIENTS_LABEL,
  INGREDIENT_FOOD_ITEM_LABEL, INGREDIENT_QUANTITY_GRAM_LABEL, TOTAL_RECIPE_MACROS_LABEL,
  PER_SERVING_MACROS_LABEL, SAVE_RECIPE_BUTTON, CANCEL_BUTTON, REMOVE_INGREDIENT_LABEL,
  REQUIRED_FIELD_ERROR, RECIPE_SERVINGS_POSITIVE, RECIPE_INGREDIENTS_REQUIRED,
  INGREDIENT_QUANTITY_POSITIVE, NO_VALID_FOOD_ITEMS_FOR_RECIPE, ERROR_INGREDIENT_NO_GRAMS,
  CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL, SELECT_INGREDIENT_PLACEHOLDER,
  CALORIES_UNIT, PROTEIN_UNIT, CARBS_UNIT, FAT_UNIT, IMAGE_URL_INPUT_PLACEHOLDER,
  PUBLIC_DATABASE_TAB, MY_FOODS_TAB, RECIPE_CATEGORY_LABEL, RECIPE_CATEGORY_OPTIONS,
  RECIPE_TAGS_LABEL, RECIPE_TAG_OPTIONS, RECIPE_CATEGORY_IMPORTANCE_HINT
} from '../constants';
import { UploadCloud, X, GripVertical, Info } from 'lucide-react';

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface RecipeCreationViewProps {
  allFoodItems: FoodItem[];
  onSaveRecipe: (recipe: Recipe | Omit<Recipe, 'id' | 'isCustom' | 'createdAt' | 'userId'>) => void;
  onCancel: () => void;
  existingRecipe?: Recipe | null;
}

type RecipeFormData = {
  name: string;
  description: string;
  servings: string;
  category: RecipeCategory;
};

type FormErrors = {
  name?: string;
  servings?: string;
  ingredients?: string;
  general?: string;
  image?: string;
};

type IngredientWithId = RecipeIngredient & { localId: string };

const RecipeCreationView: React.FC<RecipeCreationViewProps> = ({
  allFoodItems,
  onSaveRecipe,
  onCancel,
  existingRecipe,
}) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    name: existingRecipe?.name || '',
    description: existingRecipe?.description || '',
    servings: existingRecipe?.servings?.toString() || '1',
    category: existingRecipe?.category || RecipeCategory.NONE,
  });
  const [selectedTags, setSelectedTags] = useState<Set<RecipeTag>>(new Set(existingRecipe?.tags || []));
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(existingRecipe?.imageUrl || null);
  
  const [ingredients, setIngredients] = useState<IngredientWithId[]>(() =>
    existingRecipe?.ingredients.map(ing => ({ ...ing, localId: crypto.randomUUID() })) || []
  );
  const [totalMacros, setTotalMacros] = useState<Macros>(existingRecipe?.totalMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [perServingMacros, setPerServingMacros] = useState<Macros>(existingRecipe?.perServingMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ingredientSourceTab, setIngredientSourceTab] = useState<'public' | 'private'>('public');

  const [ingredientSearchTerms, setIngredientSearchTerms] = useState<Record<string, string>>(() => {
      const initialTerms: Record<string, string> = {};
      if (existingRecipe && existingRecipe.ingredients.length > 0) {
        const initialIngredients = existingRecipe.ingredients.map(ing => ({ ...ing, localId: crypto.randomUUID() }));
        initialIngredients.forEach(ing => {
            initialTerms[ing.localId] = ing.foodItemName;
        });
        setIngredients(initialIngredients);
      }
      return initialTerms;
  });

  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const blurTimeoutId = useRef<number | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const availableFoodItems = useMemo(() => {
    return allFoodItems.filter(item => parseServingSizeToGrams(item.servingSize) !== null);
  }, [allFoodItems]);

  useEffect(() => {
    const currentTotalMacros = calculateTotalRecipeMacros(ingredients);
    setTotalMacros(currentTotalMacros);
    const currentServings = parseInt(formData.servings, 10) || 1;
    setPerServingMacros(calculatePerServingMacros(currentTotalMacros, currentServings));
  }, [ingredients, formData.servings]);

  useEffect(() => {
    setImagePreviewError(false); 
    if (errors.image) {
        setErrors(prev => ({...prev, image: undefined}));
    }
  }, [imageDataUrl]);

  const handleDrop = (dropId: string) => {
    if (draggedId === null || draggedId === dropId) {
        setDraggedId(null);
        return;
    }
    
    const draggedIndex = ingredients.findIndex(ing => ing.localId === draggedId);
    const dropIndex = ingredients.findIndex(ing => ing.localId === dropId);
    
    if (draggedIndex === -1 || dropIndex === -1) return;

    const newIngredients = [...ingredients];
    const [movedItem] = newIngredients.splice(draggedIndex, 1);
    newIngredients.splice(dropIndex, 0, movedItem);
    setIngredients(newIngredients);
    
    setDraggedId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTagChange = (tag: RecipeTag) => {
    setSelectedTags(prevTags => {
        const newTags = new Set(prevTags);
        if(newTags.has(tag)) {
            newTags.delete(tag);
        } else {
            newTags.add(tag);
        }
        return newTags;
    });
  }

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrors(prev => ({ ...prev, image: ERROR_IMAGE_UPLOAD_SIZE(MAX_IMAGE_SIZE_MB) }));
        setImageDataUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: ERROR_IMAGE_UPLOAD_TYPE }));
        setImageDataUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setErrors(prev => ({ ...prev, image: undefined }));
      setImagePreviewError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
      };
      reader.onerror = () => {
        setImagePreviewError(true);
        setImageDataUrl(null);
        setErrors(prev => ({ ...prev, image: ERROR_IMAGE_LOAD_PREVIEW }));
      }
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImageDataUrl(null);
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, image: undefined }));
  };

  const handleAddIngredient = () => {
    if (availableFoodItems.length === 0) {
      setErrors(prev => ({ ...prev, ingredients: NO_VALID_FOOD_ITEMS_FOR_RECIPE }));
      return;
    }
    const newId = crypto.randomUUID();
    const newIngredient: IngredientWithId = {
        localId: newId,
        foodItemId: '', 
        foodItemName: '', 
        quantityGram: 100, 
        originalServingSize: '',
        calories: 0, protein: 0, carbs: 0, fat: 0,
    };
    setIngredients(prev => [...prev, newIngredient]);
    setIngredientSearchTerms(prev => ({...prev, [newId]: '' }));
    if (errors.ingredients) setErrors(prev => ({ ...prev, ingredients: undefined }));
    setTimeout(() => {
        document.getElementById(`ingredientFoodItem-${newId}`)?.focus();
    }, 0);
  };
  
  const handleInputFocus = (id: string, foodItemId: string) => {
    if (blurTimeoutId.current) {
        clearTimeout(blurTimeoutId.current);
    }
    setActiveSuggestionId(id);
    if (foodItemId) {
        handleIngredientSearchChange(id, '');
    }
  };

  const handleInputBlur = () => {
    blurTimeoutId.current = window.setTimeout(() => {
        setActiveSuggestionId(null);
    }, 200);
  };

  const handleIngredientSearchChange = (id: string, value: string) => {
    setIngredientSearchTerms(prev => ({ ...prev, [id]: value }));
    setActiveSuggestionId(id);
  };

  const handleIngredientSelect = (id: string, foodItem: FoodItem) => {
    setIngredientSearchTerms(prev => ({...prev, [id]: foodItem.name}));
    setActiveSuggestionId(null);

    setIngredients(prevIngredients => {
        return prevIngredients.map(ing => {
            if (ing.localId === id) {
                const updatedIng = { ...ing };
                updatedIng.foodItemId = foodItem.id;
                updatedIng.foodItemName = foodItem.name;
                updatedIng.originalServingSize = foodItem.servingSize;
                const nutrients = calculateNutrientsForIngredientQuantity(foodItem, updatedIng.quantityGram);
                if (nutrients) {
                    Object.assign(updatedIng, nutrients);
                    if (errors.ingredients) setErrors(prev => ({...prev, ingredients: undefined}));
                } else {
                    setErrors(prev => ({ ...prev, ingredients: `${ERROR_INGREDIENT_NO_GRAMS} (${foodItem.name})` }));
                }
                return updatedIng;
            }
            return ing;
        });
    });
  };

  const handleQuantityChange = (id: string, value: string) => {
     setIngredients(prevIngredients => {
        return prevIngredients.map(ing => {
            if (ing.localId === id) {
                 const updatedIng = { ...ing };
                 const quantity = parseFloat(value) || 0;
                 updatedIng.quantityGram = quantity;

                 const foodItem = allFoodItems.find(fi => fi.id === updatedIng.foodItemId);
                 if (foodItem) {
                     const nutrients = calculateNutrientsForIngredientQuantity(foodItem, quantity);
                     if (nutrients) {
                         Object.assign(updatedIng, nutrients);
                     }
                 }
                 return updatedIng;
            }
            return ing;
        });
     });
  };

  const handleRemoveIngredient = (idToRemove: string) => {
    setIngredients(prev => prev.filter(ing => ing.localId !== idToRemove));
    setIngredientSearchTerms(prev => {
        const newTerms = { ...prev };
        delete newTerms[idToRemove];
        return newTerms;
    });
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = REQUIRED_FIELD_ERROR;
    
    const servingsNum = parseInt(formData.servings, 10);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      newErrors.servings = RECIPE_SERVINGS_POSITIVE;
    }
    if (ingredients.length === 0) {
      newErrors.ingredients = RECIPE_INGREDIENTS_REQUIRED;
    }
    let ingredientErrors: string[] = [];
    ingredients.forEach((ing, index) => {
        if (!ing.foodItemId || ing.foodItemId === '') {
            ingredientErrors.push(`المكون #${index + 1} غير محدد أو غير صالح.`);
        }
        if(ing.quantityGram <= 0) {
            ingredientErrors.push(`كمية المكون '${ing.foodItemName}' (رقم ${index + 1}) ${INGREDIENT_QUANTITY_POSITIVE}`);
        }
        if(!parseServingSizeToGrams(ing.originalServingSize)){
             ingredientErrors.push(`مكون '${ing.foodItemName}' (رقم ${index + 1}) ${ERROR_INGREDIENT_NO_GRAMS}`);
        }
    });
    if(ingredientErrors.length > 0) {
        newErrors.ingredients = ingredientErrors.join(' | ');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !errors.image;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const recipeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: Array.from(selectedTags),
        imageUrl: imageDataUrl || undefined,
        servings: parseInt(formData.servings, 10),
        ingredients: ingredients.map(({ localId, ...rest }) => rest), // Remove localId before saving
        totalMacros,
        perServingMacros,
      };
      
      if(existingRecipe){
        onSaveRecipe({ ...existingRecipe, ...recipeData });
      } else {
        onSaveRecipe(recipeData as Omit<Recipe, 'id' | 'isCustom' | 'createdAt' | 'userId'>);
      }
    }
  };
  
  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
  const labelClass = "block text-sm font-medium text-textBase mb-2";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 sm:space-y-6 bg-card/80 p-4 sm:p-6 rounded-xl shadow-2xl ring-1 ring-primary/20">
      <h2 className="text-xl md:text-2xl font-bold text-primary-light text-center">
        {existingRecipe ? EDIT_RECIPE_TITLE : ADD_RECIPE_TITLE}
      </h2>

      {errors.general && <p className="text-accent text-sm p-2 bg-accent/20 rounded-md">{errors.general}</p>}

      <div>
        <label htmlFor="name" className={labelClass}>{RECIPE_NAME_LABEL}</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} className={inputClass} />
        {errors.name && <p className="text-accent text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>{RECIPE_DESCRIPTION_LABEL}</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className={inputClass} rows={3}></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelClass}>{RECIPE_CATEGORY_LABEL}</label>
          <select id="category" name="category" value={formData.category} onChange={handleFormChange} className={inputClass}>
            {RECIPE_CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-card text-textBase">{opt.label}</option>
            ))}
          </select>
           <div className="flex items-start gap-2 mt-2 p-2 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs rounded-lg border border-blue-500/20">
              <Info size={16} className="flex-shrink-0 mt-0.5"/>
              <span>{RECIPE_CATEGORY_IMPORTANCE_HINT}</span>
          </div>
        </div>
         <div>
          <label htmlFor="servings" className={labelClass}>{RECIPE_SERVINGS_LABEL}</label>
          <input type="number" id="servings" name="servings" value={formData.servings} onChange={handleFormChange} className={inputClass} min="1" step="1" />
          {errors.servings && <p className="text-accent text-xs mt-1">{errors.servings}</p>}
        </div>
      </div>
      
       <div>
        <label className={labelClass}>{RECIPE_TAGS_LABEL}</label>
        <div className="p-3 bg-inputBg/50 rounded-lg flex flex-wrap gap-x-4 gap-y-2">
            {RECIPE_TAG_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-textBase">
                    <input type="checkbox"
                           checked={selectedTags.has(opt.value)}
                           onChange={() => handleTagChange(opt.value)}
                           className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {opt.label}
                </label>
            ))}
        </div>
       </div>


       <div>
        <label className={labelClass}>{RECIPE_IMAGE_LABEL}</label>
        <div className="mt-2 flex items-center gap-4">
            {imageDataUrl && !imagePreviewError && (
                 <div className="relative group flex-shrink-0">
                     <img 
                        src={imageDataUrl} 
                        alt={IMAGE_PREVIEW_ALT} 
                        className="rounded-lg h-24 w-24 object-cover border-2 border-border shadow-md"
                        onError={() => { setImagePreviewError(true); setErrors(prev => ({...prev, image: ERROR_IMAGE_LOAD_PREVIEW})); }}
                     />
                     <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-accent rounded-full p-1 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                         <X size={16}/>
                     </button>
                 </div>
            )}
            <div className="flex-grow">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors"
                >
                    <UploadCloud className="w-8 h-8 text-textMuted" />
                    <span className="mt-2 text-sm text-textBase">{imageDataUrl ? CHANGE_IMAGE_BUTTON : UPLOAD_IMAGE_BUTTON}</span>
                    <p className="text-xs text-textMuted mt-1">{IMAGE_UPLOAD_NOTE}</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />
            </div>
        </div>
        {errors.image && <p className="text-accent text-xs mt-1">{errors.image}</p>}
        {imagePreviewError && !errors.image && <div className="mt-1 p-1 text-xs text-accent bg-accent/10 rounded-md border border-accent/30">{ERROR_IMAGE_LOAD_PREVIEW}</div>}
        <div className="mt-2">
            <label htmlFor="imageUrlExternal" className="text-xs text-textMuted">{IMAGE_URL_INPUT_PLACEHOLDER}:</label>
            <input type="url" id="imageUrlExternal" placeholder="https://example.com/image.jpg" className={`${inputClass} text-sm mt-0.5 p-2`} value={imageDataUrl && (imageDataUrl.startsWith('http')) ? imageDataUrl : ''} onChange={(e) => { const url = e.target.value; setImageDataUrl(url.trim() || null); setImagePreviewError(false); setErrors(prev => ({ ...prev, image: undefined })); }} />
        </div>
      </div>

      <div className="space-y-4 p-3 sm:p-4 border border-border rounded-lg bg-card/50">
        <h3 className="text-lg font-semibold text-primary-light">{INGREDIENTS_LABEL}</h3>
        {errors.ingredients && <p className="text-accent text-xs mb-2 p-2 bg-accent/20 rounded-md whitespace-pre-wrap">{errors.ingredients}</p>}
        <div className="space-y-3">
          {ingredients.map((ing, index) => (
            <div 
              key={ing.localId}
              draggable
              onDragStart={() => setDraggedId(ing.localId)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(ing.localId)}
              onDragEnd={() => setDraggedId(null)}
              className={`p-3 bg-card/70 rounded-lg space-y-2 border-s-4 shadow-md relative transition-all duration-200 ${draggedId === ing.localId ? 'opacity-30' : 'opacity-100'}`}
              style={{ borderLeftColor: ing.foodItemId ? '#818CF8' : '#CBD5E1' }}
            >
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <div 
                          className="cursor-grab text-textMuted hover:text-textBase touch-none"
                          title="اسحب لترتيب المكون"
                      >
                          <GripVertical size={20} />
                      </div>
                      <p className="text-sm font-medium text-textBase">المكون #{index + 1}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveIngredient(ing.localId)} 
                          className="text-accent hover:text-accent-dark text-sm font-bold p-2 -m-2"
                          aria-label={`${REMOVE_INGREDIENT_LABEL} ${ing.foodItemName || `المكون رقم ${index+1}`}`}>
                    &times;
                  </button>
              </div>
              
              <div className="relative">
                <label htmlFor={`ingredientFoodItem-${ing.localId}`} className={labelClass}>{INGREDIENT_FOOD_ITEM_LABEL}</label>
                <input type="text" id={`ingredientFoodItem-${ing.localId}`} value={ingredientSearchTerms[ing.localId] || ''} 
                       onChange={(e) => handleIngredientSearchChange(ing.localId, e.target.value)} 
                       onFocus={() => handleInputFocus(ing.localId, ing.foodItemId)} 
                       onBlur={handleInputBlur} 
                       className={inputClass} placeholder={SELECT_INGREDIENT_PLACEHOLDER} autoComplete="off" />
                {activeSuggestionId === ing.localId && (
                  <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto flex flex-col">
                    <div className="flex border-b border-border sticky top-0 bg-card z-10 shrink-0">
                      <button type="button" onClick={() => setIngredientSourceTab('public')} className={`flex-1 px-3 py-2 text-xs font-semibold text-center transition-colors ${ingredientSourceTab === 'public' ? 'bg-primary text-white' : 'text-textMuted hover:bg-primary/20'}`}>{PUBLIC_DATABASE_TAB}</button>
                      <button type="button" onClick={() => setIngredientSourceTab('private')} className={`flex-1 px-3 py-2 text-xs font-semibold text-center transition-colors ${ingredientSourceTab === 'private' ? 'bg-primary text-white' : 'text-textMuted hover:bg-primary/20'}`}>{MY_FOODS_TAB}</button>
                    </div>
                    <div className="overflow-y-auto">
                      {availableFoodItems.filter(fi => ingredientSourceTab === 'public' ? !fi.isCustom : fi.isCustom).filter(fi => fi.name.toLowerCase().includes((ingredientSearchTerms[ing.localId] || '').toLowerCase())).slice(0, 50).map(fi => (
                        <div key={fi.id} onMouseDown={() => handleIngredientSelect(ing.localId, fi)} className="p-2 text-sm hover:bg-primary/20 cursor-pointer">{fi.name}</div>
                      ))}
                      {availableFoodItems.filter(fi => ingredientSourceTab === 'public' ? !fi.isCustom : fi.isCustom).filter(fi => fi.name.toLowerCase().includes((ingredientSearchTerms[ing.localId] || '').toLowerCase())).length === 0 && <p className="p-2 text-xs text-textMuted text-center">لا توجد عناصر تطابق بحثك في هذا القسم.</p>}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor={`ingredientQuantity-${ing.localId}`} className={labelClass}>{INGREDIENT_QUANTITY_GRAM_LABEL}</label>
                <input type="number" id={`ingredientQuantity-${ing.localId}`} value={ing.quantityGram} onChange={(e) => handleQuantityChange(ing.localId, e.target.value)} className={inputClass} min="0.1" step="any"/>
              </div>
              <div className="text-xs text-textMuted pt-1 border-t border-border/50">
                <span>{CALORIES_LABEL}: {ing.calories.toFixed(0)}, </span>
                <span>{PROTEIN_LABEL}: {ing.protein.toFixed(1)}ج, </span>
                <span>{CARBS_LABEL}: {ing.carbs.toFixed(1)}ج, </span>
                <span>{FAT_LABEL}: {ing.fat.toFixed(1)}ج</span>
              </div>
            </div>
          ))}
        </div>
        {availableFoodItems.length > 0 ? (
          <button type="button" onClick={handleAddIngredient} className={`w-full mt-2 bg-secondary hover:bg-secondary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow hover:shadow-md`}>
            {ADD_INGREDIENT_BUTTON}
          </button>
        ) : (
          <p className="text-sm text-textMuted text-center p-2 bg-card/30 rounded-md">{NO_VALID_FOOD_ITEMS_FOR_RECIPE}</p>
        )}
      </div>

      <div className="space-y-3 p-3 sm:p-4 bg-card/70 rounded-lg shadow-inner">
        <div>
          <h4 className="text-md font-semibold text-primary-light">{TOTAL_RECIPE_MACROS_LABEL}</h4>
          <p className="text-sm text-textBase">
            {totalMacros.calories.toFixed(0)} {CALORIES_UNIT} &bull; {totalMacros.protein.toFixed(1)} {PROTEIN_UNIT} &bull; {totalMacros.carbs.toFixed(1)} {CARBS_UNIT} &bull; {totalMacros.fat.toFixed(1)} {FAT_UNIT}
          </p>
        </div>
        <div>
          <h4 className="text-md font-semibold text-primary-light">{PER_SERVING_MACROS_LABEL} (لـ {formData.servings} حصص)</h4>
          <p className="text-sm text-textBase">
            {perServingMacros.calories.toFixed(0)} {CALORIES_UNIT} &bull; {perServingMacros.protein.toFixed(1)} {PROTEIN_UNIT} &bull; {perServingMacros.carbs.toFixed(1)} {CARBS_UNIT} &bull; {perServingMacros.fat.toFixed(1)} {FAT_UNIT}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse pt-4">
        <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 transform [@media(hover:hover)]:hover:scale-105">
          {SAVE_RECIPE_BUTTON}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow hover:shadow-md">
          {CANCEL_BUTTON}
        </button>
      </div>
    </form>
  );
};

export default RecipeCreationView;