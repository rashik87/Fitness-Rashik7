import React from 'react';
import { Lightbulb, X } from 'lucide-react';

interface TourTooltipProps {
  title: string;
  description: string;
  onDismiss: () => void;
}

const TourTooltip: React.FC<TourTooltipProps> = ({ title, description, onDismiss }) => {
  return (
    <div
      className="fixed bottom-20 sm:bottom-4 right-4 left-4 sm:left-auto max-w-sm bg-card p-4 rounded-xl shadow-2xl border border-primary/30 z-[60] animate-fadeIn"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-primary-light text-md">{title}</h3>
          <p className="text-sm text-textBase mt-1">{description}</p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-textMuted hover:bg-subtleButton-bg hover:text-textBase transition-colors flex-shrink-0 -mt-1 -mr-1"
          aria-label="إغلاق الإرشاد"
        >
          <X size={18} />
        </button>
      </div>
      <div className="text-center mt-4">
        <button
          onClick={onDismiss}
          className="bg-primary text-white text-sm font-semibold py-2 px-6 rounded-lg shadow hover:bg-primary-dark transition-colors"
        >
          فهمت!
        </button>
      </div>
    </div>
  );
};

export default TourTooltip;
