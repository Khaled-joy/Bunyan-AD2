import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { StudioShell } from '@/components/studio/shell';
import { t } from '@/lib/i18n';
import { useStudioStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { DOMAINS, BEHAVIOURS, PRODUCTION_NEEDS } from '@/lib/constants';
import { Trash2 } from 'lucide-react';

import { NEW_CATEGORIES, NEW_DOMAINS, TIERS } from '@/lib/constants';
import { AlertTriangle, Send } from 'lucide-react';

import { useListStudioProjects, useListStudioOrders, useCreateStudioProject, useDeleteStudioProject } from '@workspace/api-client-react';


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
  if (ages.includes('16–18') || ages.includes('13–15')) return '13-17';
  if (ages.includes('10–12') || ages.includes('7–9')) return '9-12';
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
    <div className="ps-11">
      {children}
    </div>
  </div>
);


type BriefFormData = z.infer<ReturnType<typeof briefSchema>>;

export default function LandingPage() {
  const { locale } = useStudioStore();
  const [, navigate] = useLocation();
  const [draftMessage, setDraftMessage] = useState('');

  const { data: projects, refetch: refetchProjects } = useListStudioProjects();
  const { data: orders } = useListStudioOrders();
  const createProject = useCreateStudioProject();
  const deleteProject = useDeleteStudioProject();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema(locale)),
    defaultValues: {
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
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bunyan-studio-game-request-draft');
      if (saved) form.reset({ ...form.getValues(), ...JSON.parse(saved) });
    } catch {
      localStorage.removeItem('bunyan-studio-game-request-draft');
    }
  }, []);

  useEffect(() => {
    if (window.location.hash === '#brief-form') {
      const timer = window.setTimeout(() => {
        document.getElementById('brief-form')?.scrollIntoView({ block: 'start' });
      }, 250);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  const saveDraft = () => {
    localStorage.setItem('bunyan-studio-game-request-draft', JSON.stringify(form.getValues()));
    setDraftMessage(t('home.form.draftSaved', locale) as string);
  };

  const onSubmit = (data: BriefFormData) => {
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
            gameName: data.gameName,
            description: data.description,
            categories: data.categories,
            ageGroups: data.ageGroups,
            languages: data.languages,
            referenceUrl: data.referenceUrl,
            domain: data.domain,
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
        localStorage.removeItem('bunyan-studio-game-request-draft');
        navigate(`/builder/${project.id}`);
      }
    });
  };

  const handleOpenOrder = (order: any) => {
    form.reset({
      fullName: '',
      email: '',
      entity: order.requestingBody || '',
      phone: '',
      gameName: order.title,
      description: order.description,
      categories: [],
      ageGroups: order.ageGroup === '13-17' ? ['13–15', '16–18'] : order.ageGroup === '9-12' ? ['10–12', '7–9'] : ['4–6', '7–9'],
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
    setTimeout(() => {
      document.getElementById('brief-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <StudioShell>
      <div className="flex-1 overflow-y-auto bg-[var(--paper)]">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[var(--ink)] mb-4">
            {t('home.heroTitle', locale)}
          </h1>
          <p className="text-xl text-[var(--ink-soft)] max-w-2xl mx-auto mb-10">
            {t('home.heroDesc', locale)}
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="text-lg px-8 bg-[var(--blue)] hover:bg-[var(--blue)]/90 text-white rounded-full" onClick={() => document.getElementById('brief-form')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('home.createGame', locale)}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 rounded-full border-[var(--ink)] text-[var(--ink)] bg-transparent hover:bg-[var(--ink)]/5" onClick={() => document.getElementById('your-games')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('home.seeGames', locale)}
            </Button>
          </div>
        </section>

        {/* How a game gets built */}
        <section className="bg-[var(--surface)] py-20 border-y border-[var(--line)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-[var(--ink)] text-center mb-12">
              {t('home.howItWorks', locale)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(t('home.stages', locale) as any).map((stage: any, i: number) => (
                <div key={i} className="p-6 rounded-xl border border-[var(--line)] bg-[var(--paper)]/50 relative">
                  <div className="absolute top-0 right-0 p-4 text-[var(--ink-faint)] font-display font-bold text-4xl opacity-20">0{i+1}</div>
                  <h3 className="font-bold text-[var(--ink)] text-lg mb-2">{stage.title}</h3>
                  <p className="text-[var(--ink-soft)] text-sm">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Editable vs Sealed */}
        <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-8">
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-[var(--line)] shadow-sm">
            <h2 className="text-2xl font-display font-bold text-[var(--ink)] mb-4">{t('home.decideTitle', locale)}</h2>
            <p className="text-[var(--ink-soft)] mb-6">{t('home.decideDesc', locale)}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[var(--blue)]/10 text-[var(--blue)] rounded-full text-sm font-medium">{t('home.pieces.map', locale)}</span>
              <span className="px-3 py-1 bg-[var(--teal)]/10 text-[var(--teal)] rounded-full text-sm font-medium">{t('home.pieces.characters', locale)}</span>
              <span className="px-3 py-1 bg-[var(--amber)]/10 text-[var(--amber)] rounded-full text-sm font-medium">{t('home.pieces.objects', locale)}</span>
              <span className="px-3 py-1 bg-[var(--violet)]/10 text-[var(--violet)] rounded-full text-sm font-medium">{t('home.pieces.actions', locale)}</span>
            </div>
          </div>
          <div className="bg-[var(--locked)] p-8 rounded-xl shadow-sm text-[var(--paper)]">
            <h2 className="text-2xl font-display font-bold mb-4">{t('home.sealedTitle', locale)}</h2>
            <p className="text-[var(--ink-faint)] mb-6">{t('home.sealedDesc', locale)}</p>
            <div className="font-mono text-xs text-[var(--teal)] grid grid-cols-2 gap-2 opacity-80">
              <span>session.start</span><span>session.end</span>
              <span>movement.sample</span><span>object.pick</span>
              <span>object.drop</span><span>object.place</span>
              <span>object.use</span><span>prompt.presented</span>
              <span>decision.made</span><span>zone.enter</span>
              <span>zone.exit</span><span>npc.approach</span>
              <span>npc.interact</span><span>rule.violation</span>
              <span>self.correction</span><span>turn.wait</span>
              <span>turn.skip</span><span>hint.request</span>
              <span>task.complete</span><span>task.fail</span>
            </div>
          </div>
        </section>

        {/* Orders */}
        {orders && orders.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-20">
            <h2 className="text-2xl font-display font-bold text-[var(--ink)] mb-6">{t('home.incomingOrders', locale)}</h2>
            <div className="grid gap-4">
              {orders.map((order) => {
                const domainObj = NEW_DOMAINS.find(d => d.id === order.domain) || DOMAINS.find(d => d.id === order.domain); const domainLabel = domainObj?.[locale === 'ar' ? 'labelAr' : 'label'] || order.domain;
                
                return (
                  <div key={order.id} className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--line)] border-l-4 border-l-[var(--amber)] shadow-sm flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div>
                      <div className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-1">{order.requestingBody} • {t('home.due', locale)} {new Date(order.dueDate).toLocaleDateString()}</div>
                      <h3 className="text-xl font-bold text-[var(--ink)]">{order.title}</h3>
                      <div className="text-sm text-[var(--ink-soft)] mt-1">{domainLabel} • {order.ageGroup} • {order.behaviours.map(b => BEHAVIOURS.find(def => def.id === b)?.[locale === 'ar' ? 'labelAr' : 'label'] || b).join(', ')}</div>
                    </div>
                    <Button variant="outline" className="shrink-0" onClick={() => handleOpenOrder(order)}>
                      {t('home.openBrief', locale)}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Brief Form */}
        <section id="brief-form" className="bg-[var(--surface)] py-20 border-t border-[var(--line)]">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-[var(--ink)] mb-8">{t('home.startNewGame', locale)}</h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7">
              <RequestSection number={1} title={t('home.form.section1', locale) as string}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.fullName', locale) as string}
                    <input required {...form.register('fullName')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.fullName && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.fullName.message}</p>}
                  </label>
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.email', locale) as string}
                    <input required type="email" {...form.register('email')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.email && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.email.message}</p>}
                  </label>
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.entity', locale) as string}
                    <input required {...form.register('entity')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.entity && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.entity.message}</p>}
                  </label>
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.phone', locale) as string}
                    <input type="tel" {...form.register('phone')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>
                </div>
              </RequestSection>

              <RequestSection number={2} title={t('home.form.section2', locale) as string}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.gameName', locale) as string}
                    <input required maxLength={120} {...form.register('gameName')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.gameName && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.gameName.message}</p>}
                  </label>
                  
                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.desc', locale) as string}
                    <textarea required minLength={100} maxLength={2000} rows={6} {...form.register('description')} placeholder={t('home.form.descHelper', locale) as string} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    <span className="mt-1 block text-end text-xs font-semibold text-[var(--ink-soft)]">{form.watch('description')?.length || 0} / 2000</span>
                    {form.formState.errors.description && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.description.message}</p>}
                  </label>

                  <fieldset className="sm:col-span-2">
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.categoriesTitle', locale) as string}</legend>
                    <p className="mt-1 text-sm font-normal text-[var(--ink-soft)]">{t('home.form.categoriesHelper', locale) as string}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {NEW_CATEGORIES.map(cat => {
                        const isChecked = form.watch('categories')?.includes(cat.id);
                        return (
                          <label key={cat.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 font-semibold ${isChecked ? 'border-[var(--blue)] bg-[var(--blue)]/5 text-[var(--blue)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]'}`}>
                            <input type="checkbox" value={cat.id} {...form.register('categories')} className="mt-1" />
                            <span>
                              <span className="block">{locale === 'ar' ? cat.labelAr : cat.label}</span>
                              <span className="mt-1 block text-xs font-normal leading-relaxed text-[var(--ink-faint)]">
                                {locale === 'ar' ? cat.testAr : cat.test}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {form.formState.errors.categories && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.categories.message}</p>}
                  </fieldset>

                  <fieldset className="sm:col-span-2">
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.ageGroupTitle', locale) as string}</legend>
                    <p className="mt-1 text-sm font-normal text-[var(--ink-soft)]">{t('home.form.ageGroupHelper', locale) as string}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['4–6', '7–9', '10–12', '13–15', '16–18'].map(age => {
                        const isChecked = form.watch('ageGroups')?.includes(age);
                        return (
                          <label key={age} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${isChecked ? 'border-[var(--blue)] bg-[var(--blue)]/5 text-[var(--blue)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]'}`}>
                            <input type="checkbox" value={age} {...form.register('ageGroups')} className="sr-only" />
                            {age}
                          </label>
                        );
                      })}
                    </div>
                    {form.formState.errors.ageGroups && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.ageGroups.message}</p>}
                  </fieldset>

                  <fieldset>
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.languageTitle', locale) as string}</legend>
                    <div className="mt-3 flex gap-2">
                      {[{ id: 'ar', label: t('home.form.langAr', locale) as string }, { id: 'en', label: t('home.form.langEn', locale) as string }].map(lang => {
                        const isChecked = form.watch('languages')?.includes(lang.id);
                        return (
                          <label key={lang.id} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${isChecked ? 'border-[var(--teal)] bg-[var(--teal)]/10 text-[var(--teal)]' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]'}`}>
                            <input type="checkbox" value={lang.id} {...form.register('languages')} className="sr-only" />
                            {lang.label}
                          </label>
                        );
                      })}
                    </div>
                    {form.formState.errors.languages && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.languages.message}</p>}
                  </fieldset>

                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.refUrl', locale) as string}
                    <input type="url" {...form.register('referenceUrl')} placeholder="https://" className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>

                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.refFile', locale) as string}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.pptx,.mp4" className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent file:me-3 file:rounded-full file:border-0 file:bg-[var(--blue)]/10 file:px-3 file:py-2 file:font-bold file:text-[var(--blue)]" />
                    <span className="mt-2 block text-xs leading-relaxed text-[var(--ink-soft)]">{t('home.form.refFileHelper', locale) as string}</span>
                  </label>
                </div>
              </RequestSection>

              <RequestSection number={3} title={t('home.form.section3', locale) as string}>
                <div className="grid gap-5">
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.domain', locale) as string}
                    <select required {...form.register('domain')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-[var(--surface)]">
                      <option value="">{t('home.form.domainSelect', locale) as string}</option>
                      {NEW_DOMAINS.map(d => <option key={d.id} value={d.id}>{locale === 'ar' ? d.labelAr : d.label}</option>)}
                    </select>
                    {(() => {
                      const d = form.watch('domain');
                      const domainObj = NEW_DOMAINS.find(x => x.id === d);
                      if (!domainObj) return null;
                      return (
                        <span className="mt-2 block text-xs leading-relaxed text-[var(--ink-soft)]">
                          {locale === 'ar' ? domainObj.headlineAr : domainObj.headline}
                        </span>
                      );
                    })()}
                    {form.formState.errors.domain && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.domain.message}</p>}
                  </label>

                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.indicatorNeeded', locale) as string}
                    <textarea required minLength={50} rows={4} {...form.register('indicator')} placeholder={t('home.form.indicatorHelper', locale) as string} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                    {form.formState.errors.indicator && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.indicator.message}</p>}
                  </label>

                  <fieldset>
                    <legend className="font-bold text-[var(--ink)]">{t('home.form.indicatorTypeTitle', locale) as string}</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[{ id: 'existing', label: t('home.form.indExisting', locale) as string }, { id: 'new', label: t('home.form.indNew', locale) as string }].map(opt => (
                        <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 font-semibold text-[var(--ink-soft)]">
                          <input required type="radio" value={opt.id} {...form.register('indicatorType')} />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </RequestSection>

              <RequestSection number={4} title={t('home.form.section4', locale) as string}>
                <p className="mb-4 text-sm font-semibold text-[var(--ink-soft)]">{t('home.form.tierHelper', locale) as string}</p>
                <div className="grid gap-3 lg:grid-cols-3">
                  {TIERS.map(tier => {
                    const isChecked = form.watch('tier') === tier.id;
                    return (
                      <label key={tier.id} className={`cursor-pointer rounded-2xl border p-5 ${isChecked ? 'border-[var(--blue)] bg-[var(--blue)]/5 ring-4 ring-[var(--blue)]/10' : 'border-[var(--line)] bg-[var(--surface)]'}`}>
                        <input required type="radio" value={tier.id} {...form.register('tier')} />
                        <span className="ms-2 font-display text-lg font-bold text-[var(--ink)]">{locale === 'ar' ? tier.nameAr : tier.name}</span>
                        <span className="mt-3 block text-sm leading-relaxed text-[var(--ink-soft)]">{locale === 'ar' ? tier.sourcesAr : tier.sources}</span>
                        <span className="mt-3 block text-xs font-bold text-[var(--ink-faint)]">{locale === 'ar' ? tier.appropriateAr : tier.appropriate}</span>
                      </label>
                    );
                  })}
                </div>
                {form.formState.errors.tier && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.tier.message}</p>}

                {form.watch('tier') === '3' && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-[var(--amber)] bg-[var(--amber)]/10 p-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warn)]" />
                    {t('home.form.tier3Warn', locale) as string}
                  </div>
                )}
                {form.watch('domain') === 'social-relations' && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-[var(--coral)] bg-[var(--coral)]/10 p-4 text-sm leading-relaxed text-[var(--coral)]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    {t('home.form.tierSocWarn', locale) as string}
                  </div>
                )}
                {form.watch('tier') === '1' && form.watch('indicator') && /child|student|individual|طفل|طالب|فرد/i.test(form.watch('indicator')) && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-[var(--amber)] bg-[var(--amber)]/10 p-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warn)]" />
                    {t('home.form.tier1Warn', locale) as string}
                  </div>
                )}
              </RequestSection>

              <RequestSection number={5} title={t('home.form.section5', locale) as string}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: 'collection', label: t('home.form.scopeCollection', locale) as string, desc: t('home.form.scopeCollectionDesc', locale) as string },
                    { id: 'analysis', label: t('home.form.scopeAnalysis', locale) as string, desc: t('home.form.scopeAnalysisDesc', locale) as string }
                  ].map(scope => {
                    const isChecked = form.watch('scope') === scope.id;
                    return (
                      <label key={scope.id} className={`cursor-pointer rounded-2xl border p-5 ${isChecked ? 'border-[var(--teal)] bg-[var(--teal)]/10' : 'border-[var(--line)] bg-[var(--surface)]'}`}>
                        <input required type="radio" value={scope.id} {...form.register('scope')} />
                        <span className="ms-2 font-display text-lg font-bold text-[var(--ink)]">{scope.label}</span>
                        <span className="mt-3 block text-sm leading-relaxed text-[var(--ink-soft)]">{scope.desc}</span>
                      </label>
                    );
                  })}
                </div>
                {form.formState.errors.scope && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.scope.message}</p>}
              </RequestSection>

              <RequestSection number={6} title={t('home.form.section6', locale) as string}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="font-bold text-[var(--ink)]">
                    {t('home.form.deliveryDate', locale) as string}
                    <input type="date" {...form.register('deliveryDate')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>
                  <label className="font-bold text-[var(--ink)] sm:col-span-2">
                    {t('home.form.notes', locale) as string}
                    <textarea rows={4} {...form.register('notes')} className="w-full mt-1 rounded-md border border-[var(--line)] p-2 bg-transparent" />
                  </label>
                </div>
              </RequestSection>

              <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-end">
                {draftMessage && <p role="status" className="me-auto text-sm font-semibold text-[var(--ok)]">{draftMessage}</p>}
                <Button type="button" variant="outline" className="gap-2 rounded-full font-bold" onClick={saveDraft}>
                  {t('home.form.saveDraft', locale) as string}
                </Button>
                <Button type="submit" className="gap-2 rounded-full bg-[var(--blue)] font-bold text-white shadow-sm transition hover:-translate-y-0.5" disabled={createProject.isPending}>
                  <Send className="h-4 w-4" />
                  {t('home.form.submit', locale) as string}
                </Button>
              </div>
            </form>

          </div>
        </section>

        {/* Saved Games */}
        <section id="your-games" className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-display font-bold text-[var(--ink)] mb-6">{t('home.yourGames', locale)}</h2>
          {!projects || projects.length === 0 ? (
            <p className="text-[var(--ink-faint)]">{t('home.noGames', locale)}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const config = project.config as any;
                const piecesCount = Array.isArray(config.pieces) ? config.pieces.length : 0;
                const domainObj = NEW_DOMAINS.find(d => d.id === project.domain) || DOMAINS.find(d => d.id === project.domain); const domainLabel = domainObj?.[locale === 'ar' ? 'labelAr' : 'label'] || project.domain;
                const statusStr = project.status === 'draft' ? t('home.statusDraft', locale) : 
                                  project.status === 'building' ? t('home.statusBuilding', locale) : 
                                  t('home.statusReview', locale);
                
                return (
                  <Link key={project.id} href={`/builder/${project.id}`}>
                    <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--line)] shadow-sm hover:border-[var(--ink-soft)] transition-colors cursor-pointer flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <div className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--paper)] text-[var(--ink-soft)]">{domainLabel}</div>
                          <div className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--blue)]/10 text-[var(--blue)]">{statusStr}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm(t('home.confirmDelete', locale))) {
                              deleteProject.mutate({ id: project.id }, { onSuccess: () => refetchProjects() });
                            }
                          }}
                          className="p-1 text-[var(--ink-faint)] hover:text-[var(--warn)] rounded hover:bg-[var(--warn)]/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--ink)] mb-1 leading-tight">{project.name}</h3>
                      <div className="text-sm text-[var(--ink-soft)] mb-4">{project.ageGroup} • {piecesCount} {t('home.piecesCount', locale)}</div>
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.behaviours.map((b: string) => (
                            <span key={b} className="text-[10px] px-1.5 py-0.5 border border-[var(--line)] rounded bg-[var(--paper)]/50 text-[var(--ink-soft)]">
                              {BEHAVIOURS.find(def => def.id === b)?.[locale === 'ar' ? 'labelAr' : 'label'] || b}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-[var(--ink-faint)]">
                          {t('home.created', locale)}: {new Date(project.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-US')}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </StudioShell>
  );
}
