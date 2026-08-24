import { useMemo, useRef, useState } from 'react';
import { useApprovePlan, useComparison, useCreateCohort, useGameCoverage, useProbeCohort, useCreatePlan, useExecutePlan, useGetExecution } from './workbench-hooks';
import { ArrowLeft, ArrowRight, Check, AlertCircle, BarChart3, Database, Download, FileText, Settings, ShieldAlert, Loader2, Play, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { t, type Lang } from './App';
import * as XLSX from 'xlsx';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Step = 'define' | 'probe' | 'plan' | 'execute' | 'results';

type CoverageRow = { game_id: string; players: number | null; suppressed: boolean };
type ComparisonRow = { group: string; series: string; value: number | null; suppressed: boolean };
type ImportedRow = Record<string, string | number | boolean | null>;

const EXPORT_ALLOWED_FIELDS = new Set(['game_id', 'players', 'suppressed', 'group', 'series', 'value', 'metric', 'group_by', 'compare_by']);
const FORBIDDEN_IMPORT_FIELDS = /(^|_)(player|session|child|learner)(_|$)|^(name|email|phone|address|birth|diagnos|gender|nationality|token)$/i;
const SAFE_GAME_IDS = new Set(['eco-future', 'basket-challenge', 'heritage', 'color-focus', 'library-sort', 'word-journey', 'healthy-restaurant', 'innovation-lab', 'numeracy-check', 'bot-workshop', 'truth-lab', 'common-ground', 'spark-studio', 'other']);
const SAFE_DIMENSION_VALUES: Record<string, Set<string>> = {
  age_band: new Set(['cycle1', 'cycle2', 'cycle3', 'unknown']),
  game_id: SAFE_GAME_IDS,
  lang: new Set(['ar', 'en', 'unknown']),
  device_class: new Set(['desktop', 'mobile', 'tablet', 'unknown']),
};

const dimensionOptions = [
  { value: 'age_band', label: { en: 'Age band', ar: 'الفئة العمرية' } },
  { value: 'game_id', label: { en: 'Game', ar: 'اللعبة' } },
  { value: 'lang', label: { en: 'Language', ar: 'اللغة' } },
  { value: 'device_class', label: { en: 'Device', ar: 'الجهاز' } },
];
const metricOptions = [
  { value: 'rt_median', label: { en: 'Response time median', ar: 'وسيط زمن الاستجابة' } },
  { value: 'accuracy', label: { en: 'Accuracy', ar: 'الدقة' } },
  { value: 'persistence_index', label: { en: 'Persistence index', ar: 'مؤشر المثابرة' } },
  { value: 'self_correction_rate', label: { en: 'Self-correction rate', ar: 'معدل التصحيح الذاتي' } },
  { value: 'exploration_breadth', label: { en: 'Exploration breadth', ar: 'اتساع الاستكشاف' } },
  { value: 'challenge_seeking', label: { en: 'Challenge seeking', ar: 'السعي للتحدي' } },
];

function toCsv(rows: ImportedRow[]) {
  return XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(spreadsheetSafeRows(rows)));
}

function spreadsheetSafeRows(rows: ImportedRow[]) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key,
    typeof value === 'string' && /^[=+\-@]/.test(value) ? `'${value}` : value,
  ])));
}

function downloadFile(content: BlobPart, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function allowedValueForDimension(value: unknown, dimension: unknown) {
  return typeof value === 'string' && typeof dimension === 'string' && SAFE_DIMENSION_VALUES[dimension]?.has(value);
}

function isSafeAggregateRow(row: unknown): row is ImportedRow {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
  const record = row as Record<string, unknown>;
  const fields = Object.keys(record);
  if (!fields.length || fields.some((field) => !EXPORT_ALLOWED_FIELDS.has(field) || FORBIDDEN_IMPORT_FIELDS.test(field))) return false;
  if (fields.some((field) => typeof record[field] === 'object' && record[field] !== null)) return false;
  if (record.suppressed !== undefined && record.suppressed !== false) return false;
  if ('game_id' in record) {
    return fields.every((field) => ['game_id', 'players', 'suppressed'].includes(field))
      && SAFE_GAME_IDS.has(String(record.game_id))
      && typeof record.players === 'number'
      && Number.isInteger(record.players)
      && record.players >= 10;
  }
  const groupBy = record.group_by;
  const compareBy = record.compare_by;
  return fields.every((field) => ['group', 'series', 'value', 'metric', 'group_by', 'compare_by', 'suppressed'].includes(field))
    && typeof record.value === 'number'
    && Number.isFinite(record.value)
    && record.value >= 0
    && typeof record.metric === 'string'
    && metricOptions.some((option) => option.value === record.metric)
    && dimensionOptions.some((option) => option.value === groupBy)
    && dimensionOptions.some((option) => option.value === compareBy)
    && allowedValueForDimension(record.group, groupBy)
    && allowedValueForDimension(record.series, compareBy);
}

function flattenImportPayload(value: unknown) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const payload = value as Record<string, unknown>;
  const keys = Object.keys(payload);
  if (!keys.length || keys.some((key) => !['game_coverage', 'comparison'].includes(key) || !Array.isArray(payload[key]))) return null;
  return keys.flatMap((key) => payload[key] as unknown[]);
}

function readImportedRows(file: File): Promise<ImportedRow[]> {
  return new Promise((resolve, reject) => {
    const finish = (payload: unknown) => {
      const flattened = flattenImportPayload(payload);
      if (!flattened || flattened.length === 0 || flattened.length > 5000) {
        reject(new Error('Import must contain between 1 and 5,000 aggregate rows.'));
        return;
      }
      for (const entry of flattened) {
        if (!isSafeAggregateRow(entry)) {
          reject(new Error('Import rejected: rows must use the privacy-safe Bunayn aggregate schema, with valid dimensions and a minimum count of 10.'));
          return;
        }
      }
      resolve(flattened as ImportedRow[]);
    };
    if (file.name.toLowerCase().endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          finish(parsed);
        } catch {
          reject(new Error('The JSON file could not be read.'));
        }
      };
      reader.onerror = () => reject(new Error('The selected file could not be read.'));
      reader.readAsText(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]!];
        finish(XLSX.utils.sheet_to_json(firstSheet, { defval: null }));
      } catch {
        reject(new Error('The CSV or XLSX file could not be read.'));
      }
    };
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsArrayBuffer(file);
  });
}

export default function Workbench({ lang }: { lang: Lang }) {
  const [step, setStep] = useState<Step>('define');
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<{ n_players: number; suppressed: boolean; notice?: string } | null>(null);
  const [plan, setPlan] = useState<{ plan_id: string; method: string; design: string; power_estimate: { detectable_d: number }; assumptions_to_check: string[]; caveats: string[] } | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const [importedRows, setImportedRows] = useState<ImportedRow[]>([]);
  const [comparisonGroup, setComparisonGroup] = useState('age_band');
  const [comparisonSeries, setComparisonSeries] = useState('game_id');
  const [comparisonMetric, setComparisonMetric] = useState('rt_median');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createCohort = useCreateCohort();
  const probeCohort = useProbeCohort();
  const createPlan = useCreatePlan();
  const approvePlan = useApprovePlan();
  const executePlan = useExecutePlan();
  const executionQuery = useGetExecution(executionId);
  const coverageQuery = useGameCoverage(cohortId, Boolean(probeResult && !probeResult.suppressed));
  const comparisonQuery = useComparison(cohortId, { groupBy: comparisonGroup, compareBy: comparisonSeries, metric: comparisonMetric }, Boolean(probeResult && !probeResult.suppressed));

  const coverageRows = (coverageQuery.data?.rows ?? []) as CoverageRow[];
  const comparisonRows = (comparisonQuery.data?.rows ?? []) as ComparisonRow[];
  const comparisonChartRows = useMemo(() => {
    const byGroup = new Map<string, Record<string, string | number>>();
    for (const row of comparisonRows) {
      if (row.suppressed || row.value === null) continue;
      const current = byGroup.get(row.group) ?? { group: row.group };
      current[row.series] = row.value;
      byGroup.set(row.group, current);
    }
    return [...byGroup.values()];
  }, [comparisonRows]);
  const comparisonSeriesNames = useMemo(() => [...new Set(comparisonRows.filter((row) => !row.suppressed).map((row) => row.series))], [comparisonRows]);

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
    setErrorMessage(null);
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
      setErrorMessage(err instanceof Error ? err.message : 'The cohort could not be created.');
      setStep('define');
    }
  };

  const handleRequestPlan = async () => {
    if (!cohortId) return;
    setErrorMessage(null);
    setStep('plan');
    try {
      const p = await createPlan.mutateAsync({ cohortId, question: 'How does response time vary across age bands in this cohort?' });
      setPlan(p);
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'The analysis plan could not be created.');
      setStep('probe');
    }
  };

  const handleExecute = async () => {
    if (!cohortId || !plan) return;
    setErrorMessage(null);
    setStep('execute');
    try {
      await approvePlan.mutateAsync(plan.plan_id);
      const exec = await executePlan.mutateAsync(plan.plan_id);
      setExecutionId(exec.execution_id);
      setExecutionResult(exec);
      setStep('results');
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'The analysis could not be executed.');
      setStep('plan');
    }
  };

  const aggregateExport = useMemo(() => ({
    game_coverage: coverageRows.filter((row) => !row.suppressed),
    comparison: comparisonRows.filter((row) => !row.suppressed).map((row) => ({ ...row, metric: comparisonMetric, group_by: comparisonGroup, compare_by: comparisonSeries })),
  }), [comparisonGroup, comparisonMetric, comparisonRows, comparisonSeries, coverageRows]);

  const handleExport = (format: 'json' | 'csv' | 'xlsx') => {
    const safeComparisonRows = comparisonRows.filter((row) => !row.suppressed).map((row) => ({ ...row, metric: comparisonMetric, group_by: comparisonGroup, compare_by: comparisonSeries }));
    const safeCoverageRows = coverageRows.filter((row) => !row.suppressed);
    const rows = safeComparisonRows.length
      ? safeComparisonRows
      : safeCoverageRows;
    if (!rows.length) {
      setFileStatus(t({ en: 'Run a cohort probe before exporting aggregate data.', ar: 'نفّذ فحص المجموعة قبل تصدير البيانات المجمعة.' }, lang));
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'json') downloadFile(JSON.stringify(aggregateExport, null, 2), `bunayn-analysis-${stamp}.json`, 'application/json');
    if (format === 'csv') downloadFile(toCsv(rows as ImportedRow[]), `bunayn-analysis-${stamp}.csv`, 'text/csv;charset=utf-8');
    if (format === 'xlsx') {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(spreadsheetSafeRows(safeCoverageRows)), 'Game coverage');
      if (safeComparisonRows.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(spreadsheetSafeRows(safeComparisonRows)), 'Comparison');
      const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      downloadFile(output, `bunayn-analysis-${stamp}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    setFileStatus(t({ en: `Exported ${format.toUpperCase()} aggregate data.`, ar: `تم تصدير البيانات المجمعة بصيغة ${format.toUpperCase()}.` }, lang));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const rows = await readImportedRows(file);
      setImportedRows(rows);
      setFileStatus(t({ en: `${rows.length} privacy-safe aggregate rows are ready for review.`, ar: `تم تجهيز ${rows.length} صفاً مجمعاً وآمناً للخصوصية للمراجعة.` }, lang));
    } catch (err) {
      setImportedRows([]);
      setFileStatus(err instanceof Error ? err.message : 'The import could not be validated.');
    }
  };

  const isExecutionFailed = executePlan.isError;
  const allAgeBands = ['cycle1', 'cycle2', 'cycle3'];
  const allGames = ['eco-future', 'basket-challenge', 'heritage', 'color-focus', 'library-sort', 'word-journey', 'healthy-restaurant', 'innovation-lab', 'numeracy-check', 'bot-workshop', 'truth-lab', 'common-ground', 'spark-studio'];
  const stageGuidance: Record<Step, { en: string; ar: string }> = {
    define: { en: 'Choose a saved cohort. No learner-level rows are shown or exported.', ar: 'اختر مجموعة محفوظة. لا يتم عرض أو تصدير صفوف على مستوى المتعلم.' },
    probe: { en: 'Counting distinct players and checking every output cell against the privacy minimum.', ar: 'يتم عد اللاعبين المميزين وفحص كل خلية ناتجة مقابل الحد الأدنى للخصوصية.' },
    plan: { en: 'Turning the research question into a reviewable method before any computation runs.', ar: 'تحويل سؤال البحث إلى منهجية قابلة للمراجعة قبل تشغيل أي حساب.' },
    execute: { en: 'Approving the saved plan, then sending only compact aggregate-safe rows to the signed statistics service.', ar: 'اعتماد الخطة المحفوظة ثم إرسال صفوف مختصرة وآمنة للتجميع إلى خدمة الإحصاء الموقعة.' },
    results: { en: 'Reviewing aggregate estimates, checks, and limitations. Associations are not causal findings.', ar: 'مراجعة التقديرات المجمعة والفحوصات والقيود. الارتباطات ليست نتائج سببية.' },
  };

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

          <div className="rounded-[24px] border border-[#d6e2e9] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eef2fc] text-[#2140a8]"><Database className="h-5 w-5" /></div>
              <div>
                <h3 className="font-bold text-[#174b44]">{t({ en: 'Safe data files', ar: 'ملفات البيانات الآمنة' }, lang)}</h3>
                <p className="mt-1 text-xs leading-5 text-[#557068]">{t({ en: 'Aggregate rows only. Files stay in this browser until you export them.', ar: 'صفوف مجمعة فقط. تبقى الملفات في هذا المتصفح حتى تصديرها.' }, lang)}</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleImport} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-4 py-2.5 text-sm font-bold text-[#174b44] hover:border-[#2140a8] hover:text-[#2140a8]">
              <Upload className="h-4 w-4" /> {t({ en: 'Import aggregate file', ar: 'استيراد ملف مجمع' }, lang)}
            </button>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(['json', 'csv', 'xlsx'] as const).map((format) => (
                <button key={format} type="button" onClick={() => handleExport(format)} disabled={!coverageRows.length} className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#c8d2c7] px-2 py-2 text-[11px] font-bold uppercase text-[#557068] hover:border-[#2140a8] hover:text-[#2140a8] disabled:cursor-not-allowed disabled:opacity-40">
                  <Download className="h-3 w-3" /> {format}
                </button>
              ))}
            </div>
            {fileStatus && <p role="status" className="mt-3 text-xs font-semibold leading-5 text-[#557068]">{fileStatus}</p>}
            {importedRows.length > 0 && (
              <div className="mt-4 rounded-xl border border-[#33705f] bg-[#e6f1eb] p-3">
                <p className="text-xs font-bold text-[#174b44]">{t({ en: 'Imported preview', ar: 'معاينة الاستيراد' }, lang)} · {importedRows.length}</p>
                <div className="mt-2 max-h-28 overflow-auto text-[10px] text-[#557068]">
                  {importedRows.slice(0, 4).map((row, index) => <pre key={index} className="mb-2 whitespace-pre-wrap">{JSON.stringify(row)}</pre>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active View */}
        <div className="rounded-[28px] border border-[#d6e2e9] bg-white p-6 shadow-float sm:p-10">
          <div className="mb-8 rounded-2xl border border-[#d6e2e9] bg-[#f7fbfc] p-4" role="status">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#2140a8]">{t({ en: 'What is happening now', ar: 'ما الذي يحدث الآن' }, lang)}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#174b44]">{t(stageGuidance[step], lang)}</p>
          </div>
          {errorMessage && (
            <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-[#e8755f] bg-[#fff0eb] p-4 text-sm font-semibold leading-6 text-[#a94d40]">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#d8232a]" /> <span>{errorMessage}</span>
            </div>
          )}
          
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
                  {!probeResult.suppressed && (
                    <div className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 text-center">
                      <span className="block text-sm font-bold uppercase tracking-[.15em] text-[#a9b8b0] mb-2">{t({ en: 'Learners Found', ar: 'المتعلمون الذين تم العثور عليهم' }, lang)}</span>
                      <span className="font-display text-5xl font-bold text-[#174b44]">{probeResult.n_players}</span>
                    </div>
                  )}

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

                  {!probeResult.suppressed && (
                    <div className="space-y-6 border-t border-[#dfd2bd] pt-7">
                      <section aria-labelledby="game-coverage-heading" className="rounded-[24px] border border-[#d6e2e9] bg-[#f7fbfc] p-5">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                          <div>
                            <h3 id="game-coverage-heading" className="font-display text-xl font-bold text-[#174b44]">{t({ en: 'Players by game', ar: 'اللاعبون حسب اللعبة' }, lang)}</h3>
                            <p className="mt-1 text-sm text-[#557068]">{t({ en: 'Distinct players, not sessions. Small game groups are hidden.', ar: 'لاعبون مميزون، وليس جلسات. يتم إخفاء مجموعات الألعاب الصغيرة.' }, lang)}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#2140a8]">{t({ en: 'Privacy-safe count', ar: 'عدد آمن للخصوصية' }, lang)}</span>
                        </div>
                        {coverageQuery.isPending ? (
                          <div className="flex h-64 items-center justify-center gap-2 text-sm font-bold text-[#2140a8]"><Loader2 className="h-5 w-5 animate-spin" /> {t({ en: 'Preparing coverage chart…', ar: 'جارٍ تجهيز رسم التغطية…' }, lang)}</div>
                        ) : coverageRows.some((row) => !row.suppressed) ? (
                          <div className="mt-4 h-64" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={coverageRows.filter((row) => !row.suppressed)} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d6e2e9" vertical={false} />
                                <XAxis dataKey="game_id" tick={{ fontSize: 11, fill: '#557068' }} interval={0} angle={-20} height={58} textAnchor="end" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#557068' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#d6e2e9' }} formatter={(value) => [value, t({ en: 'Players', ar: 'اللاعبون' }, lang)]} />
                                <Bar dataKey="players" fill="#2140a8" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="mt-5 rounded-xl border border-dashed border-[#c8d2c7] bg-white p-6 text-center text-sm font-semibold text-[#557068]">{t({ en: 'No game count can be shown because every game group is below the privacy threshold.', ar: 'لا يمكن عرض عدد أي لعبة لأن كل مجموعات الألعاب أقل من حد الخصوصية.' }, lang)}</p>
                        )}
                        {coverageRows.some((row) => row.suppressed) && <p className="mt-3 text-xs font-semibold text-[#a94d40]">{t({ en: 'Some games are not shown because they do not meet the minimum cell size.', ar: 'لا يتم عرض بعض الألعاب لأنها لا تستوفي الحد الأدنى لحجم الخلية.' }, lang)}</p>}
                      </section>

                      <section aria-labelledby="comparison-heading" className="rounded-[24px] border border-[#d6e2e9] bg-white p-5">
                        <div>
                          <h3 id="comparison-heading" className="font-display text-xl font-bold text-[#174b44]">{t({ en: 'Configure a comparison', ar: 'إعداد مقارنة' }, lang)}</h3>
                          <p className="mt-1 text-sm text-[#557068]">{t({ en: 'Compare an aggregate metric across the attributes you choose. Each chart cell must pass privacy checks.', ar: 'قارن مقياساً مجمعاً عبر الخصائص التي تختارها. يجب أن تتجاوز كل خلية في الرسم فحوصات الخصوصية.' }, lang)}</p>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <label className="text-xs font-bold text-[#557068]">
                            {t({ en: 'Group along', ar: 'التجميع حسب' }, lang)}
                            <select value={comparisonGroup} onChange={(event) => setComparisonGroup(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-3 py-2.5 text-sm font-semibold text-[#174b44] outline-none focus:border-[#2140a8]">
                              {dimensionOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label, lang)}</option>)}
                            </select>
                          </label>
                          <label className="text-xs font-bold text-[#557068]">
                            {t({ en: 'Compare', ar: 'المقارنة' }, lang)}
                            <select value={comparisonSeries} onChange={(event) => setComparisonSeries(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-3 py-2.5 text-sm font-semibold text-[#174b44] outline-none focus:border-[#2140a8]">
                              {dimensionOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label, lang)}</option>)}
                            </select>
                          </label>
                          <label className="text-xs font-bold text-[#557068]">
                            {t({ en: 'Metric', ar: 'المقياس' }, lang)}
                            <select value={comparisonMetric} onChange={(event) => setComparisonMetric(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#c8d2c7] bg-[#fcf8f0] px-3 py-2.5 text-sm font-semibold text-[#174b44] outline-none focus:border-[#2140a8]">
                              {metricOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label, lang)}</option>)}
                            </select>
                          </label>
                        </div>
                        {comparisonQuery.isPending ? (
                          <div className="flex h-64 items-center justify-center gap-2 text-sm font-bold text-[#2140a8]"><Loader2 className="h-5 w-5 animate-spin" /> {t({ en: 'Calculating privacy-safe comparison…', ar: 'جارٍ حساب المقارنة الآمنة للخصوصية…' }, lang)}</div>
                        ) : comparisonChartRows.length && comparisonSeriesNames.length ? (
                          <div className="mt-5 h-72" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonChartRows} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d6e2e9" vertical={false} />
                                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#557068' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#557068' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#d6e2e9' }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                {comparisonSeriesNames.map((series, index) => <Bar key={series} dataKey={series} fill={['#2140a8', '#16a7bc', '#33705f', '#e8755f'][index % 4]} radius={[6, 6, 0, 0]} />)}
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <p className="mt-5 rounded-xl border border-dashed border-[#c8d2c7] bg-[#fcf8f0] p-6 text-center text-sm font-semibold text-[#557068]">{t({ en: 'No comparison bars are available for this selection. Try a broader cohort or different attributes.', ar: 'لا تتوفر أعمدة مقارنة لهذا الاختيار. جرّب مجموعة أوسع أو خصائص مختلفة.' }, lang)}</p>
                        )}
                        {comparisonRows.some((row) => row.suppressed) && <p className="mt-3 text-xs font-semibold text-[#a94d40]">{t({ en: 'Suppressed comparison cells are excluded from the chart and export.', ar: 'يتم استبعاد خلايا المقارنة المحجوبة من الرسم والتصدير.' }, lang)}</p>}
                      </section>
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
                <button onClick={handleExecute} disabled={approvePlan.isPending || executePlan.isPending} className="inline-flex items-center gap-2 rounded-full bg-[#16a7bc] px-6 py-3 font-bold text-[#fff4df] shadow-[0_4px_0_#0b6a79] hover:translate-y-px hover:shadow-[0_3px_0_#0b6a79] active:translate-y-1 active:shadow-none disabled:opacity-50">
                  {approvePlan.isPending || executePlan.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : t({ en: 'Approve & Execute Plan', ar: 'الموافقة وتنفيذ الخطة' }, lang)}
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
