export type AgeBand = "cycle1" | "cycle2" | "cycle3";
export type Language = "ar" | "en";

export interface GameContext {
  session: { playerId: string; sessionId: string; gameId: string; ageBand: AgeBand; lang: Language };
  startLevel(levelId: string, meta?: object): void;
  endLevel(levelId: string, meta?: object): void;
  startItem(itemId: string, meta: {
    difficulty: number;
    modality: "text" | "audio" | "image" | "mixed";
    optimalMoves?: number;
    optionCount?: number;
  }): ItemHandle;
  trackPointer(element: HTMLElement, zoneId?: string): () => void;
  hintRequested(itemId: string, hintLevel: number): void;
  languageSwitched(to: Language): void;
  difficultySelected(level: number, wasVoluntary: boolean): void;
  custom(name: string, value: number | string | boolean): void;
  flush(): Promise<void>;
}

export interface ItemHandle {
  firstInput(): void;
  change(value: unknown): void;
  submit(value: unknown): void;
  resolve(result: { correct: boolean; value?: unknown; movesUsed?: number; strategySignature?: string }): void;
  skip(): void;
  timeout(): void;
}

type TelemetryEvent = {
  event_id: string;
  player_id: string;
  game_id: string;
  seq: number;
  t_client_ms: number;
  event_type: string;
  item_id?: string;
  payload: Record<string, unknown>;
};

type StoredQueue = { key: string; events: TelemetryEvent[] };
type TelemetryOptions = {
  session: GameContext["session"];
  endpoint?: string;
  idleThresholdMs?: number;
};

const DB_NAME = "bunayn-telemetry";
const STORE_NAME = "pending";

function uuid() {
  return crypto.randomUUID();
}

function openStore(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in globalThis)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function storeQueue(key: string, events: TelemetryEvent[]) {
  const database = await openStore();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const tx = database.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ key, events } satisfies StoredQueue);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  database.close();
}

async function readQueue(key: string) {
  const database = await openStore();
  if (!database) return [] as TelemetryEvent[];
  const result = await new Promise<TelemetryEvent[]>((resolve) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(((request.result as StoredQueue | undefined)?.events) ?? []);
    request.onerror = () => resolve([]);
  });
  database.close();
  return result;
}

async function removeQueue(key: string) {
  const database = await openStore();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const tx = database.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  database.close();
}

function compactValue(value: unknown) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return value;
  return JSON.stringify(value);
}

