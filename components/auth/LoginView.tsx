
import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { 
    LOGIN_TITLE, EMAIL_LABEL, PASSWORD_LABEL, LOGIN_BUTTON, 
    NO_ACCOUNT_PROMPT, SIGN_UP_LINK, AUTH_ERROR_HEADER, LOADING_MESSAGE,
    FORGOT_PASSWORD_LINK
} from '../../constants';

const LoginView: React.FC = () => {
  const { handleLogin, setAuthView, isLoadingAuth } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    const result = handleLogin(email, password);
    if (!result.success && result.message) {
      setError(result.message); 
    }
  };

  const inputContainerClass = "relative";
  const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 ps-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
  const buttonClass = "w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 transform [@media(hover:hover)]:hover:scale-105 active:scale-100";
  const iconClass = "absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted";

  return (
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{LOGIN_TITLE}</h2>
      
      {error && (
        <div className="flex items-start gap-3 p-3 bg-accent/20 border border-accent/30 rounded-lg text-accent text-sm">
          <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-right">
             <p className="font-semibold">{AUTH_ERROR_HEADER}</p>
             <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="sr-only">{EMAIL_LABEL}</label>
          <div className={inputContainerClass}>
            <Mail className={`${iconClass} absolute`} aria-hidden="true" />
            <input 
              type="email" 
              id="login-email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={inputClass} 
              required 
              placeholder={EMAIL_LABEL}
              autoComplete="email"
              disabled={isLoadingAuth}
            />
          </div>
        </div>
        <div>
          <label htmlFor="login-password" className="sr-only">{PASSWORD_LABEL}</label>
          <div className={inputContainerClass}>
            <KeyRound className={`${iconClass} absolute`} aria-hidden="true" />
            <input 
              type={showPassword ? "text" : "password"} 
              id="login-password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className={inputClass + " pe-10"} 
              required 
              placeholder={PASSWORD_LABEL}
              autoComplete="current-password"
              disabled={isLoadingAuth}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase p-1"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              disabled={isLoadingAuth}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
         <div className="flex justify-end text-sm">
            <button 
                type="button" 
                onClick={() => setAuthView('forgotPassword')} 
                className="font-medium text-primary-light hover:text-primary transition-colors hover:underline focus:outline-none"
                disabled={isLoadingAuth}
            >
                {FORGOT_PASSWORD_LINK}
            </button>
        </div>
        <button 
          type="submit" 
          disabled={isLoadingAuth}
          className={`${buttonClass} bg-gradient-to-r from-primary to-primary-dark focus:ring-primary-light flex items-center justify-center gap-2 mt-2`}
        >
          {isLoadingAuth && <Loader2 className="animate-spin" size={20} />}
          {isLoadingAuth ? LOADING_MESSAGE : LOGIN_BUTTON}
        </button>
      </form>

      <p className="text-center text-sm text-textMuted pt-4 border-t border-border">
        {NO_ACCOUNT_PROMPT}{' '}
        <button onClick={() => setAuthView('register')} className="font-medium text-primary-light hover:text-primary transition-colors hover:underline" disabled={isLoadingAuth}>
          {SIGN_UP_LINK}
        </button>
      </p>
    </div>
  );
};

export default LoginView;