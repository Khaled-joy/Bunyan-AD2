import { useStudioStore } from '@/lib/store';
import { useDraggable } from '@dnd-kit/core';
import { t } from '@/lib/i18n';
import { PALETTE, PieceGroup } from '@/lib/constants';
import { PieceVisual } from './piece-visual';

function DraggablePaletteItem({ item }: { item: any }) {
  const { locale, addPiece, zoom } = useStudioStore();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: { type: 'palette', key: item.id, item }
  });

  const name = locale === 'ar' ? item.nameAr : item.name;
  const previewColor = item.group === 'Maps'
    ? 'var(--blue)'
    : item.group === 'Characters'
      ? 'var(--coral)'
      : item.group === 'Objects'
        ? 'var(--amber)'
        : 'var(--teal)';

  const handleClick = () => {
    // Fallback for touch users who tap instead of drag
    const container = document.getElementById('grid-container');
    const scrollLeft = container?.scrollLeft || 0;
    const scrollTop = container?.scrollTop || 0;
    
    const rawX = scrollLeft + 100;
    const rawY = scrollTop + 100;
    
    const logicalX = Math.max(0, Math.round(rawX / zoom));
    const logicalY = Math.max(0, Math.round(rawY / zoom));
    
    addPiece(item.id, item.sealedType, logicalX, logicalY, name);
  };

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`relative w-full p-2 mb-2 text-left rtl:text-right text-sm font-medium bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--paper)] rounded-xl border-2 border-transparent hover:border-[var(--line)] transition-all flex items-center gap-3 shadow-sm ${isDragging ? 'opacity-30 scale-95' : ''}`}
    >
      <PieceVisual paletteId={item.id} colorValue={previewColor} view="palette" />
      <span className="flex-1 truncate">{name}</span>
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
