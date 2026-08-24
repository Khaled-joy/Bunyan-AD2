import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type CatalogEvent = { required_payload: string[] };
type TelemetryCatalog = {
  version: string;
  idle_threshold_ms: number;
  archetypes: string[];
  events: Record<string, CatalogEvent>;
};

type SeedNorm = { median: number; mad: number };
export type IndicatorDefinition = {
  id: string;
  source_metrics: string[];
  direction: 1 | -1;
  min_observations: number;
  seed_norm: Record<"cycle1" | "cycle2" | "cycle3", SeedNorm>;
};

type IndicatorConfig = { version: string; indicators: IndicatorDefinition[] };

const bannedClinicalTerms = ["adhd", "dyslexia", "autism", "disorder", "deficit", "impairment", "diagnosis", "screening", "at-risk", "delayed"];

export function loadConfigJson<T>(filename: string) {
  const configDirectory = [
    path.resolve(process.cwd(), "config"),
    path.resolve(process.cwd(), "../../config"),
  ].find((candidate) => existsSync(path.join(candidate, filename)));
  if (!configDirectory) throw new Error(`Telemetry configuration file "${filename}" was not found.`);
  const filePath = path.join(configDirectory, filename);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export const telemetryCatalog = loadConfigJson<TelemetryCatalog>("telemetry-catalog.json");
export const indicatorConfig = loadConfigJson<IndicatorConfig>("indicators.json");

for (const indicator of indicatorConfig.indicators) {
  const normalized = indicator.id.toLowerCase();
  if (bannedClinicalTerms.some((term) => normalized.includes(term))) {
    throw new Error(`Indicator id "${indicator.id}" uses prohibited clinical language.`);
  }
}

export function validateTelemetryEvent(eventType: string, payload: Record<string, unknown>) {
  const definition = telemetryCatalog.events[eventType];
  if (!definition) return `Unsupported event type "${eventType}".`;
  const missing = definition.required_payload.filter((key) => payload[key] === undefined);
  return missing.length ? `Missing payload field(s): ${missing.join(", ")}.` : null;
}