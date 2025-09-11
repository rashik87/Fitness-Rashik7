

import { Gender, BodyCompositionResult } from '../types';

// U.S. Navy Body Fat Formula (Hodgdon and Beckett, 1984)
// All measurements in centimeters. Height in centimeters.
export const calculateNavyBodyFatPercentage = (
    gender: Gender,
    heightCm: number,
    neckCm: number,
    waistCm: number,
    hipCm?: number // Only for females
): number => {
    let percentage: number;

    if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return NaN;

    if (gender === Gender.MALE) {
        // Standard formula using body density (Siri equation)
        if (waistCm - neckCm <= 0) return NaN;
        const density = 1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm);
        percentage = (495 / density) - 450;
    } else { // FEMALE
        if (!hipCm || hipCm <= 0) return NaN;
        // Standard formula using body density (Siri equation)
        if (waistCm + hipCm - neckCm <= 0) return NaN;
        const density = 1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm);
        percentage = (495 / density) - 450;
    }
    
    const roundedPercentage = parseFloat(percentage.toFixed(1));

    if (isNaN(roundedPercentage)) return NaN;
    
    return Math.max(0, Math.min(100, roundedPercentage));
};


// --- Comprehensive Body Composition Analysis ---

const BF_COMPOSITION_CATEGORIES_MALE = {
    Essential: { min: 2, max: 10, label: 'أقل من الأساسي' },
    Fitness: { min: 12, max: 18, label: 'لياقة بدنية' },
    Acceptable: { min: 10, max: 25, label: 'صحة عامة' },
    Obese: { min: 25.1, max: Infinity, label: 'سمنة' }
};

const BF_COMPOSITION_CATEGORIES_FEMALE = {
    Essential: { min: 10, max: 16, label: 'أقل من الأساسي' },
    Fitness: { min: 16, max: 25, label: 'لياقة بدنية' },
    Acceptable: { min: 18, max: 30, label: 'صحة عامة' },
    Obese: { min: 30.1, max: Infinity, label: 'سمنة' }
};

const FFMI_CATEGORIES_MALE = {
    Low: { min: 0, max: 17.9, label: 'أقل من المتوسط' },
    Normal: { min: 18, max: 20, label: 'متوسط' },
    Advanced: { min: 20.1, max: 22, label: 'رياضي' },
    VeryHigh: { min: 22.1, max: 25, label: 'عالي (قريب من الحد الطبيعي)' },
    PossibleSteroidUse: { min: 25.1, max: Infinity, label: 'مرتفع جدًا (قد يشير إلى استخدام محفزات أداء)'}
};

const FFMI_CATEGORIES_FEMALE = {
    Low: { min: 0, max: 13.9, label: 'أقل من المتوسط' },
    Normal: { min: 14, max: 16, label: 'متوسط' },
    Advanced: { min: 16.1, max: 18, label: 'رياضية' },
    VeryHigh: { min: 18.1, max: Infinity, label: 'ممتازة' }
};

