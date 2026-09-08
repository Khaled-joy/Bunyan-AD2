import { date, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type StudioProjectConfig = Record<string, unknown>;

export const studioProjects = pgTable("studio_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  theme: text("theme").notNull().default("custom"),
  locale: text("locale", { enum: ["en", "ar"] }).notNull().default("en"),
  domain: text("domain").notNull().default("civic-life"),
  ageGroup: text("age_group", { enum: ["6-8", "9-12", "13-17"] }).notNull().default("9-12"),
  language: text("language", { enum: ["both", "ar", "en"] }).notNull().default("both"),
  behaviours: jsonb("behaviours").$type<string[]>().notNull().default(["responsibility"]),
  status: text("status", { enum: ["draft", "building", "inReview"] }).notNull().default("draft"),
  config: jsonb("config").$type<StudioProjectConfig>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studioOrders = pgTable("studio_orders", {
  id: text("id").primaryKey(),
  requestingBody: text("requesting_body").notNull(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  ageGroup: text("age_group", { enum: ["6-8", "9-12", "13-17"] }).notNull(),
  behaviours: jsonb("behaviours").$type<string[]>().notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  description: text("description").notNull(),
  language: text("language", { enum: ["both", "ar", "en"] }).notNull(),
  buildWeeks: integer("build_weeks").notNull(),
  artWeeks: integer("art_weeks").notNull(),
  productionNeeds: jsonb("production_needs").$type<string[]>().notNull(),
});
