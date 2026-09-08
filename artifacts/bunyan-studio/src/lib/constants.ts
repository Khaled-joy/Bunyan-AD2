export type PieceGroup = 'Maps' | 'Characters' | 'Objects' | 'Actions';

export const DOMAINS = [
  { id: 'civic-life', label: 'Civic life', labelAr: 'الحياة المدنية' },
  { id: 'health-wellbeing', label: 'Health and wellbeing', labelAr: 'الصحة والرفاهية' },
  { id: 'safety', label: 'Safety', labelAr: 'السلامة' },
  { id: 'digital-citizenship', label: 'Digital citizenship', labelAr: 'المواطنة الرقمية' },
  { id: 'heritage-culture', label: 'Heritage and culture', labelAr: 'التراث والثقافة' },
  { id: 'science-discovery', label: 'Science and discovery', labelAr: 'العلوم والاكتشاف' },
  { id: 'money-resources', label: 'Money and resources', labelAr: 'المال والموارد' },
  { id: 'teamwork', label: 'Teamwork', labelAr: 'العمل الجماعي' }
] as const;

export const PRODUCTION_NEEDS = [
  { id: 'characterArt', label: 'Character art', labelAr: 'فن الشخصيات' },
  { id: 'mapArt', label: 'Map art', labelAr: 'فن الخرائط' },
  { id: 'objectArt', label: 'Object art', labelAr: 'فن الأشياء' },
  { id: 'voiceOver', label: 'Voice-over', labelAr: 'تعليق صوتي' },
  { id: 'musicSound', label: 'Music and sound', labelAr: 'موسيقى وصوت' },
  { id: 'arabicCopy', label: 'Arabic copy', labelAr: 'نصوص عربية' },
  { id: 'englishCopy', label: 'English copy', labelAr: 'نصوص إنجليزية' },
  { id: 'motionAnimation', label: 'Motion and animation', labelAr: 'تحريك ورسوم متحركة' },
  { id: 'accessibilityPass', label: 'Accessibility pass', labelAr: 'دعم الوصول' }
] as const;

export const BEHAVIOURS = [
  { id: 'responsibility', label: 'Responsibility', labelAr: 'المسؤولية' },
  { id: 'respect', label: 'Respect', labelAr: 'الاحترام' },
  { id: 'participation', label: 'Participation', labelAr: 'المشاركة' },
  { id: 'courage', label: 'Courage', labelAr: 'الشجاعة' },
  { id: 'problemSolving', label: 'Problem solving', labelAr: 'حل المشكلات' },
] as const;

export const SWATCHES = [
  { id: 'blue', value: 'var(--blue)', label: 'Blue', labelAr: 'أزرق' },
  { id: 'amber', value: 'var(--amber)', label: 'Amber', labelAr: 'كهرماني' },
  { id: 'coral', value: 'var(--coral)', label: 'Coral', labelAr: 'مرجاني' },
  { id: 'teal', value: 'var(--teal)', label: 'Teal', labelAr: 'تركوازي' },
  { id: 'violet', value: 'var(--violet)', label: 'Violet', labelAr: 'بنفسجي' },
  { id: 'ink', value: 'var(--ink)', label: 'Navy', labelAr: 'كحلي' },
] as const;

export const EVENT_CONTRACTS = {
  'session.start': ['session_id', 'pseudonym_id', 'age_segment', 'game_id', 'game_version', 'bes_version', 'device'],
  'zone.enter': ['zone_id'],
  'zone.exit': ['zone_id', 'dwell_ms'],
  'npc.approach': ['npc_id'],
  'npc.interact': ['npc_id', 'latency_ms'],
  'object.pick': ['object_id', 'pick_latency_ms', 'from_zone'],
  'object.drop': ['object_id', 'to_zone'],
  'object.place': ['container_id', 'object_id', 'correct', 'latency_ms', 'attempt_index'],
  'object.use': ['tool_id', 'latency_ms'],
  'prompt.presented': ['stimulus_id', 'presented_at', 'modality'],
  'decision.made': ['choice_id', 'options_shown', 'latency_ms', 'changed_mind_count'],
  'rule.violation': ['rule_id', 'severity'],
  'self.correction': ['rule_id', 'corrected_within_ms'],
  'turn.wait': ['wait_ms', 'position_in_queue'],
  'turn.skip': ['position_in_queue'],
  'hint.request': ['elapsed_ms', 'attempt_index'],
  'movement.sample': ['x', 'y', 'heading', 'speed', 'dt'],
  'task.complete': ['duration_ms', 'accuracy', 'optimal_path_ratio'],
  'task.fail': ['duration_ms', 'attempt_index'],
  'session.end': ['duration_ms', 'event_count']
} as const;

export interface SealedType {
  type: string;
  alwaysRecords: (keyof typeof EVENT_CONTRACTS)[];
  bounded: { id: string; label: string; labelAr: string; min: number; max: number; unit?: string } | null;
  registry: { id: string; label: string; labelAr: string; options: { value: string; label: string; labelAr: string }[] } | null;
  needsAssignment: boolean;
}

export const SEALED_TYPES: Record<string, SealedType> = {
  map: {
    type: 'map',
    alwaysRecords: ['zone.enter', 'zone.exit'],
    bounded: null,
    registry: { 
      id: 'areaRole', label: 'Area role', labelAr: 'دور المنطقة', 
      options: [{ value: 'safe', label: 'Safe', labelAr: 'آمن' }, { value: 'danger', label: 'Danger', labelAr: 'خطر' }, { value: 'objective', label: 'Objective', labelAr: 'هدف' }] 
    },
    needsAssignment: false,
  },
  player: {
    type: 'player',
    alwaysRecords: ['session.start', 'movement.sample', 'session.end'],
    bounded: { id: 'moveSpeed', label: 'Move speed', labelAr: 'سرعة الحركة', min: 2, max: 6, unit: 'u/s' },
    registry: null,
    needsAssignment: false,
  },
  npc: {
    type: 'npc',
    alwaysRecords: ['npc.approach', 'npc.interact'],
    bounded: null,
    registry: { 
      id: 'characterRole', label: 'Character role', labelAr: 'دور الشخصية', 
      options: [{ value: 'guide', label: 'Guide', labelAr: 'مرشد' }, { value: 'obstacle', label: 'Obstacle', labelAr: 'عائق' }] 
    },
    needsAssignment: true,
  },
  carryable: {
    type: 'carryable',
    alwaysRecords: ['object.pick', 'object.drop'],
    bounded: { id: 'copiesOnScreen', label: 'Copies on screen', labelAr: 'النسخ على الشاشة', min: 4, max: 16 },
    registry: { 
      id: 'trueCategory', label: 'True category', labelAr: 'الفئة الحقيقية', 
      options: [{ value: 'good', label: 'Good', labelAr: 'جيد' }, { value: 'bad', label: 'Bad', labelAr: 'سيئ' }] 
    },
    needsAssignment: true,
  },
  container: {
    type: 'container',
    alwaysRecords: ['object.place'],
    bounded: null,
    registry: { 
      id: 'acceptedCategory', label: 'Accepted category', labelAr: 'الفئة المقبولة', 
      options: [{ value: 'good', label: 'Good', labelAr: 'جيد' }, { value: 'bad', label: 'Bad', labelAr: 'سيئ' }] 
    },
    needsAssignment: true,
  },
  tool: {
    type: 'tool',
    alwaysRecords: ['object.use'],
    bounded: { id: 'usesAllowed', label: 'Uses allowed', labelAr: 'الاستخدامات المسموحة', min: 1, max: 10 },
    registry: null,
    needsAssignment: true,
  },
  sign: {
    type: 'sign',
    alwaysRecords: ['prompt.presented'],
    bounded: { id: 'visibleFor', label: 'Visible for', labelAr: 'مرئي لمدة', min: 3, max: 20, unit: 's' },
    registry: null,
    needsAssignment: true,
  },
  choice: {
    type: 'choice',
    alwaysRecords: ['prompt.presented', 'decision.made'],
    bounded: { id: 'timeAllowed', label: 'Time allowed', labelAr: 'الوقت المسموح', min: 8, max: 25, unit: 's' },
    registry: null,
    needsAssignment: true,
  },
  rule: {
    type: 'rule',
    alwaysRecords: ['rule.violation', 'self.correction'],
    bounded: { id: 'fixItWindow', label: 'Fix-it window', labelAr: 'نافذة الإصلاح', min: 3, max: 15, unit: 's' },
    registry: { 
      id: 'ruleId', label: 'Rule id', labelAr: 'معرف القاعدة', 
      options: [{ value: 'no_running', label: 'No running', labelAr: 'ممنوع الركض' }, { value: 'keep_clean', label: 'Keep clean', labelAr: 'حافظ على النظافة' }] 
    },
    needsAssignment: true,
  },
  queue: {
    type: 'queue',
    alwaysRecords: ['turn.wait', 'turn.skip'],
    bounded: { id: 'othersWaiting', label: 'Others waiting', labelAr: 'آخرون ينتظرون', min: 2, max: 6 },
    registry: null,
    needsAssignment: true,
  },
  hint: {
    type: 'hint',
    alwaysRecords: ['hint.request'],
    bounded: { id: 'cooldown', label: 'Cooldown', labelAr: 'فترة التبريد', min: 10, max: 45, unit: 's' },
    registry: null,
    needsAssignment: true,
  },
  goal: {
    type: 'goal',
    alwaysRecords: ['task.complete', 'task.fail'],
    bounded: { id: 'targetScore', label: 'Target score', labelAr: 'النقاط المستهدفة', min: 4, max: 12 },
    registry: null,
    needsAssignment: true,
  }
};

