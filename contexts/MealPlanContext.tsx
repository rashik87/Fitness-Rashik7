
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { FullMealPlan, Recipe, SavedMealPlan, CarbCycleDayType, Macros, DietProtocol, RecipeCategory, RecipeTag, DayPlan } from '../types';
import { useUI } from './UIContext';
import { useData } from './DataContext';
import { useCalculator } from './CalculatorContext';
import { useAuth } from './AuthContext';
import * as CalorieService from '../services/calorieService';
import { generateMealPlanWithAi } from '../services/aiService';
import { 
    PLAN_ADJUSTED_SUCCESSFULLY, PLAN_ADJUSTMENT_ERROR_NO_TARGET_MACROS, PLAN_ADJUSTMENT_ERROR_NO_RECIPES, PLAN_ADJUSTMENT_ERROR_ZERO_CALORIES, 
    DAILY_LIMIT_REACHED_ERROR, FREE_TIER_PLAN_GENERATION_LIMIT, PLAN_LOADED_SUCCESS, GENERATING_AI_PLAN_MESSAGE, 
    AI_PLAN_GENERATED_SUCCESS, AI_PLAN_GENERATION_ERROR, MIN_RECIPES_FOR_PLAN_ERROR, 
    INSUFFICIENT_RECIPES_MULTI_DAY_WARNING, PLAN_3_RECIPES_PARTIAL_FILL_NOTICE 
} from '../constants';

interface GenerationStatus {
    isLoading: boolean;
    message: string;
    currentDay: number;
    totalDays: number;
}

interface MealPlanContextType {
  fullMealPlan: FullMealPlan | null;
  isSelectRecipeModalOpen: boolean;
  setIsSelectRecipeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  planForDetailView: SavedMealPlan | null;
  setPlanForDetailView: React.Dispatch<React.SetStateAction<SavedMealPlan | null>>;
  generationStatus: GenerationStatus;

