import { useStudioStore } from '@/lib/store';
import { ScoreState } from '@/lib/scoring';
import { BEHAVIOURS } from '@/lib/constants';
import { useParams } from 'wouter';
import { getGetStudioProjectQueryKey, useGetStudioProject } from '@workspace/api-client-react';
import { t } from '@/lib/i18n';

export function Indicators({ score }: { score: ScoreState }) {
  const { pieces, locale } = useStudioStore();
  
  const params = useParams();
  const { data: project } = useGetStudioProject(params.id ?? '', {
    query: { enabled: Boolean(params.id), queryKey: params.id ? getGetStudioProjectQueryKey(params.id) : [] }
  });

  const briefBehaviours = project?.behaviours || [];

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 overflow-y-auto max-h-full shrink-0">
      {briefBehaviours.map(bId => {
        const behaviour = BEHAVIOURS.find(b => b.id === bId);
        if (!behaviour) return null;

        const assignedPieces = pieces.filter(p => p.assignedBehaviours?.includes(bId));
        const val = score[bId as keyof ScoreState] ?? 0;
        
        return (
          <div key={bId} className="bg-[var(--surface)] p-3 rounded-md border border-[var(--line)]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-[var(--ink)] text-sm">{locale === 'ar' ? behaviour.labelAr : behaviour.label}</span>
              <span className="font-mono text-xs font-medium text-[var(--ink-soft)]">{val}/100</span>
            </div>
            
            <div className="h-2 bg-[var(--line-soft)] rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-[var(--blue)] transition-all duration-300 ease-out"
                style={{ width: `${val}%` }}
              />
            </div>
            
            {assignedPieces.length > 0 ? (
              <div className="text-xs text-[var(--ink-soft)] leading-relaxed">
                {t('builder.bars.from', locale)} {assignedPieces.map(p => p.editableLabel).join(', ')}
              </div>
            ) : (
              <div className="text-xs text-[var(--warn)] font-medium">
                {t('builder.bars.noPiece', locale)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
