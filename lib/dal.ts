import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { ObjectId, type Filter } from "mongodb";
import { postCollection, staffCollection } from "./db";
import { readSession } from "./session";
import type { Post, PostDoc, SessionPayload, Staff, StaffDoc } from "./types";

/* Every field except passwordHash. Applied to all staff reads so the hash
   cannot leak into a Server Action return value or a component prop. The one
   deliberate exception is findStaffForLogin below. */
const STAFF_SAFE_PROJECTION = {
  name: 1,
  email: 1,
  role: 1,
  status: 1,
  createdAt: 1,
  lastLoginAt: 1,
} as const;

function toStaff(doc: Omit<StaffDoc, "passwordHash">): Staff {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
    lastLoginAt: doc.lastLoginAt,
  };
}

function toPost(doc: PostDoc): Post {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: doc.coverImage,
    tags: doc.tags ?? [],
    status: doc.status,
    authorId: doc.authorId.toString(),
    authorName: doc.authorName,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** URL params are untrusted — an invalid id must 404, not throw. */
export function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/* ------------------------------------------------------------------ *
 * Session / authorisation
 * ------------------------------------------------------------------ */

/** Verifies the cookie. Redirects to login when there is no valid session. */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  return session;
});

/* Re-reads the staff record on every request rather than trusting the JWT
   alone. Costs one indexed lookup, and means disabling an account takes
   effect on their next navigation instead of when the token expires. */
export const getCurrentStaff = cache(async (): Promise<Staff> => {
  const session = await verifySession();
  const id = toObjectId(session.staffId);
  if (!id) redirect("/admin/login");

  const collection = await staffCollection();
  const doc = await collection.findOne({ _id: id }, { projection: STAFF_SAFE_PROJECTION });

  if (!doc || doc.status !== "active") redirect("/admin/login?reason=inactive");
  return toStaff(doc as Omit<StaffDoc, "passwordHash">);
});

/** Returns null for non-admins so the caller can render a 403 (FR-2.3). */
export async function requireAdmin(): Promise<Staff | null> {
  const staff = await getCurrentStaff();
  return staff.role === "admin" ? staff : null;
}

/* ------------------------------------------------------------------ *
 * Staff
 * ------------------------------------------------------------------ */

/** The only query that selects passwordHash. Used by the login action alone. */
export async function findStaffForLogin(email: string): Promise<StaffDoc | null> {
  const collection = await staffCollection();
  return collection.findOne({ email: email.toLowerCase().trim() });
}

export async function listStaff(): Promise<Staff[]> {
  const collection = await staffCollection();
  const docs = await collection
    .find({}, { projection: STAFF_SAFE_PROJECTION })
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map((d) => toStaff(d as Omit<StaffDoc, "passwordHash">));
}

/** Guards FR-2.6 — the system must always keep one active admin. */
export async function countActiveAdmins(): Promise<number> {
  const collection = await staffCollection();
  return collection.countDocuments({ role: "admin", status: "active" });
}

/* ------------------------------------------------------------------ *
 * Posts — admin reads (session required)
 * ------------------------------------------------------------------ */

export async function listPostsForAdmin(status?: "draft" | "published"): Promise<Post[]> {
  await verifySession();
  const collection = await postCollection();
  const filter: Filter<PostDoc> = status ? { status } : {};
  const docs = await collection.find(filter).sort({ updatedAt: -1 }).toArray();
  return docs.map(toPost);
}

export async function getPostForAdmin(id: string): Promise<Post | null> {
  await verifySession();
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const collection = await postCollection();
  const doc = await collection.findOne({ _id: objectId });
  return doc ? toPost(doc) : null;
}

export async function countPosts(): Promise<{ total: number; published: number; draft: number }> {
  await verifySession();
  const collection = await postCollection();
  const [total, published] = await Promise.all([
    collection.countDocuments({}),
    collection.countDocuments({ status: "published" }),
  ]);
  return { total, published, draft: total - published };
}

/* ------------------------------------------------------------------ *
 * Posts — public reads
 *
 * These are separate functions rather than a `status` parameter on the admin
 * queries on purpose: there is no argument a caller can pass that would leak
 * a draft onto the public site (FR-3.5).
 * ------------------------------------------------------------------ */

export async function getPublishedPosts(): Promise<Post[]> {
  const collection = await postCollection();
  const docs = await collection
    .find({ status: "published" })
    .sort({ publishedAt: -1 })
    .toArray();
  return docs.map(toPost);
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const collection = await postCollection();
  const doc = await collection.findOne({ slug, status: "published" });
  return doc ? toPost(doc) : null;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const collection = await postCollection();
  const docs = await collection
    .find({ status: "published" }, { projection: { slug: 1 } })
    .toArray();
  return docs.map((d) => d.slug);
}
