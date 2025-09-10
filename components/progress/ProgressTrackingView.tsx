
import React, { useState, useEffect, useMemo } from 'react';
import { WeightEntry, MeasurementDetails, BodyFatResult, Gender, UserData } from '../../types';
import { analyzeBodyComposition } from '../../services/bodyFatService';
import {
    PROGRESS_TRACKING_TITLE, ADD_NEW_ENTRY_BUTTON, LOG_MEASUREMENTS_BUTTON, DATE_LABEL, WEIGHT_KG_LABEL,
    NECK_CM_LABEL, WAIST_CM_LABEL, HIPS_CM_LABEL, THIGH_CM_LABEL, BODY_FAT_PERCENTAGE_LABEL,
    BODY_FAT_MASS_LABEL, LEAN_BODY_MASS_LABEL, BODY_FAT_CATEGORY_LABEL, CALCULATE_BODY_FAT_BUTTON,
    HISTORICAL_ENTRIES_TITLE, NO_PROGRESS_ENTRIES_YET, POSITIVE_NUMBER_ERROR,
    NAVY_BF_INSTRUCTIONS, BODY_FAT_INPUTS_REQUIRED, LOADING_MESSAGE,
    USED_HEIGHT_LABEL, USED_GENDER_LABEL, HEIGHT_GENDER_REQUIRED_FOR_BF_MESSAGE,
    GENDER_OPTIONS
} from '../../constants';
import { Loader2, PlusCircle, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface ProgressTrackingViewProps {
  userDataForCalc: UserData | null;
  entries: WeightEntry[];
  onAddEntry: (entry: Omit<WeightEntry, 'id' | 'userId'>) => boolean;
  onDeleteEntry: (entryId: string) => void;
}

const getCategoryColorClasses = (categoryLabel: string): { text: string; border: string; bg: string } => {
    switch (categoryLabel) {
        case "دهون أساسية":
        case "رياضيون":
        case "لياقة بدنية":
        case "متوسط":
        case "أقل من الأساسي":
            return { text: 'text-green-600 dark:text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' };
        case "مقبول":
        case "صحة عامة":
             return { text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' };
        case "سمنة":
            return { text: 'text-red-600 dark:text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10' };
        default:
            return { text: 'text-accent', border: 'border-accent/50', bg: 'bg-accent/10' };
    }
};
// FIX: The component was not returning any JSX, causing a type error. This has been resolved by providing the full component implementation including the return statement.
// FIX: Errors related to state setters and missing default exports are resolved by providing the complete, syntactically correct component implementation.
const ProgressTrackingView: React.FC<ProgressTrackingViewProps> = ({
  userDataForCalc,
  entries,
  onAddEntry,
  onDeleteEntry
}) => {
  const { setCurrentView } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [measurements, setMeasurements] = useState<MeasurementDetails>({});
  const [bodyFatResult, setBodyFatResult] = useState<BodyFatResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<WeightEntry | null>(null);
  
  const [calcNeck, setCalcNeck] = useState('');
  const [calcWaist, setCalcWaist] = useState('');
  const [calcHips, setCalcHips] = useState('');

  const resetForm = () => {
      setCurrentDate(new Date().toISOString().split('T')[0]);
      setCurrentWeight('');
      setMeasurements({});
      setFormError(null);
      setBodyFatResult(null);
      setCalcNeck('');
      setCalcWaist('');
      setCalcHips('');
  };
  
  useEffect(() => {
    // Reset calculator if user data changes
    setBodyFatResult(null);
  }, [userDataForCalc]);

  const handleMeasurementChange = (field: keyof MeasurementDetails, value: string) => {
    const numValue = parseFloat(value);
    setMeasurements(prev => ({
        ...prev,
        [field]: isNaN(numValue) || numValue <= 0 ? undefined : numValue,
    }));
  };

  const handleCalcInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setBodyFatResult(null); 
  };

  const validateForm = (): boolean => {
    setFormError(null);
    if (!currentDate) {
      setFormError("التاريخ مطلوب.");
      return false;
    }
    const weightNum = parseFloat(currentWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setFormError(`${WEIGHT_KG_LABEL}: ${POSITIVE_NUMBER_ERROR}`);
      return false;
    }
    return true;
  };

  const handleLogEntry = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const isBfResultValid = bodyFatResult?.percentage && !bodyFatResult.category.includes('خطأ') && !bodyFatResult.category.includes('مطلوب');
    
    const newEntry: Omit<WeightEntry, 'id' | 'userId'> = {
      date: currentDate,
      weight: parseFloat(currentWeight),
      measurements: {
        neck: parseFloat(calcNeck) > 0 ? parseFloat(calcNeck) : undefined,
        waist: parseFloat(calcWaist) > 0 ? parseFloat(calcWaist) : undefined,
        hips: parseFloat(calcHips) > 0 ? parseFloat(calcHips) : undefined,
        thigh: measurements.thigh,
      },
      bodyFatPercentage: isBfResultValid ? bodyFatResult.percentage : undefined,
      bodyFatMass: isBfResultValid ? bodyFatResult.fatMassKg : undefined,
      leanMass: isBfResultValid ? bodyFatResult.leanMassKg : undefined
    };
    
    const success = onAddEntry(newEntry);
    if (success) {
      setShowAddForm(false);
      resetForm();
    } else {
      setFormError("فشل حفظ القراءة. حاول مرة أخرى.");
    }
    setIsSubmitting(false);
  };
  
  const handleCalculateBodyFat = () => {
    setFormError(null);
    if (!userDataForCalc || !userDataForCalc.height || !userDataForCalc.gender) {
      setBodyFatResult({ percentage: 0, category: HEIGHT_GENDER_REQUIRED_FOR_BF_MESSAGE });
      return;
    }
    const neckCm = parseFloat(calcNeck);
    const waistCm = parseFloat(calcWaist);
    const hipCmNum = userDataForCalc.gender === Gender.FEMALE ? parseFloat(calcHips) : undefined;
    const weightKgNum = parseFloat(currentWeight);

    if (isNaN(neckCm) || neckCm <= 0 || isNaN(waistCm) || waistCm <= 0 || (userDataForCalc.gender === Gender.FEMALE && (hipCmNum === undefined || isNaN(hipCmNum) || hipCmNum <= 0))) {
      setBodyFatResult({ percentage: 0, category: BODY_FAT_INPUTS_REQUIRED });
      return;
    }
    if (isNaN(weightKgNum) || weightKgNum <=0) {
        setBodyFatResult({ percentage: 0, category: "الرجاء إدخال وزن حالي صحيح لحساب كتلة الدهون." });
        return;
    }

    const analysisResult = analyzeBodyComposition(userDataForCalc.gender, userDataForCalc.height, weightKgNum, neckCm, waistCm, hipCmNum);

    if (typeof analysisResult === 'string') {
        setBodyFatResult({ percentage: 0, category: analysisResult });
    } else {
        setBodyFatResult({
            percentage: analysisResult.bodyFat.percentage,
            category: analysisResult.bodyFat.categoryLabel,
            fatMassKg: analysisResult.bodyFat.fatMass,
            leanMassKg: analysisResult.bodyFat.leanMass,
        });
    }
  };

  const handleDeleteRequest = (entry: WeightEntry) => {
    setEntryToDelete(entry);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      setIsSubmitting(true);
      onDeleteEntry(entryToDelete.id);
      setIsSubmitting(false);
      setEntryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setEntryToDelete(null);
  };

  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-colors duration-200 text-sm";
  const labelClass = "block text-sm font-medium text-textBase mb-1.5";
  const buttonClass = "bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-background transform hover:scale-105 disabled:opacity-70 disabled:scale-100";
  const secondaryButtonClass = "bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed";

  const memoizedEntries = useMemo(() => entries, [entries]);
  const userGenderDisplay = userDataForCalc?.gender ? GENDER_OPTIONS.find(g => g.value === userDataForCalc.gender)?.label : 'غير محدد';
  const canCalculateBfp = !!(userDataForCalc?.height && userDataForCalc.gender);
  const categoryColorClasses = bodyFatResult ? getCategoryColorClasses(bodyFatResult.category) : null;

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-primary-light">{PROGRESS_TRACKING_TITLE}</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className={`${secondaryButtonClass} whitespace-nowrap text-sm`}>
          {showAddForm ? "إخفاء النموذج" : ADD_NEW_ENTRY_BUTTON}
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-card/80 rounded-xl shadow-2xl space-y-4 border border-border animate-fadeIn">
          <h3 className="text-lg font-semibold text-primary-light">تسجيل قراءة جديدة</h3>
          {formError && <p className="text-accent text-sm p-2 bg-accent/10 rounded-md">{formError}</p>}
          
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="entryDate" className={labelClass}>{DATE_LABEL}</label>
              <input type="date" id="entryDate" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="entryWeight" className={labelClass}>{WEIGHT_KG_LABEL}</label>
              <input type="number" id="entryWeight" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} placeholder="مثال: 70.5" className={inputClass} step="0.1" />
            </div>
          </div>
          
           <div className="p-3 bg-inputBg/50 rounded-lg mt-3 text-sm space-y-1 border border-border">
            <p className="text-xs text-textMuted">{NAVY_BF_INSTRUCTIONS}</p>
            {userDataForCalc?.height ? (
              <p><strong>{USED_HEIGHT_LABEL}:</strong> {userDataForCalc.height} سم</p>
            ) : (
              <p className="text-accent text-xs">لم يتم إدخال الطول في الحاسبة الرئيسية. لا يمكن حساب نسبة الدهون.</p>
            )}
            {userDataForCalc?.gender ? (
              <p><strong>{USED_GENDER_LABEL}:</strong> {userGenderDisplay}</p>
            ) : (
              <p className="text-accent text-xs">لم يتم تحديد الجنس في الحاسبة الرئيسية. لا يمكن حساب نسبة الدهون.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
                <label htmlFor="calcNeck" className={labelClass}>{NECK_CM_LABEL}</label>
                <input type="number" id="calcNeck" value={calcNeck} onChange={(e) => handleCalcInputChange(setCalcNeck, e.target.value)} placeholder="مثال: 38" className={inputClass} step="0.1" />
            </div>
            <div>
                <label htmlFor="calcWaist" className={labelClass}>{WAIST_CM_LABEL}</label>
                <input type="number" id="calcWaist" value={calcWaist} onChange={(e) => handleCalcInputChange(setCalcWaist, e.target.value)} placeholder="مثال: 85" className={inputClass} step="0.1" />
            </div>
            {userDataForCalc?.gender === Gender.FEMALE ? (
              <div>
                <label htmlFor="calcHips" className={labelClass}>{HIPS_CM_LABEL}</label>
                <input type="number" id="calcHips" value={calcHips} onChange={(e) => handleCalcInputChange(setCalcHips, e.target.value)} placeholder="مثال: 95" className={inputClass} step="0.1" />
              </div>
            ) : <div className="hidden sm:block"></div>}
          </div>
          <div>
            <label htmlFor="entryThigh" className={labelClass}>{THIGH_CM_LABEL} (اختياري)</label>
            <input type="number" id="entryThigh" value={measurements.thigh || ''} onChange={(e) => handleMeasurementChange('thigh', e.target.value)} placeholder="مثال: 55" className={inputClass} step="0.1" />
          </div>
           <button 
            onClick={handleCalculateBodyFat} 
            className={`${secondaryButtonClass} w-full`} 
            disabled={!canCalculateBfp}
          >
            {CALCULATE_BODY_FAT_BUTTON}
          </button>
          {bodyFatResult && categoryColorClasses && (
            <div className={`p-3 rounded-lg mt-3 text-sm space-y-1 border ${categoryColorClasses.border} ${categoryColorClasses.bg}`}>
                <p>
                    <strong>{BODY_FAT_CATEGORY_LABEL}:</strong> <span className={`font-semibold ${categoryColorClasses.text}`}>{bodyFatResult.category}</span>
                </p>
                {bodyFatResult.percentage > 0 && !bodyFatResult.category.includes('خطأ') && !bodyFatResult.category.includes('مطلوب') && (
                    <>
                        <p><strong>{BODY_FAT_PERCENTAGE_LABEL}:</strong> {bodyFatResult.percentage.toFixed(1)}%</p>
                        {bodyFatResult.fatMassKg !== undefined && <p><strong>{BODY_FAT_MASS_LABEL}:</strong> {bodyFatResult.fatMassKg.toFixed(1)} كجم</p>}
                        {bodyFatResult.leanMassKg !== undefined && <p><strong>{LEAN_BODY_MASS_LABEL}:</strong> {bodyFatResult.leanMassKg.toFixed(1)} كجم</p>}
                    </>
                )}
            </div>
          )}

          <button onClick={handleLogEntry} className={`${buttonClass} w-full flex items-center justify-center gap-2`} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" size={20} />}
            {isSubmitting ? LOADING_MESSAGE : LOG_MEASUREMENTS_BUTTON}
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-primary-light pt-4 border-t border-border">{HISTORICAL_ENTRIES_TITLE}</h3>
        {memoizedEntries.length > 0 ? (
          <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
          {memoizedEntries.map(entry => (
            <div key={entry.id} className="p-3 bg-card/90 rounded-lg shadow-md border-s-4 border-primary/70">
              <div className="flex justify-between items-start mb-1">
                <p className="text-md font-semibold text-primary-light">{new Date(entry.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <button 
                    onClick={() => handleDeleteRequest(entry)}
                    className="text-accent hover:text-accent-dark text-xs font-bold disabled:opacity-50"
                    disabled={isSubmitting}
                    aria-label="حذف القراءة"
                >
                    &times;
                </button>
              </div>
              <p className="text-sm"><strong>{WEIGHT_KG_LABEL}:</strong> {entry.weight.toFixed(1)} كجم</p>
              {entry.bodyFatPercentage !== undefined && entry.bodyFatPercentage > 0 && ( 
                <>
                  <p className="text-sm"><strong>{BODY_FAT_PERCENTAGE_LABEL}:</strong> {entry.bodyFatPercentage.toFixed(1)}%</p>
                  {entry.bodyFatMass !== undefined && <p className="text-xs text-textMuted">({BODY_FAT_MASS_LABEL}: {entry.bodyFatMass.toFixed(1)} كجم)</p>}
                   {entry.leanMass !== undefined && <p className="text-xs text-textMuted">({LEAN_BODY_MASS_LABEL}: {entry.leanMass.toFixed(1)} كجم)</p>}
                </>
              )}
              {(entry.measurements.neck || entry.measurements.waist || entry.measurements.hips || entry.measurements.thigh) && (
                <details className="text-xs mt-1">
                  <summary className="cursor-pointer text-textMuted hover:text-textBase">عرض المقاسات المسجلة</summary>
                  <ul className="ps-4 mt-1 list-disc text-textMuted bg-inputBg/50 p-2 rounded-md">
                    {entry.measurements.neck && <li>{NECK_CM_LABEL}: {entry.measurements.neck} سم</li>}
                    {entry.measurements.waist && <li>{WAIST_CM_LABEL}: {entry.measurements.waist} سم</li>}
                    {entry.measurements.hips && <li>{HIPS_CM_LABEL}: {entry.measurements.hips} سم</li>}
                    {entry.measurements.thigh && <li>{THIGH_CM_LABEL}: {entry.measurements.thigh} سم</li>}
                  </ul>
                </details>
              )}
            </div>
          ))}
          </div>
        ) : (
          <div className="text-center text-textMuted p-8 bg-card/50 rounded-lg shadow-inner flex flex-col items-center gap-4">
            <TrendingUp size={48} className="text-textMuted/70" />
            <p>{NO_PROGRESS_ENTRIES_YET}</p>
            <button 
                onClick={() => setShowAddForm(true)} 
                className="mt-2 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100"
            >
                <PlusCircle size={18}/>
                <span>{ADD_NEW_ENTRY_BUTTON}</span>
            </button>
          </div>
        )}
      </div>

      {entryToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter">
            <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-accent/50">
                <h4 className="text-lg font-semibold text-accent mb-3">تأكيد الحذف</h4>
                <p className="text-textBase text-sm mb-4">
                    هل أنت متأكد أنك تريد حذف قراءة تاريخ <span className="font-bold">{new Date(entryToDelete.date).toLocaleDateString('ar-EG')}</span>؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <button onClick={handleConfirmDelete} className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50" disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'نعم، احذف'}
                    </button>
                    <button onClick={handleCancelDelete} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md" disabled={isSubmitting}>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTrackingView;
