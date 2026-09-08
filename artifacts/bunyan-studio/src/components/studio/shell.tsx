import React, { useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import { THEMES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import logo from '@/assets/logo.png';
import { Globe, Download, Save, Play, Trash2 } from 'lucide-react';
import { Link } from 'wouter';

export function StudioShell({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, theme, setTheme } = useStudioStore();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('lang') === 'ar') {
      setLocale('ar');
    }
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--paper)]">
      <header className="min-h-14 border-b border-[var(--line)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-2 px-3 py-2 shrink-0">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Link href="/">
            <img src={logo} alt="Bunyan" className="h-8 object-contain cursor-pointer" />
          </Link>
          <div className="hidden h-6 w-px bg-[var(--line)] mx-2 sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden text-sm font-medium text-[var(--ink-soft)] sm:inline">{t('nav.themes', locale)}:</span>
            <div className="flex min-w-0 overflow-x-auto bg-[var(--paper)] rounded-md p-1 border border-[var(--line)]">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`whitespace-nowrap px-2 py-1 text-xs sm:px-3 sm:text-sm rounded-sm transition-colors ${
                    theme === t.id 
                      ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' 
                      : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                  }`}
                >
                  {locale === 'ar' ? t.nameAr : t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}>
            <Globe className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {locale === 'en' ? 'عربي' : 'English'}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-visible lg:overflow-hidden">
        {children}
      </main>
    </div>
  );
}
