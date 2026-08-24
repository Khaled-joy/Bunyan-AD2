import { Router, type IRouter } from "express";
import { and, desc, eq, gte } from "drizzle-orm";
import { db, indicatorScores, playerProfiles, sessionMetrics } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();
router.use("/analytics", requireAdmin);

router.get("/analytics/player/:id", async (request, response, next) => {
  try {
    const playerId = request.params.id;
    const profile = await db.select().from(playerProfiles).where(and(eq(playerProfiles.playerId, playerId), gte(playerProfiles.confidence, 0.5)));
    const recentScores = await db.select().from(indicatorScores).where(and(eq(indicatorScores.playerId, playerId), gte(indicatorScores.confidence, 0.5))).orderBy(desc(indicatorScores.computedAt)).limit(50);
    response.json({ player_id: playerId, profile, recent_scores: recentScores });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/class/:id", async (request, response, next) => {
  try {
    const gameMetrics = await db.select().from(sessionMetrics).orderBy(desc(sessionMetrics.computedAt)).limit(200);
    response.json({ class_id: request.params.id, sessions: gameMetrics.length, metrics: gameMetrics.map(({ playerId: _playerId, ...metric }) => metric) });
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/game/:id", async (request, response, next) => {
  try {
    const metrics = await db.select().from(sessionMetrics).where(eq(sessionMetrics.gameId, request.params.id)).orderBy(desc(sessionMetrics.computedAt)).limit(200);
    response.json({ game_id: request.params.id, sessions: metrics.length, metrics });
  } catch (error) {
    next(error);
  }
});

export default router;