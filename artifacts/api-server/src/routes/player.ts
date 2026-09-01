import { Router, type IRouter } from "express";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db, coinLedger, playerEquipped, playerInventory, playerWallets, telemetrySessions } from "@workspace/db";

const router: IRouter = Router();
const ITEM_PRICES: Record<string, number> = {
  falcon_guardian: 450,
  nova_sentinel: 450,
  cyber_falconer: 600,
  sky_skater: 300,
  dune_racer: 500,
  neon_gt: 550,
  glow_studio: 250,
  desert_rose_glam: 250,
};
const VALID_EVENT = "clean_environment_better_future";

function playerId(value: unknown) {
  return typeof value === "string" && value.trim().length >= 2 && value.length <= 160 ? value.trim() : null;
}

router.get("/player/wallet", async (request, response, next) => {
  try {
    const id = playerId(request.query.player_id);
    if (!id) return response.status(400).json({ error: "A player id is required." });
    const [wallet] = await db.select().from(playerWallets).where(eq(playerWallets.playerId, id)).limit(1);
    const inventory = await db.select().from(playerInventory).where(eq(playerInventory.playerId, id));
    const [equipped] = await db.select().from(playerEquipped).where(eq(playerEquipped.playerId, id)).limit(1);
    return response.json({ balance: wallet?.balance ?? 0, inventory: inventory.map((item) => item.itemId), equipped: equipped?.itemId ?? null });
  } catch (error) {
    return next(error);
  }
});

router.get("/player/sessions", async (request, response, next) => {
  try {
    const id = playerId(request.query.player_id);
    if (!id) return response.status(400).json({ error: "A player id is required." });
    const sessions = await db.select().from(telemetrySessions).where(eq(telemetrySessions.playerId, id)).orderBy(desc(telemetrySessions.startedAt)).limit(20);
    return response.json({ sessions });
  } catch (error) {
    return next(error);
  }
});

router.get("/events/:id", (request, response) => {
  if (request.params.id === VALID_EVENT) {
    response.status(410).json({ error: "This event has ended.", event_id: VALID_EVENT, status: "ended" });
    return;
  }
  response.status(404).json({ error: "Event not found." });
});

router.post("/player/purchase", async (request, response, next) => {
  try {
    const id = playerId(request.body?.player_id);
    const itemId = typeof request.body?.item_id === "string" ? request.body.item_id : null;
    if (!id || !itemId || !(itemId in ITEM_PRICES)) return response.status(400).json({ error: "Invalid player or item." });
    const price = ITEM_PRICES[itemId];
    const result = await db.transaction(async (tx) => {
      let [wallet] = await tx.select().from(playerWallets).where(eq(playerWallets.playerId, id)).limit(1);
      if (!wallet) {
        [wallet] = await tx.insert(playerWallets).values({ playerId: id, balance: 120 }).returning();
        await tx.insert(coinLedger).values({ playerId: id, delta: 120, reason: "starter_grant", referenceId: "wallet_initialization" });
      }
      const [existing] = await tx.select().from(playerInventory).where(and(eq(playerInventory.playerId, id), eq(playerInventory.itemId, itemId))).limit(1);
      if (existing) return { status: 409 as const, body: { error: "Item is already owned." } };
      if (wallet.balance < price) return { status: 402 as const, body: { error: "Not enough coins.", balance: wallet.balance } };
      const [updated] = await tx.update(playerWallets).set({ balance: wallet.balance - price, updatedAt: new Date() }).where(eq(playerWallets.playerId, id)).returning();
      await tx.insert(coinLedger).values({ playerId: id, delta: -price, reason: "purchase", referenceId: itemId });
      await tx.insert(playerInventory).values({ playerId: id, itemId });
      return { status: 200 as const, body: { balance: updated.balance, item_id: itemId } };
    });
    return response.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
});

router.post("/player/equip", async (request, response, next) => {
  try {
    const id = playerId(request.body?.player_id);
    const itemId = typeof request.body?.item_id === "string" ? request.body.item_id : null;
    if (!id || !itemId) return response.status(400).json({ error: "Invalid player or item." });
    const [owned] = await db.select().from(playerInventory).where(and(eq(playerInventory.playerId, id), eq(playerInventory.itemId, itemId))).limit(1);
    if (!owned) return response.status(403).json({ error: "Item must be owned before it can be equipped." });
    await db.insert(playerEquipped).values({ playerId: id, itemId }).onConflictDoUpdate({ target: playerEquipped.playerId, set: { itemId, updatedAt: new Date() } });
    return response.json({ equipped: itemId });
  } catch (error) {
    return next(error);
  }
});

router.post("/player/complete", async (request, response, next) => {
  try {
    const id = playerId(request.body?.player_id);
    const gameId = typeof request.body?.game_id === "string" ? request.body.game_id : null;
    const accuracy = Number(request.body?.accuracy);
    if (!id || !gameId || !Number.isFinite(accuracy)) return response.status(400).json({ error: "Invalid completion payload." });
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const result = await db.transaction(async (tx) => {
      let [wallet] = await tx.select().from(playerWallets).where(eq(playerWallets.playerId, id)).limit(1);
      if (!wallet) [wallet] = await tx.insert(playerWallets).values({ playerId: id, balance: 0 }).returning();
      const rows = await tx.select({ total: sql<number>`coalesce(sum(${coinLedger.delta}), 0)` }).from(coinLedger).where(and(eq(coinLedger.playerId, id), gte(coinLedger.createdAt, today)));
      const dailyTotal = Number(rows[0]?.total ?? 0);
      const completion = Math.max(0, Math.min(20, Math.round(accuracy >= 0.8 ? 20 : 12)));
      const accuracyBonus = Math.max(0, Math.min(15, Math.round(accuracy * 15)));
      const firstPlay = dailyTotal === 0 ? 10 : 0;
      const award = Math.max(0, Math.min(150 - dailyTotal, completion + accuracyBonus + firstPlay));
      if (award > 0) {
        await tx.update(playerWallets).set({ balance: wallet.balance + award, updatedAt: new Date() }).where(eq(playerWallets.playerId, id));
        await tx.insert(coinLedger).values({ playerId: id, delta: award, reason: "game_completion", referenceId: gameId, metadata: { completion, accuracyBonus, firstPlay } });
      }
      return { balance: wallet.balance + award, award, breakdown: { completion, accuracyBonus, firstPlay, dailyCap: 150 } };
    });
    return response.json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;