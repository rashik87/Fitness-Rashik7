
import React from 'react';
import { DietProtocol } from '../types';
import { DIET_PROTOCOL_OPTIONS } from '../constants';

interface DietSelectorProps {
  onSelect: (diet: DietProtocol) => void;
  currentDiet: DietProtocol;
}

const DietSelector: React.FC<DietSelectorProps> = ({ onSelect, currentDiet }) => {
  return (
    <div className="space-y-4 w-full max-w-lg">
      <label htmlFor="dietProtocol" className="block text-lg font-medium text-primary-light mb-2 text-center">اختر نظامك الغذائي المفضل</label>
      <select 
        id="dietProtocol" 
        value={currentDiet} 
        onChange={(e) => onSelect(e.target.value as DietProtocol)}
        className="w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm transition-all duration-200"
      >
        {DIET_PROTOCOL_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-card text-textBase">{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default DietSelector;