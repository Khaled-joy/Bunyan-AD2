import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import logoPath from '@assets/image_1787208364235.png';
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, Check, ChevronRight, CircleHelp,
  Coins, Compass, Crown, Gamepad2, Globe2, Leaf, LockKeyhole, Menu, RotateCcw,
  Sparkles, Star, Trophy, Users, X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';

type Lang = 'en' | 'ar';
type Copy = { en: string; ar: string };
const t = (copy: Copy, lang: Lang) => copy[lang];
const queryClient = new QueryClient();

type PlayerProfile = { name: string; age: string; role: string; avatar: string };
type PlayerRow = { name: string; initials: string; level: string; coins: number; progress: number; lastActive: string; tone: string };

const gameBlueprints = [
  { id: 'eco-future', title: { en: 'Eco Future', ar: 'مستقبل أخضر' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Make small choices. Build a brighter Abu Dhabi.', ar: 'اختر بخطوات صغيرة وابنِ أبوظبي أكثر إشراقاً.' }, color: 'coral', icon: Leaf, playable: true },
  { id: 'heritage', title: { en: 'Our Heritage', ar: 'تراثنا' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Follow the stories that shaped our home.', ar: 'اكتشف القصص التي شكّلت وطننا.' }, color: 'sand', icon: Crown, playable: true },
  { id: 'color-focus', title: { en: 'Color Focus', ar: 'تركيز الألوان' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Train your eyes. Find the signal.', ar: 'درّب عينيك واعثر على الإشارة.' }, color: 'sky', icon: Sparkles, playable: true },
  { id: 'library-sort', title: { en: 'Library Sort', ar: 'ترتيب المكتبة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Put every story in its perfect place.', ar: 'ضع كل قصة في مكانها المناسب.' }, color: 'mint', icon: BookOpen, playable: true },
  { id: 'word-journey', title: { en: 'Word Journey', ar: 'رحلة الكلمات' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Travel through language, one word at a time.', ar: 'سافر عبر اللغة كلمة بعد كلمة.' }, color: 'violet', icon: Compass, playable: true },
  { id: 'basket-challenge', title: { en: 'Basket Challenge', ar: 'تحدي السلة' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Aim high. Find your rhythm.', ar: 'صوّب عالياً واعثر على إيقاعك.' }, color: 'peach', icon: Trophy, playable: true },
  { id: 'healthy-restaurant', title: { en: 'Healthy Restaurant', ar: 'المطعم الصحي' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Create a menu that makes everyone feel good.', ar: 'صمّم قائمة تجعل الجميع يشعرون بالراحة.' }, color: 'lime', icon: Star, playable: true },
  { id: 'innovation-lab', title: { en: 'Innovation Lab', ar: 'مختبر الابتكار' }, eyebrow: { en: 'Play now', ar: 'العب الآن' }, description: { en: 'Turn curious ideas into useful things.', ar: 'حوّل الأفكار الفضولية إلى أشياء مفيدة.' }, color: 'blue', icon: Zap, playable: true },
] as const;

const demoPlayers: PlayerRow[] = [
  { name: 'Mariam Al Mansoori', initials: 'MA', level: 'Level 04', coins: 315, progress: 86, lastActive: 'Today, 09:42', tone: 'bg-[#f2c95c]' },
  { name: 'Omar Al Shamsi', initials: 'OA', level: 'Level 03', coins: 240, progress: 64, lastActive: 'Today, 08:16', tone: 'bg-[#9fcac0]' },
  { name: 'Hessa Al Kaabi', initials: 'HK', level: 'Level 02', coins: 155, progress: 47, lastActive: 'Yesterday', tone: 'bg-[#e99b7c]' },
  { name: 'Saif Al Nuaimi', initials: 'SN', level: 'Level 01', coins: 80, progress: 22, lastActive: 'Yesterday', tone: 'bg-[#aecbd8]' },
];

function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* demo persistence can fail in private mode */ }
  }, [key, value]);
  return [value, setValue] as const;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/welcome" className="flex items-center gap-3" data-testid="link-logo">
    <img src={logoPath} alt="Bunayn AD — a world of knowledge" className={`${compact ? 'h-10 w-[116px]' : 'h-12 w-[138px]'} rounded-lg object-cover object-center`} />
    {!compact && <span className="hidden border-s border-[#d9cbb4] ps-3 sm:block"><span className="block font-display text-[13px] font-bold tracking-[.08em] text-[#174b44]">PLAY FOR TOMORROW</span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-[#8b7760]">Abu Dhabi learning games</span></span>}
  </Link>;
}

function Shell({ children, lang, setLang }: { children: ReactNode; lang: Lang; setLang: (lang: Lang) => void }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem('bunayn-player-profile') || 'null') as PlayerProfile | null; } catch { return null; }
  })();
  const activeProfile = profile || savedProfile;
  const isActive = (path: string) => location === path;
  const initials = activeProfile?.avatar || activeProfile?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'GU';
  const nav = [
    { href: '/welcome', label: { en: 'Welcome', ar: 'مرحباً' }, id: 'welcome' },
    { href: '/', label: { en: 'Game hub', ar: 'مركز الألعاب' }, id: 'home' },
    { href: '/library', label: { en: 'Library', ar: 'المكتبة' }, id: 'library' },
    { href: '/admin', label: { en: 'Dashboard', ar: 'لوحة المتابعة' }, id: 'admin' },
  ];
  return <div className="app-noise min-h-[100dvh] bg-[#f7f0e3]">
    <header className="sticky top-0 z-40 border-b border-[#dfd2bd]/90 bg-[#f7f0e3]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-1 rounded-full border border-[#dfd2bd] bg-[#efe6d6] p-1 md:flex" aria-label="Main navigation">
          {nav.map((item) => <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive(item.href) ? 'bg-[#174b44] text-[#fff4df] shadow-sm' : 'text-[#5d7169] hover:bg-[#e6dac6] hover:text-[#174b44]'}`} data-testid={`link-nav-${item.id}`}>{t(item.label, lang)}</Link>)}
        </nav>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="hidden items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8ef] px-3.5 py-2 text-xs font-bold text-[#174b44] transition hover:border-[#174b44] sm:flex" data-testid="button-language">
            <Globe2 className="h-4 w-4" /> {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <Link href={activeProfile ? '/' : '/login'} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#f2c95c] bg-[#d9ece4] font-display text-sm font-bold text-[#174b44]" data-testid="link-player-profile" aria-label={activeProfile ? `Open ${activeProfile.name}'s game hub` : 'Open player login'}>{initials}</Link>
          <button onClick={() => setMenuOpen((open) => !open)} className="rounded-full p-2 text-[#174b44] md:hidden" aria-label="Open menu" data-testid="button-menu"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      {menuOpen && <div className="border-t border-[#dfd2bd] bg-[#f7f0e3] px-5 py-4 md:hidden"><div className="flex flex-col gap-1">
        {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 font-semibold text-[#174b44]" data-testid={`link-mobile-${item.id}`}>{t(item.label, lang)}</Link>)}
        <button onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setMenuOpen(false); }} className="rounded-xl px-3 py-3 text-start font-semibold text-[#174b44]" data-testid="button-mobile-language">{lang === 'en' ? 'العربية' : 'English'}</button>
      </div></div>}
    </header>
    <main dir={lang === 'ar' ? 'rtl' : 'ltr'}>{children}</main>
    <footer className="border-t border-[#dfd2bd] bg-[#174b44] px-5 py-10 text-[#d7e8df] lg:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div><Logo compact /><p className="mt-4 max-w-sm text-sm leading-relaxed text-[#b7d1c5]">{t({ en: 'A digital playground from Abu Dhabi for curious minds, thoughtful choices, and the people shaping tomorrow.', ar: 'ملعب رقمي من أبوظبي للعقول الفضولية والاختيارات الواعية والأشخاص الذين يصنعون الغد.' }, lang)}</p></div>
        <div className="text-sm text-[#9fbdaf]"><p>© 2024 Bunayn AD</p><p className="mt-1">Learning through play.</p></div>
      </div>
    </footer>
  </div>;
}

function Landscape({ large = false }: { large?: boolean }) {
  return <div className={`abu-landscape relative overflow-hidden rounded-[28px] ${large ? 'min-h-[330px] sm:min-h-[430px]' : 'min-h-[190px]'}`} aria-label="Illustration of Abu Dhabi coast and mangroves">
    <div className="absolute -end-16 -top-14 h-60 w-60 rounded-full bg-[#f2c95c]" />
    <div className="absolute end-20 top-20 h-20 w-20 rounded-full bg-[#fff1bd]/70 blur-xl" />
    <div className="absolute bottom-0 start-[-8%] h-[55%] w-[116%] rotate-[-6deg] rounded-[50%] bg-[#c6dfd3]" />
    <div className="absolute bottom-[-11%] start-[-8%] h-[48%] w-[116%] rotate-[4deg] rounded-[50%] bg-[#4e9984]" />
    <div className="absolute bottom-[15%] start-[13%] h-24 w-5 rounded-full bg-[#174b44]" />
    <div className="absolute bottom-[31%] start-[8%] h-20 w-20 rounded-full bg-[#2e806d]" />
    <div className="absolute bottom-[12%] start-[25%] h-16 w-4 rounded-full bg-[#174b44]" />
    <div className="absolute bottom-[26%] start-[21%] h-14 w-14 rounded-full bg-[#3e947b]" />
    <div className="absolute bottom-[19%] end-[21%] h-20 w-4 rounded-full bg-[#174b44]" />
    <div className="absolute bottom-[32%] end-[16%] h-16 w-16 rounded-full bg-[#32826f]" />
    <div className="absolute bottom-[13%] end-[34%] h-14 w-3 rounded-full bg-[#174b44]" />
    <div className="absolute bottom-[21%] end-[30%] h-12 w-12 rounded-full bg-[#2e806d]" />
    <div className="absolute bottom-[17%] start-[49%] h-2 w-24 rotate-[-10deg] rounded-full bg-[#f2c95c]" />
    <div className="absolute bottom-[13%] start-[55%] h-1.5 w-14 rotate-[10deg] rounded-full bg-[#f2c95c]" />
    <span className="absolute bottom-5 start-6 rounded-full bg-[#fff4df]/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#174b44]">Abu Dhabi / tomorrow</span>
  </div>;
}

function Welcome({ lang }: { lang: Lang }) {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
    <section className="grid gap-8 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
      <div className="reveal">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c7ded1] bg-[#e6f1eb] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#33705f]"><span className="h-2 w-2 rounded-full bg-[#e8755f] pulse-soft" /> {t({ en: 'Welcome to Bunayn AD', ar: 'مرحباً بكم في بنين' }, lang)}</div>
        <h1 className="max-w-3xl font-display text-[clamp(3rem,7vw,7rem)] font-semibold leading-[.9] tracking-[-.07em] text-[#174b44]">{t({ en: 'Play what shapes you.', ar: 'العب ما يشكّلك.' }, lang)}</h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#5d7169]">{t({ en: 'Bunayn is an educational game platform from Abu Dhabi. Through small choices and curious challenges, players explore their values, decisions, and growing levels.', ar: 'بنين منصة ألعاب تعليمية من أبوظبي. من خلال اختيارات صغيرة وتحديات فضولية، يستكشف اللاعبون قيمهم وقراراتهم ومستوياتهم المتنامية.' }, lang)}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={profile ? '/' : '/login'} className="group inline-flex items-center gap-3 rounded-full bg-[#e8755f] px-6 py-3.5 font-bold text-[#fff7e8] shadow-[0_7px_0_#b85c4e] transition hover:-translate-y-1 hover:shadow-[0_9px_0_#b85c4e] active:translate-y-1" data-testid="link-welcome-start">{profile ? t({ en: `Continue as ${profile.name.split(' ')[0]}`, ar: `تابع باسم ${profile.name.split(' ')[0]}` }, lang) : t({ en: 'Create a player profile', ar: 'أنشئ ملف لاعب' }, lang)} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" /></Link>
          <Link href="/library" className="inline-flex items-center gap-2 rounded-full border border-[#c8d2c7] bg-[#fcf8f0] px-5 py-3.5 font-semibold text-[#174b44] transition hover:border-[#174b44]" data-testid="link-welcome-library">{t({ en: 'Explore the games', ar: 'استكشف الألعاب' }, lang)} <ChevronRight className="h-4 w-4 rtl:rotate-180" /></Link>
        </div>
      </div>
      <div className="reveal reveal-delay-1 relative"><Landscape large /><div className="absolute -bottom-5 start-5 end-5 flex items-center justify-between rounded-2xl border border-[#c7ded1] bg-[#fffaf2] p-4 shadow-float sm:start-10 sm:end-10"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f1eb] text-[#33705f]"><Compass className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#e8755f]">{t({ en: 'A place to begin', ar: 'مكان للبداية' }, lang)}</p><p className="font-display font-bold text-[#174b44]">{t({ en: 'Your choices matter', ar: 'اختياراتك مهمة' }, lang)}</p></div></div><div className="grid h-11 w-11 place-items-center rounded-full border-4 border-[#f2c95c] bg-[#e6f1eb] text-xs font-bold text-[#174b44]">01</div></div></div>
    </section>
    <section className="mt-24 grid gap-5 md:grid-cols-[.85fr_1.15fr]">
      <div className="rounded-[26px] bg-[#174b44] p-7 text-[#fff4df] sm:p-9 reveal reveal-delay-2"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f2c95c]">{t({ en: 'Why Bunayn?', ar: 'لماذا بنين؟' }, lang)}</p><h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight">{t({ en: 'A safe space to notice how you think.', ar: 'مساحة آمنة لملاحظة طريقة تفكيرك.' }, lang)}</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-[#b7d1c5]">{t({ en: 'Each game gives families and educators a gentle way to talk about values, habits, and the future we share.', ar: 'تمنح كل لعبة العائلات والمعلمين طريقة لطيفة للحديث عن القيم والعادات والمستقبل المشترك.' }, lang)}</p><Link href="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#f2c95c] hover:text-[#fff4df]" data-testid="link-welcome-login">{t({ en: 'Meet the player journey', ar: 'تعرّف على رحلة اللاعب' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: Compass, title: { en: 'Values', ar: 'القيم' }, body: { en: 'See what feels important to you.', ar: 'اكتشف ما يهمك.' } }, { icon: Gamepad2, title: { en: 'Choices', ar: 'الاختيارات' }, body: { en: 'Try ideas without getting it wrong.', ar: 'جرّب الأفكار دون خوف من الخطأ.' } }, { icon: BarChart3, title: { en: 'Levels', ar: 'المستويات' }, body: { en: 'Watch your confidence grow.', ar: 'شاهد ثقتك تنمو.' } }].map(({ icon: Icon, title, body }, index) => <div key={title.en} className={`rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-5 reveal reveal-delay-${index + 1}`}><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#efe1bf] text-[#174b44]"><Icon className="h-5 w-5" /></div><h3 className="mt-6 font-display text-lg font-bold text-[#174b44]">{t(title, lang)}</h3><p className="mt-2 text-sm leading-relaxed text-[#6f8179]">{t(body, lang)}</p></div>)}
      </div>
    </section>
    <section className="mt-16 grid gap-6 rounded-[28px] border border-[#dfd2bd] bg-[#efe2cc] p-6 sm:p-9 lg:grid-cols-[.82fr_1.18fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#b35d4c]">{t({ en: 'Made in the Emirates', ar: 'صُنع في الإمارات' }, lang)}</p><h2 className="mt-2 max-w-md font-display text-3xl font-semibold leading-tight text-[#174b44]">{t({ en: 'From mangrove roots to a skyline of possibility.', ar: 'من جذور القرم إلى أفق من الاحتمالات.' }, lang)}</h2></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#fcf8f0]/75 p-4"><Leaf className="h-5 w-5 text-[#33705f]" /><p className="mt-3 text-sm font-semibold text-[#174b44]">{t({ en: 'Local landscapes', ar: 'مناظر محلية' }, lang)}</p></div><div className="rounded-2xl bg-[#fcf8f0]/75 p-4"><Users className="h-5 w-5 text-[#e8755f]" /><p className="mt-3 text-sm font-semibold text-[#174b44]">{t({ en: 'For families', ar: 'للعائلات' }, lang)}</p></div><div className="rounded-2xl bg-[#fcf8f0]/75 p-4"><Sparkles className="h-5 w-5 text-[#b35d4c]" /><p className="mt-3 text-sm font-semibold text-[#174b44]">{t({ en: 'Built for curiosity', ar: 'للفضول' }, lang)}</p></div></div></section>
  </div>;
}

function Login({ lang }: { lang: Lang }) {
  const [, setLocation] = useLocation();
  const [, setProfile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('8–12');
  const [role, setRole] = useState('Player');
  const [error, setError] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) { setError(t({ en: 'Please enter at least two letters.', ar: 'يرجى إدخال حرفين على الأقل.' }, lang)); return; }
    const cleanName = name.trim();
    setProfile({ name: cleanName, age, role, avatar: cleanName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() });
    setLocation('/');
  };
  return <div className="mx-auto grid min-h-[calc(100dvh-78px)] max-w-[1220px] items-center gap-8 px-5 py-10 lg:grid-cols-[.95fr_1.05fr] lg:px-10">
    <div className="hidden lg:block"><Landscape large /><div className="mt-6 flex items-center gap-3 text-sm font-semibold text-[#5d7169]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f2c95c] text-[#174b44]">01</span>{t({ en: 'A profile helps Bunayn remember your trail on this device.', ar: 'يساعد الملف بنين على تذكر مسارك على هذا الجهاز.' }, lang)}</div></div>
    <form onSubmit={submit} className="mx-auto w-full max-w-[540px] rounded-[28px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 shadow-soft sm:p-9" data-testid="form-player-login">
      <Link href="/welcome" className="inline-flex items-center gap-2 text-sm font-bold text-[#687c73] hover:text-[#174b44]" data-testid="link-login-back"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to welcome', ar: 'العودة للترحيب' }, lang)}</Link>
      <p className="mt-9 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Player onboarding', ar: 'بدء رحلة اللاعب' }, lang)}</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#174b44]">{t({ en: 'Tell us who is playing.', ar: 'من اللاعب؟' }, lang)}</h1><p className="mt-3 text-sm leading-relaxed text-[#6f8179]">{t({ en: 'This is a friendly demo profile saved only in your browser. No password needed.', ar: 'هذا ملف تجريبي لطيف يُحفظ في متصفحك فقط. لا تحتاج إلى كلمة مرور.' }, lang)}</p>
      <div className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-[#174b44]">{t({ en: 'Player name', ar: 'اسم اللاعب' }, lang)}</span><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder={t({ en: 'For example, Noor Alia', ar: 'مثال: نور عليا' }, lang)} className="w-full rounded-2xl border border-[#d8cbb6] bg-[#fffaf2] px-4 py-3.5 text-[#174b44] outline-none transition placeholder:text-[#a9957c] focus:border-[#33705f]" data-testid="input-player-name" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-[#174b44]">{t({ en: 'Age group', ar: 'الفئة العمرية' }, lang)}</span><select value={age} onChange={(event) => setAge(event.target.value)} className="w-full rounded-2xl border border-[#d8cbb6] bg-[#fffaf2] px-4 py-3.5 text-[#174b44] outline-none focus:border-[#33705f]" data-testid="select-player-age"><option>6–8</option><option>8–12</option><option>13–16</option><option>Adult learner</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold text-[#174b44]">{t({ en: 'I am a…', ar: 'أنا…' }, lang)}</span><select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-2xl border border-[#d8cbb6] bg-[#fffaf2] px-4 py-3.5 text-[#174b44] outline-none focus:border-[#33705f]" data-testid="select-player-role"><option>Player</option><option>Parent</option><option>Educator</option></select></label></div></div>
      {error && <p className="mt-4 rounded-xl bg-[#fff0eb] px-3 py-2 text-sm font-semibold text-[#a94d40]" role="alert" data-testid="status-login-error">{error}</p>}
      <button type="submit" className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#174b44] px-6 py-3.5 font-bold text-[#fff4df] transition hover:-translate-y-0.5 hover:bg-[#24665b]" data-testid="button-submit-login">{t({ en: 'Enter the game hub', ar: 'ادخل إلى مركز الألعاب' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></button>
      <p className="mt-4 text-center text-xs font-semibold text-[#8a8875]">{t({ en: 'Your name and progress stay on this device.', ar: 'يبقى اسمك وتقدمك على هذا الجهاز.' }, lang)}</p>
    </form>
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
    <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div className="reveal"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c7ded1] bg-[#e6f1eb] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#33705f]"><span className="h-2 w-2 rounded-full bg-[#e8755f] pulse-soft" /> {profile ? t({ en: `Welcome back, ${profile.name.split(' ')[0]}`, ar: `مرحباً بعودتك، ${profile.name.split(' ')[0]}` }, lang) : t({ en: 'Your playground is open', ar: 'ملعبك مفتوح' }, lang)}</div><h1 className="max-w-2xl font-display text-[clamp(3rem,7vw,6.7rem)] font-semibold leading-[.9] tracking-[-.07em] text-[#174b44]">{t({ en: 'Small choices. Big tomorrow.', ar: 'اختيارات صغيرة. غدٌ كبير.' }, lang)}</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-[#5d7169]">{t({ en: 'Explore quick games inspired by Abu Dhabi, and collect ideas for a brighter future while you play.', ar: 'اكتشف ألعاباً سريعة مستوحاة من أبوظبي، واجمع أفكاراً لغدٍ أكثر إشراقاً أثناء اللعب.' }, lang)}</p><div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/eco-future" className="group inline-flex items-center gap-3 rounded-full bg-[#e8755f] px-6 py-3.5 font-bold text-[#fff7e8] shadow-[0_7px_0_#b85c4e] transition hover:-translate-y-1" data-testid="link-play-featured">{finished ? t({ en: 'Play again', ar: 'العب مجدداً' }, lang) : t({ en: 'Continue playing', ar: 'تابع اللعب' }, lang)} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" /></Link><Link href="/library" className="inline-flex items-center gap-2 rounded-full border border-[#c8d2c7] bg-[#fcf8f0] px-5 py-3.5 font-semibold text-[#174b44] transition hover:border-[#174b44]" data-testid="link-browse-games">{t({ en: 'Browse all games', ar: 'تصفح الألعاب' }, lang)} <ChevronRight className="h-4 w-4 rtl:rotate-180" /></Link></div></div><div className="reveal reveal-delay-1 relative"><Landscape large /><div className="absolute -bottom-5 start-5 end-5 flex items-center justify-between rounded-2xl border border-[#c7ded1] bg-[#fffaf2] p-4 shadow-float sm:start-10 sm:end-10"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f1eb] text-[#33705f]"><Leaf className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#e8755f]">{t({ en: 'Featured trail', ar: 'المسار المميز' }, lang)}</p><p className="font-display font-bold text-[#174b44]">Eco Future</p></div></div><ProgressRing value={progress} /></div></div></section>
    <section className="mt-24 grid gap-5 md:grid-cols-[1.25fr_.75fr]"><div className="rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0] p-6 sm:p-8 reveal reveal-delay-2"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Your trail', ar: 'مسارك' }, lang)}</p><h2 className="mt-2 font-display text-2xl font-semibold text-[#174b44]">{t({ en: 'Keep exploring', ar: 'واصل الاستكشاف' }, lang)}</h2></div><Link href="/library" className="text-sm font-bold text-[#33705f] hover:text-[#e8755f]" data-testid="link-trail-library">{t({ en: 'See map', ar: 'شاهد الخريطة' }, lang)} <ChevronRight className="inline h-4 w-4 rtl:rotate-180" /></Link></div><div className="mt-8 flex items-center gap-4"><div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f2c95c] text-[#174b44] sm:grid"><Compass className="h-6 w-6" /></div><div className="relative flex-1"><div className="h-3 overflow-hidden rounded-full bg-[#e3e6d9]"><div className="h-full rounded-full bg-[#33705f] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-xs font-semibold text-[#688079]"><span>{t({ en: 'Mangrove start', ar: 'بداية القرم' }, lang)}</span><span>{t({ en: 'Next: Coral coast', ar: 'التالي: الساحل المرجاني' }, lang)}</span></div></div></div></div><div className="rounded-[24px] bg-[#174b44] p-6 text-[#fff4df] shadow-soft reveal reveal-delay-3"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2c95c] text-[#174b44]"><Coins className="h-5 w-5" /></div><span className="rounded-full bg-[#2d675d] px-3 py-1 text-xs font-bold text-[#d7e8df]">{profile ? profile.role : 'Player'}</span></div><p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#9fc5b6]">{t({ en: 'Your wallet', ar: 'محفظتك' }, lang)}</p><div className="mt-1 flex items-end gap-2"><span className="font-display text-4xl font-bold" data-testid="text-home-coins">{coins}</span><span className="mb-1 text-sm text-[#9fc5b6]">{t({ en: 'coins collected', ar: 'عملة جمعت' }, lang)}</span></div><div className="mt-5 flex gap-1.5">{[1, 2, 3, 4, 5, 6, 7].map((n) => <span key={n} className={`h-2 flex-1 rounded-full ${n <= Math.ceil((progress / 100) * 7) ? 'bg-[#f2c95c]' : 'bg-[#397467]'}`} />)}</div></div></section>
    <section className="mt-16"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Pick a path', ar: 'اختر مساراً' }, lang)}</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#174b44]">{t({ en: 'Games for curious minds', ar: 'ألعاب للعقول الفضولية' }, lang)}</h2></div><Link href="/library" className="hidden items-center gap-1 text-sm font-bold text-[#33705f] sm:flex" data-testid="link-see-all">{t({ en: 'View library', ar: 'عرض المكتبة' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gameBlueprints.slice(0, 4).map((game, index) => <GameCard key={game.id} game={game} lang={lang} index={index} />)}</div></section>
  </div>;
}

function GameCard({ game, lang, index = 0 }: { game: typeof gameBlueprints[number]; lang: Lang; index?: number }) {
  const Icon = game.icon;
  const colors: Record<string, string> = { sand: 'bg-[#f2c95c]', sky: 'bg-[#a8d7dc]', mint: 'bg-[#b9d6c7]', violet: 'bg-[#d6c5dd]', coral: 'bg-[#e8755f]', peach: 'bg-[#f0b092]', lime: 'bg-[#c6d88e]', blue: 'bg-[#a9c7d8]' };
  const card = <div className={`group h-full rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft ${!game.playable ? 'opacity-90' : ''}`}><div className={`relative grid h-32 place-items-center overflow-hidden rounded-[17px] ${colors[game.color]}`}><div className="absolute -end-4 -top-7 h-24 w-24 rounded-full bg-[#fff4df]/40" /><Icon className="relative h-12 w-12 text-[#174b44] transition-transform group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.5} />{game.playable ? <span className="absolute bottom-2 start-2 rounded-full bg-[#174b44] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#fff4df]">{t(game.eyebrow, lang)}</span> : <span className="absolute bottom-2 start-2 flex items-center gap-1 rounded-full bg-[#fff4df]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#688079]"><LockKeyhole className="h-3 w-3" /> {t(game.eyebrow, lang)}</span>}</div><div className="mt-4 flex items-start justify-between gap-2"><div><h3 className="font-display text-lg font-bold text-[#174b44]">{t(game.title, lang)}</h3><p className="mt-1 text-sm leading-snug text-[#688079]">{t(game.description, lang)}</p></div>{game.playable && <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#e8755f] transition-transform group-hover:translate-x-1 rtl:rotate-180" />}</div></div>;
  return game.playable ? <Link href={`/game/${game.id}`} className={`block reveal reveal-delay-${Math.min(index + 1, 3)}`} data-testid={`link-game-${game.id}`}>{card}</Link> : <div className={`reveal reveal-delay-${Math.min(index + 1, 3)}`} data-testid={`card-game-${game.id}`}>{card}</div>;
}

function Library({ lang }: { lang: Lang }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'playable' | 'soon'>('all');
  const filtered = useMemo(() => gameBlueprints.filter((game) => {
    const matches = `${game.title.en} ${game.title.ar}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === 'all' || (filter === 'playable' ? game.playable : !game.playable));
  }), [query, filter]);
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12"><section className="grid gap-8 rounded-[30px] bg-[#174b44] p-7 text-[#fff4df] md:grid-cols-[1fr_auto] md:items-end md:p-10"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#2d675d] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#d7e8df]"><BookOpen className="h-3.5 w-3.5" /> {t({ en: 'The game library', ar: 'مكتبة الألعاب' }, lang)}</div><h1 className="max-w-2xl font-display text-5xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">{t({ en: 'Pick a world to wander into.', ar: 'اختر عالماً لتتجول فيه.' }, lang)}</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-[#b7d1c5]">{t({ en: 'Game worlds inspired by the coast, desert, stories, and bright ideas of Abu Dhabi.', ar: 'عوالم ألعاب مستوحاة من الساحل والصحراء وقصص وأفكار أبوظبي المضيئة.' }, lang)}</p></div><div className="relative hidden h-36 w-44 md:block"><div className="absolute start-8 top-3 h-24 w-24 rounded-full border border-[#f2c95c]/50" /><div className="absolute start-16 top-11 h-3 w-3 rounded-full bg-[#f2c95c] pulse-soft" /><Compass className="absolute bottom-1 start-2 h-28 w-28 text-[#71a695] opacity-70" /></div></section><section className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2">{(['all', 'playable', 'soon'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === item ? 'bg-[#e8755f] text-[#fff7e8]' : 'border border-[#dfd2bd] bg-[#fcf8f0] text-[#557068] hover:border-[#174b44]'}`} data-testid={`button-filter-${item}`}>{t(item === 'all' ? { en: 'All worlds', ar: 'كل العوالم' } : item === 'playable' ? { en: 'Play now', ar: 'العب الآن' } : { en: 'Coming soon', ar: 'قريباً' }, lang)}</button>)}</div><label className="relative block sm:w-64"><CircleHelp className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#688079]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t({ en: 'Search worlds', ar: 'ابحث عن عالم' }, lang)} className="w-full rounded-full border border-[#dfd2bd] bg-[#fcf8f0] py-2.5 pe-4 ps-9 text-sm outline-none placeholder:text-[#9aaba0] focus:border-[#33705f]" data-testid="input-search-games" /></label></section><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((game, index) => <GameCard key={game.id} game={game} lang={lang} index={index} />)}</section>{filtered.length === 0 && <div className="mt-7 rounded-[24px] border border-dashed border-[#c8d2c7] bg-[#fcf8f0] py-16 text-center"><Compass className="mx-auto h-9 w-9 text-[#9aaba0]" /><h2 className="mt-4 font-display text-xl font-bold text-[#174b44]">{t({ en: 'No worlds found', ar: 'لم نجد عوالم' }, lang)}</h2><p className="mt-1 text-sm text-[#688079]">{t({ en: 'Try a different trail marker.', ar: 'جرّب كلمة بحث أخرى.' }, lang)}</p></div>}<p className="mt-7 text-sm font-semibold text-[#5d7169]">{t({ en: 'Every world now has three levels. Each level becomes more challenging and rewards thoughtful play.', ar: 'كل عالم يحتوي الآن على ثلاثة مستويات. تزداد الصعوبة في كل مستوى وتكافئك اللعبة على اللعب الواعي.' }, lang)}</p></div>;
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

function GameRoom({ lang }: { lang: Lang }) {
  const [, params] = useRoute<{ id: string }>('/game/:id');
  const game = gameBlueprints.find((item) => item.id === params?.id) || gameBlueprints[0];
  const challenges = useMemo(() => makeChallenges(game.id), [game.id]);
  const storageKey = `bunayn-game-progress-${game.id}`;
  const [progress, setProgress] = useLocal<GameProgress>(storageKey, { level: 0, question: 0, score: 0, coins: 0, finished: false });
  const [selected, setSelected] = useState<number | null>(null);
  const level = Math.min(progress.level, challenges.length - 1);
  const current = challenges[level];
  const levelTarget = current.options.length;

  const choose = (index: number) => {
    if (selected !== null || progress.finished || !current.options[index]) return;
    setSelected(index);
    if (current.options[index].good) {
      setProgress((value) => ({ ...value, score: value.score + 100 + value.level * 50, coins: value.coins + 10 + value.level * 5 }));
    }
  };

  const next = () => {
    if (selected === null) return;
    if (progress.question < levelTarget - 1) {
      setProgress((value) => ({ ...value, question: value.question + 1 }));
    } else if (progress.level < challenges.length - 1) {
      setProgress((value) => ({ ...value, level: value.level + 1, question: 0 }));
    } else {
      setProgress((value) => ({ ...value, finished: true }));
    }
    setSelected(null);
  };

  const restart = () => {
    setProgress({ level: 0, question: 0, score: 0, coins: 0, finished: false });
    setSelected(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= String(current.options.length)) choose(Number(event.key) - 1);
      if (event.key === 'Enter') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const Icon = game.icon;
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12">
    <div className="mb-7 flex items-center justify-between">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-library"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game library', ar: 'العودة إلى مكتبة الألعاب' }, lang)}</Link>
      <div className="flex items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8f0] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-generic-game-coins">{progress.coins}</span></div>
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
            <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Three levels complete', ar: 'اكتملت المستويات الثلاثة' }, lang)}</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">{t({ en: 'You kept growing.', ar: 'واصلت النمو.' }, lang)}</h2>
            <p className="mx-auto mt-4 max-w-md text-[#688079]">{t({ en: 'Your choices, focus, and persistence are part of your learning trail.', ar: 'اختياراتك وتركيزك ومثابرتك جزء من مسار تعلمك.' }, lang)}</p>
            <div className="mx-auto mt-7 flex items-center gap-6 rounded-2xl bg-[#e6f1eb] px-6 py-4"><div><span className="block font-display text-2xl font-bold" data-testid="text-generic-game-score">{progress.score}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'score', ar: 'النقاط' }, lang)}</span></div><div className="h-9 w-px bg-[#c7ded1]" /><div><span className="block font-display text-2xl font-bold">{progress.coins}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'coins', ar: 'العملات' }, lang)}</span></div></div>
            <button onClick={restart} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8] transition hover:-translate-y-0.5" data-testid="button-restart-generic-game"><RotateCcw className="h-4 w-4" /> {t({ en: 'Play again', ar: 'العب مجدداً' }, lang)}</button>
          </div> : <div>
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Level', ar: 'المستوى' }, lang)} {level + 1} / 3</p><div className="mt-3 flex gap-1.5">{challenges.map((_, index) => <span key={index} className={`h-1.5 w-12 rounded-full ${index <= level ? 'bg-[#e8755f]' : 'bg-[#dfd2bd]'}`} />)}</div></div>
              <div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-sm font-bold"><Star className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-generic-game-score">{progress.score}</span></div>
            </div>
            <p className="mt-10 text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Challenge', ar: 'التحدي' }, lang)} {progress.question + 1} / {levelTarget}</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">{t(current.prompt, lang)}</h2>
            <p className="mt-3 max-w-xl text-[#688079]">{t(current.detail, lang)}</p>
            <div className="mt-7 grid gap-3">{current.options.map((option, index) => { const active = selected === index; const correct = active && option.good; return <button key={index} onClick={() => choose(index)} className={`group flex items-center gap-4 rounded-2xl border p-4 text-start transition-all ${active ? correct ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd4c1] bg-[#fcf8f0] hover:-translate-y-0.5 hover:border-[#33705f]'}`} data-testid={`button-generic-choice-${index + 1}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${active ? correct ? 'bg-[#33705f] text-white' : 'bg-[#e8755f] text-white' : 'bg-[#efe4cf] text-[#557068]'}`}>{active ? correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" /> : index + 1}</span><span className="flex-1 text-sm font-semibold text-[#174b44]">{t(option.label, lang)}</span><ChevronRight className={`h-4 w-4 text-[#9aaba0] transition-transform group-hover:translate-x-1 rtl:rotate-180 ${active ? 'opacity-100' : 'opacity-0'}`} /></button>; })}</div>
            {selected !== null && <div className={`mt-5 rounded-2xl p-4 ${current.options[selected].good ? 'bg-[#e6f1eb]' : 'bg-[#fff0eb]'}`} role="status" data-testid="status-generic-feedback"><p className="text-sm font-semibold leading-relaxed text-[#174b44]">{t(current.options[selected].note, lang)}</p><button onClick={next} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-4 py-2 text-xs font-bold text-[#fff4df]" data-testid="button-generic-next">{progress.level === challenges.length - 1 && progress.question === levelTarget - 1 ? t({ en: 'Finish game', ar: 'إنهاء اللعبة' }, lang) : t({ en: 'Next challenge', ar: 'التحدي التالي' }, lang)} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></button></div>}
          </div>}
        </div>
      </div>
    </section>
    <p className="mt-5 text-center text-xs font-semibold text-[#688079]">{t({ en: `Choose with 1–${current.options.length} · Press Enter to continue`, ar: `اختر من 1 إلى ${current.options.length} · اضغط Enter للمتابعة` }, lang)}</p>
  </div>;
}

type Round = { prompt: Copy; detail: Copy; options: { label: Copy; good: boolean; note: Copy }[] };
const rounds: Round[] = [
  { prompt: { en: 'The tide is out at the mangroves.', ar: 'انحسر المد عن أشجار القرم.' }, detail: { en: 'You have one pocket and three ways to help the coast. What do you carry?', ar: 'لديك جيب واحد وثلاث طرق لمساعدة الساحل. ماذا تحمل؟' }, options: [{ label: { en: 'A reusable water bottle', ar: 'زجاجة ماء قابلة لإعادة الاستخدام' }, good: true, note: { en: 'A smart sip. Less single-use plastic means more room for mangrove life.', ar: 'رشفة ذكية. بلاستيك أقل يعني مساحة أكبر لحياة القرم.' } }, { label: { en: 'A handful of shells', ar: 'حفنة من الأصداف' }, good: false, note: { en: 'Beautiful where they are. Leave the shoreline treasures for the next tide.', ar: 'جميلة في مكانها. اترك كنوز الشاطئ للمد القادم.' } }, { label: { en: 'A paper map to throw away', ar: 'خريطة ورقية ترميها لاحقاً' }, good: false, note: { en: 'Maps are helpful, but this one needs a bin at the end of its journey.', ar: 'الخرائط مفيدة، لكن هذه تحتاج إلى سلة في نهاية رحلتها.' } }] },
  { prompt: { en: 'The midday sun is bright.', ar: 'شمس الظهيرة ساطعة.' }, detail: { en: 'Your home is cooling down. Which small switch keeps energy for the city?', ar: 'منزلك يبرد الآن. أي مفتاح صغير يحافظ على طاقة المدينة؟' }, options: [{ label: { en: 'Close the curtains, then switch off the empty room', ar: 'أغلق الستائر وأطفئ غرفة فارغة' }, good: true, note: { en: 'Double win. Shade and a switched-off room keep energy in the right place.', ar: 'فوز مزدوج. الظل والغرفة المطفأة يحافظان على الطاقة في مكانها.' } }, { label: { en: 'Open the fridge for cool air', ar: 'افتح الثلاجة للهواء البارد' }, good: false, note: { en: 'The fridge is for snacks, not shade. Let it keep its cool.', ar: 'الثلاجة للوجبات الخفيفة، لا للظل. دعها تحتفظ ببرودتها.' } }, { label: { en: 'Turn every light on', ar: 'شغّل كل الأضواء' }, good: false, note: { en: 'A bright idea, but natural light is already doing the work.', ar: 'فكرة مضيئة، لكن ضوء النهار يقوم بالمهمة بالفعل.' } }] },
  { prompt: { en: 'A new seedling needs a home.', ar: 'تحتاج شتلة جديدة إلى منزل.' }, detail: { en: 'Choose the place where it can grow with the least extra water.', ar: 'اختر المكان الذي يمكنها أن تنمو فيه بأقل قدر إضافي من الماء.' }, options: [{ label: { en: 'A native garden with a little shade', ar: 'حديقة محلية مع قليل من الظل' }, good: true, note: { en: 'The right place. Native plants know this sun and share water wisely.', ar: 'المكان المناسب. النباتات المحلية تعرف هذه الشمس وتتشارك الماء بحكمة.' } }, { label: { en: 'The hottest paved corner', ar: 'أكثر زاوية مرصوفة حرارة' }, good: false, note: { en: 'That corner needs shade before it needs a seedling.', ar: 'تحتاج تلك الزاوية إلى الظل قبل أن تحتاج إلى شتلة.' } }, { label: { en: 'A pool with no soil', ar: 'حوض بلا تربة' }, good: false, note: { en: 'A seedling needs roots and soil to begin its story.', ar: 'تحتاج الشتلة إلى جذور وتربة لتبدأ قصتها.' } }] },
  { prompt: { en: 'The city is planning a brighter route.', ar: 'تخطط المدينة لمسار أكثر إشراقاً.' }, detail: { en: 'Which idea helps people and the planet travel together?', ar: 'أي فكرة تساعد الناس والكوكب على التنقل معاً؟' }, options: [{ label: { en: 'A shaded walking path with trees', ar: 'مسار مشاة مظلل بالأشجار' }, good: true, note: { en: 'A route with room to breathe. Good for people, birds, and the city.', ar: 'مسار يتسع للتنفس. مفيد للناس والطيور والمدينة.' } }, { label: { en: 'A wider road for empty cars', ar: 'طريق أوسع لسيارات فارغة' }, good: false, note: { en: 'More road is not always more movement. Try a route people can share.', ar: 'المزيد من الطرق لا يعني دائماً حركة أكثر. جرب مساراً يتشارك فيه الناس.' } }, { label: { en: 'A path with no shade at all', ar: 'مسار بلا ظل على الإطلاق' }, good: false, note: { en: 'The best routes welcome people in every season.', ar: 'أفضل المسارات ترحب بالناس في كل فصل.' } }] },
];

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
  return <div className="mx-auto max-w-[1120px] px-5 py-8 lg:px-10 lg:py-12"><div className="mb-7 flex items-center justify-between"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#557068] transition hover:text-[#174b44]" data-testid="link-back-home"><ArrowLeft className="h-4 w-4" /> {t({ en: 'Back to game hub', ar: 'العودة لمركز الألعاب' }, lang)}</Link><div className="flex items-center gap-2 rounded-full border border-[#dfd2bd] bg-[#fcf8f0] px-4 py-2 text-sm font-bold text-[#174b44]"><Coins className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-game-coins">{coins}</span></div></div><section className="overflow-hidden rounded-[30px] bg-[#174b44] text-[#fff4df] shadow-float"><div className="grid lg:grid-cols-[.78fr_1.22fr]"><div className="relative min-h-[240px] overflow-hidden bg-[#2d675d] p-7 sm:p-10"><div className="absolute -end-16 -top-14 h-52 w-52 rounded-full bg-[#f2c95c]" /><div className="absolute bottom-[-60px] start-[-25px] h-48 w-72 rotate-[-17deg] rounded-[50%] bg-[#71a695]" /><div className="absolute bottom-[-65px] end-[-25px] h-48 w-64 rotate-[12deg] rounded-[50%] bg-[#3b8876]" /><div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#d7e8df]"><Leaf className="h-4 w-4 text-[#f2c95c]" /> Eco Future</div><h1 className="mt-8 max-w-xs font-display text-5xl font-semibold leading-[.9] tracking-[-.06em]">{t({ en: 'Grow the good.', ar: 'ازرع الخير.' }, lang)}</h1><p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c0dbcf]">{t({ en: 'A choice-powered journey through the places we call home.', ar: 'رحلة تقودها الاختيارات عبر الأماكن التي نسميها وطننا.' }, lang)}</p></div></div><div className="bg-[#fffaf2] p-6 text-[#174b44] sm:p-10">{finished ? <div className="flex min-h-[370px] flex-col justify-center text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f2c95c] text-[#174b44]"><Trophy className="h-9 w-9" /></div><p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e8755f]">{t({ en: 'Trail complete', ar: 'اكتمل المسار' }, lang)}</p><h2 className="mt-2 font-display text-4xl font-bold tracking-tight">{t({ en: 'You made room for tomorrow.', ar: 'لقد صنعت مساحة للغد.' }, lang)}</h2><p className="mx-auto mt-4 max-w-md text-[#688079]">{t({ en: 'Four thoughtful choices, one brighter trail. Your progress is saved on this device.', ar: 'أربعة اختيارات واعية ومسار أكثر إشراقاً. تم حفظ تقدمك على هذا الجهاز.' }, lang)}</p><div className="mx-auto mt-7 flex items-center gap-6 rounded-2xl bg-[#e6f1eb] px-6 py-4"><div><span className="block font-display text-2xl font-bold" data-testid="text-final-score">{score}</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'score', ar: 'النقاط' }, lang)}</span></div><div className="h-9 w-px bg-[#c7ded1]" /><div><span className="block font-display text-2xl font-bold">100%</span><span className="text-xs font-bold text-[#688079]">{t({ en: 'trail complete', ar: 'اكتمل المسار' }, lang)}</span></div></div><button onClick={restart} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8755f] px-6 py-3 font-bold text-[#fff7e8] transition hover:-translate-y-0.5" data-testid="button-restart-game"><RotateCcw className="h-4 w-4" /> {t({ en: 'Play the trail again', ar: 'العب المسار مجدداً' }, lang)}</button></div> : <div><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Choice', ar: 'الاختيار' }, lang)} {round + 1} / {rounds.length}</p><div className="mt-3 flex gap-1.5">{rounds.map((_, index) => <span key={index} className={`h-1.5 w-10 rounded-full ${index <= round ? 'bg-[#e8755f]' : 'bg-[#dfd2bd]'}`} />)}</div></div><div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-sm font-bold"><Star className="h-4 w-4 text-[#e8755f]" /> <span data-testid="text-game-score">{score}</span></div></div><h2 className="mt-12 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">{t(current.prompt, lang)}</h2><p className="mt-3 max-w-xl text-[#688079]">{t(current.detail, lang)}</p><div className="mt-7 grid gap-3">{current.options.map((option, index) => { const active = selected === index; const correct = active && option.good; return <button key={index} onClick={() => choose(index)} aria-pressed={active} className={`group flex items-center gap-4 rounded-2xl border p-4 text-start transition-all ${active ? correct ? 'border-[#33705f] bg-[#e6f1eb]' : 'border-[#e8755f] bg-[#fff0eb]' : 'border-[#dfd2bd] bg-[#fcf8f0] hover:-translate-y-0.5 hover:border-[#33705f]'}`} data-testid={`button-choice-${index + 1}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold ${active ? correct ? 'bg-[#33705f] text-white' : 'bg-[#e8755f] text-white' : 'bg-[#efe4cf] text-[#557068]'}`}>{active ? correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" /> : index + 1}</span><span className="flex-1 text-sm font-semibold text-[#174b44]">{t(option.label, lang)}</span><ChevronRight className={`h-4 w-4 text-[#9aaba0] transition-transform group-hover:translate-x-1 rtl:rotate-180 ${active ? 'opacity-100' : 'opacity-0'}`} /></button>; })}</div>{selected !== null && <div className={`mt-5 rounded-2xl p-4 ${current.options[selected].good ? 'bg-[#e6f1eb]' : 'bg-[#fff0eb]'}`} role="status" data-testid="status-choice-feedback"><p className="text-sm font-semibold leading-relaxed text-[#174b44]">{t(current.options[selected].note, lang)}</p><button onClick={next} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#174b44] px-4 py-2 text-xs font-bold text-[#fff4df]" data-testid="button-next-choice">{round >= rounds.length - 1 ? t({ en: 'Finish trail', ar: 'إنهاء المسار' }, lang) : t({ en: 'Next choice', ar: 'الاختيار التالي' }, lang)} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /></button></div>}</div>}</div></div></section><p className="mt-5 text-center text-xs font-semibold text-[#688079]">{t({ en: 'Choose with 1, 2, or 3 · Press Enter to continue', ar: 'اختر باستخدام 1 أو 2 أو 3 · اضغط Enter للمتابعة' }, lang)}</p></div>;
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
  return <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#33705f]"><BarChart3 className="h-3.5 w-3.5" /> {t({ en: 'Demo dashboard', ar: 'لوحة تجريبية' }, lang)}</div><h1 className="font-display text-5xl font-semibold tracking-[-.06em] text-[#174b44]">{t({ en: 'The learning trail, in view.', ar: 'مسار التعلم، أمامك.' }, lang)}</h1><p className="mt-3 max-w-xl text-[#6b7e76]">{t({ en: 'A local snapshot of games, players, levels, and activity. No backend data is connected yet.', ar: 'لقطة محلية للألعاب واللاعبين والمستويات والنشاط. لا توجد بيانات خادم متصلة بعد.' }, lang)}</p></div><button onClick={() => setShowNote((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c8d2c7] bg-[#fcf8f0] px-5 py-3 text-sm font-bold text-[#174b44] hover:border-[#174b44]" data-testid="button-dashboard-note"><CircleHelp className="h-4 w-4" /> {t({ en: 'About this demo', ar: 'عن هذه التجربة' }, lang)}</button></div>{showNote && <div className="mt-5 rounded-2xl border border-[#e6cc8a] bg-[#fff3cc] px-5 py-4 text-sm font-semibold text-[#66532f]" role="status" data-testid="status-dashboard-note">{t({ en: 'Demo data combines a few Abu Dhabi player profiles with the player saved on this device.', ar: 'تجمع البيانات التجريبية بين ملفات لاعبين من أبوظبي واللاعب المحفوظ على هذا الجهاز.' }, lang)}</div>}<section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ icon: Users, label: { en: 'Named players', ar: 'اللاعبون' }, value: players.length.toString(), detail: 'Across this snapshot' }, { icon: Gamepad2, label: { en: 'Game worlds', ar: 'عوالم الألعاب' }, value: gameBlueprints.length.toString(), detail: '1 playable today' }, { icon: BarChart3, label: { en: 'Average progress', ar: 'متوسط التقدم' }, value: `${totalProgress}%`, detail: 'Across all trails' }, { icon: Coins, label: { en: 'Coins in play', ar: 'العملات' }, value: players.reduce((sum, player) => sum + player.coins, 0).toString(), detail: 'Collected locally' }].map(({ icon: Icon, label, value, detail }) => <div key={value + detail} className="rounded-[22px] border border-[#dfd2bd] bg-[#fcf8f0] p-5 shadow-soft"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#efe1bf] text-[#174b44]"><Icon className="h-5 w-5" /></div><span className="font-display text-3xl font-bold text-[#174b44]" data-testid={`metric-${String(label.en).toLowerCase().replace(' ', '-')}`}>{value}</span></div><p className="mt-6 text-sm font-bold text-[#174b44]">{t(label, lang)}</p><p className="mt-1 text-xs text-[#7b8a82]">{detail}</p></div>)}</section><section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><div className="overflow-hidden rounded-[24px] border border-[#dfd2bd] bg-[#fcf8f0]"><div className="flex items-center justify-between border-b border-[#dfd2bd] px-5 py-5 sm:px-7"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8755f]">{t({ en: 'Player activity', ar: 'نشاط اللاعبين' }, lang)}</p><h2 className="mt-1 font-display text-2xl font-bold text-[#174b44]">{t({ en: 'Learners on the trail', ar: 'المتعلمون في المسار' }, lang)}</h2></div><span className="rounded-full bg-[#e6f1eb] px-3 py-1 text-xs font-bold text-[#33705f]">Local demo</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-start"><thead className="bg-[#f3eadb] text-xs uppercase tracking-[.12em] text-[#7a897f]"><tr><th className="px-5 py-3 text-start font-bold sm:px-7">Player</th><th className="px-4 py-3 text-start font-bold">Level</th><th className="px-4 py-3 text-start font-bold">Progress</th><th className="px-4 py-3 text-start font-bold">Coins</th><th className="px-4 py-3 text-start font-bold">Last active</th></tr></thead><tbody>{players.map((player) => <tr key={player.name} className="border-t border-[#eee3d2]"><td className="px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-full ${player.tone} font-display text-xs font-bold text-[#174b44]`}>{player.initials}</span><span className="font-bold text-[#174b44]" data-testid={`player-name-${player.initials}`}>{player.name}</span></div></td><td className="px-4 py-4 text-sm font-semibold text-[#557068]">{player.level}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-2 w-20 overflow-hidden rounded-full bg-[#e2e7dd]"><div className="h-full rounded-full bg-[#33705f]" style={{ width: `${player.progress}%` }} /></div><span className="text-xs font-bold text-[#557068]">{player.progress}%</span></div></td><td className="px-4 py-4 text-sm font-bold text-[#174b44]">{player.coins}</td><td className="px-4 py-4 text-xs font-semibold text-[#7a897f]">{player.lastActive}</td></tr>)}</tbody></table></div></div><div className="rounded-[24px] bg-[#174b44] p-6 text-[#fff4df]"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c95c]">{t({ en: 'Game summary', ar: 'ملخص الألعاب' }, lang)}</p><h2 className="mt-2 font-display text-2xl font-bold">{t({ en: 'Worlds taking shape', ar: 'عوالم تتشكل' }, lang)}</h2><div className="mt-7 space-y-5">{[{ name: 'Eco Future', status: 'Playable', value: `${totalProgress}%`, color: '#f2c95c' }, { name: 'Our Heritage', status: 'Building', value: '68%', color: '#71a695' }, { name: 'Color Focus', status: 'Designing', value: '41%', color: '#e8755f' }].map((game) => <div key={game.name}><div className="flex items-center justify-between text-sm"><span className="font-bold">{game.name}</span><span className="text-[#b7d1c5]">{game.status}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#397467]"><div className="h-full rounded-full" style={{ width: game.value, backgroundColor: game.color }} /></div><p className="mt-1 text-end text-xs font-bold text-[#b7d1c5]">{game.value} ready</p></div>)}</div><Link href="/library" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#f2c95c] hover:text-[#fff4df]" data-testid="link-dashboard-library">{t({ en: 'View all game worlds', ar: 'عرض جميع العوالم' }, lang)} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div></section></div>;
}

function RootPage({ lang }: { lang: Lang }) {
  const [profile] = useLocal<PlayerProfile | null>('bunayn-player-profile', null);
  return profile ? <Home lang={lang} /> : <Welcome lang={lang} />;
}

function RouterContent({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return <Shell lang={lang} setLang={setLang}><Switch><Route path="/welcome" component={() => <Welcome lang={lang} />} /><Route path="/login" component={() => <Login lang={lang} />} /><Route path="/" component={() => <RootPage lang={lang} />} /><Route path="/eco-future" component={() => <EcoFuture lang={lang} />} /><Route path="/library" component={() => <Library lang={lang} />} /><Route path="/admin" component={() => <Admin lang={lang} />} /><Route component={NotFound} /></Switch></Shell>;
}

function App() {
  const [lang, setLang] = useLocal<Lang>('bunayn-language', 'en');
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><RouterContent lang={lang} setLang={setLang} /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;