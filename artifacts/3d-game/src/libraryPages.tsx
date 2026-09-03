import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Award, BookOpen, CalendarDays, Check, CheckCircle2, ChevronRight, CircleHelp,
  Coins, Filter, Gamepad2, Globe2, LockKeyhole, Medal, PackageOpen, Play,
  Search, ShieldCheck, ShoppingBag, Sparkles, Star, Trophy, X,
} from 'lucide-react';
import gamesData from './data/games.json';
import storeItemsData from './data/store-items.json';
import learningWorldPath from '@assets/generated_images/bunayn-learning-world.png';
import { gameDomains } from './gamesFramework';

export type PageLang = 'en' | 'ar';
export type PageCopy = { en: string; ar: string };
export type PageProfile = { name: string; age: string; role: string; avatar: string; character?: string; grade?: string; school?: string };
export type PageStoreItem = typeof storeItemsData[number];
export type PageStoreState = { purchases: string[]; spentPoints: number; equipped?: string };
export type PageWorld = { id: string; level: number; target: number; finished: boolean; score: number; coins: number };
export type PageSession = { id: string; gameId: string; createdAt: string; durationMs: number; levelsCompleted: number; levelsTotal: number; accuracyBand: 'Growing' | 'Solid' | 'Strong'; coins: number; trophyId?: string };
export type PageSummary = {
  worlds: PageWorld[];
  completed: number;
  totalWorlds: number;
  earnedCoins: number;
  availablePoints: number;
  purchases: string[];
  sessionHistory: PageSession[];
  setStoreState: (next: PageStoreState | ((previous: PageStoreState) => PageStoreState)) => void;
};
type GameRecord = typeof gamesData[number];
type Translator = (copy: PageCopy) => string;

const componentLabels: Record<string, PageCopy> = {
  core_life_skills: { en: 'Core Life Skills', ar: 'مهارات الحياة الأساسية' },
  cognitive: { en: 'Cognitive', ar: 'المعرفي' },
  practical: { en: 'Practical', ar: 'العملي' },
  personal_growth: { en: 'Personal Growth', ar: 'النمو الشخصي' },
  social_cohesion: { en: 'Social Cohesion', ar: 'التماسك الاجتماعي' },
  transformative: { en: 'Transformative', ar: 'التحولي' },
};
const categoryLabels: Record<string, PageCopy> = {
  all: { en: 'All games', ar: 'كل الألعاب' },
  default: { en: 'Default Games', ar: 'الألعاب الأساسية' },
  event: { en: 'Event Games', ar: 'ألعاب الفعاليات' },
  skins: { en: 'Skins & Outfits', ar: 'المظاهر والملابس' },
  vehicles: { en: 'Vehicles & Trails', ar: 'المركبات والمسارات' },
  style: { en: 'Style & Looks', ar: 'الأسلوب والإطلالة' },
  companions: { en: 'Companions', ar: 'الرفقاء' },
  majlis: { en: 'My Majlis', ar: 'مجلسي' },
  passport: { en: 'Passport Frames', ar: 'إطارات جواز السفر' },
  heritage: { en: 'Heritage', ar: 'التراث' },
};
const gameDomainSlugs: Record<string, string[]> = {
  turathuna: ['developmental-skills', 'social-relations'],
  'word-journey': ['literacy', 'developmental-skills'],
  'numeracy-marathon': ['literacy', 'developmental-skills'],
  'balance-basket': ['activities', 'developmental-skills'],
  'truth-lab': ['developmental-skills'],
  'innovation-lab': ['environment', 'developmental-skills'],
  'color-focus': ['developmental-skills'],
  clean_environment_better_future: ['environment', 'activities', 'social-relations'],
};
const rarityColors: Record<string, string> = {
  rare: 'border-[#16a7bc] bg-[#e7f8fb] text-[#0b6a79]',
  epic: 'border-[#e8755f] bg-[#fff0eb] text-[#a44f40]',
  legendary: 'border-[#c9a227] bg-[#fff3cc] text-[#79621d]',
};
const iconForGame = (game: GameRecord) => game.id === 'color-focus' ? Sparkles : game.id === 'word-journey' ? Globe2 : game.id === 'turathuna' ? Trophy : Gamepad2;
const tx = (translator: Translator, copy: PageCopy) => translator(copy);

function statusCopy(game: GameRecord, translator: Translator) {
  if (game.status === 'ended') return translator({ en: 'Event ended · انتهت الفعالية', ar: 'انتهت الفعالية' });
  if (game.status === 'live') return translator({ en: 'Live now', ar: 'مباشرة الآن' });
  return translator({ en: 'Available', ar: 'متاحة' });
}

function progressForGame(game: GameRecord, worlds: PageWorld[]) {
  const aliases: Record<string, string> = { turathuna: 'heritage', 'balance-basket': 'basket-challenge', 'numeracy-marathon': 'numeracy-check' };
  return worlds.find((world) => world.id === (aliases[game.id] ?? game.id)) ?? { id: game.id, level: 0, target: 3, finished: false, score: 0, coins: 0 };
}

