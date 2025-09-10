import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DailyLog, LoggedFoodItem, LoggedExerciseItem, Macros } from '../types';
import {
    DAILY_DIARY_TITLE, SELECT_DATE_LABEL, DIARY_SUMMARY_TITLE, TARGET_LABEL, CONSUMED_LABEL, REMAINING_LABEL,
    NET_CALORIES_LABEL, BURNED_LABEL, CALORIES_LABEL, PROTEIN_LABEL, CARBS_LABEL, FAT_LABEL,
    MEALS_LOGGED_TITLE, EXERCISES_LOGGED_TITLE, ADD_FOOD_TO_DIARY_BUTTON, ADD_EXERCISE_TO_DIARY_BUTTON,
    NO_FOOD_LOGGED_YET, NO_EXERCISES_LOGGED_YET, DELETE_LOG_ENTRY_CONFIRM, CONFIRM_BUTTON, CANCEL_BUTTON,
    WATER_TRACKING_TITLE, WATER_CUP_SIZE_ML, WATER_HYDRATION_GUIDE_LINK, LOG_FROM_PLAN_BUTTON, NO_SAVED_PLANS_TO_LOG, LOG_FROM_PLAN_CONFIRM
} from '../constants';
import { Calendar, Flame, Beef, Wheat, Droplets, PlusCircle, Trash2, MinusCircle, Droplet, HelpCircle } from 'lucide-react';
import AddFoodLogModal from './EditMealModal'; // Repurposed file
import AddExerciseLogModal from './AddExerciseLogModal';
import UrineColorChartModal from './UrineColorChartModal';

const MacroProgressBar: React.FC<{ label: string; consumed: number; target: number; icon: React.ReactNode; color: string }> = ({ label, consumed, target, icon, color }) => {
    const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
    const isOver = consumed > target;
    return (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <div className="flex items-center gap-1.5 font-semibold" style={{ color }} >{icon}<span>{label}</span></div>
                <span className={`font-mono ${isOver ? 'text-accent' : 'text-textMuted'}`}>{Math.round(consumed)} / {Math.round(target)}</span>
            </div>
            <div className="w-full bg-inputBg rounded-full h-2 shadow-inner">
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: isOver ? '#EC4899' : color }}></div>
            </div>
        </div>
    );
};

const DiarySummary: React.FC<{ consumedMacros: Macros; targetMacros: Macros; burnedCalories: number }> = ({ consumedMacros, targetMacros, burnedCalories }) => {
    const remainingCalories = targetMacros.calories - consumedMacros.calories;
    const netCalories = consumedMacros.calories - burnedCalories;
    return (
        <section className="p-4 bg-card/70 rounded-xl shadow-lg border-t-4 border-primary">
            <h3 className="text-lg font-semibold text-primary-light mb-4 text-center">{DIARY_SUMMARY_TITLE}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-4">
                <div>
                    <p className="text-2xl font-bold text-secondary">{Math.round(consumedMacros.calories)}</p>
                    <p className="text-xs text-textMuted">{CONSUMED_LABEL}</p>
                </div>
                <div>
                     <p className="text-2xl font-bold text-textBase">{Math.round(remainingCalories)}</p>
                     <p className="text-xs text-textMuted">{REMAINING_LABEL}</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold text-accent">{Math.round(burnedCalories)}</p>
                    <p className="text-xs text-textMuted">{BURNED_LABEL}</p>
                </div>
            </div>
             <p className="text-center text-sm font-semibold text-textBase mb-4">{NET_CALORIES_LABEL}: <span className="text-primary-light font-bold">{Math.round(netCalories)} {CALORIES_LABEL}</span></p>

            <div className="space-y-3 pt-3 border-t border-border/50">
                <MacroProgressBar label={PROTEIN_LABEL} consumed={consumedMacros.protein} target={targetMacros.protein} icon={<Beef size={14} />} color="#F87171" />
                <MacroProgressBar label={CARBS_LABEL} consumed={consumedMacros.carbs} target={targetMacros.carbs} icon={<Wheat size={14} />} color="#34D399" />
                <MacroProgressBar label={FAT_LABEL} consumed={consumedMacros.fat} target={targetMacros.fat} icon={<Droplets size={14} />} color="#60A5FA" />
            </div>
        </section>
    );
};

const LoggedFoodItemCard: React.FC<{ item: LoggedFoodItem; onDelete: (item: LoggedFoodItem) => void; }> = ({ item, onDelete }) => {
    return (
        <div className="bg-card/90 p-3 rounded-lg shadow-md animate-slideInUp">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-primary-light">{item.name}</p>
                    <p className="text-xs text-textMuted">{item.quantity} {item.unit}</p>
                </div>
                 <div className="text-right">
                     <p className="font-semibold text-secondary">{item.macros.calories.toFixed(0)} <span className="text-xs text-textMuted">سعرة</span></p>
                     <button onClick={() => onDelete(item)} className="text-accent hover:text-accent-dark p-1" aria-label={`حذف ${item.name}`}><Trash2 size={14}/></button>
                 </div>
            </div>
             <div className="grid grid-cols-3 gap-x-2 text-xs text-textMuted pt-2 border-t border-border/50 mt-2">
                <p><strong>{item.macros.protein.toFixed(1)}</strong> بروتين</p>
                <p><strong>{item.macros.carbs.toFixed(1)}</strong> كارب</p>
                <p><strong>{item.macros.fat.toFixed(1)}</strong> دهون</p>
            </div>
        </div>
    );
};

const LoggedExerciseItemCard: React.FC<{ item: LoggedExerciseItem; onDelete: (item: LoggedExerciseItem) => void; }> = ({ item, onDelete }) => {
    return (
         <div className="bg-card/90 p-3 rounded-lg shadow-md animate-slideInUp">
             <div className="flex justify-between items-start">
                 <div>
                    <p className="font-semibold text-primary-light">{item.activityDescription}</p>
                    <p className="text-xs text-textMuted">{item.durationMinutes} دقيقة</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-accent">{item.caloriesBurned.toFixed(0)} <span className="text-xs text-textMuted">سعرة</span></p>
                    <button onClick={() => onDelete(item)} className="text-accent hover:text-accent-dark p-1" aria-label={`حذف ${item.activityDescription}`}><Trash2 size={14}/></button>
                </div>
            </div>
        </div>
    );
};


