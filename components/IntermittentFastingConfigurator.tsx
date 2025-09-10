
import React, { useState } from 'react';
import { IntermittentFastingConfig } from '../types';

interface IntermittentFastingConfiguratorProps {
  onSubmit: (config: IntermittentFastingConfig) => void;
  initialConfig?: IntermittentFastingConfig;
}

const IntermittentFastingConfigurator: React.FC<IntermittentFastingConfiguratorProps> = ({ onSubmit, initialConfig }) => {
  const [config, setConfig] = useState<IntermittentFastingConfig>(initialConfig || {
    eatingWindowStart: '12:00',
    eatingWindowEnd: '20:00',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation could be added here (e.g., end time after start time)
    onSubmit(config);
  };

  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm transition-all duration-200";
  const labelClass = "block text-sm font-medium text-textBase mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-lg mt-4 p-4 sm:p-6 bg-card/70 rounded-xl shadow-lg animate-fadeIn">
      <h3 className="text-xl font-semibold text-primary-light text-center mb-4">إعدادات الصيام المتقطع (16/8)</h3>
      <p className="text-textMuted mb-4 text-sm text-center">حدد نافذة الأكل الخاصة بك (عادة 8 ساعات).</p>
      
      <div>
        <label htmlFor="eatingWindowStart" className={labelClass}>بداية نافذة الأكل</label>
        <input type="time" id="eatingWindowStart" name="eatingWindowStart" value={config.eatingWindowStart} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label htmlFor="eatingWindowEnd" className={labelClass}>نهاية نافذة الأكل</label>
        <input type="time" id="eatingWindowEnd" name="eatingWindowEnd" value={config.eatingWindowEnd} onChange={handleChange} className={inputClass} />
      </div>
      
      <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-primary/40 transform [@media(hover:hover)]:hover:scale-105">
        تأكيد الإعدادات
      </button>
    </form>
  );
};

export default IntermittentFastingConfigurator;