import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { Router, type IRouter, type Request } from "express";
import express from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  gameRequestEvents,
  gameRequestNotifications,
  gameRequests,
  type GameRequest,
} from "@workspace/db";
import { deletePrivateSample, getPrivateSample, uploadPrivateSample } from "../lib/private-object-storage";

const router: IRouter = Router();
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const SOURCE_CLASSES = ["game_telemetry", "student_self_report", "proxy_report", "administrative_data"] as const;
const CATEGORIES = ["role_based", "scenario_based", "simulation_strategy", "puzzle", "mini_games", "creative", "exploration"] as const;
const AGE_GROUPS = ["4_6", "7_9", "10_12", "13_15", "16_18"] as const;
const DOMAINS = ["literacy", "activities", "environment", "developmental_skills", "social_relations"] as const;
const SCOPES = ["collection_only", "collection_and_analysis"] as const;
const EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".pptx", ".mp4"]);
const MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "video/mp4"]);

type SourceClass = typeof SOURCE_CLASSES[number];
type GameRequestInput = {
  requester_name?: unknown; requester_email?: unknown; requester_entity?: unknown; requester_phone?: unknown;
  game_name?: unknown; game_description?: unknown; category?: unknown; secondary_tags?: unknown;
  age_group?: unknown; languages?: unknown; sample_url?: unknown; domain?: unknown;
  indicator_needed?: unknown; indicator_is_new?: unknown; source_classes?: unknown; tier?: unknown;
  scope?: unknown; target_date?: unknown; notes?: unknown;
};

