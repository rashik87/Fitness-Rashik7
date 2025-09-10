
import {
  AppUser, FoodItem, Recipe, WeightEntry, UserData, GoalSettings,
  DietProtocol, Macros, CarbCycleConfig, IntermittentFastingConfig,
  SavedMealPlan, DailyUsageStats, DailyLog
} from '../types';

// --- STORAGE KEYS ---
const USERS_KEY = 'fitness_rashik_users';
const CURRENT_USER_ID_KEY = 'fitness_rashik_currentUserId';
const CUSTOM_FOOD_ITEMS_PREFIX = 'fitness_rashik_customFood_';
const CUSTOM_RECIPES_PREFIX = 'fitness_rashik_recipes_';
const PROGRESS_ENTRIES_PREFIX = 'fitness_rashik_progress_';
const CALCULATOR_STATE_PREFIX = 'fitness_rashik_calcState_';
const SAVED_PLANS_PREFIX = 'fitness_rashik_savedPlans_';
const USAGE_STATS_PREFIX = 'fitness_rashik_usage_';
const DAILY_LOGS_PREFIX = 'fitness_rashik_dailyLogs_';

// --- Helper Functions ---
const get = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage`, error);
    return defaultValue;
  }
};

const set = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage`, error);
  }
};

// --- In-memory cache for predefined items ---
let predefinedFoodItemsCache: FoodItem[] | null = null;
let predefinedRecipesCache: Recipe[] | null = null;

const fetchPredefinedFoodItems = async (): Promise<FoodItem[]> => {
  if (predefinedFoodItemsCache) {
    return predefinedFoodItemsCache;
  }
  try {
    const response = await fetch('/data/foodItems.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch food items: ${response.statusText}`);
    }
    const items: FoodItem[] = await response.json();
    predefinedFoodItemsCache = items;
    return items;
  } catch (error) {
    console.error("Error fetching predefined food items:", error);
    return [];
  }
};

const fetchPredefinedRecipes = async (): Promise<Recipe[]> => {
    if (predefinedRecipesCache) {
        return predefinedRecipesCache;
    }
    try {
        const response = await fetch('/data/predefinedRecipes.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch recipes: ${response.statusText}`);
        }
        const recipes: Recipe[] = await response.json();
        // Ensure all predefined recipes have isCustom set to false
        const correctedRecipes = recipes.map(r => ({ ...r, isCustom: false, userId: null }));
        predefinedRecipesCache = correctedRecipes;
        return correctedRecipes;
    } catch (error) {
        console.error("Error fetching predefined recipes:", error);
        return [];
    }
};


// --- User Management ---
export const getUsers = (): AppUser[] => get<AppUser[]>(USERS_KEY, []);
export const saveUsers = (users: AppUser[]): void => set<AppUser[]>(USERS_KEY, users);
export const getCurrentUserId = (): string | null => get<string | null>(CURRENT_USER_ID_KEY, null);
export const setCurrentUserId = (userId: string | null): void => {
  if (userId) {
    set<string>(CURRENT_USER_ID_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }
};

// --- Data Management (User-Scoped) ---
const getKey = (prefix: string, userId: string) => `${prefix}${userId}`;

// Food Items
export const getFoodItems = async (userId: string): Promise<FoodItem[]> => {
  const customItems = get<FoodItem[]>(getKey(CUSTOM_FOOD_ITEMS_PREFIX, userId), []);
  const predefinedItems = await fetchPredefinedFoodItems();
  return [...predefinedItems, ...customItems];
};
export const getCustomFoodItems = (userId: string): FoodItem[] => get<FoodItem[]>(getKey(CUSTOM_FOOD_ITEMS_PREFIX, userId), []);
export const saveCustomFoodItems = (userId: string, items: FoodItem[]): void => set(getKey(CUSTOM_FOOD_ITEMS_PREFIX, userId), items);

// Recipes
export const getRecipes = async (userId: string): Promise<Recipe[]> => {
    const customRecipes = get<Recipe[]>(getKey(CUSTOM_RECIPES_PREFIX, userId), []);
    const predefinedRecipes = await fetchPredefinedRecipes();
    return [...predefinedRecipes, ...customRecipes];
};
export const getCustomRecipes = (userId: string): Recipe[] => get<Recipe[]>(getKey(CUSTOM_RECIPES_PREFIX, userId), []);
export const saveCustomRecipes = (userId: string, recipes: Recipe[]): void => set(getKey(CUSTOM_RECIPES_PREFIX, userId), recipes);


// Progress Entries
export const getProgressEntries = (userId: string): WeightEntry[] => get<WeightEntry[]>(getKey(PROGRESS_ENTRIES_PREFIX, userId), []);
export const saveProgressEntries = (userId: string, entries: WeightEntry[]): void => set(getKey(PROGRESS_ENTRIES_PREFIX, userId), entries);

// Calculator State
export interface StoredCalculatorState {
    userData: UserData;
    goalSettings: GoalSettings;
    selectedDiet: DietProtocol;
    initialTdee: number;
    finalTdee: number;
    userTargetMacros: Macros;
    carbCycleConfig: CarbCycleConfig | null;
    intermittentFastingConfig: IntermittentFastingConfig | null;
}
export const getCalculatorState = (userId: string): StoredCalculatorState | null => get(getKey(CALCULATOR_STATE_PREFIX, userId), null);
export const saveCalculatorState = (userId: string, state: StoredCalculatorState): void => set(getKey(CALCULATOR_STATE_PREFIX, userId), state);
export const clearCalculatorState = (userId: string): void => localStorage.removeItem(getKey(CALCULATOR_STATE_PREFIX, userId));

// Saved Meal Plans
export const getSavedMealPlans = (userId: string): SavedMealPlan[] => get<SavedMealPlan[]>(getKey(SAVED_PLANS_PREFIX, userId), []);
export const saveSavedMealPlans = (userId: string, plans: SavedMealPlan[]): void => set(getKey(SAVED_PLANS_PREFIX, userId), plans);

// Daily Usage Stats
export const getTodayUsageStats = (userId: string): DailyUsageStats => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${USAGE_STATS_PREFIX}${userId}_${today}`;
    return get<DailyUsageStats>(key, { pdfDownloads: 0, planGenerations: 0 });
};
export const saveTodayUsageStats = (userId: string, stats: DailyUsageStats): void => {
    const today = new Date().toISOString().split('T')[0];
    const key = `${USAGE_STATS_PREFIX}${userId}_${today}`;
    set(key, stats);
};

// Daily Logs
export const getDailyLogs = (userId: string): Record<string, DailyLog> => get(getKey(DAILY_LOGS_PREFIX, userId), {});
export const saveDailyLogs = (userId: string, logs: Record<string, DailyLog>): void => set(getKey(DAILY_LOGS_PREFIX, userId), logs);