const DailyDiaryView: React.FC = () => {
    const { 
        dailyLogs, getLogForDate, addFoodToLog, addExerciseToLog, removeFromLog,
        userTargetMacros, showTemporaryNotification, setWaterIntake,
        savedMealPlans, fullMealPlan, handleLoadPlan
    } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<LoggedFoodItem | LoggedExerciseItem | null>(null);
    const [showUrineChart, setShowUrineChart] = useState(false);
    
    const activeLog = useMemo(() => getLogForDate(selectedDate), [selectedDate, getLogForDate, dailyLogs]);

    const consumedMacros = useMemo((): Macros => {
        return activeLog.food.reduce((totals, item) => {
            totals.calories += item.macros.calories;
            totals.protein += item.macros.protein;
            totals.carbs += item.macros.carbs;
            totals.fat += item.macros.fat;
            return totals;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [activeLog]);

    const burnedCalories = useMemo((): number => {
        return activeLog.exercises.reduce((total, item) => total + item.caloriesBurned, 0);
    }, [activeLog]);

    const handleAddFood = (food: Omit<LoggedFoodItem, 'logId' | 'loggedAt'>) => {
        addFoodToLog(selectedDate, food);
        showTemporaryNotification('success', `تمت إضافة "${food.name}"`);
    };

    const handleAddExercise = (exercise: Omit<LoggedExerciseItem, 'logId' | 'loggedAt'>) => {
        addExerciseToLog(selectedDate, exercise);
        showTemporaryNotification('success', `تمت إضافة تمرين "${exercise.activityDescription}"`);
    };

    const handleDeleteRequest = (item: LoggedFoodItem | LoggedExerciseItem) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            removeFromLog(selectedDate, itemToDelete.logId);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setItemToDelete(null);
    };
    
    const handleLogFromPlan = () => {
        const latestPlan = savedMealPlans[0];
        if (!latestPlan) {
            showTemporaryNotification('error', NO_SAVED_PLANS_TO_LOG);
            return;
        }
        if (!window.confirm(LOG_FROM_PLAN_CONFIRM)) return;

        const dayToLog = latestPlan.plan[0]; // Always log Day 1 of the latest plan
        if (!dayToLog) return;

        dayToLog.meals.forEach(meal => {
            if (meal.recipeSnapshot) {
                addFoodToLog(selectedDate, {
                    type: 'recipe',
                    sourceId: meal.recipeSnapshot.id,
                    name: meal.recipeSnapshot.name,
                    quantity: meal.quantityOfRecipeServings,
                    unit: 'servings',
                    macros: {
                        calories: meal.recipeSnapshot.perServingMacros.calories * meal.quantityOfRecipeServings,
                        protein: meal.recipeSnapshot.perServingMacros.protein * meal.quantityOfRecipeServings,
                        carbs: meal.recipeSnapshot.perServingMacros.carbs * meal.quantityOfRecipeServings,
                        fat: meal.recipeSnapshot.perServingMacros.fat * meal.quantityOfRecipeServings,
                    }
                });
            }
        });
         showTemporaryNotification('success', 'تم تسجيل وجبات الخطة بنجاح!');
    };

    const targetMacros = userTargetMacros || { calories: 2000, protein: 150, carbs: 200, fat: 60 };

    return (
        <div className="w-full max-w-3xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{DAILY_DIARY_TITLE}</h2>
                <div className="flex items-center gap-2 bg-card/80 p-2 rounded-lg shadow-md">
                     <label htmlFor="diaryDate" className="text-sm font-medium text-textMuted whitespace-nowrap">{SELECT_DATE_LABEL}</label>
                     <input type="date" id="diaryDate" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-inputBg border border-border text-textBase rounded-md p-2 focus:ring-1 focus:ring-primary outline-none" />
                </div>
            </div>

            <DiarySummary consumedMacros={consumedMacros} targetMacros={targetMacros} burnedCalories={burnedCalories} />
            
             <section className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-primary-light">{WATER_TRACKING_TITLE}</h3>
                    <button onClick={() => setShowUrineChart(true)} className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        <HelpCircle size={14}/> {WATER_HYDRATION_GUIDE_LINK}
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setWaterIntake(selectedDate, activeLog.waterIntakeMl - WATER_CUP_SIZE_ML)} className="p-2 rounded-full bg-subtleButton-bg hover:bg-subtleButton-hover transition-colors"><MinusCircle size={24}/></button>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary flex items-baseline justify-center gap-1">
                            <Droplet/>
                            <span>{activeLog.waterIntakeMl}</span>
                        </p>
                        <p className="text-xs text-textMuted">مل / {activeLog.waterIntakeGoalMl} مل</p>
                    </div>
                    <button onClick={() => setWaterIntake(selectedDate, activeLog.waterIntakeMl + WATER_CUP_SIZE_ML)} className="p-2 rounded-full bg-subtleButton-bg hover:bg-subtleButton-hover transition-colors"><PlusCircle size={24}/></button>
                </div>
                <div className="w-full bg-inputBg rounded-full h-2.5 shadow-inner">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{width: `${Math.min(activeLog.waterIntakeMl / activeLog.waterIntakeGoalMl * 100, 100)}%`}}></div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-primary-light">{MEALS_LOGGED_TITLE}</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={handleLogFromPlan} disabled={savedMealPlans.length === 0} className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={LOG_FROM_PLAN_BUTTON}>
                                من الخطة
                            </button>
                            <button onClick={() => setShowAddFoodModal(true)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"><PlusCircle size={18}/><span>إضافة</span></button>
                        </div>
                    </div>
                     <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                        {activeLog.food.length > 0 ? (
                           [...activeLog.food].sort((a,b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()).map(item => <LoggedFoodItemCard key={item.logId} item={item} onDelete={handleDeleteRequest} />)
                        ) : (
                            <p className="text-sm text-textMuted text-center p-4">{NO_FOOD_LOGGED_YET}</p>
                        )}
                    </div>
                </section>
                <section className="p-4 bg-card/70 rounded-xl shadow-lg space-y-3">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-primary-light">{EXERCISES_LOGGED_TITLE}</h3>
                        <button onClick={() => setShowAddExerciseModal(true)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"><PlusCircle size={18}/><span>إضافة</span></button>
                    </div>
                     <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                        {activeLog.exercises.length > 0 ? (
                            [...activeLog.exercises].sort((a,b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()).map(item => <LoggedExerciseItemCard key={item.logId} item={item} onDelete={handleDeleteRequest} />)
                        ) : (
                            <p className="text-sm text-textMuted text-center p-4">{NO_EXERCISES_LOGGED_YET}</p>
                        )}
                    </div>
                </section>
            </div>
            
            {showAddFoodModal && (
                <AddFoodLogModal 
                    onClose={() => setShowAddFoodModal(false)}
                    onAddFood={handleAddFood}
                />
            )}
            {showAddExerciseModal && (
                <AddExerciseLogModal
                    onClose={() => setShowAddExerciseModal(false)}
                    onAddExercise={handleAddExercise}
                />
            )}
            {showUrineChart && (
                <UrineColorChartModal onClose={() => setShowUrineChart(false)} />
            )}
            
            {itemToDelete && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-enter">
                    <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-accent/50">
                        <h4 className="text-lg font-semibold text-accent mb-3">{`حذف "${'activityDescription' in itemToDelete ? itemToDelete.activityDescription : itemToDelete.name}"`}</h4>
                        <p className="text-textBase text-sm mb-4">{DELETE_LOG_ENTRY_CONFIRM}</p>
                        <div className="flex space-x-3 rtl:space-x-reverse">
                            <button onClick={handleConfirmDelete} className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md">
                                {CONFIRM_BUTTON}
                            </button>
                            <button onClick={handleCancelDelete} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md">
                                {CANCEL_BUTTON}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyDiaryView;