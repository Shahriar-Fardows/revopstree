---
title: RevOpsTree Admin & Blog — Memory
product: RevOpsTree
type: Memory
status: Draft v1
created: 2026-09-01
updated: 2026-09-01
---

# Memory

## Project Status

| | |
|---|---|
| Phase | 0 — Foundation (docs শেষ, setup বাকি) |
| Repo | `F:\Shahriar\revops` |
| Branch | `main` |
| Stack | Next.js 16.3 · React 19.2 · TypeScript · plain CSS · GSAP (শুধু marketing) |
| যোগ হচ্ছে | MongoDB Atlas · jose · zod · lucide-react · marked · sanitize-html |
| পরবর্তী milestone | Phase 3 শেষ = MVP (developer ছাড়া post publish) |

## যেসব উৎস দেখতে হবে

| উৎস | কী আছে | সংঘাতে |
|---|---|---|
| `node_modules/next/dist/docs/` | এই Next version-এর প্রকৃত API | **সবার উপরে** framework প্রশ্নে |
| `10 Standards/frontend/00` | AI agent rules, ৪টা test | সবসময় প্রযোজ্য |
| `10 Standards/frontend/13` | Product UI design system | `/admin`-এ 01/05-এর উপরে |
| `10 Standards/frontend/12` | Folder ও component কাঠামো | authority 1 |
| `docs/rules.md` | এই project-এর নিয়ম | standards-এর নিচে |
| `AGENTS.md` | `next dev` লেখে — মুছলে ফিরে আসে | তথ্যমূলক |

> RevOpsTree-এর কোনো Obsidian product spec **নেই** (`20 Products/`-এ নথিভুক্ত নয়)। তাই `/docs`-ই এখন source of truth — অন্য product-এর মতো derivative নয়।

## Completed Tasks

| তারিখ | কাজ |
|---|---|
| 2026-09-01 | PDF feedback-এর ৭টা পরিবর্তন marketing site-এ (orange CTA, services 14→8, promise line সরানো, trust bar) |
| 2026-09-01 | Next 16.3 docs যাচাই — `middleware`→`proxy`, async `params`/`cookies`, `useActionState` |
| 2026-09-01 | `10 Standards/frontend` scan — 00 · 13 · 12 · 07 |
| 2026-09-01 | `/docs`-এর ছয়টা ফাইল |

## Current Task

Phase 0 setup — dependency install, `lib/db.ts`, type, Zod schema, index, seed script।

## Pending Tasks

1. Atlas connection string নেওয়া ⚠️ **blocking**
2. Dependency install + `.env.example`
3. `lib/db.ts` · `lib/types.ts` · `lib/validation.ts`
4. `lib/password.ts` · `lib/session.ts` · `lib/dal.ts`
5. `proxy.ts` + `/admin/login`
6. Admin shell + `admin.css`

পূর্ণ তালিকা `phases.md`-এ।

## Open Decisions ⚠️

| # | কী | বিকল্প | সুপারিশ | কখন লাগবে |
|---|---|---|---|---|
| O1 | Atlas connection string | — | ব্যবহারকারী `.env.local`-এ বসাবেন | **এখনই** — ছাড়া কিছু চলবে না |
| O2 | Production hosting | Vercel · VPS · Docker | Vercel (Atlas-এর সাথে একই region) | প্রথম publish-এর আগে |
| O3 | Cover image | URL হাতে · upload | আপাতত URL; upload আলাদা phase | Phase 2 |
| O4 | Homepage-এ "Latest posts" | হ্যাঁ · না | Blog-এ ৩+ post হলে | Phase 3-এর পরে |
| O5 | Atlas IP allowlist | `0.0.0.0/0` · সীমিত | dev-এ খোলা, prod-এ সীমিত | Deploy |

## Important Decisions (স্থির)

