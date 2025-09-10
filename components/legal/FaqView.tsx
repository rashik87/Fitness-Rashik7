import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="bg-card/50 rounded-lg shadow-sm overflow-hidden">
        <summary className="p-4 flex justify-between items-center cursor-pointer list-none hover:bg-primary/10">
            <h4 className="font-semibold text-textBase">{question}</h4>
            <ChevronDown className="details-arrow text-textMuted flex-shrink-0" size={20}/>
        </summary>
        <div className="p-4 border-t border-border/50 text-textMuted text-sm leading-relaxed">
            {children}
        </div>
    </details>
);

const FaqView: React.FC = () => {
    return (
        <div className="w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary-light flex items-center justify-center gap-3">
                    <HelpCircle size={28} /> الأسئلة الشائعة
                </h2>
            </div>
            <div className="space-y-4">
                <FaqItem question="كيف يتم حساب السعرات الحرارية؟">
                    <p>
                        نستخدم معادلة Mifflin-St Jeor، وهي تعتبر واحدة من أكثر المعادلات دقة لحساب معدل الأيض الأساسي (BMR). بعد ذلك، نضرب هذه القيمة في معامل النشاط البدني (TDEE multiplier) الذي تحدده بناءً على أسلوب حياتك، لنحصل على تقدير لاحتياجاتك اليومية من السعرات الحرارية للحفاظ على وزنك الحالي.
                    </p>
                </FaqItem>
                <FaqItem question="هل بياناتي آمنة؟ وأين يتم تخزينها؟">
                    <p>
                        نعم، بياناتك آمنة تمامًا. نحن نؤمن بأن خصوصيتك هي الأهم. لذلك، جميع بياناتك الشخصية (مثل العمر، الوزن، إلخ) وبيانات الاستخدام (مثل الأطعمة والوصفات المخصصة) تُخزن **محليًا على جهازك فقط** في مساحة التخزين الخاصة بالمتصفح. لا يتم إرسال أو تخزين أي من هذه المعلومات على خوادمنا.
                    </p>
                </FaqItem>
                 <FaqItem question="هل يمكنني مزامنة بياناتي بين الأجهزة؟">
                    <p>
                        حاليًا، لا يدعم التطبيق المزامنة بين الأجهزة المختلفة. بما أن بياناتك مخزنة محليًا، فهي مرتبطة بالمتصفح والجهاز الذي تستخدمه.
                    </p>
                </FaqItem>
                 <FaqItem question="ما الفرق بين الباقة المجانية والبريميوم؟">
                    <p>
                        الباقة المجانية تمنحك وصولاً محدودًا لبعض الميزات مثل عدد الأطعمة والوصفات المخصصة التي يمكنك إنشاؤها، وعدد المرات التي يمكنك فيها توليد أو تحميل خطط PDF.
                        <br />
                        الباقة البريميوم تفتح لك جميع الميزات بلا حدود، بما في ذلك: عدد لا محدود من الأطعمة والوصفات، خطط متعددة الأيام، استخدام جميع البروتوكولات الغذائية، تحليل الوجبات بالصور، والحصول على نصائح ذكية لكسر ثبات الوزن.
                    </p>
                </FaqItem>
                 <FaqItem question="كيف يمكنني حذف بياناتي وحسابي؟">
                    <p>
                        لحذف جميع بياناتك وحسابك بشكل دائم، يمكنك ببساطة مسح بيانات الموقع (Site Data) من إعدادات متصفحك. ابحث عن اسم موقعنا في إعدادات الخصوصية والأمان واختر "مسح البيانات". سيؤدي هذا إلى إزالة حسابك وجميع معلوماتك المسجلة بشكل فوري ولا يمكن التراجع عنه.
                    </p>
                </FaqItem>
            </div>
        </div>
    );
};

export default FaqView;
