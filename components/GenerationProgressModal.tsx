

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { GENERATION_TIPS } from '../constants';

interface GenerationProgressModalProps {
    status: {
        isLoading: boolean;
        currentDay: number;
        totalDays: number;
        message: string;
    };
}

const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({ status }) => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [fakeProgress, setFakeProgress] = useState(0);

    useEffect(() => {
        let tipIntervalId: number;
        if (status.isLoading) {
            // Start tip rotation
            // FIX: Use window.setInterval to explicitly use the browser's implementation which returns a number, resolving the type conflict with Node.js's Timeout object.
            tipIntervalId = window.setInterval(() => {
                setCurrentTipIndex(prevIndex => (prevIndex + 1) % GENERATION_TIPS.length);
            }, 4000); // Change tip every 4 seconds

            // Reset progress on new generation
            setFakeProgress(0);
        }

        return () => window.clearInterval(tipIntervalId);
    }, [status.isLoading]);

    useEffect(() => {
        let progressIntervalId: number;
        if (status.isLoading) {
            // Animate the fake progress bar
            // FIX: Use window.setInterval to explicitly use the browser's implementation which returns a number, resolving the type conflict.
            progressIntervalId = window.setInterval(() => {
                setFakeProgress(prev => {
                    if (prev >= 95) {
                        // Stay at 95% until loading is complete
                        window.clearInterval(progressIntervalId);
                        return 95;
                    }
                    // Animate faster at the beginning, slower towards the end
                    const increment = prev < 70 ? 2 : 0.5;
                    return Math.min(prev + increment, 95);
                });
            }, 500); // Update progress every half second
        }

        return () => window.clearInterval(progressIntervalId);
    }, [status.isLoading]);

    if (!status.isLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true" aria-labelledby="progress-title">
            <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md ring-1 ring-primary/20 flex flex-col text-center items-center relative animate-scaleIn">
                <div className="mx-auto w-fit p-3 bg-primary/20 rounded-full mb-4">
                    <Sparkles size={32} className="text-primary" />
                </div>
                <h2 id="progress-title" className="text-xl font-bold text-primary-light mb-3">
                    جاري توليد الخطة الذكية...
                </h2>
                <p className="text-textMuted text-sm mb-6">
                    يقوم مساعد رشيق بتحليل وصفاتك وتوزيعها بذكاء. قد تستغرق هذه العملية دقيقة واحدة للحصول على أفضل النتائج.
                </p>
                
                <div className="w-full space-y-2">
                    <div className="w-full bg-inputBg rounded-full h-2.5 shadow-inner overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-light to-primary h-2.5 rounded-full transition-all duration-500 ease-linear" style={{ width: `${fakeProgress}%` }}></div>
                    </div>
                    <p className="text-sm text-textMuted">{`جارٍ التحميل... ${Math.round(fakeProgress)}%`}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border/50 w-full min-h-[60px] flex items-center justify-center">
                    <p className="text-xs text-textMuted italic animate-fadeIn">
                        {GENERATION_TIPS[currentTipIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GenerationProgressModal;
