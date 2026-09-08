import { create } from 'zustand';

export interface PlacedPiece {
  id: string; // uuid
  paletteId: string;
  sealedType: string;
  x: number;
  y: number;
  editableLabel: string;
  size: number; // 70 - 170
  color: string; // SWATCHES id
  settings: Record<string, string | number>; // bounded/registry values
  assignedBehaviours: string[];
  reviewerWhy: string;
}

interface StudioState {
  locale: 'en' | 'ar';
  pieces: PlacedPiece[];
  selectedPieceId: string | null;

  setLocale: (locale: 'en' | 'ar') => void;
  addPiece: (paletteId: string, sealedType: string, x: number, y: number, name: string) => void;
  updatePiece: (id: string, updates: Partial<PlacedPiece>) => void;
  removePiece: (id: string) => void;
  setSelectedPiece: (id: string | null) => void;
  clearGrid: () => void;
  loadProject: (pieces: PlacedPiece[]) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  locale: 'en',
  pieces: [],
  selectedPieceId: null,

  setLocale: (locale) => set({ locale }),

  addPiece: (paletteId, sealedType, x, y, name) => set((state) => {
    const id = crypto.randomUUID();
    const newPiece: PlacedPiece = {
      id,
      paletteId,
      sealedType,
      x,
      y,
      editableLabel: name,
      size: 100,
      color: 'blue',
      settings: {},
      assignedBehaviours: [],
      reviewerWhy: '',
    };
    return { pieces: [...state.pieces, newPiece], selectedPieceId: id };
  }),

  updatePiece: (id, updates) => set((state) => ({
    pieces: state.pieces.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  removePiece: (id) => set((state) => ({
    pieces: state.pieces.filter(p => p.id !== id),
    selectedPieceId: state.selectedPieceId === id ? null : state.selectedPieceId
  })),

  setSelectedPiece: (id) => set({ selectedPieceId: id }),
  clearGrid: () => set({ pieces: [], selectedPieceId: null }),
  loadProject: (pieces) => set({ pieces, selectedPieceId: null })
}));
