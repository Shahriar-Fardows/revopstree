"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { deletePost, previewMarkdown, savePost } from "../../../actions";
import { FieldError, FormError, SubmitButton } from "../../../_components/ui";
import { slugify } from "@/lib/validation";
import { IDLE_STATE, type Post } from "@/lib/types";

export default function PostEditor({ post }: { post?: Post }) {
  const [state, formAction] = useActionState(savePost, IDLE_STATE);
  const errors = state.ok ? undefined : state.fieldErrors;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [preview, setPreview] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* Auto-fill the slug from the title only while creating, and only until the
     author edits the slug themselves — renaming a published post's URL
     silently would break its inbound links. */
  const [slugTouched, setSlugTouched] = useState(Boolean(post));

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (tab !== "preview") return;
    let cancelled = false;
    setPreviewing(true);
    previewMarkdown(content)
      .then((html) => {
        if (!cancelled) setPreview(html);
      })
      .finally(() => {
        if (!cancelled) setPreviewing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, content]);

  const ids = useId();

  return (
    <form action={formAction} noValidate>
      {post && <input type="hidden" name="postId" value={post.id} />}

      <FormError message={state.ok ? undefined : state.formError} />

      <div className="a-editor">
        <div>
          <div className="a-field">
            <label className="a-label" htmlFor={`${ids}-title`}>
              Title
            </label>
            <input
              className="a-input"
              id={`${ids}-title`}
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
              aria-invalid={Boolean(errors?.title)}
              aria-describedby={errors?.title ? `${ids}-title-error` : undefined}
            />
            <FieldError id={`${ids}-title-error`} message={errors?.title} />
          </div>

          <div className="a-tabs" role="tablist" aria-label="Editor mode">
            <button
              className="a-tab"
              type="button"
              role="tab"
              aria-selected={tab === "write"}
              onClick={() => setTab("write")}
            >
              Write
            </button>
            <button
              className="a-tab"
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </div>

          {/* The textarea stays mounted so its value is always submitted,
              even while the preview tab is showing. */}
          <div hidden={tab !== "write"}>
            <label className="a-label" htmlFor={`${ids}-content`}>
              Content — Markdown
            </label>
            <textarea
              className="a-textarea"
              id={`${ids}-content`}
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={22}
              style={{ minHeight: 420 }}
              required
              aria-invalid={Boolean(errors?.content)}
              aria-describedby={errors?.content ? `${ids}-content-error` : undefined}
            />
            <FieldError id={`${ids}-content-error`} message={errors?.content} />
            <p className="a-help">
              Markdown supported: ## headings, **bold**, links, lists, tables and code blocks.
            </p>
          </div>

          {tab === "preview" && (
            <div className="a-preview">
              {previewing && !preview ? (
                <p className="a-help">Rendering…</p>
              ) : preview ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <p className="a-help">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        <aside className="a-editor-side">
          <div className="a-field">
            <label className="a-label" htmlFor={`${ids}-slug`}>
              URL slug
            </label>
            <input
              className="a-input"
              id={`${ids}-slug`}
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              maxLength={120}
              required
              aria-invalid={Boolean(errors?.slug)}
              aria-describedby={errors?.slug ? `${ids}-slug-error` : `${ids}-slug-help`}
            />
            <FieldError id={`${ids}-slug-error`} message={errors?.slug} />
            {!errors?.slug && (
              <p className="a-help" id={`${ids}-slug-help`}>
                /blog/{slug || "your-post"}
              </p>
            )}
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor={`${ids}-excerpt`}>
              Excerpt
            </label>
            <textarea
              className="a-textarea"
              id={`${ids}-excerpt`}
              name="excerpt"
              defaultValue={post?.excerpt ?? ""}
              rows={3}
              maxLength={300}
              style={{ fontFamily: "inherit", fontSize: 14 }}
              aria-invalid={Boolean(errors?.excerpt)}
              aria-describedby={errors?.excerpt ? `${ids}-excerpt-error` : `${ids}-excerpt-help`}
            />
            <FieldError id={`${ids}-excerpt-error`} message={errors?.excerpt} />
            {!errors?.excerpt && (
              <p className="a-help" id={`${ids}-excerpt-help`}>
                Shown on the blog index and as the meta description.
              </p>
            )}
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor={`${ids}-cover`}>
              Cover image URL
            </label>
            <input
              className="a-input"
              id={`${ids}-cover`}
              name="coverImage"
              type="url"
              defaultValue={post?.coverImage ?? ""}
              placeholder="https://…"
              aria-invalid={Boolean(errors?.coverImage)}
              aria-describedby={errors?.coverImage ? `${ids}-cover-error` : undefined}
            />
            <FieldError id={`${ids}-cover-error`} message={errors?.coverImage} />
          </div>

          <div className="a-field">
            <label className="a-label" htmlFor={`${ids}-tags`}>
              Tags
            </label>
            <input
              className="a-input"
              id={`${ids}-tags`}
              name="tags"
              defaultValue={post?.tags.join(", ") ?? ""}
              placeholder="automation, crm"
              aria-describedby={`${ids}-tags-help`}
            />
            <p className="a-help" id={`${ids}-tags-help`}>
              Comma separated, up to 10.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <SubmitButton name="intent" value="draft" variant="secondary" pendingLabel="Saving…">
              Save draft
            </SubmitButton>
            <SubmitButton name="intent" value="publish" pendingLabel="Publishing…">
              {post?.status === "published" ? "Update post" : "Publish post"}
            </SubmitButton>
          </div>

          <p className="a-help" style={{ marginTop: 10 }}>
            {post?.status === "published"
              ? "This post is live. Saving as draft removes it from the blog."
              : "Drafts are only visible here."}
          </p>
        </aside>
      </div>

      {post && (
        <>
          <h2 className="a-section-title">Danger zone</h2>
          <div className="a-panel">
            {confirmDelete ? (
              <>
                <p style={{ margin: "0 0 12px", fontSize: 14 }}>
                  Delete <strong>{post.title}</strong> permanently? This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="a-btn a-btn-danger"
                    type="submit"
                    formAction={deletePost}
                    formNoValidate
                  >
                    <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                    Delete permanently
                  </button>
                  <button
                    className="a-btn a-btn-secondary"
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Keep it
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <p style={{ margin: 0, fontSize: 14, color: "var(--a-text-2)" }}>
                  Remove this post and its URL from the site.
                </p>
                <button
                  className="a-btn a-btn-secondary"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                  Delete post
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <p style={{ marginTop: 24 }}>
        <Link className="a-btn a-btn-ghost" href="/admin/posts">
          Back to posts
        </Link>
      </p>
    </form>
  );
}
