
import React, { useState } from 'react';
import { Mail, KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { 
    REGISTER_TITLE, EMAIL_LABEL, PASSWORD_LABEL, CONFIRM_PASSWORD_LABEL, REGISTER_BUTTON, 
    ALREADY_HAVE_ACCOUNT_PROMPT, LOGIN_LINK, AUTH_ERROR_HEADER, LOADING_MESSAGE, PASSWORD_MISMATCH_ERROR,
    AUTH_SUCCESS_REGISTER
} from '../../constants';

const RegisterView: React.FC = () => {
  const { handleRegister, setAuthView, isLoadingAuth, showTemporaryNotification } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(PASSWORD_MISMATCH_ERROR); 
      return;
    }
    if (!email || !password) {
      setError("الرجاء ملء جميع الحقول."); 
      return;
    }
    const result = handleRegister(email, password);
    if (result.success) {
      showTemporaryNotification('success', result.message || AUTH_SUCCESS_REGISTER);
      setAuthView('login');
    } else if (result.message) {
      setError(result.message);
    }
  };

  const inputContainerClass = "relative";
  const inputClass = "w-full bg-inputBg border text-textBase rounded-lg p-3 ps-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all";
  const iconClass = "absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted";
  const buttonClass = "w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-70 transform [@media(hover:hover)]:hover:scale-105 active:scale-100";
  
  return (
    <div className="w-full max-w-md space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{REGISTER_TITLE}</h2>
      
      {error && (
        <div className="flex items-start gap-3 p-3 bg-accent/20 border border-accent/30 rounded-lg text-accent text-sm">
          <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
           <div className="text-right">
              <p className="font-semibold">{AUTH_ERROR_HEADER}</p>
              <p>{error}</p>
           </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-email" className="sr-only">{EMAIL_LABEL}</label>
          <div className={inputContainerClass}>
            <Mail className={iconClass} aria-hidden="true" />
            <input 
              type="email" 
              id="register-email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={`${inputClass} border-border`}
              required
              placeholder={EMAIL_LABEL}
              autoComplete="email"
              disabled={isLoadingAuth}
            />
          </div>
        </div>
        <div>
          <label htmlFor="register-password" className="sr-only">{PASSWORD_LABEL}</label>
          <div className={inputContainerClass}>
            <KeyRound className={iconClass} aria-hidden="true" />
            <input 
              type={showPassword ? "text" : "password"}
              id="register-password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className={`${inputClass} pe-10 border-border`}
              required 
              minLength={6}
              placeholder={PASSWORD_LABEL}
              autoComplete="new-password"
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
        <div>
          <label htmlFor="confirm-password" className="sr-only">{CONFIRM_PASSWORD_LABEL}</label>
           <div className={inputContainerClass}>
            {password === confirmPassword && password !== '' ? 
                <CheckCircle className={`${iconClass} text-secondary`} aria-hidden="true" /> :
                <KeyRound className={iconClass} aria-hidden="true" />
            }
            <input 
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className={`${inputClass} pe-10 ${password !== '' && confirmPassword !== '' ? (password === confirmPassword ? 'border-secondary' : 'border-accent') : 'border-border'}`} 
              required 
              placeholder={CONFIRM_PASSWORD_LABEL}
              autoComplete="new-password"
              disabled={isLoadingAuth}
            />
             <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase p-1"
              aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              disabled={isLoadingAuth}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isLoadingAuth}
          className={`${buttonClass} bg-gradient-to-r from-primary to-primary-dark focus:ring-primary-light flex items-center justify-center gap-2`}
        >
          {isLoadingAuth && <Loader2 className="animate-spin" size={20} />}
          {isLoadingAuth ? LOADING_MESSAGE : REGISTER_BUTTON}
        </button>
      </form>
      
      <p className="text-center text-sm text-textMuted pt-4 border-t border-border">
        {ALREADY_HAVE_ACCOUNT_PROMPT}{' '}
        <button onClick={() => setAuthView('login')} className="font-medium text-primary-light hover:text-primary transition-colors hover:underline" disabled={isLoadingAuth}>
          {LOGIN_LINK}
        </button>
      </p>
    </div>
  );
};

export default RegisterView;