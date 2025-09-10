import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicyView: React.FC = () => {
    return (
        <div className="w-full max-w-3xl space-y-6 bg-card/80 p-6 rounded-xl shadow-xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-light flex items-center gap-3">
                <Shield size={28} /> سياسة الخصوصية
            </h2>
            <div className="space-y-4 text-textBase text-sm sm:text-base leading-relaxed">
                <p><strong>آخر تحديث:</strong> {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>نحن في "رشيق فيتنس" نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك.</p>
                
                <h3 className="text-lg font-semibold text-primary pt-2">1. جمع البيانات</h3>
                <p>نحن نجمع البيانات التي تقدمها طواعية مثل العمر، الوزن، الطول، الجنس، ومستوى النشاط. هذه البيانات ضرورية لحساب احتياجاتك من السعرات الحرارية وتقديم توصيات وخطط غذائية مخصصة لك.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">2. تخزين البيانات</h3>
                <p className="font-bold">بياناتك ملكك. جميع بياناتك الشخصية، بيانات التقدم، الأطعمة والوصفات المخصصة، والخطط المحفوظة تُخزن بشكل آمن <span className="text-secondary">محليًا على جهازك فقط</span> باستخدام تقنية `localStorage` في متصفحك. نحن لا نقوم برفع أو تخزين هذه البيانات على أي خوادم خارجية.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">3. استخدام البيانات</h3>
                <p>تُستخدم بياناتك فقط داخل التطبيق لتقديم الوظائف الأساسية مثل حساب السعرات، إنشاء خطط الوجبات، وتتبع تقدمك. نحن لا نشارك بياناتك مع أي طرف ثالث على الإطلاق.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">4. حقوق المستخدم والتحكم بالبيانات</h3>
                <p>لديك السيطرة الكاملة على بياناتك. يمكنك حذفها في أي وقت عن طريق مسح بيانات التخزين الخاصة بموقعنا من إعدادات متصفحك. سيؤدي هذا إلى حذف حسابك وجميع معلوماتك المسجلة بشكل دائم ولا يمكن التراجع عنه.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">5. معلومات الاتصال</h3>
                <p>لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:privacy@fitness-rashik.com" className="text-secondary hover:underline">privacy@fitness-rashik.com</a></p>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
