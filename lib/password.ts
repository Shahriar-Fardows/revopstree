import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

/* scrypt parameters. N is the CPU/memory cost; 16384 needs 128*N*r = 16MB,
   which sits under Node's 32MB maxmem default. Stored alongside the hash so
   these can be raised later without invalidating existing passwords. */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** Format: scrypt$N$r$p$saltHex$hashHex */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  const params = { N: Number(nRaw), r: Number(rRaw), p: Number(pRaw) };
  if (!Number.isFinite(params.N) || !Number.isFinite(params.r) || !Number.isFinite(params.p)) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length, params);

  // timingSafeEqual throws on length mismatch, so guard first.
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/* Burns roughly the same time as a real verify. Called when the email does
   not exist, so "no such user" and "wrong password" take the same wall time
   and the login form cannot be used to enumerate accounts (FR-1.4). */
const DUMMY_HASH =
  "scrypt$16384$8$1$" +
  "00000000000000000000000000000000$" +
  "0".repeat(KEY_LENGTH * 2);

export async function burnPasswordTime(password: string): Promise<void> {
  await verifyPassword(password, DUMMY_HASH);
}
