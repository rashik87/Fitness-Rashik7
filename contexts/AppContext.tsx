

import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { useCalculator } from './CalculatorContext';
import { useMealPlan } from './MealPlanContext';

// This is a pattern to combine contexts so that consumers don't need to
// import every single context hook. It also helps with dependency injection between contexts.
export const useAppContext = () => {
    const uiContext = useUI();
    const authContext = useAuth();
    const dataContext = useData();
    const calculatorContext = useCalculator();
    const mealPlanContext = useMealPlan();

    // The original handleUpgrade in AuthContext needs showTemporaryNotification from UIContext.
    // This composed hook is the perfect place to combine them.
    const handleUpgrade = () => {
        authContext.handleUpgrade(uiContext.showTemporaryNotification);
    };

    return {
        ...uiContext,
        ...authContext,
        ...dataContext,
        ...calculatorContext,
        ...mealPlanContext,
        // Override the original handleUpgrade with our new one that has the dependency injected.
        handleUpgrade,
    };
};