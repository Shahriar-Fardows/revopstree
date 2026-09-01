import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/dal";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { BlogFooter, BlogHeader } from "../_components/BlogChrome";
import "../blog.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/* Deliberately no generateStaticParams: it would make `next build` require a
   reachable database, and posts are published long after build time anyway.
   Pages render on demand and savePost calls revalidatePath to refresh them. */

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) return { title: "Post not found | RevopsTree" };

  return {
    title: `${post.title} | RevopsTree`,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;

  /* Queries the published-only accessor, so a draft can never be reached by
     guessing its URL (FR-3.5). */
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: "RevopsTree" },
    image: post.coverImage || undefined,
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
  };

  return (
    <>
      <BlogHeader />

      <main>
        <article className="b-article">
          <div className="shell">
            <div className="b-article-head">
              <Link className="b-back" href="/blog">
                ← All posts
              </Link>
              <h1>{post.title}</h1>
              <div className="b-byline">
                <span>{post.authorName}</span>
                <i aria-hidden="true" />
                {post.publishedAt && (
                  <>
                    <time dateTime={post.publishedAt.toISOString()}>
                      {dateFormat.format(post.publishedAt)}
                    </time>
                    <i aria-hidden="true" />
                  </>
                )}
                <span>{readingMinutes(post.content)} min read</span>
              </div>
            </div>

            {post.coverImage && (
              /* Author-supplied external URL, so next/image's domain
                 allow-list cannot cover it — a plain img is correct here. */
              // eslint-disable-next-line @next/next/no-img-element
              <img className="b-cover" src={post.coverImage} alt="" />
            )}

            {/* Sanitised in lib/markdown.ts against an explicit tag
                allow-list before it ever reaches this point. */}
            <div className="b-body" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="b-foot">
              <Link className="b-back" href="/blog" style={{ marginBottom: 0 }}>
                ← All posts
              </Link>
            </div>
          </div>
        </article>
      </main>

      <BlogFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
