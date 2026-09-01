import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/dal";
import { readingMinutes } from "@/lib/markdown";
import { BlogFooter, BlogHeader } from "./_components/BlogChrome";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | RevopsTree",
  description:
    "Notes on revenue operations, CRM architecture, AI booking agents and marketing automation for agencies.",
  alternates: { canonical: "/blog" },
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <BlogHeader />

      <main>
        <div className="shell">
          <div className="b-head">
            <h1>
              Notes from the <em>engine room.</em>
            </h1>
            <p>
              What we learn building revenue infrastructure — CRM architecture, automation, and the
              operational leaks that quietly cost agencies money.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="b-empty">
              <h2>Nothing published yet</h2>
              <p>The first post is on its way. Check back shortly.</p>
            </div>
          ) : (
            <div className="b-list">
              {posts.map((post) => (
                <article className="b-item" key={post.id}>
                  <div className="b-item-meta">
                    {post.publishedAt ? dateFormat.format(post.publishedAt) : null}
                    <br />
                    {readingMinutes(post.content)} min read
                  </div>

                  <div>
                    <h2>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    {post.tags.length > 0 && (
                      <div className="b-tags">
                        {post.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <BlogFooter />
    </>
  );
}
