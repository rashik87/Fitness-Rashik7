
import React from 'react';
import { Loader2, LayoutDashboard, ClipboardList, Soup, MoreHorizontal, Settings, Camera, Gem, BookText, BarChart3, Pill, ChevronDown, Database, Zap, TrendingUp, ChevronLeft, Target, Activity } from 'lucide-react';
import { AppView, AuthView, SavedMealPlan } from '../types';
import { 
    APP_TITLE, LOGO_URL, LOGOUT_BUTTON, 
    RECIPE_DRIVEN_MEAL_PLAN_NAVIGATION_LINK, RECIPES_NAVIGATION_LINK,
    USER_DASHBOARD_NAV_LINK,
    SETTINGS_NAV_LINK, ANALYZE_MEAL_FROM_PHOTO_NAV_LINK, DAILY_DIARY_NAV_LINK, REPORTS_NAV_LINK, 
    SUPPLEMENTS_GUIDE_NAV_LINK, MICRONUTRIENT_ANALYSIS_NAV_LINK, PREMIUM_ONLY_FEATURE_ERROR, FOOD_DATABASE_NAVIGATION_LINK, BURNED_CALORIES_CALCULATOR_NAV_LINK, PROGRESS_TRACKING_NAV_LINK,
    IDEAL_BODY_FAT_NAV_LINK,
    BODY_COMPOSITION_NAV_LINK
} from '../constants';

// Hooks
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useCalculator } from '../contexts/CalculatorContext';
import { useData } from '../contexts/DataContext';
import { useMealPlan } from '../contexts/MealPlanContext';

// Components
import UserInputForm from './UserInputForm';
import GoalSelector from './GoalSelector';
import DietSelector from './DietSelector';
import ResultsDisplay from './ResultsDisplay';
import CarbCycleConfigurator from './CarbCycleConfigurator';
import IntermittentFastingConfigurator from './IntermittentFastingConfigurator';
import FoodDatabaseView from './FoodDatabaseView';
import RecipeListView from './RecipeListView';
import RecipeCreationView from './RecipeCreationView';
import RecipeDetailView from './RecipeDetailView';
import RecipeDrivenMealPlanView from './RecipeDrivenMealPlanView';
import AdjustedMealPlanDetailView from './AdjustedMealPlanDetailView';
import SelectRecipeModal from './SelectRecipeModal';
import LoginView from './auth/LoginView';
import RegisterView from './auth/RegisterView';
import ForgotPasswordView from './auth/ForgotPasswordView';
import ProgressTrackingView from './progress/ProgressTrackingView';
import UserDashboardView from './UserDashboardView';
import BurnedCaloriesCalculatorView from './BurnedCaloriesCalculatorView';
import ThemeToggleButton from './ThemeToggleButton';
import ShoppingListView from './ShoppingListView';
import SettingsView from './SettingsView';
import AnalyzeMealFromPhotoView from './AnalyzeMealFromPhotoView';
import GenerationProgressModal from './GenerationProgressModal';
import DailyDiaryView from './DailyDiaryView';
import ReportsView from './ReportsView';
import SupplementsGuideView from './SupplementsGuideView';
import MicronutrientAnalysisView from './MicronutrientAnalysisView';
import LandingPageView from './LandingPageView';
import PrivacyPolicyView from './legal/PrivacyPolicyView';
import TermsOfServiceView from './legal/TermsOfServiceView';
import MedicalDisclaimerView from './legal/MedicalDisclaimerView';
import AboutUsView from './legal/AboutUsView';
import FaqView from './legal/FaqView';
import ContactUsView from './legal/ContactUsView';
import IdealBodyFatCalculatorView from './IdealBodyFatCalculatorView';
import BodyCompositionAnalysisView from './BodyCompositionAnalysisView';
import SubscriptionView from './SubscriptionView';

const MoreScreenView: React.FC<{
    setCurrentView: (view: AppView) => void;
    isPremium: boolean;
    showTemporaryNotification: (type: 'success' | 'error', message: string, duration?: number) => void;
}> = ({ setCurrentView, isPremium, showTemporaryNotification }) => {
    
    const MoreMenuItem: React.FC<{
        view: AppView;
        icon: React.ReactNode;
        label: string;
        isPremiumFeature?: boolean;
    }> = ({ view, icon, label, isPremiumFeature }) => (
         <button onClick={() => { 
                if (isPremiumFeature && !isPremium) {
                    showTemporaryNotification('error', PREMIUM_ONLY_FEATURE_ERROR(label));
                    return;
                }
                setCurrentView(view); 
            }} className="w-full text-right flex items-center gap-4 p-4 rounded-lg hover:bg-primary/10 text-textBase transition-colors duration-200 bg-card/50">
            <div className="p-2 bg-primary/10 rounded-lg text-primary-light">{icon}</div>
            <span className="font-semibold">{label}</span>
            <div className="ms-auto flex items-center gap-2">
                {isPremiumFeature && !isPremium && <Gem size={14} className="text-yellow-500"/>}
                <ChevronLeft size={20} className="text-textMuted"/>
            </div>
        </button>
    );

    const SectionTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
        <h3 className="text-md font-semibold text-textMuted px-2 mt-6 mb-2">{children}</h3>
    );

    return (
        <div className="w-full max-w-2xl space-y-3">
             <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center mb-6">المزيد من الأدوات</h2>
            
             <SectionTitle>أدواتي</SectionTitle>
             <MoreMenuItem view="recipeList" icon={<Soup size={22}/>} label={RECIPES_NAVIGATION_LINK} />
             <MoreMenuItem view="foodDatabase" icon={<Database size={22}/>} label={FOOD_DATABASE_NAVIGATION_LINK} />
             <MoreMenuItem view="analyzeMealFromPhoto" icon={<Camera size={22}/>} label={ANALYZE_MEAL_FROM_PHOTO_NAV_LINK} isPremiumFeature />
             <MoreMenuItem view="burnedCaloriesCalculator" icon={<Zap size={22}/>} label={BURNED_CALORIES_CALCULATOR_NAV_LINK} />
             <MoreMenuItem view="idealBodyFatCalculator" icon={<Target size={22}/>} label={IDEAL_BODY_FAT_NAV_LINK} />
             <MoreMenuItem view="bodyCompositionAnalysis" icon={<Activity size={22}/>} label={BODY_COMPOSITION_NAV_LINK} />

             <SectionTitle>متابعة</SectionTitle>
             <MoreMenuItem view="progressTracking" icon={<TrendingUp size={22}/>} label={PROGRESS_TRACKING_NAV_LINK} />
             <MoreMenuItem view="reports" icon={<BarChart3 size={22}/>} label={REPORTS_NAV_LINK} />

             <SectionTitle>أدلة</SectionTitle>
             <MoreMenuItem view="supplementsGuide" icon={<Pill size={22}/>} label={SUPPLEMENTS_GUIDE_NAV_LINK} />
             <MoreMenuItem view="micronutrientAnalysis" icon={<Pill size={22}/>} label={MICRONUTRIENT_ANALYSIS_NAV_LINK} />

             <SectionTitle>الحساب</SectionTitle>
             <MoreMenuItem view="settings" icon={<Settings size={22}/>} label={SETTINGS_NAV_LINK} />
        </div>
    );
};

const AppContent: React.FC = () => {
    const { 
        currentView, setCurrentView, theme, setTheme, notification, showTemporaryNotification
    } = useUI();
    const { 
        currentUser, authView, setAuthView, isLoadingAuth, handleLogout, isPremium
    } = useAuth();
    const { 
        handleUserDataSubmit, handleGoalSettingsSubmit, handleDietSelect,
        handleCarbCycleSubmit, handleIFSubmit, handleDietSelectionContinue,
        handleReset, userData, goalSettings, selectedDiet, finalTdee,
        userTargetMacros, carbCycleConfig, intermittentFastingConfig
    } = useCalculator();
    const {
      allFoodItems, allRecipes, editingRecipe, setEditingRecipe,
      handleSaveRecipe, selectedRecipeForDetailView, setSelectedRecipeForDetailView,
      handleEditRecipeFromDetail, handleDeleteRecipe, progressEntries, handleAddProgressEntry,
      handleDeleteProgressEntry, savedMealPlans, deletePlan, savePlan, dailyUsage, incrementPdfDownloads
    } = useData();
    const {
        fullMealPlan, isSelectRecipeModalOpen, setIsSelectRecipeModalOpen,
        handleAssignRecipe, planForDetailView, setPlanForDetailView,
        handlePlanSetupChange, handleOpenSelectRecipeModal, handleAdjustDayPlan,
        handleUpdateRecipeServings, handleSetDayType, handleViewDetails,
        handleViewSavedPlanDetails, handleLoadPlan, generationStatus
    } = useMealPlan();
    
    const [isDesktopMoreMenuOpen, setIsDesktopMoreMenuOpen] = React.useState(false);
    const moreMenuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const setVisualViewportHeight = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };
        setVisualViewportHeight();
        window.addEventListener('resize', setVisualViewportHeight);
        return () => {
            window.removeEventListener('resize', setVisualViewportHeight);
        };
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsDesktopMoreMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    React.useEffect(() => {
        if (isLoadingAuth) return;

        const publicViews: AppView[] = ['landingPage', 'authGate', 'privacyPolicy', 'termsOfService', 'medicalDisclaimer', 'aboutUs', 'faq', 'contactUs'];
        const isPublicView = publicViews.includes(currentView);

        if (currentUser && currentView === 'authGate') {
            setCurrentView('userDashboard');
        } else if (!currentUser && !isPublicView) {
            setCurrentView('landingPage');
        }
    }, [currentUser, isLoadingAuth, currentView, setCurrentView]);

    const handleSaveCurrentPlan = (planName: string) => {
        if (!currentUser || !fullMealPlan || !userTargetMacros) return;
        const newSavedPlan: SavedMealPlan = {
            id: `plan_${crypto.randomUUID()}`,
            userId: currentUser.id,
            name: planName,
            savedAt: new Date().toISOString(),
            plan: fullMealPlan,
            dietProtocol: selectedDiet,
            userTargetMacros: userTargetMacros
        };
        savePlan(newSavedPlan);
    };

    const renderView = () => {
        if (isLoadingAuth && !currentUser && !['landingPage', 'authGate', 'privacyPolicy', 'termsOfService', 'medicalDisclaimer', 'aboutUs', 'faq', 'contactUs'].includes(currentView)) {
             return (
                <div className="flex items-center justify-center min-h-screen bg-background text-textBase">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            );
        }

        switch(currentView) {
        case 'landingPage':
            return <LandingPageView onNavigateToAuth={(view) => { setAuthView(view); setCurrentView('authGate'); }} onNavigateToPage={setCurrentView} />;

        case 'authGate':
            switch (authView) {
                case 'login':
                    return <LoginView />;
                case 'register':
                    return <RegisterView />;
                case 'forgotPassword':
                    return <ForgotPasswordView />;
                default:
                    setAuthView('login');
                    return <LoginView />;
            }
        
        case 'userDashboard':
            return <UserDashboardView />;

        case 'userInput':
            return <UserInputForm />;
        
        case 'goalSelection':
            return <GoalSelector onSubmit={handleGoalSettingsSubmit} />;

        case 'dietSelection':
            return (
            <div className="w-full max-w-lg flex flex-col items-center space-y-6 animate-fadeIn">
                <DietSelector onSelect={handleDietSelect} currentDiet={selectedDiet} />
                {selectedDiet === 'carb_cycling' && (
                <CarbCycleConfigurator onSubmit={handleCarbCycleSubmit} />
                )}
                {selectedDiet === 'intermittent_fasting' && (
                <IntermittentFastingConfigurator onSubmit={handleIFSubmit} />
                )}
                {(selectedDiet === 'none' || selectedDiet === 'keto') && (
                <button
                    onClick={handleDietSelectionContinue}
                    className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2 focus:ring-offset-background transform hover:scale-105"
                >
                    عرض النتائج
                </button>
                )}
            </div>
            );
        
        case 'results':
            if (!finalTdee || !userTargetMacros || !goalSettings || !userData) {
                return <UserInputForm />;
            }
            return <ResultsDisplay />;
        
        case 'foodDatabase':
            return <FoodDatabaseView />;
        
        case 'recipeList':
            return <RecipeListView />;
                    
        case 'recipeCreation':
            return <RecipeCreationView 
                    allFoodItems={allFoodItems}
                    onSaveRecipe={handleSaveRecipe}
                    onCancel={() => { setEditingRecipe(null); setCurrentView('recipeList'); }}
                    existingRecipe={editingRecipe}
                    />;

        case 'recipeDetail':
            if (!selectedRecipeForDetailView) return <RecipeListView />;
            return <RecipeDetailView
                    recipe={selectedRecipeForDetailView}
                    onEdit={handleEditRecipeFromDetail}
                    onDelete={handleDeleteRecipe}
                    onBack={() => { setSelectedRecipeForDetailView(null); setCurrentView('recipeList'); }}
                    />;
                    
        case 'recipeDrivenMealPlan':
            return <RecipeDrivenMealPlanView 
                userTargetMacros={userTargetMacros}
                userData={userData}
                dietProtocol={selectedDiet}
                onDietProtocolChange={handleDietSelect}
                finalTdee={finalTdee}
                goalSettings={goalSettings}
                fullPlan={fullMealPlan}
                savedPlans={savedMealPlans}
                intermittentFastingConfig={intermittentFastingConfig}
                onViewSavedPlanDetails={handleViewSavedPlanDetails}
                onDeleteSavedPlan={deletePlan}
                onPlanSetupChange={handlePlanSetupChange}
                onOpenSelectRecipeModal={handleOpenSelectRecipeModal}
                onAdjustDayPlan={handleAdjustDayPlan}
                onUpdateRecipeServings={handleUpdateRecipeServings}
                onSetDayType={handleSetDayType}
                onViewDetails={handleViewDetails}
                onResetCalculator={handleReset}
                isPremium={isPremium}
                planGenerationsToday={dailyUsage.planGenerations}
                allRecipes={allRecipes}
                onNavigateToRecipeCreation={() => {
                    setEditingRecipe(null);
                    setCurrentView('recipeCreation');
                }}
            />;
        
        case 'adjustedMealPlanDetail':
            const planData = planForDetailView ? planForDetailView.plan : fullMealPlan;
            const planProtocol = planForDetailView ? planForDetailView.dietProtocol : selectedDiet;
            return <AdjustedMealPlanDetailView
                    fullPlan={planData}
                    dietProtocol={planProtocol}
                    intermittentFastingConfig={intermittentFastingConfig}
                    userData={userData}
                    onBack={() => {
                        setPlanForDetailView(null);
                        setCurrentView('recipeDrivenMealPlan');
                    }}
                    onNavigateToShoppingList={() => setCurrentView('shoppingList')}
                    onSavePlan={handleSaveCurrentPlan}
                    onDownloadPdf={incrementPdfDownloads}
                    isViewingOnly={!!planForDetailView}
                    savedPlanId={planForDetailView ? planForDetailView.id : null}
                    onLoadPlan={handleLoadPlan}
                    isPremium={isPremium}
                    pdfDownloadsToday={dailyUsage.pdfDownloads}
                />;
        
        case 'shoppingList':
             const shoppingListPlanData = planForDetailView ? planForDetailView.plan : fullMealPlan;
            return <ShoppingListView
                fullPlan={shoppingListPlanData}
                onBack={() => setCurrentView('adjustedMealPlanDetail')}
                isPremium={isPremium}
            />;
            
        case 'progressTracking':
            if (!currentUser) return null;
            return <ProgressTrackingView 
                        userDataForCalc={userData}
                        entries={progressEntries}
                        onAddEntry={handleAddProgressEntry}
                        onDeleteEntry={handleDeleteProgressEntry}
                    />;

        case 'burnedCaloriesCalculator':
            return <BurnedCaloriesCalculatorView userDataForCalc={userData} />;

        case 'idealBodyFatCalculator':
            return <IdealBodyFatCalculatorView />;
        
        case 'bodyCompositionAnalysis':
            return <BodyCompositionAnalysisView />;

        case 'settings':
            return <SettingsView />;
        
        case 'analyzeMealFromPhoto':
             return <AnalyzeMealFromPhotoView />;
        
        case 'reports':
            return <ReportsView />;
        
        case 'supplementsGuide':
            return <SupplementsGuideView />;
        
        case 'micronutrientAnalysis':
            return <MicronutrientAnalysisView />;

        case 'dailyDiary':
            return <DailyDiaryView />;
        
        case 'moreScreen':
            return <MoreScreenView setCurrentView={setCurrentView} isPremium={isPremium} showTemporaryNotification={showTemporaryNotification} />;
        
        case 'subscriptionPage':
            return <SubscriptionView />;

        case 'privacyPolicy': return <PrivacyPolicyView />;
        case 'termsOfService': return <TermsOfServiceView />;
        case 'medicalDisclaimer': return <MedicalDisclaimerView />;
        case 'aboutUs': return <AboutUsView />;
        case 'faq': return <FaqView />;
        case 'contactUs': return <ContactUsView />;


        default:
             if(currentUser) return <UserDashboardView />;
             return <LandingPageView onNavigateToAuth={(view) => { setAuthView(view); setCurrentView('authGate'); }} onNavigateToPage={setCurrentView} />;
        }
    };
    
    const Footer = () => (
        <footer className="w-full mt-12 py-6 border-t border-border/50">
            <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 text-xs text-textMuted">
                    <button onClick={() => setCurrentView('aboutUs')} className="hover:text-primary hover:underline">من نحن</button>
                    <button onClick={() => setCurrentView('faq')} className="hover:text-primary hover:underline">الأسئلة الشائعة</button>
                    <button onClick={() => setCurrentView('contactUs')} className="hover:text-primary hover:underline">اتصل بنا</button>
                    <button onClick={() => setCurrentView('termsOfService')} className="hover:text-primary hover:underline">شروط الاستخدام</button>
                    <button onClick={() => setCurrentView('privacyPolicy')} className="hover:text-primary hover:underline">سياسة الخصوصية</button>
                    <button onClick={() => setCurrentView('medicalDisclaimer')} className="hover:text-primary hover:underline">إخلاء مسؤولية طبي</button>
                </div>
                <p className="mt-4 text-xs text-textMuted/70">&copy; {new Date().getFullYear()} {APP_TITLE}.</p>
            </div>
        </footer>
    );
    
    const MobileNavLink: React.FC<{
        view: AppView;
        activeViews: AppView[];
        icon: React.ReactNode;
        label: string;
    }> = ({ view, activeViews, icon, label }) => (
        <button
            onClick={() => {
                setCurrentView(view);
            }}
            className={`flex flex-col items-center justify-center text-xs flex-1 pt-2 pb-1 transition-colors ${
                activeViews.includes(currentView) ? 'text-primary' : 'text-textMuted hover:text-primary/70'
            }`}
        >
            {icon}
            <span className="mt-1">{label}</span>
        </button>
    );

    const MoreMenuItem: React.FC<{
        view: AppView;
        icon: React.ReactNode;
        label: string;
        isPremiumFeature?: boolean;
    }> = ({ view, icon, label, isPremiumFeature }) => (
         <button onClick={() => { 
                if (isPremiumFeature && !isPremium) {
                    showTemporaryNotification('error', PREMIUM_ONLY_FEATURE_ERROR(label));
                    return;
                }
                setCurrentView(view); 
                setIsDesktopMoreMenuOpen(false);
            }} className="w-full text-right flex items-center gap-3 p-3 rounded-md hover:bg-primary/10 text-textBase transition-all duration-200 hover:pl-2">
            {icon}
            <span>{label}</span>
            {isPremiumFeature && !isPremium && <Gem size={14} className="text-yellow-500 ms-auto"/>}
        </button>
    );

    const desktopMoreViews: AppView[] = ['reports', 'supplementsGuide', 'micronutrientAnalysis', 'idealBodyFatCalculator', 'bodyCompositionAnalysis'];
    const moreScreenViews: AppView[] = [
        'moreScreen', 'recipeList', 'recipeCreation', 'recipeDetail', 
        'foodDatabase', 'analyzeMealFromPhoto', 'burnedCaloriesCalculator',
        'progressTracking', 'reports', 'supplementsGuide', 
        'micronutrientAnalysis', 'settings', 'idealBodyFatCalculator', 'bodyCompositionAnalysis',
        'subscriptionPage'
    ];
    const showFooter = !['landingPage', 'authGate'].includes(currentView);

    return (
        <div className={`app-container bg-background text-textBase min-h-dynamic-screen font-cairo ${theme} flex flex-col`}>
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 shadow-sm">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
            <button onClick={() => currentUser ? setCurrentView('userDashboard') : setCurrentView('landingPage')} className="flex items-center gap-3">
                <img src={LOGO_URL} alt="Logo" className="h-10 w-10 rounded-full" />
                <h1 className="text-lg sm:text-xl font-bold text-primary tracking-tight">{APP_TITLE}</h1>
            </button>
            <div className="flex items-center gap-2 sm:gap-4">
                {currentUser && (
                <div className="hidden sm:flex items-center gap-1.5">
                    <button onClick={() => setCurrentView('userDashboard')} className={`nav-link ${currentView === 'userDashboard' && 'active'}`}>{USER_DASHBOARD_NAV_LINK}</button>
                    <button onClick={() => setCurrentView('dailyDiary')} className={`nav-link ${currentView === 'dailyDiary' && 'active'}`}>{DAILY_DIARY_NAV_LINK}</button>
                    <button onClick={() => setCurrentView('recipeDrivenMealPlan')} className={`nav-link ${['recipeDrivenMealPlan', 'adjustedMealPlanDetail', 'shoppingList'].includes(currentView) && 'active'}`}>{RECIPE_DRIVEN_MEAL_PLAN_NAVIGATION_LINK}</button>
                    
                    <div className="relative" ref={moreMenuRef}>
                        <button onClick={() => setIsDesktopMoreMenuOpen(prev => !prev)} className={`nav-link flex items-center gap-1 ${desktopMoreViews.includes(currentView) && 'active'}`}>
                            المزيد <ChevronDown size={16} className={`transition-transform duration-200 ${isDesktopMoreMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDesktopMoreMenuOpen && (
                            <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-scaleIn">
                                <div className="p-2">
                                    <MoreMenuItem view="reports" icon={<BarChart3 size={20} className="text-textMuted"/>} label={REPORTS_NAV_LINK} />
                                    <MoreMenuItem view="supplementsGuide" icon={<Pill size={20} className="text-textMuted"/>} label={SUPPLEMENTS_GUIDE_NAV_LINK} />
                                    <MoreMenuItem view="micronutrientAnalysis" icon={<Pill size={20} className="text-textMuted"/>} label={MICRONUTRIENT_ANALYSIS_NAV_LINK} />
                                    <MoreMenuItem view="idealBodyFatCalculator" icon={<Target size={20} className="text-textMuted"/>} label={IDEAL_BODY_FAT_NAV_LINK} />
                                    <MoreMenuItem view="bodyCompositionAnalysis" icon={<Activity size={20} className="text-textMuted"/>} label={BODY_COMPOSITION_NAV_LINK} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                )}
                <ThemeToggleButton theme={theme} setTheme={setTheme} />
                 {currentUser ? (
                    <>
                        <button onClick={() => setCurrentView('settings')} className="p-2 rounded-full text-textMuted hover:bg-primary/10 hover:text-textBase transition-colors duration-200" aria-label={SETTINGS_NAV_LINK}>
                            <Settings size={18} />
                        </button>
                        <button onClick={handleLogout} className="text-xs sm:text-sm bg-accent/90 text-white font-semibold py-1.5 px-3 sm:px-4 rounded-md hover:bg-accent transition-colors shadow">
                            {LOGOUT_BUTTON}
                        </button>
                    </>
                 ) : (
                    currentView !== 'authGate' && (
                        <button onClick={() => setCurrentView('authGate')} className="text-sm bg-primary/90 text-white font-semibold py-1.5 px-4 rounded-md hover:bg-primary transition-colors shadow">
                            تسجيل الدخول
                        </button>
                    )
                 )}
            </div>
            </nav>
        </header>
        
        <main key={currentView} className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex justify-center items-start animate-slideInUp">
            {renderView()}
        </main>

        {showFooter && <Footer />}


        {notification && (
            <div className={`notification ${notification.type === 'success' ? 'bg-secondary' : 'bg-accent'} text-white`}>
                {notification.message}
            </div>
        )}

        {isSelectRecipeModalOpen && (
            <SelectRecipeModal
            isOpen={isSelectRecipeModalOpen}
            onClose={() => setIsSelectRecipeModalOpen(false)}
            recipes={allRecipes}
            onSelectRecipe={handleAssignRecipe}
// FIX: Removed invalid prop 'activeDietProtocol'.
            />
        )}

        <GenerationProgressModal status={generationStatus} />

        {currentUser && (
            <div className="sm:hidden">
                <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex justify-around items-stretch shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                    <MobileNavLink view="userDashboard" activeViews={['userDashboard']} icon={<LayoutDashboard size={22} />} label={USER_DASHBOARD_NAV_LINK} />
                    <MobileNavLink view="recipeDrivenMealPlan" activeViews={['recipeDrivenMealPlan', 'adjustedMealPlanDetail', 'shoppingList']} icon={<ClipboardList size={22} />} label={RECIPE_DRIVEN_MEAL_PLAN_NAVIGATION_LINK} />
                    <MobileNavLink view="dailyDiary" activeViews={['dailyDiary']} icon={<BookText size={22} />} label={DAILY_DIARY_NAV_LINK} />
                    <button
                        onClick={() => setCurrentView('moreScreen')}
                        className={`flex flex-col items-center justify-center text-xs flex-1 pt-2 pb-1 transition-colors ${
                            moreScreenViews.includes(currentView)
                            ? 'text-primary' : 'text-textMuted hover:text-primary/70'
                        }`}
                    >
                        <MoreHorizontal size={22}/>
                        <span className="mt-1">المزيد</span>
                    </button>
                </div>
            </div>
        )}
        </div>
    );
};

export default AppContent;
