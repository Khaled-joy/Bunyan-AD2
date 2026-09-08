const fs = require('fs');

const constantsPath = 'artifacts/bunyan-studio/src/lib/constants.ts';
let code = fs.readFileSync(constantsPath, 'utf8');

const additions = `
export const NEW_CATEGORIES = [
  { id: 'role-based', label: 'Role-based', labelAr: 'قائمة على الأدوار', test: 'Is the player someone else?', testAr: 'هل يتقمص اللاعب شخصاً آخر؟' },
  { id: 'scenario-based', label: 'Scenario-based', labelAr: 'قائمة على السيناريو', test: 'Is the choice set closed?', testAr: 'هل مجموعة الخيارات مغلقة؟' },
  { id: 'simulation-strategy', label: 'Simulation / Strategy', labelAr: 'المحاكاة / الاستراتيجية', test: 'Is a system managed over time?', testAr: 'هل تتم إدارة نظام عبر الزمن؟' },
  { id: 'puzzle', label: 'Puzzle', labelAr: 'الألغاز', test: 'Is there one correct answer?', testAr: 'هل توجد إجابة صحيحة واحدة؟' },
  { id: 'mini-games', label: 'Mini games', labelAr: 'الألعاب المصغرة', test: 'Short, scored, repeatable?', testAr: 'قصيرة، محسوبة، قابلة للتكرار؟' },
  { id: 'creative', label: 'Creative', labelAr: 'الإبداع', test: 'Does the player produce something?', testAr: 'هل ينتج اللاعب شيئاً؟' },
  { id: 'exploration', label: 'Exploration', labelAr: 'الاستكشاف', test: 'Does the player find something?', testAr: 'هل يجد اللاعب شيئاً؟' },
];

export const NEW_DOMAINS = [
  { id: 'literacy', label: 'Literacy', labelAr: 'القراءة والكتابة', headline: 'proficiency rate — the proportion of learners at or above a benchmark.', headlineAr: 'معدل الإتقان — نسبة المتعلمين عند مستوى معياري أو فوقه.' },
  { id: 'activities', label: 'Health', labelAr: 'الصحة', headline: 'guideline adherence rate, corrected for reporting bias.', headlineAr: 'معدل الالتزام بالإرشادات، مصححاً لتحيز الإبلاغ.' },
  { id: 'environment', label: 'Environment', labelAr: 'البيئة', headline: 'environmental literacy composite...', headlineAr: 'مركب الثقافة البيئية...' },
  { id: 'developmental-skills', label: 'Developmental skills', labelAr: 'المهارات النمائية', headline: 'skills composite.', headlineAr: 'مركب المهارات.' },
  { id: 'social-relations', label: 'Social relations', labelAr: 'العلاقات الاجتماعية', headline: 'social connectedness rate.', headlineAr: 'معدل الترابط الاجتماعي.' },
];

export const TIERS = [
  {
    id: '1', name: 'Game-only', nameAr: 'اللعبة فقط',
    sources: 'Game telemetry', sourcesAr: 'بيانات اللعبة',
    appropriate: 'Adaptive difficulty; population monitoring; screening candidates for further assessment', appropriateAr: 'الصعوبة التكيفية؛ مراقبة السكان؛ فحص المرشحين لتقييم إضافي'
  },
  {
    id: '2', name: 'Game + self-report', nameAr: 'اللعبة + التقرير الذاتي',
    sources: 'Game telemetry; student self-report', sourcesAr: 'بيانات اللعبة؛ التقرير الذاتي للطالب',
    appropriate: 'Programme design; identifying motivational barriers; class-level review', appropriateAr: 'تصميم البرامج؛ تحديد العوائق التحفيزية؛ مراجعة على مستوى الصف'
  },
  {
    id: '3', name: 'Full multi-source integration', nameAr: 'تكامل كامل متعدد المصادر',
    sources: 'Game telemetry; self-report; proxy report; administrative data', sourcesAr: 'بيانات اللعبة؛ التقرير الذاتي؛ تقرير الوكيل؛ البيانات الإدارية',
    appropriate: 'Individual case review; equity analysis; policy indicators; referral', appropriateAr: 'مراجعة الحالة الفردية؛ تحليل الإنصاف؛ مؤشرات السياسات؛ الإحالة'
  }
];
`;

if (!code.includes('NEW_CATEGORIES')) {
  fs.writeFileSync(constantsPath, code + additions);
}
