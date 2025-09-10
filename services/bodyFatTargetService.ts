
import { Gender, SportActivity, BodyFatTargetResult, BodyFatSuggestion } from '../types';
import { BF_RECOMMENDATIONS } from '../constants';

type BodyFatRange = { min: number; max: number };

const RANGES_MALE: Record<SportActivity, BodyFatRange> = {
  [SportActivity.ENDURANCE]: { min: 6, max: 12 },
  [SportActivity.STRENGTH_BODYBUILDING]: { min: 10, max: 15 }, // Off-season
  [SportActivity.TEAM_SPORTS]: { min: 8, max: 15 },
  [SportActivity.GYMNASTICS_MARTIAL_ARTS]: { min: 5, max: 12 },
  [SportActivity.WEIGHT_CLASS]: { min: 8, max: 15 },
  [SportActivity.GENERAL_FITNESS]: { min: 10, max: 18 },
  [SportActivity.CROSSFIT]: { min: 10, max: 15 },
  [SportActivity.HEAVY_MARTIAL_ARTS]: { min: 8, max: 16 },
  [SportActivity.YOGA_PILATES]: { min: 12, max: 20 },
  [SportActivity.HOME_WORKOUTS]: { min: 10, max: 18 },
};

const RANGES_FEMALE: Record<SportActivity, BodyFatRange> = {
  [SportActivity.ENDURANCE]: { min: 14, max: 20 },
  [SportActivity.STRENGTH_BODYBUILDING]: { min: 18, max: 25 }, // Off-season
  [SportActivity.TEAM_SPORTS]: { min: 16, max: 25 },
  [SportActivity.GYMNASTICS_MARTIAL_ARTS]: { min: 12, max: 20 },
  [SportActivity.WEIGHT_CLASS]: { min: 15, max: 25 },
  [SportActivity.GENERAL_FITNESS]: { min: 18, max: 28 },
  [SportActivity.CROSSFIT]: { min: 16, max: 24 },
  [SportActivity.HEAVY_MARTIAL_ARTS]: { min: 16, max: 25 },
  [SportActivity.YOGA_PILATES]: { min: 20, max: 28 },
  [SportActivity.HOME_WORKOUTS]: { min: 18, max: 28 },
};

export const calculateIdealBodyFat = (
  gender: Gender,
  sportActivity: SportActivity,
  currentBodyFat: number
): BodyFatTargetResult => {
  const ranges = gender === Gender.MALE ? RANGES_MALE : RANGES_FEMALE;
  const idealRange = ranges[sportActivity];

  let recommendation: string;
  let status: 'below' | 'above' | 'ideal';

  if (currentBodyFat < idealRange.min) {
    recommendation = BF_RECOMMENDATIONS.below;
    status = 'below';
  } else if (currentBodyFat > idealRange.max) {
    recommendation = BF_RECOMMENDATIONS.above;
    status = 'above';
  } else {
    recommendation = BF_RECOMMENDATIONS.ideal;
    status = 'ideal';
  }

  return { idealRange, recommendation, status };
};

export const suggestBodyFatTarget = (
  gender: Gender,
  sportActivity: SportActivity,
  currentBodyFat: number,
  currentWeight: number,
): BodyFatSuggestion | null => {
    const ranges = gender === Gender.MALE ? RANGES_MALE : RANGES_FEMALE;
    const idealRange = ranges[sportActivity];
    if (!idealRange) return null;

    let recommendation: string;
    let status: 'below' | 'above' | 'ideal';

    if (currentBodyFat < idealRange.min) {
        recommendation = BF_RECOMMENDATIONS.below;
        status = 'below';
    } else if (currentBodyFat > idealRange.max) {
        recommendation = BF_RECOMMENDATIONS.above;
        status = 'above';
    } else {
        recommendation = BF_RECOMMENDATIONS.ideal;
        status = 'ideal';
    }

    let suggestedTargetWeight: number | undefined = undefined;

    if (status === 'above') {
        const leanMass = currentWeight * (1 - (currentBodyFat / 100));
        // Target the middle of the ideal range
        const targetBodyFatPercent = (idealRange.min + idealRange.max) / 2;
        const targetWeight = leanMass / (1 - (targetBodyFatPercent / 100));
        if (!isNaN(targetWeight) && targetWeight > 0) {
            suggestedTargetWeight = parseFloat(targetWeight.toFixed(1));
        }
    }

    return { idealRange, recommendation, status, suggestedTargetWeight };
};
