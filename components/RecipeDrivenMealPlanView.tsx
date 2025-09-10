import React, { useMemo, useState, useEffect } from 'react';
import { FullMealPlan, Macros, UserData, DietProtocol, CarbCycleDayType, GoalSettings, SavedMealPlan, IntermittentFastingConfig, Recipe, RecipeCategory } from '../types';
import { calculateMacros } from '../services/calorieService';
import {
  RECIPE_DRIVEN_MEAL_PLAN_TITLE,
  CALCULATE_NEEDS_FIRST_PROMPT,
  MEAL_SLOT_SETUP_TITLE,
  ASSIGN_RECIPE_BUTTON, CHANGE_RECIPE_BUTTON,
  ADJUST_THIS_DAY_BUTTON,
  VIEW_ADJUSTED_PLAN_DETAILS_BUTTON,
  RECIPE_NOT_ASSIGNED,
  MEAL_PLAN_DAYS_LABEL,
  DEFAULT_NUMBER_OF_MEALS, MIN_DAYS, MAX_DAYS, MIN_MEALS, MAX_MEALS,
  DAY_LABEL_PREFIX,
  NUMBER_OF_MEALS_LABEL,
  SET_DAY_TYPE_LABEL,
  HIGH_CARB_DAY_LABEL, MEDIUM_CARB_DAY_LABEL, LOW_CARB_DAY_LABEL,
  TARGET_DAILY_NEEDS_LABEL,
  PLAN_TOTALS_TITLE,
  PLAN_DIFFERENCE_TITLE,
  CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL,
  SAVED_PLANS_TITLE,
  LOAD_PLAN_BUTTON,
  DELETE_PLAN_BUTTON,
  NO_SAVED_PLANS,
  CONFIRM_DELETE_PLAN_MESSAGE,
  CONFIRM_BUTTON,
  CANCEL_BUTTON,
  CHANGE_DIET_PROTOCOL_LABEL,
  DIET_PROTOCOL_OPTIONS,
  EATING_WINDOW_LABEL,
  KETO_CARB_LIMIT_GRAMS,
  KETO_CARB_WARNING_MESSAGE,
  IF_INSTRUCTIONAL_TEXT,
  VIEW_SAVED_PLAN_DETAILS_BUTTON,
  PREMIUM_FEATURE_LABEL,
  FREE_TIER_PLAN_GENERATION_LIMIT,
  GENERATE_AI_PLAN_BUTTON,
  GENERATING_AI_PLAN_MESSAGE,
  CREATE_NEW_RECIPE_BUTTON,
  SMART_PLAN_GUIDANCE_TITLE,
  SMART_PLAN_GUIDANCE_SUBTITLE,
  SMART_PLAN_REQ_TOTAL_RECIPES,
  SMART_PLAN_REQ_BREAKFAST,
  SMART_PLAN_REQ_LUNCH,
  SMART_PLAN_REQ_DINNER,
  ADD_FIRST_RECIPE_BUTTON,
  ADJUST_THIS_DAY_BUTTON_DESC,
  GENERATE_PLAN_BASIC_TEXT,
  GENERATE_PLAN_BASIC_DESC,
  GENERATE_PLAN_VARIED_TEXT,
  GENERATE_PLAN_VARIED_DESC,
  GENERATE_PLAN_AI_TEXT,
  GENERATE_PLAN_AI_DESC,
} from '../constants';
import { PlusCircle, Target, FolderClock, Trash2, Info, AlertTriangle, Eye, Lock, Sparkles, Loader2, Soup, UtensilsCrossed, CheckCircle, Circle } from 'lucide-react';
import { useMealPlan } from '../contexts/MealPlanContext';

interface RecipeDrivenMealPlanViewProps {
  userTargetMacros: Macros | null;
  userData: UserData | null;
  dietProtocol: DietProtocol;
  onDietProtocolChange: (protocol: DietProtocol) => void;
  finalTdee: number | null;
  goalSettings: GoalSettings | null;
  fullPlan: FullMealPlan | null;
  savedPlans: SavedMealPlan[];
  intermittentFastingConfig: IntermittentFastingConfig | null;
  onViewSavedPlanDetails: (planId: string) => void;
  onDeleteSavedPlan: (planId: string) => void;
  onPlanSetupChange: (numDays: number, numMeals: number) => void;
  onOpenSelectRecipeModal: (dayIndex: number, mealId: string) => void;
  onAdjustDayPlan: (dayIndex: number) => void;
  onUpdateRecipeServings: (dayIndex: number, mealId: string, newServings: number) => void;
  onSetDayType: (dayIndex: number, dayType: CarbCycleDayType) => void;
  onViewDetails: () => void;
  onResetCalculator: () => void;
  isPremium: boolean;
  planGenerationsToday: number;
  allRecipes: Recipe[];
  onNavigateToRecipeCreation: () => void;
}

const MacroDisplay: React.FC<{ macros?: Macros | null, title?: string, titleClass?: string }> = ({ macros, title, titleClass = "text-primary-light" }) => (
    <div className="p-3 bg-inputBg/50 rounded-lg shadow-inner">
      {title && <h4 className={`text-sm font-semibold mb-2 ${titleClass}`}>{title}</h4>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-xs">
        <p><strong className="text-textMuted">{CALORIES_LABEL}:</strong> <span className="font-semibold text-secondary">{(macros?.calories || 0).toFixed(0)}</span></p>
        <p><strong className="text-textMuted">{PROTEIN_LABEL}:</strong> <span className="font-semibold text-textBase">{(macros?.protein || 0).toFixed(1)}ج</span></p>
        <p><strong className="text-textMuted">{CARBS_LABEL}:</strong> <span className="font-semibold text-textBase">{(macros?.carbs || 0).toFixed(1)}ج</span></p>
        <p><strong className="text-textMuted">{FAT_LABEL}:</strong> <span className="font-semibold text-textBase">{(macros?.fat || 0).toFixed(1)}ج</span></p>
      </div>
    </div>
);

const PremiumLockWrapper: React.FC<{ isLocked: boolean, children: React.ReactNode, featureName: string }> = ({ isLocked, children, featureName }) => {
    if (!isLocked) {
        return <>{children}</>;
    }
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                 <span className="text-xs font-semibold text-accent bg-accent/20 px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
                    <Lock size={12}/>
                    {PREMIUM_FEATURE_LABEL}
                 </span>
            </div>
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
        </div>
    );
};

