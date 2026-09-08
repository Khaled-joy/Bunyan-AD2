import { useStudioStore, PlacedPiece } from '@/lib/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { t } from '@/lib/i18n';
import { PALETTE, SWATCHES, SEALED_TYPES } from '@/lib/constants';
import { AlertCircle } from 'lucide-react';

function GridPiece({ piece }: { piece: PlacedPiece }) {
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
    left: piece.x,
    top: piece.y,
    width: `${(piece.size / 100) * 120}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isSelected ? 10 : 1,
    backgroundColor: colorVal,
    color: 'white',
    padding: `${(piece.size / 100) * 8}px`,
    fontSize: `${(piece.size / 100) * 0.875}rem`,
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
      className={`piece-block cursor-grab active:cursor-grabbing font-medium shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--ink)] focus:ring-offset-2 ${isSelected ? 'ring-2 ring-[var(--ink)] ring-offset-2' : ''} ${isDragging ? 'opacity-75 z-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPiece(piece.id);
      }}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {piece.editableLabel}
      {missingAssignment && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--warn)] rounded-full flex items-center justify-center text-white border-2 border-white z-10" title={t('builder.unassignedBadge', locale)}>
          <AlertCircle className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

export function Grid() {
  const { pieces, setSelectedPiece, locale } = useStudioStore();
  const { setNodeRef } = useDroppable({ id: 'grid' });

  return (
    <div 
      ref={setNodeRef}
      className="min-h-[420px] flex-1 relative overflow-auto grid-bg lg:min-h-0"
      onClick={() => setSelectedPiece(null)}
    >
      <div style={{ width: '2000px', height: '2000px' }} className="absolute top-0 left-0 pointer-events-none" />
      {pieces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[var(--ink-faint)] font-medium text-lg text-center max-w-xs px-4">
            {t('builder.emptyState', locale)}
          </p>
        </div>
      )}
      
      {pieces.map(piece => (
        <GridPiece key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
