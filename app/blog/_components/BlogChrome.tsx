import Link from "next/link";

/* Header and footer for the blog surface. Reuses the marketing brand and
   button classes from globals.css so the two surfaces read as one site, but
   keeps its own nav element (see the note at the top of blog.css). */

export function BlogHeader() {
  return (
    <header className="b-nav">
      <div
        className="shell"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}
      >
        <Link className="brand" href="/" aria-label="RevopsTree home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            REVOPS<span>TREE</span>
          </span>
        </Link>

        <nav className="b-nav-links" aria-label="Primary">
          <Link href="/#services">Services</Link>
          <Link href="/blog">Blog</Link>
          <Link className="button button-small" href="/#contact">
            Free Systems Audit
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function BlogFooter() {
  return (
    <footer style={{ background: "#050d18", color: "#dce8f7", padding: "54px 0 30px" }}>
      <div className="shell">
        <Link className="brand" href="/" aria-label="RevopsTree home">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            REVOPS<span>TREE</span>
          </span>
        </Link>
        <p style={{ color: "#7589a4", lineHeight: 1.6, margin: "18px 0 30px" }}>
          Your brand. Our tech.
          <br />
          Revenue infrastructure built to scale.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            paddingTop: 20,
            borderTop: "1px solid #ffffff13",
            font: "8px var(--font-mono), monospace",
            letterSpacing: ".08em",
            color: "#6a7d97",
          }}
        >
          <span>REVOPSTREE © 2026</span>
          <Link href="/">Back to site</Link>
        </div>
      </div>
    </footer>
  );
}
