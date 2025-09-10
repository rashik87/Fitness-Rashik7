
import React from 'react';
import { FoodItem } from '../types';
import { CUSTOM_FOOD_BADGE, CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL, SERVING_SIZE_LABEL, EDIT_FOOD_BUTTON, DELETE_FOOD_BUTTON, COPY_TO_MY_FOODS_BUTTON } from '../constants';
import { Pencil, Trash2, Copy } from 'lucide-react';

interface FoodListItemProps {
  item: FoodItem;
  onEdit?: (food: FoodItem) => void;
  onDelete?: (food: FoodItem) => void;
  onCopy?: (food: FoodItem) => void;
}

const FoodListItem: React.FC<FoodListItemProps> = ({ item, onEdit, onDelete, onCopy }) => {
  const showControls = onEdit && onDelete && item.isCustom;
  const showCopy = onCopy && !item.isCustom;

  return (
    <div className="bg-card/90 p-3 sm:p-4 rounded-lg shadow-lg border-s-4 border-primary/50 mb-3 transition-all duration-300 [@media(hover:hover)]:hover:shadow-primary/20 [@media(hover:hover)]:hover:border-secondary-light [@media(hover:hover)]:hover:scale-[1.03] transform [@media(hover:hover)]:hover:-translate-y-1">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md sm:text-lg font-semibold text-primary-light flex-grow">{item.name}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.isCustom && !showControls && (
            <span className="text-xs bg-accent/80 text-white px-2 py-0.5 rounded-full shadow-sm">{CUSTOM_FOOD_BADGE}</span>
          )}
          {showControls && (
             <div className="flex items-center gap-3">
                <button 
                    onClick={() => onEdit(item)} 
                    className="text-secondary-light hover:text-secondary p-3 rounded-full transition-colors duration-200 bg-card hover:bg-inputBg/50" 
                    aria-label={`${EDIT_FOOD_BUTTON} ${item.name}`}
                    title={EDIT_FOOD_BUTTON}
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => onDelete(item)} 
                    className="text-accent hover:text-accent-dark p-3 rounded-full transition-colors duration-200 bg-card hover:bg-inputBg/50"
                    aria-label={`${DELETE_FOOD_BUTTON} ${item.name}`}
                    title={DELETE_FOOD_BUTTON}
                >
                    <Trash2 size={16} />
                </button>
             </div>
          )}
          {showCopy && (
            <button 
              onClick={() => onCopy(item)}
              className="text-xs flex items-center gap-1.5 text-primary-light hover:text-white bg-primary/20 hover:bg-primary/40 py-1 px-2.5 rounded-md transition-colors duration-200"
              aria-label={`${COPY_TO_MY_FOODS_BUTTON} - ${item.name}`}
              title={COPY_TO_MY_FOODS_BUTTON}
            >
              <Copy size={14}/>
              <span>نسخ</span>
            </button>
          )}
        </div>
      </div>
      <p className="text-xs sm:text-sm text-textMuted mb-3">{SERVING_SIZE_LABEL}: {item.servingSize}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-xs sm:text-sm border-t border-border/50 pt-2">
        <div>
          <span className="font-medium text-textMuted">{CALORIES_LABEL}: </span>
          <span className="font-semibold text-secondary">{item.calories.toFixed(0)}</span>
        </div>
        <div>
          <span className="font-medium text-textMuted">{PROTEIN_LABEL}: </span>
          <span className="font-semibold text-textBase">{item.protein.toFixed(1)}ج</span>
        </div>
        <div>
          <span className="font-medium text-textMuted">{CARBS_LABEL}: </span>
          <span className="font-semibold text-textBase">{item.carbs.toFixed(1)}ج</span>
        </div>
        <div>
          <span className="font-medium text-textMuted">{FAT_LABEL}: </span>
          <span className="font-semibold text-textBase">{item.fat.toFixed(1)}ج</span>
        </div>
      </div>
    </div>
  );
};

export default FoodListItem;