function LibraryGameCard({ game, lang, translator, onOpen, worlds }: { game: GameRecord; lang: PageLang; translator: Translator; onOpen: () => void; worlds: PageWorld[] }) {
  const Icon = iconForGame(game);
  const progress = progressForGame(game, worlds);
  return <button type="button" onClick={onOpen} className={`group w-full text-start ${game.status === 'ended' ? 'opacity-80 grayscale-[.65]' : ''}`} data-testid={`card-library-${game.id}`}>
    <article className="relative h-full overflow-hidden rounded-[26px] border border-[#24334f] bg-[#111a2c] shadow-[0_16px_35px_rgba(7,12,25,.25)] transition hover:-translate-y-1 hover:border-[#c9a227]">
      <div className="relative h-44 overflow-hidden bg-[#17253b]"><img src={learningWorldPath} alt="" className="h-full w-full object-cover opacity-60 mix-blend-screen" /><div className="absolute inset-0 bg-gradient-to-t from-[#111a2c] via-transparent to-transparent" /><div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2"><span className="rounded-full border border-[#c9a227]/60 bg-[#0b0f1a]/80 px-3 py-1 text-xs font-bold text-[#f6d66b]">{statusCopy(game, translator)}</span>{game.category === 'event' && <span className="rounded-full bg-[#c9a227] px-3 py-1 text-xs font-black text-[#0b0f1a]">{game.partner?.shortName[lang]}</span>}</div><div className="absolute bottom-4 start-4 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#c9a227]/60 bg-[#0b0f1a]/80 text-[#f6d66b]"><Icon className="h-6 w-6" /></span><div><h3 className="font-display text-xl font-bold text-[#f5f5f0]">{game.title[lang]}</h3><p className="mt-0.5 text-xs text-[#b8c4d4]">{game.tagline[lang]}</p></div></div></div>
      <div className="p-5"><div className="flex flex-wrap gap-1.5">{game.cycles.map((cycle) => <span key={cycle} className="rounded-full border border-[#35445f] px-2 py-1 text-[10px] font-bold text-[#b8c4d4]">C{cycle}</span>)}{game.components.slice(0, 2).map((component) => <span key={component} className="rounded-full border border-[#35445f] px-2 py-1 text-[10px] font-bold text-[#b8c4d4]">{componentLabels[component]?.[lang]}</span>)}</div><p className="mt-4 min-h-12 text-sm leading-relaxed text-[#cbd4df]">{game.brief[lang]}</p><div className="mt-5 flex items-center justify-between border-t border-[#24334f] pt-4"><span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f6d66b]"><Coins className="h-4 w-4" /> +{game.coinReward.completion}</span>{game.status === 'ended' ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#93a2b5]"><LockKeyhole className="h-4 w-4" /> {tx(translator, { en: 'Archived', ar: 'مؤرشفة' })}</span> : <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f5f5f0]">{progress.finished ? <CheckCircle2 className="h-4 w-4 text-[#69d2bd]" /> : <Play className="h-4 w-4 text-[#f6d66b]" />} {tx(translator, progress.finished ? { en: 'Completed', ar: 'مكتملة' } : { en: 'Open details', ar: 'افتح التفاصيل' })}</span>}</div></div>
    </article>
  </button>;
}

function LibraryDetail({ game, lang, translator, onClose }: { game: GameRecord; lang: PageLang; translator: Translator; onClose: () => void }) {
  const Icon = iconForGame(game);
  const isEnded = game.status === 'ended';
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#050912]/80 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={game.title[lang]}><div className="max-h-[92dvh] w-full max-w-3xl overflow-auto rounded-t-[30px] border border-[#33435e] bg-[#111a2c] text-[#f5f5f0] shadow-2xl sm:rounded-[30px]"><div className="relative h-44 overflow-hidden sm:h-56"><img src={learningWorldPath} alt="" className="h-full w-full object-cover opacity-60 mix-blend-screen" /><div className="absolute inset-0 bg-gradient-to-t from-[#111a2c] to-transparent" /><button type="button" onClick={onClose} className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-[#0b0f1a]/80" aria-label={tx(translator, { en: 'Close details', ar: 'إغلاق التفاصيل' })} data-testid="button-close-game-details"><X className="h-5 w-5" /></button><div className="absolute bottom-5 start-6 flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c9a227] text-[#0b0f1a]"><Icon className="h-7 w-7" /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f6d66b]">{game.category === 'event' ? game.partner?.name[lang] : tx(translator, { en: 'Default game', ar: 'لعبة أساسية' })}</p><h2 className="font-display text-3xl font-bold">{game.title[lang]}</h2></div></div></div><div className="space-y-7 p-6 sm:p-8"><p className="text-lg leading-relaxed text-[#d7e0eb]">{game.brief[lang]}</p><div className="grid gap-5 sm:grid-cols-2"><InfoList icon={BookOpen} title={tx(translator, { en: "What you'll learn", ar: 'ماذا ستتعلم' })} values={game.educates[lang]} /><InfoList icon={ShieldCheck} title={tx(translator, { en: 'Challenges', ar: 'التحديات' })} values={game.challenges[lang]} /></div>{game.category === 'event' && <div className="rounded-2xl border border-[#c9a227]/50 bg-[#302a16] p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f6d66b]">{tx(translator, { en: 'What makes this event different', ar: 'ما يميز هذه الفعالية' })}</p><p className="mt-2 leading-relaxed text-[#f7e5a4]">{game.uniqueCapture?.[lang]}</p><p className="mt-3 inline-flex items-center gap-2 text-sm text-[#d7c78c]"><CalendarDays className="h-4 w-4" /> {game.eventWindow?.start} — {game.eventWindow?.end}</p></div>}<div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#2b3a54] pt-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#93a2b5]">{tx(translator, { en: 'Completion reward', ar: 'مكافأة الإكمال' })}</p><p className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold text-[#f6d66b]"><Coins className="h-5 w-5" /> {game.coinReward.completion} + {game.coinReward.bonusMax}</p></div>{isEnded ? <span className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/50 bg-[#302a16] px-4 py-2 text-sm font-bold text-[#f6d66b]"><LockKeyhole className="h-4 w-4" /> {tx(translator, { en: 'Event closed', ar: 'الفعالية مغلقة' })}</span> : <Link href={game.route} onClick={onClose} className="inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-5 py-3 font-bold text-[#0b0f1a]" data-testid={`button-play-${game.id}`}><Play className="h-4 w-4" /> {tx(translator, { en: 'Play now', ar: 'العب الآن' })}</Link>}</div></div></div></div>;
}

