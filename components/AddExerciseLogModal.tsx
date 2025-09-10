
import React, { useState, useMemo } from 'react';
import { MetActivity } from '../types';
import { ActivityCategory } from '../data/metActivities';
import { MET_ACTIVITIES } from '../data/metActivities';
import { useAppContext } from '../contexts/AppContext';
import {
    ADD_EXERCISE_TO_DIARY_BUTTON, SEARCH_ACTIVITY_PLACEHOLDER, DURATION_MIN_LABEL,
    NO_ACTIVITY_SELECTED_ERROR, FILL_REQUIRED_FIELDS_ERROR, ADD_LOG_ENTRY_BUTTON, CANCEL_BUTTON
} from '../constants';
import { Search, X, Dumbbell, AlertTriangle } from 'lucide-react';
import { calculateBurnedCalories } from '../services/burnedCaloriesService';

interface AddExerciseLogModalProps {
    onClose: () => void;
    onAddExercise: (exercise: { activityDescription: string, durationMinutes: number, caloriesBurned: number }) => void;
}

const AddExerciseLogModal: React.FC<AddExerciseLogModalProps> = ({ onClose, onAddExercise }) => {
    const { userData } = useAppContext();
    const [duration, setDuration] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<MetActivity | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isActivityListOpen, setIsActivityListOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredActivities = useMemo(() => {
        if (!searchTerm) {
            return MET_ACTIVITIES.reduce((acc, activity) => {
                (acc[activity.category] = acc[activity.category] || []).push(activity);
                return acc;
            }, {} as Record<ActivityCategory, MetActivity[]>);
        }
        return MET_ACTIVITIES
            .filter(activity => activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .reduce((acc, activity) => {
                (acc[activity.category] = acc[activity.category] || []).push(activity);
                return acc;
            }, {} as Record<ActivityCategory, MetActivity[]>);
    }, [searchTerm]);

    const handleSelectActivity = (activity: MetActivity) => {
        setSelectedActivity(activity);
        setSearchTerm(activity.description);
        setIsActivityListOpen(false);
        setError(null);
    };

    const handleAdd = () => {
        setError(null);
        if (!userData) {
            setError("يرجى إدخال بياناتك في الحاسبة أولاً.");
            return;
        }
        const durationNum = parseFloat(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
            setError(FILL_REQUIRED_FIELDS_ERROR);
            return;
        }
        if (!selectedActivity) {
            setError(NO_ACTIVITY_SELECTED_ERROR);
            return;
        }

        const { calories } = calculateBurnedCalories({
            weightKg: userData.weight,
            durationMin: durationNum,
            age: userData.age,
            gender: userData.gender,
            metValue: selectedActivity.met,
        });

        onAddExercise({
            activityDescription: selectedActivity.description,
            durationMinutes: durationNum,
            caloriesBurned: calories,
        });
        onClose();
    };
    
    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm";

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true">
            <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-lg ring-1 ring-primary/20 relative animate-scaleIn max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 left-4 text-textMuted hover:text-textBase transition-colors p-1" aria-label="إغلاق"><X size={20} /></button>
                <div className="text-center mb-4">
                    <div className="mx-auto w-fit p-3 bg-primary/20 rounded-full mb-3"><Dumbbell size={28} className="text-primary" /></div>
                    <h2 className="text-xl font-bold text-primary-light">{ADD_EXERCISE_TO_DIARY_BUTTON}</h2>
                </div>

                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                    <div className="relative">
                        <label htmlFor="activitySearch" className="block text-sm font-medium text-textBase mb-2">{SEARCH_ACTIVITY_PLACEHOLDER}</label>
                        <div className="relative">
                            <input type="text" id="activitySearch" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setIsActivityListOpen(true); }} onFocus={() => setIsActivityListOpen(true)} onBlur={() => setTimeout(() => setIsActivityListOpen(false), 200)} className={`${inputClass} ps-10`} placeholder="ابحث عن نشاط..." />
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
                        </div>
                        {isActivityListOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {Object.keys(filteredActivities).length > 0 ? (
                                    Object.entries(filteredActivities).map(([category, activities]) => (
                                        <div key={category as string}>
                                            <h4 className="p-2 text-xs font-bold text-primary-light bg-card/50 sticky top-0">{category as string}</h4>
                                            <ul>
                                                {activities.map(activity => (
                                                    <li key={activity.code} onMouseDown={() => handleSelectActivity(activity)} className="p-2 text-sm hover:bg-primary/20 cursor-pointer">{activity.description}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : <p className="p-3 text-sm text-textMuted">لا توجد نتائج</p>}
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-textBase mb-2">{DURATION_MIN_LABEL}</label>
                        <input type="number" id="duration" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} placeholder="مثال: 30" />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 p-2 bg-accent/10 text-accent text-sm rounded-md border border-accent/20">
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto">
                    <button type="button" onClick={onClose} className="sm:w-1/3 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg shadow">{CANCEL_BUTTON}</button>
                    <button type="button" onClick={handleAdd} className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/40">{ADD_LOG_ENTRY_BUTTON}</button>
                </div>
            </div>
        </div>
    );
};

export default AddExerciseLogModal;