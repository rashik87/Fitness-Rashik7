


import { UserData, Gender, ActivityLevel, Macros, DietProtocol, Goal, CarbCycleDayType } from '../types';
import { 
  MACRO_DISTRIBUTIONS, 
  GRAMS_PER_CALORIE
} from '../constants';

export const calculateBMR = (userData: UserData): number => {
  const { gender, age, height, weight } = userData;
  // Mifflin-St Jeor Equation
  if (gender === Gender.MALE) {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  const activityMultipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHT]: 1.375,
    [ActivityLevel.MODERATE]: 1.55,
    [ActivityLevel.ACTIVE]: 1.725,
    [ActivityLevel.VERY_ACTIVE]: 1.9,
  };
  return bmr * activityMultipliers[activityLevel];
};

export const calculateAdjustedTDEE = (
  baseTDEE: number,
  goal: Goal,
  modifier: number // 0 for maintain, positive for surplus (e.g., 0.1), negative for deficit (e.g., -0.1)
): number => {
  if (goal === Goal.LOSE_WEIGHT) {
    return baseTDEE * (1 - modifier);
  } else if (goal === Goal.GAIN_WEIGHT) {
    return baseTDEE * (1 + modifier);
  }
  return baseTDEE; // Maintain weight
};

const distributeMacrosByPercentage = (calories: number, distribution: { carbs: number; protein: number; fat: number }): Macros => {
  const carbsCalories = calories * distribution.carbs;
  const proteinCalories = calories * distribution.protein;
  const fatCalories = calories * distribution.fat;

  return {
    calories: Math.round(calories),
    carbs: Math.round(carbsCalories / GRAMS_PER_CALORIE.carbs),
    protein: Math.round(proteinCalories / GRAMS_PER_CALORIE.protein),
    fat: Math.round(fatCalories / GRAMS_PER_CALORIE.fat),
  };
};

export const calculateProteinGrams = (userData: UserData): number => {
    const { age, gender, activityLevel, weight } = userData;
    let proteinMultiplier = 1.6; // A sensible default

    const isActive = [ActivityLevel.MODERATE, ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE].includes(activityLevel);

    if (age >= 18 && age <= 40) { // Young
        if (isActive) {
            proteinMultiplier = gender === Gender.MALE ? 2.0 : 1.6;
        } else {
            proteinMultiplier = gender === Gender.MALE ? 1.4 : 1.0;
        }
    } else if (age >= 41 && age <= 60) { // Middle age
        switch(activityLevel) {
            case ActivityLevel.SEDENTARY: proteinMultiplier = 1.6; break;
            case ActivityLevel.LIGHT: proteinMultiplier = 1.8; break;
            case ActivityLevel.MODERATE: proteinMultiplier = 2.0; break;
            case ActivityLevel.ACTIVE:
            case ActivityLevel.VERY_ACTIVE:
                proteinMultiplier = 2.2; break;
        }
    } else if (age > 60) { // Elderly
        if (isActive) {
            proteinMultiplier = gender === Gender.MALE ? 2.4 : 2.0;
        } else {
            proteinMultiplier = gender === Gender.MALE ? 1.6 : 1.2;
        }
    }

    return weight * proteinMultiplier;
};


export const calculateMacros = (
  targetCalories: number,
  diet: DietProtocol,
  goal: Goal,
  userData: UserData,
  carbCycleDayType?: CarbCycleDayType
): Macros => {
  const userWeightKg = userData.weight;
  
  // 1. Diet-specific macro distributions
  if (diet === DietProtocol.KETO) {
    return distributeMacrosByPercentage(targetCalories, MACRO_DISTRIBUTIONS.KETO);
  }

  if (diet === DietProtocol.CARB_CYCLING) {
    const proteinGrams = calculateProteinGrams(userData);
    let carbGrams = 0;

    if (carbCycleDayType === 'high') {
      carbGrams = userWeightKg * 4;   // High carb day: 4g/kg
    } else if (carbCycleDayType === 'medium') {
      carbGrams = userWeightKg * 2.5; // Medium carb day: 2.5g/kg
    } else { // 'low' or 'normal'
      carbGrams = userWeightKg * 1;   // Low carb day: 1g/kg
    }

    const proteinCalories = proteinGrams * GRAMS_PER_CALORIE.protein;
    const carbCalories = carbGrams * GRAMS_PER_CALORIE.carbs;
    const fatCalories = targetCalories - proteinCalories - carbCalories;
    const fatGrams = Math.max(0, fatCalories / GRAMS_PER_CALORIE.fat);

    return {
      calories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fat: Math.round(fatGrams),
    };
  }


  // 2. Goal-specific per-kg rules (for Lose/Gain when diet is not Keto/Carb Cycling)
  if (goal === Goal.LOSE_WEIGHT || goal === Goal.GAIN_WEIGHT) {
    const proteinGrams = calculateProteinGrams(userData);
    const fatPerKg = 0.8; // Unified value as per user request.
    const fatGrams = userWeightKg * fatPerKg;
    const proteinCalories = proteinGrams * GRAMS_PER_CALORIE.protein;
    const fatCalories = fatGrams * GRAMS_PER_CALORIE.fat;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = Math.max(0, carbCalories / GRAMS_PER_CALORIE.carbs); // Ensure carbs are not negative
    return {
      calories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fat: Math.round(fatGrams),
    };
  }

  // 3. Default to balanced distribution for "Maintain" goal
  return distributeMacrosByPercentage(targetCalories, MACRO_DISTRIBUTIONS.BALANCED);
};