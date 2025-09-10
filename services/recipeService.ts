

import { FoodItem, RecipeIngredient, Macros, AiGeneratedRecipe, ProcessedAiRecipe, AiAnalyzedMeal, ProcessedAnalyzedMeal, RecipeCategory, AnalyzedIngredient } from '../types';

/**
 * Parses a serving size string to extract a gram value.
 * e.g., "100 جرام" -> 100, "1 بيضة (50g)" -> 50, "1 cup (approx 150g)" -> 150, "100مل" -> 100
 * @param servingSize The serving size string from FoodItem.
 * @returns The gram value, or null if not parseable.
 */
export function parseServingSizeToGrams(servingSize: string): number | null {
  if (!servingSize) return null;
  const gramMatch = servingSize.match(/(\d+(\.\d+)?)\s*(g|جرام|جم)/i);
  if (gramMatch && gramMatch[1]) {
    return parseFloat(gramMatch[1]);
  }
  // Try to match ml for liquids, assuming 1ml ~ 1g for common liquids like milk/water. Handles both "ml" and "مل".
  const mlMatch = servingSize.match(/(\d+(\.\d+)?)\s*(ml|مل)/i);
  if (mlMatch && mlMatch[1]) {
    return parseFloat(mlMatch[1]); // Assuming 1ml ~ 1g
  }
  return null;
}

/**
 * Calculates the nutritional values for a given quantity of a food item.
 * @param foodItem The food item.
 * @param quantityGrams The desired quantity in grams.
 * @returns An object with calculated calories, protein, carbs, and fat, or null if calculation is not possible.
 */
export function calculateNutrientsForIngredientQuantity(
  foodItem: FoodItem,
  quantityGrams: number
): Omit<RecipeIngredient, 'foodItemId' | 'foodItemName' | 'quantityGram' | 'originalServingSize'> | null {
  const baseWeightGrams = parseServingSizeToGrams(foodItem.servingSize);

  if (baseWeightGrams === null || baseWeightGrams <= 0) {
    console.warn(`Cannot calculate nutrients for "${foodItem.name}". Its serving size "${foodItem.servingSize}" does not provide a parsable base weight in grams or is zero.`);
    return null;
  }

  // Nutrients per gram of the food item
  const caloriesPerGram = foodItem.calories / baseWeightGrams;
  const proteinPerGram = foodItem.protein / baseWeightGrams;
  const carbsPerGram = foodItem.carbs / baseWeightGrams;
  const fatPerGram = foodItem.fat / baseWeightGrams;

  return {
    calories: caloriesPerGram * quantityGrams,
    protein: proteinPerGram * quantityGrams,
    carbs: carbsPerGram * quantityGrams,
    fat: fatPerGram * quantityGrams,
  };
}

/**
 * Calculates total macros for a list of recipe ingredients.
 * @param ingredients Array of RecipeIngredient.
 * @returns Total Macros object.
 */
