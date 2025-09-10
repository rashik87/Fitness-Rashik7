import { ActivityLevel } from '../types';

/**
 * Calculates the recommended daily water intake in milliliters.
 * Base intake is 35ml per kg of body weight.
 * An additional amount is added based on activity level.
 * 
 * @param weightKg User's weight in kilograms.
 * @param activityLevel User's activity level.
 * @returns The recommended daily water intake in ml.
 */
export const calculateWaterGoalMl = (weightKg: number, activityLevel: ActivityLevel): number => {
  const baseIntake = weightKg * 35;
  
  let activityBonus = 0;
  
  switch (activityLevel) {
    case ActivityLevel.MODERATE:
      activityBonus = 500;
      break;
    case ActivityLevel.ACTIVE:
    case ActivityLevel.VERY_ACTIVE:
      activityBonus = 1000;
      break;
    // No bonus for SEDENTARY or LIGHT
    default:
      activityBonus = 0;
      break;
  }
  
  const totalIntake = baseIntake + activityBonus;

  // Round to the nearest 50ml for a cleaner number
  return Math.round(totalIntake / 50) * 50;
};