
import React from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeToggleButtonProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-textMuted hover:bg-primary/10 hover:text-textBase transition-colors duration-200"
      aria-label={theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع الفاتح'}
      title={theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع الفاتح'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggleButton;
