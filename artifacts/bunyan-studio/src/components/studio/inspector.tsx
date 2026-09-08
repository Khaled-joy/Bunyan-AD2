import React, { useState } from 'react';
import { useStudioStore } from '@/lib/store';
import { PIECES, PieceSetting, THEMES } from '@/lib/constants';
import { t } from '@/lib/i18n';

function SettingField({ 
  setting, 
  value, 
  onChange 
}: { 
  setting: PieceSetting; 
  value: any; 
  onChange: (val: any) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const locale = useStudioStore((state) => state.locale);
  const arabicLabels: Record<string, string> = {
    avatarArt: 'رسم الشخصية', moveSpeed: 'سرعة الحركة', sprite: 'الرسم',
    copies: 'عدد النسخ', trueCategory: 'الفئة الصحيحة', labelArEn: 'التسمية عربي/إنجليزي',
    acceptedCategory: 'الفئة المقبولة', questionText: 'نص السؤال', optionArt: 'رسم الخيار',
    timeAllowed: 'الوقت المتاح', overlayColor: 'لون الطبقة', zoneRole: 'دور المنطقة',
    warningArt: 'رسم التحذير', fixItWindow: 'مهلة التصحيح', ruleId: 'معرّف القاعدة',
    queueArt: 'رسم الطابور', othersWaiting: 'عدد المنتظرين', icon: 'الأيقونة',
    cooldown: 'فترة الانتظار', winAnim: 'حركة الفوز', targetScore: 'النتيجة المستهدفة',
  };
  const label = locale === 'ar' ? (arabicLabels[setting.id] ?? setting.label) : setting.label;

  if (setting.type === 'free') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={setting.placeholder}
          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ink-soft)] text-sm"
        />
      </div>
    );
  }

  if (setting.type === 'bounded') {
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (isNaN(val)) {
        onChange('');
        setError(null);
        return;
      }
      onChange(val);
      if (setting.min !== undefined && val < setting.min) {
        setError(`Min is ${setting.min}`);
      } else if (setting.max !== undefined && val > setting.max) {
        setError(`Max is ${setting.max}`);
      } else {
        setError(null);
      }
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value === undefined ? '' : value}
            onChange={handleNumberChange}
            min={setting.min}
            max={setting.max}
            className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-md focus:outline-none focus:ring-2 text-sm ${error ? 'border-[var(--warn)] focus:ring-[var(--warn)]' : 'border-[var(--line)] focus:ring-[var(--ink-soft)]'}`}
          />
          {setting.unit && <span className="text-[var(--ink-soft)] text-sm">{setting.unit}</span>}
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span className="text-[var(--ink-faint)]">{setting.min} - {setting.max} {setting.unit}</span>
          {error && <span className="text-[var(--warn)] font-medium">{error}</span>}
        </div>
      </div>
    );
  }

  if (setting.type === 'registry') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ink-soft)] text-sm"
        >
          <option value="" disabled>{locale === 'ar' ? `اختر ${label}` : `Select ${label.toLowerCase()}`}</option>
          {setting.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-[var(--ink-soft)] mt-1">{t('builder.registryNote', useStudioStore.getState().locale)}</p>
      </div>
    );
  }

  return null;
}

export function Inspector() {
  const { pieces, selectedPieceId, updatePieceSetting, locale, theme } = useStudioStore();
  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const piece = pieces.find(p => p.id === selectedPieceId);
  const def = piece ? PIECES.find(p => p.key === piece.key) : null;
  const label = def ? ((currentTheme.labels as any)[locale][def.key] || def.key) : '';

  if (!piece || !def) {
    return (
      <div className="min-h-32 w-full shrink-0 bg-[var(--surface)] border-t lg:min-h-0 lg:w-80 lg:border-t-0 lg:border-l rtl:lg:border-r rtl:lg:border-l-0 border-[var(--line)] flex flex-col items-center justify-center text-[var(--ink-faint)] p-6 text-center">
        {t('builder.inspector', locale)}: {t('builder.selectPiece', locale)}
      </div>
    );
  }

  const freeSettings = def.settings.filter(s => s.type === 'free');
  const boundedSettings = def.settings.filter(s => s.type === 'bounded');
  const registrySettings = def.settings.filter(s => s.type === 'registry');

  return (
    <div className="w-full shrink-0 bg-[var(--surface)] border-t lg:w-80 lg:border-t-0 lg:border-l rtl:lg:border-r rtl:lg:border-l-0 border-[var(--line)] flex flex-col z-10">
      <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)]">
        <h2 className="font-display font-semibold text-lg truncate">{label}</h2>
        <p className="text-xs text-[var(--ink-soft)] uppercase tracking-wider">{def.key}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {freeSettings.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">{t('builder.free', locale)}</h3>
            {freeSettings.map(s => (
              <SettingField
                key={s.id}
                setting={s}
                value={piece.settings[s.id]}
                onChange={(val) => updatePieceSetting(piece.id, s.id, val)}
              />
            ))}
          </section>
        )}

        {boundedSettings.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">{t('builder.bounded', locale)}</h3>
            {boundedSettings.map(s => (
              <SettingField
                key={s.id}
                setting={s}
                value={piece.settings[s.id]}
                onChange={(val) => updatePieceSetting(piece.id, s.id, val)}
              />
            ))}
          </section>
        )}

        {registrySettings.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">{t('builder.registry', locale)}</h3>
            {registrySettings.map(s => (
              <SettingField
                key={s.id}
                setting={s}
                value={piece.settings[s.id]}
                onChange={(val) => updatePieceSetting(piece.id, s.id, val)}
              />
            ))}
          </section>
        )}

        <section className="bg-[var(--locked)] text-white p-4 rounded-md shadow-inner mt-4">
          <h3 className="text-sm font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2">{t('builder.sealedHeading', locale)}</h3>
          <ul className="list-disc list-inside text-sm space-y-1 mb-3 text-[var(--paper)]">
            {def.alwaysEmits.map(e => (
              <li key={e} className="font-mono">{e}</li>
            ))}
          </ul>
          <p className="text-xs text-[var(--ink-faint)] leading-relaxed">
            {t('builder.sealed', locale)}
          </p>
        </section>
      </div>
    </div>
  );
}
