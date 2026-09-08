import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export function Console({ events }: { events: any[] }) {
  const locale = useStudioStore((state) => state.locale);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="min-h-64 flex-1 bg-[var(--locked)] flex flex-col overflow-hidden rounded-md shadow-inner lg:min-h-0">
      <div className="bg-black/20 p-2 border-b border-white/10 shrink-0">
        <span className="text-xs font-mono text-[var(--ink-faint)] uppercase tracking-wider">{t('builder.eventConsole', locale)}</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {events.length === 0 ? (
          <div className="text-[var(--ink-faint)] italic">{t('builder.waiting', locale)}</div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="mb-1 text-[var(--paper)] hover:bg-white/5 px-1 -mx-1 rounded">
              <span className="text-[var(--ink-faint)] w-16 inline-block shrink-0">
                {String(ev.t).padStart(5, '0')}
              </span>
              <span className="text-[var(--block-teal)] mr-2 shrink-0">{ev.type}</span>
              <span className="text-[var(--ink-soft)] truncate">
                {JSON.stringify(ev.payload).replace(/"([^"]+)":/g, '$1:')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
