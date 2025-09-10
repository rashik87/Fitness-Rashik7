
import React, { useState } from 'react';
import { Gender } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { BodyCompositionResult } from '../types';
import { analyzeBodyComposition } from '../services/bodyFatService';
import {
    BODY_COMPOSITION_TITLE, BODY_COMPOSITION_DESCRIPTION, CALCULATE_BODY_COMPOSITION_BUTTON, USER_DATA_MISSING_ERROR,
    COMPOSITION_RESULTS_TITLE, BF_RESULT_TITLE, FFMI_RESULT_TITLE, HEALTH_RISK_INDICATORS_TITLE, SUMMARY_AND_RECOMMENDATIONS_TITLE,
    NECK_CM_LABEL, WAIST_CM_LABEL, HIPS_CM_LABEL, BODY_FAT_CATEGORY_LABEL, FAT_MASS_LABEL_COMPOSITION, LEAN_MASS_LABEL_COMPOSITION,
    WHR_LABEL, YOUR_RISK_LEVEL_LABEL, PRIMARY_RECOMMENDATION_LABEL, WAIST_CIRCUMFERENCE_LABEL,
    REQUIRED_FIELD_ERROR, MAIN_CALCULATOR_NAV_LINK
} from '../constants';
import { Activity, AlertTriangle, Dumbbell, HeartPulse, Info, Scale, CheckCircle, ArrowLeft } from 'lucide-react';

const ResultCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="p-4 bg-card/50 rounded-xl shadow-lg">
        <h3 className="text-md font-bold text-primary-light flex items-center gap-2 mb-3">
            {icon} {title}
        </h3>
        <div className="space-y-3 text-sm">
            {children}
        </div>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string | number; unit?: string; valueColor?: string }> = ({ label, value, unit, valueColor = 'text-textBase' }) => (
    <div className="flex justify-between items-center bg-inputBg/50 p-2.5 rounded-md">
        <span className="text-textMuted">{label}</span>
        <span className={`font-bold ${valueColor}`}>{value} {unit}</span>
    </div>
);

const BodyCompositionAnalysisView: React.FC = () => {
    const { userData, updateUserData, setCurrentView } = useAppContext();

    const [neck, setNeck] = useState('');
    const [waist, setWaist] = useState('');
    const [hips, setHips] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<BodyCompositionResult | null>(null);
    
    const gender = userData?.gender || Gender.MALE;

    const handleCalculate = () => {
        setError(null);
        setResult(null);

        if (!userData || !userData.height || !userData.weight) {
            setError(USER_DATA_MISSING_ERROR);
            return;
        }

        const neckCm = parseFloat(neck);
        const waistCm = parseFloat(waist);
        const hipCm = parseFloat(hips);

        if (isNaN(neckCm) || neckCm <=0 || isNaN(waistCm) || waistCm <=0 || (gender === Gender.FEMALE && (isNaN(hipCm) || hipCm <= 0))) {
            setError("يرجى إدخال جميع القياسات المطلوبة بشكل صحيح.");
            return;
        }
        
        const analysisResult = analyzeBodyComposition(gender, userData.height, userData.weight, neckCm, waistCm, gender === Gender.FEMALE ? hipCm : undefined);

        if (typeof analysisResult === 'string') {
            setError(analysisResult);
        } else {
            setResult(analysisResult);
        }
    };
    
    const handleApplyResultAndReturn = () => {
        if (result) {
            updateUserData({ bodyFatPercentage: result.bodyFat.percentage });
            setCurrentView('userInput');
        }
    };

    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
    const labelClass = "block text-sm font-medium text-textBase mb-2";
    
    const riskColor = result?.summary.riskLevel === 'مرتفع' ? 'text-accent' : result?.summary.riskLevel === 'متوسط' ? 'text-yellow-500' : 'text-secondary';


    return (
        <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <Activity size={30} />
                    <span>{BODY_COMPOSITION_TITLE}</span>
                </h2>
                <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">{BODY_COMPOSITION_DESCRIPTION}</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-primary space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="neck" className={labelClass}>{NECK_CM_LABEL}</label>
                        <input type="number" id="neck" value={neck} onChange={e => setNeck(e.target.value)} className={inputClass} placeholder="مثال: 38" step="0.1" />
                    </div>
                     <div>
                        <label htmlFor="waist" className={labelClass}>{WAIST_CM_LABEL}</label>
                        <input type="number" id="waist" value={waist} onChange={e => setWaist(e.target.value)} className={inputClass} placeholder="مثال: 85" step="0.1" />
                    </div>
                    <div>
                        <label htmlFor="hips" className={labelClass}>{HIPS_CM_LABEL} {gender !== Gender.FEMALE && '(للنساء فقط)'}</label>
                        <input type="number" id="hips" value={hips} onChange={e => setHips(e.target.value)} className={inputClass} placeholder="مثال: 95" step="0.1" disabled={gender !== Gender.FEMALE} />
                    </div>
                </div>
                
                 {error && (
                    <div className="flex items-center gap-2 p-2 mt-2 bg-accent/10 text-accent text-sm rounded-md border border-accent/20">
                        <AlertTriangle size={16}/>
                        <span>{error}</span>
                    </div>
                )}
                
                 <button onClick={handleCalculate} className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2 focus:ring-offset-background transform [@media(hover:hover)]:hover:scale-105">
                    {CALCULATE_BODY_COMPOSITION_BUTTON}
                </button>
            </div>

            {result && (
                 <div className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-secondary space-y-6 animate-fadeIn">
                    <h2 className="text-xl md:text-2xl font-bold text-secondary-light text-center">{COMPOSITION_RESULTS_TITLE}</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setCurrentView('userInput')} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg shadow flex items-center justify-center gap-2">
                            <ArrowLeft size={18} />
                            <span>العودة للحاسبة (بدون حفظ)</span>
                        </button>
                        <button onClick={handleApplyResultAndReturn} className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2">
                             <CheckCircle size={18} />
                             <span>استخدام هذه النسبة ({result.bodyFat.percentage}%) والعودة</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResultCard title={BF_RESULT_TITLE} icon={<Scale size={20} />}>
                            <InfoRow label="نسبة الدهون" value={result.bodyFat.percentage} unit="%" valueColor="text-secondary font-extrabold text-lg" />
                            <InfoRow label={BODY_FAT_CATEGORY_LABEL} value={result.bodyFat.categoryLabel} />
                            <InfoRow label={FAT_MASS_LABEL_COMPOSITION} value={result.bodyFat.fatMass} unit="كجم" />
                            <InfoRow label={LEAN_MASS_LABEL_COMPOSITION} value={result.bodyFat.leanMass} unit="كجم" />
                        </ResultCard>

                        <ResultCard title={FFMI_RESULT_TITLE} icon={<Dumbbell size={20} />}>
                             <InfoRow label="قيمة المؤشر" value={result.ffmi.value} valueColor="text-secondary font-extrabold text-lg" />
                             <InfoRow label="التقييم" value={result.ffmi.categoryLabel} />
                             <p className="text-xs text-textMuted pt-2">مؤشر FFMI يقيس كتلتك العضلية بالنسبة لطولك، وهو مؤشر أفضل من مؤشر كتلة الجسم (BMI).</p>
                        </ResultCard>
                        
                        <ResultCard title={HEALTH_RISK_INDICATORS_TITLE} icon={<HeartPulse size={20} />}>
                            <InfoRow label={WAIST_CIRCUMFERENCE_LABEL} value={result.waistCircumference.value} unit="سم" />
                            <InfoRow label="التقييم" value={result.waistCircumference.riskLabel} />
                            <InfoRow label={WHR_LABEL} value={result.whr.value || 'N/A'} />
                            <InfoRow label="التقييم" value={result.whr.riskLabel} />
                        </ResultCard>

                         <ResultCard title={SUMMARY_AND_RECOMMENDATIONS_TITLE} icon={<Info size={20} />}>
                             <InfoRow label={YOUR_RISK_LEVEL_LABEL} value={result.summary.riskLevel} valueColor={`${riskColor} font-extrabold text-lg`} />
                             <div>
                                 <p className="text-textMuted mb-1">{PRIMARY_RECOMMENDATION_LABEL}:</p>
                                 <p className="p-2 bg-inputBg/50 rounded-md text-textBase">{result.summary.primaryRecommendation}</p>
                             </div>
                         </ResultCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BodyCompositionAnalysisView;