const RecipeDrivenMealPlanView: React.FC<RecipeDrivenMealPlanViewProps> = ({
  userTargetMacros,
  userData,
  dietProtocol,
  onDietProtocolChange,
  finalTdee,
  goalSettings,
  fullPlan,
  savedPlans,
  intermittentFastingConfig,
  onViewSavedPlanDetails,
  onDeleteSavedPlan,
  onPlanSetupChange,
  onOpenSelectRecipeModal,
  onAdjustDayPlan,
  onUpdateRecipeServings,
  onSetDayType,
  onViewDetails,
  onResetCalculator,
  isPremium,
  planGenerationsToday,
  allRecipes,
  onNavigateToRecipeCreation
}) => {
  const { handleGenerateFullPlan, generationStatus } = useMealPlan();
  const [numDays, setNumDays] = useState(fullPlan?.length || 1);
  const [numMeals, setNumMeals] = useState(fullPlan?.[0]?.meals.length || DEFAULT_NUMBER_OF_MEALS);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [planToDelete, setPlanToDelete] = useState<SavedMealPlan | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  const inputClass = `${"bg-inputBg border border-border text-textBase rounded-lg p-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-sm text-sm transition-colors disabled:opacity-70 disabled:bg-slate-500/10"}`;

  useEffect(() => {
    if (!fullPlan) {
      onPlanSetupChange(isPremium ? numDays : 1, numMeals);
    }
  }, []);

  useEffect(() => {
    if (fullPlan) {
        setNumDays(fullPlan.length);
        setNumMeals(fullPlan[0]?.meals.length || DEFAULT_NUMBER_OF_MEALS);
        if (activeDayIndex >= fullPlan.length) {
            setActiveDayIndex(0);
        }
    }
  }, [fullPlan]);
  
  const totalRecipes = allRecipes.length;
  const hasBreakfast = useMemo(() => allRecipes.some(r => r.category === RecipeCategory.BREAKFAST), [allRecipes]);
  const hasLunch = useMemo(() => allRecipes.some(r => r.category === RecipeCategory.LUNCH), [allRecipes]);
  const hasDinner = useMemo(() => allRecipes.some(r => r.category === RecipeCategory.DINNER), [allRecipes]);
  const canGeneratePlan = totalRecipes >= 3 && hasBreakfast && hasLunch && hasDinner;

  const getAIGenerationButtonConfig = (recipeCount: number) => {
    if (recipeCount >= 4 && recipeCount <= 9) {
        return { text: GENERATE_PLAN_VARIED_TEXT, description: GENERATE_PLAN_VARIED_DESC };
    }
    if (recipeCount >= 10) {
        return { text: GENERATE_PLAN_AI_TEXT(GENERATE_AI_PLAN_BUTTON), description: GENERATE_PLAN_AI_DESC };
    }
    return { text: GENERATE_PLAN_BASIC_TEXT, description: GENERATE_PLAN_BASIC_DESC };
  };
  const aiButtonConfig = getAIGenerationButtonConfig(allRecipes.length);


  const handleSetupChange = () => {
    const days = isPremium ? Math.max(MIN_DAYS, Math.min(MAX_DAYS, numDays)) : 1;
    const meals = Math.max(MIN_MEALS, Math.min(MAX_MEALS, numMeals));
    onPlanSetupChange(days, meals);
    if(activeDayIndex >= days) setActiveDayIndex(days - 1);
  };

  const handleAiGenerationClick = () => {
    handleGenerateFullPlan();
  };
  
  const handleAdjustDayWithLoading = (dayIndex: number) => {
    setIsAdjusting(true);
    setTimeout(() => {
        try {
            onAdjustDayPlan(dayIndex);
        } finally {
            setIsAdjusting(false);
        }
    }, 50);
  };
  
  const activeDayPlan = fullPlan ? fullPlan[activeDayIndex] : null;
  const currentDietProtocol = isPremium ? dietProtocol : DietProtocol.NONE;

  const getTargetMacrosForDay = (dayType: CarbCycleDayType | 'normal'): Macros | null => {
      if (!finalTdee || !goalSettings || !userData) return userTargetMacros; // Fallback to average
      if (dayType === 'normal' || currentDietProtocol !== DietProtocol.CARB_CYCLING) return userTargetMacros;
      return calculateMacros(finalTdee, currentDietProtocol, goalSettings.goal, userData, dayType);
  };

  const dayTargetMacros = activeDayPlan ? getTargetMacrosForDay(activeDayPlan.dayType) : null;

  const dayTotalMacros = useMemo((): Macros => {
    if (!activeDayPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return activeDayPlan.meals.reduce((totals, meal) => {
      if (meal.recipeSnapshot) {
        totals.calories += (meal.recipeSnapshot.perServingMacros?.calories || 0) * meal.quantityOfRecipeServings;
        totals.protein += (meal.recipeSnapshot.perServingMacros?.protein || 0) * meal.quantityOfRecipeServings;
        totals.carbs += (meal.recipeSnapshot.perServingMacros?.carbs || 0) * meal.quantityOfRecipeServings;
        totals.fat += (meal.recipeSnapshot.perServingMacros?.fat || 0) * meal.quantityOfRecipeServings;
      }
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [activeDayPlan]);
  
  const dayDifferenceMacros = useMemo((): Macros | null => {
    if (!dayTargetMacros) return null;
    return {
      calories: dayTotalMacros.calories - dayTargetMacros.calories,
      protein: dayTotalMacros.protein - dayTargetMacros.protein,
      carbs: dayTotalMacros.carbs - dayTargetMacros.carbs,
      fat: dayTotalMacros.fat - dayTargetMacros.fat,
    };
  }, [dayTotalMacros, dayTargetMacros]);

  const isKetoCarbLimitExceeded = currentDietProtocol === DietProtocol.KETO && dayTotalMacros.carbs > KETO_CARB_LIMIT_GRAMS;
  const canAdjustPlan = isPremium || planGenerationsToday < FREE_TIER_PLAN_GENERATION_LIMIT;
  
  if (!userTargetMacros) {
    return (
      <div className="w-full max-w-xl text-center p-6 bg-card/70 rounded-xl shadow-xl">
        <h2 className="text-xl md:text-2xl font-semibold text-primary-light mb-4">{RECIPE_DRIVEN_MEAL_PLAN_TITLE}</h2>
        <p className="text-textMuted mb-4">{CALCULATE_NEEDS_FIRST_PROMPT}</p>
        <button
          onClick={onResetCalculator}
          className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 transform hover:scale-105"
        >
          الذهاب إلى حاسبة السعرات
        </button>
      </div>
    );
  }

  if (!canGeneratePlan) {
    const ChecklistItem: React.FC<{isComplete: boolean, text: string}> = ({isComplete, text}) => (
        <div className={`flex items-center gap-3 transition-colors ${isComplete ? 'text-green-500' : 'text-textMuted'}`}>
            {isComplete ? <CheckCircle size={20}/> : <Circle size={20}/>}
            <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
    return (
        <div className="w-full max-w-xl text-center p-6 bg-card/70 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <Sparkles size={48} className="text-primary" />
            <h2 className="text-xl md:text-2xl font-semibold text-primary-light">{SMART_PLAN_GUIDANCE_TITLE}</h2>
            <p className="text-textMuted">{SMART_PLAN_GUIDANCE_SUBTITLE}</p>
            <div className="space-y-3 text-right w-full bg-card/50 p-4 rounded-lg shadow-inner text-sm">
                <ChecklistItem isComplete={totalRecipes >= 3} text={SMART_PLAN_REQ_TOTAL_RECIPES(totalRecipes)} />
                <ChecklistItem isComplete={hasBreakfast} text={SMART_PLAN_REQ_BREAKFAST} />
                <ChecklistItem isComplete={hasLunch} text={SMART_PLAN_REQ_LUNCH} />
                <ChecklistItem isComplete={hasDinner} text={SMART_PLAN_REQ_DINNER} />
            </div>
            <button
                onClick={onNavigateToRecipeCreation}
                className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-100"
            >
                <PlusCircle size={18} />
                <span>{totalRecipes > 0 ? CREATE_NEW_RECIPE_BUTTON : ADD_FIRST_RECIPE_BUTTON}</span>
            </button>
        </div>
    );
  }

  const secondaryButtonClass = "bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold py-2 px-3 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 transform hover:scale-105 text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed";
  
  return (
    <div className="w-full max-w-3xl space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{RECIPE_DRIVEN_MEAL_PLAN_TITLE}</h2>

       <PremiumLockWrapper isLocked={!isPremium} featureName="البروتوكولات الغذائية المتقدمة">
        <div className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
            <h3 className="text-lg font-semibold text-primary-light">{CHANGE_DIET_PROTOCOL_LABEL}</h3>
            <select
                value={currentDietProtocol}
                onChange={(e) => onDietProtocolChange(e.target.value as DietProtocol)}
                className={`${inputClass} w-full`}
                disabled={!isPremium}
            >
                {DIET_PROTOCOL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-card text-textBase">{opt.label}</option>
                ))}
            </select>
            {currentDietProtocol === DietProtocol.INTERMITTENT_FASTING && intermittentFastingConfig && (
                <p className="text-xs text-textMuted text-center">
                    {EATING_WINDOW_LABEL}: {intermittentFastingConfig.eatingWindowStart} - {intermittentFastingConfig.eatingWindowEnd}
                </p>
            )}
            {currentDietProtocol === DietProtocol.INTERMITTENT_FASTING && (
                <div className="flex items-start gap-2 p-2 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs rounded-lg border border-blue-500/20">
                    <Info size={16} className="flex-shrink-0 mt-0.5"/>
                    <span>{IF_INSTRUCTIONAL_TEXT}</span>
                </div>
            )}
        </div>
      </PremiumLockWrapper>

       <details className="p-4 bg-card/70 rounded-xl shadow-lg" open={savedPlans.length > 0}>
            <summary className="font-semibold text-primary-light text-lg cursor-pointer flex items-center gap-2">
                <FolderClock size={20} />
                {SAVED_PLANS_TITLE}
            </summary>
            {savedPlans.length > 0 ? (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-2">
                    {savedPlans.map(p => (
                        <div key={p.id} className="p-3 bg-card/90 rounded-lg shadow-sm flex justify-between items-center gap-2">
                            <div>
                                <p className="font-semibold text-textBase">{p.name}</p>
                                <p className="text-xs text-textMuted">
                                    {new Date(p.savedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onViewSavedPlanDetails(p.id)} className="p-2 bg-blue-500/80 text-white rounded-md hover:bg-blue-500 transition-colors" title={VIEW_SAVED_PLAN_DETAILS_BUTTON}>
                                    <Eye size={16}/>
                                </button>
                                 <button onClick={() => setPlanToDelete(p)} className="p-2 bg-accent/80 text-white rounded-md hover:bg-accent transition-colors" title={DELETE_PLAN_BUTTON}>
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="mt-3 text-center text-textMuted p-4 bg-card/90 rounded-lg shadow-inner flex flex-col items-center gap-2">
                    <FolderClock size={32} className="text-textMuted/70"/>
                    <p>{NO_SAVED_PLANS}</p>
                </div>
            )}
         </details>
       
       <div className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
          <h3 className="text-lg font-semibold text-primary-light text-center">إنشاء خطة جديدة</h3>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
             <PremiumLockWrapper isLocked={!isPremium} featureName="خطط متعددة الأيام">
                <div className="flex items-center gap-2">
                    <label htmlFor="numberOfDays" className="text-sm font-medium text-textBase">{MEAL_PLAN_DAYS_LABEL}:</label>
                    <input type="number" id="numberOfDays" value={isPremium ? numDays : 1} onChange={e => setNumDays(parseInt(e.target.value, 10))} min={MIN_DAYS} max={MAX_DAYS} className={`${inputClass} w-16 text-center`} disabled={!isPremium}/>
                </div>
            </PremiumLockWrapper>
            <div className="flex items-center gap-2">
                <label htmlFor="numberOfMeals" className="text-sm font-medium text-textBase">{NUMBER_OF_MEALS_LABEL}:</label>
                <input type="number" id="numberOfMeals" value={numMeals} onChange={e => setNumMeals(parseInt(e.target.value, 10))} min={MIN_MEALS} max={MAX_MEALS} className={`${inputClass} w-16 text-center`} />
            </div>
          </div>
           <button onClick={handleSetupChange} className="w-full bg-primary/80 hover:bg-primary text-white font-semibold py-2 rounded-lg transition-colors text-sm">تطبيق الإعدادات أو البدء من جديد</button>
       </div>
      
      {fullPlan && (
        <>
        <div className="flex flex-wrap justify-center gap-2">
            {fullPlan.map((day, index) => (
                <button key={index} onClick={() => setActiveDayIndex(index)} className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${activeDayIndex === index ? 'bg-primary text-white border-primary shadow-md' : 'bg-card/50 border-border text-textMuted hover:bg-primary/20 hover:border-primary/50'}`}>
                    {DAY_LABEL_PREFIX} {index + 1}
                </button>
            ))}
        </div>

        {activeDayPlan && dayTargetMacros && (
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm p-2 rounded-b-lg shadow-md -mt-1 mb-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-x-4">
                    <div className="text-center">
                        <p className="text-xs font-semibold text-textMuted">{PLAN_TOTALS_TITLE}</p>
                        <p className="text-sm font-bold text-secondary">{dayTotalMacros.calories.toFixed(0)} <span className="text-xs font-normal">سعرة</span></p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold text-textMuted">{PLAN_DIFFERENCE_TITLE}</p>
                        <p className={`text-sm font-bold ${dayDifferenceMacros && dayDifferenceMacros.calories > 0 ? 'text-accent' : 'text-green-500'}`}>
                            {dayDifferenceMacros?.calories.toFixed(0)} <span className="text-xs font-normal">سعرة</span>
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="p-4 bg-card/80 rounded-xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-primary">{DAY_LABEL_PREFIX} {activeDayIndex + 1}</h3>
            </div>

            {dayTargetMacros && <MacroDisplay macros={dayTargetMacros} title={TARGET_DAILY_NEEDS_LABEL} />}
            
            <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="text-lg font-semibold text-primary-light">{MEAL_SLOT_SETUP_TITLE}</h4>
                {activeDayPlan?.meals.map((mealSlot) => (
                <div key={mealSlot.id} className="p-3 bg-card/50 rounded-lg shadow-md border-s-4 border-secondary/50">
                    <div className="flex justify-between items-center mb-2">
                    <h5 className="text-md font-semibold text-textBase">{mealSlot.slotName}</h5>
                    <button onClick={() => onOpenSelectRecipeModal(activeDayIndex, mealSlot.id)} className={secondaryButtonClass}>
                        {mealSlot.assignedRecipeId ? CHANGE_RECIPE_BUTTON : ASSIGN_RECIPE_BUTTON}
                    </button>
                    </div>
                    {mealSlot.recipeSnapshot ? (
                    <div className="space-y-2">
                        <p className="text-sm">الوصفة: <span className="text-secondary-light font-medium">{mealSlot.recipeSnapshot.name}</span></p>
                        <div className="flex items-center gap-2">
                        <label htmlFor={`servings-${mealSlot.id}`} className="text-xs text-textMuted">الكمية (حصص):</label>
                        <input type="number" id={`servings-${mealSlot.id}`} value={mealSlot.quantityOfRecipeServings.toFixed(2)} onChange={(e) => onUpdateRecipeServings(activeDayIndex, mealSlot.id, parseFloat(e.target.value))} className={`${inputClass} w-20 text-center text-xs`} step="0.1" min="0.01"/>
                        </div>
                    </div>
                    ) : (
                    <div className="text-center py-2 border border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-textMuted text-sm">
                        <PlusCircle size={16}/> {RECIPE_NOT_ASSIGNED}
                    </div>
                    )}
                </div>
                ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
                <MacroDisplay macros={dayTotalMacros} title={PLAN_TOTALS_TITLE} />
                 {isKetoCarbLimitExceeded && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 text-red-800 dark:text-red-300 text-xs rounded-lg border border-red-500/20">
                        <AlertTriangle size={16} className="flex-shrink-0"/>
                        <span>{KETO_CARB_WARNING_MESSAGE(KETO_CARB_LIMIT_GRAMS)}</span>
                    </div>
                )}
                {dayDifferenceMacros && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-accent">{PLAN_DIFFERENCE_TITLE}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-xs">
                            <p><strong className="text-textMuted">{CALORIES_LABEL}:</strong> <span className={dayDifferenceMacros.calories > 0 ? 'text-green-400' : 'text-red-400'}>{dayDifferenceMacros.calories.toFixed(0)}</span></p>
                            <p><strong className="text-textMuted">{PROTEIN_LABEL}:</strong> <span className={dayDifferenceMacros.protein > 0 ? 'text-green-400' : 'text-red-400'}>{dayDifferenceMacros.protein.toFixed(1)}ج</span></p>
                            <p><strong className="text-textMuted">{CARBS_LABEL}:</strong> <span className={dayDifferenceMacros.carbs > 0 ? 'text-green-400' : 'text-red-400'}>{dayDifferenceMacros.carbs.toFixed(1)}ج</span></p>
                            <p><strong className="text-textMuted">{FAT_LABEL}:</strong> <span className={dayDifferenceMacros.fat > 0 ? 'text-green-400' : 'text-red-400'}>{dayDifferenceMacros.fat.toFixed(1)}ج</span></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4 space-y-3">
                 <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex flex-col items-center">
                        <button onClick={handleAiGenerationClick} className="w-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={generationStatus.isLoading || !canAdjustPlan}>
                            {generationStatus.isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            {generationStatus.isLoading ? GENERATING_AI_PLAN_MESSAGE : aiButtonConfig.text}
                        </button>
                        <p className="text-center text-xs text-textMuted mt-1.5 px-2 h-8">{aiButtonConfig.description}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <button onClick={() => handleAdjustDayWithLoading(activeDayIndex)} className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!activeDayPlan?.meals.every(m => m.assignedRecipeId) || !canAdjustPlan || isAdjusting}>
                            {isAdjusting ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />} {ADJUST_THIS_DAY_BUTTON}
                        </button>
                         <p className="text-center text-xs text-textMuted mt-1.5 px-2 h-8">{ADJUST_THIS_DAY_BUTTON_DESC}</p>
                    </div>
                </div>
                 <button onClick={onViewDetails} className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={!fullPlan?.some(d => d.meals.some(m => m.assignedRecipeId))}>
                    {VIEW_ADJUSTED_PLAN_DETAILS_BUTTON}
                </button>
            </div>
             {!isPremium && <p className="text-center text-xs text-textMuted">التعديلات المتبقية اليوم: {FREE_TIER_PLAN_GENERATION_LIMIT - planGenerationsToday}/{FREE_TIER_PLAN_GENERATION_LIMIT}</p>}
        </div>
        </>
      )}

      {planToDelete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter">
              <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-accent/50">
                  <h4 className="text-lg font-semibold text-accent mb-3">{`حذف خطة "${planToDelete.name}"`}</h4>
                  <p className="text-textBase text-sm mb-4">{CONFIRM_DELETE_PLAN_MESSAGE}</p>
                  <div className="flex space-x-3 rtl:space-x-reverse">
                      <button onClick={() => { onDeleteSavedPlan(planToDelete.id); setPlanToDelete(null); }} className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md">
                          {CONFIRM_BUTTON}
                      </button>
                      <button onClick={() => setPlanToDelete(null)} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md">
                          {CANCEL_BUTTON}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RecipeDrivenMealPlanView;