import { asc, eq } from "drizzle-orm";
import { db, indicatorScores, itemAttempts, playerProfiles, sessionMetrics, telemetryEvents, telemetrySessions } from "@workspace/db";
import { indicatorConfig } from "./telemetry-config";

type EventRow = typeof telemetryEvents.$inferSelect;

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function numberPayload(event: EventRow, key: string) {
  const value = event.payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function processTelemetrySession(sessionId: string) {
  const [session] = await db.select().from(telemetrySessions).where(eq(telemetrySessions.sessionId, sessionId));
  if (!session) return;

  const events = await db.select().from(telemetryEvents).where(eq(telemetryEvents.sessionId, sessionId)).orderBy(asc(telemetryEvents.seq));
  const timelines = new Map<string, { present?: EventRow; firstInput?: EventRow; submit?: EventRow; resolve?: EventRow; changes: EventRow[]; hintUsed: boolean }>();

  for (const event of events) {
    if (!event.itemId) continue;
    const timeline = timelines.get(event.itemId) ?? { changes: [], hintUsed: false };
    timelines.set(event.itemId, timeline);
    if (event.eventType === "item.present") timeline.present = event;
    if (event.eventType === "item.first_input") timeline.firstInput = event;
    if (event.eventType === "item.submit") timeline.submit = event;
    if (event.eventType === "item.resolve") timeline.resolve = event;
    if (event.eventType === "item.change") timeline.changes.push(event);
    if (event.eventType === "hint.requested") timeline.hintUsed = true;
  }

  await db.delete(itemAttempts).where(eq(itemAttempts.sessionId, sessionId));

  const attempts = [...timelines.entries()]
    .filter(([, timeline]) => timeline.present || timeline.resolve)
    .map(([itemId, timeline], ordinal) => {
      const correct = timeline.resolve?.payload.correct === true;
      const hesitation = timeline.present && timeline.firstInput ? timeline.firstInput.tClientMs - timeline.present.tClientMs : null;
      const deliberation = timeline.firstInput && timeline.submit ? timeline.submit.tClientMs - timeline.firstInput.tClientMs : null;
      const total = timeline.present && timeline.resolve ? timeline.resolve.tClientMs - timeline.present.tClientMs : null;
      const difficulty = timeline.present ? numberPayload(timeline.present, "difficulty") : null;
      return {
        sessionId,
        playerId: session.playerId,
        gameId: session.gameId,
        itemId,
        tHesitationMs: hesitation,
        tDeliberationMs: deliberation,
        tTotalMs: total,
        nChanges: timeline.changes.length,
        changedToCorrect: Boolean(correct && timeline.changes.length),
        correct,
        hintUsed: timeline.hintUsed,
        difficulty,
        itemOrdinal: ordinal + 1,
        attemptNumber: 1,
        movesUsed: timeline.resolve ? numberPayload(timeline.resolve, "moves_used") : null,
        optimalMoves: timeline.present ? numberPayload(timeline.present, "optimal_moves") : null,
        strategySignature: timeline.resolve?.payload.strategy_signature as string | undefined,
      };
    });

  if (attempts.length) await db.insert(itemAttempts).values(attempts);

  const resolved = attempts.filter((attempt) => attempt.correct !== null);
  const hesitations = attempts.map((attempt) => attempt.tHesitationMs).filter((value): value is number => value !== null && value >= 0);
  const accuracy = resolved.length ? resolved.filter((attempt) => attempt.correct).length / resolved.length : null;
  const metrics = {
    rt_median: median(hesitations),
    accuracy,
    persistence_index: attempts.length ? resolved.length / attempts.length : null,
    resilience_slope: accuracy,
    self_correction_rate: resolved.length ? resolved.filter((attempt) => attempt.changedToCorrect).length / resolved.length : null,
    error_recovery_ms: null,
    exploration_breadth: new Set(attempts.map((attempt) => attempt.difficulty).filter((value) => value !== null)).size || null,
    challenge_seeking: attempts.length ? attempts.filter((attempt) => (attempt.difficulty ?? 0) >= 2).length / attempts.length : null,
  };

  await db.insert(sessionMetrics).values({
    sessionId,
    playerId: session.playerId,
    gameId: session.gameId,
    ageBand: session.ageBand,
    nItems: attempts.length,
    metrics,
    computeVersion: "1.0.0",
  }).onConflictDoUpdate({ target: sessionMetrics.sessionId, set: { nItems: attempts.length, metrics, computeVersion: "1.0.0", computedAt: new Date() } });

  await db.delete(indicatorScores).where(eq(indicatorScores.sessionId, sessionId));
  const scoreRows = indicatorConfig.indicators.flatMap((indicator) => {
    const sourceValues = indicator.source_metrics
      .map((key) => metrics[key as keyof typeof metrics])
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    if (sourceValues.length < indicator.min_observations) return [];
    const rawValue = sourceValues.reduce((total, value) => total + value, 0) / sourceValues.length;
    const norm = indicator.seed_norm[session.ageBand as "cycle1" | "cycle2" | "cycle3"];
    const zScore = Math.max(-3, Math.min(3, (rawValue - norm.median) / (1.4826 * norm.mad)));
    const score = Math.max(0, Math.min(100, Math.round(50 + zScore * 15 * indicator.direction)));
    const confidence = Math.min(1, sourceValues.length / indicator.min_observations) * Math.min(1, 1 / 3) * Math.min(1, 1 / 2);
    return [{
      playerId: session.playerId,
      sessionId,
      indicatorId: indicator.id,
      component: "session",
      rawValue,
      zScore,
      score,
      confidence,
      nObservations: sourceValues.length,
      provisional: true,
      formulaVersion: indicatorConfig.version,
    }];
  });

  if (scoreRows.length) await db.insert(indicatorScores).values(scoreRows);
  if (!session.isGuest && scoreRows.length) {
    for (const score of scoreRows) {
      await db.insert(playerProfiles).values({
        playerId: score.playerId,
        indicatorId: score.indicatorId,
        currentScore: score.score,
        confidence: score.confidence,
        nSessions: 1,
        nGames: 1,
      }).onConflictDoUpdate({
        target: [playerProfiles.playerId, playerProfiles.indicatorId],
        set: { currentScore: score.score, confidence: score.confidence, updatedAt: new Date() },
      });
    }
  }
}