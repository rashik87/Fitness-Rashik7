
import React, { useState, useMemo } from 'react';
import { Recipe, RecipeCategory, RecipeTag, ProcessedAiRecipe } from '../types';
import RecipeListItem from './RecipeListItem';
import AiRecipeGeneratorModal from './AiRecipeGeneratorModal';
import { useAppContext } from '../contexts/AppContext';
import { 
  RECIPE_LIST_TITLE, 
  CREATE_NEW_RECIPE_BUTTON, 
  NO_RECIPES_YET, 
  NO_RECIPES_FOUND,
  SEARCH_RECIPES_PLACEHOLDER,
  RECIPE_CATEGORY_OPTIONS,
  RECIPE_TAG_OPTIONS,
  FREE_TIER_RECIPE_LIMIT,
  LIMIT_REACHED_ERROR,
  AI_RECIPE_GENERATOR_NAV_LINK,
  PREMIUM_ONLY_FEATURE_ERROR,
  PUBLIC_RECIPES_TAB,
  MY_RECIPES_TAB
} from '../constants';
import { Plus, Search, Lock, Soup, SearchX, Sparkles } from 'lucide-react';

const RecipeListView: React.FC = () => {
  const { 
    allRecipes,
    setCurrentView,
    setEditingRecipe,
    setSelectedRecipeForDetailView,
    isPremium,
    showTemporaryNotification,
    handleCopyRecipe,
    handleDeleteRecipe,
    handleEditRecipeFromDetail
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<RecipeCategory | 'all'>('all');
  const [activeTagFilter, setActiveTagFilter] = useState<RecipeTag | 'all'>('all');
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('private');

  const publicRecipes = useMemo(() => allRecipes.filter(r => !r.isCustom), [allRecipes]);
  const myRecipes = useMemo(() => allRecipes.filter(r => r.isCustom), [allRecipes]);
  const customRecipeCount = myRecipes.length;
  const isLimitReached = !isPremium && customRecipeCount >= FREE_TIER_RECIPE_LIMIT;


  const handleNavigateToCreateRecipe = () => {
    if (isLimitReached) {
      showTemporaryNotification('error', LIMIT_REACHED_ERROR("الوصفات"));
    } else {
      setEditingRecipe(null);
      setCurrentView('recipeCreation');
    }
  };

  const handleOpenAiGenerator = () => {
    if (!isPremium) {
        showTemporaryNotification('error', PREMIUM_ONLY_FEATURE_ERROR(AI_RECIPE_GENERATOR_NAV_LINK));
        return;
    }
    setIsGeneratorModalOpen(true);
  };

  const handleSelectRecipe = (recipeId: string) => {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (recipe) {
      setSelectedRecipeForDetailView(recipe);
      setEditingRecipe(null); 
      setCurrentView('recipeDetail');
    }
  };
  
  const handleRecipeGenerated = (processedRecipe: ProcessedAiRecipe) => {
      if (isLimitReached) {
        showTemporaryNotification('error', LIMIT_REACHED_ERROR("الوصفات"));
        setIsGeneratorModalOpen(false);
        return;
      }
      const combinedDescription = `${processedRecipe.description}\n\n---\n\nطريقة التحضير:\n${processedRecipe.instructions}`;
      const originalServings = processedRecipe.servings > 0 ? processedRecipe.servings : 1;
      const singleServingMacros = processedRecipe.perServingMacros;
      const scaledIngredients = processedRecipe.matchedIngredients.map(ing => ({
          ...ing,
          quantityGram: ing.quantityGram / originalServings,
          calories: ing.calories / originalServings,
          protein: ing.protein / originalServings,
          carbs: ing.carbs / originalServings,
          fat: ing.fat / originalServings,
      }));

      const partialRecipeForEdit: Partial<Recipe> = {
          name: processedRecipe.recipeName,
          description: combinedDescription,
          category: processedRecipe.category,
          servings: 1,
          tags: [],
          imageUrl: '',
          ingredients: scaledIngredients,
          totalMacros: singleServingMacros,
          perServingMacros: singleServingMacros,
      };
      setEditingRecipe(partialRecipeForEdit as Recipe);

      if (processedRecipe.unmatchedIngredientNames.length > 0) {
        const unmatchedText = processedRecipe.unmatchedIngredientNames.join(', ');
        showTemporaryNotification('error', `لم يتم العثور على: ${unmatchedText}. الماكروز المحسوبة غير كاملة. يرجى إضافة هذه الأطعمة ومراجعة الوصفة.`, 10000);
      } else {
        showTemporaryNotification('success', 'تم توليد الوصفة وتعديلها لحصة واحدة! راجعها واحفظها.');
      }
      
      setCurrentView('recipeCreation');
      setIsGeneratorModalOpen(false);
  };

  const displayedRecipes = useMemo(() => {
    let sourceItems = activeTab === 'public' ? publicRecipes : myRecipes;
    
    if (activeCategoryFilter !== 'all') {
      sourceItems = sourceItems.filter(recipe => recipe.category === activeCategoryFilter);
    }
    
    if (activeTagFilter !== 'all') {
        sourceItems = sourceItems.filter(recipe => recipe.tags?.includes(activeTagFilter));
    }

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      sourceItems = sourceItems.filter(recipe => 
        recipe.name.toLowerCase().includes(lowerSearchTerm) ||
        (recipe.description && recipe.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    return sourceItems.sort((a,b) => a.name.localeCompare(b.name, 'ar'));
  }, [publicRecipes, myRecipes, searchTerm, activeCategoryFilter, activeTagFilter, activeTab]);
  
  const filterButtonClass = (isActive: boolean) => 
    `px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 border ${
      isActive
      ? 'bg-primary text-white border-primary shadow-md'
      : 'bg-card/50 border-border hover:bg-primary/20 hover:border-primary/50 text-textMuted'
    }`;

  const tabButtonClass = (isActive: boolean) => 
    `flex-1 py-2.5 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 ${
      isActive
      ? 'bg-primary text-white shadow'
      : 'bg-card/50 hover:bg-primary/20 text-textMuted'
    }`;


  const getEmptyState = () => {
    if (searchTerm) {
        return (
            <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <SearchX size={48} className="text-textMuted/70" />
            <p>{NO_RECIPES_FOUND}</p>
            </div>
        );
    }
    if (activeTab === 'public') {
        return (
            <div className="text-center text-textMuted p-6 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
                <Soup size={48} className="text-textMuted/70" />
                <p>لا توجد وصفات عامة متاحة حاليًا.</p>
            </div>
        );
    }
    // activeTab is 'private'
    return (
        <div className="text-center text-textMuted p-8 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <Soup size={48} className="text-textMuted/70" />
            <p>{NO_RECIPES_YET}</p>
            <button 
                onClick={handleNavigateToCreateRecipe}
                disabled={isLimitReached}
                className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
                aria-disabled={isLimitReached}
            >
                {isLimitReached ? <Lock size={16} /> : <Plus size={18} />}
                <span>{CREATE_NEW_RECIPE_BUTTON}</span>
            </button>
        </div>
    );
  };

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-primary-light">{RECIPE_LIST_TITLE}</h2>
        <div className="w-full flex flex-col sm:flex-row sm:w-auto gap-3">
          <button 
            onClick={handleOpenAiGenerator}
            className="bg-gradient-to-r from-accent to-accent-dark text-white font-semibold py-3 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-accent/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Sparkles size={18} />
            <span>{AI_RECIPE_GENERATOR_NAV_LINK}</span>
            {!isPremium && <Lock size={16} className="ms-1" />}
          </button>
          <button 
            onClick={handleNavigateToCreateRecipe}
            disabled={isLimitReached}
            className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
            aria-disabled={isLimitReached}
          >
            {isLimitReached ? <Lock size={18} /> : <Plus size={20} />}
            <span>{CREATE_NEW_RECIPE_BUTTON}</span>
          </button>
        </div>
      </div>

      <div className="flex border-b border-border">
          <button onClick={() => setActiveTab('private')} className={tabButtonClass(activeTab === 'private')}>
            {MY_RECIPES_TAB} ({customRecipeCount} / {isPremium ? '∞' : FREE_TIER_RECIPE_LIMIT})
          </button>
          <button onClick={() => setActiveTab('public')} className={tabButtonClass(activeTab === 'public')}>
            {PUBLIC_RECIPES_TAB} ({publicRecipes.length})
          </button>
      </div>

      <div className="space-y-3 p-3 bg-card/50 rounded-lg shadow-inner">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
            <input 
              type="text"
              placeholder={SEARCH_RECIPES_PLACEHOLDER}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-inputBg border border-border text-textBase rounded-lg py-3 ps-10 pe-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <button onClick={() => setActiveCategoryFilter('all')} className={filterButtonClass(activeCategoryFilter === 'all')}>الكل</button>
            {RECIPE_CATEGORY_OPTIONS.filter(opt => opt.value !== RecipeCategory.NONE).map(opt => (
              <button key={opt.value} onClick={() => setActiveCategoryFilter(opt.value)} className={filterButtonClass(activeCategoryFilter === opt.value)}>{opt.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <button onClick={() => setActiveTagFilter('all')} className={filterButtonClass(activeTagFilter === 'all')}>الكل (وسم)</button>
            {RECIPE_TAG_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setActiveTagFilter(opt.value)} className={filterButtonClass(activeTagFilter === opt.value)}>{opt.label}</button>
            ))}
          </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
        {displayedRecipes.length > 0 ? (
          displayedRecipes.map(recipe => (
            <RecipeListItem 
              key={recipe.id} 
              recipe={recipe}
              onSelectRecipe={handleSelectRecipe}
              onEdit={recipe.isCustom ? handleEditRecipeFromDetail : undefined}
              onDelete={recipe.isCustom ? handleDeleteRecipe : undefined}
              onCopy={!recipe.isCustom ? handleCopyRecipe : undefined}
            />
          ))
        ) : (
          getEmptyState()
        )}
      </div>

      {isGeneratorModalOpen && (
          <AiRecipeGeneratorModal 
            onClose={() => setIsGeneratorModalOpen(false)}
            onRecipeGenerated={handleRecipeGenerated}
          />
      )}
      
    </div>
  );
};

export default RecipeListView;
