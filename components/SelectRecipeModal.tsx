
import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, RecipeCategory } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { 
  SELECT_RECIPE_MODAL_TITLE, 
  CANCEL_BUTTON, 
  NO_RECIPES_AVAILABLE_TO_ASSIGN, 
  SEARCH_RECIPES_PLACEHOLDER, 
  NO_RECIPES_FOUND,
  getRecipeCategoryLabel,
  CREATE_NEW_RECIPE_BUTTON,
  MY_RECIPES_TAB,
  PUBLIC_RECIPES_TAB
} from '../constants';
import { Search, Soup, SearchX, Plus } from 'lucide-react';

interface SelectRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

const RecipeSelectItem: React.FC<{ recipe: Recipe; onClick: (recipe: Recipe) => void }> = ({ recipe, onClick }) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [recipe.imageUrl]);

    return (
        <button
            onClick={() => onClick(recipe)}
            className="w-full text-right p-3 my-1 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 bg-card/80 hover:bg-primary/20 shadow-md cursor-pointer transform [@media(hover:hover)]:hover:scale-[1.02] flex items-center gap-4"
            aria-label={`اختيار وصفة ${recipe.name}`}
        >
            {recipe.imageUrl && !imageError ? (
                <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-border/50 shadow-sm"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-16 h-16 bg-card rounded-md flex items-center justify-center flex-shrink-0 border border-border/50 shadow-inner">
                    <Soup className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
            )}
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-md font-semibold text-primary-light line-clamp-2">{recipe.name}</h3>
                    {recipe.category && recipe.category !== RecipeCategory.NONE && (
                        <span className="text-xs bg-accent/80 text-white px-2 py-0.5 rounded-full shadow-sm flex-shrink-0 whitespace-nowrap">
                            {getRecipeCategoryLabel(recipe.category)}
                        </span>
                    )}
                </div>
                <div className="text-xs text-textMuted mt-2 pt-2 border-t border-border/50">
                    <span className="font-semibold text-secondary">{(recipe.perServingMacros?.calories || 0).toFixed(0)}</span> سعرة | 
                    <span className="font-semibold text-textBase"> {(recipe.perServingMacros?.protein || 0).toFixed(1)}</span> بروتين
                    <span className="text-textMuted"> (للحصة)</span>
                </div>
            </div>
        </button>
    );
};

const SelectRecipeModal: React.FC<SelectRecipeModalProps> = ({ isOpen, onClose, recipes, onSelectRecipe }) => {
  const { setCurrentView, setEditingRecipe } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');

  const publicRecipes = useMemo(() => recipes.filter(r => !r.isCustom), [recipes]);
  const myRecipes = useMemo(() => recipes.filter(r => r.isCustom), [recipes]);

  const displayedRecipes = useMemo(() => {
    let sourceItems = activeTab === 'private' ? myRecipes : publicRecipes;

    // Apply search term filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      sourceItems = sourceItems.filter(recipe => 
        recipe.name.toLowerCase().includes(lowerSearchTerm) ||
        (recipe.description && recipe.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return sourceItems.sort((a,b) => a.name.localeCompare(b.name, 'ar'));
  }, [myRecipes, publicRecipes, searchTerm, activeTab]);


  if (!isOpen) return null;

  const handleRecipeClick = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose(); 
  };
  
  const handleGoToCreateRecipe = () => {
    onClose();
    setEditingRecipe(null);
    setCurrentView('recipeCreation');
  };

  const getEmptyState = () => {
    if (searchTerm) {
      return (
        <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <SearchX size={48} className="text-textMuted/70" />
            <p>{NO_RECIPES_FOUND}</p>
        </div>
      );
    }
    
    if (activeTab === 'private' && myRecipes.length === 0) {
      return (
        <div className="text-center text-textMuted p-8 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <Soup size={48} className="text-textMuted/70" />
            <p className="max-w-xs">{NO_RECIPES_AVAILABLE_TO_ASSIGN}</p>
            <button 
                onClick={handleGoToCreateRecipe}
                className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100"
            >
                <Plus size={18} />
                <span>{CREATE_NEW_RECIPE_BUTTON}</span>
            </button>
        </div>
      );
    }

     if (activeTab === 'public' && publicRecipes.length === 0) {
        return (
             <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
                <Soup size={48} className="text-textMuted/70" />
                <p>لا توجد وصفات عامة متاحة.</p>
            </div>
        );
     }

     return (
        <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <SearchX size={48} className="text-textMuted/70" />
            <p>{NO_RECIPES_FOUND}</p>
        </div>
     );
  }

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="select-recipe-title"
    >
      <div className="bg-card p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col ring-1 ring-primary/20">
        <h2 id="select-recipe-title" className="text-xl font-semibold text-primary-light mb-4 flex-shrink-0">{SELECT_RECIPE_MODAL_TITLE}</h2>
        
        <div className="flex-shrink-0 space-y-3">
          <div className="flex border-b border-border">
              <button type="button" onClick={() => setActiveTab('private')} className={`flex-1 px-3 py-2 text-sm font-semibold text-center transition-colors ${activeTab === 'private' ? 'bg-primary text-white' : 'text-textMuted hover:bg-primary/10'}`}>{MY_RECIPES_TAB}</button>
              <button type="button" onClick={() => setActiveTab('public')} className={`flex-1 px-3 py-2 text-sm font-semibold text-center transition-colors ${activeTab === 'public' ? 'bg-primary text-white' : 'text-textMuted hover:bg-primary/10'}`}>{PUBLIC_RECIPES_TAB}</button>
          </div>
          
          <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
              <input 
                type="text"
                placeholder={SEARCH_RECIPES_PLACEHOLDER}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-inputBg border border-border text-textBase rounded-lg py-3 ps-10 pe-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200"
                aria-label={SEARCH_RECIPES_PLACEHOLDER}
              />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto space-y-1 pr-1 mt-3">
          {displayedRecipes.length > 0 ? (
            displayedRecipes.map(recipe => (
              <RecipeSelectItem key={recipe.id} recipe={recipe} onClick={handleRecipeClick} />
            ))
          ) : (
            getEmptyState()
          )}
        </div>

        <div className="mt-6 flex justify-end flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 shadow"
          >
            {CANCEL_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRecipeModal;