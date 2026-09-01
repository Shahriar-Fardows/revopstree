---
title: RevOpsTree Admin — Design System
product: RevOpsTree
type: Design
status: Draft v1
source: "10 Standards/frontend/13 - Product UI design system (authority 1) — product surface-এ 01/05-এর উপরে; 00 প্রযোজ্য থাকে"
created: 2026-09-01
updated: 2026-09-01
---

# Admin Console — Design System

> **স্কোপ:** `/admin/*`। Public marketing site ও `/blog` **এই ফাইলের আওতায় নয়** — ওগুলো বিদ্যমান `globals.css`-এর ভাষা মেনে চলে।

## Brand Identity

| | |
|---|---|
| নাম | RevOpsTree |
| Logo | তিনটে ঊর্ধ্বমুখী bar, `skewY(-8deg)` — `.brand-mark`। বিদ্যমান markup পুনর্ব্যবহার, নতুন করে আঁকা নয় (`00 §95`) |
| Personality | technical · operational · precise · calm · restrained |
| যা নয় | playful · glossy · neon · cinematic · "startup dashboard" |

### Art direction — কেন এই console এই brand-এরই

Marketing site-এ ইতিমধ্যে একটা কাল্পনিক "Revenue / Command Center" আঁকা আছে: mono label, পাতলা border, notched corner, grid background, ঘন KPI। **এই console সেই কল্পনার বাস্তব রূপ।** তাই art direction ধার করা নয় — brand-এর নিজের ভাষা থেকেই এসেছে।

এই brand-এর জন্য নির্দিষ্ট চারটে দিক (Distinctiveness test):

1. **Mono-labelled operational chrome** — প্রতিটা label, status, ID, তারিখ Geist Mono uppercase tracking-এ; শরীরের লেখা sans-এ। Marketing site-এর `LEAK 01` / `DAYS 01—07` / `PIPELINE VALUE`-এর সরাসরি ধারাবাহিকতা
2. **Notched identity mark** — `clip-path` notch শুধু sidebar-এর brand block-এ। Site-এর `.hero-visual` ও `.map-core`-এর shape language, কিন্তু একটামাত্র জায়গায় (restraint)
3. **কমলা কেবল সূচক** — orange শুধু active nav-এর ২px bar আর brand mark-এ। কোনো button, badge, link, heading-এ নয়
4. **Border-led, প্রায় card-হীন** — grouping হবে heading → divider → rows দিয়ে, card দিয়ে নয় (`13 §43`)

## Color Palette

সব token semantic। Component কখনো raw hex ব্যবহার করবে না (`13 §65`)।

```css
/* app/admin/admin.css — dark default */
.admin {
  --a-bg-app:        #0a0e14;
  --a-bg-sidebar:    #0f141b;
  --a-bg-header:     #0f141b;

  --a-surface-1:     #0f141b;
  --a-surface-2:     #141a22;
  --a-surface-3:     #1a212a;
  --a-surface-hover: #1f2731;
  --a-surface-active:#242d38;

  --a-border-subtle: #1f2732;
  --a-border:        #2a3441;
  --a-border-strong: #3a4655;

  --a-text:          #eef2f6;
  --a-text-2:        #b3bfcc;
  --a-text-3:        #7d8b9b;
  --a-text-off:      #57626f;

  /* brand accent — শুধু indicator, button নয় */
  --a-accent:        #ff4f00;
  --a-accent-dim:    #b83900;

  /* primary action — RevOpsTree-এর নিজের blue */
  --a-action:        #1267ee;
  --a-action-hover:  #2b7bff;
  --a-action-text:   #ffffff;

  --a-success:       #24c07a;
  --a-warning:       #e8b53a;
  --a-danger:        #e5484d;
  --a-danger-hover:  #f05257;
  --a-info:          #4ba3ff;

  --a-focus:         #4ba3ff;
}
```

> **কেন Cloudflare-এর `#F6821F` নয়:** `13`-এর token গুলো "implementation reference values", brand নয়। RevOpsTree-এর নিজের orange `#FF4F00` আর blue `#1267ee` ব্যবহার করা `00 §111`-এর "use the brand, not the library, as the design language"-এর সাথে সঙ্গতিপূর্ণ।

