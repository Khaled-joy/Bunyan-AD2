import { useState, useEffect } from 'react';
import { useStudioStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { PALETTE, SWATCHES, SEALED_TYPES, BEHAVIOURS } from '@/lib/constants';
import { useParams } from 'wouter';
import { getGetStudioProjectQueryKey, useGetStudioProject } from '@workspace/api-client-react';

export function Inspector() {
  const { pieces, selectedPieceId, updatePiece, locale } = useStudioStore();
  const piece = pieces.find(p => p.id === selectedPieceId);
  const def = piece ? PALETTE.find(p => p.id === piece.paletteId) : null;
  const sealed = piece ? SEALED_TYPES[piece.sealedType] : null;

  const params = useParams();
  const { data: project } = useGetStudioProject(params.id ?? '', {
    query: { enabled: Boolean(params.id), queryKey: params.id ? getGetStudioProjectQueryKey(params.id) : [] }
  });

  const [draftSettings, setDraftSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (piece) setDraftSettings({});
  }, [piece?.id]);

  if (!piece || !def || !sealed) {
    return (
      <div className="min-h-[260px] w-full lg:min-h-0 lg:w-80 bg-[var(--surface)] border-t lg:border-t-0 lg:border-l rtl:lg:border-l-0 rtl:lg:border-r border-[var(--line)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--line)] bg-[var(--paper)]">
          <h2 className="font-display font-bold text-[var(--ink)]">{t('builder.inspector', locale)}</h2>
        </div>
        <div className="p-8 text-center text-[var(--ink-faint)] text-sm">
          {t('builder.selectPiece', locale)}
        </div>
      </div>
    );
  }

  const projectBriefBehaviours: string[] = project?.behaviours || [];

  const handleSettingChange = (id: string, value: string | number) => {
    updatePiece(piece.id, { settings: { ...piece.settings, [id]: value } });
  };

  const handleDraftChange = (id: string, value: string) => {
    setDraftSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleBehaviourToggle = (bId: string) => {
    const current = piece.assignedBehaviours || [];
    const next = current.includes(bId) 
      ? current.filter(id => id !== bId)
      : [...current, bId];
    updatePiece(piece.id, { assignedBehaviours: next });
  };

  return (
    <div className="min-h-[420px] w-full lg:min-h-0 lg:w-80 bg-[var(--surface)] border-t lg:border-t-0 lg:border-l rtl:lg:border-l-0 rtl:lg:border-r border-[var(--line)] flex flex-col shrink-0">
      <div className="p-3 border-b border-[var(--line)] bg-[var(--paper)] flex items-center justify-between">
        <h2 className="font-display font-bold text-[var(--ink)]">{t('builder.inspector', locale)}</h2>
        <span className="text-xs font-mono px-2 py-0.5 bg-[var(--locked)] text-[var(--paper)] rounded">
          {sealed.type}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* 1. How it looks */}
        <section>
          <h3 className="font-bold text-[var(--ink)] mb-3">{t('builder.howItLooks', locale)}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">{t('builder.inspectorLabels.name', locale)}</label>
              <input 
                type="text" 
                value={piece.editableLabel} 
                onChange={e => updatePiece(piece.id, { editableLabel: e.target.value })}
                className="w-full text-sm rounded border border-[var(--line)] px-2 py-1.5 focus:border-[var(--ink)] outline-none bg-[var(--surface)]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                {t('builder.inspectorLabels.size', locale)} ({piece.size}%)
              </label>
              <input 
                type="range" 
                min="70" 
                max="170" 
                value={piece.size}
                onChange={e => updatePiece(piece.id, { size: parseInt(e.target.value) })}
                className="w-full accent-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">{t('builder.inspectorLabels.colour', locale)}</label>
              <div className="flex gap-2">
                {SWATCHES.map(swatch => (
                  <button
                    key={swatch.id}
                    onClick={() => updatePiece(piece.id, { color: swatch.id })}
                    className={`w-6 h-6 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--ink)] ${piece.color === swatch.id ? 'border-[var(--ink)]' : 'border-transparent'}`}
                    style={{ backgroundColor: swatch.value }}
                    aria-label={locale === 'ar' ? swatch.labelAr : swatch.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Its numbers */}
        {(sealed.bounded || sealed.registry) && (
          <section>
            <h3 className="font-bold text-[var(--ink)] mb-3">{t('builder.itsNumbers', locale)}</h3>
            <div className="space-y-4">
              {sealed.bounded && (
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                    {locale === 'ar' ? sealed.bounded.labelAr : sealed.bounded.label}
                  </label>
                  <input
                    type="number"
                    value={draftSettings[sealed.bounded.id] ?? piece.settings[sealed.bounded.id] ?? sealed.bounded.min}
                    onChange={e => handleDraftChange(sealed.bounded!.id, e.target.value)}
                    onBlur={() => {
                      const str = draftSettings[sealed.bounded!.id];
                      if (str !== undefined) {
                        let val = parseInt(str);
                        if (isNaN(val) || val < sealed.bounded!.min) val = sealed.bounded!.min;
                        if (val > sealed.bounded!.max) val = sealed.bounded!.max;
                        handleSettingChange(sealed.bounded!.id, val);
                        setDraftSettings(prev => { const n = {...prev}; delete n[sealed.bounded!.id]; return n; });
                      }
                    }}
                    className="w-full text-sm rounded border border-[var(--line)] px-2 py-1.5 bg-[var(--surface)]"
                  />
                  <p className="text-[10px] text-[var(--ink-faint)] mt-1">
                    {t('builder.rangeWarn', locale, { min: sealed.bounded.min, max: sealed.bounded.max })}
                  </p>
                </div>
              )}
              {sealed.registry && (
                <div>
                  <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                    {locale === 'ar' ? sealed.registry.labelAr : sealed.registry.label}
                  </label>
                  <select
                    value={piece.settings[sealed.registry.id] ?? ''}
                    onChange={e => handleSettingChange(sealed.registry!.id, e.target.value)}
                    className="w-full text-sm rounded border border-[var(--line)] px-2 py-1.5 bg-[var(--surface)]"
                  >
                    <option value="" disabled>{t('builder.selectOption', locale)}</option>
                    {sealed.registry.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{locale === 'ar' ? opt.labelAr : opt.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[var(--ink-faint)] mt-1">{t('builder.registryNote', locale)}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. What this must tell you */}
        <section>
          <h3 className="font-bold text-[var(--ink)] mb-3">{t('builder.whatMustTell', locale)}</h3>
          {sealed.needsAssignment ? (
            <div className="space-y-2">
              {BEHAVIOURS.map(b => {
                const inBrief = projectBriefBehaviours.includes(b.id);
                return (
                  <label key={b.id} className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={piece.assignedBehaviours?.includes(b.id) || false}
                      onChange={() => handleBehaviourToggle(b.id)}
                      className="rounded text-[var(--blue)] focus:ring-[var(--blue)]"
                    />
                    <span className="flex-1">{locale === 'ar' ? b.labelAr : b.label}</span>
                    {inBrief && (
                      <span className="text-[10px] bg-[var(--ink)]/10 text-[var(--ink-soft)] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                        {t('builder.inBrief', locale)}
                      </span>
                    )}
                  </label>
                );
              })}
              
              <div className="pt-2">
                <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
                  {t('builder.whyThisShows', locale)}
                </label>
                <input
                  type="text"
                  value={piece.reviewerWhy || ''}
                  onChange={e => updatePiece(piece.id, { reviewerWhy: e.target.value })}
                  className="w-full text-sm rounded border border-[var(--line)] px-2 py-1.5 bg-[var(--surface)]"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">{t('builder.decorationNote', locale)}</p>
          )}
        </section>

        {/* 4. Sealed */}
        <section className="bg-[var(--locked)] p-4 rounded-lg text-[var(--paper)]">
          <h3 className="font-bold mb-2 text-[var(--paper)]">{t('builder.sealedSection', locale)}</h3>
          <p className="text-xs text-[var(--ink-faint)] mb-3">{t('builder.notEditable', locale)}</p>
          <div className="space-y-1">
            {sealed.alwaysRecords.map(verb => (
              <div key={verb} className="font-mono text-xs text-[var(--teal)] rtl:text-right before:content-['>_'] before:mr-2 rtl:before:ml-2 rtl:before:mr-0 flex items-center">
                <span className="ltr:block rtl:hidden">&gt;_</span> {verb} <span className="ltr:hidden rtl:block">&lt;_</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
