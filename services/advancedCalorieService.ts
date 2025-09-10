

import { UserData, Goal, Gender, AdvancedPlanResult, Macros, PlanPhase, GoalSettings, PlanPhaseType, PregnancyStatus, MedicalCondition, SportActivity } from '../types';
import { calculateBMR, calculateTDEE, calculateProteinGrams } from './calorieService';
import { ESTIMATED_DURATION_LABEL, MEDICAL_CONDITION_GUIDELINES } from '../constants';

const handleSpecialConsiderations = (userData: UserData, bmr: number, tdee: number): { plan: AdvancedPlanResult | null, baseWarnings: string[], guidelines: string[], isOverridden: boolean } => {
    const { age, gender, pregnancyStatus, medicalConditions, weight } = userData;
    let baseWarnings: string[] = [];
    let guidelines: string[] = [];
    let overridePlan: AdvancedPlanResult | null = null;
    let isOverridden = false;

    // Rule for Children/Teens (< 18)
    if (age < 18) {
        const teenMacros: Macros = {
            calories: Math.round(tdee),
            protein: Math.round(weight * 1.5),
            fat: Math.round((tdee * 0.30) / 9),
            carbs: Math.round((tdee - (weight * 1.5 * 4) - (tdee * 0.30)) / 4),
        };
        const teenPlan: AdvancedPlanResult = {
            targetCalories: teenMacros.calories,
            targetMacros: teenMacros,
            estimatedDuration: "مستمر",
            durationContext: "نمو صحي",
            phases: [{
                type: PlanPhaseType.HEALTH_FOCUS,
                name: "خطة النمو الصحي",
                duration: "مستمرة",
                calories: teenMacros.calories,
                macros: teenMacros,
                notes: [
                    "التركيز على تناول سعرات الصيانة لدعم النمو والتطور.",
                    "تشجيع النشاط البدني المنتظم بدلاً من تقليل السعرات.",
                    "ضمان الحصول على ما لا يقل عن 50% من السعرات من الكربوهيدرات للطاقة."
                ]
            }],
            warnings: [
                "لا يُنصح بخطط خسارة الوزن للأطفال والمراهقين إلا تحت إشراف طبي.",
                "تم تصميم هذه الخطة للحفاظ على الوزن ودعم النمو الصحي."
            ],
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            goal: Goal.MAINTAIN_WEIGHT
        };
        return { plan: teenPlan, baseWarnings: [], guidelines: [], isOverridden: true };
    }
    
    const pregnancyGuidelines = [
        "ممنوع تمامًا اتباع أي رجيم لخسارة الوزن.",
        "تمت إضافة 300-500 سعرة حرارية لدعم نمو الجنين (خاصة في الثلث الثاني والثالث).",
        "تمت زيادة البروتين بمقدار 25 جرامًا يوميًا.",
        "ركزي على الدهون الصحية مثل الأوميغا-3 (من الأسماك، الجوز، وبذور الكتان).",
        "اهتمي بالمغذيات الدقيقة: حمض الفوليك، الحديد، الكالسيوم، وفيتامين D.",
        "تجنبي تمامًا: الكحول، الكافيين المفرط، الأجبان غير المبسترة، واللحوم النيئة أو غير المطهوة جيدًا."
    ];

    const breastfeedingGuidelines = [
        "تمت إضافة 500-650 سعرة حرارية لدعم إنتاج الحليب.",
        "تمت زيادة البروتين بمقدار 25 جرامًا يوميًا.",
        "لا ينصح بخسارة وزن تزيد عن 1% من وزن الجسم أسبوعيًا للحفاظ على إدرار الحليب."
    ];


    // Rules for Pregnancy and Breastfeeding
    if (pregnancyStatus === PregnancyStatus.PREGNANT || pregnancyStatus === PregnancyStatus.BREASTFEEDING) {
        const isPregnant = pregnancyStatus === PregnancyStatus.PREGNANT;
        const calorieAddition = isPregnant ? 400 : 500;
        const proteinAddition = 25;
        const targetCalories = tdee + calorieAddition;
        const healthMacros: Macros = {
            calories: Math.round(targetCalories),
            protein: Math.round(weight * 1.5 + proteinAddition),
            fat: Math.round((targetCalories * 0.30) / 9),
            carbs: Math.round((targetCalories - ((weight * 1.5 + proteinAddition) * 4) - (targetCalories * 0.30)) / 4)
        };
        overridePlan = {
            targetCalories: healthMacros.calories,
            targetMacros: healthMacros,
            estimatedDuration: "مستمر",
            durationContext: isPregnant ? "فترة الحمل" : "فترة الرضاعة",
            phases: [{
                type: PlanPhaseType.HEALTH_FOCUS,
                name: isPregnant ? "خطة صحة الأم والجنين" : "خطة دعم الرضاعة",
                duration: "مستمرة",
                calories: healthMacros.calories,
                macros: healthMacros,
                notes: [
                    `تمت إضافة ~${calorieAddition} سعرة و ${proteinAddition} جرام بروتين لدعم احتياجاتك الحالية.`,
                    "التركيز على جودة الطعام والمغذيات الدقيقة."
                ]
            }],
            warnings: [
                "يجب استشارة الطبيب المشرف قبل اتباع أي خطة غذائية أثناء الحمل أو الرضاعة.",
                `تم إلغاء هدف خسارة الوزن، والتركيز الآن على توفير التغذية الكافية لك و لطفلك.`
            ],
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            goal: Goal.MAINTAIN_WEIGHT,
            guidelines: []
        };
        isOverridden = true;
        if(isPregnant) {
             guidelines.push(`### إرشادات للحمل`, ...pregnancyGuidelines);
        } else {
             guidelines.push(`### إرشادات للرضاعة`, ...breastfeedingGuidelines);
        }
    }
    
    if (pregnancyStatus === PregnancyStatus.MENOPAUSE) {
        baseWarnings.push("في سن اليأس، قد يتباطأ الأيض. من المفيد التركيز على الكالسيوم وفيتامين د لصحة العظام، والبروتين للحفاظ على العضلات.");
    }

    if (medicalConditions && medicalConditions.length > 0) {
        baseWarnings.push("لديك حالات طبية محددة. هذه الخطة هي نقطة انطلاق عامة ويجب تعديلها بعد استشارة طبيبك أو أخصائي تغذية.");
        
        medicalConditions.forEach(condition => {
            const guidelineData = MEDICAL_CONDITION_GUIDELINES[condition];
             if (guidelineData && guidelineData.points.length > 0) {
                guidelines.push(`### ${guidelineData.title}`);
                guidelines.push(...guidelineData.points);
             }
        });
    }
    
    if (isOverridden && overridePlan) {
        overridePlan.warnings.push(...baseWarnings);
        overridePlan.guidelines = guidelines;
        return { plan: overridePlan, baseWarnings: [], guidelines: [], isOverridden: true };
    }

    return { plan: null, baseWarnings, guidelines, isOverridden: false };
};