  handlePlanSetupChange: (numDays: number, numMeals: number) => void;
  handleOpenSelectRecipeModal: (dayIndex: number, mealId: string) => void;
  handleAssignRecipe: (recipe: Recipe) => void;
  handleUpdateRecipeServings: (dayIndex: number, mealId: string, newServings: number) => void;
  handleSetDayType: (dayIndex: number, dayType: CarbCycleDayType) => void;
  handleAdjustDayPlan: (dayIndex: number) => void;
  handleGenerateFullPlan: () => Promise<void>;
  handleViewDetails: () => void;
  handleViewSavedPlanDetails: (planId: string) => void;
  handleLoadPlan: (planId: string) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

const getMealSlotName = (mealIndex: number, totalMeals: number): string => {
    if (totalMeals <= 1) return 'وجبة واحدة';
    if (totalMeals === 2) {
        return mealIndex === 0 ? 'فطور' : 'عشاء';
    }
    if (totalMeals === 3) {
        if (mealIndex === 0) return 'فطور';
        if (mealIndex === 1) return 'غداء';
        return 'عشاء';
    }
    if (totalMeals === 4) {
        if (mealIndex === 0) return 'فطور';
        if (mealIndex === 1) return 'غداء';
        if (mealIndex === 2) return 'وجبة خفيفة';
        return 'عشاء';
    }
    if (totalMeals === 5) {
        if (mealIndex === 0) return 'فطور';
        if (mealIndex === 1) return 'وجبة خفيفة صباحية';
        if (mealIndex === 2) return 'غداء';
        if (mealIndex === 3) return 'وجبة خفيفة مسائية';
        return 'عشاء';
    }
    if (totalMeals >= 6) {
        if (mealIndex === 0) return 'فطور';
        if (mealIndex === 1) return 'وجبة خفيفة صباحية';
        if (mealIndex === 2) return 'غداء';
        if (mealIndex === 3) return 'وجبة خفيفة مسائية';
        if (mealIndex === 4) return 'عشاء';
        if (mealIndex === 5) return 'وجبة خفيفة ليلية';
    }
    return `الوجبة ${mealIndex + 1}`;
};


export const MealPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isPremium } = useAuth();
    const { showTemporaryNotification, setCurrentView } = useUI();
    const { allRecipes, dailyUsage, incrementPlanGenerations, savedMealPlans } = useData();
    const { userTargetMacros, selectedDiet, finalTdee, goalSettings, userData } = useCalculator();

    const [fullMealPlan, setFullMealPlan] = useState<FullMealPlan | null>(null);
    const [isSelectRecipeModalOpen, setIsSelectRecipeModalOpen] = useState(false);
    const [mealSlotToAssign, setMealSlotToAssign] = useState<{ dayIndex: number; mealId: string } | null>(null);
    const [planForDetailView, setPlanForDetailView] = useState<SavedMealPlan | null>(null);
    const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
        isLoading: false,
        message: '',
        currentDay: 0,
        totalDays: 0,
    });

    const adjustDayPlan = (dayPlan: DayPlan): DayPlan | null => {
        if (!finalTdee || !goalSettings || !userData) {
            showTemporaryNotification('error', PLAN_ADJUSTMENT_ERROR_NO_TARGET_MACROS);
            return null;
        }
    
        if (!dayPlan.meals.every(m => m.assignedRecipeId && m.recipeSnapshot)) {
            showTemporaryNotification('error', PLAN_ADJUSTMENT_ERROR_NO_RECIPES);
            return null;
        }
    
        const dayTypeForCalc = selectedDiet === DietProtocol.CARB_CYCLING ? dayPlan.dayType : 'normal';
        const targetMacros = CalorieService.calculateMacros(finalTdee, selectedDiet, goalSettings.goal, userData, dayTypeForCalc);
    
        if (!targetMacros) {
            showTemporaryNotification('error', PLAN_ADJUSTMENT_ERROR_NO_TARGET_MACROS);
            return null;
        }

        const minCaloriesPerMeal = 250;
        const maxCaloriesPerMeal = dayPlan.meals.length <= 3 ? Infinity : 750;
    
        let adjustedMeals = JSON.parse(JSON.stringify(dayPlan.meals));
    
        const calculateTotalMacros = (meals: any[]): Macros => {
            return meals.reduce((totals, meal) => {
                if (meal.recipeSnapshot?.perServingMacros) {
                    totals.calories += meal.recipeSnapshot.perServingMacros.calories * meal.quantityOfRecipeServings;
                    totals.protein += meal.recipeSnapshot.perServingMacros.protein * meal.quantityOfRecipeServings;
                    totals.carbs += meal.recipeSnapshot.perServingMacros.carbs * meal.quantityOfRecipeServings;
                    totals.fat += meal.recipeSnapshot.perServingMacros.fat * meal.quantityOfRecipeServings;
                }
                return totals;
            }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        };
    
        let currentTotalMacros = calculateTotalMacros(adjustedMeals);
        if (currentTotalMacros.calories <= 0) {
            showTemporaryNotification('error', PLAN_ADJUSTMENT_ERROR_ZERO_CALORIES);
            return null;
        }
    
        const initialScalingFactor = targetMacros.calories / currentTotalMacros.calories;
        adjustedMeals.forEach((meal: any) => {
            meal.quantityOfRecipeServings = Math.max(0.01, meal.quantityOfRecipeServings * initialScalingFactor);
        });
    
        const constraintIterations = 5;
        for (let i = 0; i < constraintIterations; i++) {
            const clampedMeals: any[] = [];
            const unclampedMeals: any[] = [];
            
            adjustedMeals.forEach((meal: any) => {
                if (!meal.recipeSnapshot || meal.recipeSnapshot.perServingMacros.calories <= 0) return;
                const mealCalories = meal.quantityOfRecipeServings * meal.recipeSnapshot.perServingMacros.calories;
                if (mealCalories < minCaloriesPerMeal || mealCalories > maxCaloriesPerMeal) {
                    clampedMeals.push(meal);
                } else {
                    unclampedMeals.push(meal);
                }
            });

            if (clampedMeals.length === 0 && i > 0) break; 

            let totalCaloriesOfClamped = 0;
            clampedMeals.forEach((meal: any) => {
                const mealCalories = meal.quantityOfRecipeServings * meal.recipeSnapshot.perServingMacros.calories;
                if (mealCalories < minCaloriesPerMeal) {
                    meal.quantityOfRecipeServings = minCaloriesPerMeal / meal.recipeSnapshot.perServingMacros.calories;
                } else if (mealCalories > maxCaloriesPerMeal) {
                    meal.quantityOfRecipeServings = maxCaloriesPerMeal / meal.recipeSnapshot.perServingMacros.calories;
                }
                totalCaloriesOfClamped += meal.quantityOfRecipeServings * meal.recipeSnapshot.perServingMacros.calories;
            });
            
            if (unclampedMeals.length > 0) {
                const totalCaloriesOfUnclamped = unclampedMeals.reduce((sum, meal) => sum + (meal.quantityOfRecipeServings * meal.recipeSnapshot.perServingMacros.calories), 0);
                const remainingTargetCalories = targetMacros.calories - totalCaloriesOfClamped;
                
                if (totalCaloriesOfUnclamped > 0 && remainingTargetCalories > 0) {
                    const redistributionFactor = remainingTargetCalories / totalCaloriesOfUnclamped;
                    unclampedMeals.forEach((meal: any) => {
                        meal.quantityOfRecipeServings *= redistributionFactor;
                    });
                }
            }
             adjustedMeals = [...clampedMeals, ...unclampedMeals];
        }

        let finalMacros = calculateTotalMacros(adjustedMeals);
        if (finalMacros.calories > 0) {
             const finalScaling = targetMacros.calories / finalMacros.calories;
             adjustedMeals.forEach((meal: any) => {
                meal.quantityOfRecipeServings *= finalScaling;
                if(meal.recipeSnapshot && meal.recipeSnapshot.perServingMacros.calories > 0) {
                    const finalMealCalories = meal.quantityOfRecipeServings * meal.recipeSnapshot.perServingMacros.calories;
                    if (finalMealCalories < minCaloriesPerMeal) {
                        meal.quantityOfRecipeServings = minCaloriesPerMeal / meal.recipeSnapshot.perServingMacros.calories;
                    }
                }
            });
        }
    
        return { ...dayPlan, meals: adjustedMeals };
    };


    const handlePlanSetupChange = (numDays: number, numMeals: number) => {
        const newPlan: FullMealPlan = Array.from({ length: numDays }, (_, dayIndex) => {
             let dayType: CarbCycleDayType = 'normal';
             if (selectedDiet === DietProtocol.CARB_CYCLING) {
                // Alternate between low and high, starting with low to prioritize fat loss
                dayType = dayIndex % 2 === 0 ? 'low' : 'high';
            }
            return {
                dayIndex,
                dayType,
                meals: Array.from({ length: numMeals }, (_, mealIndex) => ({
                    id: `d${dayIndex}m${mealIndex}`,
                    slotName: getMealSlotName(mealIndex, numMeals),
                    assignedRecipeId: null,
                    quantityOfRecipeServings: 1,
                    recipeSnapshot: null
                }))
            }
        });
        setFullMealPlan(newPlan);
        setPlanForDetailView(null);
    };
    
    const handleOpenSelectRecipeModal = (dayIndex: number, mealId: string) => {
        setMealSlotToAssign({ dayIndex, mealId });
        setIsSelectRecipeModalOpen(true);
    };

    const handleAssignRecipe = (recipe: Recipe) => {
        if (!fullMealPlan || !mealSlotToAssign) return;
        const { dayIndex, mealId } = mealSlotToAssign;
        
        const newPlan = fullMealPlan.map((day, dIdx) => {
            if (dIdx !== dayIndex) return day;
            
            const newMeals = day.meals.map(meal => {
                if (meal.id !== mealId) return meal;
                
                return {
                    ...meal,
                    assignedRecipeId: recipe.id,
                    recipeSnapshot: {
                        id: recipe.id,
                        name: recipe.name,
                        imageUrl: recipe.imageUrl,
                        perServingMacros: recipe.perServingMacros,
                        ingredients: recipe.ingredients,
                        definedServingsInRecipe: recipe.servings,
                    },
                    quantityOfRecipeServings: 1,
                };
            });
            return { ...day, meals: newMeals };
        });
        
        setFullMealPlan(newPlan);
        setMealSlotToAssign(null);
    };

    const handleUpdateRecipeServings = (dayIndex: number, mealId: string, newServings: number) => {
        if (!fullMealPlan || isNaN(newServings) || newServings < 0) return;
        
        const newPlan = fullMealPlan.map((day, dIdx) => {
            if (dIdx !== dayIndex) return day;
            const newMeals = day.meals.map(meal => 
                meal.id === mealId ? { ...meal, quantityOfRecipeServings: newServings } : meal
            );
            return { ...day, meals: newMeals };
        });
        setFullMealPlan(newPlan);
    };

    const handleSetDayType = (dayIndex: number, dayType: CarbCycleDayType) => {
        if (!fullMealPlan) return;
        const newPlan = [...fullMealPlan];
        newPlan[dayIndex] = {...newPlan[dayIndex], dayType };
        setFullMealPlan(newPlan);
    };

    const handleAdjustDayPlan = (dayIndex: number) => {
        if (!fullMealPlan) return;
        if (!isPremium && dailyUsage.planGenerations >= FREE_TIER_PLAN_GENERATION_LIMIT) {
             showTemporaryNotification('error', DAILY_LIMIT_REACHED_ERROR("توليد الخطط", FREE_TIER_PLAN_GENERATION_LIMIT));
             return;
        }
    
        const dayPlanToAdjust = fullMealPlan[dayIndex];
        const adjustedDay = adjustDayPlan(dayPlanToAdjust);
    
        if (adjustedDay) {
            const newPlan = [...fullMealPlan];
            newPlan[dayIndex] = adjustedDay;
            setFullMealPlan(newPlan);
            
            if (!isPremium) {
                incrementPlanGenerations();
            }
            showTemporaryNotification('success', PLAN_ADJUSTED_SUCCESSFULLY);
        }
    };

    const handleGenerateFullPlan = async () => {
        if (!fullMealPlan || !userTargetMacros || !userData || !goalSettings || !finalTdee) {
            showTemporaryNotification('error', PLAN_ADJUSTMENT_ERROR_NO_TARGET_MACROS);
            return;
        }
    
        let compliantRecipes = allRecipes;
        if (selectedDiet === DietProtocol.KETO) {
            compliantRecipes = allRecipes.filter(r => 
                r.tags?.includes(RecipeTag.KETO) || r.tags?.includes(RecipeTag.LOW_CARB)
            );
        }

        const recipeCount = compliantRecipes.length;
        const hasBreakfast = compliantRecipes.some(r => r.category === RecipeCategory.BREAKFAST);
        const hasLunch = compliantRecipes.some(r => r.category === RecipeCategory.LUNCH);
        const hasDinner = compliantRecipes.some(r => r.category === RecipeCategory.DINNER);

        let meetsRequirements = false;
        if (selectedDiet === DietProtocol.KETO) {
            meetsRequirements = recipeCount >= 3;
        } else {
            meetsRequirements = recipeCount >= 3 && hasBreakfast && hasLunch && hasDinner;
        }

        if (!meetsRequirements) {
            let errorMessage = MIN_RECIPES_FOR_PLAN_ERROR;
            if (selectedDiet === DietProtocol.KETO) {
                errorMessage = "لإنشاء خطة كيتو، تحتاج إلى 3 وصفات على الأقل تحمل وسم 'كيتو' أو 'قليل الكربوهيدرات'.";
            }
            showTemporaryNotification('error', errorMessage, 8000);
            return;
        }

        const totalDaysInPlan = fullMealPlan.length;
    
        const assignRecipeToMeal = (meal: any, recipe: Recipe) => {
            meal.assignedRecipeId = recipe.id;
            meal.recipeSnapshot = {
                id: recipe.id, name: recipe.name, imageUrl: recipe.imageUrl,
                perServingMacros: recipe.perServingMacros, ingredients: recipe.ingredients,
                definedServingsInRecipe: recipe.servings,
            };
            meal.quantityOfRecipeServings = 1;
        };
    
        if (recipeCount === 3) {
            if (totalDaysInPlan > 1) {
                showTemporaryNotification('error', INSUFFICIENT_RECIPES_MULTI_DAY_WARNING, 8000);
                return;
            }
            const breakfast = compliantRecipes.find(r => r.category === RecipeCategory.BREAKFAST);
            const lunch = compliantRecipes.find(r => r.category === RecipeCategory.LUNCH);
            const dinner = compliantRecipes.find(r => r.category === RecipeCategory.DINNER);
    
            if (!breakfast || !lunch || !dinner) {
                showTemporaryNotification('error', 'للتوزيع التلقائي، يجب تصنيف وصفاتك الثلاث كـ "فطور"، "غداء"، و "عشاء" بالضبط.');
                return;
            }
    
            const newPlan = [...fullMealPlan];
            let dayPlan = { ...newPlan[0], meals: newPlan[0].meals.map(m => ({ ...m })) };
    
            if (dayPlan.meals[0]) assignRecipeToMeal(dayPlan.meals[0], breakfast);
            if (dayPlan.meals[1]) assignRecipeToMeal(dayPlan.meals[1], lunch);
            if (dayPlan.meals[2]) assignRecipeToMeal(dayPlan.meals[2], dinner);
    
            for (let i = 3; i < dayPlan.meals.length; i++) {
                dayPlan.meals[i].assignedRecipeId = null;
                dayPlan.meals[i].recipeSnapshot = null;
                dayPlan.meals[i].quantityOfRecipeServings = 1;
            }
            
            const adjustedDay = adjustDayPlan(dayPlan);
            if(adjustedDay) {
                newPlan[0] = adjustedDay;
                setFullMealPlan(newPlan);
                if (!isPremium) incrementPlanGenerations();
                if (dayPlan.meals.length > 3) {
                     showTemporaryNotification('success', PLAN_3_RECIPES_PARTIAL_FILL_NOTICE, 8000);
                } else {
                     showTemporaryNotification('success', PLAN_ADJUSTED_SUCCESSFULLY);
                }
            }
            return;
        }
    
        if (recipeCount >= 4 && recipeCount <= 9) {
            const breakfastRecipes = compliantRecipes.filter(r => r.category === RecipeCategory.BREAKFAST);
            const lunchRecipes = compliantRecipes.filter(r => r.category === RecipeCategory.LUNCH);
            const dinnerRecipes = compliantRecipes.filter(r => r.category === RecipeCategory.DINNER);
    
            if (breakfastRecipes.length === 0 || lunchRecipes.length === 0 || dinnerRecipes.length === 0) {
                 showTemporaryNotification('error', "لإنشاء خطة، يجب أن يكون لديك وصفة واحدة على الأقل لكل من الفطور، الغداء، والعشاء من ضمن الوصفات المتوافقة مع البروتوكول.");
                 return;
            }
    
            let newPlanWithRecipes = fullMealPlan.map(day => ({ ...day, meals: day.meals.map(meal => ({ ...meal })) }));
    
            for (let d = 0; d < totalDaysInPlan; d++) {
                const numMealsPerDay = newPlanWithRecipes[d].meals.length;
                for (let m = 0; m < numMealsPerDay; m++) {
                    let recipeToAssign: Recipe | undefined;
                    if (m === 0) {
                        recipeToAssign = breakfastRecipes[d % breakfastRecipes.length];
                    } else if (m === 1) {
                        recipeToAssign = lunchRecipes[d % lunchRecipes.length];
                    } else if (m === 2) {
                        recipeToAssign = dinnerRecipes[d % dinnerRecipes.length];
                    } else {
                        const snackAndOtherRecipes = compliantRecipes.filter(r => r.category === RecipeCategory.SNACK || r.category === RecipeCategory.NONE);
                        if (snackAndOtherRecipes.length > 0) {
                           recipeToAssign = snackAndOtherRecipes[(d + m) % snackAndOtherRecipes.length];
                        } else {
                           const allMainRecipes = [...breakfastRecipes, ...lunchRecipes, ...dinnerRecipes];
                           recipeToAssign = allMainRecipes[(d + m) % allMainRecipes.length];
                        }
                    }
                    if (recipeToAssign) {
                        assignRecipeToMeal(newPlanWithRecipes[d].meals[m], recipeToAssign);
                    }
                }
            }
    
            const finalAdjustedPlan = newPlanWithRecipes.map(dayPlan => {
                return adjustDayPlan(dayPlan) || dayPlan;
            });
    
            setFullMealPlan(finalAdjustedPlan);
            if (!isPremium) incrementPlanGenerations();
            showTemporaryNotification('success', 'تم توليد الخطة وتعديلها بنجاح لجميع الأيام!');
            return;
        }
    
        if (recipeCount >= 10) {
            setGenerationStatus({
                isLoading: true,
                currentDay: 0,
                totalDays: 0,
                message: GENERATING_AI_PLAN_MESSAGE,
            });

            try {
                const allDailyTargets = fullMealPlan.map((dayPlan, i) => {
                    const targetMacros = CalorieService.calculateMacros(finalTdee, selectedDiet, goalSettings.goal, userData, dayPlan.dayType);
                    if (!targetMacros) {
                        throw new Error(`Could not calculate target macros for day ${i + 1}.`);
                    }
                    return {
                        dayIndex: i,
                        dayType: dayPlan.dayType,
                        targetMacros
                    };
                });

                const aiResult = await generateMealPlanWithAi(
                    allDailyTargets,
                    compliantRecipes,
                    selectedDiet,
                    fullMealPlan[0].meals.map(m => ({ slotName: m.slotName })),
                    userData.weight,
                    userTargetMacros
                );

                if (!aiResult || !aiResult.days || aiResult.days.length !== totalDaysInPlan) {
                    throw new Error("AI did not return a complete plan for all requested days.");
                }

                let finalPlan = [...fullMealPlan].map(day => ({ ...day, meals: day.meals.map(meal => ({ ...meal })) }));

                aiResult.days.forEach(dayResult => {
                    const dayIndex = dayResult.dayIndex;
                    const dayPlan = finalPlan[dayIndex];
                    if (dayPlan && dayResult.meals) {
                        dayResult.meals.forEach((aiMeal, mealIndex) => {
                            if (mealIndex < dayPlan.meals.length) {
                                const recipe = compliantRecipes.find(r => r.id === aiMeal.recipeId);
                                if (recipe) {
                                    assignRecipeToMeal(dayPlan.meals[mealIndex], recipe);
                                    dayPlan.meals[mealIndex].quantityOfRecipeServings = aiMeal.quantityOfRecipeServings;
                                }
                            }
                        });
                        finalPlan[dayIndex] = dayPlan;
                    }
                });
                
                const correctedFinalPlan = finalPlan.map(dayPlan => {
                    return adjustDayPlan(dayPlan) || dayPlan;
                });

                setFullMealPlan(correctedFinalPlan);
                if (!isPremium) incrementPlanGenerations();
                showTemporaryNotification('success', AI_PLAN_GENERATED_SUCCESS);

            } catch (error) {
                 console.error(`Failed to generate multi-day AI meal plan:`, error);
                 if (error instanceof Error) {
                    showTemporaryNotification('error', error.message);
                 } else {
                    showTemporaryNotification('error', `${AI_PLAN_GENERATION_ERROR}`);
                 }
            } finally {
                setGenerationStatus({ isLoading: false, currentDay: 0, totalDays: 0, message: '' });
            }
            return;
        }
    
        showTemporaryNotification('error', "لا يمكن إنشاء خطة تلقائية بهذه الإعدادات. جرب تغيير عدد الوصفات أو الأيام.");
    };

    const handleViewDetails = () => {
        setPlanForDetailView(null);
        setCurrentView('adjustedMealPlanDetail');
    };
    
    const handleViewSavedPlanDetails = (planId: string) => {
        const plan = savedMealPlans.find(p => p.id === planId);
        if (plan) {
            setPlanForDetailView(plan);
            setCurrentView('adjustedMealPlanDetail');
        }
    };
    
    const handleLoadPlan = (planId: string) => {
        const planToLoad = savedMealPlans.find(p => p.id === planId);
        if (planToLoad) {
            setFullMealPlan(planToLoad.plan);
            setPlanForDetailView(null);
            showTemporaryNotification('success', PLAN_LOADED_SUCCESS);
            setCurrentView('recipeDrivenMealPlan');
        }
    };
    
    const contextValue: MealPlanContextType = {
        fullMealPlan, isSelectRecipeModalOpen, setIsSelectRecipeModalOpen, planForDetailView, setPlanForDetailView,
        generationStatus,
        handlePlanSetupChange, handleOpenSelectRecipeModal, handleAssignRecipe, handleUpdateRecipeServings,
        handleSetDayType, handleAdjustDayPlan, handleGenerateFullPlan, handleViewDetails, handleViewSavedPlanDetails, handleLoadPlan
    };
    
    return <MealPlanContext.Provider value={contextValue}>{children}</MealPlanContext.Provider>
};


export const useMealPlan = (): MealPlanContextType => {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};