| # | সিদ্ধান্ত | কেন |
|---|---|---|
| **A1** | MongoDB Atlas + official `mongodb` driver, Mongoose নয় | Zod ইতিমধ্যে shape যাচাই করছে; দুই schema = drift |
| **A2** | নিজস্ব DAL + jose, NextAuth নয় | একটাই provider, একটাই DB। ~80 লাইন DAL পুরো framework-এর চেয়ে স্বচ্ছ। Next auth guide-এরই pattern |
| **A3** | `node:crypto` scrypt, bcrypt নয় | শূন্য dependency; bcrypt native build Windows-এ ভাঙে |
| **A4** | Auth-এর সীমানা DAL-এ, proxy-তে নয় | Next docs স্পষ্ট: proxy "not a full authorization solution" |
| **A5** | `authorName` denormalized | Staff disable/rename হলেও পুরনো post-এর কৃতিত্ব ঠিক থাকে |
| **A6** | Stateless JWT session | Staff disable করলে চালু session ৭ দিন টিকতে পারে। ছোট টিমে গ্রহণযোগ্য; জরুরি হলে `SESSION_SECRET` বদলালে সব বাতিল |
| **A7** | Route group (`(site)`) নয় — admin-এর CSS `.admin`-এ scope | Root layout ও homepage কাজ করছে; নাড়ালে GSAP paint-guard ও Lighthouse tuning ঝুঁকিতে (`00 §88`) |
| **A8** | Geist রাখা, Inter নয় | `13 §13` Inter চায়, কিন্তু Geist ইতিমধ্যে load করা, একই শ্রেণির grotesk। নতুন font = বাড়তি download |
| **A9** | Console-এ orange শুধু active nav indicator; primary button blue | `13 §19` — orange interface-এ প্রাধান্য পাবে না। Marketing site-এ সব CTA orange থাকবে (আলাদা surface) |
| **A10** | Editor অন্যের post-ও edit করতে পারে | ছোট টিমে per-author lock অকারণ ঘর্ষণ। শুধু staff management admin-only |
| **A11** | Staff delete নয়, `disabled` | Post-এর authorship ভাঙে |
| **A12** | React Hook Form নয় | Form ছোট; `useActionState` যথেষ্ট (`07 §65`) |

## Known Issues

| মাত্রা | সমস্যা |
|---|---|
| 🟡 | Automated test নেই — শুধু `rules.md`-এর manual checklist |
| 🟡 | Password reset flow নেই — admin হাতে reset করবেন |
| 🟡 | Image upload নেই — cover image URL হাতে |
| 🟡 | Staff disable করলে session তৎক্ষণাৎ বাতিল হয় না (A6) |
| 🟡 | Post তালিকায় pagination নেই — ৫০+ হলে লাগবে |
| ⚪ | `AGENTS.md` block `next dev` পুনরায় লেখে — untracked change হিসেবে ফিরে আসে |

## Change Log

| তারিখ | কী |
|---|---|
| 2026-09-01 | Marketing site: PDF-এর ৭টা পরিবর্তন (orange CTA, services 14→8, hero eyebrow বাদ, promise line CTA-তে সরানো, trust bar থেকে n8n/stripe বাদ + Clay যোগ) |
| 2026-09-01 | `/docs` তৈরি — admin panel ও blog CMS-এর জন্য |

## Notes for future sessions

- **Next 16.3-এর gotcha `rules.md`-এর একদম উপরে** — `proxy.ts`, async `params`/`cookies`, `useActionState`। স্মৃতি থেকে পুরনো API লিখো না
- **Marketing site ছোঁবে না** — `app/page.tsx`, `app/motion-system.tsx`, `app/globals.css`-এর marketing অংশ কাজ করছে, Lighthouse 99/100/100/100। Admin সম্পূর্ণ additive
- **Admin ≠ marketing site দেখতে।** `13`-এর dense/restrained ভাষা; orange শুধু indicator। ব্যবহারকারী marketing-এ orange CTA চেয়েছিলেন — সেটা ঐ surface-এর জন্য, console-এর নয় (A9)
- **Card-এর লোভ সামলাও** (`13 §43–44`) — heading → divider → rows। অতিরিক্ত card-ই dashboard-কে AI-generated দেখায়
- **Fake data কখনো নয়** — overview পাতায় শুধু প্রকৃত গণনা। Fake chart/sparkline/activity feed নিষেধ
- Browser pane-এর screenshot প্রায়ই blank/stale আসে (rAF suspension)। `get_page_text` ও `javascript_tool` দিয়ে computed style যাচাই করা বেশি নির্ভরযোগ্য
- ব্যবহারকারীর ভাষা: বাংলা/হিন্দি-উর্দু মেশানো। উত্তর বাংলায়, technical term ইংরেজিতে