function InfoList({ icon: Icon, title, values }: { icon: typeof BookOpen; title: string; values: string[] }) {
  return <div><h3 className="flex items-center gap-2 font-display text-lg font-bold text-[#f6d66b]"><Icon className="h-5 w-5" /> {title}</h3><ul className="mt-3 space-y-2 text-sm text-[#d7e0eb]">{values.map((value) => <li key={value} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#69d2bd]" />{value}</li>)}</ul></div>;
}

export function LibraryPage({ lang, translator, worlds }: { lang: PageLang; translator: Translator; worlds: PageWorld[] }) {
  const [location, setLocation] = useLocation();
  const params = useMemo(() => new URLSearchParams(location.split('?')[1] ?? ''), [location]);
  const [selected, setSelected] = useState<GameRecord | null>(null);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [domain, setDomain] = useState(params.get('domain') ?? 'all');
  const [status, setStatus] = useState(params.get('status') ?? 'all');
  const update = (next: Record<string, string>) => {
    const nextParams = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value && value !== 'all') nextParams.set(key, value); });
    setLocation(`/library${nextParams.toString() ? `?${nextParams}` : ''}`);
  };
  const filtered = gamesData.filter((game) => {
    const haystack = `${game.title.en} ${game.title.ar} ${game.tagline.en} ${game.tagline.ar}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (category === 'all' || game.category === category) && (status === 'all' || game.status === status) && (domain === 'all' || gameDomainSlugs[game.id]?.includes(domain));
  });
  return <div className="min-h-screen bg-[#0b0f1a] px-5 py-8 text-[#f5f5f0] lg:px-10 lg:py-12">
    <div className="mx-auto max-w-[1440px]">
      <section className="relative overflow-hidden rounded-[32px] border border-[#34435f] bg-[#111a2c] p-7 shadow-[0_25px_80px_rgba(4,8,20,.35)] sm:p-10">
        <div className="absolute -end-16 -top-24 h-72 w-72 rounded-full bg-[#c9a227]/20 blur-2xl" />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#f6d66b]"><BookOpen className="h-4 w-4" /> {tx(translator, { en: 'Bunayn game library', ar: 'مكتبة ألعاب بنيان' })}</p>
          <h1 className="mt-4 font-display text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">{tx(translator, { en: 'Choose your next knowledge quest.', ar: 'اختر رحلة المعرفة التالية.' })}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#b8c4d4]">{tx(translator, { en: 'Always-on worlds build skills through play. Partner events add limited stories and unique trophies.', ar: 'تبني العوالم المتاحة دائماً المهارات من خلال اللعب. وتضيف فعاليات الشركاء قصصاً وكؤوساً فريدة.' })}</p>
        </div>
      </section>
      <section className="sticky top-[78px] z-20 mt-6 space-y-3 rounded-2xl border border-[#293850] bg-[#0f1728]/95 p-3 backdrop-blur-md" aria-label={tx(translator, { en: 'Game filters', ar: 'مرشحات الألعاب' })}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="block w-full lg:max-w-xs">
            <span className="mb-1 block text-xs font-bold text-[#93a2b5]">{tx(translator, { en: 'Game category', ar: 'فئة اللعبة' })}</span>
            <select value={category} onChange={(event) => { setCategory(event.target.value); update({ category: event.target.value, domain, status, q: search }); }} className="w-full rounded-full border border-[#35445f] bg-[#111a2c] px-4 py-2.5 text-sm font-bold text-[#f5f5f0] outline-none focus:border-[#c9a227]" data-testid="select-library-category">
              {(['all', 'default', 'event'] as const).map((value) => <option key={value} value={value}>{categoryLabels[value][lang]}</option>)}
            </select>
          </label>
          <label className="block w-full lg:max-w-xs">
            <span className="mb-1 block text-xs font-bold text-[#93a2b5]">{tx(translator, { en: 'Domain', ar: 'المجال' })}</span>
            <select value={domain} onChange={(event) => { setDomain(event.target.value); update({ category, domain: event.target.value, status, q: search }); }} className="w-full rounded-full border border-[#35445f] bg-[#111a2c] px-4 py-2.5 text-sm font-bold text-[#f5f5f0] outline-none focus:border-[#16a7bc]" data-testid="select-library-domain">
              <option value="all">{tx(translator, { en: 'All domains', ar: 'كل المجالات' })}</option>
              {gameDomains.map((item) => <option key={item.slug} value={item.slug}>{item.name[lang]}</option>)}
            </select>
          </label>
          <label className="relative ms-auto block w-full lg:max-w-xs">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a2b5]" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); update({ category, domain, status, q: event.target.value }); }} placeholder={tx(translator, { en: 'Search title or tagline', ar: 'ابحث في العنوان أو الوصف' })} className="w-full rounded-full border border-[#35445f] bg-[#111a2c] py-2.5 pe-4 ps-9 text-sm text-[#f5f5f0] outline-none placeholder:text-[#718097] focus:border-[#c9a227]" data-testid="input-library-search" />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-[#f6d66b]" />
          <span className="font-bold text-[#93a2b5]">{tx(translator, { en: 'Status', ar: 'الحالة' })}</span>
          {['all', 'available', 'live', 'ended'].map((value) => <button type="button" key={value} onClick={() => { setStatus(value); update({ category, domain, status: value, q: search }); }} className={`rounded-full border px-3 py-1.5 font-bold ${status === value ? 'border-[#c9a227] bg-[#302a16] text-[#f6d66b]' : 'border-[#35445f] text-[#b8c4d4]'}`}>{value === 'all' ? tx(translator, { en: 'Any', ar: 'الكل' }) : value === 'available' ? tx(translator, { en: 'Available', ar: 'متاحة' }) : value === 'ended' ? tx(translator, { en: 'Ended', ar: 'انتهت' }) : tx(translator, { en: 'Live', ar: 'مباشرة' })}</button>)}
        </div>
      </section>
      <div className="mt-8 flex items-end justify-between gap-4">
        <div><p className="text-sm font-bold text-[#f6d66b]">{categoryLabels[category]?.[lang] ?? categoryLabels.all[lang]}</p><h2 className="mt-1 font-display text-3xl font-bold">{filtered.length} {tx(translator, { en: 'worlds ready', ar: 'عوالم جاهزة' })}</h2></div>
        <span className="hidden text-sm text-[#93a2b5] sm:block">{tx(translator, { en: 'Content and rewards are defined in JSON.', ar: 'المحتوى والمكافآت معرفة في JSON.' })}</span>
      </div>
      {filtered.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((game) => <LibraryGameCard key={game.id} game={game} lang={lang} translator={translator} worlds={worlds} onOpen={() => setSelected(game)} />)}</div> : <div className="mt-5 rounded-[26px] border border-dashed border-[#445570] bg-[#111a2c] p-12 text-center"><CircleHelp className="mx-auto h-10 w-10 text-[#f6d66b]" /><h2 className="mt-4 font-display text-2xl font-bold">{tx(translator, { en: 'No games match yet', ar: 'لا توجد ألعاب مطابقة بعد' })}</h2><button type="button" onClick={() => { setCategory('all'); setDomain('all'); setStatus('all'); setSearch(''); update({}); }} className="mt-5 rounded-full bg-[#c9a227] px-5 py-3 font-bold text-[#0b0f1a]">{tx(translator, { en: 'Reset filters', ar: 'إعادة المرشحات' })}</button></div>}
      <p className="mt-8 text-sm text-[#93a2b5]">{tx(translator, { en: 'Ended events remain visible with their trophy and story. Their play route is locked.', ar: 'تبقى الفعاليات المنتهية ظاهرة مع كأسها وقصتها. ويظل مسار اللعب مغلقاً.' })}</p>
    </div>
    {selected && <LibraryDetail game={selected} lang={lang} translator={translator} onClose={() => setSelected(null)} />}
  </div>;
}

export function ProgressPage({ lang, translator, profile, summary }: { lang: PageLang; translator: Translator; profile: PageProfile | null; summary: PageSummary }) {
  if (!profile) return <div className="min-h-screen bg-[#0b0f1a] px-5 py-20 text-center text-[#f5f5f0]"><PackageOpen className="mx-auto h-12 w-12 text-[#f6d66b]" /><h1 className="mt-5 font-display text-4xl font-bold">{tx(translator, { en: 'Your journey starts with your player card.', ar: 'رحلتك تبدأ ببطاقة لاعبك.' })}</h1><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#c9a227] px-5 py-3 font-bold text-[#0b0f1a]">{tx(translator, { en: 'Create player', ar: 'أنشئ لاعباً' })}</Link></div>;
  const componentGames: Record<string, string[]> = { core_life_skills: ['numeracy-check'], cognitive: ['heritage', 'color-focus'], practical: ['basket-challenge', 'healthy-restaurant'], personal_growth: ['word-journey', 'color-focus'], social_cohesion: ['heritage', 'common-ground'], transformative: ['innovation-lab', 'truth-lab'] };
  const gameMap = Object.fromEntries(gamesData.map((game) => [game.id, game]));
  const completedFor = (gameId: string) => progressForGame(gameMap[gameId] ?? gamesData[0], summary.worlds).finished;
  const trophyGames = gamesData.flatMap((game) => game.trophies.map((trophyId) => ({ game, trophyId })));
  const uniqueDates = new Set(summary.sessionHistory.map((session) => session.createdAt.slice(0, 10)));
  const streak = uniqueDates.size;
  const tracker = storeItemsData.filter((item) => item.purchasable).sort((a, b) => (a.price ?? 0) - (b.price ?? 0)).slice(0, 3);
  return <div className="min-h-screen bg-[#0b0f1a] px-5 py-8 text-[#f5f5f0] lg:px-10 lg:py-12"><div className="mx-auto max-w-[1280px]"><section className="rounded-[30px] border border-[#34435f] bg-[#111a2c] p-7 sm:p-10"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#c9a227] bg-[#302a16] font-display text-xl font-bold text-[#f6d66b]">{profile.avatar}</div><div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#f6d66b]">{tx(translator, { en: 'My progress', ar: 'تقدمي' })}</p><h1 className="mt-1 font-display text-4xl font-black">{profile.name}</h1><p className="text-sm text-[#b8c4d4]">{tx(translator, { en: `Age ${profile.age}`, ar: `العمر ${profile.age}` })}</p></div></div><Link href="/library" className="inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-5 py-3 font-bold text-[#0b0f1a]"><Gamepad2 className="h-4 w-4" /> {tx(translator, { en: 'Play a game', ar: 'العب لعبة' })}</Link></div></section><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[Coins, summary.earnedCoins, { en: 'Total coins', ar: 'إجمالي العملات' }], [Gamepad2, summary.sessionHistory.length, { en: 'Games played', ar: 'الألعاب التي لعبتها' }], [Trophy, trophyGames.filter(({ game }) => completedFor(game.id)).length, { en: 'Trophies earned', ar: 'الكؤوس المكتسبة' }], [Sparkles, streak, { en: 'Current streak (days)', ar: 'المتتالية الحالية (أيام)' }]].map(([Icon, value, label]) => { const StatIcon = Icon as typeof Coins; return <div key={(label as PageCopy).en} className="rounded-2xl border border-[#2d3b54] bg-[#111a2c] p-5"><StatIcon className="h-5 w-5 text-[#f6d66b]" /><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#93a2b5]">{tx(translator, label as PageCopy)}</p><p className="mt-1 font-display text-4xl font-black text-[#f5f5f0]">{value as number}</p></div>; })}</div><section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl border border-[#2d3b54] bg-[#111a2c] p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#16a7bc]">{tx(translator, { en: 'Play history', ar: 'سجل اللعب' })}</p><h2 className="mt-2 font-display text-2xl font-bold">{tx(translator, { en: 'Your sessions', ar: 'جلساتك' })}</h2></div><span className="text-xs text-[#93a2b5]">{summary.sessionHistory.length} / 20</span></div>{summary.sessionHistory.length === 0 ? <div className="py-14 text-center text-[#93a2b5]"><CalendarDays className="mx-auto h-9 w-9 text-[#f6d66b]" /><p className="mt-3">{tx(translator, { en: 'Your journey starts with your first game.', ar: 'رحلتك تبدأ بلعبتك الأولى.' })}</p><Link href="/library" className="mt-4 inline-flex text-sm font-bold text-[#69d2bd]">{tx(translator, { en: 'Open library', ar: 'افتح المكتبة' })}</Link></div> : <div className="mt-5 space-y-3">{summary.sessionHistory.slice(0, 20).map((session) => <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2d3b54] bg-[#0d1423] p-3"><div><p className="font-bold">{gameMap[session.gameId]?.title[lang] ?? session.gameId}</p><p className="text-xs text-[#93a2b5]">{new Date(session.createdAt).toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-AE')} · {Math.round(session.durationMs / 1000)}s</p></div><span className="text-xs font-bold text-[#69d2bd]">{session.accuracyBand}</span><span className="inline-flex items-center gap-1 text-sm font-bold text-[#f6d66b]"><Coins className="h-4 w-4" /> {session.coins}</span></div>)}</div>}</div><div className="rounded-2xl border border-[#2d3b54] bg-[#111a2c] p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{tx(translator, { en: 'Masar profile', ar: 'ملف مسار' })}</p><h2 className="mt-2 font-display text-2xl font-bold">{tx(translator, { en: 'Build your profile through variety.', ar: 'ابنِ ملفك من خلال التنوع.' })}</h2><div className="mt-5 grid grid-cols-2 gap-3">{Object.entries(componentLabels).map(([id, label]) => { const covered = (componentGames[id] ?? []).filter(completedFor).length; return <div key={id} className="rounded-xl border border-[#2d3b54] bg-[#0d1423] p-3 text-center"><div className={`mx-auto grid h-16 w-16 place-items-center rounded-full border-4 ${covered >= 2 ? 'border-[#69d2bd] bg-[#16372f]' : 'border-[#40506b]'}`}>{covered >= 2 ? <span className="font-display text-lg font-bold text-[#69d2bd]">{Math.min(100, covered * 50)}%</span> : <LockKeyhole className="h-5 w-5 text-[#718097]" />}</div><p className="mt-2 text-xs font-bold">{label[lang]}</p>{covered < 2 && <p className="mt-1 text-[10px] text-[#93a2b5]">{tx(translator, { en: 'Building your profile', ar: 'جارٍ بناء ملفك' })}</p>}</div>; })}</div></div></section><section className="mt-8 rounded-2xl border border-[#2d3b54] bg-[#111a2c] p-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#c9a227]">{tx(translator, { en: 'Per-game progress', ar: 'التقدم في الألعاب' })}</p><h2 className="mt-2 font-display text-2xl font-bold">{tx(translator, { en: 'Your worlds', ar: 'عوالمك' })}</h2></div><Link href="/store" className="text-sm font-bold text-[#69d2bd]">{tx(translator, { en: 'Rewards tracker', ar: 'متتبع المكافآت' })}</Link></div><div className="mt-5 grid gap-3 md:grid-cols-2">{gamesData.map((game) => { const progress = progressForGame(game, summary.worlds); const percent = progress.finished ? 100 : Math.round((Math.min(progress.level, 3) / 3) * 100); return <div key={game.id} className="rounded-xl border border-[#2d3b54] bg-[#0d1423] p-4"><div className="flex items-center justify-between gap-3"><span className="font-bold">{game.title[lang]}</span>{game.status === 'ended' && <span className="rounded-full bg-[#302a16] px-2 py-1 text-[10px] font-bold text-[#f6d66b]">{tx(translator, { en: 'Archived', ar: 'مؤرشفة' })}</span>}</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#25334b]"><div className="h-full rounded-full bg-[#69d2bd]" style={{ width: `${percent}%` }} /></div><div className="mt-2 flex justify-between text-xs text-[#93a2b5]"><span>{progress.finished ? tx(translator, { en: 'Complete', ar: 'مكتمل' }) : progress.level ? `${progress.level}/3 ${tx(translator, { en: 'levels', ar: 'مستويات' })}` : tx(translator, { en: 'Not yet started', ar: 'لم تبدأ بعد' })}</span>{!progress.finished && game.playable && <Link href={game.route} className="font-bold text-[#f6d66b]">{tx(translator, { en: 'Play', ar: 'العب' })}</Link>}</div></div>; })}</div></section><section className="mt-8 rounded-2xl border border-[#2d3b54] bg-[#111a2c] p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f6d66b]">{tx(translator, { en: 'Trophies & rewards', ar: 'الكؤوس والمكافآت' })}</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{trophyGames.map(({ game, trophyId }) => { const earned = completedFor(game.id); return <div key={trophyId} className={`rounded-xl border p-4 ${earned ? 'border-[#c9a227] bg-[#302a16]' : 'border-[#2d3b54] bg-[#0d1423]'}`}><Medal className={`h-7 w-7 ${earned ? 'text-[#f6d66b]' : 'text-[#5e6d83]'}`} /><p className="mt-3 font-bold">{game.title[lang]}</p><p className="mt-1 text-xs text-[#93a2b5]">{earned ? tx(translator, { en: 'Earned', ar: 'مكتسبة' }) : game.category === 'event' ? tx(translator, { en: 'Event closed', ar: 'الفعالية مغلقة' }) : tx(translator, { en: `Complete ${game.title.en} three times`, ar: `أكمل ${game.title.ar} ثلاث مرات` })}</p>{earned && <Check className="mt-3 h-4 w-4 text-[#69d2bd]" />}</div>; })}</div><div className="mt-7 border-t border-[#2d3b54] pt-5"><h3 className="font-display text-xl font-bold">{tx(translator, { en: 'Closest store rewards', ar: 'أقرب مكافآت المتجر' })}</h3><div className="mt-4 grid gap-3 md:grid-cols-3">{tracker.map((item) => { const price = item.price ?? 0; const balance = summary.availablePoints; const percent = Math.min(100, Math.round((balance / price) * 100)); return <Link href={`/store?item=${item.id}`} key={item.id} className="rounded-xl border border-[#2d3b54] bg-[#0d1423] p-4"><p className="font-bold">{item.name[lang]}</p><div className="mt-3 h-2 rounded-full bg-[#25334b]"><div className="h-full rounded-full bg-[#c9a227]" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-[#93a2b5]">{Math.max(0, price - balance)} {tx(translator, { en: 'coins to go', ar: 'عملة متبقية' })}</p></Link>; })}</div></div></section></div></div>;
}

export function StorePage({ lang, translator, profile, summary }: { lang: PageLang; translator: Translator; profile: PageProfile | null; summary: PageSummary }) {
  const [location, setLocation] = useLocation();
  const [category, setCategory] = useState('skins');
  const [preview, setPreview] = useState<PageStoreItem | null>(null);
  const [pending, setPending] = useState<PageStoreItem | null>(null);
  const categories = ['skins', 'vehicles', 'style', 'companions', 'majlis', 'passport', 'heritage'];
  if (!profile) return <div className="min-h-screen bg-[#0b0f1a] px-5 py-20 text-center text-[#f5f5f0]"><ShoppingBag className="mx-auto h-12 w-12 text-[#f6d66b]" /><h1 className="mt-5 font-display text-4xl font-bold">{tx(translator, { en: 'Create a player before shopping.', ar: 'أنشئ لاعباً قبل التسوق.' })}</h1><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#c9a227] px-5 py-3 font-bold text-[#0b0f1a]">{tx(translator, { en: 'Create player', ar: 'أنشئ لاعباً' })}</Link></div>;
  const activeItems = storeItemsData.filter((item) => item.category === category);
  const buy = async () => {
    if (!pending || !pending.purchasable || pending.price === null || summary.availablePoints < pending.price) return;
    const item = pending;
    const previous = { purchases: summary.purchases, spentPoints: summary.earnedCoins - summary.availablePoints };
    summary.setStoreState((state) => ({ ...state, purchases: [...state.purchases, item.id], spentPoints: state.spentPoints + item.price! }));
    setPending(null);
    try {
      const response = await fetch('/api/player/purchase', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ player_id: profile.name, item_id: item.id }) });
      if (!response.ok) throw new Error('purchase rejected');
    } catch {
      summary.setStoreState((state) => ({ ...state, ...previous }));
    }
  };
  const requested = new URLSearchParams(location.split('?')[1] ?? '').get('item');
  const itemForPreview = preview ?? storeItemsData.find((item) => item.id === requested) ?? null;
  const closePreview = () => { setPreview(null); if (requested) setLocation('/store'); };
  return <div className="min-h-screen bg-[#0b0f1a] px-5 py-8 text-[#f5f5f0] lg:px-10 lg:py-12"><div className="mx-auto max-w-[1280px]"><section className="rounded-[30px] border border-[#34435f] bg-[#111a2c] p-7 sm:p-10"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#f6d66b]"><ShoppingBag className="h-4 w-4" /> {tx(translator, { en: 'Bunayn store', ar: 'متجر بنيان' })}</p><h1 className="mt-4 font-display text-5xl font-black">{tx(translator, { en: 'Build a collection that feels like you.', ar: 'ابنِ مجموعة تشبهك.' })}</h1><p className="mt-4 max-w-2xl text-lg text-[#b8c4d4]">{tx(translator, { en: 'Coins are earned through play. No real money, random rewards, or pressure timers.', ar: 'تُكتسب العملات من خلال اللعب. لا أموال حقيقية ولا مكافآت عشوائية ولا مؤقتات ضغط.' })}</p></div><div className="rounded-2xl border border-[#c9a227]/60 bg-[#302a16] px-5 py-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#d7c78c]">{tx(translator, { en: 'Balance', ar: 'الرصيد' })}</p><p className="mt-1 flex items-center gap-2 font-display text-4xl font-black text-[#f6d66b]" data-testid="text-store-balance"><Coins className="h-7 w-7" /> {summary.availablePoints}</p></div></div></section><div className="mt-6 flex gap-2 overflow-x-auto border-b border-[#2d3b54] pb-3">{categories.map((value) => <button type="button" key={value} onClick={() => setCategory(value)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${category === value ? 'bg-[#c9a227] text-[#0b0f1a]' : 'border border-[#35445f] text-[#b8c4d4]'}`} data-testid={`button-store-category-${value}`}>{categoryLabels[value][lang]}</button>)}</div>{activeItems.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{activeItems.map((item) => { const owned = summary.purchases.includes(item.id); const enough = item.price !== null && summary.availablePoints >= item.price; return <button type="button" onClick={() => setPreview(item)} key={item.id} className={`group rounded-[24px] border-2 bg-[#111a2c] p-4 text-start transition hover:-translate-y-1 ${rarityColors[item.rarity]?.split(' ')[0] ?? 'border-[#2d3b54]'}`} data-testid={`card-store-${item.id}`}><div className={`grid h-40 place-items-center rounded-2xl ${rarityColors[item.rarity]?.split(' ').slice(1, 2).join(' ') ?? 'bg-[#17253b]'}`}><div className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-current text-[#f6d66b]"><Sparkles className="h-9 w-9" /></div></div><div className="mt-4 flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-bold">{item.name[lang]}</h2><p className="mt-1 text-sm text-[#93a2b5]">{item.description[lang]}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${rarityColors[item.rarity]}`}>{item.rarity}</span></div><div className="mt-5 flex items-center justify-between border-t border-[#2d3b54] pt-4">{item.price === null ? <span className="text-xs font-bold text-[#f6d66b]">{tx(translator, { en: 'Earned, not bought', ar: 'تُكتسب ولا تُشترى' })}</span> : <span className="inline-flex items-center gap-1 text-sm font-bold text-[#f6d66b]"><Coins className="h-4 w-4" /> {item.price}</span>}<span className="text-xs font-bold text-[#69d2bd]">{owned ? tx(translator, { en: 'Owned', ar: 'مملوك' }) : item.price === null ? tx(translator, { en: 'Locked', ar: 'مقفل' }) : enough ? tx(translator, { en: 'Buy', ar: 'شراء' }) : tx(translator, { en: `${item.price - summary.availablePoints} to go`, ar: `باقي ${item.price - summary.availablePoints}` })}</span></div></button>; })}</div> : <div className="mt-7 rounded-2xl border border-dashed border-[#445570] p-12 text-center text-[#93a2b5]"><PackageOpen className="mx-auto h-9 w-9 text-[#f6d66b]" /><p className="mt-3">{tx(translator, { en: 'More items are on the way.', ar: 'المزيد من العناصر قريباً.' })}</p></div>}<p className="mt-8 text-center text-sm text-[#718097]">{tx(translator, { en: 'Tap an item to preview it on your current avatar.', ar: 'اضغط على عنصر لمعاينته على شخصيتك الحالية.' })}</p></div>{itemForPreview && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#050912]/80 p-0 sm:items-center sm:p-6"><div className="w-full max-w-md rounded-t-[30px] border border-[#34435f] bg-[#111a2c] p-6 sm:rounded-[30px]"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{itemForPreview.name[lang]}</h2><button type="button" onClick={closePreview} aria-label={tx(translator, { en: 'Close preview', ar: 'إغلاق المعاينة' })}><X className="h-5 w-5" /></button></div><div className="mt-5 grid h-44 place-items-center rounded-2xl bg-[#17253b]"><div className="grid h-24 w-24 place-items-center rounded-full border-2 border-[#c9a227] text-[#f6d66b]"><Sparkles className="h-10 w-10" /></div></div><p className="mt-5 text-[#b8c4d4]">{itemForPreview.description[lang]}</p><div className="mt-5 flex gap-3">{itemForPreview.purchasable && !summary.purchases.includes(itemForPreview.id) && <button type="button" disabled={itemForPreview.price === null || summary.availablePoints < itemForPreview.price} onClick={() => setPending(itemForPreview)} className="flex-1 rounded-full bg-[#c9a227] px-4 py-3 font-bold text-[#0b0f1a]" data-testid={`button-confirm-open-${itemForPreview.id}`}>{itemForPreview.price === null ? tx(translator, { en: 'Locked', ar: 'مقفل' }) : summary.availablePoints >= itemForPreview.price ? tx(translator, { en: 'Buy', ar: 'شراء' }) : tx(translator, { en: 'Not enough coins', ar: 'عملات غير كافية' })}</button>}{summary.purchases.includes(itemForPreview.id) && <button type="button" onClick={() => summary.setStoreState((state) => ({ ...state, equipped: itemForPreview.id }))} className="flex-1 rounded-full bg-[#69d2bd] px-4 py-3 font-bold text-[#0b0f1a]">{summary.purchases.includes(itemForPreview.id) && tx(translator, { en: 'Equip', ar: 'تجهيز' })}</button>}</div></div></div>}{pending && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#050912]/80 p-5"><div className="w-full max-w-sm rounded-3xl border border-[#c9a227] bg-[#111a2c] p-6 text-center"><Award className="mx-auto h-10 w-10 text-[#f6d66b]" /><h2 className="mt-4 font-display text-2xl font-bold">{tx(translator, { en: 'Confirm purchase?', ar: 'تأكيد الشراء؟' })}</h2><p className="mt-2 text-sm text-[#b8c4d4]">{pending.name[lang]} · {pending.price} {tx(translator, { en: 'coins', ar: 'عملة' })}</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setPending(null)} className="flex-1 rounded-full border border-[#35445f] px-4 py-3 font-bold">{tx(translator, { en: 'Not now', ar: 'ليس الآن' })}</button><button type="button" onClick={buy} className="flex-1 rounded-full bg-[#c9a227] px-4 py-3 font-bold text-[#0b0f1a]" data-testid="button-confirm-purchase">{tx(translator, { en: 'Confirm', ar: 'تأكيد' })}</button></div></div></div>}</div>;
}