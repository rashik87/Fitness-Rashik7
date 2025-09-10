
import React, { useState } from 'react';
import { Mail, ShieldAlert, KeyRound, CheckCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { 
    FORGOT_PASSWORD_TITLE, FORGOT_PASSWORD_INSTRUCTIONS, EMAIL_LABEL, RECOVER_ACCOUNT_BUTTON, 
    BACK_TO_LOGIN_BUTTON, PASSWORD_RECOVERY_SUCCESS_TITLE, PASSWORD_RECOVERY_SUCCESS_MESSAGE,
    PASSWORD_RECOVERY_SECURITY_WARNING, LOADING_MESSAGE
} from '../../constants';

const ForgotPasswordView: React.FC = () => {
    const { handleForgotPassword, setAuthView } = useAppContext();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setRecoveredPassword(null);
        if (!email) {
            setError("الرجاء إدخال البريد الإلكتروني.");
            return;
        }
        setIsSubmitting(true);
        // Simulate network delay
        setTimeout(() => {
            const result = handleForgotPassword(email);
            if (result.success && result.password) {
                setRecoveredPassword(result.password);
            } else if (result.message) {
                setError(result.message);
            }
            setIsSubmitting(false);
        }, 500);
    };
    
    const inputContainerClass = "relative";
    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 ps-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
    const buttonClass = "w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 transform [@media(hover:hover)]:hover:scale-105 active:scale-100";
    const iconClass = "absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted";

    if (recoveredPassword) {
        return (
            <div className="w-full max-w-md space-y-6 text-center animate-fadeIn">
                 <CheckCircle className="mx-auto h-12 w-12 text-secondary" />
                <h2 className="text-2xl font-bold text-primary-light">{PASSWORD_RECOVERY_SUCCESS_TITLE}</h2>
                <div className="p-4 bg-card/80 rounded-lg shadow-inner">
                    <p className="text-sm text-textMuted">{PASSWORD_RECOVERY_SUCCESS_MESSAGE}</p>
                    <p className="text-2xl font-bold text-secondary my-2 select-all" dir="ltr">{recoveredPassword}</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-400/20 border border-yellow-500/30 rounded-lg text-yellow-800 dark:text-yellow-300 text-xs text-right">
                    <ShieldAlert className="h-8 w-8 mt-0.5 flex-shrink-0" />
                    <p>{PASSWORD_RECOVERY_SECURITY_WARNING}</p>
                </div>
                <button 
                    onClick={() => setAuthView('login')} 
                    className={`${buttonClass} bg-gradient-to-r from-primary to-primary-dark focus:ring-primary-light`}
                >
                    {BACK_TO_LOGIN_BUTTON}
                </button>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-md space-y-6 animate-fadeIn">
            <div className="text-center">
                <KeyRound className="mx-auto h-12 w-12 text-primary-light" />
                <h2 className="text-2xl md:text-3xl font-bold text-primary-light mt-4">{FORGOT_PASSWORD_TITLE}</h2>
                <p className="text-textMuted mt-2 text-sm">{FORGOT_PASSWORD_INSTRUCTIONS}</p>
            </div>
            
            {error && (
                <div className="flex items-start gap-3 p-3 bg-accent/20 border border-accent/30 rounded-lg text-accent text-sm">
                    <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="recover-email" className="sr-only">{EMAIL_LABEL}</label>
                    <div className={inputContainerClass}>
                        <Mail className={iconClass} aria-hidden="true" />
                        <input 
                            type="email" 
                            id="recover-email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className={inputClass} 
                            required 
                            placeholder={EMAIL_LABEL}
                            autoComplete="email"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`${buttonClass} bg-gradient-to-r from-primary to-primary-dark focus:ring-primary-light flex items-center justify-center gap-2`}
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                    {isSubmitting ? LOADING_MESSAGE : RECOVER_ACCOUNT_BUTTON}
                </button>
            </form>

            <p className="text-center text-sm text-textMuted pt-4 border-t border-border">
                <button onClick={() => setAuthView('login')} className="font-medium text-primary-light hover:text-primary transition-colors hover:underline" disabled={isSubmitting}>
                    {BACK_TO_LOGIN_BUTTON}
                </button>
            </p>
        </div>
    );
};

export default ForgotPasswordView;