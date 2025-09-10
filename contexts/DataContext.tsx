
import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { FoodItem, Recipe, WeightEntry, SavedMealPlan, DailyUsageStats, DailyLog, LoggedFoodItem, LoggedExerciseItem } from '../types';
import * as LocalStorageService from '../services/localStorageService';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { useCalculator } from './CalculatorContext';
import { calculateWaterGoalMl } from '../services/waterService';
import { 
  FOOD_ADDED_SUCCESS, FOOD_COPIED_SUCCESS, FOOD_UPDATED_SUCCESS, FOOD_DELETED_SUCCESS,
  ERROR_UPDATING_FOOD, RECIPE_SAVED_SUCCESSFULLY, RECIPE_DELETED_SUCCESSFULLY,
  ENTRY_SAVED_SUCCESS, PLAN_SAVED_SUCCESS,
  PLAN_DELETED_SUCCESS,
  LIMIT_REACHED_ERROR, FREE_TIER_CUSTOM_FOOD_LIMIT, FREE_TIER_RECIPE_LIMIT, DEFAULT_WATER_GOAL_ML
} from '../constants';

interface DataContextType {
  allFoodItems: FoodItem[];
  allRecipes: Recipe[];
  progressEntries: WeightEntry[];
  savedMealPlans: SavedMealPlan[];
  dailyUsage: DailyUsageStats;
  editingRecipe: Recipe | null;
  setEditingRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  selectedRecipeForDetailView: Recipe | null;
  setSelectedRecipeForDetailView: React.Dispatch<React.SetStateAction<Recipe | null>>;
  
  dailyLogs: Record<string, DailyLog>;
  getLogForDate: (date: string) => DailyLog;
  addFoodToLog: (date: string, food: Omit<LoggedFoodItem, 'logId' | 'loggedAt'>) => void;
  addExerciseToLog: (date: string, exercise: Omit<LoggedExerciseItem, 'logId' | 'loggedAt'>) => void;
  removeFromLog: (date: string, logId: string) => void;
  setWaterIntake: (date: string, amountMl: number) => void;

  handleAddNewFoodItem: (newFoodData: Omit<FoodItem, 'id' | 'isCustom' | 'userId'>, isCopy?: boolean) => boolean;
  handleUpdateFoodItem: (foodData: Partial<Omit<FoodItem, 'id' | 'userId' | 'isCustom'>>, foodId: string) => boolean;
  handleDeleteFoodItem: (foodId: string) => void;
  handleSaveRecipe: (recipeData: Omit<Recipe, 'id' | 'isCustom' | 'createdAt' | 'userId'> | Recipe) => void;
  handleEditRecipeFromDetail: (recipeId: string) => void;
  handleDeleteRecipe: (recipeId: string) => void;
  handleCopyRecipe: (recipeToCopy: Recipe) => void;
  handleAddProgressEntry: (entryData: Omit<WeightEntry, 'id' | 'userId'>) => boolean;
  handleDeleteProgressEntry: (entryId: string) => void;
  
  savePlan: (plan: SavedMealPlan) => void;
  deletePlan: (planId: string) => void;

  incrementPdfDownloads: () => void;
  incrementPlanGenerations: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const { currentUser, isPremium } = useAuth();
    const { showTemporaryNotification, setCurrentView } = useUI();
    const { userData } = useCalculator();
    
