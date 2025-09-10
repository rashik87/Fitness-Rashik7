
import React, { useState, useEffect } from 'react';
import { FoodItem } from '../types';
import { parseServingSizeToGrams } from '../services/recipeService';
import { 
  FOOD_NAME_LABEL, 
  CALORIES_LABEL, 
  PROTEIN_LABEL, 
  CARBS_LABEL, 
  FAT_LABEL, 
  SERVING_SIZE_LABEL,
  SERVING_SIZE_PLACEHOLDER,
  SUBMIT_NEW_FOOD_BUTTON,
  CANCEL_BUTTON,
  LABEL_PER_SERVING,
  REQUIRED_FIELD_ERROR,
  POSITIVE_NUMBER_ERROR,
  EDIT_FOOD_TITLE,
  EDIT_FOOD_BUTTON,
  SERVING_SIZE_GRAMS_ERROR,
} from '../constants';

interface AddFoodFormProps {
  onSubmit: (foodData: Omit<FoodItem, 'id' | 'isCustom' | 'userId'>, idToUpdate?: string) => void;
  onCancel: () => void;
  existingFood?: FoodItem | null;
  initialFoodName?: string;
  prefilledData?: Omit<FoodItem, 'id' | 'isCustom' | 'userId'> | null;
}

type FormData = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servingSize: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const AddFoodForm: React.FC<AddFoodFormProps> = ({ onSubmit, onCancel, existingFood, initialFoodName, prefilledData }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = !!existingFood;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: existingFood.name,
        calories: existingFood.calories.toString(),
        protein: existingFood.protein.toString(),
        carbs: existingFood.carbs.toString(),
        fat: existingFood.fat.toString(),
        servingSize: existingFood.servingSize,
      });
    } else if (prefilledData) {
       setFormData({
        name: prefilledData.name,
        calories: prefilledData.calories.toString(),
        protein: prefilledData.protein.toString(),
        carbs: prefilledData.carbs.toString(),
        fat: prefilledData.fat.toString(),
        servingSize: prefilledData.servingSize,
      });
    } else if (initialFoodName) {
      setFormData(prev => ({ ...prev, name: initialFoodName }));
    }
  }, [existingFood, isEditMode, initialFoodName, prefilledData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = REQUIRED_FIELD_ERROR;
    
    if (!formData.servingSize.trim()) {
      newErrors.servingSize = REQUIRED_FIELD_ERROR;
    } else if (parseServingSizeToGrams(formData.servingSize) === null) {
      newErrors.servingSize = SERVING_SIZE_GRAMS_ERROR;
    }

    const numericFields: (keyof FormData)[] = ['calories', 'protein', 'carbs', 'fat'];
    numericFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = REQUIRED_FIELD_ERROR;
      } else if (isNaN(parseFloat(formData[field])) || parseFloat(formData[field]) < 0) {
        newErrors[field] = POSITIVE_NUMBER_ERROR;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const foodData = {
        name: formData.name.trim(),
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        carbs: parseFloat(formData.carbs),
        fat: parseFloat(formData.fat),
        servingSize: formData.servingSize.trim(),
      };
      onSubmit(foodData, existingFood?.id);
    }
  };

  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
  const labelClass = "block text-sm font-medium text-textBase mb-2";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <form onSubmit={handleSubmit} className="bg-card p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto ring-1 ring-primary/20 modal-enter">
        <h2 className="text-xl font-semibold text-primary-light mb-4">
          {isEditMode ? EDIT_FOOD_TITLE : 'إضافة طعام جديد'}
        </h2>
        
        <div>
          <label htmlFor="name" className={labelClass}>{FOOD_NAME_LABEL}</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
          {errors.name && <p className="text-accent text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="servingSize" className={labelClass}>{SERVING_SIZE_LABEL}</label>
          <input type="text" id="servingSize" name="servingSize" value={formData.servingSize} onChange={handleChange} className={inputClass} placeholder={SERVING_SIZE_PLACEHOLDER} />
          {errors.servingSize && <p className="text-accent text-xs mt-1">{errors.servingSize}</p>}
        </div>

        <p className="text-xs text-textMuted">{LABEL_PER_SERVING}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="calories" className={labelClass}>{CALORIES_LABEL}</label>
            <input type="number" id="calories" name="calories" value={formData.calories} onChange={handleChange} className={inputClass} step="any" min="0"/>
            {errors.calories && <p className="text-accent text-xs mt-1">{errors.calories}</p>}
          </div>

          <div>
            <label htmlFor="protein" className={labelClass}>{PROTEIN_LABEL}</label>
            <input type="number" id="protein" name="protein" value={formData.protein} onChange={handleChange} className={inputClass} step="any" min="0"/>
            {errors.protein && <p className="text-accent text-xs mt-1">{errors.protein}</p>}
          </div>

          <div>
            <label htmlFor="carbs" className={labelClass}>{CARBS_LABEL}</label>
            <input type="number" id="carbs" name="carbs" value={formData.carbs} onChange={handleChange} className={inputClass} step="any" min="0"/>
            {errors.carbs && <p className="text-accent text-xs mt-1">{errors.carbs}</p>}
          </div>

          <div>
            <label htmlFor="fat" className={labelClass}>{FAT_LABEL}</label>
            <input type="number" id="fat" name="fat" value={formData.fat} onChange={handleChange} className={inputClass} step="any" min="0"/>
            {errors.fat && <p className="text-accent text-xs mt-1">{errors.fat}</p>}
          </div>
        </div>


        <div className="flex space-x-3 rtl:space-x-reverse pt-4">
          <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 transform [@media(hover:hover)]:hover:scale-105">
            {isEditMode ? EDIT_FOOD_BUTTON : SUBMIT_NEW_FOOD_BUTTON}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow hover:shadow-md">
            {CANCEL_BUTTON}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFoodForm;