> **কেন primary button orange নয়:** `13 §19` — "Do not use orange for every button, icon, heading, border, link, badge. Primary product actions may use blue/neutral action styling." Marketing site-এ প্রতিটা CTA orange (সেটা ঠিক আছে, ওটা marketing surface); console-এ orange শুধু active nav-এর সূচক।

## Themes

দুটোতেই প্রতিটা token define করা (`13 §63`)। Default dark; OS light চাইলে light।

```css
@media (prefers-color-scheme: light) {
  .admin:not([data-theme="dark"]) {
    --a-bg-app:        #ffffff;
    --a-bg-sidebar:    #f7f8fa;
    --a-bg-header:     #ffffff;

    --a-surface-1:     #ffffff;
    --a-surface-2:     #f7f8fa;
    --a-surface-3:     #eef1f5;
    --a-surface-hover: #f0f3f7;
    --a-surface-active:#e7ecf3;

    --a-border-subtle: #e4e8ee;
    --a-border:        #d3dae3;
    --a-border-strong: #b6c1ce;

    --a-text:          #10151c;
    --a-text-2:        #4a5563;
    --a-text-3:        #6f7c8b;
    --a-text-off:      #98a3b1;

    --a-accent:        #d63f00;   /* সাদার উপর AA-এর জন্য গাঢ় */
    --a-accent-dim:    #ff7433;

    --a-action:        #0d52c4;
    --a-action-hover:  #0a45a6;
    --a-action-text:   #ffffff;

    --a-success:       #12894f;
    --a-warning:       #9a6b00;
    --a-danger:        #c1272c;
    --a-danger-hover:  #a51f24;
    --a-info:          #0a63c4;

    --a-focus:         #0d52c4;
  }
}
```

Theme বদলালেও **অর্থ** এক থাকে — danger সবসময় danger, শুধু lightness সরে।

## Typography

| | |
|---|---|
| Sans | `var(--font-geist)` — Geist, ইতিমধ্যে layout-এ load করা |
| Mono | `var(--font-mono)` — Geist Mono, label/ID/তারিখ/status-এ |

> **`13 §13` Inter Variable চায়।** Geist রাখা হয়েছে কারণ (ক) project-এ ইতিমধ্যে load করা, নতুন font মানে বাড়তি download, (খ) Geist একই শ্রেণির neutral grotesk, (গ) `00 §88` — কাজ করছে এমন system বদলানো নিষেধ। সচেতন বিচ্যুতি, `memory.md` A8-এ নথিভুক্ত।

### Scale (`13 §14`)

| Token | size / line-height / weight | কোথায় |
|---|---|---|
| `display` | 28 / 34 / 600 | শুধু login পাতার শিরোনাম |
| `h1` | 24 / 30 / 600 | Page title |
| `h2` | 20 / 26 / 600 | Section title |
| `h3` | 16 / 22 / 600 | Panel/subsection |
| `body-lg` | 15 / 23 / 400 | Page description |
| `body` | 14 / 21 / 400 | ডিফল্ট, table cell |
| `body-sm` | 13 / 19 / 400 | সহায়ক লেখা, button |
| `label` | 12 / 16 / 500 | Form label, table header |
| `micro` | 11 / 15 / 500 · uppercase · `0.1em` | Eyebrow, nav group, status |
| `code` | 13 / 18 / 500 mono | ID, slug, তারিখ |

**48–72px dashboard title নিষেধ** (`13 §14`)।

## Spacing System

4px ভিত্তিক (`13 §11`)। `11px` / `17px` / `23px` উদ্ভাবন নিষেধ।

```
--a-s1: 4px    --a-s2: 8px    --a-s3: 12px   --a-s4: 16px   --a-s5: 20px
--a-s6: 24px   --a-s7: 32px   --a-s8: 40px   --a-s9: 48px   --a-s10: 64px
```

| প্রয়োগ | মান |
|---|---|
| icon ↔ text | 8px |
| control gap | 8px |
| table row padding | 10–12px |
| panel padding | 16–20px |
| section gap | 24–32px |
| page top | 24–32px |

## Border Radius