const addActivityRecommendations = (phases: PlanPhase[], userData: UserData): PlanPhase[] => {
    const isAthlete = userData.sportActivity && ![
        SportActivity.GENERAL_FITNESS, 
        SportActivity.YOGA_PILATES
    ].includes(userData.sportActivity);
    
    if (isAthlete) {
        // Progressive overload for athletes
        return phases.map((phase, index) => {
            if (phase.type === PlanPhaseType.DIET_BREAK || phase.type === PlanPhaseType.HEALTH_FOCUS) {
                return { ...phase, activityRecommendation: "خلال هذه المرحلة، ركز على التعافي. يمكنك تقليل شدة التمارين أو حجمها (deload) للحفاظ على النشاط مع السماح لجسمك بالراحة." };
            }
            
            let recommendation = '';
            if (index < 2) { 
                recommendation = "ركز على إتقان الأداء الحركي. حاول الحفاظ على أوزانك مع تحسين التحكم. ابدأ بـ 2-3 جلسات كارديو أسبوعيًا (20-30 دقيقة).";
            } else if (index < 4) {
                recommendation = "ابدأ بتطبيق الحمل التدريجي. استهدف زيادة الأوزان بنسبة 2-5% في تمارينك الأساسية، أو زيادة عدة (rep) واحدة. يمكنك زيادة مدة الكارديو بـ 5 دقائق.";
            } else {
                recommendation = "استمر في الحمل التدريجي. فكر في تجربة تقنيات متقدمة مثل (Drop Sets) أو زيادة كثافة الكارديو (HIIT) مرة أسبوعيًا للحفاظ على التقدم.";
            }
            return { ...phase, activityRecommendation: recommendation };
        });
    } else {
        // NEAT progression for non-athletes/general fitness
        return phases.map((phase, index) => {
             if (phase.type === PlanPhaseType.DIET_BREAK || phase.type === PlanPhaseType.HEALTH_FOCUS) {
                return { ...phase, activityRecommendation: "حافظ على مستوى نشاطك الحالي. الهدف هو الراحة النفسية والجسدية، لذا استمتع بالحركة دون ضغط لزيادتها." };
            }
            
            let recommendation = '';
             if (index < 2) {
                recommendation = "الهدف هو بناء العادة. حاول المشي 15-20 دقيقة يوميًا وسجل متوسط خطواتك الأسبوعي.";
            } else if (index < 4) {
                recommendation = "استهدف زيادة متوسط خطواتك اليومية بمقدار 1000-1500 خطوة عن المتوسط السابق. كل خطوة تحدث فرقًا!";
            } else {
                recommendation = "تحدى نفسك بزيادة 500 خطوة إضافية يوميًا كل أسبوع، حتى تصل إلى هدف 8000-10000 خطوة يوميًا.";
            }
            return { ...phase, activityRecommendation: recommendation };
        });
    }
};


