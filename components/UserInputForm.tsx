
import React, { useState, useEffect, useMemo } from 'react';
import { UserData, Gender, ActivityLevel, PregnancyStatus, MedicalCondition, SportActivity, BodyFatSuggestion } from '../types';
import { 
    GENDER_OPTIONS, ACTIVITY_LEVEL_OPTIONS, SPECIAL_CONSIDERATIONS_TITLE, 
    SPECIAL_CONSIDERATIONS_NOTE, PREGNANCY_STATUS_OPTIONS, MEDICAL_CONDITION_OPTIONS,
    SPORT_ACTIVITY_OPTIONS,
    TARGET_SUGGESTION_TITLE,
    IDEAL_BODY_FAT_RANGE_TEXT,
    SUGGESTED_TARGET_WEIGHT_TEXT,
    USE_THIS_TARGET_BUTTON,
    BODY_COMPOSITION_NAV_LINK
} from '../constants';
import { HeartPulse, Target, Activity, ChevronLeft } from 'lucide-react';
import { suggestBodyFatTarget } from '../services/bodyFatTargetService';
import { useAppContext } from '../contexts/AppContext';


const UserInputForm: React.FC = () => {
  const { handleUserDataSubmit, userData, updateUserData, setCurrentView } = useAppContext();

  const [formData, setFormData] = useState<Partial<UserData>>({
    gender: userData?.gender || Gender.MALE,
    age: userData?.age,
    height: userData?.height,
    weight: userData?.weight,
    targetWeight: userData?.targetWeight,
    activityLevel: userData?.activityLevel || ActivityLevel.MODERATE,
    sportActivity: userData?.sportActivity || SportActivity.GENERAL_FITNESS,
    bodyFatPercentage: userData?.bodyFatPercentage,
    pregnancyStatus: userData?.pregnancyStatus || PregnancyStatus.NONE,
    medicalConditions: userData?.medicalConditions || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestion, setSuggestion] = useState<BodyFatSuggestion | null>(null);

  const femaleSpecificConditions = useMemo(() => [MedicalCondition.PCOS, MedicalCondition.GESTATIONAL_DIABETES], []);

  const filteredMedicalOptions = useMemo(() => {
    if (formData.gender === Gender.MALE) {
        return MEDICAL_CONDITION_OPTIONS.filter(opt => !femaleSpecificConditions.includes(opt.value));
    }
    return MEDICAL_CONDITION_OPTIONS;
  }, [formData.gender, femaleSpecificConditions]);

  useEffect(() => {
    // When gender changes to male, deselect any female-specific medical conditions.
    if (formData.gender === Gender.MALE) {
        setFormData(prev => {
            const currentConditions = prev.medicalConditions || [];
            const newConditions = currentConditions.filter(c => !femaleSpecificConditions.includes(c));
            if (newConditions.length !== currentConditions.length) {
                return { ...prev, medicalConditions: newConditions };
            }
            return prev;
        });
    }
  }, [formData.gender, femaleSpecificConditions]);


  useEffect(() => {
    if (
      formData.gender &&
      formData.sportActivity &&
      formData.weight &&
      formData.bodyFatPercentage &&
      formData.bodyFatPercentage > 0 &&
      formData.weight > 0
    ) {
      const result = suggestBodyFatTarget(
        formData.gender,
        formData.sportActivity,
        formData.bodyFatPercentage,
        formData.weight
      );
      setSuggestion(result);
    } else {
      setSuggestion(null);
    }
  }, [formData.gender, formData.sportActivity, formData.weight, formData.bodyFatPercentage]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['age', 'height', 'weight', 'bodyFatPercentage', 'targetWeight'];
    const parsedValue = numericFields.includes(name) ? parseFloat(value) || undefined : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Also update the central context immediately so data is preserved on navigation
    if (parsedValue !== undefined) {
        updateUserData({ [name]: parsedValue });
    }

    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const handleMedicalConditionChange = (condition: MedicalCondition) => {
    const currentConditions = formData.medicalConditions || [];
    const newConditions = currentConditions.includes(condition)
        ? currentConditions.filter(c => c !== condition)
        : [...currentConditions, condition];
        
    setFormData(prev => ({ ...prev, medicalConditions: newConditions }));
    updateUserData({ medicalConditions: newConditions });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.age || formData.age <= 0) newErrors.age = "العمر مطلوب ويجب أن يكون أكبر من صفر.";
    if (!formData.height || formData.height <= 0) newErrors.height = "الطول مطلوب ويجب أن يكون أكبر من صفر.";
    if (!formData.weight || formData.weight <= 0) newErrors.weight = "الوزن مطلوب ويجب أن يكون أكبر من صفر.";
    if (formData.targetWeight && formData.targetWeight <= 0) newErrors.targetWeight = "الوزن المستهدف يجب أن يكون أكبر من صفر.";
    if (!formData.gender) newErrors.gender = "الجنس مطلوب.";
    if (!formData.activityLevel) newErrors.activityLevel = "مستوى النشاط مطلوب.";
    if (formData.bodyFatPercentage && (formData.bodyFatPercentage < 3 || formData.bodyFatPercentage > 60)) newErrors.bodyFatPercentage = "الرجاء إدخال نسبة دهون واقعية (3-60%).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalData = { ...formData };
      if (finalData.gender !== Gender.FEMALE) {
          finalData.pregnancyStatus = PregnancyStatus.NONE;
      }
      handleUserDataSubmit(finalData as UserData);
    }
  };

  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
  const labelClass = "block text-sm font-medium text-textBase mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-lg">
      <h2 className="text-2xl md:text-3xl font-bold text-primary text-center">أدخل بياناتك الأساسية</h2>
      <div>
        <label htmlFor="gender" className={labelClass}>الجنس</label>
        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
          {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {errors.gender && <p className="text-accent text-xs mt-1">{errors.gender}</p>}
      </div>

      <div>
        <label htmlFor="age" className={labelClass}>العمر (سنوات)</label>
        <input type="number" id="age" name="age" value={formData.age || ''} onChange={handleChange} className={inputClass} placeholder="مثال: 30" />
        {errors.age && <p className="text-accent text-xs mt-1">{errors.age}</p>}
      </div>

      <div>
        <label htmlFor="height" className={labelClass}>الطول (سم)</label>
        <input type="number" id="height" name="height" value={formData.height || ''} onChange={handleChange} className={inputClass} placeholder="مثال: 175" />
        {errors.height && <p className="text-accent text-xs mt-1">{errors.height}</p>}
      </div>

      <div>
        <label htmlFor="weight" className={labelClass}>الوزن الحالي (كجم)</label>
        <input type="number" id="weight" name="weight" value={formData.weight || ''} onChange={handleChange} className={inputClass} placeholder="مثال: 70" />
        {errors.weight && <p className="text-accent text-xs mt-1">{errors.weight}</p>}
      </div>

      <div>
        <label htmlFor="activityLevel" className={labelClass}>مستوى النشاط الأسبوعي</label>
        <select id="activityLevel" name="activityLevel" value={formData.activityLevel} onChange={handleChange} className={inputClass}>
          {ACTIVITY_LEVEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {errors.activityLevel && <p className="text-accent text-xs mt-1">{errors.activityLevel}</p>}
      </div>
      
       <div>
        <label htmlFor="sportActivity" className={labelClass}>
            نوع النشاط الرياضي الأساسي
        </label>
        <select id="sportActivity" name="sportActivity" value={formData.sportActivity} onChange={handleChange} className={inputClass}>
            {SPORT_ACTIVITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
         <p className="text-xs text-textMuted mt-1">
            يساعد هذا الخيار في اقتراح نسبة دهون مثالية لهدفك.
        </p>
      </div>


      <div>
        <label htmlFor="bodyFatPercentage" className={labelClass}>
          نسبة الدهون (%) (اختياري)
        </label>
        <input
          type="number"
          id="bodyFatPercentage"
          name="bodyFatPercentage"
          value={formData.bodyFatPercentage || ''}
          onChange={handleChange}
          className={inputClass}
          placeholder="مثال: 15"
          step="0.1"
          min="3"
          max="60"
        />
        {errors.bodyFatPercentage && <p className="text-accent text-xs mt-1">{errors.bodyFatPercentage}</p>}
      </div>
      
      <div className="p-4 bg-primary/10 rounded-lg space-y-3 text-sm border-s-4 border-primary/50 animate-fadeIn">
          <h4 className="font-bold text-primary-light flex items-center gap-2"><Activity size={18}/> لست متأكدًا من نسبة دهونك؟</h4>
          <p className="text-textBase">استخدم أداتنا المتقدمة لتحليل تكوين الجسم. ستحصل على تقدير دقيق لنسبة الدهون، الكتلة العضلية، والمؤشرات الصحية الهامة.</p>
          <button
              type="button"
              onClick={() => setCurrentView('bodyCompositionAnalysis')}
              className="bg-primary text-white font-semibold py-2 px-4 rounded-md text-xs whitespace-nowrap shadow hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
              <span>{BODY_COMPOSITION_NAV_LINK}</span> <ChevronLeft size={16}/>
          </button>
      </div>
      
      <div>
        <label htmlFor="targetWeight" className={labelClass}>الوزن المستهدف (كجم) (اختياري)</label>
        <input type="number" id="targetWeight" name="targetWeight" value={formData.targetWeight || ''} onChange={handleChange} className={inputClass} placeholder="مثال: 65" />
        {errors.targetWeight && <p className="text-accent text-xs mt-1">{errors.targetWeight}</p>}
      </div>

       {suggestion && (
        <div className="p-4 bg-primary/10 rounded-lg space-y-3 text-sm border-s-4 border-primary/50 animate-fadeIn">
            <h4 className="font-bold text-primary-light flex items-center gap-2"><Target size={18}/> {TARGET_SUGGESTION_TITLE}</h4>
            <p className="text-textBase">{IDEAL_BODY_FAT_RANGE_TEXT(SPORT_ACTIVITY_OPTIONS.find(o => o.value === formData.sportActivity)?.label || '')} <strong className="text-secondary">{suggestion.idealRange.min}% - {suggestion.idealRange.max}%</strong>.</p>
            <p className="text-textBase">{suggestion.recommendation}</p>
            {suggestion.suggestedTargetWeight && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-primary/20">
                    <p className="text-textBase text-center sm:text-right">
                        {SUGGESTED_TARGET_WEIGHT_TEXT} <strong className="text-lg text-secondary">{suggestion.suggestedTargetWeight} كجم</strong>.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const newWeight = suggestion.suggestedTargetWeight;
                            setFormData(prev => ({ ...prev, targetWeight: newWeight }));
                            updateUserData({ targetWeight: newWeight });
                        }}
                        className="bg-secondary text-white font-semibold py-2 px-4 rounded-md text-xs whitespace-nowrap shadow hover:bg-secondary-dark transition-colors"
                    >
                        {USE_THIS_TARGET_BUTTON}
                    </button>
                </div>
            )}
        </div>
      )}

      {/* Special Considerations Section */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50 mt-4">
          <h3 className="text-lg font-semibold text-primary-light flex items-center gap-2">
              <HeartPulse size={20} /> {SPECIAL_CONSIDERATIONS_TITLE}
          </h3>
          <p className="text-xs text-textMuted">{SPECIAL_CONSIDERATIONS_NOTE}</p>
          
          {formData.gender === Gender.FEMALE && (
              <div>
                  <label className="block text-sm font-medium text-textBase mb-2">الحالة الصحية (للنساء)</label>
                  <div className="space-y-2">
                      {PREGNANCY_STATUS_OPTIONS.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input 
                                type="radio" 
                                name="pregnancyStatus" 
                                value={opt.value} 
                                checked={formData.pregnancyStatus === opt.value}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary focus:ring-primary border-border"
                              />
                              {opt.label}
                          </label>
                      ))}
                  </div>
              </div>
          )}

          <div>
              <label className="block text-sm font-medium text-textBase mb-2">حالات طبية (إن وجدت)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredMedicalOptions.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm p-2 rounded-md hover:bg-primary/10">
                          <input 
                            type="checkbox"
                            checked={(formData.medicalConditions || []).includes(opt.value)}
                            onChange={() => handleMedicalConditionChange(opt.value)}
                            className="h-4 w-4 rounded text-primary focus:ring-primary border-border"
                          />
                          {opt.label}
                      </label>
                  ))}
              </div>
          </div>
      </div>


      <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg [@media(hover:hover)]:hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-background transform [@media(hover:hover)]:hover:scale-105">
        التالي: تحديد الهدف
      </button>
    </form>
  );
};

export default UserInputForm;
