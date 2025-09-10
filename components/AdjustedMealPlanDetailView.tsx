
import React, { useState, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FullMealPlan, Macros, DietProtocol, IntermittentFastingConfig, UserData } from '../types';
import {
  ADJUSTED_MEAL_PLAN_DETAIL_TITLE,
  BACK_TO_PLAN_EDITOR_BUTTON,
  MEAL_INGREDIENTS_FOR_ADJUSTED_SERVINGS,
  ADJUSTED_SERVINGS_DISPLAY_LABEL,
  CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL,
  RECIPE_NOT_ASSIGNED,
  IMAGE_PREVIEW_ALT,
  DOWNLOAD_PLAN_PDF_BUTTON,
  PDF_PLAN_TITLE,
  LOADING_MESSAGE,
  GENERATE_SHOPPING_LIST_BUTTON,
  DAY_LABEL_PREFIX,
  HIGH_CARB_DAY_LABEL,
  MEDIUM_CARB_DAY_LABEL,
  LOW_CARB_DAY_LABEL,
  KETO_DAY_LABEL,
  SAVE_PLAN_BUTTON,
  ENTER_PLAN_NAME_PROMPT,
  PLAN_NAME_LABEL,
  CANCEL_BUTTON,
  DAY_TOTALS_LABEL,
  VIEW_ONLY_MODE_NOTICE,
  LOAD_THIS_PLAN_BUTTON,
  PREMIUM_FEATURE_LABEL,
  FREE_TIER_PDF_DOWNLOAD_LIMIT,
  TUNA_WARNING_TITLE,
  TUNA_WARNING_INTRO,
  TUNA_WARNING_NOTICE,
  TUNA_WARNING_GUIDELINES,
} from '../constants';
import { Soup, Flame, Beef, Wheat, Droplets, Download, Loader2, ShoppingCart, ChevronDown, Save, Info, ArrowRight, Lock } from 'lucide-react';


const TunaWarning: React.FC<{ userWeight: number }> = ({ userWeight }) => (
    <div className="p-4 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 rounded-xl shadow-md border-2 border-yellow-500/50 space-y-2">
        <h4 className="text-md font-bold flex items-center gap-2">{TUNA_WARNING_TITLE}</h4>
        <p className="text-sm">{TUNA_WARNING_INTRO(userWeight)}</p>
        <p className="text-sm">{TUNA_WARNING_NOTICE}</p>
        <ul className="list-disc ps-5 text-sm space-y-1">
            {TUNA_WARNING_GUIDELINES.map(item => (
                <li key={item.type}>
                    <strong>{item.type}:</strong> {item.limit}
                </li>
            ))}
        </ul>
    </div>
);

const MealCard: React.FC<{ mealSlot: FullMealPlan[0]['meals'][0] }> = ({ mealSlot }) => {
    const [imageError, setImageError] = React.useState(false);

    const mealMacros: Macros = mealSlot.recipeSnapshot
        ? {
            calories: (mealSlot.recipeSnapshot.perServingMacros?.calories || 0) * mealSlot.quantityOfRecipeServings,
            protein: (mealSlot.recipeSnapshot.perServingMacros?.protein || 0) * mealSlot.quantityOfRecipeServings,
            carbs: (mealSlot.recipeSnapshot.perServingMacros?.carbs || 0) * mealSlot.quantityOfRecipeServings,
            fat: (mealSlot.recipeSnapshot.perServingMacros?.fat || 0) * mealSlot.quantityOfRecipeServings,
        } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const renderImage = () => {
        const imageUrl = mealSlot.recipeSnapshot?.imageUrl;
        if (imageUrl && !imageError) {
            return (
                <img
                    src={imageUrl}
                    alt={`${IMAGE_PREVIEW_ALT} - ${mealSlot.recipeSnapshot?.name}`}
                    className="w-full h-32 object-cover rounded-t-xl"
                    onError={() => setImageError(true)}
                />
            );
        }
        return (
            <div className="w-full h-32 bg-card rounded-t-xl flex items-center justify-center border-b border-border/50">
                <Soup className="w-12 h-12 text-slate-400 dark:text-slate-500" />
            </div>
        );
    };

    if (!mealSlot.recipeSnapshot) {
        return (
             <div className="bg-card/80 p-4 rounded-xl shadow-lg border-l-4 border-slate-600">
                <h3 className="text-lg font-semibold text-textMuted mb-2">{mealSlot.slotName}</h3>
                <p className="text-textMuted italic">{RECIPE_NOT_ASSIGNED}</p>
            </div>
        )
    }

    return (
        <div className="bg-card/80 rounded-xl shadow-lg overflow-hidden transition-all duration-300 [@media(hover:hover)]:hover:shadow-primary/20 [@media(hover:hover)]:hover:-translate-y-1">
            {renderImage()}
            <div className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-primary-light">{mealSlot.slotName}</h3>
                <p className="text-md font-medium text-textBase">الوصفة: <span className="text-secondary-light">{mealSlot.recipeSnapshot.name}</span></p>
                <p className="text-sm font-medium text-textMuted">{ADJUSTED_SERVINGS_DISPLAY_LABEL}: <span className="font-bold text-textBase">{mealSlot.quantityOfRecipeServings.toFixed(2)}</span> حصص</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 p-2 bg-inputBg/50 rounded-md">
                        <Flame className="text-secondary" size={16}/>
                        <div>
                            <div className="font-semibold text-textBase">{mealMacros.calories.toFixed(0)}</div>
                            <div className="text-textMuted">{CALORIES_LABEL}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-inputBg/50 rounded-md">
                        <Beef className="text-red-400" size={16}/>
                        <div>
                            <div className="font-semibold text-textBase">{mealMacros.protein.toFixed(1)}ج</div>
                            <div className="text-textMuted">{PROTEIN_LABEL}</div>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 p-2 bg-inputBg/50 rounded-md">
                        <Wheat className="text-yellow-400" size={16}/>
                        <div>
                            <div className="font-semibold text-textBase">{mealMacros.carbs.toFixed(1)}ج</div>
                            <div className="text-textMuted">{CARBS_LABEL}</div>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 p-2 bg-inputBg/50 rounded-md">
                        <Droplets className="text-blue-400" size={16}/>
                        <div>
                            <div className="font-semibold text-textBase">{mealMacros.fat.toFixed(1)}ج</div>
                            <div className="text-textMuted">{FAT_LABEL}</div>
                        </div>
                    </div>
                </div>

                <details className="text-sm">
                    <summary className="cursor-pointer text-textMuted hover:text-textBase transition-colors">{MEAL_INGREDIENTS_FOR_ADJUSTED_SERVINGS}</summary>
                    <ul className="list-disc ps-5 space-y-1 text-xs text-textMuted max-h-40 overflow-y-auto mt-2 bg-inputBg/50 p-2 rounded-md border border-border">
                        {mealSlot.recipeSnapshot.ingredients.map(ing => {
                            const servingsInRecipe = mealSlot.recipeSnapshot?.definedServingsInRecipe || 1;
                            const adjustedQuantity = (ing.quantityGram / servingsInRecipe) * mealSlot.quantityOfRecipeServings;
                            return (
                                <li key={`${ing.foodItemId}-${ing.foodItemName}`}>
                                    {ing.foodItemName}: {adjustedQuantity.toFixed(1)} جرام
                                </li>
                            );
                        })}
                    </ul>
                </details>
            </div>
        </div>
    );
};

const getDayTypeLabel = (dayType: 'high' | 'medium' | 'low' | 'normal', dietProtocol: DietProtocol) => {
    if (dietProtocol === DietProtocol.KETO) return KETO_DAY_LABEL;
    switch(dayType) {
        case 'high': return HIGH_CARB_DAY_LABEL;
        case 'medium': return MEDIUM_CARB_DAY_LABEL;
        case 'low': return LOW_CARB_DAY_LABEL;
        default: return '';
    }
};

const DietProtocolAdvice: React.FC<{ dietProtocol: DietProtocol }> = ({ dietProtocol }) => {
    const titleStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', color: '#14B8A6', marginBottom: '10px' };
    const subtitleStyle: React.CSSProperties = { fontSize: '14px', fontStyle: 'italic', color: '#64748B', marginBottom: '15px' };
    const sectionTitleStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 'bold', color: '#334155', marginTop: '15px', marginBottom: '10px' };
    const ulStyle: React.CSSProperties = { listStyleType: 'disc', paddingRight: '20px', fontSize: '14px', lineHeight: 1.6 };
    const liStyle: React.CSSProperties = { marginBottom: '8px' };
    const nestedUlStyle: React.CSSProperties = { listStyleType: 'circle', paddingRight: '20px', marginTop: '5px' };

    const renderKeto = () => (
        <div>
            <h3 style={titleStyle}>🥓 1. الكيتو دايت (Ketogenic Diet)</h3>
            <p style={subtitleStyle}>🔹 الهدف: الدخول في <strong>الكيتوزية</strong> (جسمك يستخدم الدهون والكيتونات بدل الكربوهيدرات).</p>
            <h4 style={sectionTitleStyle}>الخطوات العملية:</h4>
            <ul style={ulStyle}>
                <li style={liStyle}><strong>تحديد الماكروز:</strong>
                    <ul style={nestedUlStyle}>
                        <li>كاربوهيدرات: أقل من <strong>20–50 غ/يوم</strong> (صافي كارب = كارب - ألياف).</li>
                        <li>بروتين: معتدل (1.6–2 غ/كغ وزن الجسم).</li>
                        <li>دهون: الباقي من السعرات (تقريبًا 70–75% من السعرات).</li>
                    </ul>
                </li>
                <li style={liStyle}><strong>اختيار الأطعمة:</strong>
                    <ul style={nestedUlStyle}>
                        <li>بروتين: لحوم، دجاج، سمك، بيض.</li>
                        <li>دهون صحية: زيت الزيتون، الأفوكادو، المكسرات.</li>
                        <li>خضار منخفضة الكارب: بروكلي، سبانخ، كوسة.</li>
                        <li>ممنوع: الخبز، المعجنات، الأرز، السكر، البطاطا.</li>
                    </ul>
                </li>
                <li style={liStyle}><strong>مراقبة الأعراض:</strong>
                    <ul style={nestedUlStyle}>
                        <li>أول أسبوع = "كيتو فلو" (إرهاق، صداع) ← عالجها بزيادة الملح والماء.</li>
                    </ul>
                </li>
                <li style={liStyle}><strong>المكملات المفيدة:</strong>
                    <ul style={nestedUlStyle}>
                        <li>إلكترولايت (Na, K, Mg).</li>
                        <li>أوميغا 3.</li>
                    </ul>
                </li>
            </ul>
        </div>
    );

    const renderCarbCycling = () => (
        <div>
            <h3 style={titleStyle}>🍚 2. تدوير الكارب (Carb Cycling)</h3>
            <p style={subtitleStyle}>🔹 الهدف: التحكم في الكارب حسب النشاط ← زيادة الكارب في أيام التمرين، تقليله في أيام الراحة.</p>
            <h4 style={sectionTitleStyle}>الخطوات العملية:</h4>
            <ul style={ulStyle}>
                <li style={liStyle}><strong>تحديد الاحتياج اليومي</strong> من السعرات والماكروز.</li>
                <li style={liStyle}><strong>تقسيم الأيام:</strong>
                    <ul style={nestedUlStyle}>
                        <li><strong>High Carb Day (أيام التمرين القوي/المقاومة):</strong>
                            <ul style={{...nestedUlStyle, listStyleType: 'square'}}>
                                <li>بروتين: 1.6–2 غ/كغ.</li>
                                <li>كارب: 3–6 غ/كغ.</li>
                                <li>دهون: منخفضة (20–25%).</li>
                            </ul>
                        </li>
                        <li><strong>Low Carb Day (الراحة/كارديو خفيف):</strong>
                            <ul style={{...nestedUlStyle, listStyleType: 'square'}}>
                                <li>بروتين: ثابت.</li>
                                <li>كارب: 0.5–1 غ/كغ.</li>
                                <li>دهون: أعلى قليلًا لتعويض الطاقة.</li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li style={liStyle}><strong>اختيار مصادر الكارب:</strong>
                    <ul style={nestedUlStyle}>
                        <li>عالية الجودة: بطاطا، شوفان، أرز، فواكه.</li>
                        <li>تجنب السكريات السريعة إلا بعد التمرين.</li>
                    </ul>
                </li>
                <li style={liStyle}><strong>التنفيذ:</strong>
                    <ul style={nestedUlStyle}>
                        <li>يفضل 3 High Carb + 4 Low Carb أسبوعيًا (أو حسب برنامجك).</li>
                    </ul>
                </li>
            </ul>
        </div>
    );
    
    const renderIF = () => (
        <div>
            <h3 style={titleStyle}>⏱️ 3. الصيام المتقطع (Intermittent Fasting – IF)</h3>
            <p style={subtitleStyle}>🔹 الهدف: تنظيم الأكل في نافذة زمنية محدودة، تحسين التحكم بالسعرات والهرمونات.</p>
            <h4 style={sectionTitleStyle}>أشهر النماذج:</h4>
            <ul style={ulStyle}>
                <li><strong>16/8</strong>: صيام 16 ساعة – أكل في نافذة 8 ساعات.</li>
                <li><strong>18/6 أو 20/4</strong>: للمتقدمين.</li>
            </ul>
            <h4 style={sectionTitleStyle}>الخطوات العملية:</h4>
            <ul style={ulStyle}>
                <li style={liStyle}><strong>اختيار جدول يناسبك:</strong> مثال 16/8 ← الصيام من 8 مساءً إلى 12 ظهرًا.</li>
                <li style={liStyle}><strong>خلال الصيام:</strong> مسموح فقط ماء، شاي، قهوة بدون سكر أو حليب.</li>
                <li style={liStyle}><strong>نافذة الأكل (8 ساعات):</strong>
                    <ul style={nestedUlStyle}>
                        <li>وزّع السعرات والماكروز الخاصة بك.</li>
                        <li>وجبتين أساسيتين + سناك.</li>
                    </ul>
                </li>
                <li style={liStyle}><strong>تركيز على جودة الطعام:</strong> بروتين كافي + كارب معقد + دهون صحية + خضار.</li>
                <li style={liStyle}><strong>التمرين:</strong> يمكن أن يكون في نهاية فترة الصيام أو بداية نافذة الأكل.</li>
            </ul>
        </div>
    );

    switch (dietProtocol) {
        case DietProtocol.KETO: return renderKeto();
        case DietProtocol.CARB_CYCLING: return renderCarbCycling();
        case DietProtocol.INTERMITTENT_FASTING: return renderIF();
        default: return null;
    }
};


