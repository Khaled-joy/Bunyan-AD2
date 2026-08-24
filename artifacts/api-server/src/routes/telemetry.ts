import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, gameRegistry, telemetryEvents, telemetrySessions } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";
import { processTelemetrySession } from "../lib/telemetry-processing";
import { telemetryCatalog, validateTelemetryEvent } from "../lib/telemetry-config";

const router: IRouter = Router();
const recentRequests = new Map<string, number[]>();
type SessionInput = {
  session_id: string; player_id: string; game_id: string; game_version: string;
  age_band: "cycle1" | "cycle2" | "cycle3"; lang: "ar" | "en";
  device_class?: string; input_type?: string; is_guest: boolean;
};
type EventInput = {
  event_id: string; player_id: string; game_id: string; seq: number; t_client_ms: number;
  event_type: string; item_id?: string | null; payload: Record<string, unknown>;
};

const idPattern = /^[a-zA-Z0-9_-]{1,128}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown, max = 128): value is string => typeof value === "string" && value.length > 0 && value.length <= max;
const isUuid = (value: unknown): value is string => typeof value === "string" && uuidPattern.test(value);
const isInt = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

function parseSession(input: unknown): SessionInput | null {
  if (!isRecord(input) || !isUuid(input.session_id) || !isText(input.player_id) || !isText(input.game_id) || !isText(input.game_version, 64)) return null;
  if (!["cycle1", "cycle2", "cycle3"].includes(String(input.age_band)) || !["ar", "en"].includes(String(input.lang))) return null;
  if (input.device_class !== undefined && !isText(input.device_class, 64)) return null;
  if (input.input_type !== undefined && !isText(input.input_type, 64)) return null;
  if (input.is_guest !== undefined && typeof input.is_guest !== "boolean") return null;
  return {
    session_id: input.session_id,
    player_id: input.player_id,
    game_id: input.game_id,
    game_version: input.game_version,
    age_band: input.age_band as SessionInput["age_band"],
    lang: input.lang as SessionInput["lang"],
    device_class: input.device_class as string | undefined,
    input_type: input.input_type as string | undefined,
    is_guest: input.is_guest === true,
  };
}

function parseBatch(input: unknown): { session_id: string; events: EventInput[] } | null {
  if (!isRecord(input) || !isUuid(input.session_id) || !Array.isArray(input.events) || input.events.length < 1 || input.events.length > 50) return null;
  const events: EventInput[] = [];
  for (const value of input.events) {
    if (!isRecord(value) || !isUuid(value.event_id) || !isText(value.player_id) || !isText(value.game_id) || !isInt(value.seq) || !isInt(value.t_client_ms) || !isText(value.event_type) || !isRecord(value.payload)) return null;
    if (value.item_id !== undefined && value.item_id !== null && !isText(value.item_id)) return null;
    events.push({
      event_id: value.event_id, player_id: value.player_id, game_id: value.game_id, seq: value.seq,
      t_client_ms: value.t_client_ms, event_type: value.event_type, item_id: value.item_id as string | null | undefined, payload: value.payload,
    });
  }
  return { session_id: input.session_id, events };
}

function underRateLimit(sessionId: string) {
  const now = Date.now();
  const recent = (recentRequests.get(sessionId) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 120) return false;
  recent.push(now);
  recentRequests.set(sessionId, recent);
  return true;
}

router.post("/telemetry/sessions", async (request, response, next) => {
  try {
    const session = parseSession(request.body);
    if (!session) {
      response.status(400).json({ error: "Invalid session envelope." });
      return;
    }
    await db.insert(telemetrySessions).values({
      sessionId: session.session_id,
      playerId: session.player_id,
      gameId: session.game_id,
      gameVersion: session.game_version,
      ageBand: session.age_band,
      lang: session.lang,
      deviceClass: session.device_class,
      inputType: session.input_type,
      isGuest: session.is_guest,
    }).onConflictDoNothing({ target: telemetrySessions.sessionId });
    response.status(201).json({ session_id: session.session_id });
  } catch (error) {
    next(error);
  }
});

router.post("/telemetry/batch", async (request, response, next) => {
  try {
    const parsed = parseBatch(request.body);
    if (!parsed) {
      response.status(400).json({ error: "Invalid telemetry batch." });
      return;
    }
    const { session_id: sessionId, events } = parsed;
    if (!underRateLimit(sessionId)) {
      response.status(429).json({ error: "Telemetry rate limit exceeded for this session." });
      return;
    }
    const [session] = await db.select({ sessionId: telemetrySessions.sessionId }).from(telemetrySessions).where(eq(telemetrySessions.sessionId, sessionId));
    if (!session) {
      response.status(404).json({ error: "Unknown telemetry session." });
      return;
    }
    const rejected = events.flatMap((event, index) => {
      const reason = validateTelemetryEvent(event.event_type, event.payload);
      return reason ? [{ index, event_id: event.event_id, reason }] : [];
    });
    if (rejected.length) {
      response.status(400).json({ error: "Telemetry schema validation failed.", accepted: 0, rejected });
      return;
    }
    await db.insert(telemetryEvents).values(events.map((event) => ({
      eventId: event.event_id,
      sessionId,
      playerId: event.player_id,
      gameId: event.game_id,
      seq: event.seq,
      tClientMs: event.t_client_ms,
      eventType: event.event_type,
      itemId: event.item_id ?? null,
      payload: event.payload,
    }))).onConflictDoNothing({ target: telemetryEvents.eventId });

    if (events.some((event) => event.event_type === "session.end")) {
      const endEvent = events.find((event) => event.event_type === "session.end")!;
      await db.update(telemetrySessions).set({ endedAt: new Date(), durationMs: endEvent.t_client_ms, endReason: String(endEvent.payload.end_reason ?? "completed") }).where(eq(telemetrySessions.sessionId, sessionId));
      await processTelemetrySession(sessionId);
    }
    response.json({ accepted: events.length, rejected: [] });
  } catch (error) {
    next(error);
  }
});

router.post("/games/register", requireAdmin, async (request, response, next) => {
  try {
    const manifest = request.body as Record<string, unknown>;
    const gameId = typeof manifest.game_id === "string" ? manifest.game_id : "";
    const gameVersion = typeof manifest.game_version === "string" ? manifest.game_version : "";
    const archetypes = Array.isArray(manifest.archetypes) ? manifest.archetypes : [];
    const pointerEnabled = (manifest.capture as Record<string, unknown> | undefined)?.pointer_path === true;
    if (!gameId || !gameVersion || !archetypes.every((value) => typeof value === "string" && telemetryCatalog.archetypes.includes(value))) {
      response.status(400).json({ error: "The manifest includes an unknown game, version, or archetype." });
      return;
    }
    if (!pointerEnabled && archetypes.some((value) => ["drag_sort", "construction", "navigation_maze"].includes(String(value)))) {
      response.status(400).json({ error: "This game archetype requires capture.pointer_path." });
      return;
    }
    await db.insert(gameRegistry).values({ gameId, gameVersion, manifest }).onConflictDoUpdate({ target: gameRegistry.gameId, set: { gameVersion, manifest, active: true, registeredAt: new Date() } });
    response.status(201).json({ game_id: gameId, active: true });
  } catch (error) {
    next(error);
  }
});

export default router;