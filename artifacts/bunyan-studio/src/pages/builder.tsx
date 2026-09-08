import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';

import { StudioShell } from '@/components/studio/shell';
import { Palette } from '@/components/studio/palette';
import { Grid } from '@/components/studio/grid';
import { Inspector } from '@/components/studio/inspector';
import { Console } from '@/components/studio/console';
import { Indicators } from '@/components/studio/indicators';
import { Button } from '@/components/ui/button';
import { Trash2, Download, PlayCircle, Save, FileJson, PanelTopClose, PanelTopOpen } from 'lucide-react';
import { toast } from 'sonner';

import { useStudioStore, PlacedPiece } from '@/lib/store';
import { t } from '@/lib/i18n';
import { generateSessionEvents } from '@/lib/simulator';
import { initialScore, updateScores, ScoreState } from '@/lib/scoring';
import { BEHAVIOURS, SEALED_TYPES, EVENT_CONTRACTS, PRODUCTION_NEEDS, DOMAINS, NEW_DOMAINS } from '@/lib/constants';
import {
  getGetStudioProjectQueryKey,
  useGetStudioProject,
  useUpdateStudioProject,
  getListStudioProjectsQueryKey,
} from '@workspace/api-client-react';

export default function BuilderPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const id = params.id;
  
  if (!id) {
    navigate('/');
    return null;
  }

  const { pieces, locale, addPiece, clearGrid, loadProject, updatePiece } = useStudioStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [score, setScore] = useState<ScoreState>(initialScore);
  const [showBrief, setShowBrief] = useState(false);
  const queryClient = useQueryClient();
  
  const simulationRef = useRef<number | null>(null);

  const { data: project, isLoading } = useGetStudioProject(id, {
    query: {
      enabled: Boolean(id),
      queryKey: getGetStudioProjectQueryKey(id),
    },
  });

  const updateProject = useUpdateStudioProject();

  const initRef = useRef(false);
  useEffect(() => {
    if (project && !initRef.current) {
      const savedPieces = Array.isArray(project.config?.pieces) ? project.config.pieces : [];
      
      // Normalize legacy pieces
      const normalized = savedPieces.map((p: any) => ({
        ...p,
        size: p.size ?? 100,
        color: p.color ?? 'blue',
        settings: p.settings ?? {},
        assignedBehaviours: p.assignedBehaviours ?? [],
        reviewerWhy: p.reviewerWhy ?? ''
      }));
      
      loadProject(normalized as PlacedPiece[]);
      initRef.current = true;
    }
  }, [project, loadProject]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event;
    if (!over) return;
    
    if (active.data.current?.type === 'palette') {
      const item = active.data.current.item;
      const x = Math.round((event.active.rect.current.translated?.left || 0) / 26) * 26;
      const y = Math.round((event.active.rect.current.translated?.top || 0) / 26) * 26;
      
      const adjustedX = Math.max(0, x - 256);
      
      addPiece(item.id, item.sealedType, adjustedX, Math.max(0, y), locale === 'ar' ? item.nameAr : item.name);
    } else if (active.data.current?.type === 'piece') {
      const pid = active.data.current.id;
      const piece = pieces.find(p => p.id === pid);
      if (piece) {
        const x = Math.max(0, Math.round((piece.x + delta.x) / 26) * 26);
        const y = Math.max(0, Math.round((piece.y + delta.y) / 26) * 26);
        updatePiece(pid, { x, y });
      }
    }
  };

  const checkReadiness = () => {
    if (!project) return { status: 'warn', msg: 'Loading...' };
    
    const hasMap = pieces.some(p => SEALED_TYPES[p.sealedType]?.type === 'map');
    const hasPlayer = pieces.some(p => SEALED_TYPES[p.sealedType]?.type === 'player');
    const hasGoal = pieces.some(p => SEALED_TYPES[p.sealedType]?.type === 'goal');
    
    if (!hasMap || !hasPlayer || !hasGoal) {
      let missingName = 'map';
      if (!hasMap) missingName = t('home.pieces.map', locale);
      else if (!hasPlayer) missingName = locale === 'ar' ? 'طفل لاعب' : 'player child';
      else if (!hasGoal) missingName = locale === 'ar' ? 'هدف' : 'goal';
      
      return { status: 'error', msg: t('builder.readiness.missingSpecific', locale, { missing: missingName }), ready: false };
    }
    
    const unassignedCount = pieces.filter(p => SEALED_TYPES[p.sealedType]?.needsAssignment && p.assignedBehaviours.length === 0).length;
    if (unassignedCount > 0) {
      return { status: 'warn', msg: t('builder.readiness.unassigned', locale, { count: unassignedCount }), ready: true };
    }
    
    const briefBehaviors = project.behaviours || [];
    for (const b of briefBehaviors) {
      if (!pieces.some(p => p.assignedBehaviours?.includes(b))) {
        const label = BEHAVIOURS.find(def => def.id === b)?.[locale === 'ar' ? 'labelAr' : 'label'] || b;
        return { status: 'warn', msg: t('builder.readiness.uncovered', locale, { behaviour: label }), ready: true };
      }
    }
    
    const uniqueEvents = new Set();
    pieces.forEach(p => {
      SEALED_TYPES[p.sealedType]?.alwaysRecords.forEach(e => uniqueEvents.add(e));
    });
    
    return { 
      status: 'ok', 
      msg: t('builder.readiness.ready', locale, { pieces: pieces.length, events: uniqueEvents.size }), 
      ready: true 
    };
  };

  const readiness = checkReadiness();

  const handleRun = () => {
    if (!readiness.ready || !project) return;
    
    setIsSimulating(true);
    setEvents([]);
    setScore(initialScore); 
    
    const generated = generateSessionEvents(pieces, project.ageGroup, project.id);
    let index = 0;
    let currentScore = { ...initialScore };
    
    const stream = () => {
      if (index < generated.length) {
        setEvents(prev => {
          const next = [...prev, generated[index]];
          currentScore = updateScores([generated[index]], currentScore);
          setScore(currentScore);
          return next;
        });
        index++;
        simulationRef.current = window.setTimeout(stream, 52);
      } else {
        setIsSimulating(false);
      }
    };
    
    stream();
  };

  useEffect(() => {
    return () => {
      if (simulationRef.current) clearTimeout(simulationRef.current);
    };
  }, []);

  const handleSave = () => {
    if (!project) return;
    const mutateFn = updateProject.mutate;
    mutateFn({
      id: project.id,
      data: {
        name: project.name,
        domain: project.domain,
        ageGroup: project.ageGroup as any,
        language: project.language as any,
        behaviours: project.behaviours as any,
        status: project.status as any,
        config: {
          ...((project.config as any) || {}),
          pieces
        }
      }
    }, {
      onSuccess: () => {
        toast.success(t('nav.gameSaved', locale));
        queryClient.invalidateQueries({ queryKey: getListStudioProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStudioProjectQueryKey(project.id) });
        lastSavedPieces.current = pieces; // Update ref only on success
      },
      onError: () => {
        toast.error(t('nav.gameSaveFailed', locale));
      }
    });
  };

  // Autosave
  const lastSavedPieces = useRef<PlacedPiece[]>([]);
  useEffect(() => {
    if (!initRef.current || !project || updateProject.isPending) return;
    if (JSON.stringify(pieces) === JSON.stringify(lastSavedPieces.current)) return;
    
    const handler = setTimeout(() => {
      handleSave();
    }, 1500);

    return () => clearTimeout(handler);
  }, [pieces, project, updateProject.isPending]);


  const downloadJson = (filename: string, value: unknown) => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    downloadJson(`bunyan-project-${project?.id}.json`, {
      schemaVersion: 1,
      project,
      locale,
    });
  };

  const handleManifestExport = () => {
    const uniqueEvents = new Set<string>();
    pieces.forEach(p => {
      SEALED_TYPES[p.sealedType]?.alwaysRecords.forEach(e => uniqueEvents.add(e));
    });

    const mappedPieces = pieces.filter(p => p.assignedBehaviours.length > 0).map(p => ({
      name: p.editableLabel,
      type: p.sealedType,
      behaviours: p.assignedBehaviours
    }));

    downloadJson(`bunyan-manifest-${project?.id}.json`, {
      sealed: true,
      scoringVersion: '1.0',
      events: Array.from(uniqueEvents),
      assignments: mappedPieces
    });
  };

  if (isLoading) return <StudioShell><div className="p-8 font-sans">Loading...</div></StudioShell>;
  if (!project) return <StudioShell><div className="p-8 font-sans">Project not found</div></StudioShell>;

  const config = (project.config || {}) as any;
  const domain = NEW_DOMAINS.find(item => item.id === project.domain) || DOMAINS.find(item => item.id === project.domain);
  const domainLabel = domain ? (locale === 'ar' ? domain.labelAr : domain.label) : project.domain;
  const languageLabel = t(`home.form.langOptions.${project.language}`, locale);

  return (
    <StudioShell>
      <div className="flex min-h-full flex-col overflow-visible lg:h-full lg:overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[var(--surface)] border-b border-[var(--line)] flex flex-wrap items-center justify-between px-4 py-2 shrink-0 shadow-sm z-20 relative">
          <div>
            <h1 className="font-display font-bold text-[var(--ink)] text-xl">{project.name}</h1>
            <div className="text-xs text-[var(--ink-soft)] font-medium">
              {domainLabel} • {t('builder.ages', locale)} {project.ageGroup} • {languageLabel} • {t('builder.buildShort', locale)} {config.buildWeeks}{t('builder.weeksShort', locale)}, {t('builder.artShort', locale)} {config.artWeeks}{t('builder.weeksShort', locale)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} aria-label={t('nav.exportJson', locale)}>
              <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="hidden sm:inline">{t('nav.exportJson', locale)}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleManifestExport} aria-label={t('nav.exportManifest', locale)}>
              <FileJson className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="hidden sm:inline">{t('nav.exportManifest', locale)}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBrief(!showBrief)}>
              {showBrief ? <PanelTopClose className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> : <PanelTopOpen className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />}
              {showBrief ? t('nav.hideBrief', locale) : t('nav.showBrief', locale)}
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-[var(--blue)] hover:bg-[var(--blue)]/90 text-white" disabled={updateProject.isPending}>
              <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {updateProject.isPending ? t('nav.saving', locale) : t('nav.save', locale)}
            </Button>
          </div>
        </div>

        {/* Toggleable Brief Panel */}
        {showBrief && (
          <div className="bg-[var(--paper)] border-b border-[var(--line)] p-4 shrink-0 shadow-inner max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm relative z-10">
            <div>
              <h3 className="font-bold text-[var(--ink)] mb-1">{t('builder.description', locale)}</h3>
              <p className="text-[var(--ink-soft)]">{config.description}</p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--ink)] mb-1">{t('builder.behavioursReq', locale)}</h3>
              <ul className="list-disc ltr:pl-4 rtl:pr-4 text-[var(--ink-soft)]">
                {project.behaviours.map((b: string) => (
                  <li key={b}>{BEHAVIOURS.find(def => def.id === b)?.[locale === 'ar' ? 'labelAr' : 'label'] || b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[var(--ink)] mb-1">{t('builder.productionReq', locale)}</h3>
              <ul className="list-disc ltr:pl-4 rtl:pr-4 text-[var(--ink-soft)]">
                {(config.productionNeeds || []).map((n: string) => (
                  <li key={n}>{PRODUCTION_NEEDS.find(def => def.id === n)?.[locale === 'ar' ? 'labelAr' : 'label'] || n}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Readiness Bar */}
        <div className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-[var(--line)] ${
          readiness.status === 'error' ? 'bg-[var(--warn)]/10 text-[var(--warn)]' :
          readiness.status === 'warn' ? 'bg-[var(--amber)]/10 text-[var(--amber)]' :
          'bg-[var(--ok)]/10 text-[var(--ok)]'
        }`}>
          <span>{readiness.msg}</span>
          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="sm" onClick={clearGrid} className="h-7 text-xs">
              <Trash2 className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
              {t('nav.clear', locale)}
            </Button>
            <Button 
              size="sm" 
              className="h-7 text-xs bg-[var(--ink)] hover:bg-[var(--ink)]/90 text-white transition-transform active:scale-95" 
              disabled={!readiness.ready || isSimulating}
              onClick={handleRun}
            >
              <PlayCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
              {t('nav.run', locale)}
            </Button>
          </div>
        </div>

        {/* Workspace */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex min-h-0 flex-1 flex-col overflow-visible lg:flex-row lg:overflow-hidden">
            <Palette />
            <Grid />
            <Inspector />
          </div>
        </DndContext>
        
        {/* Output */}
        <div className="min-h-[220px] border-t border-[var(--line)] bg-[var(--paper)] flex flex-col shrink-0 p-4 gap-4 z-20 relative shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:h-[260px] lg:flex-row">
          <Console events={events} />
          <Indicators score={score} />
        </div>

      </div>
    </StudioShell>
  );
}
