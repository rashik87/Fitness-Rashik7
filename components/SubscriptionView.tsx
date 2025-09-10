import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { CheckCircle, XCircle, Gem, ArrowLeft } from 'lucide-react';

const SubscriptionView: React.FC = () => {
    const { handleUpgrade, setCurrentView } = useAppContext();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleUpgradeClick = () => {
        handleUpgrade();
        setTimeout(() => {
            setCurrentView('userDashboard');
        }, 500); // Give a moment for the notification to appear before navigating
    };

    const features = [
        { feature: 'حاسبة السعرات والماكروز', free: true, premium: true },
        { feature: 'قاعدة بيانات الأطعمة', free: true, premium: true },
        { feature: 'عدد الأطعمة المخصصة', free: '20 عنصر', premium: 'غير محدود' },
        { feature: 'عدد الوصفات المخصصة', free: '10 وصفات', premium: 'غير محدود' },
        { feature: 'إنشاء خطط غذائية', free: 'يوم واحد', premium: 'حتى 7 أيام' },
        { feature: 'تعديل الخطة تلقائيًا', free: '3 مرات/يوم', premium: 'غير محدود' },
        { feature: 'تحميل الخطط (PDF)', free: 'مرتين/يوم', premium: 'غير محدود' },
        { feature: 'تحليل الوجبة بالصورة', free: false, premium: true },
        { feature: 'نصائح ذكية لكسر ثبات الوزن', free: false, premium: true },
        { feature: 'إنشاء قائمة التسوق', free: false, premium: true },
        { feature: 'مولد الوصفات الذكي', free: false, premium: true },
    ];

    const FeatureRow: React.FC<{ feature: string; free: string | boolean; premium: string | boolean; }> = ({ feature, free, premium }) => (
        <tr className="border-b border-border/50">
            <td className="py-3 px-2 sm:px-4 text-sm font-medium text-textBase">{feature}</td>
            <td className="py-3 px-2 sm:px-4 text-center text-sm text-textMuted">
                {typeof free === 'boolean' ? (free ? <CheckCircle className="mx-auto text-secondary" size={20} /> : <XCircle className="mx-auto text-textMuted/50" size={20} />) : free}
            </td>
            <td className="py-3 px-2 sm:px-4 text-center text-sm font-semibold text-primary-light">
                {typeof premium === 'boolean' ? (premium ? <CheckCircle className="mx-auto text-secondary" size={20} /> : <XCircle className="mx-auto text-textMuted/50" size={20} />) : premium}
            </td>
        </tr>
    );

    return (
        <div className="w-full max-w-4xl space-y-8 animate-fadeIn">
            <div className="text-center">
                 <Gem size={48} className="mx-auto text-yellow-500 mb-4" />
                <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-dark tracking-tight">
                    اختر الخطة التي تناسبك
                </h1>
                <p className="mt-4 text-md text-textMuted max-w-2xl mx-auto">
                    افتح الإمكانيات الكاملة لرحلتك الصحية مع باقة بريميوم واحصل على جميع الأدوات التي تحتاجها للنجاح.
                </p>
                 <button onClick={() => setCurrentView('userDashboard')} className="mt-4 text-sm text-primary-light hover:underline flex items-center justify-center gap-1 mx-auto">
                    <ArrowLeft size={16}/>
                    العودة إلى لوحة التحكم
                </button>
            </div>

            <div className="flex justify-center items-center gap-4">
                <span className="font-semibold text-textBase">شهري</span>
                <div onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="w-12 h-6 flex items-center bg-inputBg rounded-full p-1 cursor-pointer transition-colors">
                    <div className={`bg-primary w-4 h-4 rounded-full shadow-md transform transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <span className="font-semibold text-textBase">سنوي <span className="text-xs text-secondary">(خصم 20%)</span></span>
            </div>

            <div className="bg-card/80 rounded-2xl shadow-2xl overflow-hidden border border-primary/20">
                <div className="grid grid-cols-3">
                    <div className="p-4"></div>
                    <div className="p-4 text-center">
                        <h3 className="font-bold text-lg text-textBase">مجاني</h3>
                        <p className="text-2xl font-bold text-textMuted">$0</p>
                    </div>
                    <div className="p-4 text-center bg-primary/10 rounded-t-lg">
                        <h3 className="font-bold text-lg text-primary">بريميوم</h3>
                         <p className="text-2xl font-bold text-primary">
                            ${billingCycle === 'monthly' ? '9.99' : '99.99'}
                        </p>
                        <p className="text-xs text-textMuted">{billingCycle === 'monthly' ? '/شهر' : '/سنة'}</p>
                    </div>
                </div>
                <table className="w-full">
                    <tbody className="divide-y divide-border/50">
                        {features.map((item, index) => <FeatureRow key={index} {...item} />)}
                    </tbody>
                </table>
                <div className="p-6 bg-primary/10 text-center">
                     <button onClick={handleUpgradeClick} className="w-full max-w-xs mx-auto bg-gradient-to-r from-secondary to-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-secondary/40 transition-all duration-300 transform [@media(hover:hover)]:hover:scale-105">
                        الترقية الآن (تجريبي)
                    </button>
                    <p className="text-xs text-textMuted mt-3">سيتم محاكاة عملية الدفع، ولن يتم طلب أي معلومات حقيقية.</p>
                </div>
            </div>
            
            <div className="text-center text-xs text-textMuted/80 pt-4">
                <p>
                    يمكنك إلغاء اشتراكك في أي وقت. بالترقية، أنت توافق على <button onClick={() => setCurrentView('termsOfService')} className="underline hover:text-primary">شروط الاستخدام</button> و <button onClick={() => setCurrentView('privacyPolicy')} className="underline hover:text-primary">سياسة الخصوصية</button>.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionView;