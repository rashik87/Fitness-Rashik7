import React from 'react';
import { AlertTriangle } from 'lucide-react';

const MedicalDisclaimerView: React.FC = () => {
    return (
        <div className="w-full max-w-3xl space-y-6 bg-card/80 p-6 rounded-xl shadow-xl animate-fadeIn border-t-4 border-accent">
            <h2 className="text-2xl font-bold text-accent flex items-center gap-3">
                <AlertTriangle size={28} /> إخلاء المسؤولية الطبية
            </h2>
            <div className="space-y-4 text-textBase text-sm sm:text-base leading-relaxed">
                <p className="font-semibold">
                    المعلومات المقدمة في تطبيق "رشيق فيتنس"، بما في ذلك على سبيل المثال لا الحصر، حسابات السعرات الحرارية، خطط الوجبات، نصائح المكملات، تحليل الوجبات، ودليل الفيتامينات، هي لأغراض إرشادية وتثقيفية فقط.
                </p>
                <p>
                    هذا التطبيق **ليس بديلاً عن الاستشارة الطبية المتخصصة**. المعلومات المقدمة ليست نصيحة طبية ولا يجب التعامل معها على هذا الأساس. استخدامك للتطبيق هو على مسؤوليتك الخاصة.
                </p>
                <p className="font-bold text-primary-dark">
                    يجب عليك دائمًا استشارة طبيبك أو أخصائي تغذية مؤهل قبل:
                </p>
                <ul className="list-disc ps-6 space-y-2">
                    <li>البدء في أي نظام غذائي جديد أو إجراء تغييرات كبيرة على نظامك الغذائي الحالي.</li>
                    <li>البدء في برنامج تمارين رياضية جديد.</li>
                    <li>تناول أي مكملات غذائية.</li>
                </ul>
                <p>
                    لا تتجاهل النصيحة الطبية المتخصصة أو تتأخر في طلبها بسبب شيء قرأته أو شاهدته في هذا التطبيق. المطورون والمساهمون في "رشيق فيتنس" لا يتحملون أي مسؤولية عن أي إجراءات تتخذها أو أي عواقب صحية تنتج عن استخدام المعلومات الواردة في هذا التطبيق.
                </p>
            </div>
        </div>
    );
};

export default MedicalDisclaimerView;
