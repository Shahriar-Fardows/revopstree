import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { countPosts, getCurrentStaff, listPostsForAdmin } from "@/lib/dal";
import StatusBadge from "../_components/StatusBadge";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function OverviewPage() {
  const [staff, counts, recent] = await Promise.all([
    getCurrentStaff(),
    countPosts(),
    listPostsForAdmin(),
  ]);

  const latest = recent.slice(0, 5);

  return (
    <div className="a-page">
      <header className="a-page-head">
        <div>
          <span className="a-eyebrow">Console</span>
          <h1 className="a-title">
            {staff.name.split(" ")[0]}&rsquo;s workspace
          </h1>
          <p className="a-desc">Write and publish to the RevopsTree blog.</p>
        </div>
        <div className="a-head-actions">
          <Link className="a-btn a-btn-primary" href="/admin/posts/new">
            <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
            New post
          </Link>
        </div>
      </header>

      {/* Counts read straight from the database. No invented metrics,
          no decorative charts (13 §45). */}
      <dl className="a-stats">
        <div className="a-stat">
          <dt>Published</dt>
          <dd>{counts.published}</dd>
        </div>
        <div className="a-stat">
          <dt>Drafts</dt>
          <dd>{counts.draft}</dd>
        </div>
        <div className="a-stat">
          <dt>Total posts</dt>
          <dd>{counts.total}</dd>
        </div>
      </dl>

      <h2 className="a-section-title">Recently edited</h2>

      {latest.length === 0 ? (
        <div className="a-empty">
          <FileText size={20} strokeWidth={1.5} aria-hidden="true" />
          <h3>No posts yet</h3>
          <p>Write your first post and it will appear on the public blog once published.</p>
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
              </tr>
            </thead>
            <tbody>
              {latest.map((post) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