export function calculateTotalRecipeMacros(ingredients: RecipeIngredient[]): Macros {
  return ingredients.reduce(
    (totals, ing) => {
      totals.calories += ing.calories;
      totals.protein += ing.protein;
      totals.carbs += ing.carbs;
      totals.fat += ing.fat;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Calculates per-serving macros based on total macros and number of servings.
 * @param totalMacros The total macros for the recipe.
 * @param servings The number of servings.
 * @returns Macros per serving.
 */
export function calculatePerServingMacros(totalMacros: Macros, servings: number): Macros {
  if (servings <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  return {
    calories: totalMacros.calories / servings,
    protein: totalMacros.protein / servings,
    carbs: totalMacros.carbs / servings,
    fat: totalMacros.fat / servings,
  };
}


export const findBestMatch = (aiIngredientName: string, foodDb: FoodItem[]): FoodItem | null => {
    if (!aiIngredientName) return null;
    const lowerAiName = aiIngredientName.toLowerCase().trim().replace(/s$/, ''); // Basic singularization
    if (!lowerAiName) return null;

    // 1. Exact match (case-insensitive)
    let exactMatch = foodDb.find(f => f.name.toLowerCase().trim() === lowerAiName);
    if (exactMatch) return exactMatch;

    // Also check for simple pluralization matches
    exactMatch = foodDb.find(f => f.name.toLowerCase().trim().replace(/s$/, '') === lowerAiName);
    if (exactMatch) return exactMatch;

    // 2. Contains match - prioritize shorter, more specific matches
    const candidates = foodDb.filter(f => {
        const lowerDbName = f.name.toLowerCase();
        // Check if DB name contains AI name or vice-versa to handle "chicken" vs "chicken breast"
        return lowerDbName.includes(lowerAiName) || lowerAiName.includes(lowerDbName);
    });

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // 3. Score candidates based on length difference (closer length is better)
    candidates.sort((a, b) => {
        const diffA = Math.abs(a.name.length - lowerAiName.length);
        const diffB = Math.abs(b.name.length - lowerAiName.length);
        return diffA - diffB;
    });

    return candidates[0];
};


export const processAiRecipeResult = (
    aiRecipe: AiGeneratedRecipe, 
    foodDb: FoodItem[]
): ProcessedAiRecipe => {
    const matchedIngredients: RecipeIngredient[] = [];
    const unmatchedIngredientNames: string[] = [];

    if (aiRecipe && Array.isArray(aiRecipe.ingredients)) {
        for (const aiIngredient of aiRecipe.ingredients) {
            // Guard against malformed items from the AI
            if (!aiIngredient || typeof aiIngredient.name !== 'string' || typeof aiIngredient.quantityGrams !== 'number') {
                console.warn("Skipping malformed AI ingredient object:", aiIngredient);
                if (aiIngredient && aiIngredient.name) {
                    unmatchedIngredientNames.push(aiIngredient.name);
                }
                continue;
            }

            const match = findBestMatch(aiIngredient.name, foodDb);
            if (match) {
                const nutrients = calculateNutrientsForIngredientQuantity(match, aiIngredient.quantityGrams);
                if (nutrients) {
                    matchedIngredients.push({
                        ...nutrients,
                        foodItemId: match.id,
                        foodItemName: match.name,
                        quantityGram: aiIngredient.quantityGrams,
                        originalServingSize: match.servingSize
                    });
                } else {
                     unmatchedIngredientNames.push(`${aiIngredient.name} (لا يمكن حساب القيم)`);
                }
            } else {
                unmatchedIngredientNames.push(aiIngredient.name);
            }
        }
    }

    const totalMacros = calculateTotalRecipeMacros(matchedIngredients);
    const perServingMacros = calculatePerServingMacros(totalMacros, aiRecipe?.servings || 1);

    // Ensure we return a valid structure even if aiRecipe is partially malformed
    return {
        recipeName: aiRecipe?.recipeName || 'وصفة غير مسماة',
        description: aiRecipe?.description || '',
        servings: aiRecipe?.servings || 1,
        category: aiRecipe?.category || RecipeCategory.NONE,
        instructions: aiRecipe?.instructions || '',
        matchedIngredients,
        unmatchedIngredientNames,
        totalMacros,
        perServingMacros
    };
};

export const processAnalyzedMealResult = (
    analyzedMeal: AiAnalyzedMeal,
    foodDb: FoodItem[]
): ProcessedAnalyzedMeal => {
    const matchedIngredients: AnalyzedIngredient[] = [];
    const unmatchedIngredientNames: string[] = [];

    if (analyzedMeal && Array.isArray(analyzedMeal.ingredients)) {
        for (const aiIngredient of analyzedMeal.ingredients) {
            // Guard against malformed items from the AI
            if (!aiIngredient || typeof aiIngredient.name !== 'string' || typeof aiIngredient.quantityGrams !== 'number') {
                console.warn("Skipping malformed analyzed meal ingredient object:", aiIngredient);
                if (aiIngredient && aiIngredient.name) {
                    unmatchedIngredientNames.push(aiIngredient.name);
                }
                continue;
            }

            const match = findBestMatch(aiIngredient.name, foodDb);
            if (match) {
                const nutrients = calculateNutrientsForIngredientQuantity(match, aiIngredient.quantityGrams);
                if (nutrients) {
                    matchedIngredients.push({
                        ...nutrients,
                        foodItemId: match.id,
                        foodItemName: match.name,
                        quantityGram: aiIngredient.quantityGrams,
                        originalServingSize: match.servingSize,
                        confidence: aiIngredient.confidence || 0.5
                    });
                } else {
                     unmatchedIngredientNames.push(`${aiIngredient.name} (لا يمكن حساب القيم)`);
                }
            } else {
                unmatchedIngredientNames.push(aiIngredient.name);
            }
        }
    }

    const totalMacros = calculateTotalRecipeMacros(matchedIngredients);

    return {
        matchedIngredients,
        unmatchedIngredientNames,
        totalMacros
    };
};