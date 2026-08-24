import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const telemetrySessions = pgTable(
  "sessions",
  {
    sessionId: uuid("session_id").primaryKey(),
    playerId: text("player_id").notNull(),
    gameId: text("game_id").notNull(),
    gameVersion: text("game_version").notNull(),
    ageBand: text("age_band").notNull(),
    lang: text("lang").notNull(),
    deviceClass: text("device_class"),
    inputType: text("input_type"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    endReason: text("end_reason"),
    isGuest: boolean("is_guest").notNull().default(false),
  },
  (table) => [index("sessions_player_started_idx").on(table.playerId, table.startedAt)],
);

export const telemetryEvents = pgTable(
  "events",
  {
    eventId: uuid("event_id").primaryKey(),
    sessionId: uuid("session_id").notNull(),
    playerId: text("player_id").notNull(),
    gameId: text("game_id").notNull(),
    seq: integer("seq").notNull(),
    tClientMs: integer("t_client_ms").notNull(),
    tsServer: timestamp("ts_server", { withTimezone: true }).notNull().defaultNow(),
    eventType: text("event_type").notNull(),
    itemId: text("item_id"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  },
  (table) => [
    index("events_session_seq_idx").on(table.sessionId, table.seq),
    index("events_type_server_idx").on(table.eventType, table.tsServer),
  ],
);

export const itemAttempts = pgTable(
  "item_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull(),
    playerId: text("player_id").notNull(),
    gameId: text("game_id").notNull(),
    itemId: text("item_id").notNull(),
    tHesitationMs: integer("t_hesitation_ms"),
    tDeliberationMs: integer("t_deliberation_ms"),
    tTotalMs: integer("t_total_ms"),
    nChanges: integer("n_changes").notNull().default(0),
    changedToCorrect: boolean("changed_to_correct"),
    correct: boolean("correct"),
    hintUsed: boolean("hint_used").notNull().default(false),
    nOptionsHovered: integer("n_options_hovered").notNull().default(0),
    dwellChosenMs: integer("dwell_chosen_ms"),
    dwellRejectedMs: integer("dwell_rejected_ms"),
    offTaskMs: integer("off_task_ms").notNull().default(0),
    repeatOfPriorErr: boolean("repeat_of_prior_err"),
    movesUsed: integer("moves_used"),
    optimalMoves: integer("optimal_moves"),
    difficulty: integer("difficulty"),
    itemOrdinal: integer("item_ordinal"),
    attemptNumber: integer("attempt_number"),
    strategySignature: text("strategy_signature"),
    custom: jsonb("custom").$type<Record<string, unknown>>(),
  },
  (table) => [
    index("attempts_session_ordinal_idx").on(table.sessionId, table.itemOrdinal),
    index("attempts_player_game_idx").on(table.playerId, table.gameId),
  ],
);

export const movementFeatures = pgTable("movement_features", {
  gestureId: uuid("gesture_id").primaryKey(),
  sessionId: uuid("session_id").notNull(),
  itemId: text("item_id"),
  gestureType: text("gesture_type").notNull(),
  durationMs: integer("duration_ms").notNull(),
  pathLength: real("path_length").notNull(),
  straightDistance: real("straight_distance").notNull(),
  directness: real("directness"),
  nReversals: integer("n_reversals").notNull().default(0),
  nPauses: integer("n_pauses").notNull().default(0),
  pauseTotalMs: integer("pause_total_ms").notNull().default(0),
  peakVelocity: real("peak_velocity"),
  timeToPeakVelocityMs: integer("time_to_peak_velocity_ms"),
  nZonesEntered: integer("n_zones_entered").notNull().default(0),
  nearMiss: boolean("near_miss").notNull().default(false),
  jitter: real("jitter"),
});

export const sessionMetrics = pgTable("session_metrics", {
  sessionId: uuid("session_id").primaryKey(),
  playerId: text("player_id").notNull(),
  gameId: text("game_id").notNull(),
  ageBand: text("age_band").notNull(),
  nItems: integer("n_items").notNull().default(0),
  metrics: jsonb("metrics").$type<Record<string, number | null>>().notNull(),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  computeVersion: text("compute_version").notNull(),
});

export const indicatorScores = pgTable(
  "indicator_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: text("player_id").notNull(),
    sessionId: uuid("session_id").notNull(),
    indicatorId: text("indicator_id").notNull(),
    component: text("component").notNull(),
    rawValue: real("raw_value").notNull(),
    zScore: real("z_score"),
    score: smallint("score"),
    confidence: real("confidence").notNull(),
    nObservations: integer("n_observations").notNull(),
    provisional: boolean("provisional").notNull(),
    formulaVersion: text("formula_version").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("scores_player_indicator_time_idx").on(table.playerId, table.indicatorId, table.computedAt)],
);

export const normTables = pgTable(
  "norm_tables",
  {
    indicatorId: text("indicator_id").notNull(),
    ageBand: text("age_band").notNull(),
    median: real("median").notNull(),
    mad: real("mad").notNull(),
    nSessions: integer("n_sessions").notNull(),
    builtAt: timestamp("built_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.indicatorId, table.ageBand] })],
);

export const playerProfiles = pgTable(
  "player_profile",
  {
    playerId: text("player_id").notNull(),
    indicatorId: text("indicator_id").notNull(),
    currentScore: smallint("current_score"),
    confidence: real("confidence").notNull(),
    trend30d: real("trend_30d"),
    nSessions: integer("n_sessions").notNull().default(0),
    nGames: integer("n_games").notNull().default(0),
    crossGameVar: real("cross_game_var"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.indicatorId] })],
);

export const gameRegistry = pgTable("game_registry", {
  gameId: text("game_id").primaryKey(),
  gameVersion: text("game_version").notNull(),
  manifest: jsonb("manifest").$type<Record<string, unknown>>().notNull(),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
});