const PrintablePlan = React.forwardRef<HTMLDivElement, {
    fullPlan: FullMealPlan;
    dietProtocol: DietProtocol;
    planContainsTuna: boolean;
    userData: UserData | null;
}>(({ fullPlan, dietProtocol, planContainsTuna, userData }, ref) => {
    
    const containerStyle: React.CSSProperties = { width: '794px', padding: '40px', backgroundColor: '#ffffff', color: '#1E293B', fontFamily: 'Cairo, sans-serif', direction: 'rtl', textAlign: 'right' };
    const h1Style: React.CSSProperties = { fontSize: '24px', fontWeight: 'bold', color: '#4F46E5', marginBottom: '20px', textAlign: 'center' };
    const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', color: '#14B8A6', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #E2E8F0', paddingBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' };
    const mealCardStyle: React.CSSProperties = { border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '20px', pageBreakInside: 'avoid', display: 'flex', gap: '15px', padding: '15px', alignItems: 'flex-start' };
    const imageStyle: React.CSSProperties = { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 };
    const imagePlaceholderStyle: React.CSSProperties = { width: '80px', height: '80px', backgroundColor: '#F1F5F9', borderRadius: '4px', flexShrink: 0 };
    const mealContentStyle: React.CSSProperties = { flexGrow: 1 };

    const format = (val: number, isCalories?: boolean) => isCalories ? val.toFixed(0) : val.toFixed(1);
    
    const adviceContainerStyle: React.CSSProperties = { marginTop: '40px', pageBreakBefore: 'always', borderTop: '2px solid #E2E8F0', paddingTop: '20px' };
    const tunaWarningContainerStyle: React.CSSProperties = { marginTop: '40px', pageBreakBefore: 'auto', border: '2px solid #FBBF24', padding: '15px', borderRadius: '8px', backgroundColor: '#FEF9C3' };
    
    return (
        <div ref={ref} style={containerStyle}>
            <h1 style={h1Style}>{PDF_PLAN_TITLE} - {new Date().toLocaleDateString('ar-EG')}</h1>
            
            {fullPlan.map((dayPlan, index) => {
                 const dayTotalMacros = dayPlan.meals.reduce((totals, meal) => {
                    if (meal.recipeSnapshot) {
                        totals.calories += (meal.recipeSnapshot.perServingMacros?.calories || 0) * meal.quantityOfRecipeServings;
                        totals.protein += (meal.recipeSnapshot.perServingMacros?.protein || 0) * meal.quantityOfRecipeServings;
                        totals.carbs += (meal.recipeSnapshot.perServingMacros?.carbs || 0) * meal.quantityOfRecipeServings;
                        totals.fat += (meal.recipeSnapshot.perServingMacros?.fat || 0) * meal.quantityOfRecipeServings;
                    }
                    return totals;
                 }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

                return (
                <div key={dayPlan.dayIndex} style={index > 0 ? { pageBreakBefore: 'always' } : {}}>
                    <div style={h2Style}>
                        <span>{DAY_LABEL_PREFIX} {dayPlan.dayIndex + 1} <span style={{fontSize: '16px', color: '#EC4899', fontWeight: 'normal'}}>({getDayTypeLabel(dayPlan.dayType, dietProtocol)})</span></span>
                        <span style={{fontSize: '12px', fontWeight: 'normal', color: '#334155'}}>{DAY_TOTALS_LABEL}: {format(dayTotalMacros.calories, true)} سعرة | {format(dayTotalMacros.protein)}ب | {format(dayTotalMacros.carbs)}ك | {format(dayTotalMacros.fat)}د</span>
                    </div>

                     {dayPlan.meals.map((mealSlot) => {
                        if(!mealSlot.recipeSnapshot) return null;
                        const mealMacros: Macros = {
                            calories: (mealSlot.recipeSnapshot.perServingMacros?.calories || 0) * mealSlot.quantityOfRecipeServings,
                            protein: (mealSlot.recipeSnapshot.perServingMacros?.protein || 0) * mealSlot.quantityOfRecipeServings,
                            carbs: (mealSlot.recipeSnapshot.perServingMacros?.carbs || 0) * mealSlot.quantityOfRecipeServings,
                            fat: (mealSlot.recipeSnapshot.perServingMacros?.fat || 0) * mealSlot.quantityOfRecipeServings,
                        };
                        
                        return (
                            <div key={mealSlot.id} style={mealCardStyle}>
                                {mealSlot.recipeSnapshot.imageUrl ? (
                                    <img src={mealSlot.recipeSnapshot.imageUrl} style={imageStyle} alt={mealSlot.recipeSnapshot.name}/>
                                ) : (
                                    <div style={imagePlaceholderStyle}></div>
                                )}
                                <div style={mealContentStyle}>
                                    <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#6366F1', marginBottom: '8px'}}>{mealSlot.slotName}: {mealSlot.recipeSnapshot?.name}</h3>
                                    <p style={{fontSize: '14px', marginBottom: '10px'}}><strong>{ADJUSTED_SERVINGS_DISPLAY_LABEL}:</strong> {mealSlot.quantityOfRecipeServings.toFixed(2)} حصص</p>
                                    
                                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '15px'}}>
                                        <thead><tr><th style={{padding: '5px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC'}}>{CALORIES_LABEL}</th><th style={{padding: '5px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC'}}>{PROTEIN_LABEL}</th><th style={{padding: '5px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC'}}>{CARBS_LABEL}</th><th style={{padding: '5px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC'}}>{FAT_LABEL}</th></tr></thead>
                                        <tbody><tr><td style={{padding: '5px', border: '1px solid #E2E8F0', textAlign: 'center'}}>{format(mealMacros.calories, true)}</td><td style={{padding: '5px', border: '1px solid #E2E8F0', textAlign: 'center'}}>{format(mealMacros.protein)}ج</td><td style={{padding: '5px', border: '1px solid #E2E8F0', textAlign: 'center'}}>{format(mealMacros.carbs)}ج</td><td style={{padding: '5px', border: '1px solid #E2E8F0', textAlign: 'center'}}>{format(mealMacros.fat)}ج</td></tr></tbody>
                                    </table>

                                    <h4 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>{MEAL_INGREDIENTS_FOR_ADJUSTED_SERVINGS}</h4>
                                    <ul style={{ listStyleType: 'disc', paddingRight: '20px', fontSize: '12px' }}>
                                        {mealSlot.recipeSnapshot?.ingredients.map(ing => {
                                            const servingsInRecipe = mealSlot.recipeSnapshot?.definedServingsInRecipe || 1;
                                            const adjustedQuantity = (ing.quantityGram / servingsInRecipe) * mealSlot.quantityOfRecipeServings;
                                            return <li key={`${ing.foodItemId}-${ing.foodItemName}`}>{ing.foodItemName}: {adjustedQuantity.toFixed(1)} جرام</li>;
                                        })}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )})}
            
             {(dietProtocol === DietProtocol.KETO || dietProtocol === DietProtocol.CARB_CYCLING || dietProtocol === DietProtocol.INTERMITTENT_FASTING) && (
                <div style={adviceContainerStyle}>
                    <DietProtocolAdvice dietProtocol={dietProtocol} />
                </div>
            )}

            {planContainsTuna && userData && (
                <div style={tunaWarningContainerStyle}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#B45309', marginBottom: '10px' }}>{TUNA_WARNING_TITLE}</h2>
                    <p style={{fontSize: '14px', marginBottom: '10px'}}>{TUNA_WARNING_INTRO(userData.weight)}</p>
                    <p style={{fontSize: '14px', marginBottom: '10px'}}>{TUNA_WARNING_NOTICE}</p>
                    <ul style={{ listStyleType: 'disc', paddingRight: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                        {TUNA_WARNING_GUIDELINES.map(item => (
                            <li key={item.type} style={{marginBottom: '5px'}}>
                                <strong style={{color: '#92400E'}}>{item.type}:</strong> {item.limit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
});


interface AdjustedMealPlanDetailViewProps {
  fullPlan: FullMealPlan | null;
  dietProtocol: DietProtocol;
  onBack: () => void;
  onNavigateToShoppingList: () => void;
  onSavePlan: (planName: string) => void;
  onDownloadPdf: () => void;
  isViewingOnly?: boolean;
  savedPlanId: string | null;
  onLoadPlan: (planId: string) => void;
  isPremium: boolean;
  pdfDownloadsToday: number;
  intermittentFastingConfig: IntermittentFastingConfig | null;
  userData: UserData | null;
}

const AdjustedMealPlanDetailView: React.FC<AdjustedMealPlanDetailViewProps> = ({ 
    fullPlan, 
    dietProtocol, 
    intermittentFastingConfig,
    onBack, 
    onNavigateToShoppingList, 
    onSavePlan,
    onDownloadPdf, 
    isViewingOnly = false, 
    savedPlanId, 
    onLoadPlan,
    isPremium,
    pdfDownloadsToday,
    userData
}) => {

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);
    const [openDayIndex, setOpenDayIndex] = useState<number | null>(0);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');

    const canDownloadPdf = isPremium || pdfDownloadsToday < FREE_TIER_PDF_DOWNLOAD_LIMIT;

    const planContainsTuna = useMemo(() => {
        if (!fullPlan) return false;
        const tunaKeywords = ['tuna', 'تونة'];
        return fullPlan.some(day => 
            day.meals.some(meal => {
                const recipeName = meal.recipeSnapshot?.name.toLowerCase();
                const hasTunaInName = recipeName && tunaKeywords.some(kw => recipeName.includes(kw));
                if (hasTunaInName) return true;

                const hasTunaInIngredients = meal.recipeSnapshot?.ingredients.some(ing => {
                    const ingredientName = ing.foodItemName.toLowerCase();
                    return tunaKeywords.some(kw => ingredientName.includes(kw));
                });
                return hasTunaInIngredients;
            })
        );
    }, [fullPlan]);

    const handleDownloadPdf = async () => {
        if (isGeneratingPdf || !printableRef.current || !canDownloadPdf) return;
        setIsGeneratingPdf(true);

        const root = window.document.documentElement;
        const wasDarkMode = root.classList.contains('dark');
        if (wasDarkMode) {
            root.classList.remove('dark');
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const canvas = await html2canvas(printableRef.current, { 
                scale: 1.2, // Reduced from 2 for memory performance
                useCORS: true, 
                logging: false, 
                backgroundColor: '#ffffff',
                windowHeight: printableRef.current.scrollHeight,
                scrollY: -window.scrollY
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
            
            const totalPages = Math.ceil(imgHeight / pdf.internal.pageSize.getHeight());

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage();
                const yPos = -i * pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'PNG', 0, yPos, pdfWidth, imgHeight);
            }
            
            pdf.save(`plan-${new Date().toISOString().slice(0, 10)}.pdf`);
            if(!isPremium) {
                onDownloadPdf(); // Notify parent to increment count
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGeneratingPdf(false);
            if (wasDarkMode) {
                root.classList.add('dark');
            }
        }
    };

    const handleConfirmSave = () => {
        if (newPlanName.trim()) {
            onSavePlan(newPlanName.trim());
            setIsSaveModalOpen(false);
            setNewPlanName('');
        }
    };

    if (!fullPlan) {
        return (
            <div className="w-full text-center">
                <p className="text-textMuted">لا توجد بيانات خطة لعرضها. يرجى العودة وإعداد خطتك أولاً.</p>
                <button onClick={onBack} className="mt-4 bg-primary text-white font-semibold py-2 px-4 rounded-lg">
                    {BACK_TO_PLAN_EDITOR_BUTTON}
                </button>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-4xl space-y-6">
            <div style={{ position: 'absolute', left: '-9999px', top: 0, direction: 'rtl' }}>
                 {fullPlan && <PrintablePlan ref={printableRef} fullPlan={fullPlan} dietProtocol={dietProtocol} planContainsTuna={planContainsTuna} userData={userData} />}
            </div>

            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter">
                    <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-primary/50">
                        <h4 className="text-lg font-semibold text-primary-light mb-3">{ENTER_PLAN_NAME_PROMPT}</h4>
                        <label htmlFor="planName" className="sr-only">{PLAN_NAME_LABEL}</label>
                        <input
                            type="text"
                            id="planName"
                            value={newPlanName}
                            onChange={(e) => setNewPlanName(e.target.value)}
                            className="w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm"
                            placeholder={`${PLAN_NAME_LABEL} (مثال: خطة التنشيف مارس ٢٠٢٤)`}
                        />
                        <div className="flex space-x-3 rtl:space-x-reverse mt-4">
                            <button onClick={handleConfirmSave} disabled={!newPlanName.trim()} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50">
                                {SAVE_PLAN_BUTTON}
                            </button>
                            <button onClick={() => setIsSaveModalOpen(false)} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md">
                                {CANCEL_BUTTON}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{ADJUSTED_MEAL_PLAN_DETAIL_TITLE}</h2>
            
            {planContainsTuna && userData && <TunaWarning userWeight={userData.weight} />}

             {isViewingOnly && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-sm rounded-lg border border-blue-500/20">
                    <Info size={18} className="flex-shrink-0"/>
                    <span className="flex-grow">{VIEW_ONLY_MODE_NOTICE}</span>
                     {savedPlanId && (
                        <button onClick={() => onLoadPlan(savedPlanId)} className="ms-auto bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-md text-xs hover:bg-blue-600 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md hover:shadow-lg">
                            {LOAD_THIS_PLAN_BUTTON} <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-4">
            {fullPlan.map(dayPlan => {
                const dayLabel = getDayTypeLabel(dayPlan.dayType, dietProtocol);
                const dayTotalMacros = useMemo(() => {
                    return dayPlan.meals.reduce((totals, meal) => {
                        if (meal.recipeSnapshot) {
                            totals.calories += (meal.recipeSnapshot.perServingMacros?.calories || 0) * meal.quantityOfRecipeServings;
                            totals.protein += (meal.recipeSnapshot.perServingMacros?.protein || 0) * meal.quantityOfRecipeServings;
                            totals.carbs += (meal.recipeSnapshot.perServingMacros?.carbs || 0) * meal.quantityOfRecipeServings;
                            totals.fat += (meal.recipeSnapshot.perServingMacros?.fat || 0) * meal.quantityOfRecipeServings;
                        }
                        return totals;
                    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
                }, [dayPlan.meals]);

                return (
                    <details key={dayPlan.dayIndex} open={openDayIndex === dayPlan.dayIndex} onToggle={(e) => {if((e.target as HTMLDetailsElement).open) setOpenDayIndex(dayPlan.dayIndex)}}>
                        <summary 
                            className="p-4 bg-card/80 rounded-xl shadow-lg cursor-pointer flex justify-between items-center list-none transition-colors hover:bg-card"
                        >
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-primary">{DAY_LABEL_PREFIX} {dayPlan.dayIndex + 1}</h3>
                            {dayLabel && <span className="text-xs bg-accent/80 text-white px-2 py-0.5 rounded-full">{dayLabel}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="hidden sm:block text-xs font-medium text-textMuted text-left">
                                <span>{DAY_TOTALS_LABEL}: </span>
                                <span className="text-secondary font-semibold">{dayTotalMacros.calories.toFixed(0)}</span> سعرة
                             </div>
                            <ChevronDown className="details-arrow transition-transform duration-300" size={24} />
                        </div>
                        </summary>
                        <div className="p-4 bg-card/50 rounded-b-xl shadow-inner mt-1">
                            <div className="sm:hidden text-xs font-medium text-textMuted text-center mb-4 p-2 bg-inputBg rounded-md">
                                <span>{DAY_TOTALS_LABEL}: </span>
                                <span className="text-secondary font-semibold">{dayTotalMacros.calories.toFixed(0)}</span> سعرة, 
                                <span> {dayTotalMacros.protein.toFixed(0)}ب,</span>
                                <span> {dayTotalMacros.carbs.toFixed(0)}ك,</span>
                                <span> {dayTotalMacros.fat.toFixed(0)}د</span>
                             </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dayPlan.meals.map(mealSlot => mealSlot.assignedRecipeId ? <MealCard key={mealSlot.id} mealSlot={mealSlot} /> : null)}
                            </div>
                        </div>
                    </details>
                )
            })}
            </div>

            <div className="pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row-reverse gap-3">
                    <button 
                        onClick={() => setIsSaveModalOpen(true)}
                        disabled={isViewingOnly}
                        className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-primary/40 transform [@media(hover:hover)]:hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {SAVE_PLAN_BUTTON}
                    </button>
                     <div className="flex-1 relative group">
                        <button 
                            onClick={onNavigateToShoppingList}
                            disabled={isViewingOnly || !isPremium}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-green-500/40 transform [@media(hover:hover)]:hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart size={20} />
                            {GENERATE_SHOPPING_LIST_BUTTON}
                        </button>
                        {!isPremium && 
                            <div className="absolute inset-0 bg-card/60 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center text-xs font-semibold text-accent bg-accent/20 px-3 py-1.5 shadow">
                                <Lock size={12} className="me-1.5"/>
                                {PREMIUM_FEATURE_LABEL}
                            </div>
                        }
                    </div>
                </div>
                 <div className="flex flex-col sm:flex-row-reverse gap-3">
                    <button 
                        onClick={handleDownloadPdf} 
                        disabled={isGeneratingPdf || !canDownloadPdf}
                        className="flex-1 bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-secondary/40 transform [@media(hover:hover)]:hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        {isGeneratingPdf ? LOADING_MESSAGE : DOWNLOAD_PLAN_PDF_BUTTON}
                    </button>
                    <button onClick={onBack} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow hover:shadow-md">
                        {BACK_TO_PLAN_EDITOR_BUTTON}
                    </button>
                </div>
                 {!isPremium && <p className="text-center text-xs text-textMuted">مرات تحميل PDF المتبقية اليوم: {FREE_TIER_PDF_DOWNLOAD_LIMIT - pdfDownloadsToday}/{FREE_TIER_PDF_DOWNLOAD_LIMIT}</p>}
            </div>
        </div>
    );
};

export default AdjustedMealPlanDetailView;