function accessHash(request: Request) {
  const token = request.header("x-game-request-access");
  return typeof token === "string" && token.length >= 24 && token.length <= 200
    ? createHash("sha256").update(token).digest("hex")
    : null;
}
function isText(value: unknown, min: number, max: number) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}
function isOptionalText(value: unknown, max: number) {
  return value === undefined || value === null || (typeof value === "string" && value.trim().length <= max);
}
function oneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}
function stringArray(value: unknown, allowed: readonly string[], min: number, max: number, unique = true) {
  if (!Array.isArray(value) || value.length < min || value.length > max || (unique && new Set(value).size !== value.length)) return false;
  return value.every((item) => typeof item === "string" && allowed.includes(item));
}
function validEmail(value: unknown) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
function validDate(value: unknown) {
  return value === undefined || value === null || value === "" || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));
}
function validationErrors(input: GameRequestInput, requireComplete: boolean) {
  const errors: Record<string, string> = {};
  const requiredText: Array<[keyof GameRequestInput, string, number, number]> = [
    ["requester_name", "Full name", 1, 160], ["requester_email", "Email", 1, 254], ["requester_entity", "Entity / department", 1, 200],
    ["game_name", "Game name", 1, 120], ["game_description", "Game description", 100, 2000],
    ["indicator_needed", "Indicator needed", 50, 2000],
  ];
  if (requireComplete) {
    for (const [key, label, min, max] of requiredText) {
      if (!isText(input[key], min, max)) errors[key] = `${label} must be between ${min} and ${max} characters.`;
    }
    if (!validEmail(input.requester_email)) errors.requester_email = "Enter a valid email address.";
    if (!oneOf(input.category, CATEGORIES)) errors.category = "Choose a valid game category.";
    if (!oneOf(input.age_group, AGE_GROUPS)) errors.age_group = "Choose a valid age group.";
    if (!stringArray(input.languages, ["ar", "en"], 1, 2)) errors.languages = "Choose Arabic, English, or both.";
    if (!oneOf(input.domain, DOMAINS)) errors.domain = "Choose a valid domain.";
    if (typeof input.indicator_is_new !== "boolean") errors.indicator_is_new = "Choose whether this is an existing or new indicator.";
    if (!oneOf(input.scope, SCOPES)) errors.scope = "Choose a valid scope.";
    if (!stringArray(input.source_classes, SOURCE_CLASSES, 1, 4)) errors.source_classes = "Choose at least one source class.";
  }
  if (!isOptionalText(input.requester_phone, 60)) errors.requester_phone = "Phone number is too long.";
  if (!isOptionalText(input.sample_url, 2000) || (typeof input.sample_url === "string" && input.sample_url.trim() && !/^https?:\/\/[^\s]+$/i.test(input.sample_url))) errors.sample_url = "Enter a valid http or https URL.";
  if (!validDate(input.target_date)) errors.target_date = "Enter a valid target date.";
  if (input.secondary_tags !== undefined && !stringArray(input.secondary_tags, CATEGORIES, 0, 6)) errors.secondary_tags = "Choose valid secondary categories.";
  if (Array.isArray(input.secondary_tags) && typeof input.category === "string" && input.secondary_tags.includes(input.category)) errors.secondary_tags = "The primary category cannot also be a secondary tag.";
  if (input.tier !== undefined && !oneOf(input.tier, ["tier_1", "tier_2", "tier_3"])) errors.tier = "Choose a valid evidence tier.";
  if (input.source_classes !== undefined && !stringArray(input.source_classes, SOURCE_CLASSES, 0, 4)) errors.source_classes = "Choose valid source classes.";
  return errors;
}
function tierForSources(sourceClasses: SourceClass[]) {
  if (sourceClasses.length === 4) return "tier_3" as const;
  if (sourceClasses.includes("student_self_report")) return "tier_2" as const;
  return "tier_1" as const;
}
function missingRequiredFields(input: GameRequestInput) {
  const missing: string[] = [];
  const textFields: Array<keyof GameRequestInput> = ["requester_name", "requester_email", "requester_entity", "game_name", "game_description", "indicator_needed"];
  for (const field of textFields) if (typeof input[field] !== "string" || !input[field].trim()) missing.push(field);
  if (!oneOf(input.category, CATEGORIES)) missing.push("category");
  if (!oneOf(input.age_group, AGE_GROUPS)) missing.push("age_group");
  if (!stringArray(input.languages, ["ar", "en"], 1, 2)) missing.push("languages");
  if (!oneOf(input.domain, DOMAINS)) missing.push("domain");
  if (typeof input.indicator_is_new !== "boolean") missing.push("indicator_is_new");
  if (!stringArray(input.source_classes, SOURCE_CLASSES, 1, 4)) missing.push("source_classes");
  if (!oneOf(input.scope, SCOPES)) missing.push("scope");
  return missing;
}
function normalizeInput(input: GameRequestInput, previous?: GameRequest) {
  const value = (key: keyof GameRequestInput, fallback = "") => input[key] === undefined ? fallback : input[key];
  const sourceClasses: SourceClass[] = Array.isArray(input.source_classes)
    ? input.source_classes.filter((item): item is SourceClass => typeof item === "string" && SOURCE_CLASSES.includes(item as SourceClass))
    : (previous?.sourceClasses ?? []).filter((item): item is SourceClass => SOURCE_CLASSES.includes(item as SourceClass));
  const category = oneOf(input.category, CATEGORIES) ? input.category : previous?.category ?? "puzzle";
  const ageGroup = oneOf(input.age_group, AGE_GROUPS) ? input.age_group : previous?.ageGroup ?? "4_6";
  const domain = oneOf(input.domain, DOMAINS) ? input.domain : previous?.domain ?? "literacy";
  const scope = oneOf(input.scope, SCOPES) ? input.scope : previous?.scope ?? "collection_only";
  return {
    requesterName: String(value("requester_name", previous?.requesterName ?? "")).trim(),
    requesterEmail: String(value("requester_email", previous?.requesterEmail ?? "")).trim(),
    requesterEntity: String(value("requester_entity", previous?.requesterEntity ?? "")).trim(),
    requesterPhone: String(value("requester_phone", previous?.requesterPhone ?? "")).trim() || null,
    gameName: String(value("game_name", previous?.gameName ?? "")).trim(),
    gameDescription: String(value("game_description", previous?.gameDescription ?? "")).trim(),
    category,
    secondaryTags: Array.isArray(input.secondary_tags) ? input.secondary_tags as string[] : previous?.secondaryTags ?? [],
    ageGroup,
    languages: Array.isArray(input.languages) ? input.languages as string[] : previous?.languages ?? [],
    sampleUrl: String(value("sample_url", previous?.sampleUrl ?? "")).trim() || null,
    domain,
    indicatorNeeded: String(value("indicator_needed", previous?.indicatorNeeded ?? "")).trim(),
    indicatorIsNew: typeof input.indicator_is_new === "boolean" ? input.indicator_is_new : previous?.indicatorIsNew ?? false,
    sourceClasses,
    tier: tierForSources(sourceClasses),
    scope,
    targetDate: String(value("target_date", previous?.targetDate ?? "")).trim() || null,
    notes: String(value("notes", previous?.notes ?? "")).trim() || null,
    missingRequiredFields: missingRequiredFields(input),
  };
}
function serialize(request: GameRequest, events?: typeof gameRequestEvents.$inferSelect[]) {
  return {
    id: request.id, reference: request.reference, status: request.status, requester_name: request.requesterName,
    requester_email: request.requesterEmail, requester_entity: request.requesterEntity, requester_phone: request.requesterPhone,
    game_name: request.gameName, game_description: request.gameDescription, category: request.category,
    secondary_tags: request.secondaryTags, age_group: request.ageGroup, languages: request.languages,
    sample_url: request.sampleUrl, sample_file: request.sampleFilePath ? { name: request.sampleFileName, type: request.sampleFileType, size: Number(request.sampleFileSize ?? 0) } : null,
    domain: request.domain, indicator_needed: request.indicatorNeeded, indicator_is_new: request.indicatorIsNew,
    source_classes: request.sourceClasses, tier: request.tier, scope: request.scope,
    target_date: request.targetDate, notes: request.notes, created_at: request.createdAt, updated_at: request.updatedAt,
    submitted_at: request.submittedAt, missing_required_fields: request.missingRequiredFields,
    events: events?.map((event) => ({ id: event.id, from_status: event.fromStatus, to_status: event.toStatus, comment: event.comment, created_at: event.createdAt })) ?? [],
  };
}

type Multipart = { fields: Record<string, string>; file?: { name: string; type: string; bytes: Buffer } };
function parseMultipart(request: Request): Multipart | null {
  if (!Buffer.isBuffer(request.body)) return null;
  const contentType = request.header("content-type") ?? "";
  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);
  if (!boundaryMatch) return null;
  const boundary = `--${boundaryMatch[1]}`;
  const parts = request.body.toString("latin1").split(boundary);
  const fields: Record<string, string> = {};
  let file: Multipart["file"];
  for (const part of parts) {
    if (!part || part === "--\r\n" || part === "--") continue;
    const separator = part.indexOf("\r\n\r\n");
    if (separator < 0) continue;
    const headers = part.slice(0, separator);
    let body = part.slice(separator + 4);
    if (body.endsWith("\r\n")) body = body.slice(0, -2);
    const nameMatch = headers.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const filenameMatch = headers.match(/filename="([^"]*)"/i);
    if (filenameMatch && filenameMatch[1]) {
      const type = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() ?? "application/octet-stream";
      file = { name: path.basename(filenameMatch[1]), type, bytes: Buffer.from(body, "latin1") };
    } else {
      fields[nameMatch[1]] = Buffer.from(body, "latin1").toString("utf8");
    }
  }
  return { fields, file };
}
async function saveSample(file: NonNullable<Multipart["file"]>) {
  const ext = path.extname(file.name).toLowerCase();
  if (!EXTENSIONS.has(ext) || !MIME_TYPES.has(file.type) || file.bytes.length > MAX_FILE_SIZE) {
    throw new Error("Sample must be a PDF, PNG, JPG, PPTX, or MP4 file no larger than 25MB.");
  }
  const safeName = `${randomUUID()}${ext}`;
  const storedPath = `/objects/game-requests/${safeName}`;
  await uploadPrivateSample(storedPath, file.bytes, file.type);
  return { path: storedPath, name: file.name.slice(0, 240), type: file.type, size: String(file.bytes.length) };
}
function requestInput(request: Request): { input: GameRequestInput; file?: NonNullable<Multipart["file"]> } {
  if (Buffer.isBuffer(request.body)) {
    const multipart = parseMultipart(request);
    if (!multipart) throw new Error("Invalid multipart request.");
    let input: GameRequestInput = {};
    if (multipart.fields.payload) {
      try { input = JSON.parse(multipart.fields.payload) as GameRequestInput; } catch { throw new Error("Invalid request payload."); }
    }
    return { input, file: multipart.file };
  }
  return { input: (request.body ?? {}) as GameRequestInput };
}
async function createDraft(request: Request, response: any, next: any) {
  const hash = accessHash(request);
  if (!hash) return response.status(401).json({ error: "A private request access handle is required." });
  let uploaded: Awaited<ReturnType<typeof saveSample>> | undefined;
  try {
    const { input, file } = requestInput(request);
    const errors = validationErrors(input, false);
    if (Object.keys(errors).length) return response.status(400).json({ error: "The draft contains invalid values.", fields: errors });
    uploaded = file ? await saveSample(file) : undefined;
    const data = normalizeInput(input);
    const created = await db.transaction(async (tx) => {
      const [record] = await tx.insert(gameRequests).values({
        ...data, category: data.category as typeof gameRequests.$inferInsert.category,
        ageGroup: data.ageGroup as typeof gameRequests.$inferInsert.ageGroup,
        domain: data.domain as typeof gameRequests.$inferInsert.domain,
        tier: data.tier as typeof gameRequests.$inferInsert.tier,
        scope: data.scope as typeof gameRequests.$inferInsert.scope,
        accessHash: hash, sampleFilePath: uploaded?.path, sampleFileName: uploaded?.name, sampleFileType: uploaded?.type, sampleFileSize: uploaded?.size,
      }).returning();
      await tx.insert(gameRequestEvents).values({ requestId: record.id, toStatus: "draft", comment: "Draft created." });
      return record;
    });
    return response.status(201).json({ draft: serialize(created) });
  } catch (error) {
    if (uploaded) await deletePrivateSample(uploaded.path).catch(() => undefined);
    if (error instanceof Error && error.message.startsWith("Sample must")) return response.status(400).json({ error: error.message });
    return next(error);
  }
}
router.post("/game-requests/drafts", express.raw({ type: (request) => String(request.headers["content-type"] ?? "").startsWith("multipart/form-data"), limit: "26mb" }), createDraft);
router.get("/game-requests/drafts", async (request, response, next) => {
  const hash = accessHash(request);
  if (!hash) return response.status(401).json({ error: "A private request access handle is required." });
  try {
    const drafts = await db.select().from(gameRequests).where(and(eq(gameRequests.accessHash, hash), eq(gameRequests.status, "draft"))).orderBy(desc(gameRequests.updatedAt));
    return response.json({ drafts: drafts.map((draft) => serialize(draft)) });
  } catch (error) { return next(error); }
});
router.patch("/game-requests/drafts/:id", express.raw({ type: (request) => String(request.headers["content-type"] ?? "").startsWith("multipart/form-data"), limit: "26mb" }), async (request, response, next) => {
  const hash = accessHash(request);
  if (!hash) return response.status(401).json({ error: "A private request access handle is required." });
  let uploaded: Awaited<ReturnType<typeof saveSample>> | undefined;
  try {
    const existing = (await db.select().from(gameRequests).where(and(eq(gameRequests.id, request.params.id), eq(gameRequests.accessHash, hash))).limit(1))[0];
    if (!existing) return response.status(404).json({ error: "Draft not found." });
    if (existing.status !== "draft" && existing.status !== "info_requested") return response.status(409).json({ error: "Submitted requests are locked for editing." });
    const { input, file } = requestInput(request);
    const errors = validationErrors(input, false);
    if (Object.keys(errors).length) return response.status(400).json({ error: "The draft contains invalid values.", fields: errors });
    uploaded = file ? await saveSample(file) : undefined;
    const data = normalizeInput(input, existing);
    const [updated] = await db.update(gameRequests).set({
      ...data, category: data.category as typeof gameRequests.$inferInsert.category, ageGroup: data.ageGroup as typeof gameRequests.$inferInsert.ageGroup,
      domain: data.domain as typeof gameRequests.$inferInsert.domain, tier: data.tier as typeof gameRequests.$inferInsert.tier, scope: data.scope as typeof gameRequests.$inferInsert.scope,
      sampleUrl: data.sampleUrl, sampleFilePath: uploaded?.path ?? existing.sampleFilePath, sampleFileName: uploaded?.name ?? existing.sampleFileName,
      sampleFileType: uploaded?.type ?? existing.sampleFileType, sampleFileSize: uploaded?.size ?? existing.sampleFileSize, updatedAt: new Date(),
    }).where(eq(gameRequests.id, existing.id)).returning();
    if (uploaded && existing.sampleFilePath) await deletePrivateSample(existing.sampleFilePath).catch(() => undefined);
    return response.json({ draft: serialize(updated) });
  } catch (error) {
    if (uploaded) await deletePrivateSample(uploaded.path).catch(() => undefined);
    if (error instanceof Error && error.message.startsWith("Sample must")) return response.status(400).json({ error: error.message });
    return next(error);
  }
});
router.post("/game-requests/drafts/:id/submit", async (request, response, next) => {
  const hash = accessHash(request);
  if (!hash) return response.status(401).json({ error: "A private request access handle is required." });
  try {
    const result = await db.transaction(async (tx) => {
      const existing = (await tx.select().from(gameRequests).where(and(eq(gameRequests.id, request.params.id), eq(gameRequests.accessHash, hash))).limit(1))[0];
      if (!existing) return { status: 404 as const, body: { error: "Draft not found." } };
      if (existing.status !== "draft" && existing.status !== "info_requested") return { status: 409 as const, body: { error: "This request has already been submitted." } };
      const errors = validationErrors({
        requester_name: existing.requesterName, requester_email: existing.requesterEmail, requester_entity: existing.requesterEntity,
        requester_phone: existing.requesterPhone, game_name: existing.gameName, game_description: existing.gameDescription, category: existing.category,
        secondary_tags: existing.secondaryTags, age_group: existing.ageGroup, languages: existing.languages, sample_url: existing.sampleUrl,
        domain: existing.domain, indicator_needed: existing.indicatorNeeded, indicator_is_new: existing.indicatorIsNew, source_classes: existing.sourceClasses,
        tier: existing.tier, scope: existing.scope, target_date: existing.targetDate, notes: existing.notes,
      }, true);
      for (const field of existing.missingRequiredFields) errors[field] = errors[field] ?? "This field is required.";
      if (Object.keys(errors).length) return { status: 422 as const, body: { error: "Complete the required fields before submitting.", fields: errors } };
      const reference = `BUN-GR-${new Date().getUTCFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
      const [updated] = await tx.update(gameRequests).set({ status: "submitted", reference, submittedAt: new Date(), updatedAt: new Date() }).where(and(eq(gameRequests.id, existing.id), eq(gameRequests.status, existing.status))).returning();
      await tx.insert(gameRequestEvents).values({ requestId: existing.id, fromStatus: existing.status, toStatus: "submitted", comment: "Request submitted for review." });
      await tx.insert(gameRequestNotifications).values([
        { requestId: existing.id, kind: "request_submitted", payload: { reference, requester_email: existing.requesterEmail, recipient: "reviewers" } },
        { requestId: existing.id, kind: "request_confirmation", payload: { reference, requester_email: existing.requesterEmail, recipient: "requester" } },
      ]);
      return { status: 200 as const, body: { request: serialize(updated), notification_queued: true } };
    });
    return response.status(result.status).json(result.body);
  } catch (error) { return next(error); }
});
router.get("/game-requests/:reference", async (request, response, next) => {
  const hash = accessHash(request);
  if (!hash) return response.status(401).json({ error: "A private request access handle is required." });
  try {
    const record = (await db.select().from(gameRequests).where(and(eq(gameRequests.reference, request.params.reference), eq(gameRequests.accessHash, hash))).limit(1))[0];
    if (!record || !record.reference) return response.status(404).json({ error: "Request not found." });
    const events = await db.select().from(gameRequestEvents).where(eq(gameRequestEvents.requestId, record.id)).orderBy(gameRequestEvents.createdAt);
    return response.json({ request: serialize(record, events) });
  } catch (error) { return next(error); }
});
router.get("/game-requests/:reference/sample", async (request, response, next) => {
  const hash = accessHash(request);
  if (!hash) return response.status(401).json({ error: "A private request access handle is required." });
  try {
    const record = (await db.select().from(gameRequests).where(and(eq(gameRequests.reference, request.params.reference), eq(gameRequests.accessHash, hash))).limit(1))[0];
    if (!record?.sampleFilePath) return response.status(404).json({ error: "Sample not found." });
    const file = getPrivateSample(record.sampleFilePath);
    const [exists] = await file.exists();
    if (!exists) return response.status(404).json({ error: "Sample not found." });
    response.type(record.sampleFileType ?? "application/octet-stream");
    response.setHeader("Content-Disposition", `attachment; filename="${(record.sampleFileName ?? "sample").replace(/[^a-zA-Z0-9._-]/g, "_")}"`);
    response.setHeader("Cache-Control", "private, no-store");
    return file.createReadStream().on("error", next).pipe(response);
  } catch (error) { return next(error); }
});

export default router;