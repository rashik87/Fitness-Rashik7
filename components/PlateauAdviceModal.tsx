
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertTriangle, Lightbulb, Weight, TrendingDown, TrendingUp, Minus, Calculator, Zap } from 'lucide-react';
import { 
    PLATEAU_ADVICE_MODAL_TITLE, 
    GENERATING_ADVICE_MESSAGE, 
    PLATEAU_ADVICE_ERROR,
    PLATEAU_ADVICE_SUBTITLE,
    PLATEAU_WEIGHT_TREND_TITLE,
    PLATEAU_WEIGHT_TREND_DESCRIPTION,
    PLATEAU_AI_ACTIONS_TITLE,
    PLATEAU_GOTO_CALCULATOR_BUTTON,
    PLATEAU_GOTO_BURNED_CALORIES_BUTTON
} from '../constants';
import { WeightEntry } from '../types';

interface PlateauAdviceModalProps {
    onClose: () => void;
    getAdvice: () => Promise<string>;
    recentEntries: WeightEntry[];
    onGoToCalculator: () => void;
    onGoToBurnedCalories: () => void;
}

const PlateauAdviceModal: React.FC<PlateauAdviceModalProps> = ({ onClose, getAdvice, recentEntries, onGoToCalculator, onGoToBurnedCalories }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [advice, setAdvice] = useState<string>('');

    useEffect(() => {
        const fetchAdvice = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getAdvice();
                setAdvice(result);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(PLATEAU_ADVICE_ERROR);
                }
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdvice();
    }, [getAdvice]);

    const weightTrend = useMemo(() => {
        if (recentEntries.length < 2) return null;
        const latest = recentEntries[0];
        const oldest = recentEntries[recentEntries.length - 1];
        const diff = latest.weight - oldest.weight;
        let TrendIcon = Minus;
        if (diff > 0.1) TrendIcon = TrendingUp;
        if (diff < -0.1) TrendIcon = TrendingDown;

        return {
            startWeight: oldest.weight,
            endWeight: latest.weight,
            count: recentEntries.length,
            Icon: TrendIcon
        };
    }, [recentEntries]);

    const parsedAdvice = useMemo(() => {
        if (!advice) return null;
        const parts = advice.split(/###\s(.+)/).filter(part => part.trim() !== '');
        if (parts.length < 2) {
             return { intro: advice, sections: [] };
        }
        const intro = parts[0];
        const sections: { title: string; items: string[] }[] = [];
        for (let i = 1; i < parts.length; i += 2) {
            sections.push({
                title: parts[i].trim(),
                items: parts[i+1].split(/\d+\.\s/).filter(item => item.trim() !== '').map(item => item.trim())
            });
        }
        return { intro, sections };
    }, [advice]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <h3 className="text-lg font-semibold text-primary-light">لحظة من فضلك...</h3>
                    <p className="text-textMuted text-sm">{GENERATING_ADVICE_MESSAGE}</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <AlertTriangle className="text-accent" size={48} />
                    <h3 className="text-lg font-semibold text-accent">{PLATEAU_ADVICE_ERROR}</h3>
                    <p className="text-textMuted text-sm">{error}</p>
                    <button onClick={onClose} className="mt-4 bg-primary text-white font-semibold py-2 px-6 rounded-lg">
                        إغلاق
                    </button>
                </div>
            );
        }
        
        return (
             <div className="text-right space-y-4">
                {weightTrend && (
                    <div className="p-3 bg-inputBg/50 rounded-lg border border-border/50 text-center">
                        <h4 className="text-sm font-semibold text-textBase flex items-center justify-center gap-2">{weightTrend.Icon && <weightTrend.Icon size={18} />} {PLATEAU_WEIGHT_TREND_TITLE}</h4>
                        <p className="text-xs text-textMuted mt-1">{PLATEAU_WEIGHT_TREND_DESCRIPTION(weightTrend.startWeight, weightTrend.endWeight, weightTrend.count)}</p>
                    </div>
                )}
                <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 text-sm">
                    {parsedAdvice && (
                        <>
                            <p className="text-textBase italic">{parsedAdvice.intro}</p>
                            {parsedAdvice.sections.map((section, index) => (
                                <div key={index}>
                                    <h4 className="font-bold text-primary-light mb-2">{section.title}</h4>
                                    <ul className="list-disc ps-5 space-y-1.5 text-textBase">
                                        {section.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <div className="pt-4 border-t border-border">
                    <h4 className="text-md font-semibold text-center text-textBase mb-3">{PLATEAU_AI_ACTIONS_TITLE}</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={onGoToCalculator} className="flex-1 flex items-center justify-center gap-2 bg-secondary/20 text-secondary-dark font-semibold py-2.5 px-4 rounded-lg hover:bg-secondary/30 transition-colors">
                            <Calculator size={16} /> {PLATEAU_GOTO_CALCULATOR_BUTTON}
                        </button>
                        <button onClick={onGoToBurnedCalories} className="flex-1 flex items-center justify-center gap-2 bg-secondary/20 text-secondary-dark font-semibold py-2.5 px-4 rounded-lg hover:bg-secondary/30 transition-colors">
                            <Zap size={16} /> {PLATEAU_GOTO_BURNED_CALORIES_BUTTON}
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="w-full bg-primary text-white font-semibold py-3 rounded-lg mt-2">
                    فهمت، شكرًا!
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true" aria-labelledby="advice-title">
            <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-primary/20 relative animate-scaleIn">
                 <div className="text-center mb-4">
                    <div className="mx-auto w-fit p-3 bg-primary/20 rounded-full mb-3">
                         <Lightbulb size={28} className="text-primary" />
                    </div>
                    <h2 id="advice-title" className="text-xl font-bold text-primary-light">{PLATEAU_ADVICE_MODAL_TITLE}</h2>
                     {!isLoading && !error && <p className="text-xs text-textMuted mt-1">{PLATEAU_ADVICE_SUBTITLE}</p>}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default PlateauAdviceModal;