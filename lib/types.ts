import type { ObjectId } from "mongodb";

export type StaffRole = "admin" | "editor";
export type StaffStatus = "active" | "disabled";
export type PostStatus = "draft" | "published";

/* ------------------------------------------------------------------ *
 * MongoDB document shapes. Server-only — these never cross to the
 * client, because ObjectId is not serialisable across the RSC boundary.
 * ------------------------------------------------------------------ */

export type StaffDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  /** scrypt$N$salt$hash — never selected into a client-bound shape. */
  passwordHash: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
};

export type PostDoc = {
  _id: ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  /** Markdown source. Rendered + sanitised at read time. */
  content: string;
  coverImage?: string;
  tags: string[];
  status: PostStatus;
  authorId: ObjectId;
  /** Denormalised so a disabled or renamed author keeps their byline. */
  authorName: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/* ------------------------------------------------------------------ *
 * Client-safe shapes. The DAL converts every ObjectId to a string
 * before returning, so these can be passed straight into components.
 * ------------------------------------------------------------------ */

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: Date;
  lastLoginAt?: Date;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: PostStatus;
  authorId: string;
  authorName: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** Session payload. Deliberately minimal — no name, email or hash (FR-1.6). */
export type SessionPayload = {
  staffId: string;
  role: StaffRole;
  expiresAt: Date;
};

/* ------------------------------------------------------------------ *
 * The single return shape for every Server Action (rules.md).
 * ------------------------------------------------------------------ */

export type ActionState =
  | { ok: true }
  | {
      ok: false;
      formError?: string;
      fieldErrors?: Record<string, string>;
    };

export const IDLE_STATE: ActionState = { ok: true };
