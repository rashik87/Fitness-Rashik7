
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import ThemeToggleButton from './ThemeToggleButton';
import { 
    SETTINGS_TITLE, ACCOUNT_INFO_TITLE, EMAIL_LABEL, CURRENT_PLAN_LABEL, PREMIUM_PLAN_LABEL, FREE_PLAN_LABEL, 
    CHANGE_PASSWORD_TITLE, CURRENT_PASSWORD_LABEL, NEW_PASSWORD_LABEL, CONFIRM_NEW_PASSWORD_LABEL, SAVE_PASSWORD_BUTTON,
    SUBSCRIPTION_MANAGEMENT_TITLE, CANCEL_SUBSCRIPTION_BUTTON, CONFIRM_CANCEL_SUB_TITLE, CONFIRM_CANCEL_SUB_MESSAGE,
    THEME_SETTINGS_TITLE, PASSWORD_CHANGE_SUCCESS, NEW_PASSWORD_MISMATCH_ERROR, DOWNGRADE_SUCCESS_MESSAGE,
    CANCEL_BUTTON, CONFIRM_BUTTON
} from '../constants';
import { User, KeyRound, Gem, Palette, ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';

const SectionCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({ title, icon, children }) => (
     <section className="p-4 sm:p-6 bg-card/80 rounded-xl shadow-2xl border-t-4 border-primary">
        <h3 className="text-lg sm:text-xl font-semibold text-primary-light mb-4 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
     </section>
);


const SettingsView: React.FC = () => {
    const { 
        currentUser, 
        isPremium, 
        theme, 
        setTheme,
        handleChangePassword,
        handleDowngrade,
        showTemporaryNotification
    } = useAppContext();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    
    const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);

    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordError(NEW_PASSWORD_MISMATCH_ERROR);
            return;
        }

        const result = handleChangePassword(currentPassword, newPassword);

        if (result.success) {
            setPasswordSuccess(PASSWORD_CHANGE_SUCCESS);
            showTemporaryNotification('success', PASSWORD_CHANGE_SUCCESS);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } else {
            setPasswordError(result.message || 'An unknown error occurred.');
        }
    };

    const handleDowngradeConfirm = () => {
        handleDowngrade();
        setShowDowngradeConfirm(false);
        showTemporaryNotification('success', DOWNGRADE_SUCCESS_MESSAGE);
    };

    if (!currentUser) return null;

    const inputClass = "w-full bg-inputBg border border-border text-textBase rounded-lg p-3 ps-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none placeholder-textMuted/70 shadow-sm transition-all duration-200";
    const labelClass = "block text-sm font-medium text-textBase mb-2";

    return (
        <div className="w-full max-w-2xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-light text-center">{SETTINGS_TITLE}</h2>

            <SectionCard title={ACCOUNT_INFO_TITLE} icon={<User size={22} />}>
                <div className="flex justify-between items-center bg-inputBg/50 p-3 rounded-md">
                    <span className="text-textMuted">{EMAIL_LABEL}:</span>
                    <span className="font-semibold text-textBase">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center bg-inputBg/50 p-3 rounded-md">
                    <span className="text-textMuted">{CURRENT_PLAN_LABEL}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-sm ${isPremium ? 'text-yellow-600 dark:text-yellow-300 bg-yellow-400/30' : 'text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700'}`}>
                        {isPremium ? PREMIUM_PLAN_LABEL : FREE_PLAN_LABEL}
                    </span>
                </div>
            </SectionCard>

            <SectionCard title={CHANGE_PASSWORD_TITLE} icon={<KeyRound size={22}/>}>
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                    {passwordError && (
                        <div className="flex items-start gap-3 p-3 bg-accent/20 border border-accent/30 rounded-lg text-accent text-sm">
                            <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p>{passwordError}</p>
                        </div>
                    )}
                     {passwordSuccess && (
                        <div className="flex items-start gap-3 p-3 bg-secondary/20 border border-secondary/30 rounded-lg text-secondary text-sm">
                            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p>{passwordSuccess}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="currentPassword" className={labelClass}>{CURRENT_PASSWORD_LABEL}</label>
                         <div className="relative">
                            <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
                            <input type={showCurrentPassword ? "text" : "password"} id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} required />
                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase p-1" aria-label="Toggle current password visibility">
                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="newPassword" className={labelClass}>{NEW_PASSWORD_LABEL}</label>
                         <div className="relative">
                            <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
                            <input type={showNewPassword ? "text" : "password"} id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} required />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase p-1" aria-label="Toggle new password visibility">
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className={labelClass}>{CONFIRM_NEW_PASSWORD_LABEL}</label>
                        <div className="relative">
                          <KeyRound className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-textMuted" />
                          <input type={showConfirmNewPassword ? "text" : "password"} id="confirmNewPassword" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={inputClass} required />
                           <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textBase p-1" aria-label="Toggle confirm new password visibility">
                                {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 shadow-lg hover:shadow-primary/40 transform [@media(hover:hover)]:hover:scale-105">
                        {SAVE_PASSWORD_BUTTON}
                    </button>
                </form>
            </SectionCard>

            <SectionCard title={SUBSCRIPTION_MANAGEMENT_TITLE} icon={<Gem size={22}/>}>
                {isPremium ? (
                    <div>
                        <p className="text-textMuted text-sm mb-4">أنت مشترك حاليًا في الخطة المميزة. شكرًا لدعمك!</p>
                        <button onClick={() => setShowDowngradeConfirm(true)} className="w-full bg-accent/90 hover:bg-accent text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow">
                            {CANCEL_SUBSCRIPTION_BUTTON}
                        </button>
                    </div>
                ) : (
                    <p className="text-textMuted text-sm">أنت حاليًا على الخطة المجانية. قم بالترقية من لوحة التحكم للاستمتاع بجميع الميزات!</p>
                )}
            </SectionCard>

             <SectionCard title={THEME_SETTINGS_TITLE} icon={<Palette size={22}/>}>
                 <div className="flex justify-between items-center bg-inputBg/50 p-3 rounded-md">
                    <span className="text-textBase">الوضع الحالي: {theme === 'light' ? 'فاتح' : 'داكن'}</span>
                    <ThemeToggleButton theme={theme} setTheme={setTheme} />
                 </div>
            </SectionCard>

            {showDowngradeConfirm && (
                 <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] modal-enter">
                    <div className="bg-card p-6 rounded-xl shadow-2xl w-full max-w-sm ring-1 ring-accent/50">
                        <h4 className="text-lg font-semibold text-accent mb-3">{CONFIRM_CANCEL_SUB_TITLE}</h4>
                        <p className="text-textBase text-sm mb-4">{CONFIRM_CANCEL_SUB_MESSAGE}</p>
                        <div className="flex space-x-3 rtl:space-x-reverse">
                        <button onClick={handleDowngradeConfirm} className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-2 px-4 rounded-md">
                            {CONFIRM_BUTTON}
                        </button>
                        <button onClick={() => setShowDowngradeConfirm(false)} className="flex-1 bg-subtleButton-bg hover:bg-subtleButton-hover text-textBase font-semibold py-2 px-4 rounded-md">
                            {CANCEL_BUTTON}
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
