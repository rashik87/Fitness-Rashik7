import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Supplement, Goal, ActivityLevel, DietProtocol, UserData, Macros } from '../types';
import { SUPPLEMENT_DATA } from '../data/supplements';
import {
    SUPPLEMENTS_GUIDE_TITLE,
    SUPPLEMENTS_GUIDE_DESCRIPTION,
    SUPPLEMENTS_MEDICAL_DISCLAIMER,
    GOAL_OPTIONS,
    ACTIVITY_LEVEL_OPTIONS
} from '../constants';
import { Pill, Target, Heart, CheckCircle, AlertTriangle } from 'lucide-react';

const SupplementCard: React.FC<{ supplement: Supplement; reason: string; userData: UserData | null; userTargetMacros: Macros | null; }> = ({ supplement, reason, userData, userTargetMacros }) => {
    
    const personalizedDosage = useMemo(() => {
        if (!userData) return null;
        if (supplement.dosage.calculation) {
            return supplement.dosage.calculation(userData, userTargetMacros);
        }
        return null;
    }, [supplement, userData, userTargetMacros]);
    
    return (
        <div className="bg-card/90 p-4 rounded-xl shadow-lg border-s-4 border-primary/70 transition-all duration-300 hover:shadow-primary/20 [@media(hover:hover)]:hover:scale-[1.03] transform [@media(hover:hover)]:hover:-translate-y-1 flex flex-col">
            <h3 className="text-lg font-semibold text-primary-light flex items-center gap-2">
                <Pill size={20} />
                {supplement.name}
            </h3>
            <p className="text-sm text-textMuted my-2 flex-grow">{supplement.description}</p>
            
            <div className="mt-3 pt-3 border-t border-border/50">
                <h4 className="text-sm font-semibold text-textBase mb-2">أهم الفوائد:</h4>
                <ul className="space-y-1.5 text-xs text-textBase">
                    {supplement.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>

             <div className="mt-3 pt-3 border-t border-border/50">
                <h4 className="text-sm font-semibold text-textBase mb-2">الجرعة المقترحة:</h4>
                <div className="space-y-2 text-xs">
                    {personalizedDosage && (
                        <p className="p-2 bg-secondary/10 text-secondary-dark rounded-md border border-secondary/20 font-semibold">
                            {personalizedDosage}
                        </p>
                    )}
                    <p className="text-textBase">
                        <strong>الإرشادات العامة:</strong> {supplement.dosage.baseAmount} {supplement.dosage.unit} يوميًا.
                    </p>
                    {supplement.dosage.notes && (
                        <ul className="list-disc ps-4 text-textMuted space-y-1">
                            {supplement.dosage.notes.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 bg-primary/10 p-3 rounded-lg">
                <h4 className="text-sm font-bold text-primary-dark mb-1">سبب الاقتراح لك:</h4>
                <p className="text-xs text-primary-dark">{reason}</p>
            </div>
        </div>
    );
};


const SupplementsGuideView: React.FC = () => {
    const { userData, goalSettings, selectedDiet, userTargetMacros } = useAppContext();

    const getRelevanceReason = (supplement: Supplement): string | null => {
        if (!userData || !goalSettings) {
             if (supplement.relevanceCriteria.general) {
                return 'مكمل مفيد للصحة العامة لمعظم الأشخاص.';
             }
             return null;
        }

        const reasons: string[] = [];
        const criteria = supplement.relevanceCriteria;

        if (criteria.general) {
            return 'مكمل مفيد للصحة العامة لمعظم الأشخاص.';
        }

        if (criteria.goals?.includes(goalSettings.goal)) {
            const goalText = GOAL_OPTIONS.find(g => g.value === goalSettings.goal)?.label;
            reasons.push(`يدعم هدفك الحالي (${goalText})`);
        }
        
        if (criteria.activityLevels?.includes(userData.activityLevel)) {
            const activityText = ACTIVITY_LEVEL_OPTIONS.find(a => a.value === userData.activityLevel)?.label.split(' (')[0];
            reasons.push(`يناسب مستوى نشاطك (${activityText})`);
        }
        
        if (criteria.diets?.includes(selectedDiet)) {
            reasons.push(`مهم لنظامك الغذائي المتبع`);
        }

        if (reasons.length > 0) {
            return `مقترح بناءً على: ${reasons.join(' و ')}.`;
        }

        return null;
    };

    const recommendations = useMemo(() => {
        const forGoal: { supplement: Supplement; reason: string }[] = [];
        const forWellness: { supplement: Supplement; reason: string }[] = [];

        SUPPLEMENT_DATA.forEach(sup => {
            const reason = getRelevanceReason(sup);
            if (reason) {
                if (sup.relevanceCriteria.general) {
                    forWellness.push({ supplement: sup, reason });
                } else {
                    forGoal.push({ supplement: sup, reason });
                }
            }
        });

        return { forGoal, forWellness };

    }, [userData, goalSettings, selectedDiet]);

    return (
        <div className="w-full max-w-3xl space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <Pill size={30} />
                    <span>{SUPPLEMENTS_GUIDE_TITLE}</span>
                </h2>
                <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">{SUPPLEMENTS_GUIDE_DESCRIPTION}</p>
            </div>
            
            {recommendations.forGoal.length > 0 && (
                <section>
                    <h3 className="text-xl font-semibold text-secondary-light mb-4 flex items-center gap-2">
                        <Target size={22} />
                        موصى به لهدفك الحالي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.forGoal.map(({ supplement, reason }) => (
                            <SupplementCard 
                                key={supplement.id} 
                                supplement={supplement} 
                                reason={reason} 
                                userData={userData}
                                userTargetMacros={userTargetMacros}
                            />
                        ))}
                    </div>
                </section>
            )}

            {recommendations.forWellness.length > 0 && (
                 <section>
                    <h3 className="text-xl font-semibold text-secondary-light mb-4 flex items-center gap-2">
                        <Heart size={22} />
                        للصحة العامة واللياقة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.forWellness.map(({ supplement, reason }) => (
                           <SupplementCard 
                                key={supplement.id} 
                                supplement={supplement} 
                                reason={reason} 
                                userData={userData}
                                userTargetMacros={userTargetMacros}
                            />
                        ))}
                    </div>
                </section>
            )}
            
            <div className="mt-8 p-4 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 rounded-xl shadow-md border-2 border-yellow-500/50 flex items-start gap-3">
                <AlertTriangle size={24} className="flex-shrink-0 mt-1"/>
                <div>
                    <h4 className="font-bold">إخلاء مسؤولية هام</h4>
                    <p className="text-sm mt-1">{SUPPLEMENTS_MEDICAL_DISCLAIMER}</p>
                </div>
            </div>

        </div>
    );
};

export default SupplementsGuideView;