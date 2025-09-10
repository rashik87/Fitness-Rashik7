


import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { UserData, GoalSettings, DietProtocol, Macros, CarbCycleConfig, IntermittentFastingConfig, AdvancedPlanResult } from '../types';
import * as LocalStorageService from '../services/localStorageService';
import { createAdvancedPlan } from '../services/advancedCalorieService';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

interface CalculatorContextType {
  userData: UserData | null;
  goalSettings: GoalSettings | null;
  selectedDiet: DietProtocol;
  initialTdee: number | null;
  finalTdee: number | null;
  userTargetMacros: Macros | null;
  carbCycleConfig: CarbCycleConfig | null;
  intermittentFastingConfig: IntermittentFastingConfig | null;
  advancedPlan: AdvancedPlanResult | null;
  handleUserDataSubmit: (data: UserData) => void;
  updateUserData: (updatedFields: Partial<UserData>) => void;
  handleGoalSettingsSubmit: (settings: GoalSettings) => void;
  handleDietSelect: (diet: DietProtocol) => void;
  handleCarbCycleSubmit: (config: CarbCycleConfig) => void;
  handleIFSubmit: (config: IntermittentFastingConfig) => void;
  handleDietSelectionContinue: () => void;
  handleReset: () => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { setCurrentView } = useUI();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [goalSettings, setGoalSettings] = useState<GoalSettings | null>(null);
    const [selectedDiet, setSelectedDiet] = useState<DietProtocol>(DietProtocol.NONE);
    const [initialTdee, setInitialTdee] = useState<number | null>(null);
    const [finalTdee, setFinalTdee] = useState<number | null>(null);
    const [userTargetMacros, setUserTargetMacros] = useState<Macros | null>(null);
    const [carbCycleConfig, setCarbCycleConfig] = useState<CarbCycleConfig | null>(null);
    const [intermittentFastingConfig, setIntermittentFastingConfig] = useState<IntermittentFastingConfig | null>(null);
    const [advancedPlan, setAdvancedPlan] = useState<AdvancedPlanResult | null>(null);

    const clearState = useCallback(() => {
        setUserData(null);
        setGoalSettings(null);
        setSelectedDiet(DietProtocol.NONE);
        setInitialTdee(null);
        setFinalTdee(null);
        setUserTargetMacros(null);
        setCarbCycleConfig(null);
        setIntermittentFastingConfig(null);
        setAdvancedPlan(null);
    }, []);
    
    useEffect(() => {
        if (currentUser) {
            const savedState = LocalStorageService.getCalculatorState(currentUser.id);
            if (savedState) {
                setUserData(savedState.userData);
                setGoalSettings(savedState.goalSettings);
                setSelectedDiet(savedState.selectedDiet);
                setInitialTdee(savedState.initialTdee);
                setFinalTdee(savedState.finalTdee);
                setUserTargetMacros(savedState.userTargetMacros);
                setCarbCycleConfig(savedState.carbCycleConfig);
                setIntermittentFastingConfig(savedState.intermittentFastingConfig);
            } else {
                clearState();
            }
        } else {
            clearState();
        }
    }, [currentUser, clearState]);

    useEffect(() => {
        if (currentUser && userData && goalSettings && finalTdee !== null && userTargetMacros) {
            LocalStorageService.saveCalculatorState(currentUser.id, {
                userData, goalSettings, selectedDiet, initialTdee: initialTdee || 0, finalTdee, userTargetMacros, carbCycleConfig, intermittentFastingConfig
            });
        }
    }, [currentUser, userData, goalSettings, selectedDiet, initialTdee, finalTdee, userTargetMacros, carbCycleConfig, intermittentFastingConfig]);
    
    const updateUserData = (updatedFields: Partial<UserData>) => {
        setUserData(prev => {
            const newState = prev ? { ...prev, ...updatedFields } : updatedFields as UserData;
            if (currentUser) {
                // To keep data persistence on navigation, we might need to save partial updates too
                // This is a design choice; for now, let's assume the main save useEffect handles it.
            }
            return newState;
        });
    };

    const handleUserDataSubmit = (data: UserData) => {
        setUserData(data);
        setCurrentView('goalSelection');
    };

    const handleGoalSettingsSubmit = (settings: GoalSettings) => {
        if (!userData) {
            setCurrentView('userInput');
            return;
        }
        
        const plan = createAdvancedPlan(userData, settings);
        
        setAdvancedPlan(plan);

        // Save the core results for other app parts like the dashboard and meal planner
        setUserData(userData);
        setGoalSettings(settings);
        setInitialTdee(plan.tdee);
        setFinalTdee(plan.targetCalories);
        setUserTargetMacros(plan.targetMacros);
        
        // This flow doesn't use these, so reset them. They are used by the meal planner.
        setCarbCycleConfig(null);
        setIntermittentFastingConfig(null);

        setCurrentView('results');
    };
    
    const handleDietSelect = (diet: DietProtocol) => {
        setSelectedDiet(diet);
        if (diet !== DietProtocol.CARB_CYCLING) setCarbCycleConfig(null);
        if (diet !== DietProtocol.INTERMITTENT_FASTING) setIntermittentFastingConfig(null);
    };

    const handleCarbCycleSubmit = (config: CarbCycleConfig) => {
        if (finalTdee === null || !goalSettings || !userData) return;
        setCarbCycleConfig(config);
        setCurrentView('results');
    };

    const handleIFSubmit = (config: IntermittentFastingConfig) => {
        if (finalTdee === null || !goalSettings || !userData) return;
        setIntermittentFastingConfig(config);
        setCurrentView('results');
    };

    const handleDietSelectionContinue = () => {
         setCurrentView('results');
    };

    const handleReset = useCallback(() => {
        if (currentUser) {
            LocalStorageService.clearCalculatorState(currentUser.id);
        }
        clearState();
        setCurrentView('userInput');
    }, [currentUser, clearState, setCurrentView]);
    
    const contextValue: CalculatorContextType = {
        userData, goalSettings, selectedDiet, initialTdee, finalTdee, userTargetMacros, carbCycleConfig, intermittentFastingConfig,
        advancedPlan,
        handleUserDataSubmit, updateUserData, handleGoalSettingsSubmit, handleDietSelect, handleCarbCycleSubmit, handleIFSubmit,
        handleDietSelectionContinue, handleReset
    };

    return <CalculatorContext.Provider value={contextValue}>{children}</CalculatorContext.Provider>;
};

export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};