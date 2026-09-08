import { useStudioStore, PlacedPiece } from '@/lib/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { t } from '@/lib/i18n';
import { SWATCHES, SEALED_TYPES } from '@/lib/constants';
import { PieceVisual } from './piece-visual';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

function GridPiece({ piece, zoom }: { piece: PlacedPiece, zoom: number }) {
  const { selectedPieceId, setSelectedPiece, removePiece, locale } = useStudioStore();
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
    data: { type: 'piece', id: piece.id }
  });

  const sealed = SEALED_TYPES[piece.sealedType];
  const colorVal = SWATCHES.find(s => s.id === piece.color)?.value || 'var(--blue)';
  
  const isSelected = selectedPieceId === piece.id;
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: piece.x * zoom,
    top: piece.y * zoom,
    zIndex: isSelected ? 100 : (sealed?.type === 'map' ? 1 : 10),
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    removePiece(piece.id);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      removePiece(piece.id);
    }
  };

  const missingAssignment = sealed?.needsAssignment && (!piece.assignedBehaviours || piece.assignedBehaviours.length === 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute cursor-grab active:cursor-grabbing focus:outline-none ${isDragging ? 'opacity-70 z-[200]' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPiece(piece.id);
      }}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <PieceVisual 
        paletteId={piece.paletteId} 
        colorValue={colorVal} 
        sizePercent={piece.size * zoom} 
        label={piece.editableLabel}
        missingAssignment={missingAssignment}
        selected={isSelected}
        view="grid"
      />
    </div>
  );
}

export function Grid() {
  const { pieces, setSelectedPiece, locale, zoom, setZoom } = useStudioStore();
  const { setNodeRef } = useDroppable({ id: 'grid' });

  return (
    <div className="flex-1 relative flex flex-col min-h-[420px] lg:min-h-0">
      <div 
        id="grid-container"
        ref={setNodeRef}
        className="flex-1 relative overflow-auto bg-[var(--paper)] grid-bg-pattern outline-none"
        style={{ '--bg-size': `${40 * zoom}px` } as React.CSSProperties}
        onClick={() => setSelectedPiece(null)}
      >
        <div style={{ width: `${3000 * zoom}px`, height: `${3000 * zoom}px` }} className="absolute top-0 left-0 pointer-events-none" />
        {pieces.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 lg:absolute lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-2xl shadow-sm border border-[var(--line)]">
              <p className="text-[var(--ink-faint)] font-medium text-lg text-center max-w-xs">
                {t('builder.emptyState', locale)}
              </p>
            </div>
          </div>
        )}
        
        {pieces.map(piece => (
          <GridPiece key={piece.id} piece={piece} zoom={zoom} />
        ))}
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex items-center bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--line)] p-1.5 z-50">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--ink)] hover:bg-[var(--paper)] rounded-lg" onClick={() => setZoom(Math.max(0.2, zoom - 0.2))} title={t('builder.zoomOut', locale)} aria-label={t('builder.zoomOut', locale)}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs font-bold w-12 text-center text-[var(--ink)]">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--ink)] hover:bg-[var(--paper)] rounded-lg" onClick={() => setZoom(Math.min(2, zoom + 0.2))} title={t('builder.zoomIn', locale)} aria-label={t('builder.zoomIn', locale)}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-[var(--line)] mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--ink)] hover:bg-[var(--paper)] rounded-lg" onClick={() => setZoom(1)} title={t('builder.resetZoom', locale)} aria-label={t('builder.resetZoom', locale)}>
          <Maximize className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
