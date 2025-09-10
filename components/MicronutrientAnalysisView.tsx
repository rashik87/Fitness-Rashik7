import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Nutrient, UserData, ActivityLevel } from '../types';
import { NUTRIENT_DATA } from '../data/nutrients';
import { 
    MICRONUTRIENT_ANALYSIS_TITLE, MICRONUTRIENT_ANALYSIS_DESCRIPTION, MICRONUTRIENT_NO_DATA, 
    MICRONUTRIENT_CARD_RDA_LABEL, MICRONUTRIENT_CARD_IMPORTANCE_LABEL, MICRONUTRIENT_CARD_SOURCES_LABEL,
    MICRONUTRIENT_CARD_DEFICIENCY_LABEL, MICRONUTRIENT_ESPECIALLY_IMPORTANT, START_CALCULATION_BUTTON
} from '../constants';
import { Pill, AlertCircle, Sparkles, CheckCircle, ChevronDown, Info } from 'lucide-react';

const getUserAgeRange = (age: number): string => {
    if (age <= 18) return '9-18';
    if (age >= 19 && age <= 30) return '19-30';
    if (age >= 31 && age <= 50) return '19-50'; // Common grouping
    if (age >= 51 && age <= 70) return '51-70';
    if (age > 70) return '71+';
    return '19+'; // Generic fallback
};

const getRecommendedValue = (nutrient: Nutrient, user: UserData): number | null => {
    const genderData = nutrient.rda[user.gender];
    if (!genderData) return null;

    const ageRange = getUserAgeRange(user.age);
    let rda = genderData[ageRange] || genderData['19+'] || genderData['19-50'] || null;

    if (rda !== null && nutrient.relevanceCriteria?.activityLevels) {
        const activityModifier = nutrient.relevanceCriteria.activityLevels.find(
            mod => mod.level === user.activityLevel
        );
        if (activityModifier) {
            rda *= activityModifier.multiplier;
        }
    }

    return rda;
};

const getUpperLimitValue = (nutrient: Nutrient, user: UserData): number | null => {
    if (!nutrient.ul) return null;
    const genderData = nutrient.ul[user.gender];
    if (!genderData) return null;
    const ageRange = getUserAgeRange(user.age);
    return genderData[ageRange] || genderData['19+'] || genderData['19-50'] || null;
};

const getSmartNotes = (nutrient: Nutrient, user: UserData): string[] => {
    if (!nutrient.smartNotes) return [];
    return nutrient.smartNotes
        .map(noteFn => noteFn(user))
        .filter((note): note is string => note !== null);
};


const NutrientCard: React.FC<{ nutrient: Nutrient; userRda: number; userUl: number | null; smartNotes: string[] }> = ({ nutrient, userRda, userUl, smartNotes }) => {
    return (
        <details className="bg-card/80 rounded-xl shadow-lg border-s-4 border-primary/70 transition-all duration-300 hover:shadow-primary/20 [@media(hover:hover)]:hover:scale-[1.02] transform [@media(hover:hover)]:hover:-translate-y-1 overflow-hidden">
            <summary className="p-4 flex justify-between items-center cursor-pointer list-none">
                <div className="flex-grow">
                    <h3 className="text-md font-semibold text-primary-light">{nutrient.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
                        <p className="font-semibold text-secondary">{MICRONUTRIENT_CARD_RDA_LABEL} {userRda.toFixed(1)} {nutrient.unit}</p>
                        {userUl !== null && <p className="text-textMuted">الحد الأعلى: {userUl.toFixed(0)} {nutrient.unit}</p>}
                    </div>
                     {smartNotes.length > 0 && (
                         <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2 flex items-center gap-1.5"><Sparkles size={14}/> {MICRONUTRIENT_ESPECIALLY_IMPORTANT}</div>
                    )}
                </div>
                <ChevronDown className="details-arrow text-textMuted flex-shrink-0" size={24}/>
            </summary>
            <div className="px-4 pb-4 space-y-3">
                 {smartNotes.length > 0 && (
                     <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-md border border-amber-500/20 text-xs space-y-1">
                        {smartNotes.map((note, i) => <p key={i}>- {note}</p>)}
                    </div>
                )}
                <div className="pt-2 border-t border-border/50">
                    <h4 className="text-sm font-semibold text-textBase mb-1">{MICRONUTRIENT_CARD_IMPORTANCE_LABEL}</h4>
                    <p className="text-xs text-textMuted">{nutrient.importance}</p>
                </div>
                <div className="pt-2 border-t border-border/50">
                    <h4 className="text-sm font-semibold text-textBase mb-1">{MICRONUTRIENT_CARD_SOURCES_LABEL}</h4>
                    <p className="text-xs text-textMuted">{nutrient.foodSources.join('، ')}</p>
                </div>
                <div className="pt-2 border-t border-border/50">
                    <h4 className="text-sm font-semibold text-textBase mb-1">{MICRONUTRIENT_CARD_DEFICIENCY_LABEL}</h4>
                    <p className="text-xs text-textMuted">{nutrient.deficiencySymptoms.join('، ')}</p>
                </div>
            </div>
        </details>
    );
};

const MicronutrientAnalysisView: React.FC = () => {
    const { userData, setCurrentView } = useAppContext();

    const recommendations = useMemo(() => {
        if (!userData) return [];
        
        return NUTRIENT_DATA.map(nutrient => {
            const userRda = getRecommendedValue(nutrient, userData);
            const userUl = getUpperLimitValue(nutrient, userData);
            const smartNotes = getSmartNotes(nutrient, userData);
            return userRda ? { nutrient, userRda, userUl, smartNotes } : null;
        }).filter(item => item !== null) as { nutrient: Nutrient; userRda: number; userUl: number | null; smartNotes: string[] }[];

    }, [userData]);

    if (!userData) {
        return (
            <div className="w-full max-w-lg text-center p-6 bg-card/70 rounded-xl shadow-xl flex flex-col items-center gap-4">
                <AlertCircle size={48} className="text-accent" />
                <h2 className="text-xl font-semibold text-primary-light">{MICRONUTRIENT_NO_DATA}</h2>
                <button onClick={() => setCurrentView('userInput')} className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-5 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2 transform [@media(hover:hover)]:hover:scale-105 active:scale-100">
                    {START_CALCULATION_BUTTON}
                </button>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-3xl space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <Pill size={30} />
                    <span>{MICRONUTRIENT_ANALYSIS_TITLE}</span>
                </h2>
                <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">{MICRONUTRIENT_ANALYSIS_DESCRIPTION}</p>
            </div>

            <div className="p-3 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs rounded-lg border border-blue-500/20 flex items-start gap-2">
                <Info size={18} className="flex-shrink-0 mt-0.5"/>
                <span>القيم المعروضة هي الكميات الموصى بها (RDA) والحد الأعلى للتحمل (UL) بناءً على بياناتك. هذه ليست نصيحة طبية.</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                {recommendations.map(rec => (
                    <NutrientCard key={rec.nutrient.id} {...rec} />
                ))}
            </div>
        </div>
    );
};

export default MicronutrientAnalysisView;