```
--a-r-xs: 3px   --a-r-sm: 5px   --a-r-md: 7px   --a-r-lg: 10px   --a-r-full: 9999px
```

| Element | Radius |
|---|---|
| Button · Input | 5px |
| Panel | 6px |
| Table | 0 (row border দিয়ে গঠন) |
| Modal | 8px |
| Status dot | full |

`rounded-2xl` / `3xl` সর্বত্র নিষেধ (`13 §22`)।

## Shadows

Grouping-এর প্রধান উপায় **1px border**, shadow নয় (`13 §21`)।

```css
--a-shadow-pop: 0 8px 24px rgba(0,0,0,.4);   /* dark */
--a-shadow-pop: 0 8px 24px rgba(16,21,28,.12); /* light */
```

শুধু dropdown · modal · tooltip-এ। Panel/card/table-এ shadow **নয়**।

## Icons

`lucide-react`, একটাই outline family (`13 §39`)।

| ব্যবহার | size | stroke |
|---|---|---|
| Sidebar nav | 16 | 1.75 |
| Button | 14 | 1.75 |
| Inline | 14 | 1.75 |
| Empty state | 20 | 1.5 |

| অর্থ | Icon |
|---|---|
| Posts | `FileText` |
| Staff | `Users` |
| Overview | `LayoutGrid` |
| নতুন | `Plus` |
| Edit | `PencilLine` |
| Delete | `Trash2` |
| Logout | `LogOut` |
| Menu | `Menu` / `X` |

**প্রতিটা label-এ icon বসানো নিষেধ** (`13 §40`) — nav-এ আছে, key-value row-তে নেই।

## Buttons

উচ্চতা `32px` ডিফল্ট (`13 §23`)। Marketing-এর 48–56px button console-এ নিষেধ।

| Variant | Background | Text | কোথায় |
|---|---|---|---|
| `primary` | `--a-action` | white | পাতাপ্রতি একটাই প্রধান কাজ |
| `secondary` | `--a-surface-3` + border | `--a-text` | পাশের কাজ |
| `ghost` | transparent | `--a-text-2` | table row-এর action |
| `danger` | `--a-danger` | white | delete নিশ্চিতকরণ |
| `link` | none | `--a-action` | inline navigation |

```css
.a-btn {
  height: 32px; padding-inline: 12px;
  font: 500 13px/1 var(--font-geist);
  border-radius: var(--a-r-sm); border: 1px solid transparent;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background-color 150ms, border-color 150ms;
}
.a-btn:focus-visible { outline: 2px solid var(--a-focus); outline-offset: 2px; }
.a-btn:disabled { opacity: .5; cursor: not-allowed; }
```

Size: `sm 28px` · `md 32px` · `lg 36px`। Label সবসময় **verb** (`13 §61`): `Save draft` · `Publish post` · `Add staff` — `Continue`/`OK` নয়।

## Forms

```css
.a-input {
  height: 34px; padding-inline: 10px;
  font-size: 14px; border-radius: var(--a-r-sm);
  background: var(--a-surface-2);
  border: 1px solid var(--a-border);
  color: var(--a-text);
}
.a-input:focus-visible { outline: 2px solid var(--a-focus); outline-offset: 1px; border-color: var(--a-border-strong); }
.a-input[aria-invalid="true"] { border-color: var(--a-danger); }
```

| অংশ | নিয়ম |
|---|---|
| Label | `label` token, `<label for>` বাধ্যতামূলক — placeholder কখনো label নয় |
| Helper | `body-sm`, `--a-text-3`, input-এর নিচে |
| Error | `body-sm`, `--a-danger`, `role="alert"`, `aria-invalid` সহ |
| Textarea (markdown) | mono, min-height 420px, `resize: vertical` |
| Password | `autocomplete="current-password"` / `"new-password"` |
| Email | `type="email"` `autocomplete="username"` |

Form UX (`07 §66`): স্পষ্ট label · inline validation · loading state · keyboard order · সঠিক autocomplete।

## Components

### Application shell (`13 §5`)

```
┌──────────────────────────────────────────────────────────┐
│ header 52px — brand · spacer · user · logout             │
├────────────┬─────────────────────────────────────────────┤
│ sidebar    │  page header (title + primary action)       │
│ 224px      │  ──────────────── divider ───────────────   │
│            │  content   max-width 1400px  pad-inline 24  │
└────────────┴─────────────────────────────────────────────┘
```

