

import React from 'react';
import AppContent from './components/AppContent';
import { UIProvider } from './contexts/UIContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { CalculatorProvider } from './contexts/CalculatorContext';
import { MealPlanProvider } from './contexts/MealPlanContext';

const App: React.FC = () => {
  return (
    <UIProvider>
      <AuthProvider>
        <CalculatorProvider>
          <DataProvider>
            <MealPlanProvider>
              <AppContent />
            </MealPlanProvider>
          </DataProvider>
        </CalculatorProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;