    const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>([]);
    const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [selectedRecipeForDetailView, setSelectedRecipeForDetailView] = useState<Recipe | null>(null);
    const [progressEntries, setProgressEntries] = useState<WeightEntry[]>([]);
    const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
    const [dailyUsage, setDailyUsage] = useState<DailyUsageStats>({ pdfDownloads: 0, planGenerations: 0 });
    const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});

    const clearData = useCallback(() => {
        setAllFoodItems([]);
        setAllRecipes([]);
        setProgressEntries([]);
        setSavedMealPlans([]);
        setEditingRecipe(null);
        setSelectedRecipeForDetailView(null);
        setDailyUsage({ pdfDownloads: 0, planGenerations: 0 });
        setDailyLogs({});
    }, []);

    const loadData = useCallback(async (userId: string) => {
        setAllFoodItems(await LocalStorageService.getFoodItems(userId));
        
        const loadedRecipes = await LocalStorageService.getRecipes(userId);
        const correctedRecipes = loadedRecipes.map(r => ({
            ...r,
            isCustom: !!r.userId, // Ensure isCustom is correctly set
            totalMacros: r.totalMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            perServingMacros: r.perServingMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 }
        }));
        setAllRecipes(correctedRecipes);

        setProgressEntries(LocalStorageService.getProgressEntries(userId));

        const loadedPlans = LocalStorageService.getSavedMealPlans(userId).map(plan => ({
            ...plan,
            userTargetMacros: plan.userTargetMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            plan: (plan.plan || []).map(day => ({
                ...day,
                meals: (day.meals || []).map(meal => ({
                    ...meal,
                    recipeSnapshot: meal.recipeSnapshot ? {
                        ...meal.recipeSnapshot,
                        perServingMacros: meal.recipeSnapshot.perServingMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 }
                    } : null
                }))
            }))
        }));
        setSavedMealPlans(loadedPlans);

        setDailyUsage(LocalStorageService.getTodayUsageStats(userId));
        setDailyLogs(LocalStorageService.getDailyLogs(userId));
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadData(currentUser.id);
        } else {
            clearData();
        }
    }, [currentUser, loadData, clearData]);

    const getLogForDate = useCallback((date: string): DailyLog => {
        const log = dailyLogs[date];
        
        let waterGoal = DEFAULT_WATER_GOAL_ML;
        if (userData) {
            waterGoal = calculateWaterGoalMl(userData.weight, userData.activityLevel);
        }

        if (log) {
            // If log exists, update its goal if userData is available, but respect existing goal if not.
            return { ...log, waterIntakeGoalMl: userData ? waterGoal : log.waterIntakeGoalMl || DEFAULT_WATER_GOAL_ML };
        }

        // If log doesn't exist, create it with the calculated goal.
        return {
            date,
            food: [],
            exercises: [],
            waterIntakeMl: 0,
            waterIntakeGoalMl: waterGoal
        };
    }, [dailyLogs, userData]);

    const addFoodToLog = useCallback((date: string, food: Omit<LoggedFoodItem, 'logId' | 'loggedAt'>) => {
        if (!currentUser) return;
        const newLogEntry: LoggedFoodItem = {
            ...food,
            logId: `food_${crypto.randomUUID()}`,
            loggedAt: new Date().toISOString()
        };
        
        setDailyLogs(prevLogs => {
            const currentDayLog = getLogForDate(date);
            const updatedLog = { ...currentDayLog, food: [...currentDayLog.food, newLogEntry] };
            const newLogs = { ...prevLogs, [date]: updatedLog };
            LocalStorageService.saveDailyLogs(currentUser.id, newLogs);
            return newLogs;
        });
    }, [currentUser, getLogForDate]);

    const addExerciseToLog = useCallback((date: string, exercise: Omit<LoggedExerciseItem, 'logId' | 'loggedAt'>) => {
        if (!currentUser) return;
        const newLogEntry: LoggedExerciseItem = {
            ...exercise,
            logId: `ex_${crypto.randomUUID()}`,
            loggedAt: new Date().toISOString()
        };

        setDailyLogs(prevLogs => {
            const currentDayLog = getLogForDate(date);
            const updatedLog = { ...currentDayLog, exercises: [...currentDayLog.exercises, newLogEntry] };
            const newLogs = { ...prevLogs, [date]: updatedLog };
            LocalStorageService.saveDailyLogs(currentUser.id, newLogs);
            return newLogs;
        });
    }, [currentUser, getLogForDate]);

    const removeFromLog = useCallback((date: string, logId: string) => {
        if (!currentUser) return;
        
        setDailyLogs(prevLogs => {
            const dayLog = prevLogs[date];
            if (!dayLog) {
                console.warn("Attempted to remove from a log that doesn't exist for date:", date);
                return prevLogs;
            }

            const updatedFood = dayLog.food.filter(f => f.logId !== logId);
            const updatedExercises = dayLog.exercises.filter(e => e.logId !== logId);

            if (updatedFood.length === dayLog.food.length && updatedExercises.length === dayLog.exercises.length) {
                return prevLogs;
            }

            const updatedLog = { ...dayLog, food: updatedFood, exercises: updatedExercises };
            const newLogs = { ...prevLogs, [date]: updatedLog };
            
            LocalStorageService.saveDailyLogs(currentUser.id, newLogs);
            return newLogs;
        });
    }, [currentUser]);
    
    const setWaterIntake = useCallback((date: string, amountMl: number) => {
        if (!currentUser) return;
        
        setDailyLogs(prevLogs => {
            const currentDayLog = getLogForDate(date);
            const updatedLog = { ...currentDayLog, waterIntakeMl: Math.max(0, amountMl) };
            const newLogs = { ...prevLogs, [date]: updatedLog };
            LocalStorageService.saveDailyLogs(currentUser.id, newLogs);
            return newLogs;
        });
    }, [currentUser, getLogForDate]);

    const handleAddNewFoodItem = (newFoodData: Omit<FoodItem, 'id' | 'isCustom' | 'userId'>, isCopy: boolean = false): boolean => {
      if (!currentUser) return false;
      const customItems = LocalStorageService.getCustomFoodItems(currentUser.id);
      if (!isPremium && customItems.length >= FREE_TIER_CUSTOM_FOOD_LIMIT) {
          showTemporaryNotification('error', LIMIT_REACHED_ERROR("الأطعمة المخصصة"));
          return false;
      }
      const newItem: FoodItem = {
          ...newFoodData,
          id: `custom_${crypto.randomUUID()}`,
          isCustom: true,
          userId: currentUser.id
      };
      LocalStorageService.saveCustomFoodItems(currentUser.id, [...customItems, newItem]);
      loadData(currentUser.id);
      showTemporaryNotification('success', isCopy ? FOOD_COPIED_SUCCESS : FOOD_ADDED_SUCCESS);
      return true;
    };

    const handleUpdateFoodItem = (foodData: Partial<Omit<FoodItem, 'id'|'isCustom'|'userId'>>, foodId: string): boolean => {
      if (!currentUser) return false;
      const customItems = LocalStorageService.getCustomFoodItems(currentUser.id);
      const itemIndex = customItems.findIndex(item => item.id === foodId);
      if (itemIndex > -1) {
          customItems[itemIndex] = { ...customItems[itemIndex], ...foodData };
          LocalStorageService.saveCustomFoodItems(currentUser.id, customItems);
          loadData(currentUser.id);
          showTemporaryNotification('success', FOOD_UPDATED_SUCCESS);
          return true;
      }
      showTemporaryNotification('error', ERROR_UPDATING_FOOD);
      return false;
    };
    
    const handleDeleteFoodItem = (foodId: string) => {
        if (!currentUser) return;
        const customItems = LocalStorageService.getCustomFoodItems(currentUser.id);
        const updatedItems = customItems.filter(item => item.id !== foodId);
        LocalStorageService.saveCustomFoodItems(currentUser.id, updatedItems);
        loadData(currentUser.id);
        showTemporaryNotification('success', FOOD_DELETED_SUCCESS);
    };

    const handleSaveRecipe = (recipeData: Omit<Recipe, 'id' | 'isCustom' | 'createdAt' | 'userId'> | Recipe) => {
      if (!currentUser) return;
      const customRecipes = LocalStorageService.getCustomRecipes(currentUser.id);
      if ('id' in recipeData && recipeData.isCustom) { 
          const recipeIndex = customRecipes.findIndex(r => r.id === recipeData.id);
          if (recipeIndex > -1) {
              customRecipes[recipeIndex] = { ...recipeData };
              LocalStorageService.saveCustomRecipes(currentUser.id, customRecipes);
          }
      } else { 
          if (!isPremium && customRecipes.length >= FREE_TIER_RECIPE_LIMIT) {
              showTemporaryNotification('error', LIMIT_REACHED_ERROR("الوصفات"));
              return;
          }
          const newRecipe: Recipe = {
              ...recipeData,
              id: `recipe_${crypto.randomUUID()}`,
              isCustom: true,
              userId: currentUser.id,
              createdAt: new Date().toISOString()
          };
          customRecipes.push(newRecipe);
          LocalStorageService.saveCustomRecipes(currentUser.id, customRecipes);
      }
      loadData(currentUser.id);
      showTemporaryNotification('success', RECIPE_SAVED_SUCCESSFULLY);
      setEditingRecipe(null);
      setCurrentView('recipeList');
    };
    
    const handleCopyRecipe = (recipeToCopy: Recipe) => {
        if (!currentUser) return;
        const customRecipes = LocalStorageService.getCustomRecipes(currentUser.id);
        if (!isPremium && customRecipes.length >= FREE_TIER_RECIPE_LIMIT) {
            showTemporaryNotification('error', LIMIT_REACHED_ERROR("الوصفات"));
            return;
        }
        const newRecipe: Recipe = {
            ...JSON.parse(JSON.stringify(recipeToCopy)), // Deep copy
            id: `recipe_${crypto.randomUUID()}`,
            isCustom: true,
            userId: currentUser.id,
            createdAt: new Date().toISOString(),
            name: `${recipeToCopy.name} (نسخة)`
        };
        const updatedRecipes = [...customRecipes, newRecipe];
        LocalStorageService.saveCustomRecipes(currentUser.id, updatedRecipes);
        loadData(currentUser.id);
        showTemporaryNotification('success', `تم نسخ "${recipeToCopy.name}" بنجاح إلى وصفاتك.`);
    };

    const handleDeleteRecipe = (recipeId: string) => {
      if (!currentUser) return;
      const customRecipes = LocalStorageService.getCustomRecipes(currentUser.id);
      const updatedRecipes = customRecipes.filter(r => r.id !== recipeId);
      LocalStorageService.saveCustomRecipes(currentUser.id, updatedRecipes);
      loadData(currentUser.id);
      showTemporaryNotification('success', RECIPE_DELETED_SUCCESSFULLY);
      setCurrentView('recipeList'); 
      setSelectedRecipeForDetailView(null);
      setEditingRecipe(null);
    };

    const handleEditRecipeFromDetail = (recipeId: string) => {
      if (!currentUser) return;
      const recipeToEdit = allRecipes.find(r => r.id === recipeId && r.isCustom);
      if (recipeToEdit) {
        setEditingRecipe(recipeToEdit);
        setCurrentView('recipeCreation');
      }
    };
    const handleAddProgressEntry = (entryData: Omit<WeightEntry, 'id' | 'userId'>): boolean => {
      if (!currentUser) return false;
      const entries = LocalStorageService.getProgressEntries(currentUser.id);
      const newEntry: WeightEntry = {
        ...entryData,
        id: `entry_${crypto.randomUUID()}`,
        userId: currentUser.id
      };
      const updatedEntries = [newEntry, ...entries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      LocalStorageService.saveProgressEntries(currentUser.id, updatedEntries);
      setProgressEntries(updatedEntries);
      showTemporaryNotification('success', ENTRY_SAVED_SUCCESS);
      return true;
    };
    const handleDeleteProgressEntry = (entryId: string) => {
      if (!currentUser) return;
      const entries = LocalStorageService.getProgressEntries(currentUser.id);
      const updatedEntries = entries.filter(e => e.id !== entryId);
      LocalStorageService.saveProgressEntries(currentUser.id, updatedEntries);
      setProgressEntries(updatedEntries);
    };
    
    const savePlan = (plan: SavedMealPlan) => {
        if (!currentUser) return;
        const plans = LocalStorageService.getSavedMealPlans(currentUser.id);
        const updatedPlans = [plan, ...plans];
        LocalStorageService.saveSavedMealPlans(currentUser.id, updatedPlans);
        setSavedMealPlans(updatedPlans);
        showTemporaryNotification('success', PLAN_SAVED_SUCCESS);
    };

    const deletePlan = (planId: string) => {
        if(!currentUser) return;
        const plans = LocalStorageService.getSavedMealPlans(currentUser.id);
        const updatedPlans = plans.filter(p => p.id !== planId);
        LocalStorageService.saveSavedMealPlans(currentUser.id, updatedPlans);
        setSavedMealPlans(updatedPlans);
        showTemporaryNotification('success', PLAN_DELETED_SUCCESS);
    };

    const incrementPdfDownloads = () => { 
        if (currentUser && !isPremium) {
            const newUsage = {...dailyUsage, pdfDownloads: dailyUsage.pdfDownloads + 1 }; 
            setDailyUsage(newUsage); 
            LocalStorageService.saveTodayUsageStats(currentUser.id, newUsage); 
        }
    };
    
    const incrementPlanGenerations = () => {
        if (currentUser && !isPremium) {
            const newUsage = { ...dailyUsage, planGenerations: dailyUsage.planGenerations + 1 };
            setDailyUsage(newUsage);
            LocalStorageService.saveTodayUsageStats(currentUser.id, newUsage);
        }
    };

    const contextValue: DataContextType = {
        allFoodItems, allRecipes, progressEntries, savedMealPlans, dailyUsage, editingRecipe, setEditingRecipe,
        selectedRecipeForDetailView, setSelectedRecipeForDetailView, handleAddNewFoodItem, handleUpdateFoodItem,
        handleDeleteFoodItem, handleSaveRecipe, handleEditRecipeFromDetail, handleDeleteRecipe, handleCopyRecipe, handleAddProgressEntry,
        handleDeleteProgressEntry, savePlan, deletePlan, incrementPdfDownloads, incrementPlanGenerations,
        dailyLogs, getLogForDate, addFoodToLog, addExerciseToLog, removeFromLog, setWaterIntake
    };

    return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};