export async function startTelemetrySession(options: TelemetryOptions & { gameVersion: string; isGuest?: boolean }) {
  await fetch(`${options.endpoint ?? "/api"}/telemetry/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      session_id: options.session.sessionId,
      player_id: options.session.playerId,
      game_id: options.session.gameId,
      game_version: options.gameVersion,
      age_band: options.session.ageBand,
      lang: options.session.lang,
      device_class: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      input_type: "pointer",
      is_guest: options.isGuest === true,
    }),
  });
}

export function createGameContext(options: TelemetryOptions): GameContext {
  const endpoint = options.endpoint ?? "/api";
  const queueKey = `session:${options.session.sessionId}`;
  const startedAt = performance.now();
  const idleThreshold = options.idleThresholdMs ?? 3000;
  let sequence = 0;
  let queued: TelemetryEvent[] = [];
  let flushing = false;
  let idleTimer: number | undefined;
  let idle = false;

  const emit = (eventType: string, payload: Record<string, unknown> = {}, itemId?: string) => {
    const event: TelemetryEvent = {
      event_id: uuid(),
      player_id: options.session.playerId,
      game_id: options.session.gameId,
      seq: sequence++,
      t_client_ms: Math.round(performance.now() - startedAt),
      event_type: eventType,
      ...(itemId ? { item_id: itemId } : {}),
      payload,
    };
    queued.push(event);
    void storeQueue(queueKey, queued);
    if (queued.length >= 50) void flush();
  };

  const flush = async () => {
    if (flushing) return;
    flushing = true;
    try {
      const replay = await readQueue(queueKey);
      const events = replay.length ? replay : queued;
      if (!events.length) return;
      const response = await fetch(`${endpoint}/telemetry/batch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: options.session.sessionId, events }),
        keepalive: true,
      });
      if (response.ok) {
        queued = queued.filter((event) => !events.some((sent) => sent.event_id === event.event_id));
        await removeQueue(queueKey);
      }
    } finally {
      flushing = false;
    }
  };

  const sendBeacon = () => {
    const events = queued;
    if (!events.length) return;
    const body = new Blob([JSON.stringify({ session_id: options.session.sessionId, events })], { type: "application/json" });
    if (navigator.sendBeacon(`${endpoint}/telemetry/batch`, body)) {
      queued = [];
      void removeQueue(queueKey);
    }
  };

  const resetIdle = () => {
    if (idle) { idle = false; emit("idle.end"); }
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => { idle = true; emit("idle.start"); }, idleThreshold);
  };

  const onVisibility = () => {
    if (document.hidden) { emit("focus.lost"); sendBeacon(); }
    else { emit("focus.gained"); resetIdle(); }
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("beforeunload", sendBeacon);
  ["pointerdown", "keydown", "touchstart"].forEach((type) => window.addEventListener(type, resetIdle, { passive: true }));
  resetIdle();
  const periodicFlush = window.setInterval(() => void flush(), 5000);

  const trackPointer = (element: HTMLElement, zoneId?: string) => {
    let active = false;
    let samples: Array<{ x: number; y: number; t: number }> = [];
    let lastSampleAt = 0;
    const addSample = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastSampleAt < 50) return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      lastSampleAt = now;
      samples.push({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height, t: Math.round(now - startedAt) });
    };
    const finish = (event: PointerEvent, cancelled = false) => {
      if (!active) return;
      addSample(event);
      active = false;
      const segments = samples.slice(1).map((point, index) => Math.hypot(point.x - samples[index]!.x, point.y - samples[index]!.y));
      const pathLength = segments.reduce((total, length) => total + length, 0);
      const first = samples[0];
      const last = samples.at(-1);
      const straightDistance = first && last ? Math.hypot(last.x - first.x, last.y - first.y) : 0;
      const durationMs = first && last ? last.t - first.t : 0;
      emit(cancelled ? "drag.cancel" : "drag.drop", {
        gesture_type: "pointer",
        duration_ms: durationMs,
        path_length: pathLength,
        straight_distance: straightDistance,
        directness: pathLength ? straightDistance / pathLength : 0,
        n_reversals: 0,
        n_pauses: 0,
        pause_total_ms: 0,
        peak_velocity: durationMs ? pathLength / durationMs : 0,
        time_to_peak_velocity_ms: 0,
        n_zones_entered: zoneId ? 1 : 0,
        near_miss: false,
        jitter: 0,
        ...(zoneId ? { zone_id: zoneId } : {}),
      });
      emit("pointer.sample", { path: samples });
      samples = [];
    };
    const down = (event: PointerEvent) => { active = true; samples = []; lastSampleAt = 0; addSample(event); element.setPointerCapture?.(event.pointerId); };
    const move = (event: PointerEvent) => { if (active) addSample(event); };
    const up = (event: PointerEvent) => finish(event);
    const cancel = (event: PointerEvent) => finish(event, true);
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", cancel);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", cancel);
    };
  };

  return {
    session: options.session,
    startLevel: (levelId, meta = {}) => emit("level.start", { level_id: levelId, ...meta }),
    endLevel: (levelId, meta = {}) => emit("level.end", { level_id: levelId, ...meta }),
    startItem: (itemId, meta) => {
      let firstInput = false;
      emit("item.present", { ...meta }, itemId);
      return {
        firstInput: () => { firstInput = true; emit("item.first_input", {}, itemId); },
        change: (value) => emit("item.change", { value: compactValue(value) }, itemId),
        submit: (value) => emit("item.submit", { value: compactValue(value) }, itemId),
        resolve: (result) => {
          if (!firstInput && typeof location !== "undefined" && /localhost|replit\.dev/.test(location.hostname)) console.warn(`[telemetry] item "${itemId}" resolved without firstInput().`);
          emit("item.resolve", { correct: result.correct, value: compactValue(result.value), moves_used: result.movesUsed, strategy_signature: result.strategySignature }, itemId);
        },
        skip: () => emit("item.skip", {}, itemId),
        timeout: () => emit("item.timeout", {}, itemId),
      };
    },
    trackPointer,
    hintRequested: (itemId, hintLevel) => emit("hint.requested", { hint_level: hintLevel }, itemId),
    languageSwitched: (to) => emit("language.switched", { to }),
    difficultySelected: (level, wasVoluntary) => emit("difficulty.selected", { level, was_voluntary: wasVoluntary }),
    custom: (name, value) => emit("custom", { name, value }),
    flush,
  };
}