import Link from "next/link";
import { ExternalLink, FileText, PencilLine, Plus } from "lucide-react";
import { listPostsForAdmin } from "@/lib/dal";
import StatusBadge from "../../_components/StatusBadge";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
] as const;

export default async function PostsPage(props: PageProps<"/admin/posts">) {
  const { status } = await props.searchParams;
  const active = status === "published" || status === "draft" ? status : "all";
  const posts = await listPostsForAdmin(active === "all" ? undefined : active);

  return (
    <div className="a-page">
      <header className="a-page-head">
        <div>
          <span className="a-eyebrow">Content</span>
          <h1 className="a-title">Posts</h1>
          <p className="a-desc">
            Drafts stay private. Publishing puts a post on the public blog immediately.
          </p>
        </div>
        <div className="a-head-actions">
          <Link className="a-btn a-btn-primary" href="/admin/posts/new">
            <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
            New post
          </Link>
        </div>
      </header>

      <div className="a-toolbar">
        {FILTERS.map((filter) => (
          <Link
            key={filter.key}
            className="a-filter"
            href={filter.key === "all" ? "/admin/posts" : `/admin/posts?status=${filter.key}`}
            aria-current={active === filter.key}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="a-empty">
          <FileText size={20} strokeWidth={1.5} aria-hidden="true" />
          <h3>{active === "all" ? "No posts yet" : `No ${active} posts`}</h3>
          <p>
            {active === "all"
              ? "Write your first post and it will appear on the public blog once published."
              : "Try a different filter, or write a new post."}
          </p>
          <Link className="a-btn a-btn-primary" href="/admin/posts/new">
            <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
            New post
          </Link>
        </div>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Author</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td data-label="Title">
                    <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={post.status} />
                  </td>
                  <td data-label="Author">{post.authorName}</td>
                  <td data-label="Updated" className="a-cell-meta">
                    {dateFormat.format(post.updatedAt)}
                  </td>
                  <td data-label="Actions">
                    <div className="a-row-actions">
                      {post.status === "published" && (
                        <Link
                          className="a-btn a-btn-ghost a-btn-sm"
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
                          View
                        </Link>
                      )}
                      <Link className="a-btn a-btn-ghost a-btn-sm" href={`/admin/posts/${post.id}`}>
                        <PencilLine size={14} strokeWidth={1.75} aria-hidden="true" />
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
