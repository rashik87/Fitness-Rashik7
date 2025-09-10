

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AiGeneratedRecipe, RecipeCategory, FoodItem, AiAnalyzedMeal, Macros, Recipe, DietProtocol, AiGeneratedMealSlot, WeightEntry, UserData, CarbCycleDayType, RecipeTag } from '../types';

let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
    if (!aiInstance) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API Key not found. The API_KEY environment variable is not set.");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

// Helper function to safely parse JSON from AI response, handling markdown fences and errors.
const parseJsonResponse = <T>(jsonText: string, functionName: string): T => {
    let textToParse = jsonText.trim();
    // Strip markdown code fences if they exist
    const jsonMatch = textToParse.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        textToParse = jsonMatch[1];
    }

    try {
        return JSON.parse(textToParse) as T;
    } catch (error) {
        console.error(`Error parsing JSON in ${functionName}:`, error);
        console.error("Original text from AI:", jsonText);
        throw new Error(`Failed to parse JSON response from AI in ${functionName}.`);
    }
};

const handleAiError = (error: unknown, userFacingAction: string): Error => {
    console.error(`Error during AI Action (${userFacingAction}):`, error);
    let errorMessage = `حدث خطأ أثناء ${userFacingAction}.`; // Default message
    if (error instanceof Error) {
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes('api_key') || lowerMessage.includes('permission')) {
            errorMessage = "حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقًا.";
        } else if (lowerMessage.includes('quota')) {
            errorMessage = "تم تجاوز حد الاستخدام اليومي للخدمة. يرجى المحاولة مرة أخرى غدًا.";
        } else if (lowerMessage.includes('429')) {
            errorMessage = "الخدمة مشغولة حاليًا. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
        } else if (lowerMessage.includes('network') || lowerMessage.includes('failed to fetch')) {
            errorMessage = "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
        } else if (lowerMessage.includes('json')) {
             errorMessage = "استجابة غير متوقعة من الخادم. يرجى المحاولة مرة أخرى.";
        } else {
             errorMessage = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
        }
    }
    return new Error(errorMessage);
};


const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: {
            type: Type.STRING,
            description: 'The name of the recipe in Arabic.'
        },
        description: {
            type: Type.STRING,
            description: 'A short, enticing description of the dish, 1-2 sentences, in Arabic.'
        },
        servings: {
            type: Type.INTEGER,
            description: 'The number of servings this recipe makes.'
        },
        category: {
            type: Type.STRING,
            description: `The category of the meal. Must be one of: ${Object.values(RecipeCategory).join(', ')}.`,
            enum: Object.values(RecipeCategory)
        },
        ingredients: {
            type: Type.ARRAY,
            description: 'An array of all ingredients with their names and quantities in grams.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: 'The name of the ingredient in Arabic, e.g., "صدر دجاج". Use common, specific names found in a food database.'
                    },
                    quantityGrams: {
                        type: Type.INTEGER,
                        description: 'The quantity of the ingredient in grams, e.g., 200.'
                    }
                },
                required: ['name', 'quantityGrams']
            }
        },
        instructions: {
            type: Type.STRING,
            description: 'The step-by-step instructions for preparing the recipe in Arabic. Use numbered steps. Example: "1. قم بطهي الدجاج.\\n2. أضف الأرز."'
        }
    },
    required: ['recipeName', 'description', 'servings', 'category', 'ingredients', 'instructions']
};

const foodItemSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: 'The specific name of the food in Arabic.'
        },
        calories: {
            type: Type.NUMBER,
            description: 'Calories per 100 grams.'
        },
        protein: {
            type: Type.NUMBER,
            description: 'Protein in grams per 100 grams.'
        },
        carbs: {
            type: Type.NUMBER,
            description: 'Carbohydrates in grams per 100 grams.'
        },
        fat: {
            type: Type.NUMBER,
            description: 'Fat in grams per 100 grams.'
        },
        servingSize: {
            type: Type.STRING,
            description: 'The serving size, which must be "100 جرام".'
        }
    },
    required: ['name', 'calories', 'protein', 'carbs', 'fat', 'servingSize']
};

const multiDayMealPlanSchema = {
    type: Type.OBJECT,
    properties: {
        days: {
            type: Type.ARRAY,
            description: "An array representing each day of the meal plan.",
            items: {
                type: Type.OBJECT,
                properties: {
                    dayIndex: { type: Type.INTEGER, description: "The index of the day, starting from 0." },
                    meals: {
                        type: Type.ARRAY,
                        description: "The list of meals for this day.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                recipeId: { type: Type.STRING, description: 'The unique ID of the recipe to be used for this meal slot.' },
                                quantityOfRecipeServings: { type: Type.NUMBER, description: 'The number of servings of this recipe to consume. Can be a fraction like 1.5.' }
                            },
                            required: ['recipeId', 'quantityOfRecipeServings']
                        }
                    }
                },
                required: ['dayIndex', 'meals']
            }
        }
    },
    required: ['days']
};


interface GenerateRecipeParams {
    ingredients: string; // Can be a list of ingredients or a recipe name
    mealType: string;
    dietStyle: string;
    minCalories?: number;
    maxCalories?: number;
    foodDb: FoodItem[];
}

export const generateRecipeWithAi = async ({
    ingredients,
    mealType,
    dietStyle,
    minCalories,
    maxCalories,
    foodDb,
}: GenerateRecipeParams): Promise<AiGeneratedRecipe> => {
    const ai = getAi();
    
    let caloriePromptSegment = '';
    if (minCalories || maxCalories) {
        let constraints = [];
        if (minCalories) constraints.push(`a minimum of ${minCalories} calories per serving`);
        if (maxCalories) constraints.push(`a maximum of ${maxCalories} calories per serving`);
        caloriePromptSegment = `Please also adhere to the following caloric constraint: the recipe should have ${constraints.join(' and ')}. Adjust ingredients and their quantities to meet this.`;
    }
    
    const foodDatabasePromptSegment = foodDb && foodDb.length > 0
    ? `
    **Available Ingredients Database:**
    This is a list of ingredients available in our food database. When generating the recipe, you **MUST** try to use ingredients from this list. This is critical for our system to calculate nutritional information.
    If a user asks for "دجاج", and the list has "صدر دجاج", use "صدر دجاج".
    Available items: [${foodDb.map(item => `"${item.name}"`).join(', ')}]
    `
    : '';


    const prompt = `
        You are a creative chef specializing in healthy cooking. Your task is to generate a recipe based on user input, strictly following all instructions.

        **User's Request:** "${ingredients}"
        **Desired Meal Type:** ${mealType}
        **Dietary Style/Notes:** ${dietStyle || 'any style'}
        ${caloriePromptSegment}
        ${foodDatabasePromptSegment}

        **CRITICAL INSTRUCTIONS (MUST be followed):**
        1.  **Interpret User's Request:** The user might provide a specific dish name (e.g., "healthy lasagna", "كبسة دجاج") or a list of ingredients (e.g., "chicken, tomatoes, rice").
        2.  **Generate a Healthy Recipe:**
            *   If a dish name is provided, create a **healthy version** of that dish. Make smart substitutions (e.g., use brown rice for white, lean protein, more vegetables, less oil).
            *   If a list of ingredients is provided, create a healthy and creative recipe using them. You can add complementary ingredients, but they should also be healthy.
        3.  **Use Provided Database:** When choosing ingredients for the recipe, you **MUST** use the names exactly as they appear in the "Available Ingredients Database" provided above. This is the most important rule. Do not invent new ingredient names if a suitable one exists in the list.
        4.  **Specify Quantities for ALL Ingredients:** For **EVERY SINGLE** ingredient in the final recipe, you **MUST** provide its name and its quantity strictly in **grams**. This is mandatory. For example: "name": "صدر دجاج", "quantityGrams": 200. Do not omit the quantity for any ingredient.
        5.  **Adhere to Constraints:** Strictly follow the meal type, dietary style, and calorie constraints.
        6.  **Format the Output:** Provide the response as a single, valid JSON object that strictly adheres to the provided schema. The entire output must be in Arabic. The 'category' field must strictly match one of the provided enum values (e.g., 'BREAKFAST').
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        
        const jsonText = response.text;
        const generatedData = parseJsonResponse<AiGeneratedRecipe>(jsonText, 'generateRecipeWithAi');

        // Validate the category from the response
        const validCategories = Object.values(RecipeCategory) as string[];
        if (!validCategories.includes(generatedData.category)) {
            // Fallback or correction if AI returns an invalid category
            generatedData.category = RecipeCategory.NONE; 
        }

        return generatedData;

    } catch (error) {
        throw handleAiError(error, 'توليد الوصفة');
    }
};

export const analyzeMealImageWithAi = async (base64Image: string, mealName?: string): Promise<AiAnalyzedMeal> => {
    const ai = getAi();
    
    const prompt = `
    You are an expert nutritionist. Analyze the provided image of a meal.
    ${mealName ? `The user has specified that this meal is called: "${mealName}". Use this as a strong hint.` : ''}
    
    Your task is to identify every food ingredient in the image, estimate its quantity in grams, and assign a confidence score.
    
    CRITICAL INSTRUCTIONS:
    - Be as specific as possible with ingredient names (e.g., "أرز أبيض مطبوخ", not just "أرز").
    - Provide your best estimation for quantities in grams.
    - The confidence score (0.0 to 1.0) should reflect your certainty about both the ingredient's identity and its estimated quantity.
    - Your entire response MUST be a single, valid JSON object that strictly adheres to the following schema:
    {
      "ingredients": [
        {
          "name": "string",
          "quantityGrams": "number",
          "confidence": "number"
        }
      ]
    }
    - Do not include any text, explanations, or markdown outside of the JSON object. The response must be ONLY the JSON.
    - All text within the JSON must be in Arabic.
`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: prompt,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
        });

        let jsonText = '';
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    jsonText = part.text;
                    break;
                }
            }
        }
        
        if (!jsonText) {
             throw new Error("AI response did not contain a text part.");
        }

        return parseJsonResponse<AiAnalyzedMeal>(jsonText, 'analyzeMealImageWithAi');

    } catch (error) {
        throw handleAiError(error, 'تحليل الصورة');
    }
};

export const findNutritionalInfoForFood = async (foodName: string): Promise<Omit<FoodItem, 'id' | 'isCustom' | 'userId'>> => {
    const ai = getAi();
    const prompt = `
        You are a nutritional data specialist. Your task is to provide accurate nutritional information for a given food item.

        **Food Item:** "${foodName}"

        **CRITICAL INSTRUCTIONS:**
        1.  Provide the typical nutritional values for **100 grams** of this food item.
        2.  If the state of the food is ambiguous (e.g., "chicken"), assume the most common preparation (e.g., "cooked, roasted chicken breast").
        3.  Return the data as a single, valid JSON object that strictly adheres to the provided schema. The entire output must be in Arabic.
        4.  The 'name' field in the response should be the specific name you found data for (e.g., if the user asks for 'دجاج', you might return 'صدر دجاج مشوي').
        5.  The 'servingSize' field MUST be "100 جرام".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: foodItemSchema,
            },
        });
        
        const jsonText = response.text;
        const generatedData = parseJsonResponse<any>(jsonText, 'findNutritionalInfoForFood');
        
        return {
            name: generatedData.name,
            calories: Number(generatedData.calories),
            protein: Number(generatedData.protein),
            carbs: Number(generatedData.carbs),
            fat: Number(generatedData.fat),
            servingSize: generatedData.servingSize,
        };
    } catch (error) {
        console.error(`Error finding nutritional info for "${foodName}":`, error);
        throw handleAiError(error, `البحث عن معلومات "${foodName}"`);
    }
};

