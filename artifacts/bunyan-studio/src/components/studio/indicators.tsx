import React from 'react';
import { useStudioStore } from '@/lib/store';
import { ScoreState } from '@/lib/scoring';
import { t } from '@/lib/i18n';
import { THEMES } from '@/lib/constants';

const DIMENSIONS = [
  { key: 'responsibility', labelEn: 'Responsibility', labelAr: 'المسؤولية', reqPiece: 'bin' },
  { key: 'respect', labelEn: 'Respect', labelAr: 'الاحترام', reqPiece: 'queue' },
  { key: 'participation', labelEn: 'Participation', labelAr: 'المشاركة', reqPiece: 'zone' },
  { key: 'courage', labelEn: 'Courage', labelAr: 'الشجاعة', reqPiece: 'choice' },
  { key: 'problemSolving', labelEn: 'Problem Solving', labelAr: 'حل المشكلات', reqPiece: 'hint' },
];

export function Indicators({ score }: { score: ScoreState }) {
  const { pieces, locale, theme } = useStudioStore();
  const currentTheme = THEMES.find((item) => item.id === theme) || THEMES[0];

  return (
    <div className="w-full shrink-0 bg-[var(--surface)] p-4 rounded-md shadow-sm border border-[var(--line)] flex flex-col gap-4 lg:w-80">
      <h3 className="font-display font-semibold text-lg text-[var(--ink)]">
        {locale === 'en' ? 'Indicators' : 'المؤشرات'}
      </h3>
      
      <div className="space-y-4">
        {DIMENSIONS.map(dim => {
          const hasPiece = pieces.some(p => p.key === dim.reqPiece);
          const val = score[dim.key as keyof ScoreState];
          
          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[var(--ink)]">
                  {locale === 'en' ? dim.labelEn : dim.labelAr}
                </span>
                {hasPiece && (
                  <span className="text-[var(--ink-soft)] font-mono">{val}%</span>
                )}
              </div>
              
              {hasPiece ? (
                <div className="h-2 w-full bg-[var(--line-soft)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--block-blue)] transition-all duration-300 ease-out"
                    style={{ width: `${val}%` }}
                  />
                </div>
              ) : (
                <div className="h-6 flex items-center bg-[var(--warn)]/10 px-2 rounded border border-[var(--warn)]/20">
                  <span className="text-xs font-medium text-[var(--warn)] truncate">
                    {t('nav.missingPiece', locale, { piece: currentTheme.labels[locale][dim.reqPiece as keyof typeof currentTheme.labels.en] })}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
