export type SettingType = 'free' | 'bounded' | 'registry';

export interface PieceSetting {
  id: string;
  label: string;
  labelAr?: string;
  type: SettingType;
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  options?: { value: string; label: string }[];
}

export interface PieceDef {
  key: string;
  color: string;
  alwaysEmits: string[];
  settings: PieceSetting[];
}

export const THEMES = [
  { 
    id: 'waste', 
    name: 'Clean city', 
    nameAr: 'مدينة نظيفة',
    bg: 'var(--paper)', 
    binId: 'bin_waste',
    labels: {
      en: { agent: 'Citizen', carryable: 'Waste item', bin: 'Recycling bin', choice: 'Decision', zone: 'Area', rule: 'Law', queue: 'Line', hint: 'Guide', goal: 'Scoreboard' },
      ar: { agent: 'مواطن', carryable: 'نفايات', bin: 'حاوية إعادة تدوير', choice: 'قرار', zone: 'منطقة', rule: 'قانون', queue: 'طابور', hint: 'مرشد', goal: 'لوحة النتائج' }
    }
  },
  { 
    id: 'water', 
    name: 'Water saver', 
    nameAr: 'ترشيد المياه',
    bg: '#E0F2FE', 
    binId: 'bin_water',
    labels: {
      en: { agent: 'Plumber', carryable: 'Pipe', bin: 'Drain', choice: 'Action', zone: 'Puddle', rule: 'Regulation', queue: 'Waiting list', hint: 'Manual', goal: 'Target' },
      ar: { agent: 'سباك', carryable: 'أنبوب', bin: 'بالوعة', choice: 'إجراء', zone: 'بركة', rule: 'لائحة', queue: 'قائمة انتظار', hint: 'دليل', goal: 'هدف' }
    }
  },
  { 
    id: 'letters', 
    name: 'Arabic letters', 
    nameAr: 'الحروف العربية',
    bg: '#FEF3C7', 
    binId: 'bin_letters',
    labels: {
      en: { agent: 'Student', carryable: 'Letter block', bin: 'Word board', choice: 'Quiz', zone: 'Desk', rule: 'Grammar', queue: 'Turn', hint: 'Teacher', goal: 'Grade' },
      ar: { agent: 'طالب', carryable: 'مكعب حرف', bin: 'لوحة كلمات', choice: 'اختبار', zone: 'مكتب', rule: 'نحو', queue: 'دور', hint: 'معلم', goal: 'درجة' }
    }
  }
];

export const PIECES: PieceDef[] = [
  {
    key: 'agent',
    color: 'var(--block-blue)',
    alwaysEmits: ['session.start', 'movement.sample', 'session.end'],
    settings: [
      { id: 'avatarArt', label: 'Avatar art', type: 'free', placeholder: 'Asset ID or URL' },
      { id: 'moveSpeed', label: 'Move speed', type: 'bounded', min: 2.0, max: 6.0, unit: 'u/s' },
    ]
  },
  {
    key: 'carryable',
    color: 'var(--block-teal)',
    alwaysEmits: ['object.pick', 'object.drop'],
    settings: [
      { id: 'sprite', label: 'Sprite', type: 'free', placeholder: 'Asset ID or URL' },
      { id: 'copies', label: 'Copies on screen', type: 'bounded', min: 4, max: 16 },
      { id: 'trueCategory', label: 'True category', type: 'registry', options: [{value: 'recyclable', label: 'Recyclable'}, {value: 'organic', label: 'Organic'}] }
    ]
  },
  {
    key: 'bin',
    color: 'var(--block-amber)',
    alwaysEmits: ['object.place'],
    settings: [
      { id: 'labelArEn', label: 'Label AR/EN', type: 'free', placeholder: 'e.g. الورق / Paper' },
      { id: 'acceptedCategory', label: 'Accepted category', type: 'registry', options: [{value: 'recyclable', label: 'Recyclable'}, {value: 'organic', label: 'Organic'}] }
    ]
  },
  {
    key: 'choice',
    color: 'var(--block-violet)',
    alwaysEmits: ['prompt.presented', 'decision.made'],
    settings: [
      { id: 'questionText', label: 'Question text', type: 'free', placeholder: 'What do you do?' },
      { id: 'optionArt', label: 'Option art', type: 'free', placeholder: 'Asset ID' },
      { id: 'timeAllowed', label: 'Time allowed', type: 'bounded', min: 8, max: 25, unit: 's' }
    ]
  },
  {
    key: 'zone',
    color: 'var(--block-teal)',
    alwaysEmits: ['zone.enter', 'zone.exit'],
    settings: [
      { id: 'overlayColor', label: 'Overlay colour', type: 'free', placeholder: '#HEX' },
      { id: 'zoneRole', label: 'Zone role', type: 'registry', options: [{value: 'safe', label: 'Safe'}, {value: 'danger', label: 'Danger'}, {value: 'objective', label: 'Objective'}] }
    ]
  },
  {
    key: 'rule',
    color: 'var(--block-coral)',
    alwaysEmits: ['rule.violation', 'self.correction'],
    settings: [
      { id: 'warningArt', label: 'Warning art', type: 'free', placeholder: 'Asset ID' },
      { id: 'fixItWindow', label: 'Fix-it window', type: 'bounded', min: 3, max: 15, unit: 's' },
      { id: 'ruleId', label: 'Rule id', type: 'registry', options: [{value: 'no_running', label: 'No running'}, {value: 'keep_clean', label: 'Keep clean'}] }
    ]
  },
  {
    key: 'queue',
    color: 'var(--block-amber)',
    alwaysEmits: ['turn.wait', 'turn.skip'],
    settings: [
      { id: 'queueArt', label: 'Queue art', type: 'free', placeholder: 'Asset ID' },
      { id: 'othersWaiting', label: 'Others waiting', type: 'bounded', min: 2, max: 6 }
    ]
  },
  {
    key: 'hint',
    color: 'var(--block-violet)',
    alwaysEmits: ['hint.request'],
    settings: [
      { id: 'icon', label: 'Icon', type: 'free', placeholder: 'Asset ID' },
      { id: 'cooldown', label: 'Cooldown', type: 'bounded', min: 10, max: 45, unit: 's' }
    ]
  },
  {
    key: 'goal',
    color: 'var(--block-blue)',
    alwaysEmits: ['task.complete', 'task.fail'],
    settings: [
      { id: 'winAnim', label: 'Win animation', type: 'free', placeholder: 'Asset ID' },
      { id: 'targetScore', label: 'Target score', type: 'bounded', min: 4, max: 12 }
    ]
  }
];

export const DEFAULT_PIECE_SETTINGS = PIECES.reduce((acc, piece) => {
  acc[piece.key] = piece.settings.reduce((sAcc, setting) => {
    sAcc[setting.id] = '';
    return sAcc;
  }, {} as Record<string, any>);
  return acc;
}, {} as Record<string, any>);