const createLoseWeightPhases = (
    userData: UserData,
    targetMacros: Macros,
    tdee: number
): { phases: PlanPhase[], estimatedDurationWeeks: number } => {
    
    let phases: PlanPhase[] = [];
    const mainPhaseMacros = { protein: targetMacros.protein, carbs: targetMacros.carbs, fat: targetMacros.fat };

    if (!userData.targetWeight || userData.targetWeight >= userData.weight) {
        const reviewInstruction = `بعد 4 أسابيع، قم بمراجعة تقدمك. إذا كان النزول أقل من المتوقع، فكر في تقليل السعرات اليومية بمقدار 100-250 سعرة، أو زيادة مستوى نشاطك.`;
        phases.push({
            type: PlanPhaseType.FAT_LOSS,
            name: "خسارة الدهون",
            duration: "مستمر",
            calories: targetMacros.calories,
            macros: mainPhaseMacros,
            notes: ["الالتزام بالعجز المحدد في السعرات.", "التركيز على تمارين المقاومة للحفاظ على العضلات."],
            reviewInstructions: reviewInstruction
        });
         const phasesWithRecommendations = addActivityRecommendations(phases, userData);
        return { phases: phasesWithRecommendations, estimatedDurationWeeks: 0 };
    }
    
    const totalWeightToLoseKg = userData.weight - userData.targetWeight;
    const weeklyCalorieDeficit = (tdee - targetMacros.calories) * 7;
    const weeklyFatLossKg = weeklyCalorieDeficit / 7700;

    const initialWaterLossKg = Math.min(totalWeightToLoseKg, userData.weight * 0.025);
    const remainingFatToLoseKg = totalWeightToLoseKg - initialWaterLossKg;
    
    phases.push({
        type: PlanPhaseType.INITIAL_WATER_LOSS,
        name: "الأسبوع 1-2: نزول السوائل الأولي",
        duration: "أسبوعان",
        calories: targetMacros.calories,
        macros: mainPhaseMacros,
        notes: [
            `النزول المتوقع: ${initialWaterLossKg.toFixed(1)} - ${(initialWaterLossKg * 1.5).toFixed(1)} كجم (معظمه سوائل).`,
            "هذا النزول السريع طبيعي في بداية أي نظام غذائي نتيجة لتفريغ مخازن الجليكوجين."
        ]
    });
    
    let estimatedDurationWeeks = 2;
    let weekNumber = 3;

    if (remainingFatToLoseKg > 0 && weeklyFatLossKg > 0.1) {
        const weeksNeededForFatLoss = Math.ceil(remainingFatToLoseKg / weeklyFatLossKg);
        let weeksCounter = 0;
        let dietWeeksAccumulator = 0;

        while (weeksCounter < weeksNeededForFatLoss) {
            const remainingDietWeeks = weeksNeededForFatLoss - weeksCounter;
            
            if (dietWeeksAccumulator >= 8 && remainingDietWeeks > 2) {
                 phases.push({
                    type: PlanPhaseType.DIET_BREAK,
                    name: `الأسبوع ${weekNumber}: استراحة من الدايت (Diet Break)`,
                    duration: "أسبوع كامل",
                    calories: Math.round(tdee),
                    macros: { protein: userData.weight * 1.8, carbs: (tdee * 0.45) / 4, fat: (tdee * 0.30) / 9 },
                    notes: ["تناول سعرات الصيانة لمدة أسبوع كامل لتجديد النشاط وتقليل التوتر الهرموني.", "بعد الاستراحة، عد إلى خطة نقص السعرات."]
                });
                estimatedDurationWeeks += 1;
                weekNumber += 1;
                dietWeeksAccumulator = 0;
                continue;
            }
            
            const blockDuration = Math.min(remainingDietWeeks, 6);
            const isLastBlock = (weeksCounter + blockDuration) >= weeksNeededForFatLoss;
            const reviewInstruction = isLastBlock ? "لقد وصلت إلى نهاية خطتك المقترحة! قم بتقييم نتائجك وقرر ما إذا كنت تريد تحديد هدف جديد أو الانتقال إلى مرحلة الحفاظ على الوزن." : `بعد انتهاء هذه المرحلة، قم بمراجعة تقدمك. إذا كان النزول أبطأ من المتوقع، فكر في زيادة نشاطك اليومي أو تقليل 100-150 سعرة من الكربوهيدرات أو الدهون.`;
            
            phases.push({
                type: PlanPhaseType.FAT_LOSS,
                name: `الأسبوع ${weekNumber}-${weekNumber + blockDuration - 1}: خسارة الدهون المستمرة`,
                duration: `${blockDuration} ${blockDuration > 1 ? 'أسابيع' : 'أسبوع'}`,
                calories: targetMacros.calories,
                macros: mainPhaseMacros,
                weeklyLoss: `${weeklyFatLossKg.toFixed(2)} كجم/أسبوع`,
                notes: [`النزول المستمر والثابت من الدهون بمعدل 0.5-1% من وزن الجسم أسبوعيًا.`, `المجموع المتوقع خلال هذه المرحلة: ${(weeklyFatLossKg * blockDuration).toFixed(1)} كجم.`],
                reviewInstructions: reviewInstruction
            });
            weeksCounter += blockDuration;
            estimatedDurationWeeks += blockDuration;
            weekNumber += blockDuration;
            dietWeeksAccumulator += blockDuration;
            
            if (weeksCounter < weeksNeededForFatLoss && dietWeeksAccumulator >= 6) {
                 phases.push({
                    type: PlanPhaseType.REFEED_DAY,
                    name: `الأسبوع ${weekNumber}: يوم إعادة التغذية (Refeed)`,
                    duration: "يوم واحد ضمن هذا الأسبوع",
                    calories: Math.round(tdee),
                    macros: { 
                        protein: mainPhaseMacros.protein, 
                        carbs: mainPhaseMacros.carbs + 100,
                        fat: Math.max(20, (tdee - (mainPhaseMacros.protein * 4) - ((mainPhaseMacros.carbs + 100) * 4)) / 9)
                    },
                    notes: ["يوم واحد ترفع فيه الكربوهيدرات والسعرات إلى مستوى الصيانة.", "يساعد على إعادة شحن الجليكوجين وتنشيط هرمونات الحرق."]
                });
            }
        }
    }
    
    const phasesWithRecommendations = addActivityRecommendations(phases, userData);
    return { phases: phasesWithRecommendations, estimatedDurationWeeks };
};


