import { useState } from 'react';
import { useCreateCohort, useProbeCohort, useCreatePlan, useExecutePlan, useGetExecution } from './workbench-hooks';
import { ArrowLeft, ArrowRight, Check, AlertCircle, BarChart3, Database, FileText, Settings, ShieldAlert, Loader2, Play } from 'lucide-react';
import { Link } from 'wouter';
import { t, type Lang } from './App';

type Step = 'define' | 'probe' | 'plan' | 'execute' | 'results';

export default function Workbench({ lang }: { lang: Lang }) {
  const [step, setStep] = useState<Step>('define');
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<{ n_players: number; suppressed: boolean; notice?: string } | null>(null);
  const [plan, setPlan] = useState<{ plan_id: string; method: string; design: string; power_estimate: { detectable_d: number }; assumptions_to_check: string[]; caveats: string[] } | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const createCohort = useCreateCohort();
  const probeCohort = useProbeCohort();
  const createPlan = useCreatePlan();
  const executePlan = useExecutePlan();
  const executionQuery = useGetExecution(executionId);

  // Form State
  const [label, setLabel] = useState('My Cohort');
  const [ageBands, setAgeBands] = useState<string[]>(['cycle1', 'cycle2']);
  const [language, setLanguage] = useState<'en' | 'ar' | 'both'>('both');
  const [deviceClass, setDeviceClass] = useState<'desktop' | 'mobile' | 'all'>('all');
  const [dateStart, setDateStart] = useState('2026-01-01');
  const [dateEnd, setDateEnd] = useState('2026-12-31');
  const [gameIds, setGameIds] = useState<string[]>(['eco-future', 'basket-challenge']);
  const [minConfidence, setMinConfidence] = useState(0.8);

  const handleDefine = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('probe');
    try {
      const cohort = await createCohort.mutateAsync({
        label,
        filters: {
          player: { age_band: ageBands, is_guest: false },
          session: {
            game_id: gameIds,
            session_lang: language === 'both' ? ['ar', 'en'] : [language],
            ...(deviceClass === 'all' ? {} : { device_class: [deviceClass] }),
            date_from: dateStart,
            date_to: dateEnd,
          },
          derived: { confidence: { gte: minConfidence }, provisional: false },
        },
      });
      setCohortId(cohort.cohort_id);
      const probe = await probeCohort.mutateAsync(cohort.cohort_id);
      setProbeResult(probe);
    } catch (err) {
      console.error(err);
      setStep('define');
    }
  };

  const handleRequestPlan = async () => {
    if (!cohortId) return;
    setStep('plan');
    try {
      const p = await createPlan.mutateAsync({ cohortId, question: 'How does response time vary across age bands in this cohort?' });
      setPlan(p);
    } catch (err) {
      console.error(err);
      setStep('probe');
    }
  };

  const handleExecute = async () => {
    if (!cohortId || !plan) return;
    setStep('execute');
    try {
      const exec = await executePlan.mutateAsync({ planId: plan.plan_id });
      setExecutionId(exec.execution_id);
      setExecutionResult(exec);
      setStep('results');
    } catch (err) {
      console.error(err);
      setStep('plan');
    }
  };

  const isExecutionFailed = executePlan.isError;
  const allAgeBands = ['cycle1', 'cycle2', 'cycle3'];
  const allGames = ['eco-future', 'basket-challenge', 'heritage', 'color-focus', 'library-sort', 'word-journey', 'healthy-restaurant', 'innovation-lab', 'numeracy-check', 'bot-workshop', 'truth-lab', 'common-ground', 'spark-studio'];

  const toggleArray = (arr: string[], val: string) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12 min-h-[calc(100vh-80px)] text-[#174b44]">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]">
          <ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to admin dashboard', ar: 'العودة إلى لوحة المشرف' }, lang)}
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fcf8f0] border border-[#dfd2bd] px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-[#174b44]">
          <BarChart3 className="h-4 w-4 text-[#2140a8]" /> {t({ en: 'Analysis Workbench', ar: 'منصة التحليل' }, lang)}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left Column: Progress / Status */}
        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft">
            <h2 className="font-display text-2xl font-bold text-[#174b44] mb-6">{t({ en: 'Analysis Pipeline', ar: 'مسار التحليل' }, lang)}</h2>
            
            <div className="space-y-6 relative before:absolute before:inset-y-3 before:start-4 before:w-px before:bg-[#dfd2bd]">
              {[
                { s: 'define', icon: Settings, label: { en: 'Define Cohort', ar: 'تحديد المجموعة' } },
                { s: 'probe', icon: Database, label: { en: 'Data Integrity', ar: 'سلامة البيانات' } },
                { s: 'plan', icon: FileText, label: { en: 'Analysis Plan', ar: 'خطة التحليل' } },
                { s: 'execute', icon: Play, label: { en: 'Execution', ar: 'التنفيذ' } },
                { s: 'results', icon: Check, label: { en: 'Results', ar: 'النتائج' } },
              ].map((item, idx) => {
                const isActive = step === item.s;
                const isPast = ['define', 'probe', 'plan', 'execute', 'results'].indexOf(step) > idx;
                
                return (
                  <div key={item.s} className="relative flex items-center gap-4">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${isActive ? 'border-[#2140a8] bg-[#eef2fc] text-[#2140a8]' : isPast ? 'border-[#33705f] bg-[#e6f1eb] text-[#33705f]' : 'border-[#dfd2bd] bg-[#fcf8f0] text-[#a9b8b0]'}`}>
                      {isPast ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-[#2140a8]' : isPast ? 'text-[#33705f]' : 'text-[#a9b8b0]'}`}>
                      {t(item.label, lang)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active View */}
        <div className="rounded-[28px] border border-[#d6e2e9] bg-white p-6 shadow-float sm:p-10">
          
          {step === 'define' && (
            <form onSubmit={handleDefine}>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold">{t({ en: 'Define Analysis Cohort', ar: 'تحديد مجموعة التحليل' }, lang)}</h2>
                <p className="mt-2 text-[#557068]">{t({ en: 'Select the parameters for the learners you wish to analyze.', ar: 'حدد المعايير للمتعلمين الذين ترغب في تحليلهم.' }, lang)}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold">{t({ en: 'Cohort Label', ar: 'اسم المجموعة' }, lang)}</label>
                  <input type="text" value={label} onChange={e => setLabel(e.target.value)} required className="w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-3 font-semibold outline-none focus:border-[#2140a8]" />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold">{t({ en: 'Date Range', ar: 'نطاق التاريخ' }, lang)}</label>
                    <div className="flex gap-2">
                      <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} required className="w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-3 font-semibold outline-none focus:border-[#2140a8]" />
                      <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} required className="w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-3 font-semibold outline-none focus:border-[#2140a8]" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">{t({ en: 'Minimum Confidence', ar: 'الحد الأدنى للثقة' }, lang)}</label>
                    <input type="number" step="0.1" min="0" max="1" value={minConfidence} onChange={e => setMinConfidence(Number(e.target.value))} required className="w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-3 font-semibold outline-none focus:border-[#2140a8]" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold">{t({ en: 'Age Bands', ar: 'الفئات العمرية' }, lang)}</label>
                    <div className="flex flex-wrap gap-2">
                      {allAgeBands.map(band => (
                        <button type="button" key={band} onClick={() => setAgeBands(toggleArray(ageBands, band))} className={`rounded-xl border px-3 py-2 text-sm font-bold ${ageBands.includes(band) ? 'border-[#2140a8] bg-[#eef2fc] text-[#2140a8]' : 'border-[#c8d2c7] bg-[#fcf8f0] text-[#557068]'}`}>{band}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">{t({ en: 'Language & Device', ar: 'اللغة والجهاز' }, lang)}</label>
                    <div className="flex gap-4">
                      <select value={language} onChange={e => setLanguage(e.target.value as any)} className="w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-3 font-semibold outline-none focus:border-[#2140a8]">
                        <option value="both">Both</option>
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                      </select>
                      <select value={deviceClass} onChange={e => setDeviceClass(e.target.value as any)} className="w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-3 font-semibold outline-none focus:border-[#2140a8]">
                        <option value="all">All Devices</option>
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">{t({ en: 'Game Worlds', ar: 'عوالم الألعاب' }, lang)}</label>
                  <div className="flex flex-wrap gap-2">
                    {allGames.map(gameId => (
                      <button type="button" key={gameId} onClick={() => setGameIds(toggleArray(gameIds, gameId))} className={`rounded-xl border px-3 py-2 text-xs font-bold ${gameIds.includes(gameId) ? 'border-[#33705f] bg-[#e6f1eb] text-[#174b44]' : 'border-[#c8d2c7] bg-[#fcf8f0] text-[#557068]'}`}>{gameId}</button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#dfd2bd]">
                  <button type="submit" disabled={createCohort.isPending} className="inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-6 py-3 font-bold text-white shadow-[0_4px_0_#152c79] hover:translate-y-px hover:shadow-[0_3px_0_#152c79] active:translate-y-1 active:shadow-none disabled:opacity-50">
                    {createCohort.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t({ en: 'Define Cohort', ar: 'تحديد المجموعة' }, lang)}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'probe' && (
            <div>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold">{t({ en: 'Data Integrity Check', ar: 'فحص سلامة البيانات' }, lang)}</h2>
                <p className="mt-2 text-[#557068]">{t({ en: 'Verifying cohort size and privacy thresholds.', ar: 'جارٍ التحقق من حجم المجموعة وحدود الخصوصية.' }, lang)}</p>
              </div>

              {!probeResult && probeCohort.isPending && (
                <div className="flex flex-col items-center justify-center py-12 text-[#2140a8]">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="mt-4 font-bold">{t({ en: 'Probing cohort...', ar: 'جارٍ فحص المجموعة...' }, lang)}</p>
                </div>
              )}

              {probeResult && (
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 text-center">
                    <span className="block text-sm font-bold uppercase tracking-[.15em] text-[#a9b8b0] mb-2">{t({ en: 'Learners Found', ar: 'المتعلمون الذين تم العثور عليهم' }, lang)}</span>
                    <span className="font-display text-5xl font-bold text-[#174b44]">{probeResult.n_players}</span>
                  </div>

                  {probeResult.suppressed ? (
                    <div className="rounded-[24px] bg-[#fff0eb] border border-[#e8755f] p-6 flex gap-4">
                      <ShieldAlert className="h-6 w-6 text-[#d8232a] shrink-0" />
                      <div>
                        <h3 className="font-bold text-[#d8232a] text-lg">{t({ en: 'Privacy Suppression Applied', ar: 'تم تطبيق كتم الخصوصية' }, lang)}</h3>
                        <p className="mt-2 text-[#a94d40]">{probeResult.notice ?? t({ en: 'The cohort size is under the required threshold (n<10). To protect learner privacy, analysis cannot proceed. Please broaden your date range or demographic filters.', ar: 'حجم المجموعة أقل من الحد المطلوب. لحماية خصوصية المتعلم، لا يمكن متابعة التحليل. يرجى توسيع نطاق التاريخ أو عوامل التصفية الديموغرافية.' }, lang)}</p>
                        <button onClick={() => setStep('define')} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-[#d8232a] px-4 py-2 text-sm font-bold text-[#d8232a] hover:bg-[#fff0eb]">
                          <ArrowLeft className="h-4 w-4" /> {t({ en: 'Revise Cohort', ar: 'مراجعة المجموعة' }, lang)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="rounded-[24px] bg-[#e6f1eb] border border-[#33705f] p-6 flex gap-4">
                        <Check className="h-6 w-6 text-[#33705f] shrink-0" />
                        <div>
                          <h3 className="font-bold text-[#174b44] text-lg">{t({ en: 'Threshold Met', ar: 'تم استيفاء الحد' }, lang)}</h3>
                          <p className="mt-2 text-[#557068]">{t({ en: 'This cohort has sufficient data to produce reliable insights while preserving anonymity.', ar: 'تحتوي هذه المجموعة على بيانات كافية لإنتاج رؤى موثوقة مع الحفاظ على إخفاء الهوية.' }, lang)}</p>
                        </div>
                      </div>
                      <div className="mt-8 pt-4 border-t border-[#dfd2bd] flex justify-end gap-3">
                        <button onClick={() => setStep('define')} className="inline-flex items-center gap-2 rounded-full border border-[#c8d2c7] bg-white px-5 py-3 font-bold text-[#557068] hover:bg-[#fcf8f0]">
                          {t({ en: 'Revise', ar: 'مراجعة' }, lang)}
                        </button>
                        <button onClick={handleRequestPlan} disabled={createPlan.isPending} className="inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-6 py-3 font-bold text-white shadow-[0_4px_0_#152c79] hover:translate-y-px hover:shadow-[0_3px_0_#152c79] active:translate-y-1 active:shadow-none disabled:opacity-50">
                          {createPlan.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t({ en: 'Request Analysis Plan', ar: 'طلب خطة التحليل' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'plan' && plan && (
            <div>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold">{t({ en: 'Analysis Plan', ar: 'خطة التحليل' }, lang)}</h2>
                <p className="mt-2 text-[#557068]">{t({ en: 'Review the proposed methodology before executing the analysis.', ar: 'راجع المنهجية المقترحة قبل تنفيذ التحليل.' }, lang)}</p>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[20px] bg-[#fcf8f0] border border-[#dfd2bd] p-5">
                  <span className="block text-xs font-bold uppercase tracking-[.1em] text-[#a9b8b0] mb-2">{t({ en: 'Method', ar: 'المنهجية' }, lang)}</span>
                  <p className="font-bold text-lg">{plan.method}</p>
                </div>
                <div className="rounded-[20px] bg-[#fcf8f0] border border-[#dfd2bd] p-5">
                  <span className="block text-xs font-bold uppercase tracking-[.1em] text-[#a9b8b0] mb-2">{t({ en: 'Design', ar: 'التصميم' }, lang)}</span>
                  <p className="font-bold text-lg">{plan.design}</p>
                </div>
                <div className="rounded-[20px] bg-[#fcf8f0] border border-[#dfd2bd] p-5">
                  <span className="block text-xs font-bold uppercase tracking-[.1em] text-[#a9b8b0] mb-2">{t({ en: 'Target Effect Size', ar: 'حجم التأثير المستهدف' }, lang)}</span>
                  <p className="font-bold text-lg">d = {plan.power_estimate.detectable_d}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[20px] border border-[#dfd2bd] p-5">
                  <h4 className="font-bold text-[#174b44] mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-[#e8755f]" /> {t({ en: 'Assumptions', ar: 'الافتراضات' }, lang)}</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[#557068] marker:text-[#e8755f]">
                    {plan.assumptions_to_check.map((ass, i) => <li key={i}>{ass}</li>)}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-[#dfd2bd] p-5">
                  <h4 className="font-bold text-[#174b44] mb-3 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-[#d8232a]" /> {t({ en: 'Caveats', ar: 'المحاذير' }, lang)}</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[#557068] marker:text-[#d8232a]">
                    {plan.caveats.map((cav, i) => <li key={i}>{cav}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#dfd2bd] flex justify-end gap-3">
                <button onClick={() => setStep('probe')} className="inline-flex items-center gap-2 rounded-full border border-[#c8d2c7] bg-white px-5 py-3 font-bold text-[#557068] hover:bg-[#fcf8f0]">
                  {t({ en: 'Back', ar: 'عودة' }, lang)}
                </button>
                <button onClick={handleExecute} disabled={executePlan.isPending} className="inline-flex items-center gap-2 rounded-full bg-[#16a7bc] px-6 py-3 font-bold text-[#fff4df] shadow-[0_4px_0_#0b6a79] hover:translate-y-px hover:shadow-[0_3px_0_#0b6a79] active:translate-y-1 active:shadow-none disabled:opacity-50">
                  {executePlan.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t({ en: 'Approve & Execute Plan', ar: 'الموافقة وتنفيذ الخطة' }, lang)}
                </button>
              </div>
            </div>
          )}

          {step === 'execute' && (
            <div className="flex flex-col items-center justify-center py-20 text-[#16a7bc]">
              <Loader2 className="h-12 w-12 animate-spin" />
              <h3 className="mt-6 font-display text-2xl font-bold text-[#174b44]">{t({ en: 'Running Analysis', ar: 'جارٍ تشغيل التحليل' }, lang)}</h3>
              <p className="mt-2 text-[#557068]">{t({ en: 'Processing telemetry against the approved plan.', ar: 'جارٍ معالجة البيانات وفقاً للخطة المعتمدة.' }, lang)}</p>
              {isExecutionFailed && (
                <div className="mt-6 text-[#d8232a] font-bold bg-[#fff0eb] p-4 rounded-xl">
                  {t({ en: 'Execution failed. Please try again.', ar: 'فشل التنفيذ. يرجى المحاولة مرة أخرى.' }, lang)}
                </div>
              )}
            </div>
          )}

          {step === 'results' && (executionResult ?? executionQuery.data) && (() => {
            const result = executionResult ?? executionQuery.data;
            return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#33705f] mb-3">
                    <Check className="h-3.5 w-3.5" /> {t({ en: 'Analysis Complete', ar: 'اكتمل التحليل' }, lang)}
                  </div>
                  <h2 className="font-display text-4xl font-bold">{t({ en: 'Execution Results', ar: 'نتائج التنفيذ' }, lang)}</h2>
                </div>
                <button onClick={() => {
                  setStep('define');
                  setCohortId(null);
                  setPlan(null);
                  setExecutionId(null);
                }} className="inline-flex items-center gap-2 text-sm font-bold text-[#2140a8] hover:text-[#152c79]">
                  {t({ en: 'Start New Analysis', ar: 'بدء تحليل جديد' }, lang)}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-[20px] bg-[#fefce8] border border-[#f2c95c] p-5">
                    <span className="block text-xs font-bold uppercase tracking-[.1em] text-[#8a7231] mb-2">{t({ en: 'Estimates', ar: 'التقديرات' }, lang)}</span>
                    <pre className="font-mono text-sm text-[#174b44] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result.estimates, null, 2)}</pre>
                  </div>
                  <div className="rounded-[20px] bg-[#eef2fc] border border-[#2140a8] p-5">
                    <span className="block text-xs font-bold uppercase tracking-[.1em] text-[#3b519e] mb-2">{t({ en: 'Effect Sizes', ar: 'أحجام التأثير' }, lang)}</span>
                    <pre className="font-mono text-sm text-[#174b44] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result.effect_sizes, null, 2)}</pre>
                  </div>
                  <div className="rounded-[20px] bg-[#e6f1eb] border border-[#33705f] p-5">
                    <span className="block text-xs font-bold uppercase tracking-[.1em] text-[#2c5f51] mb-2">{t({ en: 'Adjusted P-Values', ar: 'قيم P المعدلة' }, lang)}</span>
                    <pre className="font-mono text-sm text-[#174b44] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result.p_values_adjusted, null, 2)}</pre>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6">
                  <h3 className="font-bold text-[#174b44] mb-4 text-lg">{t({ en: 'Visualizations', ar: 'المرئيات' }, lang)}</h3>
                  <div className="bg-white rounded-xl border border-[#c8d2c7] h-64 flex items-center justify-center p-4">
                      {result.plots ? (
                        <div className="w-full h-full text-xs font-mono text-[#557068] overflow-auto whitespace-pre-wrap bg-[#fcf8f0] p-4 rounded-lg">
                           {JSON.stringify(result.plots, null, 2)}
                        </div>
                     ) : (
                        <p className="text-[#a9b8b0] font-bold">{t({ en: 'No plot payload returned', ar: 'لم يتم إرجاع بيانات للرسم' }, lang)}</p>
                     )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="rounded-[20px] border border-[#dfd2bd] p-5">
                    <h4 className="font-bold text-[#174b44] mb-3">{t({ en: 'Assumption Checks', ar: 'فحوصات الافتراضات' }, lang)}</h4>
                     <pre className="font-mono text-xs text-[#557068] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result.assumption_checks, null, 2)}</pre>
                  </div>
                  <div className="rounded-[20px] border border-[#e8755f] bg-[#fff0eb] p-5">
                    <h4 className="font-bold text-[#d8232a] mb-3">{t({ en: 'Limitations', ar: 'القيود' }, lang)}</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-[#a94d40] marker:text-[#e8755f]">
                       {[...(result.warnings ?? []), 'Observational gameplay data cannot establish causation.'].map((lim: string, i: number) => <li key={i}>{lim}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