export const generateMealPlanWithAi = async (
    dailyTargets: { dayIndex: number; targetMacros: Macros; dayType: CarbCycleDayType }[],
    availableRecipes: Recipe[],
    dietProtocol: DietProtocol,
    mealSlots: { slotName: string }[],
    userWeightKg: number,
    averageTargetMacros: Macros | null
): Promise<{ days: { dayIndex: number, meals: AiGeneratedMealSlot[] }[] }> => {
    const ai = getAi();
    
    const simplifiedRecipes = availableRecipes.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        perServingMacros: r.perServingMacros,
        servings: r.servings, // Total servings the recipe makes
        tags: r.tags || [],
        // Ingredients for the TOTAL recipe (for all servings)
        ingredients: r.ingredients.map(i => ({ name: i.foodItemName, totalGrams: i.quantityGram }))
    }));
    
    const mealCount = mealSlots.length;
    const calorieConstraintText = `
    3.  **Apply Meal Calorie Constraints (VERY IMPORTANT):**
        - Each meal's final calorie count **MUST** be greater than or equal to 250 kcal. This is a strict minimum.
        - ${mealCount > 3 ? "Each meal's final calorie count **MUST** be less than or equal to 750 kcal. This is a strict maximum." : "**EXCEPTION:** Since there are 3 or fewer meals per day, the 750 kcal upper limit can be ignored if necessary to meet the daily total calorie goal. The 250 kcal minimum still applies."}
        - You must achieve this by adjusting the 'quantityOfRecipeServings' for each recipe.
    `;

    let dietConstraint = '';
    if (dietProtocol === DietProtocol.KETO) {
        dietConstraint = 'The user is on a strict KETO diet. This is the highest priority constraint. You MUST select recipes that result in very low daily carbohydrate intake. The provided recipe list has been pre-filtered to only include recipes tagged as "keto" or "low_carb". You MUST use them to construct the plan. Recipes with category \'NONE\' are perfectly acceptable for any meal slot (like lunch or dinner) as long as they are tagged appropriately.';
    } else if (dietProtocol === DietProtocol.CARB_CYCLING && averageTargetMacros) {
        dietConstraint = `The user is on a Carb Cycling diet. This protocol involves alternating between high, medium, and low carbohydrate days to optimize performance and fat loss.
        **Primary Objective - Daily Precision:** You MUST adhere strictly to the specific calorie and macro targets for EACH individual day as listed in the "User's Daily Goals". High-carb days should be treated as training days.
        **Secondary Objective - Weekly Balance:** While respecting the daily targets, you must also ensure that the **average daily carbohydrate intake over the entire ${dailyTargets.length}-day plan is as close as possible to the user's average target of ${averageTargetMacros.carbs.toFixed(0)} grams.** This means you should subtly balance your choices across the week.`;
    }

    const prompt = `
        You are an expert diet planner AI. Your task is to create a multi-day meal plan for a user based on their specific nutritional targets and available recipes, strictly following all rules.

        **User's Weight:** ${userWeightKg.toFixed(1)} kg.
        **Number of Days:** ${dailyTargets.length}
        **Meal Structure per Day:** ${mealSlots.length} meals per day, with slots: ${mealSlots.map(s => `"${s.slotName}"`).join(', ')}

        **User's Daily Goals:**
        ${dailyTargets.map(d => `- Day ${d.dayIndex + 1} (Type: ${d.dayType}): Calories: ${d.targetMacros.calories.toFixed(0)}, Protein: ${d.targetMacros.protein.toFixed(0)}g, Carbs: ${d.targetMacros.carbs.toFixed(0)}g, Fat: ${d.targetMacros.fat.toFixed(0)}g`).join('\n')}

        **Dietary Protocol:** ${dietProtocol}. ${dietConstraint}
        
        **Available Recipes (You MUST use ONLY these recipes):**
        \`\`\`json
        ${JSON.stringify(simplifiedRecipes, null, 2)}
        \`\`\`

        **CRITICAL INSTRUCTIONS:**
        1.  **Create a Plan for ALL ${dailyTargets.length} Days.** Your output JSON's "days" array must contain an object for each day, from dayIndex 0 to ${dailyTargets.length - 1}.
        2.  **Achieve Extreme Precision for EACH Day:** For each day, you must meticulously adjust the 'quantityOfRecipeServings' for each meal to meet that specific day's calorie and macro targets with high accuracy. Total calories for each day **MUST** be within **30 calories** (plus or minus) of that day's target. All macronutrients (Protein, Carbs, Fat) **MUST** be within **5-10 grams** of that day's target for each. Achieving these targets is the most important rule.
        ${calorieConstraintText}
        4.  **Maximize Variety & Avoid Repetition (HIGHEST PRIORITY):** You **MUST** maximize variety across the entire plan.
            *   **Diversify Sources:** Actively try to vary the sources of protein, carbs, and fats between days.
            *   **Avoid Repetition:** A single recipe should not appear more than twice in the entire plan if a sufficient number of alternative recipes are available. Avoid using the same recipe twice on the same day. Do not use the same recipe on consecutive days.
        5.  **Strictly Use Provided Recipes:** You **MUST** select recipes exclusively from the "Available Recipes" list above. Use the provided 'id' for each recipe in your response.
        6.  **Match Meal Slots to Diet and Categories:** Assign recipes to meal slots logically based on their category (e.g., 'BREAKFAST' for the first meal). For Keto, you MUST prioritize recipes with the 'keto' tag over 'low_carb' if available. For Carb Cycling, use higher carb recipes on high-carb days and lower carb recipes on low-carb days.
        7.  **Calculate Servings:** For each chosen recipe, you must calculate the precise 'quantityOfRecipeServings' needed. This can be a whole number or a fraction (e.g., 1.5).
        8.  **Match Meal Count:** Each day in the final plan must contain exactly ${mealSlots.length} meal items.
        9.  **Snack Serving Limit:** If you select a recipe with the category 'SNACK', you **MUST NOT** set its 'quantityOfRecipeServings' to a value greater than 1.5. If the calorie targets are not met because of this limitation, you must increase the 'quantityOfRecipeServings' of other non-snack meals to compensate.
        10. **Tuna Consumption Limit (STRICT SAFETY RULE):** The user's weight is ${userWeightKg.toFixed(1)} kg. To avoid potential mercury overconsumption, you must strictly limit tuna.
            *   **General Limit:** The total amount of tuna used across the entire plan **MUST NOT EXCEED ${(userWeightKg * 1.5).toFixed(0)} grams**.
            *   **Enforcement:** The sum of tuna grams from all meals in the entire plan must not exceed the calculated limit. **This safety rule is more important than hitting the macro targets perfectly.** If you are about to exceed the limit, you **MUST** choose a different recipe instead of the tuna recipe.
        11. **JSON Output:** Your response MUST be a valid JSON object that strictly adheres to the provided schema. Do not include any other text, explanations, or markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: multiDayMealPlanSchema,
            },
        });
        
        const jsonText = response.text;
        return parseJsonResponse(jsonText, 'generateMealPlanWithAi');
    } catch (error) {
        throw handleAiError(error, 'توليد خطة الوجبات');
    }
};

export const getPlateauAdviceWithAi = async (
    progressEntries: WeightEntry[],
    userData: UserData,
    userTargetMacros: Macros,
    dietProtocol: DietProtocol,
    initialTdee: number | null
): Promise<string> => {
    const ai = getAi();
    
    const latestEntry = progressEntries[0] || null;
    const dietDurationInWeeks = progressEntries.length > 1 
        ? Math.round((new Date(progressEntries[0].date).getTime() - new Date(progressEntries[progressEntries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24 * 7))
        : 0;

    const prompt = `