- Sidebar `224px`, nav item `38px`, group label `micro`
- Active: `--a-surface-active` + বাঁয়ে `2px` `--a-accent` bar (`13 §7`) — rounded pill **নয়**
- Header `52px`

### Table (`13 §28`) — প্রথম শ্রেণির component

| | |
|---|---|
| Header উচ্চতা | 38px, `label` token, `--a-text-3` |
| Row উচ্চতা | 44px |
| Cell padding | 12px |
| Border | শুধু অনুভূমিক row border |
| Hover | `--a-surface-hover` |

Mobile-এ operational data **card-এ রূপান্তর নয়** — label/value stack (`13 §50`)।

### Status badge (`13 §32`)

`dot + text`, রঙ কেবল সহায়ক। ছোট, বিশাল pill নয়।

| Status | রঙ |
|---|---|
| Published · Active | `--a-success` |
| Draft · Invited | `--a-warning` |
| Disabled | `--a-text-3` |

### Empty state (`13 §35`)

ছোট icon (20px) · একটা শিরোনাম · এক বাক্য · একটা action। বিশাল illustration বা marketing অনুচ্ছেদ নয়।

### Panel

`1px solid var(--a-border-subtle)`, radius 6px, padding 16–20px। **Card তখনই যখন সত্যিই আলাদা container দরকার** (`13 §44`)।

### যা ব্যবহার করা হয়নি

Modal · dropdown · tooltip — এই release-এ দরকার পড়েনি। Delete নিশ্চিতকরণ inline two-step, modal নয় (`13 §36` — routine navigation-এ modal নয়)।

## Responsive (`13 §49`)

| Breakpoint | আচরণ |
|---|---|
| ≥1200px | sidebar + content |
| 900–1199px | sidebar থাকে, content gutter 24px |
| <900px | sidebar drawer, header-এ menu button |
| <600px | single column; table → label/value stack |

QA বাধ্যতামূলক: **1440 · 1280 · 768 · 390** (`13 §69`)। Touch target ≥ 44×44 (`13 §52`)।

## Animations (`13 §55`)

```
instant 100ms · fast 150ms · normal 200ms · slow 300ms
```

শুধু hover · focus · drawer · status বদল · loading। **GSAP / scroll-driven effect console-এ নিষেধ** (`13 §56`) — ওটা marketing site-এর জিনিস।

```css
@media (prefers-reduced-motion: reduce) {
  .admin *, .admin *::before { transition-duration: 0.01ms !important; animation: none !important; }
}
```

## Accessibility

WCAG 2.2 AA (`13 §53`)।

| | |
|---|---|
| Contrast | body ≥ 4.5:1, বড় লেখা ≥ 3:1। `--a-text-3` (#7d8b9b) on `--a-surface-1` ≈ 5.2:1 ✓ |
| Focus | `2px` ring, `2px` offset, দুই theme-এ দৃশ্যমান। `outline: none` বিকল্প ছাড়া নিষেধ |
| Keyboard | Tab order DOM-অনুসারী; drawer-এ Esc |
| Semantics | table-এ `<th scope>`; action `<button>`, navigation `<a>` |
| Status | রঙ + text দুটোই |
| Live region | form error `role="alert"` |

## যা কখনো করা যাবে না

1. ৩-stat card সারি বা ৪-feature card grid অকারণে (`13 §45`)
2. Gradient background, blurred orb, glass panel, neon glow
3. Page title center করা, বা 48px+ শিরোনাম
4. প্রতিটা subsection আলাদা card-এ (`13 §43` — "critical")
5. Orange-কে button/badge/link/heading-এ ব্যবহার
6. Fake metric, fake chart, fake sparkline, fake activity feed
7. Console-এ marketing-মাপের CTA button
8. রঙ-মাত্র status
9. `outline` সরিয়ে বিকল্প না দেওয়া
10. Operational table mobile-এ card-এ রূপান্তর
11. Admin CSS public bundle-এ ফাঁস করা
12. `13`-এর reference hex অন্ধভাবে নেওয়া — brand token আগে
