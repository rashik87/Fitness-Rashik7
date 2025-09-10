import React from 'react';
import { Mail } from 'lucide-react';
import { APP_TITLE } from '../../constants';

const ContactUsView: React.FC = () => {
    return (
        <div className="w-full max-w-3xl space-y-6 bg-card/80 p-6 rounded-xl shadow-xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-primary-light flex items-center gap-3">
                <Mail size={28} /> اتصل بنا
            </h2>
            <div className="space-y-4 text-textBase text-sm sm:text-base leading-relaxed">
                <p>
                    نحن نقدر رأيك واقتراحاتك! إذا كان لديك أي سؤال، أو تواجه مشكلة، أو ترغب في مشاركة أفكارك لتحسين {APP_TITLE}، فلا تتردد في التواصل معنا.
                </p>
                
                <h3 className="text-lg font-semibold text-primary pt-2">للاستفسارات العامة والدعم الفني:</h3>
                <p>
                    للحصول على المساعدة أو الإبلاغ عن مشكلة فنية، يرجى إرسال بريد إلكتروني إلى:
                    <br />
                    <a href="mailto:support@fitness-rashik.com" className="font-semibold text-secondary hover:underline">support@fitness-rashik.com</a>
                </p>

                <h3 className="text-lg font-semibold text-primary pt-2">للاقتراحات والشراكات:</h3>
                <p>
                    إذا كان لديك أفكار جديدة أو ترغب في التعاون معنا، يسعدنا أن نسمع منك على:
                    <br />
                    <a href="mailto:contact@fitness-rashik.com" className="font-semibold text-secondary hover:underline">contact@fitness-rashik.com</a>
                </p>
                
                <p className="pt-4 border-t border-border/50">
                    نسعى للرد على جميع الرسائل في غضون 48 ساعة عمل. شكرًا لك على استخدامك {APP_TITLE}!
                </p>
            </div>
        </div>
    );
};

export default ContactUsView;