**المهمة:**
أنت خبير تغذية ولياقة بدنية متقدم ("مساعد رشيق"). مهمتك هي تحليل بيانات المستخدم بدقة لتشخيص حالة **ثبات الوزن (Plateau)** وتقديم خطة عملية، متعددة الخيارات، ومحفزة لكسر هذا الثبات، بناءً على المنطق الصارم التالي.

**بيانات المستخدم لتحليلها:**
- **الإحصائيات الشخصية:** ${JSON.stringify(userData)}
${latestEntry?.bodyFatPercentage ? `- **آخر نسبة دهون مسجلة:** ${latestEntry.bodyFatPercentage}%` : ''}
- **مدة الالتزام بالخطة (تقريبي):** ${dietDurationInWeeks} أسابيع
- **البروتوكول الغذائي الحالي:** ${dietProtocol}
- **الماكروز اليومية المستهدفة (لخسارة الوزن):** ${JSON.stringify(userTargetMacros)}
${initialTdee ? `- **سعرات الصيانة المقدرة (TDEE):** ${initialTdee.toFixed(0)} سعرة حرارية` : ''}
- **سجل التقدم الكامل (الأحدث أولاً):** ${JSON.stringify(progressEntries)}

---

**منطق التحليل والتدخل الصارم (يجب اتباعه بالترتيب):**

**الخطوة 1: تحليل الحالة (اختر الحالة التي تنطبق أولاً وتوقف عندها):**

*   **الحالة 1: إعادة تركيب الجسم (Body Recomposition) - نجاح!**
    *   **الشرط:** إذا كان الوزن ثابتًا خلال آخر 21 يومًا، ولكن **محيط الخصر** في أحدث القياسات **انخفض** بمقدار 1 سم أو أكثر مقارنة بالقياسات السابقة.
    *   **الإجراء:** **يجب أن تكون إجابتك تهنئة فقط.** اشرح للمستخدم أنه يحقق أفضل نتيجة ممكنة: فقدان الدهون مع بناء العضلات. أكد له أن هذا ليس ثباتًا، بل هو نجاح. **توقف هنا ولا تقترح أي تغييرات على الخطة.**
    *   **مثال للرد:** "تهانينا! ملاحظاتك تظهر أن وزنك ثابت، لكن قياسات خصرك تتناقص. هذه علامة ممتازة على **إعادة تركيب الجسم**، حيث تفقد دهونًا وتكتسب كتلة عضلية في نفس الوقت. استمر على خطتك الحالية، فأنت تحقق نتائج رائعة!"

*   **الحالة 2: عدم الالتزام المحتمل.**
    *   **الشرط:** إذا كان الوزن ثابتًا أو يزداد، و**مقاسات الجسم تزداد**، ونسبة الدهون (إذا كانت متوفرة) ترتفع.
    *   **الإجراء:** **لا تقترح حلولًا متقدمة.** ذكّر المستخدم بلطف بأهمية الالتزام بالأساسيات.
    *   **مثال للرد:** "لاحظت أن وزنك ومقاساتك ثابتة أو في ازدياد. قبل إجراء أي تغييرات كبيرة، من المهم أن نتأكد من التزامنا بالخطة. هل تتتبع سعراتك بدقة باستخدام ميزان الطعام؟ وهل تحافظ على مستوى نشاطك؟ دعنا نركز على هذه الأساسيات أولاً."

*   **الحالة 3: ثبات غامض (متابعة مطلوبة).**
    *   **الشرط:** إذا كان الوزن ثابتًا، ولكن المقاسات تنقص بشكل **طفيف جدًا** (أقل من 1 سم).
    *   **الإجراء:** انصح المستخدم بالصبر والمتابعة لمدة أسبوعين إضافيين.
    *   **مثال للرد:** "يبدو أن هناك حركة طفيفة جدًا في مقاساتك مع ثبات الوزن. هذا قد يكون بداية لكسر الثبات. أقترح أن نستمر بنفس الخطة لمدة أسبوعين آخرين ونراقب النتائج عن كثب قبل اتخاذ قرار بتغيير الخطة."

*   **الحالة 4: ثبات حقيقي (مطلوب تدخل).**
    *   **الشرط:** إذا كان الوزن والمقاسات ونسبة الدهون كلها ثابتة لمدة **21 يومًا أو أكثر**، ولم تنطبق أي من الحالات السابقة.
    *   **الإجراء:** انتقل إلى **الخطوة 2** لتقديم الحلول.

**الخطوة 2: تقديم الحلول (فقط للحالة 4 - الثبات الحقيقي):**

1.  **ابدأ برسالة داعمة:** ابدأ دائمًا برسالة مطمئنة مثل: "📌 لاحظت أن وزنك ثابت منذ 21 يوم. هذا أمر طبيعي جدًا ويحدث حتى مع أفضل التزام. لا تقلق، لدينا عدة استراتيجيات فعالة لكسر الثبات."
2.  **قدم قائمة تحقق من الالتزام:** اطلب من المستخدم مراجعة هذه النقاط:
    *   حساب السعرات والماكروز بدقة (باستخدام ميزان الطعام).
    *   النشاط اليومي (خطوات، كارديو، تمارين مقاومة).
    *   النوم (7–9 ساعات) وإدارة التوتر.
3.  **قدم الحلول المقترحة (Refeed, Diet Break, Mini Cut):** حلل بيانات المستخدم وقدم **فقط** الحلول المناسبة له بناءً على الشروط التالية.

    *   **1️⃣ Refeed Day (يوم التغذية المرتفعة):**
        *   **الشرط لتقديمه:** (الوزن ثابت ≥ 2-3 أسابيع) **و** (نسبة الدهون منخفضة: <15% للرجال أو <22% للنساء) **و** (المستخدم يشعر بالتعب أو ضعف الأداء).
        *   **إذا كان مناسبًا، اشرحه كالتالي:**
            > "يوم واحد ترفع فيه الكربوهيدرات والسعرات إلى مستوى الصيانة (حوالي ${initialTdee ? initialTdee.toFixed(0) : 'N/A'} سعرة). حافظ على البروتين ثابتًا (1.6–2.2غ/كغ)، وقلل الدهون (20-25% من السعرات). هذا يعيد تنشيط هرمونات الحرق. قد يزيد وزنك مؤقتًا بسبب الماء."

    *   **2️⃣ Diet Break (استراحة من الدايت):**
        *   **الشرط لتقديمه:** (الوزن ثابت ≥ 3 أسابيع مع إرهاق) **أو** (المستخدم يتبع دايت منذ ≥ 8 أسابيع).
        *   **إذا كان مناسبًا، اشرحه كالتالي:**
            > "استراحة لمدة 7–14 يومًا على سعرات الصيانة (حوالي ${initialTdee ? initialTdee.toFixed(0) : 'N/A'} سعرة) لتجديد النشاط وتقليل التوتر الهرموني. حافظ على البروتين ثابتًا (1.6–2.2غ/كغ). بعد الاستراحة، عد إلى خطة نقص السعرات."

    *   **3️⃣ Mini Cut (عجز كبير ومؤقت):**
        *   **الشرط لتقديمه:** (المستخدم أنهى فترة تضخيم (Bulk)) **أو** (يملك نسبة دهون متوسطة إلى عالية ويريد نتائج سريعة). **لا تقترحه إذا كان المستخدم يعاني من إرهاق شديد.**
        *   **إذا كان مناسبًا، اشرحه كالتالي:**
            > "خطة قصيرة ومكثفة (2–6 أسابيع) لفقدان الدهون السريع. قم بزيادة العجز في السعرات إلى 25-35% من سعرات الصيانة. ارفع البروتين (2–2.2غ/كغ)، وحافظ على تمارين المقاومة مع إضافة 2-3 جلسات كارديو. بعد انتهاء الفترة، عد إلى سعرات الصيانة."

4.  **اختتم بنموذج الرسالة:** بعد شرح الخيارات المناسبة، اختتم برسالة موجزة مثل:
    > "اختر الخطة التي تناسب هدفك وحالتك الحالية، والتزم بها لمدة 2-3 أسابيع لنرى النتائج ✨"

---

**شروط الإخراج:**
- **اللغة:** الرد بالكامل باللغة العربية الفصحى المبسطة.
- **النبرة:** كن خبيرًا، داعمًا، ومحفزًا.
- **التنسيق:** استخدم Markdown بفعالية (bold, lists, emojis) لتنظيم النص وجعله سهل القراءة.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating plateau advice with AI:", error);
        throw handleAiError(error, 'توليد نصيحة لكسر الثبات');
    }
};