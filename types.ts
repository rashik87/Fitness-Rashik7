


import { ActivityCategory } from './data/metActivities';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary', 
  LIGHT = 'light',       
  MODERATE = 'moderate',   
  ACTIVE = 'active',     
  VERY_ACTIVE = 'very_active', 
}

export enum Goal {
  LOSE_WEIGHT = 'lose',
  MAINTAIN_WEIGHT = 'maintain',
  GAIN_WEIGHT = 'gain',
  MINI_CUT = 'mini_cut',
}

export enum DietProtocol {
  NONE = 'none',
  KETO = 'keto',
  CARB_CYCLING = 'carb_cycling',
  INTERMITTENT_FASTING = 'intermittent_fasting',
}

export enum PregnancyStatus {
  NONE = 'none',
  PREGNANT = 'pregnant',
  BREASTFEEDING = 'breastfeeding',
  MENOPAUSE = 'menopause'
}

export enum MedicalCondition {
  NONE = 'none',
  HYPOTHYROIDISM = 'hypothyroidism',
  HYPERTHYROIDISM = 'hyperthyroidism',
  PCOS = 'pcos',
  DIABETES_TYPE_1 = 'diabetes_type_1',
  DIABETES_TYPE_2 = 'diabetes_type_2',
  GESTATIONAL_DIABETES = 'gestational_diabetes',
  HYPERTENSION = 'hypertension',
}

export enum SportActivity {
  ENDURANCE = 'endurance',
  STRENGTH_BODYBUILDING = 'strength_bodybuilding',
  TEAM_SPORTS = 'team_sports',
  GYMNASTICS_MARTIAL_ARTS = 'gymnastics_martial_arts',
  WEIGHT_CLASS = 'weight_class',
  GENERAL_FITNESS = 'general_fitness',
  CROSSFIT = 'crossfit',
  HEAVY_MARTIAL_ARTS = 'heavy_martial_arts',
  YOGA_PILATES = 'yoga_pilates',
  HOME_WORKOUTS = 'home_workouts',
}

export interface UserData {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  targetWeight?: number;
  activityLevel: ActivityLevel;
  sportActivity?: SportActivity;
  bodyFatPercentage?: number;
  pregnancyStatus?: PregnancyStatus;
  medicalConditions?: MedicalCondition[];
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GoalSettings {
  goal: Goal;
  modifier: number;
}

export interface CarbCycleConfig {
  highCarbDays: number;
  mediumCarbDays: number;
  lowCarbDays: number;
}

export interface IntermittentFastingConfig {
  eatingWindowStart: string;
  eatingWindowEnd: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  isCustom: boolean;
  userId: string | null;
}

export interface RecipeIngredient extends Macros {
  foodItemId: string;
  foodItemName: string;
  quantityGram: number;
  originalServingSize: string;
}

export interface Recipe {
  id:string;
  userId: string | null;
  name: string;
  description?: string;
  category: RecipeCategory;
  tags?: RecipeTag[];
  imageUrl?: string;
  servings: number;
  ingredients: RecipeIngredient[];
  totalMacros: Macros;
  perServingMacros: Macros;
  isCustom: boolean;
  createdAt: string;
}

export enum RecipeCategory {
  NONE = 'none',
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export enum RecipeTag {
    HIGH_PROTEIN = 'high_protein',
    LOW_CARB = 'low_carb',
    KETO = 'keto',
    VEGETARIAN = 'vegetarian',
}

export interface MeasurementDetails {
    neck?: number;
    waist?: number;
    hips?: number;
    thigh?: number;
}

export interface WeightEntry {
    id: string;
    userId: string;
    date: string; // ISO string
    weight: number;
    measurements: MeasurementDetails;
    bodyFatPercentage?: number;
    bodyFatMass?: number;
    leanMass?: number;
    calorieIntake?: number;
}

export type AppView =
  | 'landingPage'
  | 'authGate'
  | 'userDashboard'
  | 'userInput'
  | 'goalSelection'
  | 'dietSelection'
  | 'results'
  | 'foodDatabase'
  | 'recipeList'
  | 'recipeCreation'
  | 'recipeDetail'
  | 'progressTracking'
  | 'burnedCaloriesCalculator'
  | 'recipeDrivenMealPlan'
  | 'adjustedMealPlanDetail'
  | 'shoppingList'
  | 'analyzeMealFromPhoto'
  | 'settings'
  | 'reports'
  | 'supplementsGuide'
  | 'micronutrientAnalysis'
  | 'dailyDiary'
  | 'privacyPolicy'
  | 'termsOfService'
  | 'medicalDisclaimer'
  | 'aboutUs'
  | 'faq'
  | 'contactUs'
  | 'moreScreen'
  | 'idealBodyFatCalculator'
  | 'bodyCompositionAnalysis'
  | 'subscriptionPage';

export type AuthView = 'login' | 'register' | 'forgotPassword';

export type SubscriptionTier = 'free' | 'premium';

export interface Profile {
  id: string;
  email: string;
  subscription: SubscriptionTier;
}

export interface AppUser {
  id: string;
  email: string;
  password?: string; // Only stored in-memory, not persisted for security
  profile: Profile;
}


export interface BodyFatInputs {
    gender: Gender;
    heightCm: number;
    neckCm: number;
    waistCm: number;
    hipCm?: number;
    weightKg: number;
}

export interface BodyFatResult {
    percentage: number;
    category: string;
    fatMassKg?: number;
    leanMassKg?: number;
}

export interface MetActivity {
    code: string;
    category: ActivityCategory;
    description: string;
    met: number;
}

export type CarbCycleDayType = 'high' | 'medium' | 'low' | 'normal';

export interface MealSlot {
    id: string;
    slotName: string;
    assignedRecipeId: string | null;
    quantityOfRecipeServings: number;
    recipeSnapshot: {
        id: string;
        name: string;
        imageUrl?: string;
        perServingMacros: Macros;
        ingredients: RecipeIngredient[];
        definedServingsInRecipe: number;
    } | null;
}

export interface DayPlan {
    dayIndex: number;
    meals: MealSlot[];
    dayType: CarbCycleDayType;
}

export type FullMealPlan = DayPlan[];


export interface ShoppingListItem {
    name: string;
    totalQuantity: number;
    unit: 'جرام'; // Assuming all are in grams for simplicity
}

export interface SavedMealPlan {
    id: string;
    userId: string;
    name: string;
    savedAt: string;
    plan: FullMealPlan;
    dietProtocol: DietProtocol;
    userTargetMacros: Macros;
}

export interface DailyUsageStats {
    pdfDownloads: number;
    planGenerations: number;
}

export interface AiGeneratedRecipe {
  recipeName: string;
  description: string;
  servings: number;
  category: RecipeCategory;
  ingredients: {
    name: string;
    quantityGrams: number;
  }[];
  instructions: string;
}

export interface ProcessedAiRecipe extends Omit<AiGeneratedRecipe, 'ingredients'> {
    matchedIngredients: RecipeIngredient[];
    unmatchedIngredientNames: string[];
    totalMacros: Macros;
    perServingMacros: Macros;
}

export interface AiAnalyzedMeal {
  ingredients: {
    name: string;
    quantityGrams: number;
    confidence: number;
  }[];
}

export interface AnalyzedIngredient extends RecipeIngredient {
    confidence: number;
}

export interface ProcessedAnalyzedMeal {
    matchedIngredients: AnalyzedIngredient[];
    unmatchedIngredientNames: string[];
    totalMacros: Macros;
}

export interface AiGeneratedMealSlot {
  recipeId: string;
  quantityOfRecipeServings: number;
}

// --- Daily Diary Types ---
export interface LoggedFoodItem {
  logId: string; // Unique ID for this specific entry in the log
  type: 'recipe' | 'food' | 'quick';
  sourceId?: string; // id of the original Recipe or FoodItem
  name: string;
  macros: Macros; // The actual macros for the quantity logged
  quantity: number;
  unit: 'servings' | 'grams' | 'entry';
  loggedAt: string; // ISO timestamp
}

export interface LoggedExerciseItem {
    logId: string; // Unique ID for this specific entry in the log
    activityDescription: string;
    durationMinutes: number;
    caloriesBurned: number;
    loggedAt: string; // ISO timestamp
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    food: LoggedFoodItem[];
    exercises: LoggedExerciseItem[];
    waterIntakeMl: number;
    waterIntakeGoalMl: number;
}

// --- Supplements Guide Types ---

export interface DosageRules {
    perKgBodyweight?: number; // e.g., 3 for 3mg/kg
    maxPercentageOfDailyProtein?: number; // e.g., 0.4 for 40%
}

export interface Dosage {
    baseAmount: string; 
    unit: string; 
    notes?: string[];
    rules?: DosageRules;
    calculation?: (user: UserData, macros?: Macros | null) => string | null;
}

export interface SupplementRelevanceCriteria {
    goals?: Goal[];
    diets?: DietProtocol[];
    activityLevels?: ActivityLevel[];
    gender?: Gender[];
    general?: boolean; // True if it's a general recommendation for most people
}

export interface Supplement {
    id: string;
    name: string;
    description: string;
    benefits: string[];
    relevanceCriteria: SupplementRelevanceCriteria;
    dosage: Dosage;
}


// --- Micronutrient Analysis Types ---

export interface RdaData {
    [gender: string]: { // 'male' or 'female'
        [ageRange: string]: number; // e.g., '19-50': 1000
    };
}

export interface NutrientRelevanceCriteria {
    activityLevels?: { level: ActivityLevel, multiplier: number }[];
    // Add other criteria like diets if needed in the future
    // diets?: DietProtocol[];
}

export interface Nutrient {
    id: string;
    name: string;
    unit: 'mg' | 'mcg' | 'g' | 'IU';
    importance: string;
    foodSources: string[];
    deficiencySymptoms: string[];
    rda: RdaData;
    ul?: RdaData; // Tolerable Upper Intake Level
    relevanceCriteria?: NutrientRelevanceCriteria;
    smartNotes?: ((user: UserData) => string | null)[];
}

// --- Advanced Calculator Types ---
export enum PlanPhaseType {
  INITIAL_WATER_LOSS = 'initial_water_loss',
  FAT_LOSS = 'fat_loss',
  REFEED_DAY = 'refeed_day',
  DIET_BREAK = 'diet_break',
  MUSCLE_GAIN = 'muscle_gain',
  MINI_CUT = 'mini_cut',
  MAINTENANCE = 'maintenance',
  HEALTH_FOCUS = 'health_focus', // For pregnancy, teens, etc.
}

export interface PlanPhase {
  type: PlanPhaseType;
  name: string;
  duration: string;
  calories: number;
  macros: Omit<Macros, 'calories'>;
  notes: string[];
  weeklyLoss?: string;
  reviewInstructions?: string;
  activityRecommendation?: string;
}

export interface AdvancedPlanResult {
  targetCalories: number;
  targetMacros: Macros;
  estimatedDuration: string;
  durationContext: string;
  phases: PlanPhase[];
  warnings: string[];
  guidelines?: string[];
  bmr: number;
  tdee: number;
  goal: Goal;
}

// --- Body Composition Analysis Types ---
export interface BodyCompositionResult {
    bodyFat: {
        percentage: number;
        category: 'Essential' | 'Fitness' | 'Acceptable' | 'Obese';
        categoryLabel: string;
        fatMass: number;
        leanMass: number;
    };
    ffmi: {
        value: number;
        category: 'Low' | 'Normal' | 'Advanced' | 'Very High' | 'Possible Steroid Use';
        categoryLabel: string;
    };
    waistCircumference: {
        value: number;
        isAtRisk: boolean;
        riskLabel: string;
    };
    whr: {
        value: number | null;
        isAtRisk: boolean;
        riskLabel: string;
    };
    summary: {
        riskLevel: 'منخفض' | 'متوسط' | 'مرتفع';
        primaryRecommendation: string;
    };
}

export interface BodyFatTargetResult {
  idealRange: { min: number; max: number };
  recommendation: string;
  status: 'below' | 'above' | 'ideal';
}

export interface BodyFatSuggestion extends BodyFatTargetResult {
    suggestedTargetWeight?: number;
}