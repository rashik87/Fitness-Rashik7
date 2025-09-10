
import React, { useState } from 'react';
import { Goal, GoalSettings } from '../types';
import { GOAL_OPTIONS, DEFICIT_SURPLUS_OPTIONS } from '../constants';

interface GoalSelectorProps {
  onSubmit: (settings: GoalSettings) => void;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({ onSubmit }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedModifier, setSelectedModifier] = useState<number>(0); 

  const handleGoalChange = (goal: Goal) => {
    setSelectedGoal(goal);
    if (goal === Goal.MAINTAIN_WEIGHT) {
      setSelectedModifier(0); 
    } else if (goal === Goal.MINI_CUT) {
      setSelectedModifier(0.25); // Fixed 25% deficit for mini-cut
    }
    else {
      // For lose/gain, set a default modifier if none is selected
      if(selectedModifier === 0 || selectedModifier === 0.25) { 
        setSelectedModifier(DEFICIT_SURPLUS_OPTIONS[1]?.value || 0.15); 
      }
    }
  };

  const handleModifierChange = (modifier: number) => {
    setSelectedModifier(modifier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoal) {
      onSubmit({ goal: selectedGoal, modifier: selectedModifier });
    }
  };

  const buttonBaseClass = "w-full text-center p-4 my-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-background text-textBase font-semibold text-base shadow-md";
  const buttonSelectedClass = "bg-primary text-white shadow-lg scale-105";
  const buttonUnselectedClass = "bg-card hover:bg-primary/20 border border-border";

  const modifierButtonBaseClass = "flex-1 py-3 px-2 rounded-lg transition-all duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-card focus:ring-primary";
  const modifierButtonSelectedClass = "bg-primary-dark text-white shadow-md scale-105";
  const modifierButtonUnselectedClass = "bg-inputBg/60 hover:bg-primary/20 border border-border text-textBase";


  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-lg">
      <h2 className="text-xl md:text-2xl font-bold text-primary-light text-center mb-6">حدد هدفك الأساسي</h2>
      
      <div role="radiogroup" aria-labelledby="goal-heading" className="space-y-3">
        <p id="goal-heading" className="sr-only">اختر هدفك</p>
        {GOAL_OPTIONS.map(opt => (
          <button
            type="button"
            key={opt.value}
            onClick={() => handleGoalChange(opt.value)}
            className={`${buttonBaseClass} ${selectedGoal === opt.value ? buttonSelectedClass : buttonUnselectedClass}`}
            aria-pressed={selectedGoal === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={`mt-6 p-4 bg-card/50 rounded-lg shadow-inner transition-all duration-500 ease-in-out overflow-hidden ${selectedGoal === Goal.LOSE_WEIGHT || selectedGoal === Goal.GAIN_WEIGHT ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 p-0 m-0 border-0'}`} role="radiogroup" aria-labelledby="modifier-heading">
        <h3 id="modifier-heading" className="text-md sm:text-lg font-medium text-textBase mb-3 text-center">
          {selectedGoal === Goal.LOSE_WEIGHT ? 'اختر نسبة العجز اليومي في السعرات:' : 'اختر نسبة الفائض اليومي في السعرات:'}
        </h3>
        <div className="flex justify-center space-x-2 rtl:space-x-reverse">
          {DEFICIT_SURPLUS_OPTIONS.map(opt => (
            <button
              type="button"
              key={opt.value}
              onClick={() => handleModifierChange(opt.value)}
              className={`${modifierButtonBaseClass} ${selectedModifier === opt.value ? modifierButtonSelectedClass : modifierButtonUnselectedClass}`}
              aria-pressed={selectedModifier === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={!selectedGoal}
        className="w-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary-light focus:ring-offset-2 focus:ring-offset-background transform [@media(hover:hover)]:hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100"
      >
        عرض النتائج والخطة
      </button>
    </form>
  );
};

export default GoalSelector;