
import React from 'react';
import { Recipe, RecipeCategory } from '../types';
import { 
  IMAGE_PREVIEW_ALT, 
  CALORIES_LABEL, 
  PROTEIN_LABEL, 
  CARBS_LABEL, 
  FAT_LABEL,
  PER_SERVING_MACROS_LABEL,
  getRecipeCategoryLabel,
  RECIPE_TAG_OPTIONS,
  EDIT_THIS_RECIPE_BUTTON,
  DELETE_THIS_RECIPE_BUTTON,
  CUSTOM_FOOD_BADGE
} from '../constants';
import { Soup, Copy, Pencil, Trash2 } from 'lucide-react';

interface RecipeListItemProps {
  recipe: Recipe;
  onSelectRecipe: (recipeId: string) => void;
  onEdit?: (recipeId: string) => void;
  onDelete?: (recipeId: string) => void;
  onCopy?: (recipe: Recipe) => void;
}

const RecipeListItem: React.FC<RecipeListItemProps> = ({ recipe, onSelectRecipe, onEdit, onDelete, onCopy }) => {
  const { name, description, imageUrl, perServingMacros, servings, category, tags, isCustom } = recipe;
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);


  const renderImage = () => {
    if (imageUrl && !imageError) {
      return (
        <img 
          src={imageUrl} 
          alt={`${IMAGE_PREVIEW_ALT} - ${name}`} 
          className="w-full sm:w-32 h-32 sm:h-auto object-cover rounded-lg flex-shrink-0 border border-border/50 shadow-md" 
          onError={handleImageError}
        />
      );
    }
    return (
      <div className="w-full sm:w-32 h-32 bg-card rounded-lg flex items-center justify-center flex-shrink-0 border border-border/50 shadow-inner recipe-image-placeholder">
        <Soup className="w-12 h-12 text-slate-500 dark:text-slate-500" />
      </div>
    );
  };
  
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation(); // Prevent triggering onSelectRecipe
      action();
  }

  return (
    <div 
      onClick={() => onSelectRecipe(recipe.id)}
      className="w-full text-right bg-card/90 p-3 sm:p-4 rounded-xl shadow-lg hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 mb-4 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start transform [@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:hover:shadow-primary/20 [@media(hover:hover)]:hover:-translate-y-1 cursor-pointer"
      aria-label={`عرض تفاصيل وصفة ${name}`}
    >
      {renderImage()}
      <div className="flex-grow w-full">
        <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-semibold text-primary-light text-right flex-grow">{name}</h3>
            <div className="flex-shrink-0 flex items-center gap-2">
                {isCustom && <span className="text-xs bg-accent/80 text-white px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">{CUSTOM_FOOD_BADGE}</span>}
                {category && category !== RecipeCategory.NONE && (
                    <span className="text-xs bg-primary/80 text-white px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                        {getRecipeCategoryLabel(category)}
                    </span>
                )}
            </div>
        </div>
        {description && <p className="text-xs sm:text-sm text-textMuted mb-2 line-clamp-2">{description}</p>}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => {
              const tagInfo = RECIPE_TAG_OPTIONS.find(t => t.value === tag);
              return (
                <span key={tag} className="text-xs bg-primary/20 text-primary-dark font-medium px-2 py-0.5 rounded-full">
                  {tagInfo?.label || tag}
                </span>
              )
            })}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs sm:text-sm font-medium text-textBase mb-2">{PER_SERVING_MACROS_LABEL} ({servings} حصص)</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-1 text-xs">
            <div>
              <span className="font-medium text-textMuted">{CALORIES_LABEL}: </span>
              <span className="font-semibold text-secondary">{(perServingMacros?.calories || 0).toFixed(0)}</span>
            </div>
            <div>
              <span className="font-medium text-textMuted">{PROTEIN_LABEL}: </span>
              <span className="font-semibold text-textBase">{(perServingMacros?.protein || 0).toFixed(1)}ج</span>
            </div>
            <div>
              <span className="font-medium text-textMuted">{CARBS_LABEL}: </span>
              <span className="font-semibold text-textBase">{(perServingMacros?.carbs || 0).toFixed(1)}ج</span>
            </div>
            <div>
              <span className="font-medium text-textMuted">{FAT_LABEL}: </span>
              <span className="font-semibold text-textBase">{(perServingMacros?.fat || 0).toFixed(1)}ج</span>
            </div>
          </div>
        </div>
        
         <div className="flex justify-end items-center gap-2 mt-3 pt-2 border-t border-border/50">
            {isCustom && onEdit && onDelete && (
                 <>
                    <button onClick={(e) => handleButtonClick(e, () => onEdit(recipe.id))} className="flex items-center gap-1.5 text-xs text-secondary-light hover:text-secondary bg-secondary/10 hover:bg-secondary/20 py-2 px-3 rounded-md transition-colors" title={EDIT_THIS_RECIPE_BUTTON}><Pencil size={12}/> تعديل</button>
                    <button onClick={(e) => handleButtonClick(e, () => onDelete(recipe.id))} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dark bg-accent/10 hover:bg-accent/20 py-2 px-3 rounded-md transition-colors" title={DELETE_THIS_RECIPE_BUTTON}><Trash2 size={12}/> حذف</button>
                 </>
            )}
            {!isCustom && onCopy && (
                 <button onClick={(e) => handleButtonClick(e, () => onCopy(recipe))} className="flex items-center gap-1.5 text-xs text-primary-light hover:text-primary bg-primary/10 hover:bg-primary/20 py-2 px-3 rounded-md transition-colors" title="نسخ إلى وصفاتي"><Copy size={12}/> نسخ وحفظ</button>
            )}
         </div>
      </div>
    </div>
  );
};

export default RecipeListItem;