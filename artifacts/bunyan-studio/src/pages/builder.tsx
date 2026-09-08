import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { StudioShell } from '@/components/studio/shell';
import { Palette } from '@/components/studio/palette';
import { Grid } from '@/components/studio/grid';
import { Inspector } from '@/components/studio/inspector';
import { Console } from '@/components/studio/console';
import { Indicators } from '@/components/studio/indicators';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useStudioStore, PlacedPiece } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Trash2, Download, PlayCircle, Save, FileJson } from 'lucide-react';
import { generateSessionEvents } from '@/lib/simulator';
import { initialScore, updateScores, ScoreState } from '@/lib/scoring';
import { PIECES, THEMES } from '@/lib/constants';
import {
  getListStudioProjectsQueryKey,
  getGetStudioProjectQueryKey,
  useCreateStudioProject,
  useDeleteStudioProject,
  useGetStudioProject,
  useListStudioProjects,
  useUpdateStudioProject,
} from '@workspace/api-client-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { theme, pieces, locale, addPiece, updatePiecePosition, clearGrid, loadProject } = useStudioStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [score, setScore] = useState<ScoreState>(initialScore);
  const [projectId, setProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const simulationRef = useRef<number | null>(null);

  const { data: projects } = useListStudioProjects();
  const { data: loadedProject } = useGetStudioProject(projectId ?? '', {
    query: {
      enabled: Boolean(projectId),
      queryKey: getGetStudioProjectQueryKey(projectId ?? ''),
    },
  });
  const createProject = useCreateStudioProject();
  const updateProject = useUpdateStudioProject();
  const deleteProject = useDeleteStudioProject();

  useEffect(() => {
    if (!loadedProject) return;
    const savedPieces = Array.isArray(loadedProject.config.pieces)
      ? loadedProject.config.pieces as PlacedPiece[]
      : [];
    loadProject(loadedProject.theme, savedPieces);
  }, [loadedProject, loadProject]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event;
    if (!over) return;
    
    if (active.data.current?.type === 'palette') {
      const key = active.data.current.key;
      const x = Math.round((event.active.rect.current.translated?.left || 0) / 26) * 26;
      const y = Math.round((event.active.rect.current.translated?.top || 0) / 26) * 26;
      
      const adjustedX = Math.max(0, x - 256);
      
      addPiece(key, adjustedX, y);
    } else if (active.data.current?.type === 'piece') {
      const id = active.data.current.id;
      const piece = pieces.find(p => p.id === id);
      if (piece) {
        const x = Math.max(0, Math.round((piece.x + delta.x) / 26) * 26);
        const y = Math.max(0, Math.round((piece.y + delta.y) / 26) * 26);
        updatePiecePosition(id, x, y);
      }
    }
  };

  const checkConformance = () => {
    const currentTheme = THEMES.find((item) => item.id === theme) || THEMES[0];
    const hasAgent = pieces.some(p => p.key === 'agent');
    const hasGoal = pieces.some(p => p.key === 'goal');
    const hasInteractive = pieces.some(p => ['carryable', 'bin', 'choice', 'zone', 'rule', 'queue'].includes(p.key));
    
    if (hasAgent && hasGoal && hasInteractive) {
      const uniqueEvents = new Set(pieces.flatMap(p => PIECES.find(def => def.key === p.key)?.alwaysEmits || []));
      return { ok: true, msg: t('builder.conformance.pass', locale, { count: String(pieces.length), events: String(uniqueEvents.size) }) };
    }
    
    const missing = [];
    if (!hasAgent) missing.push(currentTheme.labels[locale].agent);
    if (!hasGoal) missing.push(currentTheme.labels[locale].goal);
    if (!hasInteractive) missing.push(locale === 'ar' ? 'قطعة تفاعلية' : 'interactive piece');
    
    return { ok: false, msg: t('builder.conformance.fail', locale, { missing: missing.join(', ') }) };
  };

  const conf = checkConformance();

  const handleRun = () => {
    if (!conf.ok) return;
    
    setIsSimulating(true);
    setEvents([]);
    setScore(initialScore);
    
    const generated = generateSessionEvents(pieces);
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
        simulationRef.current = window.setTimeout(stream, 55);
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
    downloadJson('bunyan-studio-project.json', {
      schemaVersion: 1,
      name: loadedProject?.name ?? 'My Studio Project',
      theme,
      locale,
      config: { pieces },
    });
  };

  const handleManifestExport = () => {
    downloadJson('bunyan-studio-event-manifest.json', {
      sealed: true,
      scoringVersion: '1.0',
      events: Array.from(new Set(pieces.flatMap(p => PIECES.find(def => def.key === p.key)?.alwaysEmits || []))),
    });
  };

  const loadSample = () => {
    const samplePieces: PlacedPiece[] = [
      { id: crypto.randomUUID(), key: 'agent', x: 52, y: 52, settings: {} },
      { id: crypto.randomUUID(), key: 'carryable', x: 156, y: 104, settings: {} },
      { id: crypto.randomUUID(), key: 'bin', x: 260, y: 156, settings: {} },
      { id: crypto.randomUUID(), key: 'queue', x: 364, y: 52, settings: {} },
      { id: crypto.randomUUID(), key: 'goal', x: 468, y: 208, settings: {} },
    ];
    loadProject('waste', samplePieces);
    
    setProjectId(null);
  };

  const projectData = {
    name: loadedProject?.name ?? "My Studio Project",
    theme,
    locale: locale as 'en' | 'ar',
    config: { pieces },
  };

  const handleSave = () => {
    if (projectId) {
      updateProject.mutate({ id: projectId, data: projectData }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListStudioProjectsQueryKey() }),
      });
      return;
    }
    createProject.mutate({ data: projectData }, {
      onSuccess: (project) => {
        setProjectId(project.id);
        queryClient.invalidateQueries({ queryKey: getListStudioProjectsQueryKey() });
      },
    });
  };

  const handleDelete = () => {
    if (!projectId) return;
    deleteProject.mutate({ id: projectId }, {
      onSuccess: () => {
        setProjectId(null);
        clearGrid();
        queryClient.invalidateQueries({ queryKey: getListStudioProjectsQueryKey() });
      },
    });
  };

  // Debounced Autosave
  const lastSavedPieces = useRef<PlacedPiece[]>(pieces);
  const lastSavedTheme = useRef<string>(theme);
  
  useEffect(() => {
    if (pieces === lastSavedPieces.current && theme === lastSavedTheme.current) return;
    
    const handler = setTimeout(() => {
      if (projectId) {
        updateProject.mutate({ id: projectId, data: projectData });
      } else {
        createProject.mutate({ data: projectData }, {
          onSuccess: (res) => setProjectId(res.id)
        });
      }
      
      lastSavedPieces.current = pieces;
      lastSavedTheme.current = theme;
    }, 1000);

    return () => clearTimeout(handler);
  }, [pieces, theme, projectId, locale]);

  return (
    <StudioShell>
      <div className="flex min-h-full flex-col overflow-visible lg:h-full lg:overflow-hidden">
        
        {/* Top Controls */}
        <div className="min-h-12 bg-[var(--surface)] border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2 px-3 py-2 shrink-0 shadow-sm z-20 relative">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
            <label className="sr-only" htmlFor="saved-projects">{t('nav.savedProjects', locale)}</label>
            <select
              id="saved-projects"
              value={projectId ?? ''}
              onChange={(event) => {
                const id = event.target.value;
                setProjectId(id || null);
                if (!id) clearGrid();
              }}
              className="h-8 max-w-44 rounded-md border border-[var(--line)] bg-white px-2 text-xs"
            >
              <option value="">{t('nav.newProject', locale)}</option>
              {projects?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={loadSample}>
              {t('nav.loadSample', locale)}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('nav.save', locale)}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('nav.export', locale)}
            </Button>
            <Button variant="outline" size="sm" onClick={handleManifestExport}>
              <FileJson className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('nav.exportManifest', locale)}
            </Button>
            {updateProject.isPending && <span className="text-xs text-[var(--ink-faint)]">{t('nav.saving', locale)}</span>}
          </div>
          
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 lg:gap-4">
            <div className={`text-sm font-medium ${conf.ok ? 'text-[var(--ok)]' : 'text-[var(--warn)]'}`}>
              {conf.msg}
            </div>
            
            <div className="h-6 w-px bg-[var(--line)]" />
            
            <Button variant="ghost" size="sm" onClick={clearGrid}>
              <Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('nav.clear', locale)}
            </Button>
            {projectId && (
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteProject.isPending}>
                {t('nav.deleteProject', locale)}
              </Button>
            )}
            <Button 
              size="sm" 
              className="bg-[var(--block-teal)] hover:bg-[var(--block-teal)]/90 text-white" 
              disabled={!conf.ok || isSimulating}
              onClick={handleRun}
            >
              <PlayCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('nav.run', locale)}
            </Button>
          </div>
        </div>

        {/* Workspace */}
        <DndContext 
          sensors={sensors} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-visible lg:flex-row lg:overflow-hidden">
            <Palette />
            <Grid />
            <Inspector />
          </div>
        </DndContext>
        
        {/* Output */}
        <div className="min-h-64 border-t border-[var(--line)] bg-[var(--paper)] flex flex-col shrink-0 p-4 gap-4 z-20 relative shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:h-64 lg:flex-row">
          <Console events={events} />
          <Indicators score={score} />
        </div>

      </div>
    </StudioShell>
  );
}
