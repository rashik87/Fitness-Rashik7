import { Nutrient, ActivityLevel, UserData } from '../types';

// RDA and UL data is based on general guidelines from sources like the NIH and IOM.
// These are simplified for the app's purpose and should not be considered medical advice.
// Age ranges are simplified for easier lookup.

export const NUTRIENT_DATA: Nutrient[] = [
    // --- Vitamins ---
    {
        id: 'vit_a', name: 'فيتامين A', unit: 'mcg',
        importance: 'مهم لصحة النظر، وظائف المناعة، ونمو الخلايا.',
        foodSources: ['البطاطا الحلوة', 'الجزر', 'السبانخ', 'الكبدة', 'منتجات الألبان'],
        deficiencySymptoms: ['العمى الليلي', 'جفاف العين والجلد', 'ضعف المناعة'],
        rda: { male: { '19+': 900 }, female: { '19+': 700 } },
        ul: { male: { '19+': 3000 }, female: { '19+': 3000 } }
    },
    {
        id: 'vit_c', name: 'فيتامين C', unit: 'mg',
        importance: 'مضاد أكسدة قوي يدعم المناعة، صحة الجلد، وامتصاص الحديد.',
        foodSources: ['الفلفل الأحمر الحلو', 'البرتقال', 'الكيوي', 'البروكلي', 'الفراولة'],
        deficiencySymptoms: ['ضعف المناعة', 'نزيف اللثة', 'بطء التئام الجروح', 'التعب'],
        rda: { male: { '19+': 90 }, female: { '19+': 75 } },
        ul: { male: { '19+': 2000 }, female: { '19+': 2000 } }
    },
    {
        id: 'vit_d', name: 'فيتامين D', unit: 'IU',
        importance: 'ضروري لصحة العظام، وظائف المناعة، وتنظيم الهرمونات.',
        foodSources: ['الأسماك الدهنية (السلمون)', 'الحليب المدعم', 'صفار البيض', 'التعرض للشمس'],
        deficiencySymptoms: ['ضعف العظام', 'ضعف العضلات', 'تغيرات المزاج'],
        rda: { male: { '19-70': 600, '71+': 800 }, female: { '19-70': 600, '71+': 800 } },
        ul: { male: { '19+': 4000 }, female: { '19+': 4000 } }
    },
    {
        id: 'vit_e', name: 'فيتامين E', unit: 'mg',
        importance: 'مضاد أكسدة يحمي الخلايا من التلف.',
        foodSources: ['بذور دوار الشمس', 'اللوز', 'الأفوكادو', 'السبانخ'],
        deficiencySymptoms: ['ضعف العضلات', 'مشاكل في الرؤية', 'ضعف المناعة'],
        rda: { male: { '19+': 15 }, female: { '19+': 15 } },
        ul: { male: { '19+': 1000 }, female: { '19+': 1000 } },
        smartNotes: [(user: UserData) => user.activityLevel === ActivityLevel.ACTIVE || user.activityLevel === ActivityLevel.VERY_ACTIVE ? 'قد يحتاج الرياضيون لكمية أعلى بقليل للحماية من الإجهاد التأكسدي.' : null]
    },
    {
        id: 'vit_k', name: 'فيتامين K', unit: 'mcg',
        importance: 'ضروري لتخثر الدم وصحة العظام.',
        foodSources: ['الخضروات الورقية (الكرنب، السبانخ)', 'البروكلي', 'زيت الصويا'],
        deficiencySymptoms: ['سهولة الإصابة بالكدمات', 'نزيف مفرط'],
        rda: { male: { '19+': 120 }, female: { '19+': 90 } }
    },
    {
        id: 'vit_b1', name: 'فيتامين B1 (ثيامين)', unit: 'mg',
        importance: 'يساعد على تحويل الطعام إلى طاقة.',
        foodSources: ['الحبوب الكاملة', 'لحم الخنزير', 'الأسماك', 'البقوليات'],
        deficiencySymptoms: ['التعب', 'التهيج', 'ضعف العضلات'],
        rda: { male: { '19+': 1.2 }, female: { '19+': 1.1 } }
    },
    {
        id: 'vit_b2', name: 'فيتامين B2 (ريبوفلافين)', unit: 'mg',
        importance: 'مهم لإنتاج الطاقة وصحة الجلد والعين.',
        foodSources: ['منتجات الألبان', 'البيض', 'اللحوم الخالية من الدهون', 'الخضروات الورقية'],
        deficiencySymptoms: ['تشققات في زوايا الفم', 'التهاب الجلد', 'حساسية للضوء'],
        rda: { male: { '19+': 1.3 }, female: { '19+': 1.1 } }
    },
    {
        id: 'vit_b3', name: 'فيتامين B3 (نياسين)', unit: 'mg',
        importance: 'يساعد في وظائف الجهاز الهضمي والجلد والأعصاب.',
        foodSources: ['الدجاج', 'التونة', 'الفول السوداني', 'الأفوكادو'],
        deficiencySymptoms: ['التهاب الجلد', 'الإسهال', 'الخرف (مرض البلاغرا)'],
        rda: { male: { '19+': 16 }, female: { '19+': 14 } },
        ul: { male: { '19+': 35 }, female: { '19+': 35 } }
    },
    {
        id: 'vit_b5', name: 'فيتامين B5 (حمض البانتوثينيك)', unit: 'mg',
        importance: 'ضروري لتخليق الكوليسترول والهرمونات.',
        foodSources: ['الأفوكادو', 'الدجاج', 'البطاطا الحلوة', 'البروكلي'],
        deficiencySymptoms: ['نادر جداً، ولكن قد يسبب تنميل في اليدين والقدمين'],
        rda: { male: { '19+': 5 }, female: { '19+': 5 } }
    },
    {
        id: 'vit_b6', name: 'فيتامين B6 (بيريدوكسين)', unit: 'mg',
        importance: 'يشارك في أكثر من 100 تفاعل إنزيمي، معظمها يتعلق بعملية الأيض.',
        foodSources: ['الحمص', 'التونة', 'السلمون', 'الدواجن', 'البطاطس'],
        deficiencySymptoms: ['فقر الدم', 'الاكتئاب', 'الارتباك', 'ضعف المناعة'],
        rda: { male: { '19-50': 1.3, '51+': 1.7 }, female: { '19-50': 1.3, '51+': 1.5 } },
        ul: { male: { '19+': 100 }, female: { '19+': 100 } }
    },
    {
        id: 'vit_b7', name: 'فيتامين B7 (بيوتين)', unit: 'mcg',
        importance: 'يساعد في استقلاب الكربوهيدرات والدهون والأحماض الأمينية.',
        foodSources: ['صفار البيض', 'اللوز', 'القرنبيط', 'البطاطا الحلوة'],
        deficiencySymptoms: ['ترقق الشعر', 'طفح جلدي حول العينين والأنف والفم'],
        rda: { male: { '19+': 30 }, female: { '19+': 30 } }
    },
    {
        id: 'vit_b9', name: 'فيتامين B9 (الفولات)', unit: 'mcg',
        importance: 'حيوي لنمو الخلايا وتكوين الحمض النووي (DNA).',
        foodSources: ['الخضروات الورقية', 'البقوليات', 'الهليون', 'الأفوكادو'],
        deficiencySymptoms: ['فقر الدم كبير الكريات', 'التعب', 'تقرحات الفم'],
        rda: { male: { '19+': 400 }, female: { '19+': 400 } },
        ul: { male: { '19+': 1000 }, female: { '19+': 1000 } }
    },
    {
        id: 'vit_b12', name: 'فيتامين B12 (كوبالامين)', unit: 'mcg',
        importance: 'أساسي لصحة الأعصاب، وتكوين خلايا الدم الحمراء.',
        foodSources: ['اللحوم', 'الأسماك', 'منتجات الألبان', 'البيض'],
        deficiencySymptoms: ['التعب', 'فقر الدم', 'تنميل الأطراف', 'مشاكل في الذاكرة'],
        rda: { male: { '19+': 2.4 }, female: { '19+': 2.4 } }
    },
    // --- Major Minerals ---
    {
        id: 'min_calcium', name: 'الكالسيوم', unit: 'mg',
        importance: 'المعدن الأساسي لبناء وصيانة العظام والأسنان.',
        foodSources: ['منتجات الألبان', 'السردين', 'الخضروات الورقية الداكنة', 'اللوز'],
        deficiencySymptoms: ['هشاشة العظام', 'تشنجات العضلات', 'مشاكل في الأسنان'],
        rda: { male: { '19-50': 1000, '51-70': 1000, '71+': 1200 }, female: { '19-50': 1000, '51+': 1200 } },
        ul: { male: { '19-50': 2500, '51+': 2000 }, female: { '19-50': 2500, '51+': 2000 } }
    },
    {
        id: 'min_phosphorus', name: 'الفوسفور', unit: 'mg',
        importance: 'مكون أساسي للعظام والأسنان والحمض النووي (DNA).',
        foodSources: ['اللحوم', 'الدواجن', 'الأسماك', 'منتجات الألبان', 'المكسرات'],
        deficiencySymptoms: ['نادر، ولكن قد يسبب ضعف العظام والألم'],
        rda: { male: { '19+': 700 }, female: { '19+': 700 } },
        ul: { male: { '19-70': 4000, '71+': 3000 }, female: { '19-70': 4000, '71+': 3000 } }
    },
    {
        id: 'min_magnesium', name: 'المغنيسيوم', unit: 'mg',
        importance: 'يشارك في أكثر من 300 تفاعل إنزيمي، بما في ذلك إنتاج الطاقة ووظائف العضلات.',
        foodSources: ['اللوز', 'السبانخ', 'بذور اليقطين', 'الأفوكادو'],
        deficiencySymptoms: ['تشنجات العضلات', 'التعب', 'الأرق'],
        rda: { male: { '19-30': 400, '31+': 420 }, female: { '19-30': 310, '31+': 320 } },
        ul: { male: { '19+': 350 }, female: { '19+': 350 } }, // From supplements only
        relevanceCriteria: { activityLevels: [{ level: ActivityLevel.ACTIVE, multiplier: 1.15 }, { level: ActivityLevel.VERY_ACTIVE, multiplier: 1.2 }] },
        smartNotes: [(user: UserData) => user.activityLevel === ActivityLevel.ACTIVE || user.activityLevel === ActivityLevel.VERY_ACTIVE ? 'تمت زيادة احتياجك من المغنيسيوم بنسبة 15-20% لدعم وظائف العضلات والتعافي بسبب نشاطك العالي.' : null]
    },
    {
        id: 'min_sodium', name: 'الصوديوم', unit: 'mg',
        importance: 'إلكتروليت أساسي لتوازن السوائل ووظائف الأعصاب.',
        foodSources: ['ملح الطعام', 'الأطعمة المصنعة', 'الحساء المعلب', 'الصلصات'],
        deficiencySymptoms: ['نادر، قد يحدث مع التعرق الشديد ويسبب غثيان وصداع'],
        rda: { male: { '19+': 1500 }, female: { '19+': 1500 } },
        ul: { male: { '19+': 2300 }, female: { '19+': 2300 } }
    },
    {
        id: 'min_potassium', name: 'البوتاسيوم', unit: 'mg',
        importance: 'إلكتروليت حيوي لتوازن السوائل ووظائف العضلات وصحة القلب.',
        foodSources: ['الموز', 'البطاطا الحلوة', 'السبانخ', 'الأفوكادو'],
        deficiencySymptoms: ['ضعف العضلات والتشنجات', 'التعب', 'الإمساك'],
        rda: { male: { '19+': 3400 }, female: { '19+': 2600 } },
        relevanceCriteria: { activityLevels: [{ level: ActivityLevel.ACTIVE, multiplier: 1.1 }, { level: ActivityLevel.VERY_ACTIVE, multiplier: 1.2 }] }
    },
    {
        id: 'min_chloride', name: 'الكلوريد', unit: 'mg',
        importance: 'يعمل مع الصوديوم للحفاظ على توازن السوائل.',
        foodSources: ['ملح الطعام', 'الطماطم', 'الخس', 'الكرفس'],
        deficiencySymptoms: ['نادر جدًا'],
        rda: { male: { '19-50': 2300, '51-70': 2000, '71+': 1800 }, female: { '19-50': 2300, '51-70': 2000, '71+': 1800 } },
        ul: { male: { '19+': 3600 }, female: { '19+': 3600 } }
    },
     {
        id: 'min_sulfur', name: 'الكبريت', unit: 'mg',
        importance: 'مكون أساسي لبعض الأحماض الأمينية والفيتامينات، مهم لصحة الجلد والشعر.',
        foodSources: ['البيض', 'اللحوم', 'الأسماك', 'البصل', 'الثوم'],
        deficiencySymptoms: ['نادر جدًا عند تناول كمية كافية من البروتين'],
        rda: { male: { '19+': 1000 }, female: { '19+': 1000 } } // No official RDA, this is an estimate for adequacy
    },
    // --- Trace Minerals ---
    {
        id: 'min_iron', name: 'الحديد', unit: 'mg',
        importance: 'مكون أساسي للهيموجلوبين، الذي ينقل الأكسجين في الدم.',
        foodSources: ['اللحوم الحمراء', 'الدواجن', 'السبانخ', 'العدس'],
        deficiencySymptoms: ['فقر الدم', 'التعب الشديد', 'شحوب الجلد', 'ضيق التنفس'],
        rda: { male: { '19+': 8 }, female: { '19-50': 18, '51+': 8 } },
        ul: { male: { '19+': 45 }, female: { '19+': 45 } },
        smartNotes: [(user: UserData) => user.gender === 'female' && user.age >= 19 && user.age <= 50 ? 'زيادة الحديد مطلوبة للنساء في سن الإنجاب لتعويض الفقد أثناء الدورة الشهرية.' : null]
    },
    {
        id: 'min_zinc', name: 'الزنك', unit: 'mg',
        importance: 'معدن أساسي لوظائف المناعة، التئام الجروح، وتخليق البروتين.',
        foodSources: ['اللحوم الحمراء', 'المحار', 'بذور اليقطين', 'الحمص'],
        deficiencySymptoms: ['ضعف المناعة', 'فقدان الشهية', 'تساقط الشعر'],
        rda: { male: { '19+': 11 }, female: { '19+': 8 } },
        ul: { male: { '19+': 40 }, female: { '19+': 40 } }
    },
    {
        id: 'min_copper', name: 'النحاس', unit: 'mcg',
        importance: 'يساعد في تكوين خلايا الدم الحمراء والحفاظ على صحة الأعصاب والمناعة.',
        foodSources: ['المحار', 'الكبدة', 'المكسرات', 'بذور دوار الشمس'],
        deficiencySymptoms: ['فقر الدم', 'هشاشة العظام', 'مشاكل في الأعصاب'],
        rda: { male: { '19+': 900 }, female: { '19+': 900 } },
        ul: { male: { '19+': 10000 }, female: { '19+': 10000 } }
    },
    {
        id: 'min_manganese', name: 'المنغنيز', unit: 'mg',
        importance: 'يشارك في صحة العظام، استقلاب الطاقة، والحماية من الإجهاد التأكسدي.',
        foodSources: ['الحبوب الكاملة', 'المكسرات', 'البقوليات', 'الشاي'],
        deficiencySymptoms: ['نادر، ولكن قد يؤثر على نمو العظام'],
        rda: { male: { '19+': 2.3 }, female: { '19+': 1.8 } },
        ul: { male: { '19+': 11 }, female: { '19+': 11 } }
    },
    {
        id: 'min_iodine', name: 'اليود', unit: 'mcg',
        importance: 'ضروري لإنتاج هرمونات الغدة الدرقية.',
        foodSources: ['ملح الطعام المدعم باليود', 'الأسماك', 'منتجات الألبان'],
        deficiencySymptoms: ['تضخم الغدة الدرقية (goiter)', 'قصور الغدة الدرقية'],
        rda: { male: { '19+': 150 }, female: { '19+': 150 } },
        ul: { male: { '19+': 1100 }, female: { '19+': 1100 } }
    },
    {
        id: 'min_chromium', name: 'الكروم', unit: 'mcg',
        importance: 'يعزز عمل الأنسولين ويساعد في استقلاب الكربوهيدرات والدهون.',
        foodSources: ['البروكلي', 'العنب', 'لحم البقر', 'الديك الرومي'],
        deficiencySymptoms: ['نادر، قد يؤثر على مستويات السكر في الدم'],
        rda: { male: { '19-50': 35, '51+': 30 }, female: { '19-50': 25, '51+': 20 } }
    },
    {
        id: 'min_molybdenum', name: 'الموليبدينوم', unit: 'mcg',
        importance: 'يعمل كعامل مساعد للعديد من الإنزيمات الهامة.',
        foodSources: ['البقوليات', 'الحبوب الكاملة', 'المكسرات'],
        deficiencySymptoms: ['نادر للغاية'],
        rda: { male: { '19+': 45 }, female: { '19+': 45 } },
        ul: { male: { '19+': 2000 }, female: { '19+': 2000 } }
    },
     {
        id: 'min_fluoride', name: 'الفلورايد', unit: 'mg',
        importance: 'يساعد على تقوية مينا الأسنان والوقاية من التسوس.',
        foodSources: ['مياه الشرب المفلورة', 'الشاي', 'الأسماك'],
        deficiencySymptoms: ['زيادة خطر تسوس الأسنان'],
        rda: { male: { '19+': 4 }, female: { '19+': 3 } },
        ul: { male: { '19+': 10 }, female: { '19+': 10 } }
    },
    {
        id: 'min_selenium', name: 'السيلينيوم', unit: 'mcg',
        importance: 'مضاد أكسدة قوي ومهم لصحة الغدة الدرقية ووظائف المناعة.',
        foodSources: ['الجوز البرازيلي', 'التونة', 'السردين', 'البيض'],
        deficiencySymptoms: ['ضعف المناعة', 'مشاكل في القلب'],
        rda: { male: { '19+': 55 }, female: { '19+': 55 } },
        ul: { male: { '19+': 400 }, female: { '19+': 400 } }
    }
];
