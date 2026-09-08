import { useState } from 'react';
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
import { useListStudioProjects, useListStudioOrders, useCreateStudioProject, useDeleteStudioProject } from '@workspace/api-client-react';

const briefSchema = (locale: 'en' | 'ar') => z.object({
  name: z.string().min(1, t('home.form.valNameReq', locale)),
  domain: z.string().min(1, t('home.form.valDomainReq', locale)),
  description: z.string().min(20, t('home.form.valDescMin', locale)),
  ageGroup: z.enum(['6-8', '9-12', '13-17'], { errorMap: () => ({ message: t('home.form.valAgeReq', locale) }) }),
  language: z.enum(['both', 'ar', 'en'], { errorMap: () => ({ message: t('home.form.valLangReq', locale) }) }),
  behaviours: z.array(z.string()).min(1, t('home.form.valBehReq', locale)),
  buildWeeks: z.coerce.number().min(1).max(26),
  artWeeks: z.coerce.number().min(1).max(26),
  productionNeeds: z.array(z.string()).min(1, t('home.form.valProdReq', locale)),
});

type BriefFormData = z.infer<ReturnType<typeof briefSchema>>;

export default function LandingPage() {
  const { locale } = useStudioStore();
  const [, navigate] = useLocation();

  const { data: projects, refetch: refetchProjects } = useListStudioProjects();
  const { data: orders } = useListStudioOrders();
  const createProject = useCreateStudioProject();
  const deleteProject = useDeleteStudioProject();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema(locale)),
    defaultValues: {
      name: '',
      domain: '',
      description: '',
      ageGroup: '9-12',
      language: 'both',
      behaviours: [],
      buildWeeks: 4,
      artWeeks: 4,
      productionNeeds: [],
    }
  });

  const onSubmit = (data: BriefFormData) => {
    createProject.mutate({
      data: {
        name: data.name,
        domain: data.domain,
        ageGroup: data.ageGroup as any,
        language: data.language as any,
        behaviours: data.behaviours as any,
        status: 'draft',
        config: {
          description: data.description,
          buildWeeks: data.buildWeeks,
          artWeeks: data.artWeeks,
          productionNeeds: data.productionNeeds,
          pieces: []
        }
      }
    }, {
      onSuccess: (project) => {
        navigate(`/builder/${project.id}`);
      }
    });
  };

  const handleOpenOrder = (order: any) => {
    form.reset({
      name: order.title,
      domain: order.domain,
      description: order.description,
      ageGroup: order.ageGroup,
      language: order.language,
      behaviours: order.behaviours,
      buildWeeks: order.buildWeeks,
      artWeeks: order.artWeeks,
      productionNeeds: order.productionNeeds,
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
                const domainLabel = DOMAINS.find(d => d.id === order.domain)?.[locale === 'ar' ? 'labelAr' : 'label'] || order.domain;
                
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.gameName', locale)}</label>
                <input {...form.register('name')} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent" />
                {form.formState.errors.name && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.domain', locale)}</label>
                <select {...form.register('domain')} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent">
                  <option value="">{t('home.form.domainSelect', locale)}</option>
                  {DOMAINS.map(d => <option key={d.id} value={d.id}>{locale === 'ar' ? d.labelAr : d.label}</option>)}
                </select>
                {form.formState.errors.domain && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.domain.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.desc', locale)}</label>
                <textarea {...form.register('description')} rows={4} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent" placeholder={t('home.form.descHelper', locale) as string} />
                {form.formState.errors.description && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.ageGroup', locale)}</label>
                  <select {...form.register('ageGroup')} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent">
                    <option value="6-8">{t('home.form.ageOptions.6-8', locale)}</option>
                    <option value="9-12">{t('home.form.ageOptions.9-12', locale)}</option>
                    <option value="13-17">{t('home.form.ageOptions.13-17', locale)}</option>
                  </select>
                  {form.formState.errors.ageGroup && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.ageGroup.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.language', locale)}</label>
                  <select {...form.register('language')} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent">
                    <option value="both">{t('home.form.langOptions.both', locale)}</option>
                    <option value="ar">{t('home.form.langOptions.ar', locale)}</option>
                    <option value="en">{t('home.form.langOptions.en', locale)}</option>
                  </select>
                  {form.formState.errors.language && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.language.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">{t('home.form.behaviours', locale)}</label>
                <div className="flex flex-wrap gap-2">
                  {BEHAVIOURS.map(b => (
                    <label key={b.id} className="flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full cursor-pointer bg-[var(--paper)] hover:bg-[var(--line-soft)]">
                      <input type="checkbox" value={b.id} {...form.register('behaviours')} className="rounded text-[var(--blue)] focus:ring-[var(--blue)]" />
                      <span className="text-sm text-[var(--ink)]">{locale === 'ar' ? b.labelAr : b.label}</span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.behaviours && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.behaviours.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.buildWeeks', locale)}</label>
                  <input type="number" {...form.register('buildWeeks')} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent" min={1} max={26} />
                  {form.formState.errors.buildWeeks && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.buildWeeks.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">{t('home.form.artWeeks', locale)}</label>
                  <input type="number" {...form.register('artWeeks')} className="w-full rounded-md border border-[var(--line)] p-2 bg-transparent" min={1} max={26} />
                  {form.formState.errors.artWeeks && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.artWeeks.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">{t('home.form.productionNeeds', locale)}</label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTION_NEEDS.map(need => (
                    <label key={need.id} className="flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full cursor-pointer bg-[var(--paper)] hover:bg-[var(--line-soft)]">
                      <input type="checkbox" value={need.id} {...form.register('productionNeeds')} className="rounded text-[var(--blue)] focus:ring-[var(--blue)]" />
                      <span className="text-sm text-[var(--ink)]">{locale === 'ar' ? need.labelAr : need.label}</span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.productionNeeds && <p className="text-[var(--warn)] text-sm mt-1">{form.formState.errors.productionNeeds.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full bg-[var(--blue)] hover:bg-[var(--blue)]/90 text-white text-lg rounded-xl mt-4" disabled={createProject.isPending}>
                {t('home.form.submit', locale)}
              </Button>
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
                const domainLabel = DOMAINS.find(d => d.id === project.domain)?.[locale === 'ar' ? 'labelAr' : 'label'] || project.domain;
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
