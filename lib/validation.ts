import { z } from "zod";

/** Lowercase, hyphen-separated, no leading/trailing hyphen. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160, "Keep the title under 160 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Keep the slug under 120 characters")
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().max(300, "Keep the excerpt under 300 characters"),
  content: z.string().trim().min(1, "Write something before saving"),
  coverImage: z.union([z.literal(""), z.url("Enter a valid image URL")]),
  tags: z.string().trim().max(200, "Too many tags"),
});

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Keep the name under 80 characters"),
  email: z.email("Enter a valid email address"),
  role: z.enum(["admin", "editor"]),
  password: z.string().min(10, "Use at least 10 characters"),
});

export const staffUpdateSchema = z.object({
  staffId: z.string().min(1),
  role: z.enum(["admin", "editor"]),
  status: z.enum(["active", "disabled"]),
});

/** Flattens a ZodError into the fieldErrors shape every action returns. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}

export function parseTags(raw: string): string[] {
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 10);
}
