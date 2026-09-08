import { create } from 'zustand';
import { DEFAULT_PIECE_SETTINGS } from './constants';

export interface PlacedPiece {
  id: string; // uuid
  key: string; // Piece key
  x: number;
  y: number;
  settings: Record<string, any>;
}

interface StudioState {
  theme: string;
  pieces: PlacedPiece[];
  selectedPieceId: string | null;
  locale: 'en' | 'ar';
  
  setTheme: (theme: string) => void;
  setLocale: (locale: 'en' | 'ar') => void;
  addPiece: (key: string, x: number, y: number) => void;
  updatePiecePosition: (id: string, x: number, y: number) => void;
  updatePieceSetting: (id: string, settingId: string, value: any) => void;
  removePiece: (id: string) => void;
  setSelectedPiece: (id: string | null) => void;
  clearGrid: () => void;
  loadProject: (theme: string, pieces: PlacedPiece[]) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  theme: 'waste',
  pieces: [],
  selectedPieceId: null,
  locale: 'en',
  
  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale }),
  
  addPiece: (key, x, y) => set((state) => {
    const id = crypto.randomUUID();
    const newPiece: PlacedPiece = {
      id,
      key,
      x,
      y,
      settings: { ...DEFAULT_PIECE_SETTINGS[key] }
    };
    return { pieces: [...state.pieces, newPiece], selectedPieceId: id };
  }),
  
  updatePiecePosition: (id, x, y) => set((state) => ({
    pieces: state.pieces.map(p => p.id === id ? { ...p, x, y } : p)
  })),
  
  updatePieceSetting: (id, settingId, value) => set((state) => ({
    pieces: state.pieces.map(p => p.id === id ? {
      ...p,
      settings: { ...p.settings, [settingId]: value }
    } : p)
  })),
  
  removePiece: (id) => set((state) => ({
    pieces: state.pieces.filter(p => p.id !== id),
    selectedPieceId: state.selectedPieceId === id ? null : state.selectedPieceId
  })),
  
  setSelectedPiece: (id) => set({ selectedPieceId: id }),
  clearGrid: () => set({ pieces: [], selectedPieceId: null }),
  loadProject: (theme, pieces) => set({ theme, pieces, selectedPieceId: null })
}));
