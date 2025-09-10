import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AppView } from '../types';

interface UIContextType {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  currentView: AppView;
  setCurrentView: React.Dispatch<React.SetStateAction<AppView>>;
  notification: { type: 'success' | 'error'; message: string; } | null;
  showTemporaryNotification: (type: 'success' | 'error', message: string, duration?: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [currentView, setCurrentView] = useState<AppView>('landingPage');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const showTemporaryNotification = (type: 'success' | 'error', message: string, duration: number = 4000) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), duration);
    };

    const contextValue: UIContextType = {
        theme, setTheme,
        currentView, setCurrentView,
        notification, showTemporaryNotification
    };

    return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextType => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};