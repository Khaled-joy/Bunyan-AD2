import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const gameRequestStatus = pgEnum("game_request_status", [
  "draft",
  "submitted",
  "under_review",
  "info_requested",
  "approved",
  "declined",
  "in_development",
  "delivered",
]);
export const gameRequestCategory = pgEnum("game_request_category", [
  "role_based",
  "scenario_based",
  "simulation_strategy",
  "puzzle",
  "mini_games",
  "creative",
  "exploration",
]);
export const gameRequestAgeGroup = pgEnum("game_request_age_group", ["4_6", "7_9", "10_12", "13_15", "16_18"]);
export const gameRequestDomain = pgEnum("game_request_domain", [
  "literacy",
  "activities",
  "environment",
  "developmental_skills",
  "social_relations",
]);
export const gameRequestTier = pgEnum("game_request_tier", ["tier_1", "tier_2", "tier_3"]);
export const gameRequestScope = pgEnum("game_request_scope", ["collection_only", "collection_and_analysis"]);

export const gameRequests = pgTable(
  "game_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").unique(),
    status: gameRequestStatus("status").notNull().default("draft"),
    requesterName: text("requester_name").notNull(),
    requesterEmail: text("requester_email").notNull(),
    requesterEntity: text("requester_entity").notNull(),
    requesterPhone: text("requester_phone"),
    gameName: text("game_name").notNull(),
    gameDescription: text("game_description").notNull(),
    category: gameRequestCategory("category").notNull(),
    secondaryTags: text("secondary_tags").array().notNull().default([]),
    ageGroup: gameRequestAgeGroup("age_group").notNull(),
    languages: text("languages").array().notNull().default([]),
    sampleUrl: text("sample_url"),
    sampleFilePath: text("sample_file_path"),
    sampleFileName: text("sample_file_name"),
    sampleFileType: text("sample_file_type"),
    sampleFileSize: text("sample_file_size"),
    domain: gameRequestDomain("domain").notNull(),
    indicatorNeeded: text("indicator_needed").notNull(),
    indicatorIsNew: boolean("indicator_is_new").notNull(),
    sourceClasses: text("source_classes").array().notNull().default([]),
    tier: gameRequestTier("tier").notNull(),
    scope: gameRequestScope("scope").notNull(),
    targetDate: text("target_date"),
    notes: text("notes"),
    missingRequiredFields: text("missing_required_fields").array().notNull().default([]),
    accessHash: text("access_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [
    index("game_requests_access_idx").on(table.accessHash),
    index("game_requests_status_idx").on(table.status, table.updatedAt),
    index("game_requests_domain_idx").on(table.domain),
  ],
);

export const gameRequestEvents = pgTable(
  "game_request_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id").notNull(),
    fromStatus: gameRequestStatus("from_status"),
    toStatus: gameRequestStatus("to_status").notNull(),
    actorId: uuid("actor_id"),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("game_request_events_request_idx").on(table.requestId, table.createdAt)],
);

export const gameRequestNotifications = pgTable(
  "game_request_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id").notNull(),
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("game_request_notifications_created_idx").on(table.createdAt)],
);

export type GameRequest = typeof gameRequests.$inferSelect;