export const createAdvancedPlan = (userData: UserData, goalSettings: GoalSettings): AdvancedPlanResult => {
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(bmr, userData.activityLevel);

    const specialCase = handleSpecialConsiderations(userData, bmr, tdee);
    if (specialCase.isOverridden && specialCase.plan) {
        const planWithRecs = { ...specialCase.plan, phases: addActivityRecommendations(specialCase.plan.phases, userData) };
        return planWithRecs;
    }
    
    let targetCalories: number;
    let warnings: string[] = [...specialCase.baseWarnings];
    let guidelines: string[] = [...specialCase.guidelines];
    
    switch (goalSettings.goal) {
        case Goal.LOSE_WEIGHT:
            targetCalories = tdee * (1 - goalSettings.modifier);
            break;
        case Goal.GAIN_WEIGHT:
             const surplus = userData.gender === Gender.MALE ? 1.125 : 1.075;
             targetCalories = tdee * surplus;
             break;
        case Goal.MINI_CUT:
            targetCalories = tdee * (1 - goalSettings.modifier);
            break;
        default:
             targetCalories = tdee;
             break;
    }

    if (userData.gender === Gender.FEMALE && targetCalories < 1200) {
        targetCalories = 1200;
        warnings.push("تم رفع السعرات إلى 1200 وهو الحد الأدنى الآمن للنساء.");
    }
    if (userData.gender === Gender.MALE && targetCalories < 1500) {
        targetCalories = 1500;
        warnings.push("تم رفع السعرات إلى 1500 وهو الحد الأدنى الآمن للرجال.");
    }
    if (targetCalories < bmr) {
        targetCalories = bmr;
        warnings.push("تم رفع السعرات لتساوي معدل الأيض الأساسي (BMR) للحفاظ على وظائف الجسم الحيوية.");
    }
    
    let proteinGrams, fatGrams, carbGrams;
    
    if (goalSettings.goal === Goal.MINI_CUT) {
        proteinGrams = userData.weight * 2.5; // Mini-cut is specific, keep it high
    } else {
        proteinGrams = calculateProteinGrams(userData);
    }
    
    const fatPerKg = 0.8; // Unified value as per user request.
    fatGrams = userData.weight * fatPerKg;
    
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    carbGrams = Math.max(0, carbCalories / 4);
    
    const targetMacros: Macros = {
        calories: Math.round(targetCalories),
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbGrams),
        fat: Math.round(fatGrams),
    };

    let phases: PlanPhase[] = [];
    let estimatedDuration = "N/A";
    let durationContext = ESTIMATED_DURATION_LABEL;

    if (goalSettings.goal === Goal.LOSE_WEIGHT) {
        const result = createLoseWeightPhases(userData, targetMacros, tdee);
        phases = result.phases;
        if (userData.targetWeight && result.estimatedDurationWeeks > 0) {
            estimatedDuration = `${result.estimatedDurationWeeks} أسبوعًا`;
            durationContext = `للوصول إلى ${userData.targetWeight} كجم`;
        } else {
            estimatedDuration = "مستمر";
        }
    } else {
        const reviewInstructionGain = `بعد 4-6 أسابيع، قم بإعادة تقييم نسبة الدهون. إذا زادت بشكل كبير، فكر في الانتقال إلى مرحلة "تنشيف سريع" (Mini-Cut) لمدة 3-4 أسابيع قبل العودة إلى البناء.`;
        const gainDuration = userData.targetWeight && userData.targetWeight > userData.weight
            ? `${Math.ceil((userData.targetWeight - userData.weight) / 0.5)} شهرًا تقريبًا` // Assuming ~0.5kg gain per week
            : "4-6 أشهر";
            
        switch (goalSettings.goal) {
            case Goal.GAIN_WEIGHT:
                phases.push({ type: PlanPhaseType.MUSCLE_GAIN, name: "مرحلة بناء العضلات", duration: "12-16 أسبوع", calories: targetMacros.calories, macros: targetMacros, notes: ["الالتزام بفائض سعرات معتدل.", "التركيز على زيادة الأوزان في تمارين المقاومة."], reviewInstructions: reviewInstructionGain });
                estimatedDuration = gainDuration;
                if(userData.targetWeight) durationContext = `للوصول إلى ${userData.targetWeight} كجم`;
                break;
            case Goal.MINI_CUT:
                phases.push({ type: PlanPhaseType.MINI_CUT, name: "مرحلة التنشيف السريع", duration: "3-4 أسابيع فقط", calories: targetMacros.calories, macros: targetMacros, notes: ["عجز كبير في السعرات مع بروتين عالي."], reviewInstructions: "بعد انتهاء هذه المرحلة، انتقل إلى مرحلة صيانة لمدة أسبوع على الأقل قبل العودة إلى البناء." });
                estimatedDuration = "3-4 أسابيع";
                break;
            default:
                phases.push({ type: PlanPhaseType.MAINTENANCE, name: "الحفاظ على الوزن", duration: "مستمر", calories: targetMacros.calories, macros: targetMacros, notes: ["تناول سعرات الصيانة للحفاظ على نتائجك."] });
                estimatedDuration = "مستمر";
                break;
        }
    }
    
    const finalPhases = addActivityRecommendations(phases, userData);

    return {
        targetCalories: Math.round(targetCalories),
        targetMacros,
        estimatedDuration,
        durationContext,
        phases: finalPhases,
        warnings,
        guidelines: guidelines.length > 0 ? guidelines : undefined,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        goal: goalSettings.goal
    };
};
