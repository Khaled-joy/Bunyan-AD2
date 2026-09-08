import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type StudioProjectConfig = Record<string, unknown>;

export const studioProjects = pgTable("studio_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  locale: text("locale", { enum: ["en", "ar"] }).notNull().default("en"),
  config: jsonb("config").$type<StudioProjectConfig>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
