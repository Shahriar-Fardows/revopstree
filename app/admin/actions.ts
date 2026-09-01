"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { postCollection, staffCollection } from "@/lib/db";
import {
  countActiveAdmins,
  findStaffForLogin,
  getCurrentStaff,
  toObjectId,
  verifySession,
} from "@/lib/dal";
import { renderMarkdown } from "@/lib/markdown";
import { burnPasswordTime, hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import {
  loginSchema,
  parseTags,
  postSchema,
  staffSchema,
  staffUpdateSchema,
  toFieldErrors,
} from "@/lib/validation";
import type { ActionState } from "@/lib/types";

/* Every action below re-checks authentication itself. A Server Action is a
   public POST endpoint — hiding its trigger in the UI is not a boundary
   (rules.md, Security Rule 1). */

const GENERIC_LOGIN_ERROR = "Invalid email or password";

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

/* ------------------------------------------------------------------ *
 * Auth
 * ------------------------------------------------------------------ */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;
  const staff = await findStaffForLogin(email);

  /* No such account: still spend the time a real verify would, so response
     latency cannot be used to discover which emails exist (FR-1.4). */
  if (!staff) {
    await burnPasswordTime(password);
    return { ok: false, formError: GENERIC_LOGIN_ERROR };
  }

  const passwordOk = await verifyPassword(password, staff.passwordHash);
  if (!passwordOk || staff.status !== "active") {
    return { ok: false, formError: GENERIC_LOGIN_ERROR };
  }

  await createSession(staff._id.toString(), staff.role);

  const collection = await staffCollection();
  await collection.updateOne({ _id: staff._id }, { $set: { lastLoginAt: new Date() } });

  redirect("/admin");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ *
 * Posts
 * ------------------------------------------------------------------ */

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await verifySession();
  const staff = await getCurrentStaff();

  const intent = formData.get("intent");
  const postId = String(formData.get("postId") ?? "");

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage") ?? "",
    tags: formData.get("tags") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  const data = parsed.data;
  // Status comes from which button was pressed, never from a client field.
  const status = intent === "publish" ? "published" : "draft";
  const now = new Date();
  const collection = await postCollection();

  const base = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage || undefined,
    tags: parseTags(data.tags),
    status,
    updatedAt: now,
  } as const;

  try {
    if (postId) {
      const objectId = toObjectId(postId);
      if (!objectId) return { ok: false, formError: "That post no longer exists." };

      const existing = await collection.findOne({ _id: objectId });
      if (!existing) return { ok: false, formError: "That post no longer exists." };

      // publishedAt is stamped once and never moves on re-publish (FR-3.6).
      const publishedAt =
        status === "published" ? (existing.publishedAt ?? now) : existing.publishedAt;

      await collection.updateOne({ _id: objectId }, { $set: { ...base, publishedAt } });
    } else {
      await collection.insertOne({
        _id: new ObjectId(),
        ...base,
        authorId: new ObjectId(staff.id),
        authorName: staff.name,
        publishedAt: status === "published" ? now : undefined,
        createdAt: now,
      });
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return {
        ok: false,
        fieldErrors: { slug: "Another post already uses this slug. Try a different one." },
      };
    }
    console.error("savePost failed", error);
    return { ok: false, formError: "Could not save the post. Check your connection and try again." };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

/* Renders preview HTML through the exact pipeline the public page uses, so
   what the author sees is what readers get. Doing this on the server also
   keeps marked/sanitize-html out of the client bundle. */
export async function previewMarkdown(source: string): Promise<string> {
  await verifySession();
  return renderMarkdown(source);
}

export async function deletePost(formData: FormData): Promise<void> {
  await verifySession();

  const objectId = toObjectId(String(formData.get("postId") ?? ""));
  if (!objectId) redirect("/admin/posts");

  const collection = await postCollection();
  const existing = await collection.findOne({ _id: objectId });
  await collection.deleteOne({ _id: objectId });

  revalidatePath("/blog");
  if (existing) revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

/* ------------------------------------------------------------------ *
 * Staff — admin only
 * ------------------------------------------------------------------ */

export async function createStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const current = await getCurrentStaff();
  if (current.role !== "admin") {
    return { ok: false, formError: "You do not have permission to manage staff." };
  }

  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  const { name, email, role, password } = parsed.data;
  const now = new Date();

  try {
    const collection = await staffCollection();
    await collection.insertOne({
      _id: new ObjectId(),
      name,
      email: email.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      role,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { ok: false, fieldErrors: { email: "Someone already uses this email address." } };
    }
    console.error("createStaff failed", error);
    return { ok: false, formError: "Could not add the staff member. Try again." };
  }

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function updateStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const current = await getCurrentStaff();
  if (current.role !== "admin") {
    return { ok: false, formError: "You do not have permission to manage staff." };
  }

  const parsed = staffUpdateSchema.safeParse({
    staffId: formData.get("staffId"),
    role: formData.get("role"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, formError: "That change is not valid." };
  }

  const { staffId, role, status } = parsed.data;
  const objectId = toObjectId(staffId);
  if (!objectId) return { ok: false, formError: "That account no longer exists." };

  // You cannot demote or disable yourself (FR-2.5).
  if (staffId === current.id && (role !== "admin" || status !== "active")) {
    return { ok: false, formError: "You cannot change your own role or disable your own account." };
  }

  const collection = await staffCollection();
  const target = await collection.findOne({ _id: objectId }, { projection: { role: 1, status: 1 } });
  if (!target) return { ok: false, formError: "That account no longer exists." };

  // Never leave the system without a way back in (FR-2.6).
  const losingAdmin = target.role === "admin" && target.status === "active";
  const staysAdmin = role === "admin" && status === "active";
  if (losingAdmin && !staysAdmin && (await countActiveAdmins()) <= 1) {
    return { ok: false, formError: "This is the last active admin. Promote someone else first." };
  }

  await collection.updateOne(
    { _id: objectId },
    { $set: { role, status, updatedAt: new Date() } },
  );

  revalidatePath("/admin/staff");
  return { ok: true };
}
