import { useEffect, useRef } from 'react';
import { t } from '@/lib/i18n';
import { useStudioStore } from '@/lib/store';

export function Console({ events }: { events: any[] }) {
  const { locale } = useStudioStore();
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex-1 bg-[var(--locked)] rounded-md border border-[var(--ink)] flex flex-col overflow-hidden min-h-[200px]">
      <div className="px-3 py-1.5 border-b border-[var(--ink-soft)]/30 flex justify-between items-center bg-[#0d1a29]">
        <span className="text-xs font-mono font-medium text-[var(--ink-faint)]">
          {t('builder.eventConsole', locale)}
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-soft)]">
          {events.length} ev
        </span>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[11px] lg:text-xs text-[var(--paper)]/80 leading-relaxed"
      >
        {events.length === 0 ? (
          <div className="text-[var(--ink-soft)] italic h-full flex items-center justify-center">
            {t('builder.waiting', locale)}
          </div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="mb-1 hover:bg-[var(--surface)]/5 px-1 -mx-1 rounded break-all">
              <span className="text-[var(--ink-faint)] select-none inline-block w-14 rtl:w-auto rtl:ml-2">[{ev.t.toString().padStart(5, '0')}]</span>
              <span className="text-[var(--teal)] font-semibold mx-2">{ev.verb}</span>
              <span className="text-[var(--paper)]/60">{JSON.stringify(ev.fields)}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
