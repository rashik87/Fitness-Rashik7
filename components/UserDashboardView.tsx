import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  Flame, Beef, Wheat, Droplets, TrendingUp, PlusCircle, Weight, Scale, Database, Soup, ClipboardList, Zap, ChevronLeft, Gem, CheckCircle, Camera, Lightbulb, X
} from 'lucide-react';
import {
  USER_DASHBOARD_TITLE, WELCOME_MESSAGE_PREFIX, DAILY_NEEDS_TITLE_DASHBOARD, RECALCULATE_NEEDS_BUTTON,
  CALCULATE_NEEDS_PROMPT_DASHBOARD, START_CALCULATION_BUTTON, PROGRESS_SUMMARY_TITLE, LATEST_ENTRY_LABEL,
  VIEW_ALL_PROGRESS_BUTTON, NO_PROGRESS_LOGGED_DASHBOARD, LOG_FIRST_PROGRESS_BUTTON,
  MY_DATA_TITLE, MY_FOODS_LINK_PREFIX, MY_RECIPES_LINK_PREFIX, ITEM_UNIT_PLURAL,
  RECIPE_UNIT_PLURAL, CALORIES_UNIT, PROTEIN_UNIT, CARBS_UNIT, FAT_UNIT, WEIGHT_KG_LABEL, FOOD_DATABASE_NAVIGATION_LINK, RECIPES_NAVIGATION_LINK, RECIPE_DRIVEN_MEAL_PLAN_NAVIGATION_LINK,
  BURNED_CALORIES_CALCULATOR_NAV_LINK, UPGRADE_TO_PREMIUM_TITLE, UPGRADE_NOW_BUTTON, UNLOCK_ALL_FEATURES_TITLE, UNLOCK_ALL_FEATURES_LIST,
  ANALYZE_MEAL_FROM_PHOTO_NAV_LINK, PREMIUM_ONLY_FEATURE_ERROR, GET_PLATEAU_ADVICE_BUTTON, NOT_ENOUGH_DATA_FOR_ADVICE
} from '../constants';
import ProgressChart from './progress/ProgressChart';
import { getPlateauAdviceWithAi } from '../services/aiService';
import PlateauAdviceModal from './PlateauAdviceModal';

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    unit: string;
    colorClass: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, unit, colorClass }) => (
    <div className={`bg-card/70 p-3 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 [@media(hover:hover)]:hover:bg-card/90 [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:-translate-y-1 border-b-4 ${colorClass}`}>
        <div className="text-3xl">
            {icon}
        </div>
        <div>
            <p className="font-bold text-lg text-textBase">{value}</p>
            <p className="text-xs text-textMuted">{title} ({unit})</p>
        </div>
    </div>
);

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
    isPremiumFeature?: boolean;
    isPremiumUser?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, subtitle, onClick, isPremiumFeature = false, isPremiumUser = false }) => (
    <button 
        onClick={onClick} 
        className="w-full text-right bg-card/70 p-4 rounded-xl shadow-md flex justify-between items-center transition-all duration-300 [@media(hover:hover)]:hover:bg-card/90 [@media(hover:hover)]:hover:shadow-lg [@media(hover:hover)]:hover:border-primary/50 border-2 border-transparent [@media(hover:hover)]:hover:-translate-y-1 group relative"
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary-light">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-md text-textBase">{title}</p>
                <p className="text-xs text-textMuted">{subtitle}</p>
            </div>
        </div>
        <div className="flex items-center">
            {isPremiumFeature && !isPremiumUser && <Gem size={14} className="text-yellow-500 mr-2" />}
            <ChevronLeft className="text-textMuted transition-transform duration-300 group-hover:text-primary-light group-hover:-translate-x-1" size={20}/>
        </div>
    </button>
);

const UserDashboardView: React.FC = () => {
  const {
    currentUser,
    userTargetMacros,
    progressEntries,
    allFoodItems,
    allRecipes,
    setCurrentView,
    theme,
    isPremium,
    showTemporaryNotification,
    userData,
    selectedDiet,
    initialTdee
  } = useAppContext();
  
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  useEffect(() => {
    if (currentUser) {
        const bannerDismissedKey = `fitness_rashik_welcome_banner_dismissed_${currentUser.id}`;
        const bannerDismissed = localStorage.getItem(bannerDismissedKey);
        if (!bannerDismissed) {
            setShowWelcomeBanner(true);
        }
    }
  }, [currentUser]);

  const handleDismissWelcomeBanner = () => {
    if (currentUser) {
        const bannerDismissedKey = `fitness_rashik_welcome_banner_dismissed_${currentUser.id}`;
        localStorage.setItem(bannerDismissedKey, 'true');
        setShowWelcomeBanner(false);
    }
  };

  const plateauState = useMemo(() => {
    if (progressEntries.length === 0) {
        return { visible: false, enabled: false, reason: '' };
    }

    if (!isPremium) {
        return { 
            visible: true, 
            enabled: false, 
            reason: 'ميزة بريميوم: تتطلب اشتراكًا لتفعيلها.' 
        };
    }
    
    if (progressEntries.length < 4) {
        return { 
            visible: true, 
            enabled: false, 
            reason: `تحتاج إلى تسجيل ${4 - progressEntries.length} قراءات إضافية للوزن لتحليل ثبات الوزن.`
        };
    }

    const recentEntries = progressEntries.slice(0, 4);
    const latestWeight = recentEntries[0].weight;
    const olderWeight = recentEntries[3].weight;
    const isPlateau = Math.abs(latestWeight - olderWeight) < 0.5;

    if (!isPlateau) {
        return {
            visible: true,
            enabled: false,
            reason: 'استمر! وزنك يتغير بشكل جيد. تظهر هذه الميزة عند استقرار الوزن.'
        };
    }

    return { visible: true, enabled: true, reason: '' };
  }, [progressEntries, isPremium]);


  const handleGetAdvice = () => {
    if (!userData || !userTargetMacros || progressEntries.length < 2) {
        showTemporaryNotification('error', NOT_ENOUGH_DATA_FOR_ADVICE);
        return Promise.reject(NOT_ENOUGH_DATA_FOR_ADVICE);
    }
    return getPlateauAdviceWithAi(progressEntries, userData, userTargetMacros, selectedDiet, initialTdee);
  };


  if (!currentUser) {
      // This should ideally not happen as the router/view logic protects it, but it's a good safeguard.
      return null; 
  }

  const customFoodItemCount = allFoodItems.filter(f => f.isCustom).length;
  const recipeCount = allRecipes.length;
  
  const getItemsUnit = (count: number) => count === 1 ? "عنصر" : (count >= 2 && count <= 10 ? "عناصر" : "عنصرًا");
  const getRecipeUnit = (count: number) => count === 1 ? "وصفة" : (count >= 2 && count <= 10 ? "وصفات" : "وصفة");

  const primaryButtonClass = "bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 text-sm transform [@media(hover:hover)]:hover:scale-105 active:scale-100 flex items-center justify-center gap-2";
  const linkButtonClass = "text-sm font-medium text-primary-light hover:text-primary transition-colors hover:underline";
  const latestProgressEntry = progressEntries.length > 0 ? progressEntries[0] : null;

  return (
    <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-light">{USER_DASHBOARD_TITLE}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-textMuted">{WELCOME_MESSAGE_PREFIX}{currentUser.email}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPremium ? 'bg-yellow-400/30 text-yellow-600 dark:text-yellow-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {isPremium ? 'بريميوم' : 'مجاني'}
            </span>
        </div>
      </div>
      
      {showWelcomeBanner && (
        <div className="bg-primary/10 border-s-4 border-primary text-primary-dark p-4 rounded-lg shadow-md flex items-start gap-4 animate-fadeIn relative dark:text-primary-light dark:bg-primary/20">
            <Lightbulb className="h-6 w-6 flex-shrink-0 mt-1" />
            <div className="flex-grow">
                <h4 className="font-bold">مرحباً بك في رشيق!</h4>
                <p className="text-sm mt-1">
                    نقطة البداية المثالية هي حساب احتياجاتك اليومية. انقر على الزر أدناه للانتقال إلى الحاسبة.
                </p>
                <button
                    onClick={() => {
                        setCurrentView('userInput');
                        handleDismissWelcomeBanner();
                    }}
                    className="mt-3 text-sm bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                >
                    ابدأ حساب السعرات
                </button>
            </div>
            <button
                onClick={handleDismissWelcomeBanner}
                className="absolute top-2 left-2 p-1 rounded-full hover:bg-primary/20"
                aria-label="إغلاق"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
      )}

      {!isPremium && (
          <section className="p-4 sm:p-6 bg-gradient-to-tr from-primary to-secondary rounded-xl shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-3">
                <Gem size={24} />
                <h3 className="text-lg sm:text-xl font-bold">{UPGRADE_TO_PREMIUM_TITLE}</h3>
            </div>
            <p className="text-sm font-light mb-4">{UNLOCK_ALL_FEATURES_TITLE}</p>
            <ul className="space-y-1.5 text-sm mb-5 ps-4">
                {UNLOCK_ALL_FEATURES_LIST.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-300"/>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button onClick={() => setCurrentView('subscriptionPage')} className="w-full bg-white text-primary font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-100 transition-colors transform [@media(hover:hover)]:hover:scale-105">
                {UPGRADE_NOW_BUTTON}
            </button>
          </section>
      )}

      <section className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-primary">
        <h3 className="text-lg sm:text-xl font-semibold text-primary-light mb-4 flex items-center gap-2">
            <Flame size={22} /> {DAILY_NEEDS_TITLE_DASHBOARD}
        </h3>
        {userTargetMacros ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-5xl sm:text-6xl font-extrabold text-secondary tracking-tight">{userTargetMacros.calories.toFixed(0)}</p>
              <p className="text-lg text-textMuted">{CALORIES_UNIT}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <InfoCard title="بروتين" value={userTargetMacros.protein.toFixed(0)} unit={PROTEIN_UNIT} icon={<Beef />} colorClass="border-red-400 text-red-400" />
                <InfoCard title="كربوهيدرات" value={userTargetMacros.carbs.toFixed(0)} unit={CARBS_UNIT} icon={<Wheat />} colorClass="border-green-400 text-green-400" />
                <InfoCard title="دهون" value={userTargetMacros.fat.toFixed(0)} unit={FAT_UNIT} icon={<Droplets />} colorClass="border-blue-400 text-blue-400" />
                <button onClick={() => setCurrentView('userInput')} className="bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold p-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform transform [@media(hover:hover)]:hover:scale-105">
                  <Scale size={20} />
                  <span className="text-sm">{RECALCULATE_NEEDS_BUTTON}</span>
                </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 flex flex-col items-center gap-4">
            <p className="text-textMuted max-w-md">{CALCULATE_NEEDS_PROMPT_DASHBOARD}</p>
            <button onClick={() => setCurrentView('userInput')} className={primaryButtonClass}>
              <PlusCircle size={18}/>
              {START_CALCULATION_BUTTON}
            </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <section className="p-4 sm:p-5 bg-card/80 rounded-xl shadow-2xl border-t-4 border-secondary">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-secondary-light" size={24} />
              <h3 className="text-lg font-semibold text-secondary-light">{PROGRESS_SUMMARY_TITLE}</h3>
            </div>
          {progressEntries.length > 1 ? (
            <div className="space-y-4">
              <ProgressChart data={progressEntries} theme={theme}/>
              {plateauState.visible && (
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => setIsAdviceModalOpen(true)} 
                        disabled={!plateauState.enabled}
                        className="w-full text-sm bg-accent/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
                    >
                        <Lightbulb size={16} />
                        {GET_PLATEAU_ADVICE_BUTTON}
                    </button>
                    {plateauState.reason && (
                        <p className="text-xs text-textMuted mt-2">{plateauState.reason}</p>
                    )}
                </div>
              )}
              <button onClick={() => setCurrentView('progressTracking')} className={linkButtonClass}>
                {VIEW_ALL_PROGRESS_BUTTON} &rarr;
              </button>
            </div>
          ) : latestProgressEntry ? (
             <div className="space-y-4">
                <div className="bg-card/50 p-3 rounded-lg shadow-inner">
                    <p className="text-xs text-textMuted">
                        <strong>{LATEST_ENTRY_LABEL}</strong> {new Date(latestProgressEntry.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex items-baseline gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <Weight className="text-textMuted" size={20}/>
                            <p><strong className="font-bold text-xl text-textBase">{latestProgressEntry.weight.toFixed(1)}</strong> <span className="text-sm">{WEIGHT_KG_LABEL}</span></p>
                        </div>
                        {latestProgressEntry.bodyFatPercentage && latestProgressEntry.bodyFatPercentage > 0 && (
                            <div className="flex items-center gap-2">
                                <Flame className="text-textMuted" size={18}/>
                                <p><strong className="font-bold text-lg text-textBase">{latestProgressEntry.bodyFatPercentage.toFixed(1)}</strong> <span className="text-xs">% دهون</span></p>
                            </div>
                        )}
                    </div>
                </div>
                {plateauState.visible && (
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setIsAdviceModalOpen(true)} 
                            disabled={!plateauState.enabled}
                            className="w-full text-sm bg-accent/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
                        >
                            <Lightbulb size={16} />
                            {GET_PLATEAU_ADVICE_BUTTON}
                        </button>
                        {plateauState.reason && (
                            <p className="text-xs text-textMuted mt-2">{plateauState.reason}</p>
                        )}
                    </div>
                )}
                 <button onClick={() => setCurrentView('progressTracking')} className={linkButtonClass}>
                    {VIEW_ALL_PROGRESS_BUTTON} &rarr;
                </button>
            </div>
          ) : (
            <div className="text-center py-2 flex flex-col items-center gap-3">
              <p className="text-textMuted text-sm">{NO_PROGRESS_LOGGED_DASHBOARD}</p>
              <button onClick={() => setCurrentView('progressTracking')} className={`${primaryButtonClass} bg-gradient-to-r from-secondary to-secondary-dark hover:shadow-secondary/40`}>
                <PlusCircle size={18}/>
                {LOG_FIRST_PROGRESS_BUTTON}
              </button>
            </div>
          )}
        </section>

        <section className="p-4 sm:p-5 bg-card/80 rounded-xl shadow-2xl border-t-4 border-accent">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-accent-light" size={24} />
              <h3 className="text-lg font-semibold text-accent-light">{MY_DATA_TITLE}</h3>
            </div>
            <div className="space-y-3">
                <ActionCard 
                    icon={<Camera size={20}/>} 
                    title={ANALYZE_MEAL_FROM_PHOTO_NAV_LINK}
                    subtitle="تعرف على مكونات وسعرات وجبتك"
                    onClick={() => {
                        if (!isPremium) {
                            showTemporaryNotification('error', PREMIUM_ONLY_FEATURE_ERROR(ANALYZE_MEAL_FROM_PHOTO_NAV_LINK));
                            return;
                        }
                        setCurrentView('analyzeMealFromPhoto');
                    }}
                    isPremiumFeature={true}
                    isPremiumUser={isPremium}
                />
                <ActionCard 
                    icon={<Database size={20}/>} 
                    title={FOOD_DATABASE_NAVIGATION_LINK} 
                    subtitle={`${customFoodItemCount} ${getItemsUnit(customFoodItemCount)}`}
                    onClick={() => setCurrentView('foodDatabase')}
                />
                 <ActionCard 
                    icon={<Soup size={20}/>} 
                    title={RECIPES_NAVIGATION_LINK}
                    subtitle={`${recipeCount} ${getRecipeUnit(recipeCount)}`}
                    onClick={() => setCurrentView('recipeList')}
                />
                 <ActionCard 
                    icon={<ClipboardList size={20}/>} 
                    title={RECIPE_DRIVEN_MEAL_PLAN_NAVIGATION_LINK}
                    subtitle="خطط لوجباتك اليومية"
                    onClick={() => setCurrentView('recipeDrivenMealPlan')}
                />
                 <ActionCard 
                    icon={<Zap size={20}/>} 
                    title={BURNED_CALORIES_CALCULATOR_NAV_LINK}
                    subtitle="احسب حرق السعرات في تمارينك"
                    onClick={() => setCurrentView('burnedCaloriesCalculator')}
                />
            </div>
        </section>
      </div>
       {isAdviceModalOpen && (
            <PlateauAdviceModal 
                onClose={() => setIsAdviceModalOpen(false)}
                getAdvice={handleGetAdvice}
                recentEntries={progressEntries.slice(0, 4)}
                onGoToCalculator={() => setCurrentView('userInput')}
                onGoToBurnedCalories={() => setCurrentView('burnedCaloriesCalculator')}
            />
        )}
    </div>
  );
};

export default UserDashboardView;