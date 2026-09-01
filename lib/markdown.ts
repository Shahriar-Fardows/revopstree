import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/* Markdown is written by authenticated staff, but "trusted author" is not a
   security model — a compromised or careless account must not be able to
   inject script into every reader's browser (FR-3.10). Everything marked
   produces is filtered through an allow-list before it reaches the page. */
const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "blockquote", "ul", "ol", "li",
  "strong", "em", "code", "pre", "a", "img", "hr", "br",
  "table", "thead", "tbody", "tr", "th", "td",
];

export async function renderMarkdown(source: string): Promise<string> {
  const raw = await marked.parse(source, { gfm: true, breaks: false });

  return sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "loading", "width", "height"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // Outbound links from author content are untrusted destinations.
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}

/** Rough reading time for the post header. */
export function readingMinutes(source: string): number {
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
