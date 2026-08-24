import { and, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import { db, sessionMetrics, telemetrySessions } from "@workspace/db";
import { loadConfigJson } from "./telemetry-config";

type StringList = string[];
type CohortFilter = {
  label?: string;
  player?: { age_band?: StringList; is_guest?: boolean };
  session?: { game_id?: StringList; session_lang?: StringList; device_class?: StringList; date_from?: string; date_to?: string };
  derived?: { confidence?: { gte?: number }; provisional?: boolean };
};

type AdvisorConfig = {
  version: string;
  minimum_cell_size: number;
  sensitive_minimum_cell_size: number;
  forbidden: string[];
};

export type CohortRow = {
  player_id: string;
  session_id: string;
  age_band: string;
  lang: string;
  device_class: string;
  game_id: string;
  metrics: Record<string, number | null>;
  started_at: Date;
  input_type: string | null;
};

export const advisorConfig = loadConfigJson<AdvisorConfig>("method-advisor.json");
export const xaiPlotConfig = loadConfigJson<{ audience_gating: Record<string, string[]>; universal_rules: { minimum_confidence: number } }>("xai-plots.json");

const sensitiveAttributes = ["gender", "nationality"];

export function parseCohortFilter(value: unknown): CohortFilter | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const json = JSON.stringify(value).toLowerCase();
  if (sensitiveAttributes.some((term) => json.includes(`"${term}"`))) return null;
  return value as CohortFilter;
}

export async function resolveCohortRows(filter: CohortFilter): Promise<CohortRow[]> {
  const predicates: SQL[] = [];
  const player = filter.player;
  const session = filter.session;
  if (player?.age_band?.length) predicates.push(inArray(telemetrySessions.ageBand, player.age_band));
  if (typeof player?.is_guest === "boolean") predicates.push(eq(telemetrySessions.isGuest, player.is_guest));
  if (session?.game_id?.length) predicates.push(inArray(telemetrySessions.gameId, session.game_id));
  if (session?.session_lang?.length) predicates.push(inArray(telemetrySessions.lang, session.session_lang));
  if (session?.device_class?.length) predicates.push(inArray(telemetrySessions.deviceClass, session.device_class));
  if (session?.date_from && !Number.isNaN(Date.parse(session.date_from))) predicates.push(gte(telemetrySessions.startedAt, new Date(session.date_from)));
  if (session?.date_to && !Number.isNaN(Date.parse(session.date_to))) predicates.push(lte(telemetrySessions.startedAt, new Date(session.date_to)));

  const query = db.select({
    playerId: telemetrySessions.playerId,
    sessionId: telemetrySessions.sessionId,
    ageBand: telemetrySessions.ageBand,
    lang: telemetrySessions.lang,
    deviceClass: telemetrySessions.deviceClass,
    gameId: telemetrySessions.gameId,
    metrics: sessionMetrics.metrics,
    startedAt: telemetrySessions.startedAt,
    inputType: telemetrySessions.inputType,
  }).from(telemetrySessions).innerJoin(sessionMetrics, eq(sessionMetrics.sessionId, telemetrySessions.sessionId));
  const selected = predicates.length ? await query.where(and(...predicates)) : await query;
  return selected.map((row) => ({
    player_id: row.playerId,
    session_id: row.sessionId,
    age_band: row.ageBand,
    lang: row.lang,
    device_class: row.deviceClass ?? "unknown",
    game_id: row.gameId,
    metrics: row.metrics,
    started_at: row.startedAt,
    input_type: row.inputType,
  }));
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function skewness(values: number[]) {
  if (values.length < 3) return null;
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - average) ** 2, 0) / values.length;
  if (!variance) return 0;
  return values.reduce((total, value) => total + (value - average) ** 3, 0) / values.length / Math.pow(variance, 1.5);
}

export function dataShape(rows: CohortRow[]) {
  const playerRows = new Map<string, CohortRow[]>();
  for (const row of rows) playerRows.set(row.player_id, [...(playerRows.get(row.player_id) ?? []), row]);
  const observationsPerPlayer = [...playerRows.values()].map((entries) => entries.length);
  const rtValues = rows.map((row) => row.metrics.rt_median).filter((value): value is number => typeof value === "number");
  const knownMetricValues = rows.flatMap((row) => Object.values(row.metrics).filter((value): value is number => typeof value === "number"));
  const groupMap = [...playerRows.entries()].reduce((groups, [playerId, entries]) => {
    const ageBand = entries[0]!.age_band;
    groups.set(ageBand, (groups.get(ageBand) ?? new Set<string>()).add(playerId));
    return groups;
  }, new Map<string, Set<string>>());
  const groupSizes = Object.fromEntries([...groupMap.entries()].map(([group, members]) => [group, members.size]));
  const playerMeans = [...playerRows.values()].map((entries) => {
    const values = entries.map((entry) => entry.metrics.rt_median).filter((value): value is number => typeof value === "number");
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  }).filter((value): value is number => value !== null);
  const totalMean = rtValues.length ? rtValues.reduce((total, value) => total + value, 0) / rtValues.length : 0;
  const totalVariance = rtValues.length > 1 ? rtValues.reduce((total, value) => total + (value - totalMean) ** 2, 0) / (rtValues.length - 1) : 0;
  const meanOfMeans = playerMeans.length ? playerMeans.reduce((total, value) => total + value, 0) / playerMeans.length : 0;
  const betweenVariance = playerMeans.length > 1 ? playerMeans.reduce((total, value) => total + (value - meanOfMeans) ** 2, 0) / (playerMeans.length - 1) : 0;
  const inputMix = Object.fromEntries(rows.reduce((mix, row) => {
    const input = row.input_type ?? "unknown";
    mix.set(input, (mix.get(input) ?? 0) + 1);
    return mix;
  }, new Map<string, number>()));
  const repeated = median(observationsPerPlayer) > 1;
  return {
    n_players: playerRows.size,
    n_sessions: rows.length,
    n_observations: rows.length,
    obs_per_player_median: median(observationsPerPlayer),
    group_sizes: groupSizes,
    outcome_skewness: skewness(rtValues),
    missing_rate: knownMetricValues.length ? 1 - knownMetricValues.length / Math.max(1, rows.length * 8) : 1,
    abandoned_session_rate: 0,
    icc_estimate: totalVariance ? Math.max(0, Math.min(1, betweenVariance / totalVariance)) : null,
    n_schools: 0,
    spans_norm_rebuild_boundary: false,
    input_type_mix: inputMix,
    age_range_months: 0,
    auto_flags: [
      ...(repeated ? ["repeated_measures: independence-assuming tests are blocked"] : []),
      ...(Math.abs(skewness(rtValues) ?? 0) > 1 ? ["right_skewed_outcome: log transform required"] : []),
    ],
  };
}

