import React, { useState, useEffect } from 'react';
import { StudioShell } from '@/components/studio/shell';
import { t } from '@/lib/i18n';
import { useStudioStore } from '@/lib/store';
import { THEMES } from '@/lib/constants';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, LayoutGrid, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const { locale } = useStudioStore();
  const [activeTheme, setActiveTheme] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveTheme((prev) => (prev + 1) % THEMES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentTheme = THEMES[activeTheme];
  const themeLabels = currentTheme.labels as any;

  return (
    <StudioShell>
      <div className="flex-1 overflow-y-auto bg-[var(--paper)]">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[var(--ink)] mb-4">
            {t('landing.hero', locale)}
          </h1>
          <p className="text-xl text-[var(--ink-soft)] max-w-2xl mx-auto mb-10">
            {t('landing.explanation', locale)}
          </p>
          <Link href="/builder">
            <Button size="lg" className="text-lg px-8 bg-[var(--block-blue)] hover:bg-[var(--block-blue)]/90 text-white rounded-full">
              {t('landing.start', locale)}
            </Button>
          </Link>
          
          {/* Live Tile */}
          <div className="mt-16 max-w-lg mx-auto bg-[var(--surface)] p-6 rounded-xl border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--line-soft)] pb-4">
              <span className="text-[var(--ink-soft)] font-medium">Theme: {currentTheme.name}</span>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded bg-[var(--block-teal)] text-white text-sm">
                  {themeLabels[locale]['agent'] || 'Agent'}
                </div>
                <div className="px-3 py-1 rounded bg-[var(--block-amber)] text-white text-sm">
                  {themeLabels[locale]['bin'] || 'Bin'}
                </div>
              </div>
            </div>
            <div className="bg-[var(--locked)] p-3 rounded text-left">
              <div className="font-mono text-xs text-[var(--block-teal)]">object.place</div>
              <div className="font-mono text-xs text-[var(--paper)] mt-1">
                {`{ bin_id: "${currentTheme.binId}", object_id: "obj_1", correct: true }`}
              </div>
            </div>
          </div>
        </section>

        {/* Five Layer Stack */}
        <section className="bg-[var(--surface)] py-20 border-y border-[var(--line)]">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-[var(--ink)] text-center mb-12">
              {t('landing.layerTitle', locale)}
            </h2>
            <div className="max-w-md mx-auto space-y-2">
              <div className="p-4 rounded-md border-2 border-[var(--block-blue)] bg-[var(--block-blue)]/10 text-[var(--block-blue)] font-medium text-center">
                {t('landing.layers.theme', locale)}
              </div>
              <div className="p-4 rounded-md border-2 border-[var(--block-teal)] bg-[var(--block-teal)]/10 text-[var(--block-teal)] font-medium text-center">
                {t('landing.layers.assets', locale)}
              </div>
              <div className="p-4 rounded-md border-2 border-[var(--block-amber)] bg-[var(--block-amber)]/10 text-[var(--block-amber)] font-medium text-center">
                {t('landing.layers.text', locale)}
              </div>
              <div className="p-4 rounded-md bg-[var(--locked)] text-[var(--paper)] font-medium text-center shadow-inner">
                {t('landing.layers.events', locale)}
              </div>
              <div className="p-4 rounded-md bg-[var(--locked)] text-[var(--paper)] font-medium text-center shadow-inner">
                {t('landing.layers.fields', locale)}
              </div>
            </div>
          </div>
        </section>

        {/* Mapping Table & Sequence */}
        <section className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--ink)] mb-6">
              Behaviours to Pieces
            </h2>
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[var(--paper)] border-b border-[var(--line)]">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-[var(--ink-soft)]">Behaviour</th>
                    <th className="p-3 text-sm font-semibold text-[var(--ink-soft)]">Piece required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line-soft)]">
                  <tr><td className="p-3">Responsibility</td><td className="p-3 font-medium text-[var(--block-amber)]">Bin</td></tr>
                  <tr><td className="p-3">Respect</td><td className="p-3 font-medium text-[var(--block-amber)]">Queue</td></tr>
                  <tr><td className="p-3">Participation</td><td className="p-3 font-medium text-[var(--block-teal)]">Zone</td></tr>
                  <tr><td className="p-3">Courage</td><td className="p-3 font-medium text-[var(--block-violet)]">Choice</td></tr>
                  <tr><td className="p-3">Problem solving</td><td className="p-3 font-medium text-[var(--block-violet)]">Hint</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-[var(--ink)] mb-6">
              How a game gets made
            </h2>
            <div className="space-y-4">
              {[
                "1. Choose a theme",
                "2. Drag pieces onto the grid",
                "3. Configure free and bounded settings",
                "4. Map to registry IDs where needed",
                "5. Run the simulator to check indicator coverage",
                "6. Export the JSON and manifest"
              ].map((step, i) => (
                <div key={i} className="flex gap-3 text-[var(--ink)]">
                  <CheckCircle className="w-6 h-6 text-[var(--ok)] shrink-0" />
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </StudioShell>
  );
}
