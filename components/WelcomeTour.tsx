import React, { useState } from 'react';
import { Sparkles, Calculator, Soup, Database, ClipboardList, TrendingUp, Rocket, X, ChevronLeft } from 'lucide-react';

interface WelcomeTourProps {
  onClose: () => void;
}

const tourSteps = [
  {
    icon: <Sparkles size={48} className="text-yellow-400" />,
    title: "أهلاً بك في رشيق!",
    description: "دليلك الشامل لرحلة صحية ولياقة متكاملة. دعنا نأخذك في جولة سريعة للتعرف على أهم الأدوات.",
  },
  {
    icon: <Calculator size={48} className="text-primary" />,
    title: "1. ابدأ من هنا: حاسبة السعرات",
    description: "أول خطوة هي حساب احتياجاتك اليومية من السعرات الحرارية والماكروز. هذه هي نقطة البداية لكل خططك الغذائية.",
  },
  {
    icon: <div className="flex items-center gap-2"><Database size={40} className="text-secondary" /><span className="text-3xl text-textMuted/50">+</span><Soup size={40} className="text-accent" /></div>,
    title: "2. جهّز مطبخك: الأطعمة والوصفات",
    description: "استخدم 'قاعدة البيانات الغذائية' أو أضف أطعمتك الخاصة. ثم، قم بإنشاء وصفات صحية ولذيذة من قسم 'وصفاتي'.",
  },
  {
    icon: <ClipboardList size={48} className="text-primary-dark" />,
    title: "3. خطط بذكاء: الخطة الذكية",
    description: "استخدم وصفاتك لبناء خطة غذائية. ستقوم الأداة بتعديل كميات الوصفات تلقائياً لتناسب أهدافك بدقة.",
  },
  {
    icon: <TrendingUp size={48} className="text-green-500" />,
    title: "4. شاهد النتائج: تابع تقدمك",
    description: "سجل وزنك ومقاساتك بانتظام. شاهد تطورك من خلال الرسوم البيانية وحافظ على حماسك.",
  },
  {
    icon: <Rocket size={48} className="text-accent-dark" />,
    title: "أنت الآن جاهز!",
    description: "استكشف الأدوات وابدأ رحلتك نحو تحقيق أهدافك. نحن هنا لمساعدتك في كل خطوة.",
  }
];

const WelcomeTour: React.FC<WelcomeTourProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Finish the tour
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="bg-card p-6 rounded-2xl shadow-2xl w-full max-w-md ring-1 ring-primary/20 flex flex-col text-center items-center relative animate-scaleIn">
        
        <button onClick={onClose} className="absolute top-3 right-3 text-textMuted hover:text-textBase transition-colors p-1" aria-label="إغلاق الجولة">
            <X size={20} />
        </button>

        <div className="my-6 min-h-[50px]">
            {tourSteps[currentStep].icon}
        </div>
        
        <h2 id="tour-title" className="text-xl md:text-2xl font-bold text-primary-light mb-3">
            {tourSteps[currentStep].title}
        </h2>
        
        <p className="text-textMuted text-sm sm:text-base mb-8 min-h-[60px]">
            {tourSteps[currentStep].description}
        </p>

        <div className="flex justify-center items-center gap-3 mb-6">
            {tourSteps.map((_, index) => (
                <div key={index} className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentStep ? 'bg-primary scale-125' : 'bg-border'}`} />
            ))}
        </div>

        <div className="w-full flex items-center gap-3">
             <button
                onClick={handlePrev}
                className={`bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow hover:shadow-md transform ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : '[@media(hover:hover)]:hover:scale-105'}`}
                disabled={currentStep === 0}
            >
                <ChevronLeft size={20} />
            </button>
             <button 
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 transform [@media(hover:hover)]:hover:scale-105"
             >
                {isLastStep ? 'ابدأ الآن!' : 'التالي'}
             </button>
        </div>
        
        {!isLastStep && (
            <button onClick={onClose} className="text-xs text-textMuted mt-4 hover:underline">
                تخطي الجولة
            </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeTour;