import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import type { PostDoc, StaffDoc } from "./types";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "revopstree";

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB Atlas connection string.",
  );
}

/* In dev the module graph is re-evaluated on every hot reload. Without a
   global cache each reload opens a fresh connection pool and Atlas runs out
   of connections within minutes. In production the module is evaluated once,
   so the plain client is enough. */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function staffCollection(): Promise<Collection<StaffDoc>> {
  return (await getDb()).collection<StaffDoc>("staff");
}

export async function postCollection(): Promise<Collection<PostDoc>> {
  return (await getDb()).collection<PostDoc>("posts");
}

/** Idempotent — safe to call repeatedly. Invoked by scripts/seed-admin.mjs. */
export async function ensureIndexes(): Promise<void> {
  const staff = await staffCollection();
  const posts = await postCollection();

  await staff.createIndex({ email: 1 }, { unique: true });
  await posts.createIndex({ slug: 1 }, { unique: true });
  await posts.createIndex({ status: 1, publishedAt: -1 });
  await posts.createIndex({ updatedAt: -1 });
}
