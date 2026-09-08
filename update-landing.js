const fs = require('fs');

const path = 'artifacts/bunyan-studio/src/pages/landing.tsx';
let code = fs.readFileSync(path, 'utf8');

const newImports = `
import { NEW_CATEGORIES, NEW_DOMAINS, TIERS, BEHAVIOURS, DOMAINS } from '@/lib/constants';
import { AlertTriangle, Send } from 'lucide-react';
`;
code = code.replace("import { Trash2 } from 'lucide-react';", "import { Trash2 } from 'lucide-react';\n" + newImports);

const newSchema = `
const briefSchema = (locale: 'en' | 'ar') => z.object({
  fullName: z.string().min(1, t('home.form.valNameReq', locale) as string),
  email: z.string().email(t('home.form.valEmailReq', locale) as string),
  entity: z.string().min(1, t('home.form.valEntityReq', locale) as string),
  phone: z.string().optional(),
  gameName: z.string().min(1, t('home.form.valGameNameReq', locale) as string),
  description: z.string().min(100, t('home.form.valDescMin', locale) as string).max(2000, t('home.form.valDescMax', locale) as string),
  categories: z.array(z.string()).min(1, t('home.form.valCatReq', locale) as string),
  ageGroups: z.array(z.string()).min(1, t('home.form.valAgeReq', locale) as string),
  languages: z.array(z.string()).min(1, t('home.form.valLangReq', locale) as string),
  referenceUrl: z.string().optional(),
  domain: z.string().min(1, t('home.form.valDomainReq', locale) as string),
  indicator: z.string().min(50, t('home.form.valIndReq', locale) as string),
  indicatorType: z.enum(['existing', 'new'], { errorMap: () => ({ message: t('home.form.valIndTypeReq', locale) as string }) }),
  tier: z.string().min(1, t('home.form.valTierReq', locale) as string),
  scope: z.string().min(1, t('home.form.valScopeReq', locale) as string),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

function deriveAgeGroup(ages: string[]) {
  if (ages.includes('16-18') || ages.includes('13-15')) return '13-17';
  if (ages.includes('10-12') || ages.includes('7-9')) return '9-12';
  return '6-8';
}

function deriveLanguage(langs: string[]) {
  if (langs.includes('ar') && langs.includes('en')) return 'both';
  if (langs.includes('ar')) return 'ar';
  return 'en';
}

function deriveBehaviours(domain: string) {
  if (['literacy', 'developmental-skills'].includes(domain)) return ['problemSolving'];
  if (['activities', 'environment'].includes(domain)) return ['responsibility'];
  if (domain === 'social-relations') return ['respect', 'participation'];
  return ['problemSolving'];
}

const RequestSection = ({ number, title, children }: { number: number, title: string, children: React.ReactNode }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-6">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--blue)]/10 text-[var(--blue)] font-bold font-display">{number}</span>
      <h3 className="text-xl font-bold font-display text-[var(--ink)]">{title}</h3>
    </div>
    <div className="pl-11">
      {children}
    </div>
  </div>
);
`;

code = code.replace(/const briefSchema = [\s\S]*?type BriefFormData = z.infer<ReturnType<typeof briefSchema>>;/m, `${newSchema}\n\ntype BriefFormData = z.infer<ReturnType<typeof briefSchema>>;`);

// update default values and handlers
code = code.replace(/defaultValues: \{[\s\S]*?\}/, `defaultValues: {
      fullName: '',
      email: '',
      entity: '',
      phone: '',
      gameName: '',
      description: '',
      categories: [],
      ageGroups: [],
      languages: [],
      referenceUrl: '',
      domain: '',
      indicator: '',
      indicatorType: 'existing',
      tier: '',
      scope: '',
      deliveryDate: '',
      notes: ''
    }`);

code = code.replace(/onSubmit = \([\s\S]*?handleOpenOrder/m, `onSubmit = (data: BriefFormData) => {
    createProject.mutate({
      data: {
        name: data.gameName,
        domain: data.domain,
        ageGroup: deriveAgeGroup(data.ageGroups) as any,
        language: deriveLanguage(data.languages) as any,
        behaviours: deriveBehaviours(data.domain) as any,
        status: 'draft',
        config: {
          description: data.description,
          buildWeeks: 4,
          artWeeks: 4,
          productionNeeds: [],
          pieces: [],
          requestBrief: {
            fullName: data.fullName,
            email: data.email,
            entity: data.entity,
            phone: data.phone,
            categories: data.categories,
            ageGroups: data.ageGroups,
            languages: data.languages,
            referenceUrl: data.referenceUrl,
            indicator: data.indicator,
            indicatorType: data.indicatorType,
            tier: data.tier,
            scope: data.scope,
            deliveryDate: data.deliveryDate,
            notes: data.notes
          }
        }
      }
    }, {
      onSuccess: (project) => {
        navigate(\`/builder/\${project.id}\`);
      }
    });
  };

  const handleOpenOrder`);

code = code.replace(/handleOpenOrder = \([\s\S]*?setTimeout/m, `handleOpenOrder = (order: any) => {
    form.reset({
      fullName: '',
      email: '',
      entity: order.requestingBody || '',
      phone: '',
      gameName: order.title,
      description: order.description,
      categories: [],
      ageGroups: order.ageGroup === '13-17' ? ['13-15', '16-18'] : order.ageGroup === '9-12' ? ['10-12', '7-9'] : ['4-6', '7-9'],
      languages: order.language === 'both' ? ['ar', 'en'] : [order.language],
      referenceUrl: '',
      domain: ['literacy', 'activities', 'environment', 'developmental-skills', 'social-relations'].includes(order.domain) ? order.domain : 'developmental-skills',
      indicator: '',
      indicatorType: 'existing',
      tier: '1',
      scope: 'collection',
      deliveryDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
      notes: '',
    });
    
    // Slight delay to ensure DOM updates before scrolling
    setTimeout`);

fs.writeFileSync(path, code);
