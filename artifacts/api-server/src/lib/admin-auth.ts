import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const ADMIN_COOKIE = "bunayn_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

type AdminSession = {
  role: "admin";
  issuedAt: number;
  expiresAt: number;
};

function signingSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be configured for admin authentication.");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function encode(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token?: string): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    return session.role === "admin" && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function issueAdminSession(response: Response) {
  const now = Date.now();
  const token = encode({ role: "admin", issuedAt: now, expiresAt: now + SESSION_DURATION_MS });
  response.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_MS,
    path: "/",
  });
}

export function clearAdminSession(response: Response) {
  response.clearCookie(ADMIN_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

export function isAdminRequest(request: Request) {
  return decode(request.cookies?.[ADMIN_COOKIE])?.role === "admin";
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  if (!isAdminRequest(request)) {
    response.status(401).json({ error: "Admin authentication is required." });
    return;
  }
  next();
}

export function matchesAdminPassword(password: string) {
  const configuredPassword = process.env.BUNAYN_ADMIN_PASSWORD;
  if (!configuredPassword) throw new Error("BUNAYN_ADMIN_PASSWORD must be configured.");
  const expected = createHash("sha256").update(configuredPassword).digest();
  const received = createHash("sha256").update(password).digest();
  return timingSafeEqual(expected, received);
}