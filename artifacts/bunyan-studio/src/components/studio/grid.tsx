import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useStudioStore, PlacedPiece } from '@/lib/store';
import { PIECES, THEMES } from '@/lib/constants';
import { t } from '@/lib/i18n';

function GridPiece({ piece }: { piece: PlacedPiece }) {
  const def = PIECES.find(p => p.key === piece.key);
  const { theme, locale, selectedPieceId, setSelectedPiece, removePiece } = useStudioStore();
  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const label = (currentTheme.labels as any)[locale][piece.key] || piece.key;
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: piece.id,
    data: {
      type: 'piece',
      id: piece.id,
    }
  });

  const isSelected = selectedPieceId === piece.id;

  if (!def) return null;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        setSelectedPiece(piece.id);
        // let the drag event bubble up
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        removePiece(piece.id);
      }}
      className={`absolute piece-block h-12 flex items-center px-4 cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'opacity-50 z-50' : 'opacity-100 z-10'
      } ${isSelected ? 'ring-2 ring-[var(--ink)] ring-offset-2' : ''}`}
      style={{
        left: piece.x,
        top: piece.y,
        backgroundColor: def.color,
        color: 'var(--surface)'
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          removePiece(piece.id);
        }
      }}
    >
      <span className="font-medium text-sm whitespace-nowrap">{label}</span>
    </div>
  );
}

export function Grid() {
  const { theme, pieces, locale, setSelectedPiece } = useStudioStore();
  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const { setNodeRef } = useDroppable({
    id: 'grid'
  });

  return (
    <div 
      ref={setNodeRef}
      className="relative min-h-[420px] w-full flex-1 overflow-hidden grid-bg lg:min-h-0"
      style={{ backgroundColor: currentTheme.bg }}
      onPointerDown={() => setSelectedPiece(null)}
    >
      {pieces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[var(--ink-soft)] font-medium text-lg bg-[var(--paper)]/80 px-4 py-2 rounded-md">
            {t('builder.emptyState', locale)}
          </p>
        </div>
      )}
      
      {pieces.map(p => (
        <GridPiece key={p.id} piece={p} />
      ))}
    </div>
  );
}
