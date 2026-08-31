import MotionLoader from "./motion-loader";

const services = [
  { n: "01", symbol: "⌘", title: "Elite CRM Architecture", text: "A complete lead journey from opt-in to closed-won — built, migrated, and optimized inside your CRM.", tags: ["CRM migration", "Sales pipelines", "Booking systems"] },
  { n: "02", symbol: "✦", title: "AI Booking Agents", text: "Voice and chat agents qualify prospects and fill your calendar around the clock — even from social comments.", tags: ["AI receptionists", "Lead qualification", "24/7 booking"] },
  { n: "03", symbol: "◉", title: "Content & Social Engine", text: "Build weeks of consistent content once, then let automated workflows publish it everywhere.", tags: ["Smart scheduling", "Multi-channel", "Zero manual posting"] },
  { n: "04", symbol: "↗", title: "Real-Time ROI Dashboards", text: "See booking rate, close rate, speed-to-lead, campaign performance, and revenue in one live command center.", tags: ["Live attribution", "Creative insights", "Funnel health"] },
  { n: "05", symbol: "✉", title: "Email Automation", text: "Personalized, trigger-based campaigns that adapt to audience behavior and keep your brand relevant.", tags: ["Smart segments", "Dynamic content", "Behavior tracking"] },
  { n: "06", symbol: "▱", title: "Landing Page Systems", text: "Launch fast, mobile-first conversion pages with integrated forms and clean CRM handoffs.", tags: ["Rapid builds", "Responsive", "Form integration"] },
  { n: "07", symbol: "◌", title: "SMS Messaging", text: "Turn text into a two-way revenue channel with timely reminders, promotions, and updates.", tags: ["Scheduled SMS", "Two-way chat", "Delivery insights"] },
  { n: "08", symbol: "⌗", title: "Website Development", text: "Fast, responsive, conversion-focused websites — from marketing sites to custom stores and web apps — engineered to turn traffic into qualified opportunities.", tags: ["Next.js & WordPress", "Shopify stores", "CMS & SaaS builds"] },
];

const posts = [
  {
    slug: "speed-to-lead-gohighlevel-zapier",
    image: "/blog/crm-automation.jpg",
    tag: "CRM Automation",
    date: "Aug 28, 2026",
    readTime: "5 min read",
    title: "How to Fix Speed-to-Lead Leakage in GoHighLevel & Zapier",
    text: "Discover the 3 invisible pipeline gaps costing agencies qualified bookings — and how automated instant AI routing resolves them.",
    author: "Shahriar Rahman",
    role: "RevOps Lead",
  },
  {
    slug: "ai-voice-chat-qualification-engine",
    image: "/blog/ai-qualification.jpg",
    tag: "AI Receptionists",
    date: "Aug 22, 2026",
    readTime: "7 min read",
    title: "Building a 24/7 AI Voice & Chat Qualification Engine",
    text: "A step-by-step guide to connecting n8n, OpenAI, and calendar systems to qualify leads in under 60 seconds without manual intervention.",
    author: "Tech Team",
    role: "AI Solutions",
  },
  {
    slug: "revenue-attribution-ad-tracking-flaws",
    image: "/blog/revenue-attribution.jpg",
    tag: "Revenue Attribution",
    date: "Aug 15, 2026",
    readTime: "4 min read",
    title: "Why Your Ads Look Profitable But Your Bank Account Disagrees",
    text: "Uncover common attribution tracking flaws across Meta, Google Ads, and CRM data silos — and how to build live ROI command centers.",
    author: "Analytics Desk",
    role: "RevOpsTree",
  },
];

const Arrow = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Check = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function Home() {
  return (
    <main>
      <MotionLoader />
      <section className="hero" id="home">
        <nav className="nav shell">
          <a className="brand" href="#home" aria-label="RevopsTree home">
            <span className="brand-mark"><i /><i /><i /></span>
            <span>REVOPS<span>TREE</span></span>
          </a>
          <div className="nav-links">
            <a href="#services">Services</a><a href="#engine">The Engine</a><a href="#case-studies">Case Studies</a><a href="#process">Process</a><a href="#blog">Blog</a>
          </div>
          <a className="button button-small" href="#contact">Free Systems Audit <Arrow /></a>
          <button className="nav-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><i /><i /><i /></button>
        </nav>

        <div className="menu-backdrop" aria-hidden="true" />
        <aside className="mobile-menu" id="mobile-menu" aria-hidden="true">
          <button className="menu-close" type="button" aria-label="Close menu"><i /><i /></button>
          <small className="menu-label">MENU</small>
          <nav className="menu-links">
            <a href="#services">Services</a><a href="#engine">The Engine</a><a href="#case-studies">Case Studies</a><a href="#process">Process</a><a href="#blog">Blog</a>
          </nav>
          <a className="button" href="#contact">Free Systems Audit <Arrow /></a>
        </aside>

        <div className="hero-grid shell">
          <div className="hero-copy">
            <h1><span>Stop fighting your tech stack. </span><em>Automate your revenue.</em></h1>
            <p className="hero-lead">We design, migrate, and automate your entire business backend — connecting every tool so you can focus on scaling, not troubleshooting.</p>
            <div className="hero-actions">
              <a className="button" href="#contact">Claim your free revenue leak audit <Arrow /></a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Autonomous revenue operations dashboard illustration">
            <div className="visual-grid" />
            <div className="system-badge">SYSTEM ONLINE <i /></div>
            <div className="dashboard">
              <div className="dash-head"><span><b>Revenue</b> / Command Center</span><span className="live"><i /> LIVE</span></div>
              <div className="dash-kpis">
                <div><small>PIPELINE VALUE</small><strong>$284,650</strong><span>↗ 24.8%</span></div>
                <div><small>LEADS CAPTURED</small><strong>1,248</strong><span>↗ 18.2%</span></div>
                <div><small>SPEED TO LEAD</small><strong>00:40</strong><span>92% faster</span></div>
              </div>
              <div className="chart-wrap"><div className="chart-title"><b>Revenue attribution</b><small>LAST 30 DAYS</small></div><div className="bars">{[28,39,32,53,46,69,61,88,78,96,84,108].map((h,i)=><i key={i} style={{height:h}} />)}</div></div>
            </div>
            <div className="float-stat"><span>QUALIFIED LEAD</span><strong>+1 booked</strong><small>JUST NOW</small></div>
          </div>
        </div>
        <div className="trust shell">{["GoHighLevel","HubSpot","Clay","Zapier","Make"].map(x=><b key={x}>{x}</b>)}</div>
      </section>

      <section className="pain section shell">
        <div className="section-top"><div><h2>Growth isn&apos;t the problem.<br/><em>Operational leaks are.</em></h2></div></div>
        <div className="pain-grid">
          <article><span className="pain-icon">⌁</span><small>LEAK 01</small><h3>Disconnected data silos</h3><p>You&apos;re using 5+ tools that don&apos;t talk. Leads disappear between tabs, sheets, and handoffs.</p><div className="leak-line"><i/><i/><i/><i/></div></article>
          <article><span className="pain-icon">◷</span><small>LEAK 02</small><h3>Manual lead chaos</h3><p>Your team takes hours to respond. After five minutes of silence, a lead is already 10× less likely to close.</p><div className="response"><b>04:00:00</b><span>AVG RESPONSE</span></div></article>
          <article><span className="pain-icon">◎</span><small>LEAK 03</small><h3>Flying completely blind</h3><p>You can&apos;t see which ad drove revenue. Tracking is fragmented, attribution is guesswork, and budget gets wasted.</p><div className="mini-metrics"><span>ROAS <b>?</b></span><span>CAC <b>?</b></span><span>ROI <b>?</b></span></div></article>
        </div>
      </section>

      <section className="engine section" id="engine">
        <div className="shell engine-grid">
          <div><h2>Infrastructure that keeps <em>working</em><br/>while you sleep.</h2><p>Not another CRM setup. A living system that captures, qualifies, books, nurtures, and reports — 24/7.</p><ul>{["Every lead captured and attributed","AI qualification in under 60 seconds","Appointments booked automatically","Live revenue intelligence"].map(x=><li key={x}><Check />{x}</li>)}</ul><a className="button" href="#contact">Build my revenue engine <Arrow /></a></div>
          <div className="engine-map">
            <div className="map-core"><span>REVOPS</span><strong>AUTONOMOUS<br/>ENGINE</strong><i /></div>
            {[['01','CAPTURE','Meta • Google'],['02','ORCHESTRATE','n8n • API'],['03','QUALIFY','AI Voice • Chat'],['04','CONVERT','GHL • Calendar'],['05','OPTIMIZE','Live ROI Data']].map((x,i)=><div className={`map-node node-${i+1}`} key={x[1]}><small>{x[0]}</small><b>{x[1]}</b><span>{x[2]}</span></div>)}
          </div>
        </div>
      </section>

      <section className="services section shell" id="services">
        <div className="section-top"><div><span className="kicker">DEPARTMENTS AS A SERVICE</span><h2>Your invisible<br/><em>technical advantage.</em></h2></div><p>Senior-level revenue infrastructure without the full-time overhead. Every system is designed around an outcome — not a tool.</p></div>
        <div className="service-grid">{services.map(s=><article key={s.n}><small>{s.n} / 08</small><div className="service-symbol">{s.symbol}</div><h3>{s.title}</h3><p>{s.text}</p><div className="tags">{s.tags.map(t=><span key={t}>{t}</span>)}</div></article>)}</div>
      </section>

      <section className="cases section shell" id="case-studies">
        <span className="kicker">PROOF, NOT PROMISES</span><h2>Systems that changed<br/><em>the business.</em></h2>
        <div className="case-grid">
          <article className="case-main"><div className="case-copy"><span className="case-label">FEATURED CASE STUDY / API INTEGRATION</span><h3>From four-hour follow-up to a qualified lead in 40 seconds.</h3><p>A high-volume US agency was losing prospects across disconnected apps. We built a unified GHL + n8n lead engine with instant AI qualification.</p><div className="case-results"><span><strong>99.7%</strong>FASTER RESPONSE</span><span><strong>100%</strong>LEADS ATTRIBUTED</span></div><a href="#contact">Explore the system <Arrow /></a></div><div className="case-graphic"><div className="phone"><div className="phone-top"/><div className="message one">New lead captured <small>00:00</small></div><div className="message two">AI qualification sent <small>00:12</small></div><div className="message three">Call booked ✓ <small>00:40</small></div></div></div></article>
          <article className="case-side"><span className="case-label">AI TRANSCRIPTION BRIDGE</span><h3>Bypassing the $150/month CallRail tier.</h3><p>A custom Zapier + Gemini bridge fetched, transcribed, and tagged every call automatically.</p><div><strong>$1,200</strong><span>ANNUAL SAVINGS</span></div><div><strong>100%</strong><span>ATTRIBUTION ACCURACY</span></div></article>
        </div>
      </section>

      <section className="process section" id="process"><div className="shell"><div className="section-top"><div><span className="kicker light">30 DAYS TO LAUNCH</span><h2>From tech chaos to<br/><em>revenue clarity.</em></h2></div></div><div className="steps">{[['01','DAYS 01—07','Systems Audit','We find every leak and map your ideal data flow.'],['02','DAYS 08—25','Architecture Build','We customize GHL, engineer workflows, and install your AI agents.'],['03','DAYS 26—30','Launch & Optimize','Systems go live with full tracking, SOPs, and reporting.']].map((x,i)=><article key={x[0]}><span>{x[0]}</span><small>{x[1]}</small><h3>{x[2]}</h3><p>{x[3]}</p>{i<2&&<i>→</i>}</article>)}</div></div></section>

      <section className="blog section shell" id="blog">
        <div className="section-top">
          <div>
            <span className="kicker">INSIGHTS & BLUEPRINTS</span>
            <h2>Latest revenue<br/><em>engineering insights.</em></h2>
          </div>
          <p>Actionable breakdowns, automation blueprints, and CRM strategies for fast-growing teams.</p>
        </div>
        <div className="blog-grid">
          {posts.map(p => (
            <article key={p.slug} className="blog-card">
              <div className="blog-img-wrap">
                <img src={p.image} alt={p.title} loading="lazy" />
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-tag">{p.tag}</span>
                  <span className="blog-time">{p.date} • {p.readTime}</span>
                </div>
                <h3><a href={`#blog-${p.slug}`}>{p.title}</a></h3>
                <p>{p.text}</p>
                <div className="blog-footer">
                  <div className="blog-author">
                    <strong>{p.author}</strong>
                    <small>{p.role}</small>
                  </div>
                  <a href={`#blog-${p.slug}`} className="blog-link">Read article <Arrow /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta section" id="contact"><div className="cta-orbit"><i/><i/><i/></div><div className="shell"><span className="kicker light">YOUR NEXT SYSTEM STARTS HERE</span><h2>Ready to turn your agency<br/>into a <em>revenue machine?</em></h2><p>Book a free Revenue Leak Audit. We&apos;ll map the bottlenecks in your stack and show you exactly what to automate first.</p><div className="promise"><strong>30 DAYS</strong><span />TO A ZERO-LEAKAGE REVENUE ENGINE</div><a className="button button-white" href="mailto:hello@revopstree.com">Book Free Call <Arrow /></a><small>NO PITCH. JUST A CLEAR TECHNICAL ROADMAP.</small></div></section>

      <footer><div className="shell footer-grid"><div><a className="brand footer-brand" href="#home"><span className="brand-mark"><i/><i/><i/></span><span>REVOPS<span>TREE</span></span></a><p>Your brand. Our tech.<br/>Revenue infrastructure built to scale.</p></div><div><small>EXPLORE</small><a href="#services">Services</a><a href="#engine">The Engine</a><a href="#case-studies">Case Studies</a><a href="#process">Process</a><a href="#blog">Blog</a></div><div><small>CONNECT</small><a href="mailto:hello@revopstree.com">hello@revopstree.com</a><a href="#contact">Book a Call</a></div></div><div className="shell footer-bottom"><span>REVOPSTREE © 2026</span><div><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">A2P 10DLC</a></div></div></footer>
    </main>
  );
}
