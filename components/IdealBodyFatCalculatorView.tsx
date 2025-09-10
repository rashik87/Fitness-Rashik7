
import React, { useState } from 'react';
import { Gender, SportActivity } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { calculateIdealBodyFat } from '../services/bodyFatTargetService';
import {
    IDEAL_BODY_FAT_NAV_LINK, SPORT_ACTIVITY_OPTIONS, BODY_FAT_PERCENTAGE_LABEL,
    IDEAL_BODY_FAT_RANGE_TEXT, REQUIRED_FIELD_ERROR,
    POSITIVE_NUMBER_ERROR,
} from '../constants';
import { Target, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const IdealBodyFatCalculatorView: React.FC = () => {
    const { userData } = useAppContext();
    const [sportActivity, setSportActivity] = useState<SportActivity>(userData?.sportActivity || SportActivity.GENERAL_FITNESS);
    const [currentBodyFat, setCurrentBodyFat] = useState(userData?.bodyFatPercentage?.toString() || '');
    const [gender, setGender] = useState<Gender>(userData?.gender || Gender.MALE);
    
    const [result, setResult] = useState<{ idealRange: { min: number; max: number }; recommendation: string; status: 'below' | 'above' | 'ideal' } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = () => {
        setError(null);
        const bfNum = parseFloat(currentBodyFat);
        if (isNaN(bfNum) || bfNum <= 0) {
            setError(POSITIVE_NUMBER_ERROR);
            return;
        }

        const calculationResult = calculateIdealBodyFat(gender, sportActivity, bfNum);
        setResult(calculationResult);
    };
    
    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
    const labelClass = "block text-sm font-medium text-textBase mb-2";
    
    const getResultColor = () => {
        if (!result) return 'border-transparent';
        switch (result.status) {
            case 'ideal': return 'border-secondary text-secondary';
            case 'above': return 'border-yellow-500 text-yellow-500';
            case 'below': return 'border-accent text-accent';
            default: return 'border-transparent';
        }
    };

    return (
        <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <Target size={30} />
                    <span>{IDEAL_BODY_FAT_NAV_LINK}</span>
                </h2>
                <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">
                    اكتشف النطاق المثالي لنسبة الدهون في جسمك بناءً على نوع نشاطك الرياضي للحصول على أفضل أداء ومظهر صحي.
                </p>
            </div>
            
            <div className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-primary space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="sportActivity" className={labelClass}>نوع النشاط الرياضي الأساسي</label>
                        <select id="sportActivity" value={sportActivity} onChange={e => setSportActivity(e.target.value as SportActivity)} className={inputClass}>
                            {SPORT_ACTIVITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="currentBodyFat" className={labelClass}>{BODY_FAT_PERCENTAGE_LABEL}</label>
                        <input type="number" id="currentBodyFat" value={currentBodyFat} onChange={e => setCurrentBodyFat(e.target.value)} className={inputClass} placeholder="مثال: 15" step="0.1" />
                    </div>
                </div>
                
                 {error && (
                    <div className="flex items-center gap-2 p-2 mt-2 bg-accent/10 text-accent text-sm rounded-md border border-accent/20">
                        <AlertTriangle size={16}/>
                        <span>{error}</span>
                    </div>
                )}
                
                 <button onClick={handleCalculate} className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2 focus:ring-offset-background transform [@media(hover:hover)]:hover:scale-105">
                    احسب النطاق المثالي
                </button>
            </div>

            {result && (
                 <div className={`p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 ${getResultColor().replace('text-', 'border-')} space-y-4 animate-fadeIn`}>
                    <h2 className="text-xl md:text-2xl font-bold text-secondary-light text-center">النتائج</h2>
                    <div className="text-center">
                         <p className="text-sm text-textMuted">{IDEAL_BODY_FAT_RANGE_TEXT(SPORT_ACTIVITY_OPTIONS.find(o => o.value === sportActivity)?.label || '')}</p>
                        <p className={`text-4xl font-extrabold my-2 ${getResultColor()}`}>{result.idealRange.min}% - {result.idealRange.max}%</p>
                    </div>
                    <div className={`p-3 rounded-lg flex items-start gap-3 text-sm border ${getResultColor().replace('text-', 'border-')} bg-card/50`}>
                        <div className={`mt-1 ${getResultColor()}`}>{result.status === 'ideal' ? <CheckCircle /> : <AlertTriangle />}</div>
                        <p className="text-textBase">{result.recommendation}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdealBodyFatCalculatorView;
