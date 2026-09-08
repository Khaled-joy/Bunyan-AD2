import { useStudioStore } from '@/lib/store';
import { useDraggable } from '@dnd-kit/core';
import { t } from '@/lib/i18n';
import { PALETTE, PieceGroup } from '@/lib/constants';

function DraggablePaletteItem({ item }: { item: any }) {
  const { locale, addPiece } = useStudioStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: { type: 'palette', key: item.id, item }
  });

  const handleClick = () => {
    // Fallback for touch users who tap instead of drag
    addPiece(item.id, item.sealedType, 20, 20, item.name);
  };

  const name = locale === 'ar' ? item.nameAr : item.name;

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`piece-block w-full p-2 mb-2 text-left rtl:text-right text-sm font-medium bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors flex items-center justify-between ${isDragging ? 'opacity-50' : ''}`}
      style={{
        '--background-color': 'var(--ink)' // Preview color
      } as React.CSSProperties}
    >
      <span>{name}</span>
      <div className="w-3 h-3 rounded-full bg-[var(--ink)]" />
    </button>
  );
}

export function Palette() {
  const { locale } = useStudioStore();
  
  const groups: PieceGroup[] = ['Maps', 'Characters', 'Objects', 'Actions'];
  const groupLabels: Record<string, string> = {
    'Maps': t('home.pieces.map', locale),
    'Characters': t('home.pieces.characters', locale),
    'Objects': t('home.pieces.objects', locale),
    'Actions': t('home.pieces.actions', locale),
  };
  
  return (
    <div className="w-full max-h-[420px] lg:max-h-none lg:w-64 bg-[var(--surface)] border-b lg:border-b-0 lg:border-r rtl:lg:border-r-0 rtl:lg:border-l border-[var(--line)] flex flex-col shrink-0">
      <div className="p-3 border-b border-[var(--line)] bg-[var(--paper)]">
        <h2 className="font-display font-bold text-[var(--ink)]">{t('builder.palette', locale)}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groups.map(group => {
          const items = PALETTE.filter(p => p.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <h3 className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-3">{groupLabels[group]}</h3>
              <div>
                {items.map(item => (
                  <DraggablePaletteItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
