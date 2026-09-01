import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload, StaffRole } from "./types";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error(
    "SESSION_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to .env.local.",
  );
}

const encodedKey = new TextEncoder().encode(secret);

export const SESSION_COOKIE = "session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ staffId: payload.staffId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    if (typeof payload.staffId !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "editor") return null;
    return {
      staffId: payload.staffId,
      role: payload.role as StaffRole,
      expiresAt: new Date((payload.exp ?? 0) * 1000),
    };
  } catch {
    // Expired, tampered with, or signed by a rotated secret — all mean "no session".
    return null;
  }
}

export async function createSession(staffId: string, role: StaffRole): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encrypt({ staffId, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return decrypt(token);
}
