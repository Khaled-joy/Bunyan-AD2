import { ReactNode, useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { t } from '@/lib/i18n';
import logo from '@/assets/logo.png';

export function StudioShell({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useStudioStore();
  const [location] = useLocation();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('lang') === 'ar') {
      setLocale('ar');
    }
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return (
    <div className={`flex min-h-[100dvh] flex-col overflow-visible bg-[var(--paper)] lg:h-[100dvh] lg:overflow-hidden ${locale === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 shrink-0 shadow-sm z-30">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <img src={logo} alt="Bunyan Abu Dhabi" className="h-9 w-auto object-contain" />
            <span className="font-display font-bold text-[var(--ink)] text-lg hidden sm:block pt-1 group-hover:text-[var(--blue)] transition-colors">
              Bunyan Studio
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {location.startsWith('/builder') && (
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs font-medium mr-2 rtl:mr-0 rtl:ml-2">
                {t('goHome', locale)}
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-medium"
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          >
            {locale === 'en' ? 'عربي' : 'English'}
          </Button>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-visible relative lg:overflow-hidden">
        {children}
      </main>
    </div>
  );
}
