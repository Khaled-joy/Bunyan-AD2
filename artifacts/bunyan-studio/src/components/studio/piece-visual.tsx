import React from 'react';
import {
  BookOpen, Sun, Building2, Home, Store, Dribbble,
  User, Users, UserPlus, Users2,
  Box, Inbox, Hammer, Signpost,
  Split, ShieldAlert, Lightbulb, Flag,
  AlertCircle
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { useStudioStore } from '@/lib/store';

export const VISUAL_CONFIGS: Record<string, any> = {
  map_classroom: { baseScale: 400, type: 'map', icon: BookOpen },
  map_schoolyard: { baseScale: 400, type: 'map', icon: Sun },
  map_city: { baseScale: 400, type: 'map', icon: Building2 },
  map_home: { baseScale: 400, type: 'map', icon: Home },
  map_market: { baseScale: 400, type: 'map', icon: Store },
  map_sports: { baseScale: 400, type: 'map', icon: Dribbble },
  
  char_player: { baseScale: 64, type: 'character', icon: null },
  char_adult: { baseScale: 80, type: 'character', icon: User },
  char_friend: { baseScale: 64, type: 'character', icon: UserPlus },
  char_crowd: { baseScale: 80, type: 'character_crowd', icon: Users2 },
  
  obj_carryable: { baseScale: 56, type: 'object', icon: Box, shape: 'crate' },
  obj_container: { baseScale: 72, type: 'object', icon: Inbox, shape: 'open-box' },
  obj_tool: { baseScale: 56, type: 'object', icon: Hammer, shape: 'cylinder' },
  obj_sign: { baseScale: 64, type: 'object', icon: Signpost, shape: 'signpost' },
  
  act_choice: { baseScale: 64, type: 'action', icon: Split, shape: 'diamond' },
  act_rule: { baseScale: 64, type: 'action', icon: ShieldAlert, shape: 'hexagon' },
  act_queue: { baseScale: 64, type: 'action', icon: Users, shape: 'circle' },
  act_hint: { baseScale: 64, type: 'action', icon: Lightbulb, shape: 'circle' },
  act_goal: { baseScale: 80, type: 'action', icon: Flag, shape: 'star' },
};

export function PieceVisual({
  paletteId,
  colorValue,
  sizePercent = 100,
  label,
  missingAssignment = false,
  selected = false,
  view = 'grid'
}: {
  paletteId: string;
  colorValue: string;
  sizePercent?: number;
  label?: string;
  missingAssignment?: boolean;
  selected?: boolean;
  view?: 'grid' | 'palette' | 'drag';
}) {
  const { locale } = useStudioStore();
  const config = VISUAL_CONFIGS[paletteId] || { baseScale: 64, type: 'object', icon: Box, shape: 'crate' };
  
  const sizePx = (config.baseScale * sizePercent) / 100;
  const isThumb = view === 'palette';
  
  const Icon = config.icon;
  
  let inner = null;
  
  if (config.type === 'map') {
    inner = (
      <div 
        className="relative rounded-3xl border-4 border-black/10 flex flex-col items-center justify-center transition-all"
        style={{ width: sizePx, height: sizePx, backgroundColor: colorValue, boxShadow: '0 24px 0 0 rgba(0,0,0,0.15), inset 0 4px 20px rgba(255,255,255,0.2)' }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px]" />
        {Icon && <Icon className="w-1/4 h-1/4 text-white/90 drop-shadow-sm" strokeWidth={2.5} />}
        {label && !isThumb && <span className="absolute bottom-6 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm font-bold truncate max-w-[80%] backdrop-blur-md shadow-lg">{label}</span>}
      </div>
    );
  } else if (config.type === 'character' || config.type === 'character_crowd') {
    const isCrowd = config.type === 'character_crowd';
    const Figure = ({ offset = '0, 0', z = 10, scale = 1 }: any) => (
      <div className="absolute inset-0 flex flex-col items-center justify-end" style={{ transform: `translate(${offset}) scale(${scale})`, zIndex: z }}>
        <div className="w-[45%] h-[40%] rounded-xl bg-[#FFD8B4] mb-[-2%] border-2 border-black/10 shadow-sm relative z-20" />
        <div className="w-[85%] h-[50%] rounded-xl border-2 border-black/10 shadow-sm flex items-center justify-center text-white pb-2 relative z-10" style={{ backgroundColor: colorValue, boxShadow: 'inset 0 -8px 0 0 rgba(0,0,0,0.15)' }}>
          {Icon && !isCrowd && <Icon className="w-1/2 h-1/2 opacity-75" strokeWidth={2.5} />}
        </div>
      </div>
    );
    
    inner = (
      <div className="relative" style={{ width: sizePx * 0.8, height: sizePx }}>
        <div className="absolute -bottom-[5%] left-[10%] right-[10%] h-[15%] bg-black/20 rounded-full blur-[3px]" />
        {isCrowd ? (
          <>
            <Figure offset="-25%, -10%" z={5} scale={0.85} />
            <Figure offset="25%, -15%" z={4} scale={0.85} />
            <Figure offset="0, 0" z={10} />
          </>
        ) : <Figure />}
        {label && !isThumb && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md z-30">{label}</span>}
      </div>
    );
  } else if (config.type === 'object') {
    const isBox = config.shape === 'open-box';
    const isSign = config.shape === 'signpost';
    
    inner = (
      <div className="relative flex flex-col items-center justify-end" style={{ width: sizePx, height: sizePx }}>
        <div className="absolute -bottom-[5%] left-[15%] right-[15%] h-[15%] bg-black/20 rounded-full blur-[3px]" />
        
        {isSign ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <div className="w-[70%] h-[55%] rounded-lg border-2 border-black/10 flex items-center justify-center mt-[5%] z-10" style={{ backgroundColor: colorValue, boxShadow: 'inset 0 -6px 0 0 rgba(0,0,0,0.2)' }}>
              {Icon && <Icon className="w-1/2 h-1/2 text-white/90" strokeWidth={2.5} />}
            </div>
            <div className="w-[12%] flex-1 bg-[#8B5A2B] border border-black/20 -mt-2 rounded-sm" />
          </div>
        ) : (
          <div className="w-[90%] h-[90%] rounded-xl border-2 border-black/10 flex items-center justify-center relative z-10" style={{ backgroundColor: colorValue, boxShadow: isBox ? 'inset 0 16px 0 0 rgba(0,0,0,0.2)' : 'inset 0 -12px 0 0 rgba(0,0,0,0.2)' }}>
            {config.shape === 'crate' && <div className="absolute inset-3 border-2 border-black/10 rounded-md" />}
            {Icon && <Icon className={`w-1/2 h-1/2 text-white ${isBox ? 'opacity-90 mt-3' : 'opacity-80'}`} strokeWidth={2.5} />}
          </div>
        )}
        {label && !isThumb && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap z-30 shadow-md">{label}</span>}
      </div>
    );
  } else if (config.type === 'action') {
    const borderRadius = config.shape === 'circle' ? '50%' : config.shape === 'diamond' ? '25%' : config.shape === 'hexagon' ? '30%' : '30%';
    const transform = config.shape === 'diamond' ? 'rotate(45deg)' : 'none';
    const iconTransform = config.shape === 'diamond' ? 'rotate(-45deg)' : 'none';
    
    inner = (
      <div className="relative flex flex-col items-center justify-end" style={{ width: sizePx, height: sizePx }}>
        <div className="absolute -bottom-[5%] left-[20%] right-[20%] h-[15%] bg-black/20 rounded-full blur-[4px]" />
        
        <div className={`w-[85%] h-[85%] relative z-10 mb-[10%] drop-shadow-xl ${isThumb ? '' : 'animate-[float_3s_ease-in-out_infinite]'}`}>
          <div className="absolute inset-0 border-2 border-white/50 flex items-center justify-center" style={{ backgroundColor: colorValue, borderRadius, transform, boxShadow: 'inset 0 -8px 0 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3)' }}>
            {Icon && <Icon className="w-1/2 h-1/2 text-white drop-shadow-md" strokeWidth={3} style={{ transform: iconTransform }} />}
          </div>
        </div>
        {label && !isThumb && <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap z-30 shadow-md">{label}</span>}
      </div>
    );
  }

  if (isThumb) {
    const scale = Math.min(32 / sizePx, 1);
    return (
      <div className="flex items-center justify-center shrink-0 w-10 h-10">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative transition-all duration-200 ${selected ? 'scale-105' : ''}`}>
      {selected && (
        <div className="absolute -inset-4 border-[6px] border-[var(--ink)] rounded-2xl z-0 pointer-events-none animate-in zoom-in-95 duration-200" />
      )}
      <div className="relative z-10">
        {inner}
      </div>
      {missingAssignment && !isThumb && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--warn)] rounded-full flex items-center justify-center text-white border-[3px] border-white z-40 shadow-lg" title={t('builder.unassignedBadge', locale)}>
          <AlertCircle className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
