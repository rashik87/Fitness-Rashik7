
import React, { useState } from 'react';
import { Recipe, RecipeCategory } from '../types';
import { useAppContext } from '../contexts/AppContext';
import {
  EDIT_THIS_RECIPE_BUTTON, DELETE_THIS_RECIPE_BUTTON, BACK_TO_RECIPES_BUTTON,
  CONFIRM_DELETE_RECIPE_MESSAGE, IMAGE_PREVIEW_ALT, NO_DESCRIPTION_AVAILABLE, INGREDIENTS_LABEL,
  TOTAL_RECIPE_MACROS_LABEL, PER_SERVING_MACROS_LABEL, CALORIES_UNIT, PROTEIN_UNIT, CARBS_UNIT, FAT_UNIT,
  CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL, getRecipeCategoryLabel, RECIPE_TAG_OPTIONS
} from '../constants';
import { Soup, Copy } from 'lucide-react';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onEdit: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
  onBack: () => void;
}

const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({ recipe, onEdit, onDelete, onBack }) => {
  const { handleCopyRecipe } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  React.useEffect(() => {
    setImageError(false);
  }, [recipe.imageUrl]);

  const handleDelete = () => {
    onDelete(recipe.id);
    setShowDeleteConfirm(false);
  };

  const handleCopyToMyRecipes = () => {
      handleCopyRecipe(recipe);
      onBack(); // Go back to the list after copying
  }

  const renderImage = () => {
    if (recipe.imageUrl && !imageError) {
      return (
        <img
          src={recipe.imageUrl}
          alt={`${IMAGE_PREVIEW_ALT} - ${recipe.name}`}
          className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-lg border border-border/50 mb-4"
          onError={handleImageError}
        />
      );
    }
    return (
      <div className="w-full h-48 sm:h-64 bg-card rounded-lg shadow-lg flex items-center justify-center border border-border/50 mb-4">
        <Soup className="w-16 h-16 text-slate-400 dark:text-slate-500" />
      </div>
    );
  };

  const buttonClass = "flex-1 font-semibold py-2.5 px-4 rounded-lg transition-transform duration-200 shadow-md hover:shadow-lg transform [@media(hover:hover)]:hover:scale-105 text-sm";


  return (
    <div className="w-full max-w-2xl space-y-6 bg-card/80 p-4 sm:p-6 rounded-xl shadow-2xl ring-1 ring-primary/20">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{recipe.name}</h2>
        <div className="mt-2 flex justify-center flex-wrap gap-2">
            {recipe.category && recipe.category !== RecipeCategory.NONE && (
                <span className="text-sm bg-accent/80 text-white px-3 py-1 rounded-full shadow-sm">
                    {getRecipeCategoryLabel(recipe.category)}
                </span>
            )}
             {recipe.tags && recipe.tags.map(tag => {
                const tagInfo = RECIPE_TAG_OPTIONS.find(t => t.value === tag);
                return (
                    <span key={tag} className="text-sm bg-primary/20 text-primary-dark font-medium px-3 py-1 rounded-full">
                    {tagInfo?.label || tag}
                    </span>
                )
             })}
        </div>
      </div>


      {renderImage()}
      
      {recipe.description ? (
        <p className="text-textBase text-sm sm:text-base leading-relaxed whitespace-pre-wrap p-4 bg-inputBg/50 rounded-lg">{recipe.description}</p>
      ) : (
        <p className="text-textMuted text-sm italic">{NO_DESCRIPTION_AVAILABLE}</p>
      )}

      <div className="space-y-3 p-3 sm:p-4 bg-card/70 rounded-lg shadow-inner">
        <h4 className="text-md font-semibold text-primary-light">{INGREDIENTS_LABEL} (لإجمالي الوصفة):</h4>
        <ul className="list-disc ps-5 space-y-1 text-sm text-textBase">
          {recipe.ingredients.map((ing, index) => (
            <li key={index}>
              {ing.foodItemName}: {ing.quantityGram.toFixed(1)} جرام
              <span className="text-xs text-textMuted"> ({ing.calories.toFixed(0)} سعرة، {ing.protein.toFixed(1)}ب، {ing.carbs.toFixed(1)}ك، {ing.fat.toFixed(1)}د)</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-3 p-3 sm:p-4 bg-card/70 rounded-lg shadow-inner">
        <div>
          <h4 className="text-md font-semibold text-primary-light">{TOTAL_RECIPE_MACROS_LABEL}</h4>
          <p className="text-sm text-textBase">
            {CALORIES_LABEL}: {(recipe.totalMacros?.calories || 0).toFixed(0)} {CALORIES_UNIT} &bull; {PROTEIN_LABEL}: {(recipe.totalMacros?.protein || 0).toFixed(1)} {PROTEIN_UNIT} &bull; {CARBS_LABEL}: {(recipe.totalMacros?.carbs || 0).toFixed(1)} {CARBS_UNIT} &bull; {FAT_LABEL}: {(recipe.totalMacros?.fat || 0).toFixed(1)} {FAT_UNIT}
          </p>
        </div>
        <div>
          <h4 className="text-md font-semibold text-primary-light">{PER_SERVING_MACROS_LABEL} (لـ {recipe.servings} حصص)</h4>
          <p className="text-sm text-textBase">
            {CALORIES_LABEL}: {(recipe.perServingMacros?.calories || 0).toFixed(0)} {CALORIES_UNIT} &bull; {PROTEIN_LABEL}: {(recipe.perServingMacros?.protein || 0).toFixed(1)} {PROTEIN_UNIT} &bull; {CARBS_LABEL}: {(recipe.perServingMacros?.carbs || 0).toFixed(1)} {CARBS_UNIT} &bull; {FAT_LABEL}: {(recipe.perServingMacros?.fat || 0).toFixed(1)} {FAT_UNIT}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse pt-4">
        <button onClick={onBack} className={`${buttonClass} bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase`}>
          {BACK_TO_RECIPES_BUTTON}
        </button>
        {recipe.isCustom ? (
            <>
                <button onClick={() => onEdit(recipe.id)} className={`${buttonClass} text-white bg-gradient-to-r from-secondary to-secondary-dark`}>
                {EDIT_THIS_RECIPE_BUTTON}
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className={`${buttonClass} text-white bg-gradient-to-r from-accent to-accent-dark`}>
                {DELETE_THIS_RECIPE_BUTTON}
                </button>
            </>
        ) : (
            <button onClick={handleCopyToMyRecipes} className={`${buttonClass} text-white bg-gradient-to-r from-secondary to-secondary-dark flex items-center justify-center gap-2`}>
                <Copy size={16}/>
                نسخ إلى وصفاتي
            </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter">
          <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-accent/50">
            <h4 className="text-lg font-semibold text-accent mb-3">تأكيد الحذف</h4>
            <p className="text-textBase text-sm mb-4">{CONFIRM_DELETE_RECIPE_MESSAGE}</p>
            <div className="flex space-x-3 rtl:sm:space-x-reverse">
              <button onClick={handleDelete} className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md">
                نعم، احذف
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailView;