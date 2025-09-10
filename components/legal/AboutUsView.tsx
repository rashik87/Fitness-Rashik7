import React from 'react';
import { Users } from 'lucide-react';
import { APP_TITLE } from '../../constants';

const AboutUsView: React.FC = () => {
    return (
        <div className="w-full max-w-3xl space-y-6 bg-card/80 p-6 rounded-xl shadow-xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-light flex items-center gap-3">
                <Users size={28} /> من نحن
            </h2>
            <div className="space-y-4 text-textBase text-sm sm:text-base leading-relaxed">
                <p>
                    {APP_TITLE} هو أكثر من مجرد تطبيق؛ إنه رفيقك في رحلتك نحو صحة أفضل وحياة أكثر نشاطًا. تم تصميم التطبيق لتمكينك من فهم احتياجات جسمك واتخاذ قرارات مستنيرة بشأن تغذيتك ولياقتك.
                </p>
                <p>
                    بدأت فكرة التطبيق من شغف بمساعدة الناس على تحقيق أهدافهم الصحية بطريقة علمية وبسيطة، بعيدًا عن التعقيدات والمعلومات المضللة.
                </p>
                <h3 className="text-lg font-semibold text-primary pt-2">رؤيتنا</h3>
                <p>
                    رؤيتنا هي جعل التخطيط الصحي سهلاً ومتاحًا للجميع، باستخدام أدوات ذكية وبسيطة تعتمد على البيانات لتوفير تجربة مخصصة وفعالة لكل مستخدم.
                </p>
                <h3 className="text-lg font-semibold text-primary pt-2">مهمتنا</h3>
                <p>
                    مهمتنا هي تزويدك بالأدوات والمعرفة التي تحتاجها للتحكم في صحتك. سواء كان هدفك هو خسارة الوزن، بناء العضلات، أو ببساطة الحفاظ على نمط حياة صحي، فإن {APP_TITLE} هنا لدعمك في كل خطوة على الطريق.
                </p>
            </div>
        </div>
    );
};

export default AboutUsView;
