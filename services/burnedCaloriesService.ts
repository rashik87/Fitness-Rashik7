import { Gender } from '../types';

interface BurnedCaloriesInputs {
  weightKg: number;
  durationMin: number;
  age: number;
  gender: Gender;
  metValue: number;
  heartRateBpm?: number;
}

interface BurnedCaloriesResult {
  calories: number;
  method: 'MET' | 'HR';
}

/**
 * Calculates burned calories based on the MET formula.
 * Formula: Calories = MET × Weight(kg) × (Duration(min) / 60)
 */
const calculateWithMet = (met: number, weightKg: number, durationMin: number): number => {
  if (met <= 0 || weightKg <= 0 || durationMin <= 0) return 0;
  return met * weightKg * (durationMin / 60);
};

/**
 * Calculates burned calories based on the Heart Rate formula.
 * This formula is more personalized and generally more accurate if HR is available.
 * Source: Journal of Sports Sciences
 */
const calculateWithHr = (
  heartRateBpm: number,
  weightKg: number,
  age: number,
  durationMin: number,
  gender: Gender
): number => {
  if (heartRateBpm <= 0 || weightKg <= 0 || age <= 0 || durationMin <= 0) return 0;
  let calories: number;
  if (gender === Gender.MALE) {
    /*
     * For Men: Calories = ((-55.0969 + (0.6309 × HR) + (0.1988 × Weight) + (0.2017 × Age)) / 4.184) × 60 × T
     * Simplified: ((-55.0969 + (0.6309 * HR) + (0.09036 * WeightKg) + (0.2017 * Age)) * DurationMin) / 4.184
     * The user's provided formula:
     */
    calories = (((heartRateBpm * 0.6309) - (age * 0.2017) + (weightKg * 0.09036) - 55.0969) * durationMin) / 4.184;

  } else { // FEMALE
    /*
     * For Women: Calories = ((-20.4022 + (0.4472 × HR) - (0.1263 × Weight) + (0.074 × Age)) / 4.184) × 60 × T
     * Simplified: ((-20.4022 + (0.4472 * HR) + (0.05741 * WeightKg) - (0.1263 * Age)) * DurationMin) / 4.184
     * The user's provided formula:
     */
    calories = (((heartRateBpm * 0.4472) - (age * 0.1263) + (weightKg * 0.05741) - 20.4022) * durationMin) / 4.184;

  }
  return Math.max(0, calories); // Ensure calories aren't negative
};

/**
 * Calculates the estimated number of calories burned during a physical activity.
 * It prioritizes the heart rate (HR) formula if heartRateBpm is provided,
 * as it's more accurate. Otherwise, it falls back to the MET-based formula.
 *
 * @param {BurnedCaloriesInputs} inputs - The input data for the calculation.
 * @returns {BurnedCaloriesResult} An object containing the burned calories and the method used.
 */
export const calculateBurnedCalories = (inputs: BurnedCaloriesInputs): BurnedCaloriesResult => {
  const { weightKg, durationMin, age, gender, metValue, heartRateBpm } = inputs;

  // Use HR formula if HR is provided and valid
  if (heartRateBpm && heartRateBpm > 0) {
    const calories = calculateWithHr(heartRateBpm, weightKg, age, durationMin, gender);
    return {
      calories: Math.round(calories),
      method: 'HR',
    };
  }

  // Fallback to MET formula
  const calories = calculateWithMet(metValue, weightKg, durationMin);
  return {
    calories: Math.round(calories),
    method: 'MET',
  };
};