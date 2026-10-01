import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import type { PostDoc, StaffDoc } from "./types";

/* Everything here resolves lazily, on the first query.

   `next build` imports every route module to work out which routes are
   static, so anything thrown while this module is being evaluated fails the
   whole build. A deployment should be able to build without database
   credentials present and fail loudly at request time instead. */

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Locally: copy .env.example to .env.local. " +
        "In production: add it to the deployment's environment variables.",
    );
  }

  /* In dev the module graph is re-evaluated on every hot reload. Without a
     global cache each reload opens a fresh connection pool and the server
     runs out of connections within minutes. */
  if (process.env.NODE_ENV === "development") {
    global._mongoClientPromise ??= new MongoClient(uri).connect();
    return global._mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

let clientPromise: Promise<MongoClient> | undefined;

export async function getDb(): Promise<Db> {
  clientPromise ??= connect();
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB ?? "revopstree");
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