export const analyzeBodyComposition = (
    gender: Gender,
    heightCm: number,
    weightKg: number,
    neckCm: number,
    waistCm: number,
    hipCm?: number
): BodyCompositionResult | string => {

    // --- Step 1: Calculate Base BF% (Navy Method) ---
    const rawNavyBf = calculateNavyBodyFatPercentage(gender, heightCm, neckCm, waistCm, hipCm);
    if (isNaN(rawNavyBf)) return "خطأ في حساب نسبة الدهون. تأكد من أن القياسات المدخلة منطقية (مثال: محيط الخصر أكبر من محيط الرقبة للرجال).";
    
    const bf1 = Math.max(2, rawNavyBf);

    // --- Step 2: Calculate BF₂ (FFMI-corrected BF) ---
    const heightInMeters = heightCm / 100;
    const lbm1 = weightKg * (1 - bf1 / 100);
    const ffmiBasedOnBf1 = lbm1 / (heightInMeters * heightInMeters);
    
    // Heuristic adjustment based on user's example logic
    const ffmiBaseline = gender === Gender.MALE ? 19.5 : 15.5; // Adjusted baseline for a smoother correction
    const ffmiAdjustment = (ffmiBasedOnBf1 - ffmiBaseline);
    const cappedAdjustment = Math.max(-4, Math.min(4, ffmiAdjustment)); // Cap adjustment to +/- 4% to prevent extreme results
    const bf2 = bf1 - cappedAdjustment;

    // --- Step 3: Calculate BF₃ (WHR-corrected BF) ---
    const waistRiskThreshold = gender === Gender.MALE ? 102 : 88;
    const waistAtRisk = waistCm > waistRiskThreshold;
    let whrAtRisk = false;
    let whrValue: number | null = null;
    if (hipCm && hipCm > 0) {
        whrValue = parseFloat((waistCm / hipCm).toFixed(2));
        const whrRiskThreshold = gender === Gender.MALE ? 0.95 : 0.86;
        whrAtRisk = whrValue > whrRiskThreshold;
    }
    const isHealthRisk = waistAtRisk || whrAtRisk;
    const bf3 = isHealthRisk ? bf1 : (bf1 + bf2) / 2;

    // --- Step 4: Calculate Final Approximate BF% and derived values ---
    const finalBfPercentage = parseFloat(((bf1 + bf2 + bf3) / 3).toFixed(1));
    const finalFatMass = weightKg * (finalBfPercentage / 100);
    const finalLeanMass = weightKg - finalFatMass;
    const finalFfmi = parseFloat((finalLeanMass / (heightInMeters * heightInMeters)).toFixed(1));

    // --- Step 5: Get final categories and recommendations ---
    const getBfCategory = () => {
        const categories = gender === Gender.MALE ? BF_COMPOSITION_CATEGORIES_MALE : BF_COMPOSITION_CATEGORIES_FEMALE;
        if (finalBfPercentage < (gender === Gender.MALE ? 10 : 16)) return { category: 'Essential', label: categories.Essential.label };
        if (finalBfPercentage <= (gender === Gender.MALE ? 18 : 25)) return { category: 'Fitness', label: categories.Fitness.label };
        if (finalBfPercentage <= (gender === Gender.MALE ? 25 : 30)) return { category: 'Acceptable', label: categories.Acceptable.label };
        return { category: 'Obese', label: categories.Obese.label };
    };
    const bfData = getBfCategory();

    const getFfmiCategory = () => {
        const categories = gender === Gender.MALE ? FFMI_CATEGORIES_MALE : FFMI_CATEGORIES_FEMALE;
        if (finalFfmi <= categories.Low.max) return { category: 'Low', label: categories.Low.label };
        if (finalFfmi <= categories.Normal.max) return { category: 'Normal', label: categories.Normal.label };
        if (finalFfmi <= categories.Advanced.max) return { category: 'Advanced', label: categories.Advanced.label };
        if (gender === Gender.MALE && finalFfmi <= FFMI_CATEGORIES_MALE.VeryHigh.max) return { category: 'VeryHigh', label: FFMI_CATEGORIES_MALE.VeryHigh.label };
        if (gender === Gender.MALE && finalFfmi > FFMI_CATEGORIES_MALE.VeryHigh.max) return { category: 'PossibleSteroidUse', label: FFMI_CATEGORIES_MALE.PossibleSteroidUse.label };
        return { category: 'VeryHigh', label: categories.VeryHigh.label };
    };
    const ffmiData = getFfmiCategory();

    let riskLevel: 'منخفض' | 'متوسط' | 'مرتفع' = 'منخفض';
    if(bfData.category === 'Obese' || isHealthRisk) riskLevel = 'مرتفع';
    else if(finalBfPercentage > (gender === Gender.MALE ? 18 : 25)) riskLevel = 'متوسط';
    
    let primaryRecommendation = '';
    if (bfData.category === 'Obese') {
        primaryRecommendation = "أولويتك القصوى هي تحسين صحتك. ركز على خلق عجز بسيط في السعرات (300-500 سعرة)، زيادة البروتين، وإضافة نشاط بدني منتظم مثل المشي اليومي.";
    } else if (isHealthRisk) {
         primaryRecommendation = "مؤشرات الدهون الحشوية (محيط الخصر) مرتفعة، مما يزيد من خطر مقاومة الإنسولين. من الضروري التركيز على خسارة الدهون عبر نظام غذائي صحي وتمارين الكارديو.";
    } else if (ffmiData.category === 'Low') {
        primaryRecommendation = "كتلتك العضلية أقل من المتوسط. نوصي بإعطاء الأولوية لتمارين المقاومة مع تناول كمية كافية من البروتين (1.6-2.2 غ/كغ) لبناء أساس عضلي قوي.";
    // FIX: Removed redundant condition that was causing a linting error.
    } else if (bfData.category === 'Acceptable') {
         primaryRecommendation = `أنت في النطاق الصحي (${gender === Gender.MALE ? '10-25%' : '18-30%'}) ولكن أعلى من مجال اللياقة المثالي (${gender === Gender.MALE ? '12-18%' : '16-25%'}). الأولوية: خفض 3-5 كغ من الدهون مع الحفاظ على الكتلة العضلية عبر عجز حراري معتدل + تدريب مقاومة.`;
    } else {
        primaryRecommendation = "تهانينا! تكوين جسمك ممتاز وفي نطاق اللياقة البدنية. حافظ على عاداتك الصحية وواصل تطوير أدائك.";
    }

    return {
        bodyFat: {
            percentage: finalBfPercentage,
            category: bfData.category as any,
            categoryLabel: bfData.label,
            fatMass: parseFloat(finalFatMass.toFixed(1)),
            leanMass: parseFloat(finalLeanMass.toFixed(1))
        },
        ffmi: {
            value: finalFfmi,
            category: ffmiData.category as any,
            categoryLabel: ffmiData.label
        },
        waistCircumference: {
            value: waistCm,
            isAtRisk: waistAtRisk,
            riskLabel: waistAtRisk ? 'خطر ⚠️' : 'آمن ✅'
        },
        whr: {
            value: whrValue,
            isAtRisk: whrAtRisk,
            riskLabel: whrValue ? (whrAtRisk ? 'خطر ⚠️' : 'آمن ✅') : 'N/A'
        },
        summary: {
            riskLevel,
            primaryRecommendation
        }
    };
};
