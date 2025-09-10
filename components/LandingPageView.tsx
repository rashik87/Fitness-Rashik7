
import React from 'react';
import { AppView, AuthView } from '../types';
import { Rocket } from 'lucide-react';
import { APP_TITLE, LOGO_URL } from '../constants';

interface LandingPageViewProps {
    onNavigateToAuth: (view: AuthView) => void;
    onNavigateToPage: (view: AppView) => void;
}

const FeatureCard: React.FC<{ imageUrl: string; title: string; description: string; }> = ({ imageUrl, title, description }) => (
    <div className="bg-card/70 rounded-xl shadow-lg flex flex-col transform transition-transform duration-300 [@media(hover:hover)]:hover:-translate-y-2 card-hover-effect overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6 text-center flex flex-col items-center flex-grow">
            <h3 className="text-lg font-bold text-textBase mb-2">{title}</h3>
            <p className="text-sm text-textMuted flex-grow">{description}</p>
        </div>
    </div>
);

const LandingPageView: React.FC<LandingPageViewProps> = ({ onNavigateToAuth, onNavigateToPage }) => {
    return (
        <div className="w-full animate-fadeIn">
            <main>
                {/* Hero Section */}
                <section className="py-20 sm:py-32">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-right">
                                <img src={LOGO_URL} alt="Logo" className="h-20 w-20 rounded-full mx-auto md:mx-0 mb-6 shadow-lg" />
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary-dark tracking-tight mb-4">
                                    رفيقك الذكي لصحة أفضل وحياة أنشط
                                </h1>
                                <p className="max-w-xl mx-auto md:mx-0 text-lg sm:text-xl text-textMuted mb-8">
                                    خطط وجباتك، تتبع تقدمك، وحقق أهدافك الصحية بسهولة مع قوة الذكاء الاصطناعي.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4">
                                    <button
                                        onClick={() => onNavigateToAuth('register')}
                                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-primary/40 transition-all duration-300 transform [@media(hover:hover)]:hover:scale-105"
                                    >
                                        ابدأ الآن مجاناً
                                    </button>
                                    <button
                                        onClick={() => onNavigateToAuth('login')}
                                        className="w-full sm:w-auto text-primary font-semibold hover:underline"
                                    >
                                        لديك حساب بالفعل؟ سجل الدخول
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:block animate-fadeIn">
                                <img 
                                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80" 
                                    alt="طبق صحي من السلطة" 
                                    className="rounded-3xl shadow-2xl w-full h-auto object-cover transform rotate-3 hover:rotate-0 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-card/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-textBase">كل ما تحتاجه في مكان واحد</h2>
                            <p className="mt-4 text-md text-textMuted max-w-2xl mx-auto">
                                أدوات ذكية ومصممة خصيصًا لمساعدتك على فهم احتياجات جسمك والوصول إلى أهدافك بكفاءة.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard 
                                imageUrl="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80"
                                title="حاسبة السعرات الذكية" 
                                description="احسب احتياجاتك من السعرات والماكروز بدقة لبناء أساس خطتك الغذائية." 
                            />
                            <FeatureCard 
                                imageUrl="https://images.unsplash.com/photo-1522184216316-3c25379f9760?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                                title="مخطط وجبات بالذكاء الاصطناعي" 
                                description="أنشئ خططًا غذائية مخصصة ومتوازنة يقوم النظام بضبطها تلقائيًا لتناسب هدفك." 
                            />
                            <FeatureCard 
                                imageUrl="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                                title="قاعدة بيانات ووصفات" 
                                description="أضف أطعمتك الخاصة، وابتكر وصفات صحية، أو استخدم مكتبتنا المتنامية." 
                            />
                            <FeatureCard 
                                imageUrl="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                                title="تحليل وجبة بالصورة (بريميوم)" 
                                description="التقط صورة لوجبتك ودع الذكاء الاصطناعي يحلل مكوناتها وسعراتها." 
                            />
                            <FeatureCard 
                                imageUrl="https://images.unsplash.com/photo-1594882645126-14020914d58d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
                                title="متابعة التقدم" 
                                description="سجل وزنك ومقاساتك وشاهد تطورك على الرسوم البيانية المحفزة." 
                            />
                            <FeatureCard 
                                imageUrl="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
                                title="دليل المكملات الذكي" 
                                description="احصل على توصيات مخصصة للمكملات الغذائية بناءً على هدفك وبياناتك." 
                            />
                        </div>
                    </div>
                </section>
                
                {/* Final CTA Section */}
                <section className="text-center py-20">
                    <div className="container mx-auto px-4">
                        <Rocket size={48} className="mx-auto text-accent mb-4"/>
                        <h2 className="text-3xl sm:text-4xl font-bold text-textBase mb-4">
                            هل أنت مستعد لبدء رحلتك؟
                        </h2>
                        <p className="max-w-xl mx-auto text-md text-textMuted mb-8">
                            انضم إلى آلاف المستخدمين الذين غيروا حياتهم الصحية مع {APP_TITLE}. حسابك المجاني في انتظارك.
                        </p>
                        <button
                            onClick={() => onNavigateToAuth('register')}
                            className="bg-gradient-to-r from-accent to-accent-dark text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg [@media(hover:hover)]:hover:shadow-accent/40 transition-all duration-300 transform [@media(hover:hover)]:hover:scale-105"
                        >
                            أنشئ حسابك المجاني الآن
                        </button>
                    </div>
                </section>
            </main>

            <footer className="bg-card/50 py-6 border-t border-border">
                <div className="container mx-auto px-4 text-center text-sm text-textMuted">
                    <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 text-xs mb-4">
                        <button onClick={() => onNavigateToPage('aboutUs')} className="hover:text-primary hover:underline">من نحن</button>
                        <button onClick={() => onNavigateToPage('faq')} className="hover:text-primary hover:underline">الأسئلة الشائعة</button>
                        <button onClick={() => onNavigateToPage('contactUs')} className="hover:text-primary hover:underline">اتصل بنا</button>
                        <button onClick={() => onNavigateToPage('termsOfService')} className="hover:text-primary hover:underline">شروط الاستخدام</button>
                        <button onClick={() => onNavigateToPage('privacyPolicy')} className="hover:text-primary hover:underline">سياسة الخصوصية</button>
                        <button onClick={() => onNavigateToPage('medicalDisclaimer')} className="hover:text-primary hover:underline">إخلاء مسؤولية طبي</button>
                    </div>
                    <p>&copy; {new Date().getFullYear()} {APP_TITLE}. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPageView;