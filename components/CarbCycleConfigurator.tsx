
import React, { useState, useEffect } from 'react';
import { CarbCycleConfig } from '../types';

interface CarbCycleConfiguratorProps {
  onSubmit: (config: CarbCycleConfig) => void;
  initialConfig?: CarbCycleConfig;
}

const CarbCycleConfigurator: React.FC<CarbCycleConfiguratorProps> = ({ onSubmit, initialConfig }) => {
  const [config, setConfig] = useState<CarbCycleConfig>(initialConfig || {
    highCarbDays: 2,
    mediumCarbDays: 3,
    lowCarbDays: 2,
  });
  const [error, setError] = useState<string | null>(null);

  const totalDays = config.highCarbDays + config.mediumCarbDays + config.lowCarbDays;

  useEffect(() => {
    if (totalDays !== 7) {
      setError(`مجموع الأيام يجب أن يكون 7. حاليًا: ${totalDays}`);
    } else {
      setError(null);
    }
  }, [totalDays]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDays === 7) {
      onSubmit(config);
    } else {
      setError("يرجى التأكد من أن مجموع الأيام يساوي 7.");
    }
  };

  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
  const labelClass = "block text-sm font-medium text-textBase mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-lg mt-4 p-4 sm:p-6 bg-card/70 rounded-xl shadow-lg animate-fadeIn">
      <h3 className="text-xl font-semibold text-primary-light text-center mb-4">إعدادات تدوير الكربوهيدرات</h3>
      <p className="text-textMuted mb-4 text-sm text-center">حدد عدد أيام كل نوع من الكربوهيدرات في الأسبوع (المجموع يجب أن يكون 7 أيام).</p>
      
      <div>
        <label htmlFor="highCarbDays" className={labelClass}>أيام الكربوهيدرات المرتفعة</label>
        <input type="number" id="highCarbDays" name="highCarbDays" value={config.highCarbDays} onChange={handleChange} min="0" max="7" className={inputClass} />
      </div>
      <div>
        <label htmlFor="mediumCarbDays" className={labelClass}>أيام الكربوهيدرات المتوسطة</label>
        <input type="number" id="mediumCarbDays" name="mediumCarbDays" value={config.mediumCarbDays} onChange={handleChange} min="0" max="7" className={inputClass} />
      </div>
      <div>
        <label htmlFor="lowCarbDays" className={labelClass}>أيام الكربوهيدرات المنخفضة</label>
        <input type="number" id="lowCarbDays" name="lowCarbDays" value={config.lowCarbDays} onChange={handleChange} min="0" max="7" className={inputClass} />
      </div>

      {error && <p className="text-accent text-sm mt-2 p-2 bg-accent/20 rounded-md text-center">{error}</p>}
      <p className="text-textMuted text-sm text-center">المجموع الحالي: {totalDays} / 7 أيام</p>

      <button 
        type="submit" 
        disabled={totalDays !== 7}
        className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-primary/40 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:scale-100 transform [@media(hover:hover)]:hover:scale-105"
      >
        تأكيد الإعدادات
      </button>
    </form>
  );
};

export default CarbCycleConfigurator;