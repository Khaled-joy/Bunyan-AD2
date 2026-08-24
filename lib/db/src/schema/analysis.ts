import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const analysisCohorts = pgTable(
  "analysis_cohorts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label").notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>().notNull(),
    protocolName: text("protocol_name"),
    sensitive: boolean("sensitive").notNull().default(false),
    createdBy: text("created_by").notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("analysis_cohorts_created_idx").on(table.createdAt)],
);

export const analysisPlans = pgTable(
  "analysis_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cohortId: uuid("cohort_id").notNull(),
    question: text("question").notNull(),
    plan: jsonb("plan").$type<Record<string, unknown>>().notNull(),
    version: integer("version").notNull().default(1),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("analysis_plans_cohort_idx").on(table.cohortId, table.createdAt)],
);

export const analysisExecutions = pgTable(
  "analysis_executions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id").notNull(),
    cohortId: uuid("cohort_id").notNull(),
    status: text("status").notNull(),
    results: jsonb("results").$type<Record<string, unknown>>(),
    executorVersion: text("executor_version").notNull(),
    executedAt: timestamp("executed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("analysis_executions_plan_idx").on(table.planId, table.executedAt)],
);

export const analysisAuditLog = pgTable(
  "analysis_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    action: text("action").notNull(),
    actorRole: text("actor_role").notNull(),
    cohortId: uuid("cohort_id"),
    planId: uuid("plan_id"),
    executionId: uuid("execution_id"),
    detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("analysis_audit_created_idx").on(table.createdAt)],
);

export type AnalysisCohort = typeof analysisCohorts.$inferSelect;