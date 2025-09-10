import React from 'react';
import { FileText } from 'lucide-react';
import { APP_TITLE } from '../../constants';

const TermsOfServiceView: React.FC = () => {
    return (
        <div className="w-full max-w-3xl space-y-6 bg-card/80 p-6 rounded-xl shadow-xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-light flex items-center gap-3">
                <FileText size={28} /> شروط الاستخدام
            </h2>
             <div className="space-y-4 text-textBase text-sm sm:text-base leading-relaxed">
                <p><strong>آخر تحديث:</strong> {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p>مرحبًا بك في {APP_TITLE}! باستخدامك لتطبيقنا، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
                
                <h3 className="text-lg font-semibold text-primary pt-2">1. الاستخدام المقبول</h3>
                <p>يجب استخدام التطبيق للأغراض الشخصية فقط. يُمنع استخدام التطبيق لأي أغراض تجارية أو غير قانونية. أنت مسؤول عن الحفاظ على سرية معلومات حسابك.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">2. الاشتراكات والخدمات</h3>
                <p>يقدم التطبيق باقة مجانية بميزات محدودة وباقة "بريميوم" بميزات كاملة. يتم توضيح تفاصيل كل باقة عند الترقية. يمكنك إلغاء اشتراكك في أي وقت من صفحة الإعدادات، وسيظل وصولك للميزات البريميوم متاحًا حتى نهاية فترة الفوترة الحالية.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">3. إخلاء المسؤولية الطبية</h3>
                <p>تطبيق {APP_TITLE} يقدم معلومات وأدوات إرشادية فقط ولا يعتبر بديلاً عن الاستشارة الطبية المتخصصة. استشر دائمًا طبيبك قبل البدء في أي نظام غذائي أو رياضي. (يرجى قراءة صفحة إخلاء المسؤولية الطبية الكاملة).</p>
                
                <h3 className="text-lg font-semibold text-primary pt-2">4. حدود المسؤولية</h3>
                <p>أنت تستخدم التطبيق على مسؤوليتك الخاصة. نحن لا نتحمل أي مسؤولية عن أي إصابات، مشاكل صحية، أو قرارات تتخذها بناءً على المعلومات المقدمة في التطبيق.</p>

                <h3 className="text-lg font-semibold text-primary pt-2">5. الملكية الفكرية</h3>
                <p>جميع المحتويات، التصميمات، والشعارات في التطبيق هي ملك لـ {APP_TITLE} ومحمية بموجب قوانين حقوق النشر. لا يجوز نسخها أو إعادة استخدامها دون إذن كتابي صريح.</p>
                 
                <h3 className="text-lg font-semibold text-primary pt-2">6. التعديلات على الشروط</h3>
                <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية. استمرارك في استخدام التطبيق بعد التعديلات يعني موافقتك عليها.</p>
            </div>
        </div>
    );
};

export default TermsOfServiceView;
