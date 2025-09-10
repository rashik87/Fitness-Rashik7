
import React from 'react';
import { URINE_CHART_TITLE, URINE_CHART_INSTRUCTIONS, URINE_CHART_LEVELS, CANCEL_BUTTON } from '../constants';
import { X, Droplet } from 'lucide-react';

interface UrineColorChartModalProps {
    onClose: () => void;
}

const UrineColorChartModal: React.FC<UrineColorChartModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true" aria-labelledby="urine-chart-title">
            <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-primary/20 relative animate-scaleIn max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 left-4 text-textMuted hover:text-textBase transition-colors p-1" aria-label="إغلاق"><X size={20} /></button>
                <div className="text-center mb-4">
                    <div className="mx-auto w-fit p-3 bg-primary/20 rounded-full mb-3"><Droplet size={28} className="text-primary" /></div>
                    <h2 id="urine-chart-title" className="text-xl font-bold text-primary-light">{URINE_CHART_TITLE}</h2>
                    <p className="text-sm text-textMuted mt-1">{URINE_CHART_INSTRUCTIONS}</p>
                </div>

                <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                    {URINE_CHART_LEVELS.map((level, index) => (
                        <div key={index} className="flex items-center gap-4 p-2 rounded-lg">
                            <div 
                                className="w-12 h-12 rounded-full border-2 border-border/50 shadow-inner flex-shrink-0"
                                style={{ backgroundColor: level.color }}
                                aria-label={`لون البول: ${level.title}`}
                            ></div>
                            <div>
                                <h3 className="font-semibold text-textBase">{level.title}</h3>
                                <p className="text-xs text-textMuted">{level.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 shadow"
                    >
                        {CANCEL_BUTTON}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrineColorChartModal;