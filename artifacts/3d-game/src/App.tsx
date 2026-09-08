import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import logoPath from '@assets/image_1787208364235-transparent.png';
import learningWorldPath from '@assets/generated_images/bunayn-learning-world.png';
import hamdanPath from '@assets/Hamdan_logo_1787295278410.png';
import hananPath from '@assets/hanan_logo_1787295278411.png';
import { getColorFocusLevel, getContentCycle, getHeritageItem, getHeritageItemCount, getInnovationItem, getInnovationItemCount, getMenuItem, getMenuItemCount, getMenuTask, getNumeracyItem, getNumeracyItemCount, getPackCopy, getTruthItem, getTruthItemCount, getWordItem, getWordItemCount } from './contentPack';
import { useGameRuntime, useTelemetryItem } from './gameRuntime';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BarChart3, BookOpen, Check,
  ChevronDown, ChevronRight, CircleHelp, Clock3, Coins, Compass, Crown, Footprints, Gamepad2,
  Globe2, Leaf, LockKeyhole, Menu, Pause, Play, RotateCcw, ShoppingBag, Sparkles, Star, Trophy,
  Lightbulb, Users, X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';
import Workbench from './Workbench';
import { LibraryPage, ProgressPage, StorePage, type PageSession, type PageStoreState } from './libraryPages';
import { CategoryDetailPage, DomainDetailPage, GamesIndexPage, RequestGamePageForm, TiersPage } from './gamesFramework';

export type Lang = 'en' | 'ar';
export type Copy = { en: string; ar: string };
const gameLibraryCopy: Record<string, Copy> = {
  'Welcome to Bunayn AD': { en: 'Bunayn AD Home', ar: 'الصفحة الرئيسية لبنين' },
  'Back to welcome': { en: 'Back to home', ar: 'العودة إلى الصفحة الرئيسية' },
  'Back to game hub': { en: 'Back to Game Home', ar: 'العودة إلى الصفحة الرئيسية للألعاب' },
  'The game library': { en: 'The Game Library', ar: 'مكتبة الألعاب' },
  'Explore the games': { en: 'Explore Game Library', ar: 'استكشف مكتبة الألعاب' },
  'Browse all games': { en: 'Browse Game Library', ar: 'تصفح مكتبة الألعاب' },
  'See map': { en: 'Open Game Library', ar: 'افتح مكتبة الألعاب' },
  'View library': { en: 'View Game Library', ar: 'عرض مكتبة الألعاب' },
  'View all game worlds': { en: 'View Game Library', ar: 'عرض مكتبة الألعاب' },
  'Back to game library': { en: 'Back to Game Library', ar: 'العودة إلى مكتبة الألعاب' },
};
export const t = (copy: Copy, lang: Lang) => (gameLibraryCopy[copy.en] ?? copy)[lang];
const queryClient = new QueryClient();

type CharacterId = 'hanan' | 'hamdan';
type PlayerProfile = { name: string; age: string; role: string; avatar: string; character?: CharacterId; grade?: string; school?: string };
type PlayerRow = { name: string; initials: string; level: string; coins: number; progress: number; lastActive: string; tone: string };
type StoreItem = { id: string; name: Copy; description: Copy; cost: number; icon: string; tone: string };
type StoreState = PageStoreState;
type LocalSessionRecord = PageSession;
const playerCharacters: { id: CharacterId; name: Copy; role: Copy; image: string; tone: string }[] = [
  { id: 'hanan', name: { en: 'Hanan', ar: 'حنان' }, role: { en: 'Female character', ar: 'الشخصية الأنثوية' }, image: hananPath, tone: 'coral' },
  { id: 'hamdan', name: { en: 'Hamdan', ar: 'حمدان' }, role: { en: 'Male character', ar: 'الشخصية الذكورية' }, image: hamdanPath, tone: 'sky' },
];

const gameBlueprints = [
  { id: 'eco-future', title: { en: 'Clean Environment and Better Future', ar: 'بيئة نظيفة ومستقبل أفضل' }, eyebrow: { en: 'Ended', ar: 'انتهى' }, description: { en: 'Make small choices. Build a brighter Abu Dhabi.', ar: 'اختر بخطوات صغيرة وابنِ أبوظبي أكثر إشراقاً.' }, color: 'coral', icon: Leaf, playable: true },
  { id: 'heritage', title: { en: 'Our Heritage', ar: 'تراثنا' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Follow the stories that shaped our home.', ar: 'اكتشف القصص التي شكّلت وطننا.' }, color: 'sand', icon: Crown, playable: true },
  { id: 'color-focus', title: { en: 'Color Focus', ar: 'تركيز الألوان' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Train your eyes. Find the signal.', ar: 'درّب عينيك واعثر على الإشارة.' }, color: 'sky', icon: Sparkles, playable: true },
  { id: 'library-sort', title: { en: 'Library Sort', ar: 'ترتيب المكتبة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Put every story in its perfect place.', ar: 'ضع كل قصة في مكانها المناسب.' }, color: 'mint', icon: BookOpen, playable: true },
  { id: 'word-journey', title: { en: 'Word Journey', ar: 'رحلة الكلمات' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Travel through language, one word at a time.', ar: 'سافر عبر اللغة كلمة بعد كلمة.' }, color: 'violet', icon: Compass, playable: true },
  { id: 'basket-challenge', title: { en: 'Basket Challenge', ar: 'تحدي السلة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Aim high. Find your rhythm.', ar: 'صوّب عالياً واعثر على إيقاعك.' }, color: 'peach', icon: Trophy, playable: true },
  { id: 'healthy-restaurant', title: { en: 'Healthy Restaurant', ar: 'المطعم الصحي' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Create a menu that makes everyone feel good.', ar: 'صمّم قائمة تجعل الجميع يشعرون بالراحة.' }, color: 'lime', icon: Star, playable: true },
  { id: 'innovation-lab', title: { en: 'Innovation Lab', ar: 'مختبر الابتكار' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Turn curious ideas into useful things.', ar: 'حوّل الأفكار الفضولية إلى أشياء مفيدة.' }, color: 'blue', icon: Zap, playable: true },
  { id: 'numeracy-check', title: { en: 'Numeracy Check', ar: 'تحدي الحساب' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Run the maths marathon and beat the clock.', ar: 'اخض ماراثون الرياضيات وتغلب على الوقت.' }, color: 'violet', icon: BarChart3, playable: true },
  { id: 'bot-workshop', title: { en: 'Bot Workshop', ar: 'ورشة الروبوت' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Program a helpful bot one block at a time.', ar: 'برمج روبوتاً مفيداً خطوة برمجية بعد أخرى.' }, color: 'sky', icon: Gamepad2, playable: true },
  { id: 'truth-lab', title: { en: 'Truth Lab', ar: 'مختبر الحقيقة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Check claims, compare evidence, and reason well.', ar: 'تحقق من الادعاءات وقارن الأدلة وفكر جيداً.' }, color: 'sand', icon: CircleHelp, playable: true },
  { id: 'common-ground', title: { en: 'Common Ground', ar: 'أرض مشتركة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Share resources fairly and listen to every voice.', ar: 'شارك الموارد بعدل واستمع إلى كل صوت.' }, color: 'mint', icon: Users, playable: true },
  { id: 'spark-studio', title: { en: 'Spark Studio', ar: 'استوديو الشرارة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Turn surprising ideas into useful inventions.', ar: 'حوّل الأفكار المدهشة إلى اختراعات مفيدة.' }, color: 'coral', icon: Sparkles, playable: true },
] as const;

const demoPlayers: PlayerRow[] = [
  { name: 'Mariam Al Mansoori', initials: 'MA', level: 'Level 04', coins: 315, progress: 86, lastActive: 'Today, 09:42', tone: 'bg-[#f2c95c]' },
  { name: 'Omar Al Shamsi', initials: 'OA', level: 'Level 03', coins: 240, progress: 64, lastActive: 'Today, 08:16', tone: 'bg-[#9fcac0]' },
  { name: 'Hessa Al Kaabi', initials: 'HK', level: 'Level 02', coins: 155, progress: 47, lastActive: 'Yesterday', tone: 'bg-[#e99b7c]' },
  { name: 'Saif Al Nuaimi', initials: 'SN', level: 'Level 01', coins: 80, progress: 22, lastActive: 'Yesterday', tone: 'bg-[#aecbd8]' },
];

const storeItems: StoreItem[] = [
  { id: 'mangrove-badge', name: { en: 'Mangrove badge', ar: 'شارة القرم' }, description: { en: 'A leafy badge for careful choices.', ar: 'شارة خضراء للاختيارات الواعية.' }, cost: 40, icon: '🌿', tone: 'bg-[#b9d6c7]' },
  { id: 'desert-palette', name: { en: 'Desert palette', ar: 'لوحة الصحراء' }, description: { en: 'Warm colours for your player card.', ar: 'ألوان دافئة لبطاقة اللاعب.' }, cost: 80, icon: '🏜️', tone: 'bg-[#efe1bf]' },
  { id: 'future-builder', name: { en: 'Future builder trophy', ar: 'كأس صانع المستقبل' }, description: { en: 'A trophy for completing learning worlds.', ar: 'كأس لإكمال عوالم التعلّم.' }, cost: 140, icon: '🏆', tone: 'bg-[#f2c95c]' },
  { id: 'skyline-trail', name: { en: 'Skyline trail', ar: 'مسار الأفق' }, description: { en: 'A bright city trail for your collection.', ar: 'مسار مدينة مضيء لمجموعتك.' }, cost: 210, icon: '🌆', tone: 'bg-[#a9c7d8]' },
];

function hasAdminSession() {
  try { return sessionStorage.getItem('bunayn-admin-session') === 'true'; } catch { return false; }
}

function clearNamedPlayerProgress() {
  const keys = [
    'bunayn-eco-round', 'bunayn-eco-score', 'bunayn-coins', 'bunayn-eco-finished',
    'bunayn-basket-runner-progress', 'bunayn-store-state',
    ...gameBlueprints.filter((game) => game.id !== 'eco-future' && game.id !== 'basket-challenge').map((game) => `bunayn-signature-progress-${game.id}`),
    ...gameBlueprints.map((game) => `bunayn-game-progress-${game.id}`),
  ];
  try { keys.forEach((key) => localStorage.removeItem(key)); } catch { /* browser storage may be unavailable */ }
}

function useLocal<T>(key: string, initial: T) {
  const storageMode = () => {
    try { return sessionStorage.getItem('bunayn-guest-mode') === 'true' ? 'guest' : 'local'; } catch { return 'local'; }
  };
  const storageForMode = (mode: 'guest' | 'local') => mode === 'guest' ? sessionStorage : localStorage;
  const readValue = () => {
    try {
      const stored = storageForMode(storageMode()).getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch { return initial; }
  };
  const stateKey = `${storageMode()}:${key}`;
  const valueRef = useRef<{ key: string; value: T } | null>(null);
  if (!valueRef.current) valueRef.current = { key: stateKey, value: readValue() };
  const [stored, setStored] = useState<{ key: string; value: T }>(() => valueRef.current!);
  const value = stored.key === stateKey ? stored.value : readValue();
  const setValue = (next: T | ((previous: T) => T)) => {
    const mode = storageMode();
    const activeKey = `${mode}:${key}`;
    const current = valueRef.current?.key === activeKey ? valueRef.current.value : readValue();
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(current) : next;
    const updated = { key: activeKey, value: resolved };
    valueRef.current = updated;
    try { storageForMode(mode).setItem(key, JSON.stringify(resolved)); } catch { /* demo persistence can fail in private mode */ }
    setStored(updated);
  };
  useEffect(() => {
    if (stored.key !== stateKey) {
      const updated = { key: stateKey, value: readValue() };
      valueRef.current = updated;
      setStored(updated);
    }
  }, [stateKey, stored.key]);
  useEffect(() => {
    if (stored.key !== stateKey) return;
    try { storageForMode(storageMode()).setItem(key, JSON.stringify(stored.value)); } catch { /* demo persistence can fail in private mode */ }
  }, [key, stateKey, stored]);
  return [value, setValue] as const;
}

function usePlayerContentCycle() {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const age = Number.parseInt(profile?.age ?? '', 10);
  if (Number.isFinite(age)) {
    if (age >= 13) return 3;
    if (age >= 9) return 2;
    return 1;
  }
  return getContentCycle(profile?.grade);
}
function usePlayerSummary() {
  const [ecoRound] = useLocal<number>('bunayn-eco-round', 0);
  const [ecoScore] = useLocal<number>('bunayn-eco-score', 0);
  const [ecoCoins] = useLocal<number>('bunayn-coins', 120);
  const [ecoFinished] = useLocal<boolean>('bunayn-eco-finished', false);
  const [basket] = useLocal<RunnerProgress>('bunayn-basket-runner-progress', { level: 0, step: 0, lane: 1, collected: 0, score: 0, coins: 0, hearts: 3, timeLeft: 60, status: 'ready', jumping: false, sliding: false, message: { en: '', ar: '' } });
  const [heritage] = useLocal<SignatureProgress>('bunayn-signature-progress-heritage', { level: 0, score: 0, coins: 0, finished: false });
  const [colorFocus] = useLocal<SignatureProgress>('bunayn-signature-progress-color-focus', { level: 0, score: 0, coins: 0, finished: false });
  const [librarySort] = useLocal<SignatureProgress>('bunayn-signature-progress-library-sort', { level: 0, score: 0, coins: 0, finished: false });
  const [wordJourney] = useLocal<SignatureProgress>('bunayn-signature-progress-word-journey', { level: 0, score: 0, coins: 0, finished: false });
  const [healthyRestaurant] = useLocal<SignatureProgress>('bunayn-signature-progress-healthy-restaurant', { level: 0, score: 0, coins: 0, finished: false });
  const [innovationLab] = useLocal<SignatureProgress>('bunayn-signature-progress-innovation-lab', { level: 0, score: 0, coins: 0, finished: false });
  const [numeracyCheck] = useLocal<SignatureProgress>('bunayn-signature-progress-numeracy-check', { level: 0, score: 0, coins: 0, finished: false });
  const [botWorkshop] = useLocal<SignatureProgress>('bunayn-signature-progress-bot-workshop', { level: 0, score: 0, coins: 0, finished: false });
  const [truthLab] = useLocal<SignatureProgress>('bunayn-signature-progress-truth-lab', { level: 0, score: 0, coins: 0, finished: false });
  const [commonGround] = useLocal<SignatureProgress>('bunayn-signature-progress-common-ground', { level: 0, score: 0, coins: 0, finished: false });
  const [sparkStudio] = useLocal<SignatureProgress>('bunayn-signature-progress-spark-studio', { level: 0, score: 0, coins: 0, finished: false });
  const [storeState, setStoreState] = useLocal<StoreState>('bunayn-store-state', { purchases: [], spentPoints: 0 });
  const [sessionHistory] = useLocal<LocalSessionRecord[]>('bunayn-session-history', []);

  const worlds = [
    { id: 'eco-future', level: ecoRound, target: rounds.length, finished: ecoFinished, score: ecoScore, coins: ecoCoins },
    { id: 'heritage', ...heritage, target: 3 },
    { id: 'color-focus', ...colorFocus, target: 3 },
    { id: 'library-sort', ...librarySort, target: 3 },
    { id: 'word-journey', ...wordJourney, target: 3 },
    { id: 'basket-challenge', level: basket.level, target: 3, finished: basket.status === 'finished', score: basket.score, coins: basket.coins },
    { id: 'healthy-restaurant', ...healthyRestaurant, target: 3 },
    { id: 'innovation-lab', ...innovationLab, target: 3 },
    { id: 'numeracy-check', ...numeracyCheck, target: 3 },
    { id: 'bot-workshop', ...botWorkshop, target: 3 },
    { id: 'truth-lab', ...truthLab, target: 3 },
    { id: 'common-ground', ...commonGround, target: 3 },
    { id: 'spark-studio', ...sparkStudio, target: 3 },
  ];
  const completed = worlds.filter((world) => world.finished).length;
  const nextWorld = worlds.find((world) => !world.finished) ?? worlds[0];
  const nextGame = gameBlueprints.find((game) => game.id === nextWorld.id) ?? gameBlueprints[0];
  const points = worlds.reduce((total, world) => total + world.score, 0);
  const earnedCoins = worlds.reduce((total, world) => total + world.coins, 0);

  return {
    worlds,
    completed,
    totalWorlds: worlds.length,
    completionPercent: Math.round((completed / worlds.length) * 100),
    nextWorld,
    nextGame,
    points,
    earnedCoins,
    availablePoints: Math.max(0, earnedCoins - storeState.spentPoints),
    purchases: storeState.purchases,
    setStoreState,
    sessionHistory,
  };
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
    <img src={logoPath} alt="Bunayn AD — a world of knowledge" className={`${compact ? 'h-10 w-[116px]' : 'h-12 w-[138px]'} object-contain`} />
    {!compact && <span className="hidden border-s border-[#d9cbb4] ps-3 sm:block"><span className="block font-display text-[13px] font-bold tracking-[.08em] text-[#174b44]">PLAY FOR TOMORROW</span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-[#8b7760]">Abu Dhabi learning games</span></span>}
  </Link>;
}

function useElapsedGameTimer(gameId: string, finished: boolean, paused = false) {
  const [seconds, setSeconds] = useState(0);
  const wasFinished = useRef(finished);
  useEffect(() => {
    if (wasFinished.current && !finished) setSeconds(0);
    wasFinished.current = finished;
  }, [finished]);
  useEffect(() => {
    setSeconds(0);
  }, [gameId]);
  useEffect(() => {
    if (finished || paused) return;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [finished, gameId, paused]);
  return seconds;
}

function GameTimer({ gameId, lang, finished, paused = false }: { gameId: string; lang: Lang; finished: boolean; paused?: boolean }) {
  const seconds = useElapsedGameTimer(gameId, finished, paused);
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return <div className="flex items-center gap-1.5 rounded-full border border-[#c7ded1] bg-white px-3 py-2 text-sm font-bold text-[#174b44]" aria-label={t({ en: `Play time ${minutes}:${remainingSeconds}`, ar: `وقت اللعب ${minutes}:${remainingSeconds}` }, lang)}>
    <Clock3 className="h-4 w-4 text-[#16a7bc]" />
    <span className="text-[10px] uppercase tracking-[.1em] text-[#688079]">{t({ en: 'Time', ar: 'الوقت' }, lang)}</span>
    <span data-testid={`text-${gameId}-timer`} dir="ltr">{minutes}:{remainingSeconds}</span>
    {paused && <span className="sr-only">{t({ en: 'paused', ar: 'متوقف مؤقتاً' }, lang)}</span>}
  </div>;
}

function Shell({ children, lang, setLang }: { children: ReactNode; lang: Lang; setLang: (lang: Lang) => void }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const savedProfile = (() => {
    try {
      const storage = sessionStorage.getItem('bunayn-guest-mode') === 'true' ? sessionStorage : localStorage;
      return JSON.parse(storage.getItem('bunayn-player-profile') || 'null') as PlayerProfile | null;
    } catch { return null; }
  })();
  const activeProfile = savedProfile || profile;
  const isAdmin = hasAdminSession();
  const isDarkSurface = ['/player'].some((path) => location.startsWith(path));
  const isActive = (path: string) => location === path;
  const initials = activeProfile?.avatar || activeProfile?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'GU';
  const activeCharacter = playerCharacters.find((character) => character.id === activeProfile?.character);
  const nav: { href: string; label: Copy; id: string; children?: { href: string; label: Copy }[] }[] = [
    { href: '/', label: { en: 'Home', ar: 'الرئيسية' }, id: 'home' },
    { href: '/library', label: { en: 'Game Library', ar: 'مكتبة الألعاب' }, id: 'library' },
    { href: '/games', label: { en: 'Games', ar: 'الألعاب' }, id: 'games', children: [
      { href: '/games', label: { en: 'Framework', ar: 'الإطار' } },
      { href: '/games/request', label: { en: 'Request a game', ar: 'اطلب لعبة' } },
    ] },
    { href: '/store', label: { en: 'Store', ar: 'المتجر' }, id: 'store' },
    { href: '/progress', label: { en: 'My Progress', ar: 'تقدمي' }, id: 'progress' },
  ];
  if (isAdmin) nav.push({ href: '/admin', label: { en: 'Dashboard', ar: 'لوحة المتابعة' }, id: 'admin' });
  const useHomePageTheme = ['/library', '/store', '/progress'].some((path) => location.startsWith(path));
  return <div className={`app-noise min-h-[100dvh] ${useHomePageTheme ? 'bunayn-home-page' : ''} ${isDarkSurface ? 'bg-[#0b0f1a]' : 'bg-[#e8f4fa]'}`}>
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${isDarkSurface ? 'border-[#24334f]/90 bg-[#0b0f1a]/95' : 'border-[#d6e2e9]/90 bg-[#e8f4fa]/95'}`}>
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <Logo />
        <nav className={`hidden items-center gap-1 rounded-full border p-1 md:flex ${isDarkSurface ? 'border-[#293850] bg-[#111a2c]' : 'border-[#d6e2e9] bg-white/70'}`} aria-label="Main navigation">
          {nav.map((item) => {
            const active = isActive(item.href) || (item.id === 'games' && location.startsWith('/games'));
            const itemClass = `rounded-full px-4 py-2 text-sm font-semibold transition ${active ? (isDarkSurface ? 'bg-[#c9a227] text-[#0b0f1a]' : 'bg-[#2140a8] text-white shadow-sm') : (isDarkSurface ? 'text-[#b8c4d4] hover:bg-[#1a2740] hover:text-[#f6d66b]' : 'text-[#5f737c] hover:bg-[#e7f8fb] hover:text-[#0b6a79]')}`;
            return item.children ? <div key={item.href} className="group relative">
              <Link href={item.href} className={`inline-flex items-center gap-1 ${itemClass}`} data-testid={`link-nav-${item.id}`} aria-haspopup="true">{t(item.label, lang)} <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></Link>
              <div className="pointer-events-none invisible absolute end-0 top-full z-50 w-52 pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                <div className={`rounded-2xl border p-2 shadow-float ${isDarkSurface ? 'border-[#293850] bg-[#111a2c]' : 'border-[#d6e2e9] bg-white'}`}>
                  {item.children.map((child) => <Link key={child.href} href={child.href} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${isDarkSurface ? 'text-[#b8c4d4] hover:bg-[#1a2740] hover:text-[#f6d66b]' : 'text-[#5f737c] hover:bg-[#e7f8fb] hover:text-[#0b6a79]'}`}>{t(child.label, lang)}</Link>)}
                </div>
              </div>
            </div> : <Link key={item.href} href={item.href} className={itemClass} data-testid={`link-nav-${item.id}`}>{t(item.label, lang)}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className={`hidden items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition sm:flex ${isDarkSurface ? 'border-[#293850] bg-[#111a2c] text-[#69d2bd] hover:border-[#16a7bc]' : 'border-[#d6e2e9] bg-white/80 text-[#0b6a79] hover:border-[#16a7bc]'}`} data-testid="button-language">
            <Globe2 className="h-4 w-4" /> {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <Link href={activeProfile ? '/progress' : '/login'} className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#f4b60b] font-display text-sm font-bold shadow-sm ${isDarkSurface ? 'bg-[#302a16] text-[#f6d66b]' : 'bg-[#e7f8fb] text-[#2140a8]'}`} data-testid="link-player-profile" aria-label={activeProfile ? t({ en: `Open ${activeProfile.name}'s player profile`, ar: `افتح ملف اللاعب ${activeProfile.name}` }, lang) : t({ en: 'Open player login', ar: 'افتح دخول اللاعب' }, lang)}>
            {activeCharacter ? <img src={activeCharacter.image} alt="" className="h-full w-full scale-[1.34] object-cover object-top" /> : initials}
          </Link>
          <button onClick={() => setMenuOpen((open) => !open)} className={`rounded-full p-2 md:hidden ${isDarkSurface ? 'text-[#f6d66b]' : 'text-[#2140a8]'}`} aria-label="Open menu" data-testid="button-menu"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      {menuOpen && <div className={`border-t px-5 py-4 md:hidden ${isDarkSurface ? 'border-[#293850] bg-[#111a2c]' : 'border-[#d6e2e9] bg-[#e8f4fa]'}`}><div className="flex flex-col gap-1">
        {nav.map((item) => item.children ? <div key={item.href}>
          <button type="button" onClick={() => setGamesOpen((open) => !open)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-start font-semibold ${isDarkSurface ? 'text-[#f6d66b]' : 'text-[#2140a8]'}`} aria-expanded={gamesOpen} data-testid="button-mobile-games">{t(item.label, lang)} <ChevronDown className={`h-4 w-4 transition-transform ${gamesOpen ? 'rotate-180' : ''}`} /></button>
          {gamesOpen && <div className="ms-4 flex flex-col border-s-2 border-[#a9c7d8] ps-3">
            {item.children.map((child) => <Link key={child.href} href={child.href} onClick={() => { setMenuOpen(false); setGamesOpen(false); }} className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${isDarkSurface ? 'text-[#b8c4d4]' : 'text-[#557068]'}`} data-testid={`link-mobile-games-${child.href.endsWith('request') ? 'request' : 'framework'}`}>{t(child.label, lang)}</Link>)}
          </div>}
        </div> : <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`rounded-xl px-3 py-3 font-semibold ${isDarkSurface ? 'text-[#f6d66b]' : 'text-[#2140a8]'}`} data-testid={`link-mobile-${item.id}`}>{t(item.label, lang)}</Link>)}
        <button onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setMenuOpen(false); }} className={`rounded-xl px-3 py-3 text-start font-semibold ${isDarkSurface ? 'text-[#69d2bd]' : 'text-[#2140a8]'}`} data-testid="button-mobile-language">{lang === 'en' ? 'العربية' : 'English'}</button>
      </div></div>}
    </header>
    <main dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</main>
    <footer className="border-t border-[#16a7bc] bg-[#0b6a79] px-5 py-10 text-white lg:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div><Logo compact /><p className="mt-4 max-w-sm text-sm leading-relaxed text-[#d7f0f5]">{t({ en: 'A digital playground from Abu Dhabi for curious minds, thoughtful choices, and the people shaping tomorrow.', ar: 'ملعب رقمي من أبوظبي للعقول الفضولية والاختيارات الواعية والأشخاص الذين يصنعون الغد.' }, lang)}</p></div>
        <div className="text-sm text-[#cfe9f7]"><p>© 2026 Bunayn AD</p><p className="mt-1">Learning through play.</p></div>
      </div>
    </footer>
  </div>;
}

function Landscape({ large = false }: { large?: boolean }) {
  return <div className={`abu-landscape relative grid place-items-center overflow-hidden rounded-[28px] bg-[#dff0f5] ${large ? 'min-h-[330px] sm:min-h-[430px]' : 'min-h-[190px]'}`} aria-label="Bunayn AD logo">
    <div className="absolute -end-16 -top-16 h-64 w-64 rounded-full bg-[#f2c95c]/80 blur-[1px]" />
    <div className="absolute -bottom-24 -start-16 h-64 w-[130%] rounded-[50%] bg-[#c6dfd3]/70" />
    <img src={logoPath} alt="Bunayn AD — a world of knowledge" className="relative z-10 w-[min(78%,460px)] object-contain drop-shadow-[0_12px_20px_rgba(23,75,68,.14)]" />
  </div>;
}

function LoginSkyline() {
  return <svg className="login-skyline" viewBox="0 0 1440 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <pattern id="login-studs" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="7.5" fill="rgba(255,255,255,.34)" stroke="rgba(0,0,0,.07)" strokeWidth="1.5" /></pattern>
      <pattern id="login-plate" width="58" height="58" patternUnits="userSpaceOnUse"><circle cx="29" cy="16" r="9" fill="#d2dfe6" stroke="rgba(255,255,255,.8)" strokeWidth="2" /></pattern>
    </defs>
    <g opacity=".98">
      <rect x="70" y="200" width="70" height="130" rx="4" fill="#16a7bc" /><rect x="78" y="150" width="54" height="54" rx="4" fill="#f4b60b" />
      <rect x="146" y="120" width="70" height="210" rx="4" fill="#d8232a" /><rect x="232" y="178" width="58" height="152" rx="4" fill="#2140a8" />
      <rect x="312" y="190" width="15" height="140" rx="6" fill="#fff" /><rect x="464" y="190" width="15" height="140" rx="6" fill="#fff" />
      <rect x="330" y="250" width="132" height="80" rx="5" fill="#fff" /><circle cx="346" cy="258" r="23" fill="#fff" /><circle cx="446" cy="258" r="23" fill="#fff" /><circle cx="396" cy="246" r="43" fill="#fff" />
      <path d="M516 330 552 330 598 142 566 134Z" fill="#2140a8" /><rect x="632" y="110" width="80" height="220" rx="4" fill="#f4b60b" /><rect x="646" y="84" width="52" height="28" rx="4" fill="#16a7bc" />
      <circle cx="790" cy="224" r="84" fill="#16a7bc" /><rect x="762" y="300" width="18" height="30" fill="#16a7bc" /><rect x="800" y="300" width="18" height="30" fill="#16a7bc" />
      <rect x="900" y="176" width="52" height="154" rx="4" fill="#2140a8" /><circle cx="926" cy="156" r="27" fill="#d8232a" /><rect x="990" y="185" width="64" height="145" rx="4" fill="#d8232a" /><rect x="998" y="145" width="48" height="44" rx="4" fill="#16a7bc" />
      <rect x="1070" y="210" width="58" height="120" rx="4" fill="#f4b60b" /><rect x="1142" y="140" width="72" height="190" rx="4" fill="#2140a8" /><rect x="1230" y="225" width="52" height="105" rx="4" fill="#16a7bc" /><rect x="1296" y="175" width="80" height="155" rx="4" fill="#d8232a" /><rect x="1306" y="138" width="60" height="40" rx="4" fill="#f4b60b" />
    </g>
    <rect x="0" y="60" width="1440" height="280" fill="url(#login-studs)" opacity=".72" />
    <g stroke="rgba(255,255,255,.45)" strokeWidth="2"><circle cx="92" cy="150" r="9" fill="#f4b60b" /><circle cx="124" cy="150" r="9" fill="#f4b60b" /><circle cx="166" cy="120" r="9" fill="#d8232a" /><circle cx="198" cy="120" r="9" fill="#d8232a" /><circle cx="656" cy="84" r="9" fill="#16a7bc" /><circle cx="682" cy="84" r="9" fill="#16a7bc" /><circle cx="1006" cy="145" r="9" fill="#16a7bc" /><circle cx="1038" cy="145" r="9" fill="#16a7bc" /><circle cx="1316" cy="138" r="9" fill="#f4b60b" /><circle cx="1354" cy="138" r="9" fill="#f4b60b" /></g>
    <rect y="330" width="1440" height="50" fill="#e5edf1" /><rect y="330" width="1440" height="50" fill="url(#login-plate)" />
  </svg>;
}

function Welcome({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const [traceFocused, setTraceFocused] = useState(false);
  const homeCopy = (copy: Copy) => copy[lang];
  const scrollToTrace = () => {
    const trace = document.getElementById('trace');
    if (trace) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      trace.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      setTraceFocused(true);
      trace.focus({ preventScroll: true });
    }
  };

  return <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#e8f4fa] font-sans text-[#174b44]">
    <div className="sci-grid fixed inset-0 pointer-events-none opacity-70" aria-hidden="true" />
    <div className="home-orb home-orb-yellow absolute -end-24 top-24 h-72 w-72 rounded-full sm:h-96 sm:w-96" aria-hidden="true" />
    <div className="home-orb home-orb-coral absolute -start-24 top-[42%] h-64 w-64 rounded-full sm:h-80 sm:w-80" aria-hidden="true" />

    <header className="relative z-20 flex items-center justify-between border-b border-[#d6e2e9] bg-[#e8f4fa]/85 px-5 py-4 backdrop-blur-md sm:px-10">
      <Link href="/" className="rounded-xl" data-testid="link-home-logo">
        <img src={logoPath} alt={homeCopy({ en: 'Bunayn AD — a world of knowledge', ar: 'بنيان أبوظبي — عالم من المعرفة' })} className="h-12 w-[140px] object-contain sm:h-14 sm:w-[165px]" />
      </Link>
      <nav className="flex items-center gap-2 text-sm font-bold sm:gap-5" aria-label={homeCopy({ en: 'Main navigation', ar: 'التنقل الرئيسي' })}>
        <Link href="/library" className="rounded-full px-2 py-2 text-[#2140a8] transition hover:bg-white hover:text-[#0b6a79]" data-testid="link-home-library">{homeCopy({ en: 'Game Library', ar: 'مكتبة الألعاب' })}</Link>
        <Link href="/login" className="hidden rounded-full bg-[#e8755f] px-4 py-2 text-white shadow-[0_3px_0_#b85c4e] transition hover:-translate-y-0.5 sm:inline-flex" data-testid="link-home-login">{homeCopy({ en: 'Player Login', ar: 'دخول اللاعب' })}</Link>
        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="rounded-full border border-[#a9c7d8] bg-white/75 px-3 py-2 text-xs font-extrabold text-[#0b6a79] transition hover:border-[#16a7bc] hover:bg-white" data-testid="button-home-language" aria-label={homeCopy({ en: 'Switch language', ar: 'تغيير اللغة' })}>{lang === 'en' ? 'العربية' : 'English'}</button>
      </nav>
    </header>

    <main className="relative z-10">
      <section className="mx-auto grid min-h-[calc(100dvh-81px)] max-w-[1440px] items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-20">
        <div className="reveal text-center lg:text-start">
          <p className="mb-5 inline-flex rounded-full border border-[#b9d6c7] bg-[#e6f1eb] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#33705f]">{homeCopy({ en: 'A NEW WAY TO COLLECT DATA', ar: 'طريقة جديدة لجمع البيانات' })}</p>
          <h1 className="home-hero-title max-w-3xl font-display text-[clamp(2.8rem,6.5vw,6.4rem)] font-bold leading-[.94] tracking-[-.055em] text-[#174b44] text-balance">{homeCopy({ en: 'Play. Discover. Learn. Start a Knowledge Quest.', ar: 'العب. اكتشف. تعلّم. ابدأ رحلة من المعرفة.' })}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[#557068] text-balance lg:mx-0 sm:text-xl">{homeCopy({ en: 'Play opens the door to discovery: each choice helps us collect meaningful data and begin a journey of knowledge.', ar: 'تعلّم و ابدأ رحلة من المعرفة: كل اختيار يفتح باباً جديداً للاكتشاف.' })}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <button onClick={scrollToTrace} className="group inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-6 py-3.5 font-bold text-white shadow-[0_6px_0_#152c79] transition hover:-translate-y-1 active:translate-y-1" aria-label={homeCopy({ en: 'Learn how Bunayn gathers data', ar: 'تعرّف كيف يجمع بنيان البيانات' })} data-testid="button-how-it-works">
              {homeCopy({ en: 'How it works', ar: 'كيف نعمل' })} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </button>
            <Link href="/library" className="inline-flex items-center gap-2 rounded-full border-2 border-[#33705f] bg-white/75 px-5 py-3 font-bold text-[#174b44] transition hover:-translate-y-0.5 hover:bg-white" data-testid="link-home-play">
              {homeCopy({ en: 'Play and explore', ar: 'العب واكتشف' })} <Gamepad2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="reveal reveal-delay-1 relative mx-auto w-full max-w-[540px]">
          <div className="relative overflow-hidden rounded-[38px] border-4 border-white/80 bg-[#dff0f5] px-6 pb-9 pt-10 shadow-[0_24px_0_rgba(33,64,168,.12),0_30px_70px_rgba(23,75,68,.16)] sm:px-10">
            <div className="absolute -end-12 -top-12 h-40 w-40 rounded-full bg-[#f4b60b]" />
            <div className="absolute -bottom-24 -start-20 h-56 w-[130%] rounded-[50%] bg-[#b9d6c7]" />
            <div className="absolute bottom-0 end-0 h-28 w-40 rounded-tl-[100%] bg-[#e8755f]/75" />
            <img src={logoPath} alt="" className="relative z-10 mx-auto w-[min(90%,390px)] object-contain drop-shadow-[0_14px_16px_rgba(23,75,68,.2)]" />
            <div className="relative z-10 mx-auto mt-7 grid max-w-sm grid-cols-2 gap-2 text-center text-xs font-bold text-[#174b44] sm:max-w-none sm:grid-cols-4" aria-label={homeCopy({ en: 'Knowledge quest steps', ar: 'مراحل رحلة المعرفة' })}>
              {[
                { label: { en: 'Play', ar: 'العب' }, icon: Gamepad2, color: 'bg-[#f4b60b]' },
                { label: { en: 'Discover', ar: 'اكتشف' }, icon: Compass, color: 'bg-[#16a7bc]' },
                { label: { en: 'Learn', ar: 'تعلّم' }, icon: BookOpen, color: 'bg-[#d8232a]' },
                { label: { en: 'Start a Knowledge Quest', ar: 'ابدأ رحلة من المعرفة' }, icon: Lightbulb, color: 'bg-[#2140a8]' },
              ].map((item) => { const Icon = item.icon; return <div key={item.label.en} title={homeCopy(item.label)} aria-label={homeCopy(item.label)} className={`grid min-h-[58px] place-items-center rounded-2xl ${item.color} px-2 py-2.5 text-white shadow-sm`}><Icon className="h-7 w-7" aria-hidden="true" /><span className="sr-only">{homeCopy(item.label)}</span></div>; })}
            </div>
          </div>
          <div className="absolute -bottom-5 -start-3 rounded-2xl border-2 border-white bg-[#fff3cc] px-4 py-3 shadow-soft sm:-start-7"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#b35d4c]">{homeCopy({ en: 'The new method', ar: 'الطريقة الجديدة' })}</p><p className="mt-1 font-display font-bold text-[#174b44]">{homeCopy({ en: 'From play to knowledge', ar: 'من اللعب إلى المعرفة' })}</p></div>
        </div>
      </section>

      <section id="trace" tabIndex={-1} onBlur={() => setTraceFocused(false)} style={traceFocused ? { outline: '3px solid #d8232a', outlineOffset: '8px' } : undefined} className="relative mx-auto max-w-[1440px] px-5 py-20 outline-none sm:px-10 sm:py-28">
        <div className="grid gap-8 rounded-[32px] border border-[#c7ded1] bg-white/85 p-7 shadow-soft sm:p-10 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:p-14">
          <div className="reveal"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#d8232a]">{homeCopy({ en: 'From play to insight', ar: 'من اللعب إلى الفهم' })}</p><h2 className="mt-3 font-display text-4xl font-bold leading-tight text-[#174b44] text-balance sm:text-5xl">{homeCopy({ en: 'Every game is a decision made under pressure.', ar: 'كل لعبة قرار يُتخذ تحت الضغط.' })}</h2></div>
          <p className="reveal reveal-delay-1 text-lg leading-relaxed text-[#557068] sm:text-xl">{homeCopy({ en: 'What to risk, when to wait, how to recover from a mistake, whether to cooperate or compete. Those decisions leave a trace. Our fun games capture timing, hesitation, error correction, persistence after failure, and strategy shifts — turning natural play into structured behavioral data.', ar: 'ماذا نخاطر به، ومتى ننتظر، وكيف نتعافى من الخطأ، وهل نتعاون أم نتنافس. تترك هذه القرارات أثراً. تلتقط ألعابنا الممتعة التوقيت والتردد وتصحيح الأخطاء والاستمرار بعد الفشل وتغيّر الاستراتيجيات، فتحوّل اللعب الطبيعي إلى بيانات سلوكية منظمة.' })}</p>
        </div>
      </section>

      <section className="border-y border-[#c7ded1] bg-[#dff0f5] px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="behavior-heading">
        <div className="mx-auto grid max-w-[1180px] gap-5 md:grid-cols-2">
          <div className="reveal rounded-[28px] bg-[#2140a8] p-7 text-white sm:p-10"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f4b60b]">{homeCopy({ en: 'Self-report', ar: 'التقرير الذاتي' })}</p><h2 id="behavior-heading" className="mt-3 font-display text-3xl font-bold text-balance">{homeCopy({ en: 'What people say is only one part of the story.', ar: 'ما يقوله الناس جزء واحد فقط من القصة.' })}</h2><p className="mt-5 leading-relaxed text-[#d7f0f5]">{homeCopy({ en: 'Surveys depend on memory, mood, and how someone wants to be seen.', ar: 'تعتمد الاستبيانات على الذاكرة والمزاج والصورة التي يريد الشخص أن يظهر بها.' })}</p></div>
          <div className="reveal reveal-delay-1 rounded-[28px] bg-[#e8755f] p-7 text-white sm:p-10"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#fff3cc]">{homeCopy({ en: 'Behavior in play', ar: 'السلوك أثناء اللعب' })}</p><h2 className="mt-3 font-display text-3xl font-bold text-balance">{homeCopy({ en: 'Fun makes the signal natural.', ar: 'المتعة تجعل الإشارة طبيعية.' })}</h2><p className="mt-5 leading-relaxed text-[#fff4df]">{homeCopy({ en: 'A player absorbed in a game does not decide to appear patient on move forty. They simply act — and that pattern is the signal.', ar: 'لا يقرر اللاعب المنغمس في اللعبة أن يبدو صبوراً في الحركة الأربعين. إنه يتصرف ببساطة، وهذا النمط هو الإشارة.' })}</p></div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-10 sm:py-28" aria-labelledby="measures-heading">
        <div className="reveal"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0b6a79]">{homeCopy({ en: 'What the games reveal', ar: 'ما تكشفه الألعاب' })}</p><h2 id="measures-heading" className="mt-3 font-display text-4xl font-bold text-[#174b44] sm:text-5xl">{homeCopy({ en: 'What gameplay gives us', ar: 'ماذا يمنحنا اللعب' })}</h2></div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              { label: { en: 'Risk appetite', ar: 'الرغبة في المخاطرة' }, desc: { en: 'How much certainty is required to act.', ar: 'مقدار اليقين المطلوب لاتخاذ القرار.' }, color: 'border-t-[#d8232a]' },
              { label: { en: 'Learning rate', ar: 'سرعة التعلّم' }, desc: { en: 'How quickly a player adapts.', ar: 'سرعة تكيف اللاعب مع التغيير.' }, color: 'border-t-[#16a7bc]' },
              { label: { en: 'Attention stability', ar: 'ثبات الانتباه' }, desc: { en: 'Focus across a longer challenge.', ar: 'التركيز خلال التحدي.' }, color: 'border-t-[#f4b60b]' },
              { label: { en: 'Response to setback', ar: 'الاستجابة للعقبات' }, desc: { en: 'What happens after a mistake.', ar: 'ما يحدث بعد الخطأ.' }, color: 'border-t-[#e8755f]' },
              { label: { en: 'Planning horizon', ar: 'أفق التخطيط' }, desc: { en: 'Short-term choice or long-term view.', ar: 'اختيار قصير المدى أم رؤية بعيدة.' }, color: 'border-t-[#2140a8]' },
              { label: { en: 'Social orientation', ar: 'التوجه الاجتماعي' }, desc: { en: 'How people cooperate and share.', ar: 'كيف يتعاون الناس ويتشاركون.' }, color: 'border-t-[#71a695]' },
            ].map((item) => <article key={item.label.en} className={`group rounded-[22px] border border-[#d6e2e9] border-t-4 ${item.color} bg-white p-6 shadow-soft transition hover:-translate-y-1`}><h3 className="font-display text-xl font-bold text-[#174b44]">{homeCopy(item.label)}</h3><p className="mt-2 text-sm leading-relaxed text-[#688079]">{homeCopy(item.desc)}</p></article>)}
          </div>
          <p className="mx-auto mt-12 max-w-3xl text-center font-display text-xl font-bold leading-relaxed text-[#33705f] text-balance sm:text-2xl">{homeCopy({ en: 'Captured continuously — not at a single point in time, and free of language and cultural bias.', ar: 'نلتقطها باستمرار، لا في لحظة واحدة، وبعيداً عن التحيز.' })}</p>
        </div>
      </section>

      <section className="bg-[#174b44] px-5 py-20 text-center text-white sm:px-10 sm:py-28">
        <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight text-balance sm:text-6xl">{homeCopy({ en: 'A world of knowledge starts with data… and data can start with a game!', ar: 'عالم من المعرفة يبدأ بالبيانات... والبيانات قد تبدأ بلعبة!' })}</h2>
        <p className="mt-6 font-display text-xl font-bold text-[#f4b60b]">{homeCopy({ en: 'Bunayn AD — Games in. Insight out.', ar: 'بنيان أبوظبي — ألعاب ممتعة، وفهم أعمق.' })}</p>
      </section>
    </main>

    <footer className="border-t-4 border-[#16a7bc] bg-[#0b6a79] px-5 py-8 text-white sm:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
        <img src={logoPath} alt={homeCopy({ en: 'Bunayn AD — a world of knowledge', ar: 'بنيان أبوظبي — عالم من المعرفة' })} className="h-10 w-[120px] object-contain" />
        <p className="text-sm font-semibold text-[#d7f0f5]">{homeCopy({ en: 'Bunayn AD · Abu Dhabi, UAE', ar: 'بنيان أبوظبي · أبوظبي، الإمارات' })}</p>
      </div>
    </footer>
  </div>;
}

const playerAges = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];
const playerGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const playerSchools = ['Al Mushrif School', 'Al Bateen Academy', 'Al Yasmina Academy', 'Al Muna Academy', 'Emirates National School', 'Abu Dhabi Grammar School', 'Cranleigh Abu Dhabi', 'GEMS American Academy Abu Dhabi'];

function Login({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const [, setLocation] = useLocation();
  const [, setProfile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) { setError(t({ en: 'Type your name to start.', ar: 'اكتب اسمك للبدء.' }, lang)); return; }
    if (!age) { setError(t({ en: 'Pick your age.', ar: 'اختر عمرك.' }, lang)); return; }
    if (!grade) { setError(t({ en: 'Pick your grade.', ar: 'اختر صفك.' }, lang)); return; }
    if (!school.trim()) { setError(t({ en: 'Type or choose your school.', ar: 'اكتب أو اختر مدرستك.' }, lang)); return; }
    const cleanName = name.trim();
    try {
      const previousProfile = JSON.parse(localStorage.getItem('bunayn-player-profile') || 'null') as PlayerProfile | null;
      if (!previousProfile || previousProfile.name !== cleanName) clearNamedPlayerProgress();
      sessionStorage.removeItem('bunayn-guest-mode');
      sessionStorage.removeItem('bunayn-player-profile');
      sessionStorage.removeItem('bunayn-admin-session');
    } catch { /* browser storage may be unavailable */ }
    setProfile({ name: cleanName, age, grade, school: school.trim(), role: 'Player', avatar: cleanName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() });
    setLocation('/library');
  };
  const playAsGuest = () => {
    if (!age) { setError(t({ en: 'Pick your age first.', ar: 'اختر عمرك أولاً.' }, lang)); return; }
    try {
      sessionStorage.setItem('bunayn-guest-mode', 'true');
      sessionStorage.setItem('bunayn-player-profile', JSON.stringify({ name: 'Guest Player', age, role: 'Guest', avatar: 'GP' } satisfies PlayerProfile));
      sessionStorage.removeItem('bunayn-admin-session');
    } catch { /* session storage may be unavailable */ }
    setLocation('/library');
  };
  return <div className="login-page relative isolate min-h-[calc(100dvh-78px)] overflow-hidden">
    <div className="login-glow" aria-hidden="true" />
    <div className="login-stage relative z-10">
      <div className="login-language" role="group" aria-label="Language">
        <button type="button" onClick={() => setLang('en')} aria-pressed={lang === 'en'}>{'English'}</button>
        <button type="button" onClick={() => setLang('ar')} aria-pressed={lang === 'ar'}>{'العربية'}</button>
      </div>
      <Link href="/" className="login-logo-link" data-testid="link-login-logo"><img src={logoPath} alt="بنيان أبوظبي — عالم من المعرفة" className="login-logo" /></Link>
      <form onSubmit={submit} className="login-card" data-testid="form-player-login">
        <div className="login-brick-strip" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="login-card-body">
          <Link href="/" className="login-back" data-testid="link-login-back"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to welcome', ar: 'العودة للترحيب' }, lang)}</Link>
          <h1>{t({ en: 'Let’s build!', ar: 'هيا نبني!' }, lang)}</h1>
          <p className="login-subtitle">{t({ en: 'Tell us your name, age, grade and school — then jump in. No password needed.', ar: 'اكتب اسمك وعمرك وصفك ومدرستك، ثم ابدأ. لا حاجة لكلمة مرور.' }, lang)}</p>
          <div className="login-field">
            <label htmlFor="player-name">{t({ en: 'Your name', ar: 'الاسم' }, lang)}</label>
            <input id="player-name" type="text" maxLength={24} autoComplete="given-name" autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder={t({ en: 'Salem', ar: 'سالم' }, lang)} data-testid="input-player-name" />
          </div>
          <fieldset className="login-field">
            <legend className="login-label">{t({ en: 'Your age', ar: 'العمر' }, lang)}</legend>
            <div className="login-pills" data-testid="group-player-age">{playerAges.map((value) => <label key={value} className={`login-pill ${age === value ? 'is-selected' : ''}`}><input type="radio" name="player-age" value={value} checked={age === value} onChange={() => { setAge(value); setError(''); }} data-testid={`button-age-${value}`} /><span>{value}</span></label>)}</div>
          </fieldset>
          <fieldset className="login-field">
            <legend className="login-label">{t({ en: 'Your grade', ar: 'الصف الدراسي' }, lang)}</legend>
            <div className="login-pills" data-testid="group-player-grade">{playerGrades.map((value) => <label key={value} className={`login-pill login-pill-grade ${grade === value ? 'is-selected' : ''}`}><input type="radio" name="player-grade" value={value} checked={grade === value} onChange={() => { setGrade(value); setError(''); }} data-testid={`button-grade-${value}`} /><span>{value}</span></label>)}</div>
          </fieldset>
          <div className="login-field">
            <label htmlFor="player-school">{t({ en: 'Your school', ar: 'المدرسة' }, lang)}</label>
            <input id="player-school" type="text" list="player-schools" maxLength={60} autoComplete="organization" value={school} onChange={(event) => { setSchool(event.target.value); setError(''); }} placeholder={t({ en: 'Start typing your school name', ar: 'اكتب اسم مدرستك' }, lang)} data-testid="input-player-school" />
            <datalist id="player-schools">{playerSchools.map((schoolName) => <option key={schoolName} value={schoolName} />)}</datalist>
          </div>
          {error && <p className="login-error" role="alert" data-testid="status-login-error">{error}</p>}
          <button type="submit" className="login-primary-button" data-testid="button-submit-login">{t({ en: 'Enter', ar: 'ادخل' }, lang)}</button>
          <button type="button" className="login-guest-button" onClick={playAsGuest} data-testid="button-play-guest">{t({ en: 'Play as guest', ar: 'الدخول كضيف' }, lang)}</button>
          <p className="login-guest-note">{t({ en: 'Just pick your age — no name or school is saved, and progress stays only for this visit.', ar: 'اختر عمرك فقط — لن يُحفظ الاسم أو المدرسة، وسيبقى التقدم لهذه الزيارة فقط.' }, lang)}</p>
           <div className="login-actions"><button type="button" className="login-admin-button" onClick={() => setLocation('/admin/login')} data-testid="button-login-admin"><BarChart3 className="h-4 w-4" /> {t({ en: 'Admin dashboard', ar: 'لوحة تحكم المشرف' }, lang)}</button></div>
        </div>
      </form>
    </div>
    <LoginSkyline />
  </div>;
}

function ProgressRing({ value, size = 58 }: { value: number; size?: number }) {
  const radius = 20; const circumference = 2 * Math.PI * radius;
  return <div className="relative shrink-0" style={{ width: size, height: size }}><svg viewBox="0 0 48 48" className="h-full w-full -rotate-90"><circle cx="24" cy="24" r={radius} fill="none" stroke="#dce8e0" strokeWidth="5" /><circle cx="24" cy="24" r={radius} fill="none" stroke="#e8755f" strokeLinecap="round" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={circumference - circumference * value / 100} /></svg><span className="absolute inset-0 grid place-items-center font-display text-[11px] font-bold text-[#174b44]">{value}%</span></div>;
}

function Home({ lang }: { lang: Lang }) {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [round] = useLocal<number>('bunayn-eco-round', 0);
  const [finished] = useLocal<boolean>('bunayn-eco-finished', false);
  const [coins] = useLocal<number>('bunayn-coins', 120);
  const progress = finished ? 100 : Math.min(95, Math.round((round / rounds.length) * 100));
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
    <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div className="reveal"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c7ded1] bg-[#e6f1eb] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#33705f]"><span className="h-2 w-2 rounded-full bg-[#e8755f] pulse-soft" /> {profile ? t({ en: `Welcome back, ${profile.name.split(' ')[0]}`, ar: `مرحباً بعودتك، ${profile.name.split(' ')[0]}` }, lang) : t({ en: 'Your playground is open', ar: 'ملعبك مفتوح' }, lang)}</div><h1 className="max-w-2xl font-display text-[clamp(3rem,7vw,6.7rem)] font-semibold leading-[.9] tracking-[-.07em] text-[#174b44]">{t({ en: 'Small choices. Big tomorrow.', ar: 'اختيارات صغيرة. غدٌ كبير.' }, lang)}</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-[#5d7169]">{t({ en: 'Explore quick games inspired by Abu Dhabi, and collect ideas for a brighter future while you play.', ar: 'اكتشف ألعاباً سريعة مستوحاة من أبوظبي، واجمع أفكاراً لغدٍ أكثر إشراقاً أثناء اللعب.' }, lang)}</p><div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/eco-future" className="group inline-flex items-center gap-3 rounded-full bg-[#e8755f] px-6 py-3.5 font-bold text-[#fff7e8] shadow-[0_7px_0_#b85c4e] transition hover:-translate-y-1" data-testid="link-play-featured">{finished ? t({ en: 'Play again', ar: 'العب مجدداً' }, lang) : t({ en: 'Continue playing', ar: 'تابع اللعب' }, lang)} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" /></Link><Link href="/library" className="inline-flex items-center gap-2 rounded-full border border-[#c8d2c7] bg-[#fcf8f0] px-5 py-3.5 font-semibold text-[#174b44] transition hover:border-[#174b44]" data-testid="link-browse-games">{t({ en: 'Browse all games', ar: 'تصفح الألعاب' }, lang)} <ChevronRight className="h-4 w-4 rtl:rotate-180" /></Link></div></div><div className="reveal reveal-delay-1 relative"><Landscape large /><div className="absolute -bottom-5 start-5 end-5 flex items-center justify-between rounded-2xl border border-[#c7ded1] bg-[#fffaf2] p-4 shadow-float sm:start-10 sm:end-10"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f1eb] text-[#33705f]"><Leaf className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#e8755f]">{t({ en: 'Featured trail', ar: 'المسار المميز' }, lang)}</p><p className="font-display font-bold text-[#174b44]">Clean Environment and Better Future</p></div></div><ProgressRing value={progress} /></div></div></section>
    <section className="mt-24 grid gap-5 md:grid-cols-[1.25fr_.75fr]"><div className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 sm:p-8 reveal reveal-delay-2"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Your trail', ar: 'مسارك' }, lang)}</p><h2 className="mt-2 font-display text-2xl font-semibold text-[#174b44]">{t({ en: 'Keep exploring', ar: 'واصل الاستكشاف' }, lang)}</h2></div><Link href="/library" className="text-sm font-bold text-[#33705f] hover:text-[#e8755f]" data-testid="link-trail-library">{t({ en: 'See map', ar: 'شاهد الخريطة' }, lang)} <ChevronRight className="inline h-4 w-4 rtl:rotate-180" /></Link></div><div className="mt-8 flex items-center gap-4"><div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f2c95c] text-[#174b44] sm:grid"><Compass className="h-6 w-6" /></div><div className="relative flex-1"><div className="h-3 overflow-hidden rounded-full bg-[#e3e6d9]"><div className="h-full rounded-full bg-[#33705f] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-xs font-semibold text-[#688079]"><span>{t({ en: 'Mangrove start', ar: 'بداية القرم' }, lang)}</span><span>{t({ en: 'Next: Coral coast', ar: 'التالي: الساحل المرجاني' }, lang)}</span></div></div></div></div><div className="rounded-[24px] bg-[#174b44] p-6 text-[#fff4df] shadow-soft reveal reveal-delay-3"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2c95c] text-[#174b44]"><Coins className="h-5 w-5" /></div><span className="rounded-full bg-[#2d675d] px-3 py-1 text-xs font-bold text-[#d7e8df]">{profile ? profile.role : 'Player'}</span></div><p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#9fc5b6]">{t({ en: 'Your wallet', ar: 'محفظتك' }, lang)}</p><div className="mt-1 flex items-end gap-2"><span className="font-display text-4xl font-bold" data-testid="text-home-coins">{coins}</span><span className="mb-1 text-sm text-[#9fc5b6]">{t({ en: 'coins collected', ar: 'عملة جمعت' }, lang)}</span></div><div className="mt-5 flex gap-1.5">{[1, 2, 3, 4, 5, 6, 7].map((n) => <span key={n} className={`h-2 flex-1 rounded-full ${n <= Math.ceil((progress / 100) * 7) ? 'bg-[#f2c95c]' : 'bg-[#397467]'}`} />)}</div></div></section>
    <section className="mt-16"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Pick a path', ar: 'اختر مساراً' }, lang)}</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#174b44]">{t({ en: 'Games for curious minds', ar: 'ألعاب للعقول الفضولية' }, lang)}</h2></div><Link href="/library" className="hidden items-center gap-1 text-sm font-bold text-[#33705f] sm:flex" data-testid="link-see-all">{t({ en: 'View library', ar: 'عرض المكتبة' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gameBlueprints.slice(0, 4).map((game, index) => <GameCard key={game.id} game={game} lang={lang} index={index} />)}</div></section>
  </div>;
}

function GameCard({ game, lang, index = 0 }: { game: typeof gameBlueprints[number]; lang: Lang; index?: number }) {
  const Icon = game.icon;
  const colors: Record<string, string> = { sand: 'bg-[#f2c95c]', sky: 'bg-[#a8d7dc]', mint: 'bg-[#b9d6c7]', violet: 'bg-[#d6c5dd]', coral: 'bg-[#e8755f]', peach: 'bg-[#f0b092]', lime: 'bg-[#c6d88e]', blue: 'bg-[#a9c7d8]' };
  const card = <div className={`group h-full rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${!game.playable ? 'opacity-90' : ''}`}><div className={`relative grid h-32 place-items-center overflow-hidden rounded-[17px] ${colors[game.color]}`}><div className="absolute -end-4 -top-7 h-24 w-24 rounded-full bg-[#fff4df]/40" /><Icon className="relative h-12 w-12 text-[#174b44] transition-transform group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.5} />{game.playable ? <span className="absolute bottom-2 start-2 rounded-full bg-[#174b44] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#fff4df]">{t(game.eyebrow, lang)}</span> : <span className="absolute bottom-2 start-2 flex items-center gap-1 rounded-full bg-[#fff4df]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#688079]"><LockKeyhole className="h-3 w-3" /> {t(game.eyebrow, lang)}</span>}</div><div className="mt-4 flex items-start justify-between gap-2"><div><h3 className="font-display text-lg font-bold text-[#174b44]">{t(game.title, lang)}</h3><p className="mt-1 text-sm leading-snug text-[#688079]">{t(game.description, lang)}</p></div>{game.playable && <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#e8755f] transition-transform group-hover:translate-x-1 rtl:rotate-180" />}</div></div>;
  return game.playable ? <Link href={game.id === 'eco-future' ? '/eco-future' : `/game/${game.id}`} className={`block reveal reveal-delay-${Math.min(index + 1, 3)}`} data-testid={`link-game-${game.id}`}>{card}</Link> : <div className={`reveal reveal-delay-${Math.min(index + 1, 3)}`} data-testid={`card-game-${game.id}`}>{card}</div>;
}

function Library({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'playable'>('all');
  const filtered = useMemo(() => gameBlueprints.filter((game) => {
    const matches = `${game.title.en} ${game.title.ar}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === 'all' || (filter === 'playable' ? game.playable : !game.playable));
  }), [query, filter]);
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12"><section className="grid gap-8 rounded-[30px] bg-[#174b44] p-7 text-[#fff4df] md:grid-cols-[1fr_auto] md:items-end md:p-10"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#2d675d] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#d7e8df]"><BookOpen className="h-3.5 w-3.5" /> {t({ en: 'The game library', ar: 'مكتبة الألعاب' }, lang)}</div><h1 className="max-w-2xl font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">{t({ en: 'Pick a world to wander into.', ar: 'اختر عالماً لتتجول فيه.' }, lang)}</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-[#b7d1c5]">{t({ en: 'Game worlds inspired by the coast, desert, stories, and bright ideas of Abu Dhabi.', ar: 'عوالم ألعاب مستوحاة من الساحل والصحراء وقصص وأفكار أبوظبي المضيئة.' }, lang)}</p></div><div className="relative hidden h-36 w-44 md:block"><div className="absolute start-8 top-3 h-24 w-24 rounded-full border border-[#f2c95c]/50" /><div className="absolute start-16 top-11 h-3 w-3 rounded-full bg-[#f2c95c] pulse-soft" /><Compass className="absolute bottom-1 start-2 h-28 w-28 text-[#71a695] opacity-70" /></div></section><section className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{(['all', 'playable'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === item ? 'bg-[#e8755f] text-[#fff7e8]' : 'border border-[#dfd2bd] bg-[#fcf8f0] text-[#557068] hover:border-[#174b44]'}`} data-testid={`button-filter-${item}`}>{t(item === 'all' ? { en: 'All worlds', ar: 'كل العوالم' } : { en: 'Play now', ar: 'العب الآن' }, lang)}</button>)}</div><label className="relative block sm:w-64"><CircleHelp className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#688079]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t({ en: 'Search worlds', ar: 'ابحث عن عالم' }, lang)} className="w-full rounded-full border border-[#dfd2bd] bg-[#fcf8f0] py-2.5 pe-4 ps-9 text-sm outline-none placeholder:text-[#9aaba0] focus:border-[#33705f]" data-testid="input-search-games" /></label></section><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((game, index) => <GameCard key={game.id} game={game} lang={lang} index={index} />)}</section>{filtered.length === 0 && <div className="mt-7 rounded-[24px] border border-dashed border-[#c8d2c7] bg-[#fcf8f0] py-16 text-center"><Compass className="mx-auto h-9 w-9 text-[#9aaba0]" /><h2 className="mt-4 font-display text-xl font-bold text-[#174b44]">{t({ en: 'No worlds found', ar: 'لم نجد عوالم' }, lang)}</h2><p className="mt-1 text-sm text-[#688079]">{t({ en: 'Try a different trail marker.', ar: 'جرّب كلمة بحث أخرى.' }, lang)}</p></div>}<p className="mt-7 text-sm font-semibold text-[#5d7169]">{t({ en: 'Every world now has three levels. Each level becomes more challenging and rewards thoughtful play.', ar: 'كل عالم يحتوي الآن على ثلاثة مستويات. تزداد الصعوبة في كل مستوى وتكافئك اللعبة على اللعب الواعي.' }, lang)}</p></div>;
}

function PlayerProgress({ lang }: { lang: Lang }) {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const summary = usePlayerSummary();
  if (!profile) return <div className="mx-auto max-w-[760px] px-5 py-16 text-center lg:px-10"><div className="rounded-[28px] border border-[#dfd2bd] bg-[#fcf8f0] p-8"><Compass className="mx-auto h-10 w-10 text-[#e8755f]" /><h1 className="mt-5 font-display text-3xl font-bold text-[#174b44]">{t({ en: 'Build your player card first', ar: 'أنشئ بطاقة لاعبك أولاً' }, lang)}</h1><p className="mx-auto mt-3 max-w-md text-[#688079]">{t({ en: 'Choose a name and age so Bunayn can save your learning trail on this device.', ar: 'اختر اسماً وعمراً ليحفظ بنين مسار تعلّمك على هذا الجهاز.' }, lang)}</p><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#e8755f] px-5 py-3 font-bold text-[#fff7e8]">{t({ en: 'Create player', ar: 'أنشئ لاعباً' }, lang)}</Link></div></div>;
  const nextHref = summary.nextGame.id === 'eco-future' ? '/eco-future' : `/game/${summary.nextGame.id}`;
  const currentLevel = Math.min(summary.nextWorld.level + 1, summary.nextWorld.target);
  const remainingLevels = Math.max(0, summary.nextWorld.target - summary.nextWorld.level);
  return <div className="mx-auto max-w-[1200px] px-5 py-8 lg:px-10 lg:py-12">
    <section className="overflow-hidden rounded-[30px] bg-[#174b44] p-7 text-[#fff4df] shadow-float sm:p-10"><div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-[24px] border-4 border-[#f2c95c] bg-[#2d675d] font-display text-2xl font-bold">{profile.avatar}</div><div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#f2c95c]">{t({ en: 'Player card', ar: 'بطاقة اللاعب' }, lang)}</p><h1 className="mt-2 font-display text-4xl font-bold">{profile.name}</h1><p className="mt-1 text-sm text-[#b7d1c5]">{t({ en: `Age ${profile.age}${profile.grade ? ` · Grade ${profile.grade}` : ''}`, ar: `العمر ${profile.age}${profile.grade ? ` · الصف ${profile.grade}` : ''}` }, lang)}{profile.school ? ` · ${profile.school}` : ''}</p></div></div><Link href="/store" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f2c95c] px-5 py-3 font-bold text-[#174b44]" data-testid="link-player-store"><ShoppingBag className="h-4 w-4" /> {t({ en: 'Visit store', ar: 'زيارة المتجر' }, lang)}</Link></div></section>
    <section className="mt-7 grid gap-4 sm:grid-cols-3"><div className="rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-5"><Coins className="h-5 w-5 text-[#e8755f]" /><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#688079]">{t({ en: 'Points to spend', ar: 'نقاط للشراء' }, lang)}</p><p className="mt-1 font-display text-4xl font-bold text-[#174b44]" data-testid="text-player-points">{summary.availablePoints}</p></div><div className="rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-5"><Star className="h-5 w-5 text-[#e8755f]" /><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#688079]">{t({ en: 'Learning points', ar: 'نقاط التعلّم' }, lang)}</p><p className="mt-1 font-display text-4xl font-bold text-[#174b44]" data-testid="text-player-score">{summary.points}</p></div><div className="rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-5"><Trophy className="h-5 w-5 text-[#e8755f]" /><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#688079]">{t({ en: 'Worlds complete', ar: 'عوالم مكتملة' }, lang)}</p><p className="mt-1 font-display text-4xl font-bold text-[#174b44]">{summary.completed} <span className="text-lg text-[#688079]">/ {summary.totalWorlds}</span></p></div></section>
    <section className="mt-7 grid gap-6 lg:grid-cols-[.88fr_1.12fr]"><div className="rounded-[26px] bg-[#e7f8fb] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b6a79]">{t({ en: 'What to finish next', ar: 'ما الذي يجب إنهاؤه تالياً' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold text-[#174b44]">{t(summary.nextGame.title, lang)}</h2><p className="mt-3 text-[#557068]">{summary.nextWorld.finished ? t({ en: 'Every learning world is complete. Play any world again to build more points.', ar: 'اكتملت كل عوالم التعلّم. العب أي عالم مجدداً لتحصل على نقاط أكثر.' }, lang) : t({ en: `Complete level ${currentLevel} of ${summary.nextWorld.target}. ${remainingLevels} level${remainingLevels === 1 ? '' : 's'} left to finish this world.`, ar: `أكمل المستوى ${currentLevel} من ${summary.nextWorld.target}. بقي ${remainingLevels} مستوى لإنهاء هذا العالم.` }, lang)}</p><Link href={nextHref} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white" data-testid="link-player-next-world"><Play className="h-4 w-4" /> {t({ en: 'Continue world', ar: 'تابع العالم' }, lang)}</Link></div><div className="rounded-[26px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Your progress', ar: 'تقدمك' }, lang)}</p><h2 className="mt-2 font-display text-2xl font-bold text-[#174b44]">{summary.completionPercent}% {t({ en: 'worlds complete', ar: 'من العوالم مكتمل' }, lang)}</h2></div><ProgressRing value={summary.completionPercent} /></div><div className="mt-7 space-y-3">{summary.worlds.map((world) => { const game = gameBlueprints.find((item) => item.id === world.id)!; const worldPercent = world.finished ? 100 : Math.round((Math.min(world.level, world.target) / world.target) * 100); return <div key={world.id}><div className="flex justify-between gap-4 text-sm"><span className="font-bold text-[#174b44]">{t(game.title, lang)}</span><span className="shrink-0 font-semibold text-[#688079]">{world.finished ? t({ en: 'Complete', ar: 'مكتمل' }, lang) : `${worldPercent}%`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e3e6d9]"><div className="h-full rounded-full bg-[#16a7bc]" style={{ width: `${worldPercent}%` }} /></div></div>; })}</div></div></section>
  </div>;
}

function Store({ lang }: { lang: Lang }) {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const summary = usePlayerSummary();
  if (!profile) return <div className="mx-auto max-w-[760px] px-5 py-16 text-center lg:px-10"><div className="rounded-[28px] border border-[#dfd2bd] bg-[#fcf8f0] p-8"><ShoppingBag className="mx-auto h-10 w-10 text-[#e8755f]" /><h1 className="mt-5 font-display text-3xl font-bold text-[#174b44]">{t({ en: 'Create a player before shopping', ar: 'أنشئ لاعباً قبل التسوق' }, lang)}</h1><p className="mx-auto mt-3 max-w-md text-[#688079]">{t({ en: 'Your points and rewards belong to your player card, so start there first.', ar: 'نقاطك ومكافآتك تخص بطاقة لاعبك، لذا ابدأ منها أولاً.' }, lang)}</p><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#e8755f] px-5 py-3 font-bold text-[#fff7e8]">{t({ en: 'Create player', ar: 'أنشئ لاعباً' }, lang)}</Link></div></div>;
  const buy = (item: StoreItem) => {
    summary.setStoreState((state) => {
      const availablePoints = summary.earnedCoins - state.spentPoints;
      if (state.purchases.includes(item.id) || availablePoints < item.cost) return state;
      return { purchases: [...state.purchases, item.id], spentPoints: state.spentPoints + item.cost };
    });
  };
  return <div className="mx-auto max-w-[1200px] px-5 py-8 lg:px-10 lg:py-12"><section className="rounded-[30px] bg-[#2140a8] p-7 text-white shadow-float sm:p-10"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#d7f0f5]"><ShoppingBag className="h-3.5 w-3.5" /> {t({ en: 'Player store', ar: 'متجر اللاعب' }, lang)}</div><h1 className="mt-5 font-display text-5xl font-bold tracking-[-.05em]">{t({ en: 'Spend points on your collection.', ar: 'أنفق نقاطك على مجموعتك.' }, lang)}</h1><p className="mt-4 max-w-xl text-[#d7f0f5]">{t({ en: 'Finish learning worlds, collect points, then choose a reward that feels like you.', ar: 'أكمل عوالم التعلّم واجمع النقاط، ثم اختر مكافأة تشبهك.' }, lang)}</p></div><div className="rounded-[22px] bg-[#f2c95c] px-5 py-4 text-[#174b44]"><p className="text-xs font-bold uppercase tracking-[.14em]">{t({ en: 'Your points', ar: 'نقاطك' }, lang)}</p><p className="mt-1 flex items-center gap-2 font-display text-4xl font-bold" data-testid="text-store-points"><Coins className="h-7 w-7" /> {summary.availablePoints}</p></div></div></section><section className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{storeItems.map((item) => { const owned = summary.purchases.includes(item.id); const canBuy = summary.availablePoints >= item.cost; return <article key={item.id} className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-5 shadow-soft"><div className={`grid h-20 place-items-center rounded-[20px] text-4xl ${item.tone}`}>{item.icon}</div><h2 className="mt-5 font-display text-xl font-bold text-[#174b44]">{t(item.name, lang)}</h2><p className="mt-2 min-h-10 text-sm leading-relaxed text-[#688079]">{t(item.description, lang)}</p><div className="mt-5 flex items-center justify-between"><span className="inline-flex items-center gap-1 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> {item.cost}</span><button type="button" onClick={() => buy(item)} disabled={owned || !canBuy} className={`rounded-full px-4 py-2 text-sm font-bold transition ${owned ? 'bg-[#e6f1eb] text-[#33705f]' : canBuy ? 'bg-[#e8755f] text-[#fff7e8] hover:-translate-y-0.5' : 'bg-[#e3e6d9] text-[#688079]'}`} data-testid={`button-buy-${item.id}`}>{owned ? t({ en: 'Owned', ar: 'تم الشراء' }, lang) : canBuy ? t({ en: 'Buy', ar: 'اشترِ' }, lang) : t({ en: 'Keep playing', ar: 'واصل اللعب' }, lang)}</button></div></article>; })}</section><p className="mt-8 text-center text-sm font-semibold text-[#688079]">{t({ en: `${summary.completed} of ${summary.totalWorlds} worlds complete. Finish more worlds to unlock bigger rewards.`, ar: `اكتمل ${summary.completed} من ${summary.totalWorlds} عالماً. أكمل عوالم أكثر لفتح مكافآت أكبر.` }, lang)}</p></div>;
}

type Choice = { label: Copy; good: boolean; note: Copy };
type Challenge = { prompt: Copy; detail: Copy; options: Choice[] };

const challengeSeeds: Record<string, { correct: Copy; distractors: Copy[]; prompt: [Copy, Copy, Copy]; detail: Copy }> = {
  'eco-future': { correct: { en: 'A reusable water bottle', ar: 'زجاجة ماء قابلة لإعادة الاستخدام' }, distractors: [{ en: 'A handful of shells', ar: 'حفنة من الأصداف' }, { en: 'A single-use plastic cup', ar: 'كوب بلاستيكي للاستخدام مرة واحدة' }, { en: 'A bright light for an empty room', ar: 'مصباح مضيء لغرفة فارغة' }], prompt: [{ en: 'The tide is out at the mangroves.', ar: 'انحسر المد عن أشجار القرم.' }, { en: 'The midday sun is bright.', ar: 'شمس الظهيرة ساطعة.' }, { en: 'The city is planning a greener route.', ar: 'تخطط المدينة لمسار أكثر خضرة.' }], detail: { en: 'Choose the small action that gives the coast and community more room to breathe.', ar: 'اختر الفعل الصغير الذي يمنح الساحل والمجتمع مساحة أكبر للتنفس.' } },
  heritage: { correct: { en: 'Listen carefully to an elder’s story', ar: 'استمع بعناية إلى قصة أحد كبار السن' }, distractors: [{ en: 'Erase the old story', ar: 'امسح القصة القديمة' }, { en: 'Keep every tradition secret', ar: 'أبقِ كل التقاليد سرية' }, { en: 'Replace the story with a guess', ar: 'استبدل القصة بتخمين' }], prompt: [{ en: 'A family story is being shared.', ar: 'تُروى قصة عائلية.' }, { en: 'You find an old dhow model.', ar: 'وجدت نموذجاً لقارب شراعي قديم.' }, { en: 'A craftsperson shows you a traditional pattern.', ar: 'يعرض عليك حرفي نقشاً تقليدياً.' }], detail: { en: 'Which response shows respect for the people and stories that shaped Abu Dhabi?', ar: 'أي استجابة تُظهر احتراماً للأشخاص والقصص التي شكّلت أبوظبي؟' } },
  'color-focus': { correct: { en: 'Choose the color that matches the signal', ar: 'اختر اللون المطابق للإشارة' }, distractors: [{ en: 'Choose the brightest color', ar: 'اختر اللون الأكثر سطوعاً' }, { en: 'Choose without looking', ar: 'اختر دون النظر' }, { en: 'Choose the longest word', ar: 'اختر الكلمة الأطول' }], prompt: [{ en: 'A green signal appears.', ar: 'ظهرت إشارة خضراء.' }, { en: 'Two colors are almost the same.', ar: 'لونان متقاربان جداً.' }, { en: 'The signal changes quickly.', ar: 'تتغير الإشارة بسرعة.' }], detail: { en: 'Slow down, notice the detail, and respond to the signal—not the distraction.', ar: 'تمهل ولاحظ التفاصيل واستجب للإشارة، لا للتشتيت.' } },
  'library-sort': { correct: { en: 'Place a science book with science books', ar: 'ضع كتاب العلوم مع كتب العلوم' }, distractors: [{ en: 'Hide it behind the shelf', ar: 'أخفه خلف الرف' }, { en: 'Put every book in one pile', ar: 'ضع كل الكتب في كومة واحدة' }, { en: 'Choose a shelf by its color only', ar: 'اختر الرف حسب اللون فقط' }], prompt: [{ en: 'A book needs a home.', ar: 'يحتاج كتاب إلى مكان.' }, { en: 'The shelves are getting busy.', ar: 'أصبحت الرفوف مزدحمة.' }, { en: 'A friend cannot find a story.', ar: 'لا يستطيع صديق العثور على قصة.' }], detail: { en: 'Organize with care so knowledge is easier for everyone to find.', ar: 'نظّم بعناية حتى يصبح الوصول إلى المعرفة أسهل للجميع.' } },
  'word-journey': { correct: { en: 'A word that means helping others', ar: 'كلمة تعني مساعدة الآخرين' }, distractors: [{ en: 'A word chosen only because it is long', ar: 'كلمة اخترتها لأنها طويلة فقط' }, { en: 'A word with no meaning', ar: 'كلمة بلا معنى' }, { en: 'A word copied without reading', ar: 'كلمة نُسخت دون قراءتها' }], prompt: [{ en: 'Find the word that shows kindness.', ar: 'اعثر على الكلمة التي تدل على اللطف.' }, { en: 'Connect a word to its meaning.', ar: 'صل الكلمة بمعناها.' }, { en: 'Build a sentence that helps a friend.', ar: 'كوّن جملة تساعد صديقاً.' }], detail: { en: 'Words become powerful when we understand them and use them with care.', ar: 'تصبح الكلمات قوية عندما نفهمها ونستخدمها بعناية.' } },
  'basket-challenge': { correct: { en: 'Aim, breathe, and try again', ar: 'صوّب وتنفس وحاول مرة أخرى' }, distractors: [{ en: 'Throw without looking', ar: 'ارمِ دون أن تنظر' }, { en: 'Give up after one miss', ar: 'استسلم بعد محاولة واحدة' }, { en: 'Blame a teammate', ar: 'ألقِ اللوم على زميل' }], prompt: [{ en: 'The first shot misses.', ar: 'أخطأت الرمية الأولى.' }, { en: 'The hoop is farther away.', ar: 'أصبحت السلة أبعد.' }, { en: 'Your team needs a calm captain.', ar: 'يحتاج فريقك إلى قائد هادئ.' }], detail: { en: 'Good performance grows through focus, practice, and respect for the team.', ar: 'ينمو الأداء الجيد بالتركيز والتدريب واحترام الفريق.' } },
  'healthy-restaurant': { correct: { en: 'Offer water, vegetables, and a balanced meal', ar: 'قدّم الماء والخضروات ووجبة متوازنة' }, distractors: [{ en: 'Serve only sweets', ar: 'قدّم الحلويات فقط' }, { en: 'Remove the menu choices', ar: 'أزل خيارات القائمة' }, { en: 'Choose a meal by its packaging', ar: 'اختر الوجبة حسب تغليفها' }], prompt: [{ en: 'A guest wants a good meal.', ar: 'يريد أحد الضيوف وجبة جيدة.' }, { en: 'The kitchen has limited ingredients.', ar: 'لدى المطبخ مكونات محدودة.' }, { en: 'A family has different needs.', ar: 'لدى العائلة احتياجات مختلفة.' }], detail: { en: 'Balance, variety, and listening help people make healthy choices.', ar: 'يساعد التوازن والتنوع والاستماع الناس على اتخاذ اختيارات صحية.' } },
  'innovation-lab': { correct: { en: 'Test a small idea and learn from it', ar: 'اختبر فكرة صغيرة وتعلم منها' }, distractors: [{ en: 'Wait for a perfect idea', ar: 'انتظر فكرة مثالية' }, { en: 'Copy without asking why', ar: 'انسخ دون أن تسأل لماذا' }, { en: 'Hide the first mistake', ar: 'أخفِ الخطأ الأول' }], prompt: [{ en: 'Your first prototype does not work.', ar: 'لم يعمل نموذجك الأول.' }, { en: 'Two ideas could solve the problem.', ar: 'قد تحل فكرتان المشكلة.' }, { en: 'Your team sees a new obstacle.', ar: 'رأى فريقك عقبة جديدة.' }], detail: { en: 'Innovation grows when curious teams test, listen, and improve together.', ar: 'ينمو الابتكار عندما تختبر الفرق الفضولية وتستمع وتحسّن معاً.' } },
  'numeracy-check': { correct: { en: 'Solve 7 + 5 = 12', ar: 'حل ٧ + ٥ = ١٢' }, distractors: [{ en: 'Solve by guessing quickly', ar: 'حل بالتخمين بسرعة' }, { en: '7 + 5 = 10', ar: '٧ + ٥ = ١٠' }, { en: 'Skip the question', ar: 'تجاوز السؤال' }], prompt: [{ en: 'The first maths gate asks: 7 + 5 = ?', ar: 'يسأل بوابة الرياضيات الأولى: ٧ + ٥ = ؟' }, { en: 'The marathon is faster: 24 ÷ 6 = ?', ar: 'أصبح الماراثون أسرع: ٢٤ ÷ ٦ = ؟' }, { en: 'Final sprint: a runner has 3 groups of 8 points. How many points?', ar: 'السباق الأخير: لدى العداء ٣ مجموعات من ٨ نقاط. كم نقطة؟' }], detail: { en: 'Answer carefully, then move quickly. The questions become harder as your maths marathon continues.', ar: 'أجب بعناية ثم تحرك بسرعة. تصبح الأسئلة أصعب مع استمرار ماراثون الرياضيات.' } },
  'bot-workshop': { correct: { en: 'Forward, forward, then pick up', ar: 'إلى الأمام، إلى الأمام، ثم التقط' }, distractors: [{ en: 'Turn away from the goal', ar: 'استدر بعيداً عن الهدف' }, { en: 'Run the bot without a plan', ar: 'شغّل الروبوت دون خطة' }, { en: 'Remove the goal', ar: 'أزل الهدف' }], prompt: [{ en: 'L1: The bot is two squares from the battery.', ar: 'المستوى ١: يبعد الروبوت مربعين عن البطارية.' }, { en: 'L2: Use fewer blocks to reach the battery around a wall.', ar: 'المستوى ٢: استخدم عدداً أقل من الكتل للوصول إلى البطارية حول جدار.' }, { en: 'L3: Two bots must reach different goals on the same tick.', ar: 'المستوى ٣: يجب أن يصل روبوتان إلى هدفين مختلفين في الوقت نفسه.' }], detail: { en: 'Plan the sequence before you press Run. Good programs are clear, efficient, and helpful.', ar: 'خطط للتسلسل قبل الضغط على تشغيل. البرامج الجيدة واضحة وفعالة ومفيدة.' } },
  'truth-lab': { correct: { en: 'Not sure yet—check a reliable source', ar: 'لست متأكداً بعد، تحقق من مصدر موثوق' }, distractors: [{ en: 'Share it immediately', ar: 'شاركه فوراً' }, { en: 'Believe it because a friend said it', ar: 'صدقه لأن صديقاً قاله' }, { en: 'Choose the most dramatic picture', ar: 'اختر الصورة الأكثر إثارة' }], prompt: [{ en: 'L1: A card says: “Every shiny stone is gold.”', ar: 'المستوى ١: تقول بطاقة: «كل حجر لامع هو ذهب».' }, { en: 'L2: Which evidence is strongest: a rumour, a cropped photo, or an official page?', ar: 'المستوى ٢: أي دليل هو الأقوى: إشاعة أم صورة مقتصة أم صفحة رسمية؟' }, { en: 'L3: Four sources disagree before a 90-second newsroom deadline.', ar: 'المستوى ٣: تختلف أربعة مصادر قبل موعد غرفة الأخبار خلال ٩٠ ثانية.' }], detail: { en: 'A careful fact-checker separates what is known, what is supported, and what still needs checking.', ar: 'يفصل مدقق الحقائق الحريص بين ما نعرفه وما تدعمه الأدلة وما يحتاج إلى تحقق.' } },
  'common-ground': { correct: { en: 'Give each person what they need, not just the same amount', ar: 'أعطِ كل شخص ما يحتاجه، وليس الكمية نفسها فقط' }, distractors: [{ en: 'Keep everything for one person', ar: 'احتفظ بكل شيء لشخص واحد' }, { en: 'Split without listening', ar: 'قسّم دون استماع' }, { en: 'Choose the loudest request', ar: 'اختر الطلب الأعلى صوتاً' }], prompt: [{ en: 'L1: Share 12 items among four people with different needs.', ar: 'المستوى ١: وزع ١٢ قطعة بين أربعة أشخاص باحتياجات مختلفة.' }, { en: 'L2: A neighbourhood has 100 credits and six useful proposals.', ar: 'المستوى ٢: لدى الحي ١٠٠ رصيد وستة مقترحات مفيدة.' }, { en: 'L3: Write a shared-space rule and answer three objections.', ar: 'المستوى ٣: اكتب قاعدة للمساحة المشتركة وأجب عن ثلاثة اعتراضات.' }], detail: { en: 'Fairness means listening to real needs and noticing who might be left out.', ar: 'يعني العدل الاستماع إلى الاحتياجات الحقيقية وملاحظة من قد يتم استبعاده.' } },
  'spark-studio': { correct: { en: 'Build a useful idea for a real person', ar: 'ابنِ فكرة مفيدة لشخص حقيقي' }, distractors: [{ en: 'Wait for a perfect invention', ar: 'انتظر اختراعاً مثالياً' }, { en: 'Copy the first idea exactly', ar: 'انسخ الفكرة الأولى تماماً' }, { en: 'Make something impressive with no purpose', ar: 'اصنع شيئاً مبهراً بلا هدف' }], prompt: [{ en: 'L1: Mix an umbrella and a bicycle into one helpful invention.', ar: 'المستوى ١: ادمج مظلة ودراجة في اختراع مفيد.' }, { en: 'L2: Solve one person’s problem with only four parts.', ar: 'المستوى ٢: حل مشكلة شخص واحد بأربعة أجزاء فقط.' }, { en: 'L3: Discover, prototype, and pitch an idea in a timed design sprint.', ar: 'المستوى ٣: اكتشف المشكلة وابنِ نموذجاً وقدّم فكرة في سباق تصميم محدد الوقت.' }], detail: { en: 'There is no single perfect answer. Be curious, explain your purpose, and improve your idea.', ar: 'لا توجد إجابة مثالية واحدة. كن فضولياً واشرح هدفك وحسّن فكرتك.' } },
};

function makeChallenges(gameId: string): Challenge[] {
  const seed = challengeSeeds[gameId] || challengeSeeds['eco-future'];
  return seed.prompt.map((prompt, level) => {
    const distractors = seed.distractors.slice(0, level + 2);
    return {
      prompt,
      detail: seed.detail,
      options: [
        { label: seed.correct, good: true, note: { en: 'Great thinking. That choice shows care and good judgment.', ar: 'تفكير رائع. هذا الاختيار يدل على العناية وحسن التقدير.' } },
        ...distractors.map((label) => ({ label, good: false, note: { en: 'Not this time. Think about the value behind the challenge and try the next level.', ar: 'ليس هذه المرة. فكر في القيمة وراء التحدي وجرب المستوى التالي.' } })),
      ],
    };
  });
}

type GameProgress = { level: number; question: number; score: number; coins: number; finished: boolean };

type SignatureProgress = { level: number; question?: number; score: number; coins: number; finished: boolean };
function GameRoom({ lang, gameId }: { lang: Lang; gameId: string }) {
  const game = gameBlueprints.find((item) => item.id === gameId && item.id !== 'basket-challenge') || gameBlueprints[1];
  const challenges = useMemo(() => makeChallenges(game.id), [game.id]);
  const storageKey = `bunayn-game-progress-${game.id}`;
  const [progress, setProgress] = useLocal<GameProgress>(storageKey, { level: 0, question: 0, score: 0, coins: 0, finished: false });
  const [selected, setSelected] = useState<number | null>(null);
  const advancing = useRef(false);
  const level = Math.min(progress.level, challenges.length - 1);
  const current = challenges[level];
  const levelTarget = 1;

  const choose = (index: number) => {
    if (selected !== null || progress.finished || !current.options[index]) return;
    setSelected(index);
  };

  const next = () => {
    if (selected === null || advancing.current) return;
    advancing.current = true;
    const wasCorrect = current.options[selected].good;
    setProgress((value) => {
      const reward = wasCorrect ? { score: value.score + 100 + value.level * 50, coins: value.coins + 10 + value.level * 5 } : {};
      if (value.level < challenges.length - 1) return { ...value, ...reward, level: value.level + 1, question: 0 };
      return { ...value, ...reward, finished: true };
    });
    setSelected(null);
    window.setTimeout(() => { advancing.current = false; }, 0);
  };

  const restart = () => {
    setProgress({ level: 0, question: 0, score: 0, coins: 0, finished: false });
    setSelected(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= String(current.options.length)) choose(Number(event.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current.options.length, progress.finished, selected]);

  useEffect(() => { setSelected(null); }, [game.id]);

  const Icon = game.icon;
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-library"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game library', ar: 'العودة إلى مكتبة الألعاب' }, lang)}</Link>
      <div className="flex flex-wrap items-center justify-end gap-2"><GameTimer gameId={game.id} lang={lang} finished={progress.finished} /><div className="flex items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8f0] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-generic-game-coins">{progress.coins}</span></div></div>
    </div>
    <section className="overflow-hidden rounded-[30px] bg-[#174b44] text-[#fff4df] shadow-float">
      <div className="grid lg:grid-cols-[.72fr_1.28fr]">
        <div className="relative min-h-[270px] overflow-hidden bg-[#2d675d] p-7 sm:p-10">
          <div className="absolute -end-16 -top-14 h-52 w-52 rounded-full bg-[#f2c95c]" />
          <div className="absolute bottom-[-55px] start-[-25px] h-48 w-72 rotate-[-17deg] rounded-[50%] bg-[#71a695]" />
          <div className="absolute bottom-[-65px] end-[-25px] h-48 w-64 rotate-[12deg] rounded-[50%] bg-[#3b8876]" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#d7e8df]"><Icon className="h-4 w-4 text-[#f2c95c]" /> {t(game.title, lang)}</div>
            <h1 className="mt-8 max-w-xs font-display text-4xl font-semibold leading-[.95] tracking-[-.06em]">{progress.finished ? t({ en: 'Trail complete.', ar: 'اكتمل المسار.' }, lang) : t({ en: 'Three levels. One growing mind.', ar: 'ثلاثة مستويات. عقل ينمو.' }, lang)}</h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c0dbcf]">{t({ en: 'Every level adds more choices and a little more challenge.', ar: 'يضيف كل مستوى اختيارات أكثر وتحدياً أكبر.' }, lang)}</p>
          </div>
        </div>
        <div className="bg-[#fffaf2] p-6 text-[#174b44] sm:p-10">
          {progress.finished ? <div className="flex min-h-[390px] flex-col justify-center text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f2c95c] text-[#174b44]"><Trophy className="h-9 w-9" /></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Learning complete', ar: 'اكتمل التعلّم' }, lang)}</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">{t({ en: 'You kept growing.', ar: 'واصلت النمو.' }, lang)}</h2>
            <p className="mx-auto mt-4 max-w-md text-[#688079]">{t({ en: 'Your choices, focus, and persistence are part of your learning trail.', ar: 'اختياراتك وتركيزك ومثابرتك جزء من مسار تعلمك.' }, lang)}</p>
            <div className="mx-auto mt-7 flex items-center gap-6 rounded-2xl bg-[#e6f1eb] px-6 py-4"><div><span className="block font-display text-2xl font-bold" data-testid="text-generic-game-score">{progress.score}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'score', ar: 'النقاط' }, lang)}</span></div><div className="h-9 w-px bg-[#c7ded1]" /><div><span className="block font-display text-2xl font-bold">{progress.coins}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'coins', ar: 'العملات' }, lang)}</span></div></div>
            <button onClick={restart} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8] transition hover:-translate-y-0.5" data-testid="button-restart-generic-game"><RotateCcw className="h-4 w-4" /> {t({ en: 'Play again', ar: 'العب مجدداً' }, lang)}</button>
          </div> : <div>
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Level', ar: 'المستوى' }, lang)} {level + 1} / 3</p><div className="mt-3 flex gap-1.5">{challenges.map((_, index) => <span key={index} className={`h-1.5 w-12 rounded-full ${index <= level ? 'bg-[#e8755f]' : 'bg-[#dfd2bd]'}`} />)}</div></div>
              <div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-sm font-bold"><Star className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-generic-game-score">{progress.score}</span></div>
            </div>
            <p className="mt-10 text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Mission', ar: 'المهمة' }, lang)} {level + 1} / {levelTarget * challenges.length}</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">{t(current.prompt, lang)}</h2>
            <p className="mt-3 max-w-xl text-[#688079]">{t(current.detail, lang)}</p>
            <div className="mt-7 grid gap-3">{current.options.map((option, index) => { const active = selected === index; const correct = active && option.good; return <button key={index} onClick={() => choose(index)} className={`group flex items-center gap-4 rounded-2xl border p-4 text-start transition-all ${active ? correct ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5 hover:border-[#33705f]'}`} data-testid={`button-generic-choice-${index + 1}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${active ? correct ? 'bg-[#33705f] text-white' : 'bg-[#e8755f] text-white' : 'bg-[#efe4cf] text-[#557068]'}`}>{active ? correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" /> : index + 1}</span><span className="flex-1 text-sm font-semibold text-[#174b44]">{t(option.label, lang)}</span><ChevronRight className={`h-4 w-4 text-[#9aaba0] transition-transform group-hover:translate-x-1 rtl:rotate-180 ${active ? 'opacity-100' : 'opacity-0'}`} /></button>; })}</div>
            {selected !== null && <div className={`mt-5 rounded-2xl p-4 ${current.options[selected].good ? 'bg-[#e6f1eb]' : 'bg-[#fff0eb]'}`} role="status" data-testid="status-generic-feedback"><p className="text-sm font-semibold leading-relaxed text-[#174b44]">{t(current.options[selected].note, lang)}</p><button onClick={next} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-4 py-2 text-xs font-bold text-[#fff4df]" data-testid="button-generic-next">{progress.level === challenges.length - 1 ? t({ en: 'Finish game', ar: 'إنهاء اللعبة' }, lang) : t({ en: 'Next level', ar: 'المستوى التالي' }, lang)} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></button></div>}
          </div>}
        </div>
      </div>
    </section>
    <p className="mt-5 text-center text-xs font-semibold text-[#688079]">{t({ en: `Choose with 1–${current.options.length} or tap a choice card`, ar: `اختر من 1 إلى ${current.options.length} أو اضغط بطاقة اختيار` }, lang)}</p>
  </div>;
}

type RunnerEvent = {
  kind: 'food' | 'jump' | 'slide';
  lane?: number;
  label: Copy;
  hint: Copy;
};
type RunnerProgress = {
  level: number;
  step: number;
  lane: number;
  collected: number;
  score: number;
  coins: number;
  hearts: number;
  timeLeft: number;
  status: 'ready' | 'running' | 'level-complete' | 'finished';
  jumping: boolean;
  sliding: boolean;
  message: Copy;
};

const runnerLevels: { label: Copy; target: Copy; speed: Copy; events: RunnerEvent[] }[] = [
  {
    label: { en: 'Market warm-up', ar: 'إحماء السوق' },
    target: { en: 'Collect fruit for breakfast', ar: 'اجمع الفاكهة للإفطار' },
    speed: { en: 'Easy stroll', ar: 'خطوات هادئة' },
    events: [
      { kind: 'food', lane: 2, label: { en: 'Fresh apple', ar: 'تفاحة طازجة' }, hint: { en: 'Move to the right lane', ar: 'انتقل إلى المسار الأيمن' } },
      { kind: 'jump', label: { en: 'Low crate', ar: 'صندوق منخفض' }, hint: { en: 'Jump over the crate', ar: 'اقفز فوق الصندوق' } },
      { kind: 'food', lane: 0, label: { en: 'Sweet dates', ar: 'تمر حلو' }, hint: { en: 'Move to the left lane', ar: 'انتقل إلى المسار الأيسر' } },
      { kind: 'slide', label: { en: 'Market banner', ar: 'لافتة السوق' }, hint: { en: 'Slide under the banner', ar: 'انزلق تحت اللافتة' } },
      { kind: 'food', lane: 2, label: { en: 'Red tomato', ar: 'طماطم حمراء' }, hint: { en: 'Move to the right lane', ar: 'انتقل إلى المسار الأيمن' } },
    ],
  },
  {
    label: { en: 'Sunny sprint', ar: 'سباق مشمس' },
    target: { en: 'Build a balanced lunch basket', ar: 'كوّن سلة غداء متوازنة' },
    speed: { en: 'Faster feet', ar: 'خطوات أسرع' },
    events: [
      { kind: 'food', lane: 2, label: { en: 'Crunchy carrot', ar: 'جزرة مقرمشة' }, hint: { en: 'Move to the right lane', ar: 'انتقل إلى المسار الأيمن' } },
      { kind: 'jump', label: { en: 'Rolling basket', ar: 'سلة متدحرجة' }, hint: { en: 'Jump now', ar: 'اقفز الآن' } },
      { kind: 'food', lane: 1, label: { en: 'Cool water', ar: 'ماء بارد' }, hint: { en: 'Move to the middle lane', ar: 'انتقل إلى المسار الأوسط' } },
      { kind: 'slide', label: { en: 'Shade cloth', ar: 'قماش الظل' }, hint: { en: 'Slide under it', ar: 'انزلق تحته' } },
      { kind: 'food', lane: 0, label: { en: 'Wholegrain bread', ar: 'خبز الحبوب الكاملة' }, hint: { en: 'Move to the left lane', ar: 'انتقل إلى المسار الأيسر' } },
      { kind: 'jump', label: { en: 'Little puddle', ar: 'بركة صغيرة' }, hint: { en: 'Jump over it', ar: 'اقفز فوقها' } },
    ],
  },
  {
    label: { en: 'Festival finish', ar: 'نهاية المهرجان' },
    target: { en: 'Find the healthy feast ingredients', ar: 'اعثر على مكونات وليمة صحية' },
    speed: { en: 'Super speedy', ar: 'سرعة كبيرة' },
    events: [
      { kind: 'food', lane: 0, label: { en: 'Garden cucumber', ar: 'خيار الحديقة' }, hint: { en: 'Move to the left lane', ar: 'انتقل إلى المسار الأيسر' } },
      { kind: 'jump', label: { en: 'Wooden crate', ar: 'صندوق خشبي' }, hint: { en: 'Jump over it', ar: 'اقفز فوقه' } },
      { kind: 'food', lane: 2, label: { en: 'Fresh milk', ar: 'حليب طازج' }, hint: { en: 'Move to the right lane', ar: 'انتقل إلى المسار الأيمن' } },
      { kind: 'slide', label: { en: 'Palm branch', ar: 'سعفة نخيل' }, hint: { en: 'Slide under it', ar: 'انزلق تحتها' } },
      { kind: 'food', lane: 1, label: { en: 'Orange slices', ar: 'شرائح البرتقال' }, hint: { en: 'Move to the middle lane', ar: 'انتقل إلى المسار الأوسط' } },
      { kind: 'jump', label: { en: 'Festival drum', ar: 'طبلة المهرجان' }, hint: { en: 'Jump over it', ar: 'اقفز فوقها' } },
      { kind: 'food', lane: 0, label: { en: 'Leafy greens', ar: 'خضروات ورقية' }, hint: { en: 'Move to the left lane', ar: 'انتقل إلى المسار الأيسر' } },
    ],
  },
];

const runnerLanePositions = ['16.67%', '50%', '83.33%'];

function BasketRunner({ lang }: { lang: Lang }) {
  const [progress, setProgress] = useLocal<RunnerProgress>('bunayn-basket-runner-progress', {
    level: 0, step: 0, lane: 1, collected: 0, score: 0, coins: 0, hearts: 3, timeLeft: 60,
    status: 'ready', jumping: false, sliding: false,
    message: { en: 'Choose a lane, then sprint to the next food target.', ar: 'اختر مساراً ثم انطلق نحو هدف الطعام التالي.' },
  });
  const [flash, setFlash] = useState<'good' | 'oops' | null>(null);
  const sprinting = useRef(false);
  const level = Math.min(progress.level, runnerLevels.length - 1);
  const config = runnerLevels[level];
  const event = config.events[Math.min(progress.step, config.events.length - 1)];
  const isRunning = progress.status === 'running';

  const prepareLevel = (nextLevel = progress.level) => {
    setProgress((value) => ({
      ...value, level: nextLevel, step: 0, lane: 1, collected: 0, hearts: 3,
      timeLeft: 60 - nextLevel * 10, status: 'ready', jumping: false, sliding: false,
      message: { en: 'Press Start run when you are ready.', ar: 'اضغط ابدأ الجري عندما تكون مستعداً.' },
    }));
  };

  const startRun = () => setProgress((value) => ({
    ...value, status: 'running', message: { en: 'Go! Follow the food and move safely.', ar: 'انطلق! اتبع الطعام وتحرك بأمان.' },
  }));

  const move = (direction: -1 | 1) => {
    if (!isRunning) return;
    setProgress((value) => ({ ...value, lane: Math.max(0, Math.min(2, value.lane + direction)), jumping: false, sliding: false }));
  };

  const pose = (kind: 'jump' | 'slide') => {
    if (!isRunning) return;
    setProgress((value) => ({ ...value, jumping: kind === 'jump', sliding: kind === 'slide' }));
  };

  const sprint = () => {
    if (!isRunning || sprinting.current) return;
    sprinting.current = true;
    const success = event.kind === 'food'
      ? progress.lane === event.lane
      : event.kind === 'jump'
        ? progress.jumping
        : progress.sliding;
    setFlash(success ? 'good' : 'oops');
    window.setTimeout(() => { setFlash(null); sprinting.current = false; }, 450);
    setProgress((value) => {
      const lastStep = value.step >= config.events.length - 1;
      const nextHearts = success ? value.hearts : Math.max(0, value.hearts - 1);
      const reward = success ? { score: value.score + 50 + value.level * 25, coins: value.coins + 5 } : {};
      const message = success
        ? { en: event.kind === 'food' ? 'Healthy choice collected! Keep running.' : 'Quick move! You stayed on your path.', ar: event.kind === 'food' ? 'جمعت اختياراً صحياً! واصل الجري.' : 'حركة سريعة! بقيت على مسارك.' }
        : { en: 'That was close. Reset your move and try the next marker.', ar: 'كانت قريبة. أعد ضبط حركتك وجرب العلامة التالية.' };
      return {
        ...value, ...reward, hearts: nextHearts, step: value.step + 1,
        collected: value.collected + (success && event.kind === 'food' ? 1 : 0),
        jumping: false, sliding: false, message,
        status: lastStep || nextHearts === 0 ? 'level-complete' : 'running',
      };
    });
  };

  const continueRun = () => {
    if (progress.hearts === 0) { prepareLevel(level); return; }
    if (level === runnerLevels.length - 1) {
      setProgress((value) => ({ ...value, status: 'finished', message: { en: 'Your healthy basket is ready for the day.', ar: 'سلتك الصحية جاهزة لليوم.' } }));
      return;
    }
    prepareLevel(level + 1);
  };

  const restart = () => {
    setProgress({
      level: 0, step: 0, lane: 1, collected: 0, score: 0, coins: 0, hearts: 3, timeLeft: 60,
      status: 'ready', jumping: false, sliding: false,
      message: { en: 'A new food run is waiting for you.', ar: 'جولة طعام جديدة بانتظارك.' },
    });
  };

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value.timeLeft > 1) return { ...value, timeLeft: value.timeLeft - 1 };
        return { ...value, status: 'level-complete', message: { en: 'Time paused. Take a breath and try this level again.', ar: 'توقف الوقت. خذ نفساً وحاول هذا المستوى مجدداً.' } };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    const onKey = (keyboardEvent: KeyboardEvent) => {
      if (!isRunning) return;
      if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key.toLowerCase() === 'a') { keyboardEvent.preventDefault(); move(-1); }
      if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key.toLowerCase() === 'd') { keyboardEvent.preventDefault(); move(1); }
      if (keyboardEvent.key === 'ArrowUp' || keyboardEvent.key === ' ') { keyboardEvent.preventDefault(); pose('jump'); }
      if (keyboardEvent.key === 'ArrowDown') { keyboardEvent.preventDefault(); pose('slide'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, progress.lane, progress.jumping, progress.sliding, progress.step]);

  const EventIcon = event.kind === 'food' ? Apple : event.kind === 'jump' ? ArrowUp : ArrowDown;
  const progressPercent = Math.min(100, Math.round((progress.step / config.events.length) * 100));
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12">
    <div className="mb-6 flex items-center justify-between gap-3">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-library"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game library', ar: 'العودة إلى مكتبة الألعاب' }, lang)}</Link>
      <div className="flex items-center gap-2 rounded-full bg-[#f2c95c] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4" /> <span data-testid="text-basket-coins">{progress.coins}</span></div>
    </div>
    <section className="overflow-hidden rounded-[30px] bg-[#174b44] p-4 shadow-float sm:p-6" data-testid="basket-runner">
      <div className="rounded-[24px] bg-[#fff7e8] p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Basket Challenge', ar: 'تحدي السلة' }, lang)}</p><h1 className="mt-1 font-display text-3xl font-bold text-[#174b44]">{t(config.label, lang)}</h1></div>
          <div className="flex items-center gap-2"><span className="rounded-full bg-[#e6f1eb] px-3 py-2 text-xs font-bold text-[#33705f]">{t(config.speed, lang)}</span><span className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold ${progress.timeLeft <= 10 && isRunning ? 'bg-[#fff0eb] text-[#a94d40] pulse-soft' : 'bg-[#efe4cf] text-[#174b44]'}`}><Clock3 className="h-4 w-4" /> <span data-testid="text-basket-timer">{progress.timeLeft}s</span></span></div>
        </div>
        <div className="mb-5"><div className="flex items-center justify-between text-xs font-bold text-[#557068]"><span>{t({ en: `Level ${level + 1} of 3`, ar: `المستوى ${level + 1} من 3` }, lang)}</span><span>{progress.step} / {config.events.length}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e3e6d9]"><div className="h-full rounded-full bg-[#e8755f] transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div></div>
        <div className={`basket-runner-world relative min-h-[360px] overflow-hidden rounded-[28px] border-4 border-[#f2c95c] ${flash === 'good' ? 'basket-flash-good' : flash === 'oops' ? 'basket-flash-oops' : ''}`}>
          <div className="absolute -end-12 -top-16 h-44 w-44 rounded-full bg-[#f2c95c]" /><div className="absolute start-7 top-9 h-12 w-24 rounded-full bg-white/65 blur-sm" /><div className="absolute end-8 top-16 h-10 w-20 rounded-full bg-white/55 blur-sm" />
          <div className="absolute inset-x-0 top-[42%] h-[20%] bg-[#9fcac0]/80" /><div className="absolute inset-x-0 top-[54%] h-[12%] bg-[#71a695]" />
          <div className="basket-track absolute inset-x-0 bottom-0 h-[56%] bg-[#e4b06c]"><span className="basket-track-line start-1/3" /><span className="basket-track-line start-2/3" /></div>
          {isRunning && <div className="absolute top-[18%] z-10 -translate-x-1/2 transition-all duration-300" style={{ left: event.kind === 'food' ? runnerLanePositions[event.lane ?? 1] : '50%' }}><div className={`grid h-16 w-16 place-items-center rounded-[22px] border-4 ${event.kind === 'food' ? 'border-[#fff4df] bg-[#e8755f] text-[#fff4df] shadow-[0_0_22px_rgba(232,117,95,.8)]' : 'border-[#d7e8df] bg-[#5d7169] text-[#fff4df]'}`}><EventIcon className="h-8 w-8" /></div><p className="mt-2 max-w-28 text-center text-xs font-bold text-[#174b44]">{t(event.label, lang)}</p></div>}
          <div className={`absolute bottom-7 z-20 -translate-x-1/2 transition-all duration-200 ${progress.jumping ? '-translate-y-14 scale-110' : ''} ${progress.sliding ? 'translate-y-3 scale-x-110 scale-y-75' : ''}`} style={{ left: runnerLanePositions[progress.lane] }}><div className="grid h-16 w-20 place-items-center rounded-[40%] border-4 border-[#174b44] bg-[#f2c95c] shadow-[0_10px_0_#b57943]"><Footprints className="h-8 w-8 text-[#174b44]" /></div><span className="mx-auto mt-2 block w-max rounded-full bg-[#174b44] px-2 py-1 text-[10px] font-bold text-[#fff4df]">{t({ en: 'Your basket', ar: 'سلتك' }, lang)}</span></div>
          {!isRunning && progress.status !== 'finished' && <div className="absolute inset-0 z-30 grid place-items-center bg-[#174b44]/55 p-5 text-center"><div className="max-w-sm rounded-[24px] bg-[#fff7e8] p-6 shadow-float"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f2c95c] text-[#174b44]"><Play className="h-6 w-6" /></span><h2 className="mt-4 font-display text-2xl font-bold text-[#174b44]">{progress.status === 'level-complete' ? t({ en: 'Checkpoint reached', ar: 'وصلت إلى نقطة التحقق' }, lang) : t(config.target, lang)}</h2><p className="mt-3 text-sm leading-relaxed text-[#557068]">{progress.status === 'level-complete' ? t(progress.message, lang) : t({ en: 'Move left or right to collect food. Jump over crates and slide below banners. Press Sprint after every move.', ar: 'تحرك يميناً أو يساراً لجمع الطعام. اقفز فوق الصناديق وانزلق تحت اللافتات. اضغط انطلق بعد كل حركة.' }, lang)}</p>{progress.status === 'ready' ? <button onClick={startRun} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8] shadow-[0_5px_0_#b85c4e]" data-testid="button-start-basket-run"><Play className="h-4 w-4" /> {t({ en: 'Start run', ar: 'ابدأ الجري' }, lang)}</button> : <button onClick={continueRun} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-6 py-3 font-bold text-[#fff7e8]" data-testid="button-continue-basket-run">{progress.hearts === 0 ? t({ en: 'Retry level', ar: 'أعد المستوى' }, lang) : level === runnerLevels.length - 1 ? t({ en: 'Finish run', ar: 'أنهِ الجري' }, lang) : t({ en: 'Next level', ar: 'المستوى التالي' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></button>}</div></div>}
          {progress.status === 'finished' && <div className="absolute inset-0 z-30 grid place-items-center bg-[#174b44]/70 p-5 text-center"><div className="max-w-sm rounded-[24px] bg-[#fff7e8] p-7 shadow-float"><Trophy className="mx-auto h-10 w-10 text-[#e8755f]" /><p className="mt-4 text-xs font-bold uppercase tracking-[.15em] text-[#e8755f]">{t({ en: 'Healthy day complete', ar: 'اكتمل اليوم الصحي' }, lang)}</p><h2 className="mt-2 font-display text-3xl font-bold text-[#174b44]">{t({ en: 'Your basket is full of good choices!', ar: 'سلتك ممتلئة باختيارات جيدة!' }, lang)}</h2><div className="mt-5 flex justify-center gap-6 text-sm font-bold text-[#174b44]"><span>{progress.score} {t({ en: 'points', ar: 'نقطة' }, lang)}</span><span>{progress.coins} {t({ en: 'coins', ar: 'عملات' }, lang)}</span></div><button onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8]" data-testid="button-restart-basket-run"><RotateCcw className="h-4 w-4" /> {t({ en: 'Run again', ar: 'اركض مجدداً' }, lang)}</button></div></div>}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e8755f]">{t({ en: 'Next marker', ar: 'العلامة التالية' }, lang)}</p><p className="mt-1 font-display text-xl font-bold text-[#174b44]">{isRunning ? t(event.hint, lang) : t(progress.message, lang)}</p><div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#557068]"><span className="rounded-full bg-[#fff0eb] px-3 py-1.5">{t({ en: 'Energy', ar: 'الطاقة' }, lang)}: {'●'.repeat(progress.hearts)}{'○'.repeat(3 - progress.hearts)}</span><span className="rounded-full bg-[#e6f1eb] px-3 py-1.5">{t({ en: 'Food found', ar: 'طعام تم جمعه' }, lang)}: {progress.collected}</span></div></div><div className="rounded-[22px] bg-[#efe4cf] p-3"><div className="grid grid-cols-4 gap-2"><button onClick={() => move(-1)} disabled={!isRunning} className="grid h-14 place-items-center rounded-2xl bg-[#fff7e8] text-[#174b44] shadow-sm disabled:opacity-40" data-testid="button-basket-left" aria-label="Move left"><ArrowLeft className="h-6 w-6" /></button><button onClick={() => move(1)} disabled={!isRunning} className="grid h-14 place-items-center rounded-2xl bg-[#fff7e8] text-[#174b44] shadow-sm disabled:opacity-40" data-testid="button-basket-right" aria-label="Move right"><ArrowRight className="h-6 w-6" /></button><button onClick={() => pose('jump')} disabled={!isRunning} className="grid h-14 place-items-center rounded-2xl bg-[#fff7e8] text-[#174b44] shadow-sm disabled:opacity-40" data-testid="button-basket-jump" aria-label="Jump"><ArrowUp className="h-6 w-6" /></button><button onClick={() => pose('slide')} disabled={!isRunning} className="grid h-14 place-items-center rounded-2xl bg-[#fff7e8] text-[#174b44] shadow-sm disabled:opacity-40" data-testid="button-basket-slide" aria-label="Slide"><ArrowDown className="h-6 w-6" /></button></div><button onClick={sprint} disabled={!isRunning} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#174b44] px-5 font-bold text-[#fff7e8] transition hover:bg-[#24665b] disabled:opacity-40" data-testid="button-basket-sprint"><Footprints className="h-5 w-5" /> {t({ en: 'Sprint to the next marker', ar: 'انطلق إلى العلامة التالية' }, lang)}</button></div></div>
      </div>
    </section>
    <p className="mt-4 text-center text-xs font-semibold text-[#688079]">{t({ en: 'Keyboard: ← → move · ↑ jump · ↓ slide · tap Sprint to run', ar: 'لوحة المفاتيح: ← → حركة · ↑ قفز · ↓ انزلاق · اضغط انطلق للجري' }, lang)}</p>
  </div>;
}

type Round = { prompt: Copy; detail: Copy; options: { label: Copy; good: boolean; note: Copy }[] };
const rounds: Round[] = [
  { prompt: { en: 'The tide is out at the mangroves.', ar: 'انحسر المد عن أشجار القرم.' }, detail: { en: 'You have one pocket and three ways to help the coast. What do you carry?', ar: 'لديك جيب واحد وثلاث طرق لمساعدة الساحل. ماذا تحمل؟' }, options: [{ label: { en: 'A reusable water bottle', ar: 'زجاجة ماء قابلة لإعادة الاستخدام' }, good: true, note: { en: 'A smart sip. Less single-use plastic means more room for mangrove life.', ar: 'رشفة ذكية. بلاستيك أقل يعني مساحة أكبر لحياة القرم.' } }, { label: { en: 'A handful of shells', ar: 'حفنة من الأصداف' }, good: false, note: { en: 'Beautiful where they are. Leave the shoreline treasures for the next tide.', ar: 'جميلة في مكانها. اترك كنوز الشاطئ للمد القادم.' } }, { label: { en: 'A paper map to throw away', ar: 'خريطة ورقية ترميها لاحقاً' }, good: false, note: { en: 'Maps are helpful, but this one needs a bin at the end of its journey.', ar: 'الخرائط مفيدة، لكن هذه تحتاج إلى سلة في نهاية رحلتها.' } }] },
  { prompt: { en: 'The midday sun is bright.', ar: 'شمس الظهيرة ساطعة.' }, detail: { en: 'Your home is cooling down. Which small switch keeps energy for the city?', ar: 'منزلك يبرد الآن. أي مفتاح صغير يحافظ على طاقة المدينة؟' }, options: [{ label: { en: 'Close the curtains, then switch off the empty room', ar: 'أغلق الستائر وأطفئ غرفة فارغة' }, good: true, note: { en: 'Double win. Shade and a switched-off room keep energy in the right place.', ar: 'فوز مزدوج. الظل والغرفة المطفأة يحافظان على الطاقة في مكانها.' } }, { label: { en: 'Open the fridge for cool air', ar: 'افتح الثلاجة للهواء البارد' }, good: false, note: { en: 'The fridge is for snacks, not shade. Let it keep its cool.', ar: 'الثلاجة للوجبات الخفيفة، لا للظل. دعها تحتفظ ببرودتها.' } }, { label: { en: 'Turn every light on', ar: 'شغّل كل الأضواء' }, good: false, note: { en: 'A bright idea, but natural light is already doing the work.', ar: 'فكرة مضيئة، لكن ضوء النهار يقوم بالمهمة بالفعل.' } }] },
  { prompt: { en: 'A new seedling needs a home.', ar: 'تحتاج شتلة جديدة إلى منزل.' }, detail: { en: 'Choose the place where it can grow with the least extra water.', ar: 'اختر المكان الذي يمكنها أن تنمو فيه بأقل قدر إضافي من الماء.' }, options: [{ label: { en: 'A native garden with a little shade', ar: 'حديقة محلية مع قليل من الظل' }, good: true, note: { en: 'The right place. Native plants know this sun and share water wisely.', ar: 'المكان المناسب. النباتات المحلية تعرف هذه الشمس وتتشارك الماء بحكمة.' } }, { label: { en: 'The hottest paved corner', ar: 'أكثر زاوية مرصوفة حرارة' }, good: false, note: { en: 'That corner needs shade before it needs a seedling.', ar: 'تحتاج تلك الزاوية إلى الظل قبل أن تحتاج إلى شتلة.' } }, { label: { en: 'A pool with no soil', ar: 'حوض بلا تربة' }, good: false, note: { en: 'A seedling needs roots and soil to begin its story.', ar: 'تحتاج الشتلة إلى جذور وتربة لتبدأ قصتها.' } }] },
  { prompt: { en: 'The city is planning a brighter route.', ar: 'تخطط المدينة لمسار أكثر إشراقاً.' }, detail: { en: 'Which idea helps people and the planet travel together?', ar: 'أي فكرة تساعد الناس والكوكب على التنقل معاً؟' }, options: [{ label: { en: 'A shaded walking path with trees', ar: 'مسار مشاة مظلل بالأشجار' }, good: true, note: { en: 'A route with room to breathe. Good for people, birds, and the city.', ar: 'مسار يتسع للتنفس. مفيد للناس والطيور والمدينة.' } }, { label: { en: 'A wider road for empty cars', ar: 'طريق أوسع لسيارات فارغة' }, good: false, note: { en: 'More road is not always more movement. Try a route people can share.', ar: 'المزيد من الطرق لا يعني دائماً حركة أكثر. جرب مساراً يتشارك فيه الناس.' } }, { label: { en: 'A path with no shade at all', ar: 'مسار بلا ظل على الإطلاق' }, good: false, note: { en: 'The best routes welcome people in every season.', ar: 'أفضل المسارات ترحب بالناس في كل فصل.' } }] },
];

function EcoRoute({ lang }: { lang: Lang }) {
  const [round, setRound] = useLocal('bunayn-eco-round', 0);
  const [score, setScore] = useLocal('bunayn-eco-score', 0);
  const [coins, setCoins] = useLocal('bunayn-coins', 120);
  const [finished, setFinished] = useLocal('bunayn-eco-finished', false);
  const [packed, setPacked] = useState<number | null>(null);
  const current = rounds[Math.min(round, rounds.length - 1)];
  const good = packed !== null && current.options[packed].good;
  const continueRoute = () => {
    if (!good) return;
    setScore((value) => value + 100);
    setCoins((value) => value + 25);
    if (round >= rounds.length - 1) setFinished(true);
    else { setRound((value) => value + 1); setPacked(null); }
  };
  const restart = () => { setRound(0); setScore(0); setCoins(120); setFinished(false); setPacked(null); };
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-home"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game library', ar: 'العودة إلى مكتبة الألعاب' }, lang)}</Link><div className="flex flex-wrap items-center justify-end gap-2"><GameTimer gameId="eco-future" lang={lang} finished={finished} /><div className="flex items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8f0] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-game-coins">{coins}</span></div></div></div>
    <section className="overflow-hidden rounded-[30px] bg-[#174b44] text-[#fff4df] shadow-float"><div className="grid lg:grid-cols-[.78fr_1.22fr]"><div className="relative min-h-[270px] overflow-hidden bg-[#2d675d] p-7 sm:p-10"><div className="absolute -end-16 -top-14 h-52 w-52 rounded-full bg-[#f2c95c]" /><div className="absolute bottom-[-60px] start-[-25px] h-48 w-72 rotate-[-17deg] rounded-[50%] bg-[#71a695]" /><div className="absolute bottom-[-65px] end-[-25px] h-48 w-64 rotate-[12deg] rounded-[50%] bg-[#3b8876]" /><div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#d7e8df]"><Leaf className="h-4 w-4 text-[#f2c95c]" /> Clean Environment and Better Future</div><h1 className="mt-8 max-w-xs font-display text-5xl font-semibold leading-[.9] tracking-[-.06em]">{t({ en: 'Pack a brighter route.', ar: 'جهّز مساراً أكثر إشراقاً.' }, lang)}</h1><p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c0dbcf]">{t({ en: 'Choose one action to carry forward at every stop.', ar: 'اختر فعلاً واحداً تحمله معك في كل محطة.' }, lang)}</p></div></div><div className="bg-[#fffaf2] p-6 text-[#174b44] sm:p-10">
      {finished ? <div className="flex min-h-[390px] flex-col justify-center text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f2c95c]"><Trophy className="h-9 w-9" /></div><p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Route complete', ar: 'اكتمل المسار' }, lang)}</p><h2 className="mt-2 font-display text-4xl font-bold tracking-tight">{t({ en: 'You packed room for tomorrow.', ar: 'جهزت مساحة للغد.' }, lang)}</h2><div className="mx-auto mt-7 flex items-center gap-6 rounded-2xl bg-[#e6f1eb] px-6 py-4"><div><span className="block font-display text-2xl font-bold">{score}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'score', ar: 'النقاط' }, lang)}</span></div><div className="h-9 w-px bg-[#c7ded1]" /><div><span className="block font-display text-2xl font-bold">{coins}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'coins', ar: 'العملات' }, lang)}</span></div></div><button onClick={restart} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8]" data-testid="button-restart-game"><RotateCcw className="h-4 w-4" /> {t({ en: 'Pack a new route', ar: 'جهّز مساراً جديداً' }, lang)}</button></div> : <div><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Route stop', ar: 'محطة المسار' }, lang)} {round + 1} / {rounds.length}</p><div className="mt-3 flex gap-1.5">{rounds.map((_, index) => <span key={index} className={`h-1.5 w-10 rounded-full ${index <= round ? 'bg-[#e8755f]' : 'bg-[#dfd2bd]'}`} />)}</div></div><div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-sm font-bold"><Star className="h-4 w-4 text-[#e8755f]" /> <span>{score}</span></div></div><p className="mt-9 text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Pick an action token for your route', ar: 'اختر رمز فعل لمسارك' }, lang)}</p><h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">{t(current.prompt, lang)}</h2><p className="mt-3 max-w-xl text-[#688079]">{t(current.detail, lang)}</p><div className="mt-6 min-h-20 rounded-[22px] border-2 border-dashed border-[#c8d2c7] bg-[#efe4cf] p-3"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#688079]">{t({ en: 'Your route pack', ar: 'حقيبة مسارك' }, lang)}</p>{packed === null ? <p className="mt-2 text-sm font-semibold text-[#9aaba0]">{t({ en: 'Choose one action below.', ar: 'اختر فعلاً واحداً أدناه.' }, lang)}</p> : <p className="signature-pop mt-2 rounded-xl bg-[#fffaf2] px-3 py-2 text-sm font-bold">{t(current.options[packed].label, lang)}</p>}</div><div className="mt-5 grid gap-3">{current.options.map((option, index) => <button key={index} onClick={() => packed === null && setPacked(index)} className={`flex items-center gap-4 rounded-2xl border p-4 text-start transition ${packed === index ? good ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5 hover:border-[#33705f]'}`} data-testid={`button-eco-token-${index + 1}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#efe4cf] font-display font-bold">{index + 1}</span><span className="flex-1 text-sm font-semibold">{t(option.label, lang)}</span></button>)}</div>{packed !== null && <LevelFeedback good={good} message={good ? current.options[packed].note : { en: 'This token will not help the route. Unpack it and choose a kinder next step.', ar: 'لن يساعد هذا الرمز المسار. أعده واختر خطوة تالية ألطف.' }} lang={lang} onNext={continueRoute} onRetry={() => setPacked(null)} final={round >= rounds.length - 1} />}</div>}
    </div></div></section><p className="mt-5 text-center text-xs font-semibold text-[#688079]">{t({ en: 'Touch an action token, or use Tab then Enter/Space to pack your route', ar: 'اضغط رمز فعل، أو استخدم Tab ثم Enter أو Space لتجهيز مسارك' }, lang)}</p>
  </div>;
}
function EcoFuture({ lang }: { lang: Lang }) {
  const [round, setRound] = useLocal('bunayn-eco-round', 0);
  const [score, setScore] = useLocal('bunayn-eco-score', 0);
  const [coins, setCoins] = useLocal('bunayn-coins', 120);
  const [finished, setFinished] = useLocal('bunayn-eco-finished', false);
  const [selected, setSelected] = useState<number | null>(null);
  const current = rounds[Math.min(round, rounds.length - 1)];
  const choose = (index: number) => {
    if (selected !== null || finished || !current.options[index]) return;
    setSelected(index);
    if (current.options[index].good) { setScore((value) => value + 100); setCoins((value) => value + 25); }
  };
  const next = () => {
    if (selected === null) return;
    if (round >= rounds.length - 1) setFinished(true);
    else { setRound((value) => value + 1); setSelected(null); }
  };
  const restart = () => { setRound(0); setScore(0); setCoins(120); setFinished(false); setSelected(null); };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= '3') choose(Number(event.key) - 1);
      if (event.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12"><div className="mb-7 flex items-center justify-between"><Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-home"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game library', ar: 'العودة إلى مكتبة الألعاب' }, lang)}</Link><div className="flex items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8f0] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-game-coins">{coins}</span></div></div><section className="overflow-hidden rounded-[30px] bg-[#174b44] text-[#fff4df] shadow-float"><div className="grid lg:grid-cols-[.78fr_1.22fr]"><div className="relative min-h-[240px] overflow-hidden bg-[#2d675d] p-7 sm:p-10"><div className="absolute -end-16 -top-14 h-52 w-52 rounded-full bg-[#f2c95c]" /><div className="absolute bottom-[-60px] start-[-25px] h-48 w-72 rotate-[-17deg] rounded-[50%] bg-[#71a695]" /><div className="absolute bottom-[-65px] end-[-25px] h-48 w-64 rotate-[12deg] rounded-[50%] bg-[#3b8876]" /><div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#d7e8df]"><Leaf className="h-4 w-4 text-[#f2c95c]" /> Eco Future</div><h1 className="mt-8 max-w-xs font-display text-5xl font-semibold leading-[.9] tracking-[-.06em]">{t({ en: 'Grow the good.', ar: 'ازرع الخير.' }, lang)}</h1><p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c0dbcf]">{t({ en: 'A choice-powered journey through the places we call home.', ar: 'رحلة تقودها الاختيارات عبر الأماكن التي نسميها وطننا.' }, lang)}</p></div></div><div className="bg-[#fffaf2] p-6 text-[#174b44] sm:p-10">{finished ? <div className="flex min-h-[370px] flex-col justify-center text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f2c95c] text-[#174b44]"><Trophy className="h-9 w-9" /></div><p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Trail complete', ar: 'اكتمل المسار' }, lang)}</p><h2 className="mt-2 font-display text-4xl font-bold tracking-tight">{t({ en: 'You made room for tomorrow.', ar: 'لقد صنعت مساحة للغد.' }, lang)}</h2><p className="mx-auto mt-4 max-w-md text-[#688079]">{t({ en: 'Four thoughtful choices, one brighter trail. Your progress is saved on this device.', ar: 'أربعة اختيارات واعية ومسار أكثر إشراقاً. تم حفظ تقدمك على هذا الجهاز.' }, lang)}</p><div className="mx-auto mt-7 flex items-center gap-6 rounded-2xl bg-[#e6f1eb] px-6 py-4"><div><span className="block font-display text-2xl font-bold" data-testid="text-final-score">{score}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'score', ar: 'النقاط' }, lang)}</span></div><div className="h-9 w-px bg-[#c7ded1]" /><div><span className="block font-display text-2xl font-bold">100%</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'trail complete', ar: 'اكتمل المسار' }, lang)}</span></div></div><button onClick={restart} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8] transition hover:-translate-y-0.5" data-testid="button-restart-game"><RotateCcw className="h-4 w-4" /> {t({ en: 'Play the trail again', ar: 'العب المسار مجدداً' }, lang)}</button></div> : <div><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Choice', ar: 'الاختيار' }, lang)} {round + 1} / {rounds.length}</p><div className="mt-3 flex gap-1.5">{rounds.map((_, index) => <span key={index} className={`h-1.5 w-10 rounded-full ${index <= round ? 'bg-[#e8755f]' : 'bg-[#dfd2bd]'}`} />)}</div></div><div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-sm font-bold"><Star className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-game-score">{score}</span></div></div><h2 className="mt-12 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">{t(current.prompt, lang)}</h2><p className="mt-3 max-w-xl text-[#688079]">{t(current.detail, lang)}</p><div className="mt-7 grid gap-3">{current.options.map((option, index) => { const active = selected === index; const correct = active && option.good; return <button key={index} onClick={() => choose(index)} aria-pressed={active} className={`group flex items-center gap-4 rounded-2xl border p-4 text-start transition-all ${active ? correct ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd2bd] bg-[#fcf8f0] hover:-translate-y-0.5 hover:border-[#33705f]'}`} data-testid={`button-choice-${index + 1}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${active ? correct ? 'bg-[#33705f] text-white' : 'bg-[#e8755f] text-white' : 'bg-[#efe4cf] text-[#557068]'}`}>{active ? correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" /> : index + 1}</span><span className="flex-1 text-sm font-semibold text-[#174b44]">{t(option.label, lang)}</span><ChevronRight className={`h-4 w-4 text-[#9aaba0] transition-transform group-hover:translate-x-1 rtl:rotate-180 ${active ? 'opacity-100' : 'opacity-0'}`} /></button>; })}</div>{selected !== null && <div className={`mt-5 rounded-2xl p-4 ${current.options[selected].good ? 'bg-[#e6f1eb]' : 'bg-[#fff0eb]'}`} role="status" data-testid="status-choice-feedback"><p className="text-sm font-semibold leading-relaxed text-[#174b44]">{t(current.options[selected].note, lang)}</p><button onClick={next} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-4 py-2 text-xs font-bold text-[#fff4df]" data-testid="button-next-choice">{round >= rounds.length - 1 ? t({ en: 'Finish trail', ar: 'إنهاء المسار' }, lang) : t({ en: 'Next choice', ar: 'الاختيار التالي' }, lang)} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></button></div>}</div>}</div></div></section><p className="mt-5 text-center text-xs font-semibold text-[#688079]">{t({ en: 'Choose with 1, 2, or 3 · Press Enter to continue', ar: 'اختر باستخدام 1 أو 2 أو 3 · اضغط Enter للمتابعة' }, lang)}</p></div>;
}

function Admin({ lang }: { lang: Lang }) {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [round] = useLocal<number>('bunayn-eco-round', 0);
  const [finished] = useLocal<boolean>('bunayn-eco-finished', false);
  const [coins] = useLocal<number>('bunayn-coins', 120);
  const [showNote, setShowNote] = useState(false);
  const localPlayer: PlayerRow | null = profile ? { name: profile.name, initials: profile.avatar, level: finished ? 'Level 02' : 'Level 01', coins, progress: finished ? 100 : Math.round((round / rounds.length) * 100), lastActive: 'This device', tone: 'bg-[#f2c95c]' } : null;
  const players = localPlayer ? [localPlayer, ...demoPlayers.filter((player) => player.name !== localPlayer.name)] : demoPlayers;
  const totalProgress = Math.round(players.reduce((sum, player) => sum + player.progress, 0) / players.length);
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#33705f]"><LockKeyhole className="h-3.5 w-3.5" /> {t({ en: 'Admin workspace', ar: 'مساحة المشرف' }, lang)}</div><h1 className="font-display text-5xl font-semibold tracking-[-.06em] text-[#174b44]">{t({ en: 'The learning trail, in view.', ar: 'مسار التعلم، أمامك.' }, lang)}</h1><p className="mt-3 max-w-xl text-[#6b7e76]">{t({ en: 'This area is protected by a server-side admin session. Telemetry is collected without using children’s names in analytics data.', ar: 'هذه المساحة محمية بجلسة مشرف من الخادم. تُجمع بيانات التفاعل دون استخدام أسماء الأطفال في بيانات التحليلات.' }, lang)}</p></div><div className="flex flex-wrap items-center gap-3"><button onClick={() => setShowNote((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c8d2c7] bg-[#fcf8f0] px-5 py-3 text-sm font-bold text-[#174b44] hover:border-[#174b44]" data-testid="button-dashboard-note"><CircleHelp className="h-4 w-4" /> {t({ en: 'About this space', ar: 'عن هذه المساحة' }, lang)}</button><Link href="/admin/workbench" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2140a8] bg-[#2140a8] px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#152c79] transition hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_#152c79]" data-testid="link-workbench"><BarChart3 className="h-4 w-4" /> {t({ en: 'Analysis Workbench', ar: 'منصة التحليل' }, lang)}</Link></div></div>{showNote && <div className="mt-5 rounded-2xl border border-[#e6cc8a] bg-[#fff3cc] px-5 py-4 text-sm font-semibold text-[#66532f]" role="status" data-testid="status-dashboard-note">{t({ en: 'Telemetry APIs require an administrator session. Children see only their own play experience, not analytics scores or comparisons.', ar: 'واجهات Telemetry تتطلب جلسة مشرف. يرى الأطفال تجربة لعبهم فقط، وليس درجات التحليلات أو المقارنات.' }, lang)}</div>}<section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ icon: Users, label: { en: 'Named players', ar: 'اللاعبون' }, value: players.length.toString(), detail: 'Across this snapshot' }, { icon: Gamepad2, label: { en: 'Game worlds', ar: 'عوالم الألعاب' }, value: gameBlueprints.length.toString(), detail: 'All 3 levels playable' }, { icon: BarChart3, label: { en: 'Average progress', ar: 'متوسط التقدم' }, value: `${totalProgress}%`, detail: 'Across all trails' }, { icon: Coins, label: { en: 'Coins in play', ar: 'العملات' }, value: players.reduce((sum, player) => sum + player.coins, 0).toString(), detail: 'Collected locally' }].map(({ icon: Icon, label, value, detail }) => <div key={value + detail} className="rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-5 shadow-soft"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#efe1bf] text-[#174b44]"><Icon className="h-5 w-5" /></div><span className="font-display text-3xl font-bold text-[#174b44]" data-testid={`metric-${String(label.en).toLowerCase().replace(' ', '-')}`}>{value}</span></div><p className="mt-6 text-sm font-bold text-[#174b44]">{t(label, lang)}</p><p className="mt-1 text-xs text-[#7b8a82]">{detail}</p></div>)}</section><section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><div className="overflow-hidden rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0]"><div className="flex items-center justify-between border-b border-[#dfd2bd] px-5 py-5 sm:px-7"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Player activity', ar: 'نشاط اللاعبين' }, lang)}</p><h2 className="mt-1 font-display text-2xl font-bold text-[#174b44]">{t({ en: 'Learners on the trail', ar: 'المتعلمون في المسار' }, lang)}</h2></div><span className="rounded-full bg-[#e6f1eb] px-3 py-1 text-xs font-bold text-[#33705f]">Local demo</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-start"><thead className="bg-[#f3eadb] text-xs uppercase tracking-[.12em] text-[#7a897f]"><tr><th className="px-5 py-3 text-start font-bold sm:px-7">Player</th><th className="px-4 py-3 text-start font-bold">Level</th><th className="px-4 py-3 text-start font-bold">Progress</th><th className="px-4 py-3 text-start font-bold">Coins</th><th className="px-4 py-3 text-start font-bold">Last active</th></tr></thead><tbody>{players.map((player) => <tr key={player.name} className="border-t border-[#eee3d2]"><td className="px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-full ${player.tone} font-display text-xs font-bold text-[#174b44]`}>{player.initials}</span><span className="font-bold text-[#174b44]" data-testid={`player-name-${player.initials}`}>{player.name}</span></div></td><td className="px-4 py-4 text-sm font-semibold text-[#557068]">{player.level}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-2 w-20 overflow-hidden rounded-full bg-[#e2e7dd]"><div className="h-full rounded-full bg-[#33705f]" style={{ width: `${player.progress}%` }} /></div><span className="text-xs font-bold text-[#557068]">{player.progress}%</span></div></td><td className="px-4 py-4 text-sm font-bold text-[#174b44]">{player.coins}</td><td className="px-4 py-4 text-xs font-semibold text-[#7a897f]">{player.lastActive}</td></tr>)}</tbody></table></div></div><div className="rounded-[24px] bg-[#174b44] p-6 text-[#fff4df]"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{t({ en: 'Game summary', ar: 'ملخص الألعاب' }, lang)}</p><h2 className="mt-2 font-display text-2xl font-bold">{t({ en: 'Worlds taking shape', ar: 'عوالم تتشكل' }, lang)}</h2><div className="mt-7 space-y-5">{[{ name: 'Eco Future', status: 'Playable', value: `${totalProgress}%`, color: '#f2c95c' }, { name: 'Our Heritage', status: 'Playable · 3 levels', value: '68%', color: '#71a695' }, { name: 'Color Focus', status: 'Playable · 3 levels', value: '41%', color: '#e8755f' }].map((game) => <div key={game.name}><div className="flex items-center justify-between text-sm"><span className="font-bold">{game.name}</span><span className="text-[#b7d1c5]">{game.status}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#397467]"><div className="h-full rounded-full" style={{ width: game.value, backgroundColor: game.color }} /></div><p className="mt-1 text-end text-xs font-bold text-[#b7d1c5]">{game.value} ready</p></div>)}</div><Link href="/library" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#f2c95c] hover:text-[#fff4df]" data-testid="link-dashboard-library">{t({ en: 'View all game worlds', ar: 'عرض جميع العوالم' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div></section></div>;
}

function AdminLogin({ lang }: { lang: Lang }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) { setError(t({ en: 'Enter the administrator password.', ar: 'أدخل كلمة مرور المشرف.' }, lang)); return; }
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/admin/auth/login', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!response.ok) {
        setError(t({ en: 'The password was not accepted.', ar: 'كلمة المرور غير صحيحة.' }, lang));
        return;
      }
       window.location.assign('/admin');
    } catch {
      setError(t({ en: 'We could not reach the secure admin service. Please try again.', ar: 'تعذر الوصول إلى خدمة المشرف الآمنة. حاول مجدداً.' }, lang));
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="mx-auto flex min-h-[calc(100dvh-78px)] max-w-xl items-center px-5 py-12"><form onSubmit={submit} className="w-full rounded-[28px] border border-[#d6e2e9] bg-[#fcf8f0] p-7 shadow-float sm:p-9" data-testid="form-admin-login"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2140a8] text-white"><LockKeyhole className="h-6 w-6" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Restricted area', ar: 'منطقة محمية' }, lang)}</p><h1 className="mt-2 font-display text-4xl font-bold text-[#174b44]">{t({ en: 'Admin sign in', ar: 'دخول المشرف' }, lang)}</h1><p className="mt-3 text-sm leading-relaxed text-[#688079]">{t({ en: 'Telemetry and learning analytics are available only to an authorised administrator.', ar: 'بيانات Telemetry وتحليلات التعلّم متاحة للمشرف المصرّح له فقط.' }, lang)}</p><label htmlFor="admin-username" className="sr-only">Administrator</label><input id="admin-username" name="username" type="text" autoComplete="username" tabIndex={-1} aria-hidden="true" className="hidden" value="admin" readOnly /><label htmlFor="admin-password" className="mt-7 block text-sm font-bold text-[#174b44]">{t({ en: 'Administrator password', ar: 'كلمة مرور المشرف' }, lang)}</label><input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} className="mt-2 w-full rounded-xl border border-[#c8d2c7] bg-white px-4 py-3 text-[#174b44] outline-none transition focus:border-[#2140a8] focus:ring-2 focus:ring-[#2140a8]/20" data-testid="input-admin-password" />{error && <p className="mt-3 text-sm font-semibold text-[#b64038]" role="alert" data-testid="status-admin-login-error">{error}</p>}<button type="submit" disabled={submitting} className="mt-6 inline-flex w-full justify-center rounded-full bg-[#2140a8] px-5 py-3 font-bold text-white shadow-[0_4px_0_#152c79] disabled:opacity-60" data-testid="button-admin-sign-in">{submitting ? t({ en: 'Signing in…', ar: 'جارٍ تسجيل الدخول…' }, lang) : t({ en: 'Open admin workspace', ar: 'افتح مساحة المشرف' }, lang)}</button><Link href="/login" className="mt-5 block text-center text-sm font-bold text-[#0b6a79]">{t({ en: 'Back to player sign in', ar: 'العودة إلى دخول اللاعب' }, lang)}</Link></form></div>;
}

function AdminRoute({ lang }: { lang: Lang }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking');
  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth/me', { credentials: 'include' }).then((response) => {
      if (active) setStatus(response.ok ? 'allowed' : 'blocked');
    }).catch(() => { if (active) setStatus('blocked'); });
    return () => { active = false; };
  }, []);
  if (status === 'checking') return <div className="mx-auto grid min-h-[42vh] max-w-[760px] place-items-center px-5 text-center text-sm font-bold text-[#557068]">{t({ en: 'Checking secure access…', ar: 'جارٍ التحقق من الوصول الآمن…' }, lang)}</div>;
  if (status === 'allowed') return <Admin lang={lang} />;
  return <AdminLogin lang={lang} />;
}

function RootPage({ lang }: { lang: Lang }) {
  return <Welcome lang={lang} setLang={() => undefined} />;
}

function GameRoute({ lang }: { lang: Lang }) {
  const [, params] = useRoute<{ id: string }>('/game/:id');
  if (params?.id === 'basket-challenge') return <BasketRunner lang={lang} />;
  return <SignatureWorld lang={lang} gameId={params?.id || 'heritage'} />;
}

function WorkbenchRoute({ lang }: { lang: Lang }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking');
  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth/me', { credentials: 'include' }).then((response) => {
      if (active) setStatus(response.ok ? 'allowed' : 'blocked');
    }).catch(() => { if (active) setStatus('blocked'); });
    return () => { active = false; };
  }, []);
  if (status === 'checking') return <div className="mx-auto grid min-h-[42vh] max-w-[760px] place-items-center px-5 text-center text-sm font-bold text-[#557068]">{t({ en: 'Checking secure access…', ar: 'جارٍ التحقق من الوصول الآمن…' }, lang)}</div>;
  if (status === 'allowed') return <Workbench lang={lang} />;
  return <AdminLogin lang={lang} />;
}

function EventEndedRedirect({ lang }: { lang: Lang }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/library?category=event&status=ended');
  }, [setLocation]);
  return <div className="grid min-h-[55vh] place-items-center bg-[#0b0f1a] px-5 text-center text-[#f5f5f0]"><div><LockKeyhole className="mx-auto h-10 w-10 text-[#f6d66b]" /><h1 className="mt-4 font-display text-3xl font-bold">{t({ en: 'This event has ended.', ar: 'انتهت هذه الفعالية.' }, lang)}</h1><p className="mt-2 text-[#b8c4d4]">{t({ en: 'Returning you to the event archive…', ar: 'نعيدك إلى أرشيف الفعاليات…' }, lang)}</p></div></div>;
}

function RouterContent({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  const [location] = useLocation();
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const summary = usePlayerSummary();
  const translator = (copy: Copy) => t(copy, lang);

  if (location === '/' || location === '/welcome') {
    return <Welcome lang={lang} setLang={setLang} />;
  }

  return <Shell lang={lang} setLang={setLang}><Switch><Route path="/welcome" component={() => <Welcome lang={lang} setLang={setLang} />} /><Route path="/login" component={() => <Login lang={lang} setLang={setLang} />} /><Route path="/" component={() => <RootPage lang={lang} />} /><Route path="/eco-future" component={() => <EcoRoute lang={lang} />} /><Route path="/game/:id" component={() => <GameRoute lang={lang} />} /><Route path="/play/clean_environment_better_future" component={() => <EventEndedRedirect lang={lang} />} /><Route path="/library" component={() => <LibraryPage lang={lang} translator={translator} worlds={summary.worlds} />} /><Route path="/games" component={() => <GamesIndexPage lang={lang} />} /><Route path="/games/categories/:slug" component={() => <CategoryDetailPage lang={lang} />} /><Route path="/games/domains/:slug" component={() => <DomainDetailPage lang={lang} />} /><Route path="/games/tiers" component={() => <TiersPage lang={lang} />} /><Route path="/games/request" component={() => <RequestGamePageForm lang={lang} />} /><Route path="/store" component={() => <StorePage lang={lang} translator={translator} profile={profile} summary={summary} />} /><Route path="/progress" component={() => <ProgressPage lang={lang} translator={translator} profile={profile} summary={summary} />} /><Route path="/player" component={() => <ProgressPage lang={lang} translator={translator} profile={profile} summary={summary} />} /><Route path="/admin/login" component={() => <AdminLogin lang={lang} />} /><Route path="/admin" component={() => <AdminRoute lang={lang} />} /><Route path="/admin/workbench" component={() => <WorkbenchRoute lang={lang} />} /><Route component={NotFound} /></Switch></Shell>;
}

function App() {
  const [lang, setLang] = useLocal<Lang>('bunayn-language', 'ar');
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = logoPath;
    if (!favicon.parentElement) document.head.appendChild(favicon);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><RouterContent lang={lang} setLang={setLang} /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;

type ColorRun = { status: 'ready' | 'running' | 'paused'; timeLeft: number; hits: number; misses: number; streak: number };

function ColorFocus({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'color-focus')!;
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [run, setRun] = useState<ColorRun>({ status: 'ready', timeLeft: 60, hits: 0, misses: 0, streak: 0 });
  const cycle = usePlayerContentCycle();
  const config = getColorFocusLevel(cycle);
  const level = Math.min(progress.level, 2);
  const runtime = useGameRuntime({ gameId: game.id, lang, level, profile: profile ?? undefined, finished: progress.finished });
  const boardRound = run.hits + run.misses;
  const target = config.palette[(boardRound + level) % config.palette.length]!;
  const targetIndex = (boardRound * 5 + level) % 9;
  const shapes = ['●', '■', '▲', '◆', '★', '✚', '⬟', '✦', '⬢'];
  const board = useMemo(() => ({
    targetIndex,
    targetShape: shapes[targetIndex]!,
    colors: Array.from({ length: 9 }, (_, index) => index === targetIndex ? target : config.palette[(index + boardRound + 1) % config.palette.length]!),
  }), [boardRound, config.palette, target, targetIndex]);
  const item = useTelemetryItem(runtime.telemetry, `CF-L${level + 1}-R${boardRound + 1}`, {
    difficulty: runtime.difficulty,
    modality: 'image',
    optionCount: board.colors.length,
  });
  const startRun = () => setRun({ status: 'running', timeLeft: 60, hits: 0, misses: 0, streak: 0 });
  const togglePause = () => setRun((value) => value.status === 'running' ? { ...value, status: 'paused' } : value.status === 'paused' ? { ...value, status: 'running' } : value);
  const choose = (index: number) => {
    if (run.status !== 'running') return;
    const good = index === board.targetIndex;
    item.firstInput();
    item.submit({ tile: index, color: board.colors[index], shape: shapes[index] });
    item.resolve({ correct: good, value: index, strategySignature: 'color-shape-match' });
    setRun((value) => {
      const hits = value.hits + (good ? 1 : 0);
      const misses = value.misses + (good ? 0 : 1);
      const nextLevel = Math.min(2, Math.floor(hits / 5));
      if (nextLevel > level) runtime.telemetry.endLevel(`level-${level + 1}`, { hits, misses });
      setProgress((saved) => ({ ...saved, level: nextLevel, score: saved.score + (good ? 80 + runtime.difficulty * 10 : 0), coins: saved.coins + (good && hits % 3 === 0 ? 1 : 0) }));
      return { ...value, hits, misses, streak: good ? value.streak + 1 : 0 };
    });
  };
  useEffect(() => {
    if (run.status !== 'running') return;
    const timer = window.setInterval(() => {
      setRun((value) => {
        if (value.timeLeft > 1) return { ...value, timeLeft: value.timeLeft - 1 };
        item.timeout();
        setProgress((saved) => ({ ...saved, finished: true, level: 2 }));
        return { ...value, timeLeft: 0, status: 'ready' };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [item, run.status, setProgress]);
  const restart = () => {
    setProgress({ level: 0, score: 0, coins: 0, finished: false });
    setRun({ status: 'ready', timeLeft: 60, hits: 0, misses: 0, streak: 0 });
  };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} paused={run.status === 'paused'} onPause={togglePause} instruction={{ en: 'Start the 60-second run, then match each target colour and shape · Space pauses', ar: 'ابدأ الجولة لمدة ٦٠ ثانية ثم طابق كل لون وشكل مستهدف · المسافة للإيقاف المؤقت' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={3} />
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: '60-second signal run', ar: 'سباق الإشارة لمدة ٦٠ ثانية' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{t({ en: 'Find the target colour and shape.', ar: 'اعثر على اللون والشكل المستهدفين.' }, lang)}</h2></div><div className="rounded-2xl bg-[#174b44] px-4 py-3 text-center text-[#fff4df]"><span className="block font-display text-3xl font-bold" dir="ltr">{run.timeLeft}s</span><span className="text-xs font-bold text-[#b7d1c5]">{t({ en: 'run clock', ar: 'مؤقت الجولة' }, lang)}</span></div></div>
    {run.status === 'ready' && !progress.finished && <div className="mt-6 rounded-[24px] bg-[#efe4cf] p-5"><p className="font-semibold text-[#557068]">{t({ en: 'The board changes after every choice. Shapes make the challenge fair for every player.', ar: 'تتغير اللوحة بعد كل اختيار. تجعل الأشكال التحدي عادلاً لكل لاعب.' }, lang)}</p><button type="button" onClick={startRun} className="mt-4 rounded-full bg-[#174b44] px-5 py-3 text-sm font-bold text-[#fff4df]" data-testid="button-start-color-run"><Play className="me-2 inline h-4 w-4" />{t({ en: 'Start run', ar: 'ابدأ الجولة' }, lang)}</button></div>}
    {run.status !== 'ready' && !progress.finished && <><div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-[#557068]"><span className="rounded-full bg-[#e6f1eb] px-3 py-2">{t({ en: 'Target', ar: 'الهدف' }, lang)} <span className="ms-1 inline-block h-4 w-4 rounded bg-[#174b44] align-middle" style={{ backgroundColor: target }} /> {board.targetShape}</span><span className="rounded-full bg-[#efe4cf] px-3 py-2">{t({ en: 'Hits', ar: 'إصابات صحيحة' }, lang)} {run.hits}</span><span className="rounded-full bg-[#fff0eb] px-3 py-2">{t({ en: 'Streak', ar: 'متتالية' }, lang)} {run.streak}</span></div><p className="mt-4 text-sm text-[#688079]">{t({ en: 'Match both the colour and the shape. Near-shades are deliberate decoys.', ar: 'طابق اللون والشكل معاً. الألوان المتقاربة تشتيت مقصود.' }, lang)}</p><div className="mx-auto mt-6 grid max-w-[390px] grid-cols-3 gap-3">{board.colors.map((color, index) => <button key={`${boardRound}-${index}`} type="button" onClick={() => choose(index)} aria-label={`Color tile ${index + 1}, ${shapes[index]}`} className="signature-tile grid aspect-square place-items-center rounded-2xl border-4 border-[#dfd2bd] transition hover:scale-105" style={{ backgroundColor: color }} data-testid={`button-color-tile-${index + 1}`}><span className="rounded-full bg-white/60 px-2 py-1 text-sm font-bold text-[#174b44]">{shapes[index]}</span></button>)}</div></>}
    {run.status === 'paused' && !progress.finished && <p className="mt-5 rounded-2xl bg-[#fff3cc] p-4 text-sm font-bold text-[#66532f]" role="status">{t({ en: 'Run paused. Resume when you are ready.', ar: 'توقفت الجولة مؤقتاً. تابع عندما تكون مستعداً.' }, lang)}</p>}
    {progress.finished && <p className="mt-6 rounded-2xl bg-[#e6f1eb] p-4 text-sm font-bold text-[#174b44]" role="status" data-testid="status-color-finished">{t({ en: `Time! You found ${run.hits} signals and built a ${Math.min(3, Math.floor(run.hits / 5) + 1)}-level focus streak.`, ar: `انتهى الوقت! عثرت على ${run.hits} إشارات وبنيت متتالية تركيز من ${Math.min(3, Math.floor(run.hits / 5) + 1)} مستويات.` }, lang)}</p>}
  </SignatureFrame>;
}

function CommonGround({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'common-ground')!;
  const [progress, setProgress] = useSignatureProgress(game.id); const [shares, setShares] = useState([0, 0, 0]); const [submitted, setSubmitted] = useState(false);
  const levels = [{ needs: [2, 1, 3], names: [{ en: 'A younger child', ar: 'طفل أصغر' }, { en: 'A prepared neighbour', ar: 'جار مستعد' }, { en: 'A family sharing', ar: 'عائلة تتشارك' }] }, { needs: [3, 2, 1], names: [{ en: 'The ramp', ar: 'المنحدر' }, { en: 'Shade trees', ar: 'أشجار الظل' }, { en: 'The clinic', ar: 'العيادة' }] }, { needs: [1, 3, 2], names: [{ en: 'A quiet voice', ar: 'صوت هادئ' }, { en: 'A busy family', ar: 'عائلة مشغولة' }, { en: 'A new neighbour', ar: 'جار جديد' }] }];
  const level = levels[progress.level]; const good = shares.every((value, index) => value === level.needs[index]); const total = shares.reduce((sum, value) => sum + value, 0);
  const adjust = (index: number, amount: number) => { if (submitted) return; setShares((value) => { const next = [...value]; if (amount > 0 && total >= 6) return value; next[index] = Math.max(0, next[index] + amount); return next; }); };
  const next = () => { if (progress.level === 2) setProgress((value) => ({ ...value, score: value.score + 140, coins: value.coins + 14, finished: true })); else { setProgress((value) => ({ ...value, level: value.level + 1, score: value.score + 140, coins: value.coins + 14 })); setShares([0, 0, 0]); setSubmitted(false); } }; const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); setShares([0, 0, 0]); setSubmitted(false); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Use + and − to share 6 tokens fairly · Keyboard support: tab to each control', ar: 'استخدم + و− لتوزيع ٦ رموز بعدل · لوحة المفاتيح: انتقل إلى الأزرار بالضغط على Tab' }}>
    <SignatureProgressBar progress={progress} lang={lang} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Fair shares', ar: 'حصص عادلة' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{t({ en: 'Listen before you share.', ar: 'استمع قبل أن تتشارك.' }, lang)}</h2><p className="mt-2 text-[#688079]">{t({ en: 'You have 6 tokens. Different needs can make a fair share different from an equal share.', ar: 'لديك ٦ رموز. قد تجعل الاحتياجات المختلفة الحصة العادلة مختلفة عن الحصة المتساوية.' }, lang)}</p><div className="mt-7 space-y-3">{level.names.map((name, index) => <div key={name.en} className="flex items-center gap-3 rounded-2xl border border-[#dfd4c1] bg-[#fcf8f0] p-3"><div className="flex-1"><p className="font-bold">{t(name, lang)}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e3e6d9]"><div className="h-full rounded-full bg-[#71a695] transition-all" style={{ width: `${(shares[index] / 3) * 100}%` }} /></div></div><button onClick={() => adjust(index, -1)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#efe4cf] font-bold" aria-label={`Remove from ${index + 1}`} data-testid={`button-share-minus-${index + 1}`}>−</button><span className="w-5 text-center font-display font-bold">{shares[index]}</span><button onClick={() => adjust(index, 1)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2c95c] font-bold" aria-label={`Add to ${index + 1}`} data-testid={`button-share-plus-${index + 1}`}>+</button></div>)}</div><p className="mt-4 text-sm font-bold text-[#557068]">{total} / 6 {t({ en: 'tokens shared', ar: 'رموز موزعة' }, lang)}</p>{!submitted ? <button onClick={() => setSubmitted(true)} disabled={total !== 6} className="mt-5 rounded-full bg-[#174b44] px-5 py-3 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-submit-shares">{t({ en: 'Show the outcome', ar: 'اعرض النتيجة' }, lang)}</button> : <LevelFeedback good={good} message={good ? { en: 'You noticed the needs behind the numbers. That is fair leadership.', ar: 'لاحظت الاحتياجات خلف الأرقام. هذه قيادة عادلة.' } : { en: 'Equal is not always fair. Listen to each need and rebalance the tokens.', ar: 'المتساوي ليس عادلاً دائماً. استمع لكل احتياج وأعد توزيع الرموز.' }} lang={lang} onNext={next} onRetry={() => { setShares([0, 0, 0]); setSubmitted(false); }} final={progress.level === 2} />}</SignatureFrame>;
}

function BotWorkshop({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'bot-workshop')!;
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [program, setProgram] = useState<string[]>([]); const [ran, setRan] = useState(false);
  const levels = [{ goal: { en: 'Reach the battery in two steps.', ar: 'صل إلى البطارية في خطوتين.' }, blocks: ['Forward', 'Turn', 'Pick up'], answer: ['Forward', 'Forward', 'Pick up'] }, { goal: { en: 'Go around the wall, then collect the battery.', ar: 'تجاوز الجدار ثم اجمع البطارية.' }, blocks: ['Forward', 'Turn right', 'Turn left', 'Pick up'], answer: ['Forward', 'Turn right', 'Forward', 'Pick up'] }, { goal: { en: 'Guide both bots to their matching flags.', ar: 'وجّه الروبوتين إلى العلمين المطابقين.' }, blocks: ['Forward', 'Turn', 'Wait', 'Pick up'], answer: ['Forward', 'Wait', 'Pick up'] }];
  const level = levels[progress.level]; const good = program.join('|') === level.answer.join('|'); const run = () => setRan(true);
  const next = () => { if (progress.level === 2) setProgress((value) => ({ ...value, score: value.score + (good ? 140 : 50), coins: value.coins + (good ? 14 : 5), finished: true })); else { setProgress((value) => ({ ...value, level: value.level + 1, score: value.score + (good ? 140 : 50), coins: value.coins + (good ? 14 : 5) })); setProgram([]); setRan(false); } }; const reset = () => { setProgram([]); setRan(false); }; const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); reset(); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Tap blocks to build a program, then Run · Keyboard: Tab then Enter/Space', ar: 'اضغط الكتل لبناء برنامج ثم شغّل · لوحة المفاتيح: Tab ثم Enter أو Space' }}>
    <SignatureProgressBar progress={progress} lang={lang} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Block builder', ar: 'باني الكتل' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{t(level.goal, lang)}</h2><div className="mt-7 rounded-[24px] bg-[#174b44] p-5 text-[#fff4df]"><div className="flex min-h-20 flex-wrap items-center gap-2">{program.length ? program.map((block, index) => <span key={`${block}-${index}`} className="rounded-xl bg-[#f2c95c] px-3 py-2 text-xs font-bold text-[#174b44]">{index + 1}. {block}</span>) : <span className="text-sm text-[#b7d1c5]">{t({ en: 'Add blocks to wake up the bot.', ar: 'أضف الكتل لإيقاظ الروبوت.' }, lang)}</span>}</div></div><div className="mt-5 grid grid-cols-2 gap-3">{level.blocks.map((block, index) => <button key={block} onClick={() => !ran && setProgram((value) => [...value, block])} disabled={ran} className="rounded-2xl border border-[#dfd4c1] bg-[#fcf8f0] p-3 text-sm font-bold hover:border-[#33705f] disabled:opacity-50" data-testid={`button-bot-block-${index + 1}`}>{block}</button>)}</div>{!ran ? <div className="mt-5 flex gap-2"><button onClick={reset} className="rounded-full border border-[#c8d2c7] px-4 py-2 text-sm font-bold" data-testid="button-reset-bot"><RotateCcw className="me-1 inline h-4 w-4" />{t({ en: 'Clear', ar: 'مسح' }, lang)}</button><button onClick={run} disabled={!program.length} className="rounded-full bg-[#e8755f] px-5 py-2 text-sm font-bold text-[#fff7e8] disabled:opacity-40" data-testid="button-run-bot"><Play className="me-1 inline h-4 w-4" />{t({ en: 'Run bot', ar: 'شغّل الروبوت' }, lang)}</button></div> : <LevelFeedback good={good} message={good ? { en: 'Program complete. The bot followed your plan.', ar: 'اكتمل البرنامج. اتبع الروبوت خطتك.' } : { en: 'The bot reached the wrong place. Clear the blocks and plan one step at a time.', ar: 'وصل الروبوت إلى المكان الخطأ. امسح الكتل وخطط خطوة بعد خطوة.' }} lang={lang} onNext={next} onRetry={reset} final={progress.level === 2} />}</SignatureFrame>;
}

const QUESTIONS_PER_LEVEL = 3;
function SignatureProgressBar({ progress, lang, total = 3, question }: { progress: SignatureProgress; lang: Lang; total?: number; question?: number }) {
  // Pack-backed worlds have a non-default level count; show the first prompt
  // immediately even when opening an older save that has no question cursor.
  const activeQuestion = question ?? progress.question ?? (total !== 3 ? 0 : undefined);
  return <div className="mb-8 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Level', ar: 'المستوى' }, lang)} {progress.level + 1} / {total}</p><div className="mt-3 flex gap-1.5">{Array.from({ length: total }, (_, index) => <span key={index} className={`h-1.5 min-w-6 flex-1 rounded-full ${index <= progress.level ? 'bg-[#e8755f]' : 'bg-[#dfd2bd]'}`} />)}</div></div>{activeQuestion !== undefined && <div className="rounded-2xl bg-[#efe4cf] px-3 py-2 text-center text-xs font-bold text-[#174b44]"><span className="block text-[#a66a40]">{t({ en: 'Question', ar: 'السؤال' }, lang)}</span>{activeQuestion + 1} / {QUESTIONS_PER_LEVEL}</div>}<div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-sm font-bold"><Star className="h-4 w-4 text-[#e8755f]" /> <span>{progress.score}</span></div></div>;
}

function useBoundedSignatureProgress(progress: SignatureProgress, setProgress: React.Dispatch<React.SetStateAction<SignatureProgress>>, total: number) {
  useEffect(() => {
    if (!progress.finished && progress.question === undefined && progress.level > 0) {
      // Earlier saves used level as a question index. Translate that cursor
      // rather than erasing a child's earned score and coins.
      const legacyPosition = Math.min(progress.level, total * QUESTIONS_PER_LEVEL - 1);
      setProgress((value) => ({ ...value, level: Math.floor(legacyPosition / QUESTIONS_PER_LEVEL), question: legacyPosition % QUESTIONS_PER_LEVEL }));
    } else if (!progress.finished && progress.level >= total) {
      const lastPosition = total * QUESTIONS_PER_LEVEL - 1;
      setProgress((value) => ({ ...value, level: Math.floor(lastPosition / QUESTIONS_PER_LEVEL), question: lastPosition % QUESTIONS_PER_LEVEL }));
    }
  }, [progress.finished, progress.level, progress.question, setProgress, total]);
}
function LibrarySort({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'library-sort')!;
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [book, setBook] = useState<number | null>(null);
  const [sorted, setSorted] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const levels = [
    { books: [{ title: { en: 'Stars & Space', ar: 'النجوم والفضاء' }, shelf: 0 }, { title: { en: 'Desert Birds', ar: 'طيور الصحراء' }, shelf: 1 }], shelves: [{ en: 'Science', ar: 'علوم' }, { en: 'Nature', ar: 'طبيعة' }] },
    { books: [{ title: { en: 'The Pearl Diver', ar: 'غواص اللؤلؤ' }, shelf: 0 }, { title: { en: 'Number Tricks', ar: 'حيل الأرقام' }, shelf: 1 }, { title: { en: 'Sea Turtles', ar: 'سلاحف البحر' }, shelf: 2 }], shelves: [{ en: 'Stories', ar: 'قصص' }, { en: 'Maths', ar: 'حساب' }, { en: 'Nature', ar: 'طبيعة' }] },
    { books: [{ title: { en: 'Mangrove Guide', ar: 'دليل القرم' }, shelf: 0 }, { title: { en: 'Sky Map', ar: 'خريطة السماء' }, shelf: 1 }, { title: { en: 'Poems for Friends', ar: 'قصائد للأصدقاء' }, shelf: 2 }], shelves: [{ en: 'Environment', ar: 'بيئة' }, { en: 'Science', ar: 'علوم' }, { en: 'Language', ar: 'لغة' }] },
  ];
  const level = levels[progress.level];
  const place = (shelf: number) => { if (book === null || sorted.includes(book)) return; if (level.books[book].shelf !== shelf) setWrong(true); else { setSorted((value) => [...value, book]); setBook(null); } };
  const complete = sorted.length === level.books.length;
  const next = () => { if (progress.level === 2) setProgress((value) => ({ ...value, score: value.score + 110, coins: value.coins + 10, finished: true })); else { setProgress((value) => ({ ...value, level: value.level + 1, score: value.score + 110, coins: value.coins + 10 })); setBook(null); setSorted([]); setWrong(false); } };
  const retry = () => { setBook(null); setSorted([]); setWrong(false); };
  const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); retry(); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Select a book, then tap its shelf · Keyboard: Tab then Enter/Space', ar: 'اختر كتاباً ثم اضغط رفّه · لوحة المفاتيح: Tab ثم Enter أو Space' }}>
    <SignatureProgressBar progress={progress} lang={lang} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Library sort', ar: 'ترتيب المكتبة' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{t({ en: 'Give every book a home.', ar: 'امنح كل كتاب مكاناً.' }, lang)}</h2><div className="mt-6 grid gap-5 md:grid-cols-[1fr_1fr]"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#688079]">{t({ en: 'Books', ar: 'الكتب' }, lang)}</p><div className="space-y-2">{level.books.map((item, index) => <button key={item.title.en} onClick={() => setBook(index)} disabled={sorted.includes(index)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start text-sm font-semibold ${book === index ? 'border-[#e8755f] bg-[#fff0eb]' : sorted.includes(index) ? 'border-[#33705f] bg-[#e6f1eb] opacity-70' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`} data-testid={`button-library-book-${index + 1}`}><BookOpen className="h-5 w-5 text-[#e8755f]" />{t(item.title, lang)}{sorted.includes(index) && <Check className="ms-auto h-4 w-4 text-[#33705f]" />}</button>)}</div></div><div><p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-[#688079]">{t({ en: 'Shelves', ar: 'الرفوف' }, lang)}</p><div className="space-y-2">{level.shelves.map((shelf, index) => <button key={shelf.en} onClick={() => place(index)} className="flex w-full items-center gap-3 rounded-2xl border border-[#dfd4c1] bg-[#efe4cf] p-4 text-start text-sm font-bold transition hover:border-[#33705f] hover:bg-[#e6f1eb]" data-testid={`button-library-shelf-${index + 1}`}><ChevronRight className="h-4 w-4 text-[#e8755f] rtl:rotate-180" />{t(shelf, lang)}</button>)}</div></div></div>{(wrong || complete) && <LevelFeedback good={complete} message={complete ? { en: 'Sorted! Clear shelves help everyone find knowledge.', ar: 'تم الترتيب! الرفوف الواضحة تساعد الجميع على العثور على المعرفة.' } : { en: 'That shelf does not match this book. Choose the book again and try another home.', ar: 'هذا الرف لا يناسب الكتاب. اختر الكتاب مجدداً وجرب مكاناً آخر.' }} lang={lang} onNext={next} onRetry={retry} final={progress.level === 2} />}</SignatureFrame>;
}

function InnovationLab({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'innovation-lab')!;
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [parts, setParts] = useState<string[]>([]);
  const [tested, setTested] = useState(false);
  const [rulesBuilt, setRulesBuilt] = useState<{ condition: string; action: string }[]>([]);
  const [reflection, setReflection] = useState('');
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [fixes, setFixes] = useState<string[]>([]);
  const [fixSubmitted, setFixSubmitted] = useState(false);
  const [edgeCase, setEdgeCase] = useState<number | null>(null);
  const [humanFallback, setHumanFallback] = useState(false);
  const cycle = usePlayerContentCycle();
  const totalQuestions = getInnovationItemCount(cycle);
  const round = getQuestionRound(progress, totalQuestions);
  const item = getInnovationItem(cycle, round.itemIndex);
  useBoundedSignatureProgress(progress, setProgress, round.totalLevels);
  const isTraining = !('type' in item);
  const isRuleBuilder = !isTraining && item.type === 'rule_builder';
  const trainingIcons = isTraining ? item.icons : [];
  const trainingIcon = trainingIcons[trainingIndex];
  const categoryA = isTraining ? item.category_a : { en: 'Group A', ar: 'المجموعة أ' };
  const categoryB = isTraining ? item.category_b : { en: 'Group B', ar: 'المجموعة ب' };
  const isFlaw = !isTraining && item.type === 'find_the_flaw';
  const options = isFlaw ? item.options : [];
  const prompt = isFlaw ? item.prompt : { en: 'Build, test, improve.', ar: 'ابنِ واختبر وحسّن.' };
  const mission = isRuleBuilder ? item.mission : prompt;
  const rules = isRuleBuilder ? item.rule_parts : undefined;
  const edgeCases = isRuleBuilder ? item.edge_cases : [];
  const hasFixTask = isFlaw && Boolean(item.fix_task && item.fix_options && item.fix_answer);
  const coveredEdges = isRuleBuilder ? edgeCases.filter((assessment) => !assessment.requires_human_fallback && assessment.required_rule_ids.every((required) => rulesBuilt.some((rule) => `${rule.condition}:${rule.action}` === required))) : [];
  const unresolvedEdges = isRuleBuilder ? edgeCases.filter((assessment) => assessment.requires_human_fallback) : [];
  const policyScore = coveredEdges.length;
  const expected = isTraining ? trainingIcon?.answer : isFlaw ? item.answer : '';
  const selectedCondition = parts.find((part) => part.startsWith('condition:'))?.split(':')[1] ?? '';
  const selectedAction = parts.find((part) => part.startsWith('action:'))?.split(':')[1] ?? '';
  const good = isRuleBuilder
    ? policyScore === edgeCases.filter((assessment) => !assessment.requires_human_fallback).length && edgeCase !== null && edgeCases[edgeCase]?.requires_human_fallback && humanFallback && reflection.trim().length >= 8
    : isFlaw && hasFixTask
      ? parts[0] === expected && fixes.length === item.fix_answer!.length && item.fix_answer!.every((answer) => fixes.includes(answer)) && fixSubmitted
      : parts[0] === expected;
  const addRule = () => {
    if (!selectedCondition || !selectedAction || rulesBuilt.length >= 3) return;
    if (!rulesBuilt.some((rule) => rule.condition === selectedCondition && rule.action === selectedAction)) {
      setRulesBuilt((value) => [...value, { condition: selectedCondition, action: selectedAction }]);
    }
    setParts([]);
  };
  const reset = () => { setParts([]); setTested(false); setRulesBuilt([]); setReflection(''); setTrainingIndex(0); setFixes([]); setFixSubmitted(false); setEdgeCase(null); setHumanFallback(false); };
  const test = () => {
    if (isTraining && trainingIcon && parts[0] === trainingIcon.answer && trainingIndex < trainingIcons.length - 1) {
      setTrainingIndex((value) => value + 1);
      setParts([]);
      return;
    }
    setTested(true);
  };
  const next = () => {
    const reward = Number(item.sparks) || 10;
    if (round.finalQuestion) setProgress((value) => ({ ...value, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2), finished: true }));
    else { setProgress((value) => ({ ...value, level: round.question === QUESTIONS_PER_LEVEL - 1 ? value.level + 1 : value.level, question: round.question === QUESTIONS_PER_LEVEL - 1 ? 0 : round.question + 1, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2) })); reset(); }
  };
  const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); reset(); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Choose an idea, test it, and improve it · Keyboard: Tab then Enter/Space', ar: 'اختر فكرة واختبرها وحسّنها · لوحة المفاتيح: Tab ثم Enter أو Space' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={round.totalLevels} question={round.question} />
    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Prototype bench', ar: 'طاولة النماذج' }, lang)}</p>
    <h2 className="mt-3 font-display text-3xl font-bold">{isRuleBuilder ? mission[lang] : prompt[lang]}</h2>
    {isFlaw && <p className="mt-3 rounded-2xl bg-[#efe4cf] p-4 text-sm font-semibold">{item.scenario[lang]}</p>}
    {isTraining && trainingIcon ? <>
      <p className="mt-5 text-[#688079]">{lang === 'en' ? `Sort ${trainingIndex + 1} of ${trainingIcons.length}: where does “${trainingIcon.icon.replaceAll('_', ' ')}” belong?` : `رتّب ${trainingIndex + 1} من ${trainingIcons.length}: أين ينتمي «${trainingIcon.icon.replaceAll('_', ' ')}»؟`}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => !tested && setParts(['a'])} className={`rounded-2xl border p-4 font-bold ${parts[0] === 'a' ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`} data-testid="button-prototype-part-1">{categoryA[lang]}</button>
        <button onClick={() => !tested && setParts(['b'])} className={`rounded-2xl border p-4 font-bold ${parts[0] === 'b' ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`} data-testid="button-prototype-part-2">{categoryB[lang]}</button>
      </div>
    </> : isRuleBuilder ? <>
      <p className="mt-4 text-sm text-[#688079]">{t({ en: 'Build three different IF/THEN rules, then name an edge case that needs a person.', ar: 'ابنِ ثلاث قواعد مختلفة «إذا/فإن»، ثم سمِّ حالة استثنائية تحتاج إلى شخص.' }, lang)}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><p className="mb-2 text-sm font-bold">{t({ en: 'IF…', ar: 'إذا…' }, lang)}</p>{(rules?.conditions ?? []).map((rule) => <button key={rule.id} onClick={() => !tested && setParts((value) => [...value.filter((part) => !part.startsWith('condition:')), `condition:${rule.id}`])} className={`mb-2 w-full rounded-xl border p-3 text-start text-sm font-semibold ${parts.includes(`condition:${rule.id}`) ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`}>{rule[lang]}</button>)}</div>
        <div><p className="mb-2 text-sm font-bold">{t({ en: 'THEN…', ar: 'فإن…' }, lang)}</p>{(rules?.actions ?? []).map((rule) => <button key={rule.id} onClick={() => !tested && setParts((value) => [...value.filter((part) => !part.startsWith('action:')), `action:${rule.id}`])} className={`mb-2 w-full rounded-xl border p-3 text-start text-sm font-semibold ${parts.includes(`action:${rule.id}`) ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`}>{rule[lang]}</button>)}</div>
      </div>
      <button onClick={addRule} disabled={!selectedCondition || !selectedAction || rulesBuilt.length >= 3} className="mt-3 rounded-full border border-[#33705f] px-4 py-2 text-sm font-bold text-[#174b44] disabled:opacity-40" data-testid="button-add-rule">{t({ en: 'Add this rule', ar: 'أضف هذه القاعدة' }, lang)}</button>
      <div className="mt-4 space-y-2">{rulesBuilt.map((rule, index) => <p key={`${rule.condition}-${rule.action}`} className="rounded-xl bg-[#e6f1eb] p-3 text-sm font-semibold">{index + 1}. {rules?.conditions?.find((entry) => entry.id === rule.condition)?.[lang]} → {rules?.actions?.find((entry) => entry.id === rule.action)?.[lang]}</p>)}</div>
      {rulesBuilt.length === 3 && <div className="mt-4"><p className="text-sm font-bold">{t({ en: `Your rules safely handle ${policyScore} of ${coveredEdges.length + unresolvedEdges.length} edge cases. Choose one that still needs a human.`, ar: `تعالج قواعدك بأمان ${policyScore} من أصل ${coveredEdges.length + unresolvedEdges.length} حالات استثنائية. اختر واحدة ما زالت تحتاج إلى إنسان.` }, lang)}</p><div className="mt-2 space-y-2">{edgeCases.map((assessment, index) => <button key={assessment.id} onClick={() => setEdgeCase(index)} className={`w-full rounded-xl border p-3 text-start text-sm ${edgeCase === index ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`}>{assessment[lang]} {assessment.requires_human_fallback && <span className="ms-1 text-xs font-bold text-[#a94d40]">({t({ en: 'human check', ar: 'فحص بشري' }, lang)})</span>}</button>)}</div>{edgeCase !== null && <><button onClick={() => setHumanFallback(true)} disabled={!edgeCases[edgeCase]?.requires_human_fallback} className={`mt-3 rounded-full border px-4 py-2 text-sm font-bold ${humanFallback ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1]'} disabled:opacity-40`} data-testid="button-human-fallback">{t({ en: 'Ask a human to check this case', ar: 'اطلب من إنسان فحص هذه الحالة' }, lang)}</button><label className="mt-3 block text-sm font-bold">{t({ en: 'Explain why a person should decide:', ar: 'اشرح لماذا ينبغي أن يقرر شخص:' }, lang)}<input value={reflection} onChange={(event) => setReflection(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#dfd4c1] bg-[#fcf8f0] px-3 py-2 font-normal outline-none focus:border-[#33705f]" data-testid="input-rule-reflection" /></label></>}</div>}
    </> : <div className="mt-5 grid gap-3">{options.map((option, index) => <button key={option.id} onClick={() => !tested && setParts([option.id])} className={`rounded-2xl border p-4 text-start font-semibold ${parts[0] === option.id ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`} data-testid={`button-prototype-part-${index + 1}`}>{option[lang]}</button>)}</div>}
    {isFlaw && hasFixTask && tested && parts[0] === expected && !fixSubmitted ? <div className="mt-6 rounded-2xl bg-[#efe4cf] p-4"><p className="font-bold">{item.fix_task![lang]}</p><div className="mt-3 grid grid-cols-2 gap-2">{item.fix_options!.map((option) => <button key={option} onClick={() => setFixes((value) => value.includes(option) ? value.filter((entry) => entry !== option) : value.length < item.fix_answer!.length ? [...value, option] : value)} className={`rounded-xl border p-3 text-sm font-semibold ${fixes.includes(option) ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`}>{option.replaceAll('_', ' ')}</button>)}</div><button onClick={() => setFixSubmitted(true)} disabled={fixes.length !== item.fix_answer!.length} className="mt-4 rounded-full bg-[#174b44] px-4 py-2 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-apply-fixes">{t({ en: 'Apply examples', ar: 'طبّق الأمثلة' }, lang)}</button></div> : !tested ? <button onClick={test} disabled={isRuleBuilder ? rulesBuilt.length < 3 : !parts.length} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-5 py-3 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-test-prototype"><Zap className="h-4 w-4" /> {isRuleBuilder ? t({ en: 'Review rules', ar: 'راجع القواعد' }, lang) : t({ en: 'Test prototype', ar: 'اختبر النموذج' }, lang)}</button> : <LevelFeedback good={good} message={isRuleBuilder ? good ? { en: `Your rules handle ${policyScore} safety cases and your human fallback protects the rest.`, ar: `تعالج قواعدك ${policyScore} من حالات السلامة وبديلك البشري يحمي الباقي.` } : { en: `Your rules handle ${policyScore} clear cases. Cover every safe edge case, then choose a supplied human-check case and explain why.`, ar: `تعالج قواعدك ${policyScore} من الحالات الواضحة. عالج كل الحالات الآمنة ثم اختر حالة فحص بشري من المحتوى واشرح السبب.` } : good ? getPackCopy(isFlaw ? item.explain : undefined, { en: 'Your small test taught you something useful. That is innovation.', ar: 'علّمك الاختبار الصغير شيئاً مفيداً. هذا هو الابتكار.' }) : { en: hasFixTask && fixSubmitted ? 'Those examples still leave the robot with a narrow view. Choose three varied birds.' : 'Try a different choice and test the idea again.', ar: hasFixTask && fixSubmitted ? 'تلك الأمثلة ما زالت تمنح الروبوت رؤية ضيقة. اختر ثلاثة طيور متنوعة.' : 'جرّب خيارًا مختلفًا واختبر الفكرة مجددًا.' }} lang={lang} onNext={next} onRetry={reset} final={round.finalQuestion} />}
  </SignatureFrame>;
}

function HeritageSequence({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'heritage')!;
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [chosen, setChosen] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [memoryPick, setMemoryPick] = useState<string | null>(null);
  const [memoryMatches, setMemoryMatches] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const [paused, setPaused] = useState(false);
  const cycle = usePlayerContentCycle();
  const level = Math.min(progress.level, 2);
  const item = getHeritageItem(cycle, level);
  const runtime = useGameRuntime({ gameId: game.id, lang, level, profile: profile ?? undefined, finished: progress.finished });
  const telemetryItem = useTelemetryItem(runtime.telemetry, item.id, {
    difficulty: runtime.difficulty,
    modality: item.type === 'memory_match' ? 'mixed' : 'text',
    optionCount: item.type === 'order' ? item.steps.length : item.type === 'memory_match' ? item.pairs.length * 2 : item.options.length,
  });
  const cards = item.type === 'order' ? item.steps : [];
  const options = item.type === 'mcq' ? item.options : [];
  const pairs = item.type === 'memory_match' ? item.pairs : [];
  const prompt = item.prompt;
  const explanation = item.type === 'memory_match' ? { en: 'Careful learning helps stories and knowledge travel forward.', ar: 'التعلّم المتأني يساعد القصص والمعرفة على المضيّ قدمًا.' } : item.explain;
  const isOrder = item.type === 'order' && cards.length > 0;
  const isMemory = item.type === 'memory_match';
  const answer = item.type === 'mcq' ? item.answer : '';
  const reset = () => { setChosen([]); setSelected(null); setMemoryPick(null); setMemoryMatches([]); setWrong(false); };
  useEffect(() => { reset(); }, [item.id]);
  const select = (id: string) => {
    if (paused || wrong || chosen.includes(id)) return;
    telemetryItem.firstInput();
    telemetryItem.change(id);
    const expected = cards[chosen.length]?.id;
    if (id !== expected) {
      telemetryItem.resolve({ correct: false, value: id, movesUsed: chosen.length + 1, strategySignature: 'heritage-sequence' });
      setWrong(true);
    } else {
      const nextCount = chosen.length + 1;
      if (nextCount === cards.length) telemetryItem.resolve({ correct: true, value: id, movesUsed: nextCount, strategySignature: 'heritage-sequence' });
      setChosen((value) => [...value, id]);
    }
  };
  const complete = isOrder && chosen.length === cards.length;
  const good = isOrder ? complete : isMemory ? memoryMatches.length === pairs.length : selected === answer;
  const selectMemory = (card: string) => {
    if (paused) return;
    if (memoryMatches.includes(Number(card.split(':')[1]))) return;
    telemetryItem.firstInput();
    telemetryItem.change(card);
    if (!memoryPick) { setMemoryPick(card); return; }
    const [firstSide, firstIndex] = memoryPick.split(':'); const [nextSide, nextIndex] = card.split(':');
    if (firstIndex === nextIndex && firstSide !== nextSide) {
      const nextMatches = memoryMatches.length + 1;
      if (nextMatches === pairs.length) telemetryItem.resolve({ correct: true, value: `${memoryPick}|${card}`, movesUsed: nextMatches, strategySignature: 'heritage-memory' });
      setMemoryMatches((value) => [...value, Number(nextIndex)]);
      setMemoryPick(null);
    } else {
      telemetryItem.resolve({ correct: false, value: `${memoryPick}|${card}`, strategySignature: 'heritage-memory' });
      setMemoryPick(card);
      setWrong(true);
    }
  };
  const next = () => {
    const reward = Number(item.sparks) || 10;
    runtime.telemetry.endLevel(`level-${level + 1}`, { correct: true, item_id: item.id });
    if (level === 2) setProgress((value) => ({ ...value, level: 2, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2), finished: true }));
    else { setProgress((value) => ({ ...value, level: value.level + 1, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2) })); reset(); }
  };
  const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); reset(); setPaused(false); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} paused={paused} onPause={() => setPaused((value) => !value)} instruction={{ en: 'Explore one heritage trail at a time: order, match, or choose · Tab then Enter/Space works too', ar: 'استكشف مسار تراث واحداً تلو الآخر: رتّب أو طابق أو اختر · يعمل Tab ثم Enter أو Space أيضاً' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={3} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Our heritage journey', ar: 'رحلة تراثنا' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{t(prompt, lang)}</h2><p className="mt-3 text-sm text-[#688079]">{t({ en: 'Each level connects a UAE story, a value, or a thoughtful Islamic practice.', ar: 'يربط كل مستوى قصة إماراتية أو قيمة أو ممارسة إسلامية واعية.' }, lang)}</p>{isOrder ? <div className="mt-7 grid gap-3">{cards.map((card, index) => <button key={card.id} onClick={() => select(card.id)} disabled={chosen.includes(card.id)} className={`flex items-center gap-4 rounded-2xl border p-4 text-start transition ${chosen.includes(card.id) ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5 hover:border-[#33705f]'}`} data-testid={`button-heritage-step-${index + 1}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#efe4cf] font-display font-bold">{chosen.indexOf(card.id) >= 0 ? chosen.indexOf(card.id) + 1 : index + 1}</span><span className="font-semibold">{card[lang]}</span>{chosen.includes(card.id) && <Check className="ms-auto h-5 w-5 text-[#33705f]" />}</button>)}</div> : isMemory ? <div className="mt-7 grid gap-3 sm:grid-cols-2">{pairs.flatMap((pair, index) => [['a', pair.a], ['b', pair.b]] as const).map(([side, label], index) => { const card = `${side}:${Math.floor(index / 2)}`; const matched = memoryMatches.includes(Math.floor(index / 2)); return <button key={card} onClick={() => selectMemory(card)} disabled={matched} className={`rounded-2xl border p-4 text-start font-semibold ${matched ? 'border-[#33705f] bg-[#e6f1eb]' : memoryPick === card ? 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`}>{label[lang]}</button>; })}</div> : <div className="mt-7 grid gap-3">{options.map((option, index) => <button key={option.id} onClick={() => { if (selected || paused) return; telemetryItem.firstInput(); telemetryItem.submit(option.id); telemetryItem.resolve({ correct: option.id === answer, value: option.id, strategySignature: 'heritage-choice' }); setSelected(option.id); }} className={`rounded-2xl border p-4 text-start font-semibold transition ${selected === option.id ? good ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5'}`} data-testid={`button-heritage-step-${index + 1}`}>{option[lang]}</button>)}</div>}{(wrong || complete || selected !== null || (isMemory && memoryMatches.length === pairs.length)) && <LevelFeedback good={good} message={good ? explanation : { en: 'Take a breath, notice the clue, and try again. Every attempt is part of the journey.', ar: 'خذ نفساً ولاحظ الدليل وحاول مجدداً. كل محاولة جزء من الرحلة.' }} lang={lang} onNext={next} onRetry={reset} final={level === 2} />}</SignatureFrame>;
}

function NumeracyCheck({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'numeracy-check')!;
  const [progress, setProgress] = useSignatureProgress(game.id);
  const cycle = usePlayerContentCycle();
  const startTime = cycle === 2 ? 18 : 20;
  const [answer, setAnswer] = useState(''); const [submitted, setSubmitted] = useState(false); const [time, setTime] = useState(startTime);
  const totalQuestions = getNumeracyItemCount(cycle);
  const round = getQuestionRound(progress, totalQuestions);
  const total = round.totalLevels;
  const item = getNumeracyItem(cycle, round.itemIndex);
  useBoundedSignatureProgress(progress, setProgress, round.totalLevels);
  const options = item.options;
  const prompt = item.prompt;
  const correctAnswer = item.answer;
  const good = answer.trim() === correctAnswer; const submit = () => { if (answer.trim()) setSubmitted(true); };
  useEffect(() => { if (submitted || progress.finished) return; const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [submitted, progress.finished]);
  const next = () => { const reward = (Number(item.sparks) || 5) * 10 + time * 2; if (round.finalQuestion) setProgress((value) => ({ ...value, score: value.score + reward, coins: value.coins + Math.ceil(reward / 20), finished: true })); else { setProgress((value) => ({ ...value, level: round.question === QUESTIONS_PER_LEVEL - 1 ? value.level + 1 : value.level, question: round.question === QUESTIONS_PER_LEVEL - 1 ? 0 : round.question + 1, score: value.score + reward, coins: value.coins + Math.ceil(reward / 20) })); setAnswer(''); setSubmitted(false); setTime(startTime); } }; const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); setAnswer(''); setSubmitted(false); setTime(startTime); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Type an answer and press Enter · Timer rewards calm, careful thinking', ar: 'اكتب الإجابة واضغط Enter · يكافئ الوقت التفكير الهادئ الدقيق' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={total} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Maths marathon', ar: 'ماراثون الرياضيات' }, lang)}</p><div className="mt-3 flex items-center justify-between gap-3"><h2 className="font-display text-3xl font-bold">{t({ en: 'Solve the gate.', ar: 'حل المسألة.' }, lang)}</h2><span className={`rounded-full px-3 py-2 text-sm font-bold ${time < 6 ? 'bg-[#fff0eb] text-[#a94d40]' : 'bg-[#e6f1eb] text-[#33705f]'}`}><Clock3 className="me-1 inline h-4 w-4" />{time}s</span></div><div className="mt-8 rounded-[24px] bg-[#efe4cf] p-8 text-center"><p className="font-display text-4xl font-bold tracking-tight">{prompt[lang]}</p><div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">{options.map((option, index) => <button key={option} onClick={() => !submitted && setAnswer(option)} className={`rounded-2xl border px-3 py-3 font-bold ${answer === option ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fffaf2]'}`} data-testid={`button-math-option-${index + 1}`}>{option}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); submit(); }}><input value={answer} onChange={(event) => setAnswer(event.target.value)} aria-label="Math answer" className="mx-auto mt-5 block w-56 rounded-2xl border-2 border-[#c8d2c7] bg-[#fffaf2] px-4 py-3 text-center font-display text-xl font-bold outline-none focus:border-[#33705f]" data-testid="input-math-answer" /><button type="submit" disabled={!answer || submitted} className="mt-4 rounded-full bg-[#174b44] px-6 py-3 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-submit-math">{t({ en: 'Check answer', ar: 'تحقق من الإجابة' }, lang)}</button></form></div>{submitted && <LevelFeedback good={good} message={good ? { en: 'Correct! Your number sense is getting faster.', ar: 'صحيح! إحساسك بالأرقام يصبح أسرع.' } : { en: `The answer is ${correctAnswer}. Reset and try the next gate with a fresh strategy.`, ar: `الإجابة هي ${correctAnswer}. أعد المحاولة وجرب استراتيجية جديدة.` }} lang={lang} onNext={next} onRetry={() => { setAnswer(''); setSubmitted(false); setTime(startTime); }} final={progress.level >= total - 1} />}</SignatureFrame>;
}

function SparkStudio({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'spark-studio')!;
  const [progress, setProgress] = useSignatureProgress(game.id); const [parts, setParts] = useState<string[]>([]); const [purpose, setPurpose] = useState(''); const [name, setName] = useState(''); const [submitted, setSubmitted] = useState(false);
  const levels = [{ objects: [{ id: 'umbrella', label: { en: 'Umbrella', ar: 'مظلة' } }, { id: 'bike', label: { en: 'Bicycle', ar: 'دراجة' } }, { id: 'light', label: { en: 'Light', ar: 'ضوء' } }], purposes: [{ en: 'Shade while travelling', ar: 'ظل أثناء التنقل' }, { en: 'Make a loud noise', ar: 'إصدار ضوضاء' }] }, { objects: [{ id: 'wheel', label: { en: 'Wheel', ar: 'عجلة' } }, { id: 'box', label: { en: 'Box', ar: 'صندوق' } }, { id: 'solar', label: { en: 'Solar panel', ar: 'لوح شمسي' } }], purposes: [{ en: 'Carry useful things', ar: 'حمل أشياء مفيدة' }, { en: 'Hide a mistake', ar: 'إخفاء خطأ' }] }, { objects: [{ id: 'screen', label: { en: 'Screen', ar: 'شاشة' } }, { id: 'handle', label: { en: 'Handle', ar: 'مقبض' } }, { id: 'bell', label: { en: 'Bell', ar: 'جرس' } }], purposes: [{ en: 'Help someone connect', ar: 'مساعدة شخص على التواصل' }, { en: 'Make it confusing', ar: 'جعله مربكاً' }] }];
  const level = levels[progress.level]; const complete = parts.length === 2 && Boolean(purpose) && name.trim().length >= 2; const submit = () => { if (complete) setSubmitted(true); }; const next = () => { if (progress.level === 2) setProgress((value) => ({ ...value, score: value.score + 150, coins: value.coins + 15, finished: true })); else { setProgress((value) => ({ ...value, level: value.level + 1, score: value.score + 150, coins: value.coins + 15 })); setParts([]); setPurpose(''); setName(''); setSubmitted(false); } }; const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); setParts([]); setPurpose(''); setName(''); setSubmitted(false); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Choose two objects, name your invention, and give it a purpose · Every useful idea is welcome', ar: 'اختر شيئين وسم اختراعك وحدد هدفه · كل فكرة مفيدة مرحب بها' }}>
    <SignatureProgressBar progress={progress} lang={lang} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Mash-up studio', ar: 'استوديو الدمج' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{t({ en: 'Make something only you would make.', ar: 'اصنع شيئاً لا يصنعه سواك.' }, lang)}</h2><div className="mt-6 grid grid-cols-3 gap-3">{level.objects.map((object, index) => <button key={object.id} onClick={() => setParts((value) => value.includes(object.id) ? value.filter((item) => item !== object.id) : value.length < 2 ? [...value, object.id] : value)} className={`rounded-2xl border p-3 text-sm font-bold ${parts.includes(object.id) ? 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`} data-testid={`button-spark-object-${index + 1}`}>{t(object.label, lang)}</button>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={t({ en: 'Name your invention', ar: 'سمّ اختراعك' }, lang)} className="rounded-2xl border border-[#dfd4c1] bg-[#fcf8f0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#33705f]" data-testid="input-spark-name" /><select value={purpose} onChange={(event) => setPurpose(event.target.value)} className="rounded-2xl border border-[#dfd4c1] bg-[#fcf8f0] px-4 py-3 text-sm font-semibold outline-none focus:border-[#33705f]" data-testid="select-spark-purpose"><option value="">{t({ en: 'Choose its purpose', ar: 'اختر هدفه' }, lang)}</option>{level.purposes.map((item) => <option key={item.en} value={item.en}>{t(item, lang)}</option>)}</select></div>{!submitted ? <button onClick={submit} disabled={!complete} className="mt-6 rounded-full bg-[#174b44] px-5 py-3 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-submit-spark">{t({ en: 'Add to gallery', ar: 'أضف إلى المعرض' }, lang)}</button> : <LevelFeedback good message={{ en: `${name.trim()} is in the gallery. You explained what it is for—that is the spark.`, ar: `تمت إضافة ${name.trim()} إلى المعرض. شرحت هدفه، وهذه هي الشرارة.` }} lang={lang} onNext={next} onRetry={() => setSubmitted(false)} final={progress.level === 2} />}</SignatureFrame>;
}

function WordJourney({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'word-journey')!;
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [picked, setPicked] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const cycle = usePlayerContentCycle();
  const level = Math.min(progress.level, 2);
  const item = getWordItem(cycle, level, lang);
  const runtime = useGameRuntime({ gameId: game.id, lang, level, profile: profile ?? undefined, finished: progress.finished });
  const telemetryItem = useTelemetryItem(runtime.telemetry, item.id, {
    difficulty: runtime.difficulty,
    modality: item.type === 'picture_word' ? 'image' : item.passage ? 'mixed' : 'text',
    optionCount: item.options.length,
  });
  const choices = item.options;
  const prompt = item.prompt;
  const passage = getPackCopy(item.passage, { en: '', ar: '' });
  const display = item.display ?? '';
  const correctAnswer = item.answer;
  const good = picked === correctAnswer;
  useEffect(() => { setPicked(null); }, [item.id]);
  const select = (choice: string) => {
    if (picked || paused) return;
    const correct = choice === correctAnswer;
    telemetryItem.firstInput();
    telemetryItem.submit(choice);
    telemetryItem.resolve({ correct, value: choice, strategySignature: `word-${item.type}` });
    setPicked(choice);
  };
  const next = () => {
    const reward = Number(item.sparks) || 8;
    runtime.telemetry.endLevel(`level-${level + 1}`, { correct: true, item_id: item.id });
    if (level === 2) setProgress((value) => ({ ...value, level: 2, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2), finished: true }));
    else setProgress((value) => ({ ...value, level: value.level + 1, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2) }));
  };
  const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); setPicked(null); setPaused(false); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} paused={paused} onPause={() => setPaused((value) => !value)} instruction={{ en: 'Read the clue, then tap a word tile · Keyboard: Tab then Enter/Space', ar: 'اقرأ الدليل ثم اضغط بلاطة كلمة · لوحة المفاتيح: Tab ثم Enter أو Space' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={3} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Word journey', ar: 'رحلة الكلمات' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{prompt[lang]}</h2><p className="mt-3 text-sm text-[#688079]">{t({ en: 'Three short language adventures grow from decoding to meaning and comprehension.', ar: 'تنمو ثلاث مغامرات لغوية قصيرة من فك الرموز إلى المعنى والفهم.' }, lang)}</p><div className="mt-8 rounded-[24px] bg-[#efe4cf] p-7 text-center">{passage[lang] && <p className="mb-5 text-sm leading-relaxed text-[#557068]">{passage[lang]}</p>}{display && <p className="mb-5 font-display text-3xl font-bold text-[#174b44]">{display}</p>}<div className="mt-6 flex flex-wrap justify-center gap-3">{choices.map((choice, index) => <button key={choice} onClick={() => select(choice)} className={`rounded-2xl border px-5 py-3 font-bold transition ${picked === choice ? good ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5'}`} data-testid={`button-word-choice-${index + 1}`}>{choice}</button>)}</div></div>{picked !== null && <LevelFeedback good={good} message={good ? getPackCopy(item.explain, { en: 'The right word makes the meaning clear.', ar: 'الكلمة الصحيحة تجعل المعنى واضحاً.' }) : { en: 'Read the clue again, then choose another path. Every try grows your word map.', ar: 'اقرأ الدليل مجدداً ثم اختر مساراً آخر. كل محاولة توسّع خريطة كلماتك.' }} lang={lang} onNext={next} onRetry={() => setPicked(null)} final={level === 2} />}</SignatureFrame>;
}

function TruthLab({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'truth-lab')!;
  const [progress, setProgress] = useSignatureProgress(game.id); const [verdict, setVerdict] = useState<string | null>(null); const [sources, setSources] = useState<string[]>([]); const [submitted, setSubmitted] = useState(false);
  const cycle = usePlayerContentCycle();
   const totalQuestions = getTruthItemCount(cycle);
   const round = getQuestionRound(progress, totalQuestions);
   const total = round.totalLevels;
   const item = getTruthItem(cycle, round.itemIndex);
   useBoundedSignatureProgress(progress, setProgress, total);
  const claim = item.type === 'newsroom' ? item.story : item.claim;
  const isEvidence = item.type === 'evidence_match';
  const isNewsroom = item.type === 'newsroom';
  const evidence = isEvidence ? item.evidence : [];
  const storySources = isNewsroom ? item.sources : [];
  const verdictOptions = isNewsroom ? item.verdict_options : [];
  const expected = isNewsroom ? item.answer_verdict : item.answer;
  const expectedSources = isNewsroom ? item.answer_sources : [];
  const good = isNewsroom ? verdict === expected && expectedSources.every((source) => sources.includes(source)) && sources.length === expectedSources.length : verdict === expected;
  const bins = isEvidence ? evidence : isNewsroom ? verdictOptions : [{ id: 'true', en: 'True', ar: 'صحيح' }, { id: 'false', en: 'False', ar: 'خطأ' }, { id: 'not_sure', en: 'Not sure', ar: 'لست متأكداً' }];
   const next = () => { const reward = Number(item.sparks) || 8; if (round.finalQuestion) setProgress((value) => ({ ...value, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2), finished: true })); else { setProgress((value) => ({ ...value, level: round.question === QUESTIONS_PER_LEVEL - 1 ? value.level + 1 : value.level, question: round.question === QUESTIONS_PER_LEVEL - 1 ? 0 : round.question + 1, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2) })); setVerdict(null); setSources([]); setSubmitted(false); } }; const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); setVerdict(null); setSources([]); setSubmitted(false); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Drop the claim into a bin by tapping · Keyboard: Tab then Enter/Space', ar: 'ضع الادعاء في الصندوق بالضغط · لوحة المفاتيح: Tab ثم Enter أو Space' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={total} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Claim sorter', ar: 'فرز الادعاءات' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{isEvidence ? t({ en: 'Choose the strongest evidence.', ar: 'اختر الدليل الأقوى.' }, lang) : isNewsroom ? t({ en: 'Check the story like a newsroom.', ar: 'تحقق من القصة كغرفة أخبار.' }, lang) : t({ en: 'What should a careful thinker say?', ar: 'ماذا يقول المفكر الحريص؟' }, lang)}</h2><div className="mt-7 rounded-[24px] border-2 border-dashed border-[#c8d2c7] bg-[#efe4cf] p-7 text-center"><CircleHelp className="mx-auto h-8 w-8 text-[#e8755f]" /><p className="mt-4 font-display text-2xl font-bold">{claim[lang]}</p></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{bins.map((bin) => <button key={bin.id ?? bin.en} onClick={() => !submitted && setVerdict(bin.id ?? bin.en)} className={`rounded-2xl border p-4 transition ${verdict === (bin.id ?? bin.en) ? good ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5'}`} data-testid={`button-truth-bin-${bin.id ?? bin.en}`}><span className="block text-sm font-bold">{bin[lang]}</span></button>)}</div>{isNewsroom && verdict && <div className="mt-5"><p className="mb-2 text-sm font-bold">{t({ en: 'Which sources support your conclusion?', ar: 'أي المصادر تدعم استنتاجك؟' }, lang)}</p>{storySources.map((source) => <button key={source.id ?? source.en} onClick={() => !submitted && setSources((value) => value.includes(source.id ?? source.en) ? value.filter((id) => id !== (source.id ?? source.en)) : [...value, source.id ?? source.en])} className={`mb-2 w-full rounded-xl border p-3 text-start text-sm font-semibold ${sources.includes(source.id ?? source.en) ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0]'}`}>{source[lang]}</button>)}<button onClick={() => setSubmitted(true)} disabled={!verdict || !sources.length} className="mt-3 rounded-full bg-[#174b44] px-5 py-3 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-check-newsroom">{t({ en: 'Check story', ar: 'تحقق من القصة' }, lang)}</button></div>}{((!isNewsroom && verdict) || (isNewsroom && submitted)) && <LevelFeedback good={good} message={good ? getPackCopy(isNewsroom ? undefined : item.explain, { en: 'Good checking. You used evidence before deciding.', ar: 'تحقق جيد. استخدمت الدليل قبل اتخاذ القرار.' }) : { en: 'Pause before sharing. Check the claim, its source, and the evidence again.', ar: 'توقف قبل المشاركة. تحقق من الادعاء ومصدره والدليل مجددًا.' }} lang={lang} onNext={next} onRetry={() => { setVerdict(null); setSources([]); setSubmitted(false); }} final={progress.level === total - 1} />}</SignatureFrame>;
}

function LevelFeedback({ good, message, lang, onNext, onRetry }: { good: boolean; message: Copy; lang: Lang; onNext: () => void; onRetry?: () => void; final?: boolean }) {
  return <div className={`mt-6 rounded-2xl p-4 ${good ? 'bg-[#e6f1eb]' : 'bg-[#fff0eb]'}`} role="status" data-testid="status-signature-feedback"><p className="text-sm font-semibold leading-relaxed text-[#174b44]">{t(message, lang)}</p><div className="mt-3 flex flex-wrap gap-2">{!good && onRetry && <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-full border border-[#e8755f] px-4 py-2 text-xs font-bold text-[#a94d40]" data-testid="button-signature-retry"><RotateCcw className="h-3.5 w-3.5" /> {t({ en: 'Try again', ar: 'حاول مجدداً' }, lang)}</button>}{good && <button onClick={onNext} className="inline-flex items-center gap-2 rounded-full bg-[#174b44] px-4 py-2 text-xs font-bold text-[#fff4df]" data-testid="button-signature-next">{t({ en: 'Next activity', ar: 'النشاط التالي' }, lang)} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></button>}</div></div>;
}

function WorldIllustration({ game, lang }: { game: typeof gameBlueprints[number]; lang: Lang }) {
  const Icon = game.icon;
  const art: Record<string, { emoji: string; label: Copy }> = {
    heritage: { emoji: '⛵', label: { en: 'Discover', ar: 'اكتشف' } },
    'word-journey': { emoji: '🔤', label: { en: 'Word explorer', ar: 'مستكشف الكلمات' } },
    'numeracy-check': { emoji: '➕', label: { en: 'Number hero', ar: 'بطل الأرقام' } },
    'healthy-restaurant': { emoji: '🥗', label: { en: 'Menu maker', ar: 'صانع القائمة' } },
    'truth-lab': { emoji: '🔎', label: { en: 'Fact finder', ar: 'باحث الحقائق' } },
    'innovation-lab': { emoji: '🤖', label: { en: 'Idea builder', ar: 'صانع الأفكار' } },
    'color-focus': { emoji: '🌈', label: { en: 'Focus quest', ar: 'مهمة التركيز' } },
  };
  const detail = art[game.id] ?? { emoji: '✨', label: { en: 'Play and learn', ar: 'العب وتعلّم' } };
  return <div className="relative mt-6 overflow-hidden rounded-[24px] border border-white/20 bg-[#194f48]/70 p-3 shadow-inner">
    <img src={learningWorldPath} alt="" className="h-32 w-full rounded-[18px] object-cover object-center opacity-80 mix-blend-screen" />
    <div className="absolute inset-3 rounded-[18px] bg-gradient-to-t from-[#123f3a]/90 via-transparent to-transparent" />
    <div className="absolute bottom-5 start-5 flex items-center gap-3">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4df] text-2xl shadow-soft">{detail.emoji}</span>
      <span className="rounded-full bg-[#174b44]/90 px-3 py-1.5 text-xs font-bold text-[#fff4df]"><Icon className="me-1 inline h-3.5 w-3.5 text-[#f2c95c]" />{t(detail.label, lang)}</span>
    </div>
  </div>;
}
function SignatureFrame({ game, lang, progress, onRestart, instruction, paused, onPause, children }: {
  game: typeof gameBlueprints[number];
  lang: Lang;
  progress: SignatureProgress;
  onRestart: () => void;
  instruction: Copy;
  paused?: boolean;
  onPause?: () => void;
  children: ReactNode;
}) {
  const Icon = game.icon;
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-library"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game library', ar: 'العودة إلى مكتبة الألعاب' }, lang)}</Link>
      <div className="flex flex-wrap items-center justify-end gap-2"><GameTimer gameId={game.id} lang={lang} finished={progress.finished} paused={paused} />{onPause && <button type="button" onClick={onPause} aria-pressed={paused} className="inline-flex items-center gap-2 rounded-full border border-[#c7ded1] bg-white px-3 py-2 text-sm font-bold text-[#174b44] transition hover:border-[#33705f]" data-testid={`button-${game.id}-pause`}>{paused ? <Play className="h-4 w-4 text-[#33705f]" /> : <Pause className="h-4 w-4 text-[#e8755f]" />}{paused ? t({ en: 'Resume', ar: 'متابعة' }, lang) : t({ en: 'Pause', ar: 'إيقاف مؤقت' }, lang)}</button>}<div className="flex items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8f0] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> <span data-testid={`text-${game.id}-coins`}>{progress.coins}</span></div></div>
    </div>
    <section className="overflow-hidden rounded-[30px] bg-[#174b44] text-[#fff4df] shadow-float">
      <div className="grid lg:grid-cols-[.72fr_1.28fr]">
        <div className="relative min-h-[280px] overflow-hidden bg-[#2d675d] p-7 sm:p-10">
          <div className="absolute -end-16 -top-14 h-52 w-52 rounded-full bg-[#f2c95c]" />
          <div className="absolute bottom-[-55px] start-[-25px] h-48 w-72 rotate-[-17deg] rounded-[50%] bg-[#71a695]" />
          <div className="absolute bottom-[-65px] end-[-25px] h-48 w-64 rotate-[12deg] rounded-[50%] bg-[#3b8876]" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#d7e8df]"><Icon className="h-4 w-4 text-[#f2c95c]" /> {t(game.title, lang)}</div>
            <h1 className="mt-8 max-w-xs font-display text-4xl font-semibold leading-[.95] tracking-[-.06em]">{t({ en: 'A world with its own way to play.', ar: 'عالم بطريقته الخاصة للعب.' }, lang)}</h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c0dbcf]">{t(game.description, lang)}</p>
            <WorldIllustration game={game} lang={lang} />
          </div>
        </div>
        <div className="bg-[#fffaf2] p-6 text-[#174b44] sm:p-10">
          {progress.finished ? <div className="flex min-h-[430px] flex-col justify-center text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f2c95c] text-[#174b44]"><Trophy className="h-9 w-9" /></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Learning complete', ar: 'اكتمل التعلّم' }, lang)}</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">{t({ en: 'You found your way to learn.', ar: 'وجدت طريقك إلى التعلم.' }, lang)}</h2>
            <p className="mx-auto mt-4 max-w-md text-[#688079]">{t({ en: 'Your choices and practice are saved on this device.', ar: 'تم حفظ اختياراتك وتدريبك على هذا الجهاز.' }, lang)}</p>
            <div className="mx-auto mt-7 flex items-center gap-6 rounded-2xl bg-[#e6f1eb] px-6 py-4"><div><span className="block font-display text-2xl font-bold" data-testid={`text-${game.id}-score`}>{progress.score}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'score', ar: 'النقاط' }, lang)}</span></div><div className="h-9 w-px bg-[#c7ded1]" /><div><span className="block font-display text-2xl font-bold">{progress.coins}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'coins', ar: 'العملات' }, lang)}</span></div></div>
            <button onClick={onRestart} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8] transition hover:-translate-y-0.5" data-testid={`button-restart-${game.id}`}><RotateCcw className="h-4 w-4" /> {t({ en: 'Play again', ar: 'العب مجدداً' }, lang)}</button>
          </div> : <div className={paused ? 'pointer-events-none select-none opacity-60' : ''}>{children}</div>}
        </div>
      </div>
    </section>
    <p className="mt-5 text-center text-xs font-semibold text-[#688079]">{t(instruction, lang)}</p>
  </div>;
}

function useSignatureProgress(gameId: string) {
  return useLocal<SignatureProgress>(`bunayn-signature-progress-${gameId}`, { level: 0, score: 0, coins: 0, finished: false });
}

function SignatureWorld({ lang, gameId }: { lang: Lang; gameId: string }) {
  const component = {
    'eco-future': EcoRoute,
    'color-focus': ColorFocus,
    heritage: HeritageSequence,
    'library-sort': LibrarySort,
    'word-journey': WordJourney,
    'healthy-restaurant': HealthyRestaurant,
    'innovation-lab': InnovationLab,
    'numeracy-check': NumeracyCheck,
    'bot-workshop': BotWorkshop,
    'truth-lab': TruthLab,
    'common-ground': CommonGround,
    'spark-studio': SparkStudio,
  }[gameId];
  const Component = component;
  return Component ? <Component lang={lang} /> : <GameRoom lang={lang} gameId={gameId} />;
}

function HealthyRestaurant({ lang }: { lang: Lang }) {
  const game = gameBlueprints.find((item) => item.id === 'healthy-restaurant')!;
  const [progress, setProgress] = useSignatureProgress(game.id);
  const [plate, setPlate] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const cycle = usePlayerContentCycle();
  const task = getMenuTask(cycle);
  const totalQuestions = getMenuItemCount(cycle);
  const round = getQuestionRound(progress, totalQuestions);
  const total = round.totalLevels;
  const item = getMenuItem(cycle, round.itemIndex);
  useBoundedSignatureProgress(progress, setProgress, total);
  const options = item.options;
  const prompt = item.prompt;
  const answer = item.answer;
  const good = plate[0] === answer;
  const toggle = (id: string) => { if (!submitted) setPlate((value) => value[0] === id ? [] : [id]); };
  const submit = () => setSubmitted(true);
  const next = () => { const reward = Number(item.sparks) || 8; if (round.finalQuestion) setProgress((value) => ({ ...value, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2), finished: true })); else { setProgress((value) => ({ ...value, level: round.question === QUESTIONS_PER_LEVEL - 1 ? value.level + 1 : value.level, question: round.question === QUESTIONS_PER_LEVEL - 1 ? 0 : round.question + 1, score: value.score + reward, coins: value.coins + Math.ceil(reward / 2) })); setPlate([]); setSubmitted(false); } };
  const restart = () => { setProgress({ level: 0, score: 0, coins: 0, finished: false }); setPlate([]); setSubmitted(false); };
  return <SignatureFrame game={game} lang={lang} progress={progress} onRestart={restart} instruction={{ en: 'Choose a menu option, then serve · Keyboard: Tab then Enter/Space', ar: 'اختر خيارًا من القائمة ثم قدّمه · لوحة المفاتيح: Tab ثم Enter أو Space' }}>
    <SignatureProgressBar progress={progress} lang={lang} total={total} /><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Menu maker', ar: 'صانع القائمة' }, lang)}</p><h2 className="mt-3 font-display text-3xl font-bold">{task[lang]}</h2><p className="mt-3 rounded-2xl bg-[#efe4cf] p-4 text-lg font-semibold">{prompt[lang]}</p><div className="mt-7 grid grid-cols-2 gap-3">{options.map((option, index) => <button key={option.id} onClick={() => toggle(option.id)} className={`rounded-2xl border p-4 text-start font-semibold transition ${plate.includes(option.id) ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5'}`} data-testid={`button-menu-item-${index + 1}`}><span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#efe4cf] text-xl">{['🥗', '💧', '🍊', '🍞'][index % 4]}</span>{option[lang]}{plate.includes(option.id) && <Check className="float-end h-4 w-4 text-[#33705f]" />}</button>)}</div>{!submitted ? <button onClick={submit} disabled={!plate.length} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-5 py-3 text-sm font-bold text-[#fff4df] disabled:opacity-40" data-testid="button-serve-menu"><Check className="h-4 w-4" /> {t({ en: 'Serve this choice', ar: 'قدّم هذا الخيار' }, lang)}</button> : <LevelFeedback good={good} message={good ? getPackCopy(item.explain, { en: 'A thoughtful everyday choice supports energy and balance.', ar: 'الخيار اليومي الواعي يدعم الطاقة والتوازن.' }) : { en: 'Try adding a different everyday choice to this menu.', ar: 'جرّب إضافة خيار يومي مختلف إلى هذه القائمة.' }} lang={lang} onNext={next} onRetry={() => { setPlate([]); setSubmitted(false); }} final={progress.level >= total - 1} />}</SignatureFrame>;
}

function getQuestionRound(progress: SignatureProgress, itemCount: number) {
  const question = Math.min(Math.max(progress.question ?? 0, 0), QUESTIONS_PER_LEVEL - 1);
  const totalLevels = Math.max(1, Math.ceil(itemCount / QUESTIONS_PER_LEVEL));
  const position = progress.level * QUESTIONS_PER_LEVEL + question;
  // The adapters intentionally wrap sparse banks. Keep the round position
  // independent so a padded level always presents all three questions.
  return { question, itemIndex: position, totalLevels, finalQuestion: position >= itemCount - 1 };
}
