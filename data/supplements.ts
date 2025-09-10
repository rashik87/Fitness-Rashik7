
import { Supplement, Goal, ActivityLevel } from '../types';

export const SUPPLEMENT_DATA: Supplement[] = [
    {
        id: 'sup_1',
        name: 'بروتين مصل اللبن (Whey Protein)',
        description: 'مكمل بروتين سريع الامتصاص، مشتق من الحليب، يساعد في بناء وإصلاح العضلات.',
        benefits: [
            'تسريع استشفاء العضلات بعد التمرين.',
            'المساعدة في تلبية الاحتياج اليومي من البروتين بسهولة.',
            'زيادة تخليق البروتين العضلي لدعم النمو.',
            'يمكن أن يساعد في الشعور بالشبع عند استخدامه في أنظمة خسارة الوزن.'
        ],
        relevanceCriteria: {
            goals: [Goal.GAIN_WEIGHT, Goal.LOSE_WEIGHT, Goal.MAINTAIN_WEIGHT],
            activityLevels: [ActivityLevel.MODERATE, ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE]
        },
        dosage: {
            baseAmount: '20-40',
            unit: 'جرام',
            notes: [
                'يفضل تناوله بعد التمرين مباشرة لتحقيق أقصى استفادة.',
                'لا يجب أن يتجاوز البروتين من المكملات 40% من إجمالي احتياجك اليومي من الطعام.'
            ],
            calculation: (user, macros) => {
                 if (macros && macros.protein > 0 && user.weight > 0) {
                     const maxGrams = macros.protein * 0.4;
                     return `لتحقيق أقصى استفادة من التغذية، يوصى بألا يتجاوز استهلاكك من هذا المكمل ${maxGrams.toFixed(0)} جرام يوميًا (40% من هدف البروتين الخاص بك).`;
                 }
                 return null;
            }
        }
    },
    {
        id: 'sup_2',
        name: 'الكرياتين مونوهيدرات (Creatine Monohydrate)',
        description: 'واحد من أكثر المكملات فعالية وأمانًا لزيادة القوة والأداء في التمارين عالية الشدة.',
        benefits: [
            'زيادة القوة والقدرة على التحمل في التمارين قصيرة المدى.',
            'تحسين الأداء الرياضي العام.',
            'المساعدة في زيادة الكتلة العضلية الصافية.',
            'تسريع استعادة الطاقة بين الجولات التدريبية.'
        ],
        relevanceCriteria: {
            goals: [Goal.GAIN_WEIGHT, Goal.MAINTAIN_WEIGHT],
            activityLevels: [ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE]
        },
        dosage: {
            baseAmount: '3-7',
            unit: 'جرام',
            notes: [
                'اشرب كميات كافية من الماء (≥ 3 لتر يوميًا).',
                'يمكن تناوله في أي وقت من اليوم، لا حاجة لمرحلة تحميل.'
            ],
            calculation: (user) => {
                if (user.age < 18) return "غير موصى به إلا بإشراف مختص.";
                const dose = Math.max(3, Math.min(0.1 * user.weight, 7));
                return `بناءً على وزنك (~${user.weight.toFixed(0)} كجم)، الجرعة الفعالة لك هي حوالي ${dose.toFixed(1)} جرام/يوم.`;
            }
        }
    },
    {
        id: 'sup_3',
        name: 'أوميغا-3 (زيت السمك)',
        description: 'أحماض دهنية أساسية (EPA و DHA) لها فوائد صحية واسعة، خاصة لصحة القلب والدماغ والمفاصل.',
        benefits: [
            'دعم صحة القلب والأوعية الدموية.',
            'تقليل الالتهابات في الجسم والمفاصل.',
            'دعم الوظائف الإدراكية وصحة الدماغ.',
            'تحسين حساسية الأنسولين.'
        ],
        relevanceCriteria: {
            general: true
        },
        dosage: {
            baseAmount: '1000-2000',
            unit: 'مجم (EPA+DHA)',
            notes: [
                'يفضل تناوله مع وجبة تحتوي على دهون لزيادة الامتصاص.'
            ]
        }
    },
    {
        id: 'sup_4',
        name: 'فيتامين د3 (Vitamin D3)',
        description: 'فيتامين أساسي ضروري لصحة العظام، وظائف المناعة، وتنظيم الهرمونات. يعاني الكثيرون من نقصه بسبب قلة التعرض للشمس.',
        benefits: [
            'دعم امتصاص الكالسيوم وصحة العظام.',
            'تقوية جهاز المناعة.',
            'تحسين المزاج والوظائف العقلية.',
            'دعم مستويات هرمون التستوستيرون الصحية.'
        ],
        relevanceCriteria: {
            general: true
        },
        dosage: {
            baseAmount: '1000-4000',
            unit: 'وحدة دولية (IU)',
            notes: [
                'يفضل تناوله مع وجبة تحتوي على دهون.',
                'استشر طبيبك لتحديد الجرعة المناسبة لك بناءً على تحاليل الدم.'
            ]
        }
    },
    {
        id: 'sup_5',
        name: 'الكافيين (Caffeine)',
        description: 'منبه طبيعي للجهاز العصبي المركزي، يستخدم لزيادة الطاقة والتركيز وتحسين الأداء الرياضي.',
        benefits: [
            'زيادة الطاقة وتقليل الشعور بالتعب.',
            'تحسين التركيز الذهني واليقظة.',
            'زيادة الأداء في تمارين التحمل والقوة.',
            'قد يساعد في زيادة معدل الأيض بشكل طفيف.'
        ],
        relevanceCriteria: {
            goals: [Goal.LOSE_WEIGHT, Goal.MAINTAIN_WEIGHT, Goal.GAIN_WEIGHT],
            activityLevels: [ActivityLevel.LIGHT, ActivityLevel.MODERATE, ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE]
        },
        dosage: {
            baseAmount: '100-200',
            unit: 'مجم',
            notes: [
                'تناوله قبل التمرين بـ 30-60 دقيقة.',
                'تجنب تناوله في وقت متأخر من اليوم لتجنب التأثير على النوم.'
            ],
            calculation: (user) => {
                const dose = (3 * user.weight).toFixed(0);
                return `لتحسين الأداء، يمكنك تناول حوالي 3 مجم لكل كجم من وزنك، أي ما يعادل ${dose} مجم. ابدأ بجرعة أقل لتقييم تحملك.`;
            }
        }
    },
    {
        id: 'sup_6',
        name: 'بيتا-ألانين (Beta-Alanine)',
        description: 'حمض أميني يساعد على زيادة الكارنوزين في العضلات، مما يؤخر التعب العضلي أثناء التمارين عالية الشدة.',
        benefits: [
            'زيادة القدرة على التحمل العضلي.',
            'تحسين الأداء في التمارين التي تستمر من 1 إلى 4 دقائق.',
            'تقليل الشعور بالإرهاق العضلي (الحرقان).',
        ],
        relevanceCriteria: {
            activityLevels: [ActivityLevel.MODERATE, ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE]
        },
        dosage: {
            baseAmount: '3-6',
            unit: 'جرام',
            notes: [
                'قد يسبب إحساسًا بالوخز (paresthesia) وهو غير ضار. يمكن تقليل ذلك بتوزيع الجرعة.',
                'وزّع الجرعة على 2–3 مرات خلال اليوم.'
            ],
            calculation: (user) => {
                if (user.age < 18) return "غير موصى به إلا بإشراف مختص.";
                let dose = "3.5–4 جرام/يوم";
                switch(user.activityLevel) {
                    case ActivityLevel.LIGHT: dose = "3 جرام/يوم"; break;
                    case ActivityLevel.MODERATE: dose = "3.5–4 جرام/يوم"; break;
                    case ActivityLevel.ACTIVE: dose = "4.5–5 جرام/يوم"; break;
                    case ActivityLevel.VERY_ACTIVE: dose = "6 جرام/يوم"; break;
                }
                return `الجرعة الموصى بها لمستوى نشاطك هي ${dose}.`;
            }
        }
    },
    {
        id: 'sup_7',
        name: 'الأحماض الأمينية متفرعة السلسلة (BCAAs)',
        description: 'مجموعة من ثلاثة أحماض أمينية أساسية (ليوسين، إيزوليوسين، فالين) تلعب دورًا في تخليق البروتين العضلي.',
        benefits: [
            'قد تساعد في تقليل آلام العضلات بعد التمرين.',
            'يمكن استخدامها كمصدر للطاقة أثناء التمارين الطويلة.',
            'قد تقلل من التعب الذهني أثناء التمرين.'
        ],
        relevanceCriteria: {
            activityLevels: [ActivityLevel.ACTIVE, ActivityLevel.VERY_ACTIVE]
        },
        dosage: {
            baseAmount: '5-15',
            unit: 'جرام',
            notes: [
                'يفضل تناولها قبل أو أثناء التمرين.',
            ],
            calculation: (user, macros) => {
                if (macros && user && user.weight > 0) {
                    const proteinIntakePerKg = macros.protein / user.weight;
                    if (proteinIntakePerKg >= 1.6) {
                        return "ملاحظة: استهلاكك للبروتين من الطعام كافٍ (≥1.6 غ/كغ)، لذا لا توجد حاجة إلزامية لهذا المكمل.";
                    }
                }
                const minDose = (0.1 * user.weight).toFixed(1);
                const maxDose = (0.2 * user.weight).toFixed(1);
                return `جرعة تتراوح بين ${minDose}-${maxDose} جرام/يوم قد تكون مفيدة لك.`;
            }
        }
    }
];