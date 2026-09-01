/**
 * Creates the first admin account and the required indexes.
 *
 * Run:
 *   node --env-file=.env.local scripts/seed-admin.mjs "Name" "email@example.com" "password"
 *
 * Safe to run more than once: an existing email is promoted to an active
 * admin with the supplied password rather than duplicated. That also makes
 * this the recovery path if every admin is locked out (phases.md risk table).
 *
 * The hash format here MUST stay identical to lib/password.ts. It is repeated
 * rather than imported because this script runs in plain Node, outside the
 * TypeScript build.
 */
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { MongoClient } from "mongodb";

const scryptAsync = promisify(scrypt);

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const [name, emailRaw, password] = process.argv.slice(2);

if (!name || !emailRaw || !password) {
  console.error(
    'Usage: node --env-file=.env.local scripts/seed-admin.mjs "Name" "email@example.com" "password"',
  );
  process.exit(1);
}

if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const email = emailRaw.toLowerCase().trim();
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "revopstree");
  const staff = db.collection("staff");
  const posts = db.collection("posts");

  await staff.createIndex({ email: 1 }, { unique: true });
  await posts.createIndex({ slug: 1 }, { unique: true });
  await posts.createIndex({ status: 1, publishedAt: -1 });
  await posts.createIndex({ updatedAt: -1 });
  console.log("Indexes ensured.");

  const now = new Date();
  const passwordHash = await hashPassword(password);

  const result = await staff.updateOne(
    { email },
    {
      $set: { name, passwordHash, role: "admin", status: "active", updatedAt: now },
      $setOnInsert: { email, createdAt: now },
    },
    { upsert: true },
  );

  console.log(
    result.upsertedCount > 0
      ? `Created admin ${email}`
      : `Updated existing account ${email} to an active admin with the new password`,
  );
  console.log("Sign in at /admin/login");
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
