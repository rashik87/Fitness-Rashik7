


import React, { useRef, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCalculator } from '../contexts/CalculatorContext';
import { useUI } from '../contexts/UIContext';
import { AdvancedPlanResult, PlanPhase, Goal, PlanPhaseType } from '../types';
import { calculateIdealBodyFat } from '../services/bodyFatTargetService';
import { 
    GOAL_OPTIONS,
    ADVANCED_RESULTS_TITLE,
    DAILY_TARGETS_LABEL,
    PLAN_PHASES_LABEL,
    IMPORTANT_WARNINGS_LABEL,
    IMPORTANT_GUIDELINES_LABEL,
    BMR_LABEL,
    TDEE_LABEL,
    SUGGESTED_PROTOCOLS_LABEL,
    NEXT_STEP_TITLE,
    DOWNLOAD_PLAN_GUIDE_BUTTON,
    GOTO_SMART_PLAN_BUTTON,
    RECALCULATE_NEEDS_BUTTON,
    LOADING_MESSAGE,
    RECIPE_DRIVEN_MEAL_PLAN_NAVIGATION_LINK,
    IDEAL_BODY_FAT_TARGET_TITLE,
    IDEAL_BODY_FAT_RANGE_TEXT,
    SPORT_ACTIVITY_OPTIONS,
    TIMELINE_PLANNER_TITLE,
    TIMELINE_LABEL,
    APPLY_TIMELINE_BUTTON,
    CALORIES_UNIT,
} from '../constants';
import { Flame, Beef, Wheat, Droplets, Clock, Zap, Shield, ChevronDown, BarChart2, Coffee, TrendingDown, TrendingUp, BrainCircuit, ShieldCheck, Info, Download, Utensils, RefreshCw, Loader2, Target, Timer } from 'lucide-react';
import PrintableGuide from './PrintableGuide';


const MacroCard: React.FC<{ title: string; value: number; unit: string; icon: React.ReactNode; color: string }> = ({ title, value, unit, icon, color }) => (
  <div className="p-3 rounded-xl shadow-lg text-center bg-card/80 border-t-4 transition-all duration-300 [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:-translate-y-1" style={{ borderColor: color }}>
    <div className="mx-auto w-fit p-2 rounded-full mb-1" style={{ backgroundColor: `${color}20`, color }}>
      {icon}
    </div>
    <h4 className="text-sm font-semibold text-textBase">{title}</h4>
    <p className="text-2xl font-bold" style={{ color }}>{value.toFixed(0)}</p>
    <p className="text-xs text-textMuted">{unit}</p>
  </div>
);

const getPhaseIcon = (type: PlanPhaseType) => {
    switch (type) {
        case PlanPhaseType.INITIAL_WATER_LOSS:
            return <div className="p-2 bg-blue-500/20 text-blue-500 rounded-full"><Droplets size={20} /></div>;
        case PlanPhaseType.FAT_LOSS:
            return <div className="p-2 bg-red-500/20 text-red-500 rounded-full"><Flame size={20} /></div>;
        case PlanPhaseType.REFEED_DAY:
            return <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-full"><Wheat size={20} /></div>;
        case PlanPhaseType.DIET_BREAK:
            return <div className="p-2 bg-green-500/20 text-green-500 rounded-full"><Coffee size={20} /></div>;
        case PlanPhaseType.MUSCLE_GAIN:
            return <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-full"><TrendingUp size={20} /></div>;
        case PlanPhaseType.MINI_CUT:
             return <div className="p-2 bg-orange-500/20 text-orange-500 rounded-full"><TrendingDown size={20} /></div>;
        case PlanPhaseType.MAINTENANCE:
             return <div className="p-2 bg-gray-500/20 text-gray-500 rounded-full"><ShieldCheck size={20} /></div>;
        case PlanPhaseType.HEALTH_FOCUS:
             return <div className="p-2 bg-teal-500/20 text-teal-500 rounded-full"><ShieldCheck size={20} /></div>;
        default:
            return <div className="p-2 bg-gray-500/20 text-gray-500 rounded-full"><Zap size={20} /></div>;
    }
};


const PhaseCard: React.FC<{ phase: PlanPhase }> = ({ phase }) => (
    <details className="bg-card/90 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg" open={phase.type === PlanPhaseType.INITIAL_WATER_LOSS || phase.type === PlanPhaseType.HEALTH_FOCUS}>
        <summary className="p-4 flex justify-between items-center cursor-pointer list-none hover:bg-primary/10">
            <div className="flex items-center gap-3">
                {getPhaseIcon(phase.type)}
                <div>
                    <h4 className="font-semibold text-textBase">{phase.name}</h4>
                    <p className="text-xs text-textMuted">{phase.duration}</p>
                </div>
            </div>
            <ChevronDown className="details-arrow text-textMuted flex-shrink-0" size={20}/>
        </summary>
        <div className="p-4 border-t border-border/50 text-textMuted text-sm space-y-3 bg-card/50">
            <p><strong>السعرات:</strong> <span className="font-semibold text-secondary">{phase.calories.toFixed(0)}</span></p>
            <p><strong>الماكروز:</strong> {phase.macros.protein.toFixed(0)}ج بروتين، {phase.macros.carbs.toFixed(0)}ج كارب، {phase.macros.fat.toFixed(0)}ج دهون</p>
            {phase.weeklyLoss && <p><strong>النزول الأسبوعي المقدر:</strong> <span className="font-semibold text-textBase">{phase.weeklyLoss}</span></p>}
            <ul className="list-disc ps-5 pt-2 space-y-1">
                {phase.notes.map((note, i) => <li key={i}>{note}</li>)}
            </ul>
             {phase.activityRecommendation && (
                <div className="mt-3 pt-3 border-t border-dashed border-primary/30">
                    <h5 className="font-semibold text-primary-light text-sm mb-1 flex items-center gap-2">
                        <TrendingUp size={16} /> 📈 توصيات النشاط لهذه المرحلة
                    </h5>
                    <p className="text-xs">{phase.activityRecommendation}</p>
                </div>
            )}
             {phase.reviewInstructions && (
                <div className="mt-3 pt-3 border-t border-dashed border-primary/30">
                    <h5 className="font-semibold text-primary-light text-sm mb-1 flex items-center gap-2">
                        <BrainCircuit size={16} /> خطوتك التالية: المراجعة والتعديل
                    </h5>
                    <p className="text-xs">{phase.reviewInstructions}</p>
                </div>
            )}
        </div>
    </details>
);

const ResultsDisplay: React.FC = () => {
  const { advancedPlan: plan, handleReset, userData, handleGoalSettingsSubmit } = useCalculator();
  const { setCurrentView } = useUI();
  const printableRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [desiredWeeks, setDesiredWeeks] = useState('');

  const idealBfResult = useMemo(() => {
    if (!userData || !userData.sportActivity) return null;
    return calculateIdealBodyFat(
        userData.gender,
        userData.sportActivity,
        userData.bodyFatPercentage || 0 // pass 0 if not available
    );
  }, [userData]);
  
   const timelineCalculation = useMemo(() => {
    if (!desiredWeeks || !userData || !plan || !userData.targetWeight) {
        return null;
    }

    const weeks = parseInt(desiredWeeks, 10);
    if (isNaN(weeks) || weeks <= 0) {
        return { isValid: false, message: 'الرجاء إدخال عدد أسابيع صحيح.', percentage: 0, newCalories: 0 };
    }

    const tdee = plan.tdee;
    const currentWeight = userData.weight;
    const targetWeight = userData.targetWeight;
    const totalDays = weeks * 7;

    if (plan.goal === Goal.LOSE_WEIGHT) {
        if (currentWeight <= targetWeight) return null;
        const totalWeightToLoseKg = currentWeight - targetWeight;
        const totalCaloriesToBurn = totalWeightToLoseKg * 7700;
        const requiredDailyDeficit = totalCaloriesToBurn / totalDays;
        const percentage = requiredDailyDeficit / tdee;
        const newCalories = tdee - requiredDailyDeficit;

        if (percentage < 0.10) {
            return { isValid: false, message: 'هذه المدة طويلة جدًا. للحصول على أفضل النتائج، اختر مدة أقصر.', percentage, newCalories };
        }
        if (percentage > 0.35) { // Hard cap
            return { isValid: false, message: 'هذه المدة قصيرة جدًا وغير صحية. اختر مدة أطول.', percentage, newCalories };
        }
        return { isValid: true, message: `للوصول لهدفك في ${weeks} أسابيع، تحتاج لعجز يومي بنسبة:`, percentage, newCalories };
    }

    if (plan.goal === Goal.GAIN_WEIGHT) {
        if (currentWeight >= targetWeight) return null;
        const totalWeightToGainKg = targetWeight - currentWeight;
        const totalCaloriesSurplus = totalWeightToGainKg * 6000; // 6000 kcal for 1kg tissue gain
        const requiredDailySurplus = totalCaloriesSurplus / totalDays;
        const percentage = requiredDailySurplus / tdee;
        const newCalories = tdee + requiredDailySurplus;
        
        if (percentage < 0.05) {
             return { isValid: false, message: 'هذه المدة طويلة جدًا. اختر مدة أقصر لزيادة فعالة.', percentage, newCalories };
        }
        if (percentage > 0.20) {
            return { isValid: false, message: 'هذه المدة قصيرة جدًا وقد تؤدي لزيادة الدهون بشكل مفرط. اختر مدة أطول.', percentage, newCalories };
        }
        return { isValid: true, message: `للوصول لهدفك في ${weeks} أسابيع، تحتاج لفائض يومي بنسبة:`, percentage, newCalories };
    }

    return null;

  }, [desiredWeeks, userData, plan]);

  const handleApplyTimeline = () => {
    if (timelineCalculation && timelineCalculation.isValid && plan) {
        handleGoalSettingsSubmit({
            goal: plan.goal,
            modifier: timelineCalculation.percentage
        });
        setDesiredWeeks('');
    }
  };


  const handleDownloadPdf = async () => {
    if (isGeneratingPdf || !printableRef.current) return;
    setIsGeneratingPdf(true);

    const root = window.document.documentElement;
    const wasDarkMode = root.classList.contains('dark');
    if (wasDarkMode) {
      root.classList.remove('dark');
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const canvas = await html2canvas(printableRef.current, { 
            scale: 2,
            useCORS: true, 
            logging: false, 
            backgroundColor: '#ffffff',
            windowHeight: printableRef.current.scrollHeight,
            scrollY: -window.scrollY
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / pdfWidth;
        const canvasImgHeight = imgHeight / ratio;
        
        let heightLeft = canvasImgHeight;
        let position = 0;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pdfWidth, canvasImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, pdfWidth, canvasImgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`plan-guide-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsGeneratingPdf(false);
        if (wasDarkMode) {
            root.classList.add('dark');
        }
    }
  };


  if (!plan || !userData) {
      return (
          <div className="w-full max-w-lg text-center p-6 bg-card/70 rounded-xl shadow-xl flex flex-col items-center gap-4">
              <p className="text-textMuted">لا توجد بيانات خطة لعرضها. قد تحتاج إلى إعادة حساب السعرات.</p>
              <button onClick={handleReset} className="mt-4 bg-primary text-white font-semibold py-2 px-6 rounded-lg">
                  البدء من جديد
              </button>
          </div>
      );
  }

  const goalTitle = GOAL_OPTIONS.find(g => g.value === plan.goal)?.label || "خطتك";
  const durationValue = plan.estimatedDuration.split(' ')[0];
  const durationUnit = plan.estimatedDuration.split(' ').slice(1).join(' ');
  
  const actionButtonClass = "flex-1 font-semibold py-3 px-4 rounded-lg transition-transform duration-200 shadow-md hover:shadow-lg transform [@media(hover:hover)]:hover:scale-105 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait";

  return (
    <div className="w-full max-w-2xl space-y-6 md:space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-light">{ADVANCED_RESULTS_TITLE}</h2>
        <p className="text-textMuted text-md">خطة مخصصة لهدف: {goalTitle}</p>
      </div>

      {plan.warnings.length > 0 && (
        <div className="p-4 bg-accent/10 rounded-xl border-s-4 border-accent text-accent space-y-2">
          <h3 className="font-bold text-md flex items-center gap-2"><Shield size={20} /> {IMPORTANT_WARNINGS_LABEL}</h3>
          <ul className="list-disc ps-5 text-sm">
            {plan.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
          </ul>
        </div>
      )}

      {plan.guidelines && plan.guidelines.length > 0 && (
        <div className="p-4 bg-blue-500/10 rounded-xl border-s-4 border-blue-500 text-blue-800 dark:text-blue-300 space-y-2">
            <h3 className="font-bold text-md flex items-center gap-2"><Info size={20} /> {IMPORTANT_GUIDELINES_LABEL}</h3>
            <div className="text-sm space-y-2">
                {plan.guidelines.map((line, i) =>
                    line.startsWith('### ') ?
                    <h4 key={i} className="font-semibold text-blue-900 dark:text-blue-200 pt-2">{line.substring(4)}</h4> :
                    <li key={i} className="list-disc ms-4">{line}</li>
                )}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-card/70 rounded-xl shadow-lg text-center flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-textMuted flex items-center justify-center gap-1"><Flame size={14}/> {DAILY_TARGETS_LABEL}</h3>
              <p className="text-5xl font-extrabold text-secondary tracking-tight">{plan.targetMacros.calories.toFixed(0)}</p>
              <p className="text-xs text-textMuted">سعر حراري/يوم</p>
          </div>
          <div className="p-4 bg-card/70 rounded-xl shadow-lg text-center flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-textMuted flex items-center justify-center gap-1"><Clock size={14}/> {plan.durationContext}</h3>
              <p className="text-3xl font-extrabold text-secondary">{durationValue}</p>
              <p className="text-xs text-textMuted">{durationUnit}</p>
          </div>
      </div>
      
      <div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <MacroCard title="البروتين" value={plan.targetMacros.protein} unit="جرام" icon={<Beef size={22} />} color="#F87171" />
          <MacroCard title="الكربوهيدرات" value={plan.targetMacros.carbs} unit="جرام" icon={<Wheat size={22} />} color="#34D399" />
          <MacroCard title="الدهون" value={plan.targetMacros.fat} unit="جرام" icon={<Droplets size={22} />} color="#60A5FA" />
        </div>
      </div>
      
      {idealBfResult && (
        <div className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
            <h3 className="text-lg font-semibold text-primary-light mb-2 flex items-center gap-2">
                <Target size={20} />
                {IDEAL_BODY_FAT_TARGET_TITLE}
            </h3>
            <p className="text-sm text-textMuted">
                {IDEAL_BODY_FAT_RANGE_TEXT(SPORT_ACTIVITY_OPTIONS.find(o => o.value === userData.sportActivity)?.label || '')}
                <strong className="text-secondary"> {idealBfResult.idealRange.min}% - {idealBfResult.idealRange.max}%</strong>.
            </p>
            {userData.bodyFatPercentage && userData.bodyFatPercentage > 0 && (
                <p className="text-sm text-textMuted">{idealBfResult.recommendation}</p>
            )}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-semibold text-primary-light mb-3 flex items-center gap-2"><Zap size={20}/> {PLAN_PHASES_LABEL}</h3>
        {plan.phases.map((phase, index) => (
            <PhaseCard key={index} phase={phase} />
        ))}
      </div>
      
      {plan.goal !== Goal.MAINTAIN_WEIGHT && userData.targetWeight && (
        <div className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
            <h3 className="text-lg font-semibold text-primary-light mb-2 flex items-center gap-2">
                <Timer size={20} />
                {TIMELINE_PLANNER_TITLE}
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <label htmlFor="weeks" className="text-sm font-medium whitespace-nowrap">{TIMELINE_LABEL}</label>
                <input 
                    type="number"
                    id="weeks"
                    value={desiredWeeks}
                    onChange={(e) => setDesiredWeeks(e.target.value)}
                    className="w-full sm:w-24 bg-inputBg border border-border text-textBase rounded-lg p-2 text-center focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="أسابيع"
                    min="1"
                />
            </div>
            {timelineCalculation && (
                <div className={`mt-3 p-3 rounded-lg border text-sm ${timelineCalculation.isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-accent/10 border-accent/30'}`}>
                    <p className={`${timelineCalculation.isValid ? 'text-textBase' : 'text-accent'}`}>{timelineCalculation.message}</p>
                    <div className="font-bold text-center mt-2">
                        <span className="text-lg text-secondary">
                            {Math.round(timelineCalculation.percentage * 100)}%
                        </span>
                        <span className="mx-2 text-textMuted">|</span>
                        <span className="text-lg text-secondary">
                            {Math.round(timelineCalculation.newCalories)}
                        </span>
                        <span className="text-xs text-textMuted"> {CALORIES_UNIT}/يوم</span>
                    </div>
                    {timelineCalculation.isValid && (
                        <button onClick={handleApplyTimeline} className="w-full mt-3 bg-secondary text-white font-semibold text-xs py-2 px-4 rounded-md hover:bg-secondary-dark transition-colors">
                            {APPLY_TIMELINE_BUTTON}
                        </button>
                    )}
                </div>
            )}
        </div>
      )}
      
      <div className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
          <h3 className="text-lg font-semibold text-primary-light mb-2">{SUGGESTED_PROTOCOLS_LABEL}</h3>
          <p className="text-sm text-textMuted">
              يمكنك دمج خطتك مع بروتوكولات غذائية مثل <strong>الصيام المتقطع (16/8)</strong> لتقسيم وجباتك في نافذة زمنية محددة، أو <strong>تدوير الكربوهيدرات</strong> (إذا كان هدفك خسارة الدهون) عن طريق جعل أيام التمرين أعلى في الكربوهيدرات وأيام الراحة أقل.
          </p>
      </div>

      <div className="p-4 bg-card/70 rounded-xl shadow-inner text-center">
        <h4 className="text-sm font-semibold text-textMuted flex items-center justify-center gap-2"><BarChart2 size={16}/> بياناتك الحالية</h4>
        <div className="flex justify-around items-center mt-2 text-xs">
            <p>{BMR_LABEL}: <strong className="text-textBase">{plan.bmr}</strong></p>
            <p>{TDEE_LABEL}: <strong className="text-textBase">{plan.tdee}</strong></p>
        </div>
      </div>
        
      <div className="pt-6 mt-6 border-t border-border/50 space-y-3">
          <h3 className="text-lg font-semibold text-center text-primary-light">{NEXT_STEP_TITLE}</h3>
          <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className={`${actionButtonClass} bg-secondary text-white`}>
                  {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  <span>{isGeneratingPdf ? LOADING_MESSAGE : DOWNLOAD_PLAN_GUIDE_BUTTON}</span>
              </button>
              <button onClick={() => setCurrentView('recipeDrivenMealPlan')} className={`${actionButtonClass} bg-primary text-white`}>
                  <Utensils size={18} />
                  <span>{GOTO_SMART_PLAN_BUTTON}</span>
              </button>
          </div>
          <button onClick={handleReset} className={`${actionButtonClass} w-full bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase`}>
              <RefreshCw size={18} />
              <span>{RECALCULATE_NEEDS_BUTTON}</span>
          </button>
      </div>

       <div className="absolute left-[-9999px] top-0">
         {plan && <PrintableGuide ref={printableRef} plan={plan} />}
      </div>
    </div>
  );
};

export default ResultsDisplay;