export interface PaletteEntry {
  id: string;
  name: string;
  nameAr: string;
  group: PieceGroup;
  sealedType: string;
}

export const PALETTE: PaletteEntry[] = [
  { id: 'map_classroom', name: 'Classroom', nameAr: 'فصل دراسي', group: 'Maps', sealedType: 'map' },
  { id: 'map_schoolyard', name: 'School yard', nameAr: 'فناء المدرسة', group: 'Maps', sealedType: 'map' },
  { id: 'map_city', name: 'City street', nameAr: 'شارع المدينة', group: 'Maps', sealedType: 'map' },
  { id: 'map_home', name: 'Home', nameAr: 'منزل', group: 'Maps', sealedType: 'map' },
  { id: 'map_market', name: 'Market', nameAr: 'سوق', group: 'Maps', sealedType: 'map' },
  { id: 'map_sports', name: 'Sports hall', nameAr: 'صالة رياضية', group: 'Maps', sealedType: 'map' },
  { id: 'char_player', name: 'Player child', nameAr: 'طفل لاعب', group: 'Characters', sealedType: 'player' },
  { id: 'char_adult', name: 'Adult guide', nameAr: 'مرشد بالغ', group: 'Characters', sealedType: 'npc' },
  { id: 'char_friend', name: 'Friend', nameAr: 'صديق', group: 'Characters', sealedType: 'npc' },
  { id: 'char_crowd', name: 'Crowd', nameAr: 'حشد', group: 'Characters', sealedType: 'npc' },
  { id: 'obj_carryable', name: 'Carryable item', nameAr: 'عنصر قابل للحمل', group: 'Objects', sealedType: 'carryable' },
  { id: 'obj_container', name: 'Container', nameAr: 'حاوية', group: 'Objects', sealedType: 'container' },
  { id: 'obj_tool', name: 'Tool', nameAr: 'أداة', group: 'Objects', sealedType: 'tool' },
  { id: 'obj_sign', name: 'Sign', nameAr: 'علامة', group: 'Objects', sealedType: 'sign' },
  { id: 'act_choice', name: 'Choice point', nameAr: 'نقطة اختيار', group: 'Actions', sealedType: 'choice' },
  { id: 'act_rule', name: 'Rule', nameAr: 'قاعدة', group: 'Actions', sealedType: 'rule' },
  { id: 'act_queue', name: 'Queue', nameAr: 'طابور', group: 'Actions', sealedType: 'queue' },
  { id: 'act_hint', name: 'Hint button', nameAr: 'زر تلميح', group: 'Actions', sealedType: 'hint' },
  { id: 'act_goal', name: 'Goal', nameAr: 'هدف', group: 'Actions', sealedType: 'goal' },
];

export const EVENTS_LIST = Object.keys(EVENT_CONTRACTS);
export const GAME_CATEGORIES = [
  'role-based',
  'scenario-based',
  'simulation-strategy',
  'puzzle',
  'mini-games',
  'creative',
  'exploration'
] as const;

export const GAME_DOMAINS = [
  'literacy',
  'activities',
  'environment',
  'developmental-skills',
  'social-relations'
] as const;


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
