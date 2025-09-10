
import React, { useState, useEffect, useMemo } from 'react';
import { UserData, Gender, MetActivity } from '../types';
import { ActivityCategory, MET_ACTIVITIES } from '../data/metActivities';
import { calculateBurnedCalories } from '../services/burnedCaloriesService';
import {
    BURNED_CALORIES_CALCULATOR_TITLE, BURNED_CALORIES_CALCULATOR_DESCRIPTION,
    WEIGHT_KG_LABEL, AGE_LABEL, GENDER_LABEL, DURATION_MIN_LABEL, HEART_RATE_BPM_LABEL,
    HEART_RATE_BPM_PLACEHOLDER, ACTIVITY_LABEL, SEARCH_ACTIVITY_PLACEHOLDER,
    CALCULATE_BURNED_CALORIES_BUTTON, BURNED_CALORIES_RESULT_TITLE, BURNED_CALORIES_RESULT_VALUE,
    CALCULATION_METHOD_USED_LABEL, MET_METHOD_NAME, HR_METHOD_NAME,
    NO_ACTIVITY_SELECTED_ERROR, FILL_REQUIRED_FIELDS_ERROR, GENDER_OPTIONS
} from '../constants';
import { Flame, Search } from 'lucide-react';

interface BurnedCaloriesCalculatorViewProps {
  userDataForCalc: UserData | null;
}

interface CalculationResult {
  calories: number;
  method: 'MET' | 'HR';
}

const BurnedCaloriesCalculatorView: React.FC<BurnedCaloriesCalculatorViewProps> = ({ userDataForCalc }) => {
  const [weight, setWeight] = useState(userDataForCalc?.weight.toString() || '');
  const [age, setAge] = useState(userDataForCalc?.age.toString() || '');
  const [gender, setGender] = useState<Gender>(userDataForCalc?.gender || Gender.MALE);
  const [duration, setDuration] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<MetActivity | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isActivityListOpen, setIsActivityListOpen] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userDataForCalc) {
      setWeight(userDataForCalc.weight.toString());
      setAge(userDataForCalc.age.toString());
      setGender(userDataForCalc.gender);
    }
  }, [userDataForCalc]);
  
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
  
  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const weightNum = parseFloat(weight);
    const ageNum = parseFloat(age);
    const durationNum = parseFloat(duration);

    if (isNaN(weightNum) || weightNum <= 0 || isNaN(ageNum) || ageNum <= 0 || isNaN(durationNum) || durationNum <= 0) {
      setError(FILL_REQUIRED_FIELDS_ERROR);
      return;
    }

    if (!selectedActivity) {
      setError(NO_ACTIVITY_SELECTED_ERROR);
      return;
    }
    
    const heartRateNum = parseFloat(heartRate);
    
    const calculationResult = calculateBurnedCalories({
        weightKg: weightNum,
        durationMin: durationNum,
        age: ageNum,
        gender: gender,
        metValue: selectedActivity.met,
        heartRateBpm: !isNaN(heartRateNum) && heartRateNum > 0 ? heartRateNum : undefined,
    });
    
    setResult(calculationResult);
  };

  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-colors duration-200";
  const labelClass = "block text-sm font-medium text-textBase mb-2";
  
  return (
    <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-light">{BURNED_CALORIES_CALCULATOR_TITLE}</h2>
            <p className="text-textMuted mt-2 text-sm max-w-lg mx-auto">{BURNED_CALORIES_CALCULATOR_DESCRIPTION}</p>
        </div>
        
        <div className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-primary space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="weight" className={labelClass}>{WEIGHT_KG_LABEL}</label>
                    <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} placeholder="e.g., 75" />
                </div>
                <div>
                    <label htmlFor="age" className={labelClass}>{AGE_LABEL}</label>
                    <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} className={inputClass} placeholder="e.g., 30" />
                </div>
                <div>
                    <label htmlFor="gender" className={labelClass}>{GENDER_LABEL}</label>
                    <select id="gender" value={gender} onChange={e => setGender(e.target.value as Gender)} className={inputClass}>
                        {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-card">{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="relative">
                <label htmlFor="activitySearch" className={labelClass}>{ACTIVITY_LABEL}</label>
                <div className="relative">
                    <input 
                        type="text" 
                        id="activitySearch"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setIsActivityListOpen(true); setSelectedActivity(null); }}
                        onFocus={() => setIsActivityListOpen(true)}
                        onBlur={() => setTimeout(() => setIsActivityListOpen(false), 200)}
                        className={`${inputClass} ps-10`}
                        placeholder={SEARCH_ACTIVITY_PLACEHOLDER}
                    />
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
                </div>
                {isActivityListOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {Object.keys(filteredActivities).length > 0 ? (
                           Object.entries(filteredActivities).map(([category, activities]) => (
                               <div key={category}>
                                   <h4 className="p-2 text-xs font-bold text-primary-light bg-card/50 sticky top-0">{category}</h4>
                                   <ul>
                                       {activities.map(activity => (
                                           <li key={activity.code}
                                               onMouseDown={() => handleSelectActivity(activity)}
                                               className="p-2 text-sm hover:bg-primary/20 cursor-pointer"
                                           >
                                               {activity.description} <span className="text-xs text-textMuted">(MET: {activity.met})</span>
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           ))
                        ) : <p className="p-3 text-sm text-textMuted">لا توجد نتائج</p>}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="duration" className={labelClass}>{DURATION_MIN_LABEL}</label>
                    <input type="number" id="duration" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} placeholder="e.g., 30" />
                </div>
                <div>
                    <label htmlFor="heartRate" className={labelClass}>{HEART_RATE_BPM_LABEL}</label>
                    <input type="number" id="heartRate" value={heartRate} onChange={e => setHeartRate(e.target.value)} className={inputClass} placeholder={HEART_RATE_BPM_PLACEHOLDER} />
                </div>
            </div>
            
            {error && <p className="text-accent text-sm text-center bg-accent/10 p-2 rounded-md">{error}</p>}
            
            <button onClick={handleCalculate} className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2 focus:ring-offset-background transform [@media(hover:hover)]:hover:scale-105">
                {CALCULATE_BURNED_CALORIES_BUTTON}
            </button>
        </div>
        
        {result && (
            <div className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-secondary text-center space-y-3 animate-scaleIn">
                <h3 className="text-lg sm:text-xl font-semibold text-secondary-light">{BURNED_CALORIES_RESULT_TITLE}</h3>
                <div className="flex items-center justify-center gap-3">
                    <Flame className="text-secondary" size={32}/>
                    <p className="text-5xl font-extrabold text-textBase">{result.calories}</p>
                    <p className="text-lg text-textMuted self-end pb-1">{BURNED_CALORIES_RESULT_VALUE}</p>
                </div>
                <p className="text-xs text-textMuted pt-2 border-t border-border/50">
                    {CALCULATION_METHOD_USED_LABEL} <strong>{result.method === 'HR' ? HR_METHOD_NAME : MET_METHOD_NAME}</strong>
                </p>
            </div>
        )}
    </div>
  );
};

export default BurnedCaloriesCalculatorView;