export function outputGroupSizes(rows: CohortRow[], outcome: string) {
  const groups = new Map<string, Set<string>>();
  for (const row of rows) {
    if (typeof row.metrics[outcome] !== "number") continue;
    groups.set(row.age_band, (groups.get(row.age_band) ?? new Set()).add(row.player_id));
  }
  return Object.fromEntries([...groups.entries()].map(([group, members]) => [group, members.size]));
}

export function meetsOutputCellMinimum(rows: CohortRow[], outcome: string, minimum: number) {
  const groups = outputGroupSizes(rows, outcome);
  return Object.keys(groups).length >= 2 && Object.values(groups).every((size) => size >= minimum);
}

export const comparisonDimensions = ["age_band", "game_id", "lang", "device_class"] as const;
export const comparisonMetrics = ["accuracy", "rt_median", "persistence_index", "self_correction_rate", "exploration_breadth", "challenge_seeking"] as const;
const approvedGameIds = new Set(["eco-future", "basket-challenge", "heritage", "color-focus", "library-sort", "word-journey", "healthy-restaurant", "innovation-lab", "numeracy-check", "bot-workshop", "truth-lab", "common-ground", "spark-studio"]);
export type ComparisonDimension = (typeof comparisonDimensions)[number];
export type ComparisonMetric = (typeof comparisonMetrics)[number];

export function isComparisonDimension(value: unknown): value is ComparisonDimension {
  return typeof value === "string" && (comparisonDimensions as readonly string[]).includes(value);
}

export function isComparisonMetric(value: unknown): value is ComparisonMetric {
  return typeof value === "string" && (comparisonMetrics as readonly string[]).includes(value);
}

function dimensionValue(row: CohortRow, dimension: ComparisonDimension) {
  if (dimension === "game_id") return approvedGameIds.has(row.game_id) ? row.game_id : "other";
  if (dimension === "age_band") return ["cycle1", "cycle2", "cycle3"].includes(row.age_band) ? row.age_band : "unknown";
  if (dimension === "lang") return ["ar", "en"].includes(row.lang) ? row.lang : "unknown";
  return ["desktop", "mobile", "tablet"].includes(row.device_class) ? row.device_class : "unknown";
}

export function aggregateGameCoverage(rows: CohortRow[], minimum: number) {
  const groups = new Map<string, Set<string>>();
  for (const row of rows) {
    const gameId = dimensionValue(row, "game_id");
    groups.set(gameId, (groups.get(gameId) ?? new Set()).add(row.player_id));
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([game_id, players]) => ({
    game_id,
    players: players.size >= minimum ? players.size : null,
    suppressed: players.size < minimum,
  }));
}

export function aggregateComparison(rows: CohortRow[], groupBy: ComparisonDimension, compareBy: ComparisonDimension, metric: ComparisonMetric, minimum: number) {
  const cells = new Map<string, { group: string; series: string; players: Set<string>; values: number[] }>();
  for (const row of rows) {
    const value = row.metrics[metric];
    if (typeof value !== "number") continue;
    const group = String(dimensionValue(row, groupBy) ?? "unknown");
    const series = String(dimensionValue(row, compareBy) ?? "unknown");
    const key = `${group}\u0000${series}`;
    const cell = cells.get(key) ?? { group, series, players: new Set<string>(), values: [] };
    cell.players.add(row.player_id);
    cell.values.push(value);
    cells.set(key, cell);
  }
  return [...cells.values()].sort((left, right) => left.group.localeCompare(right.group) || left.series.localeCompare(right.series)).map((cell) => ({
    group: cell.group,
    series: cell.series,
    value: cell.players.size >= minimum ? Number((cell.values.reduce((sum, value) => sum + value, 0) / cell.values.length).toFixed(3)) : null,
    suppressed: cell.players.size < minimum,
  }));
}

export function compactRowsForExecutor(rows: CohortRow[], outcome: string) {
  return rows.map((row) => ({
    player_id: row.player_id,
    age_band: row.age_band,
    [outcome]: row.metrics[outcome] ?? null,
  })).filter((row) => typeof row[outcome] === "number");
}