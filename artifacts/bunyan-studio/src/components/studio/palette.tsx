import { useDraggable } from '@dnd-kit/core';
import { PIECES, PieceDef, THEMES } from '@/lib/constants';
import { t } from '@/lib/i18n';
import { useStudioStore } from '@/lib/store';
import { Plus } from 'lucide-react';

function PaletteItem({ piece, label }: { piece: PieceDef, label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${piece.key}`,
    data: {
      type: 'palette',
      key: piece.key,
    },
  });
  
  const { addPiece } = useStudioStore();
  
  const handleClick = () => {
    addPiece(piece.key, 100, 100);
  };

  return (
    <div className="relative group touch-none">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`piece-block h-12 flex items-center px-3 cursor-grab hover:brightness-110 active:cursor-grabbing transition-all ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        style={{ backgroundColor: piece.color, color: 'var(--surface)' }}
      >
        <span className="font-medium text-sm flex-1 truncate">{label}</span>
      </div>
      
      <button 
        onClick={handleClick}
        className="absolute top-1/2 -translate-y-1/2 rtl:left-2 ltr:right-2 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Add ${label}`}
      >
        <Plus className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

export function Palette() {
  const { locale, theme } = useStudioStore();
  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  
  return (
    <div className="w-full shrink-0 bg-[var(--surface)] border-b lg:w-64 lg:border-b-0 lg:border-r rtl:lg:border-l rtl:lg:border-r-0 border-[var(--line)] flex flex-col z-10">
      <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)]">
        <h2 className="font-display font-semibold text-lg">{t('builder.palette', locale)}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:block lg:flex-1 lg:overflow-y-auto lg:space-y-4">
        {PIECES.map(p => {
          const label = (currentTheme.labels as any)[locale][p.key] || p.key;
          return <PaletteItem key={p.key} piece={p} label={label} />;
        })}
      </div>
    </div>
  );
}
