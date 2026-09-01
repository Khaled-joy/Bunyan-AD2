import { index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const coinLedger = pgTable(
  "coin_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: text("player_id").notNull(),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  },
  (table) => [index("coin_ledger_player_created_idx").on(table.playerId, table.createdAt)],
);

export const playerWallets = pgTable("player_wallets", {
  playerId: text("player_id").primaryKey(),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const playerInventory = pgTable(
  "player_inventory",
  {
    playerId: text("player_id").notNull(),
    itemId: text("item_id").notNull(),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.itemId] }), index("inventory_player_idx").on(table.playerId)],
);

export const playerEquipped = pgTable("player_equipped", {
  playerId: text("player_id").primaryKey(),
  itemId: text("item_id").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const playerTrophies = pgTable(
  "player_trophies",
  {
    playerId: text("player_id").notNull(),
    trophyId: text("trophy_id").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
    sourceGameId: text("source_game_id"),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.trophyId] })],
);