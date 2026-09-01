---
title: RevOpsTree Admin & Blog — Phases
product: RevOpsTree
type: Roadmap
status: Draft v1
created: 2026-09-01
updated: 2026-09-01
---

# Phases

> **এটাই progress-এর একক উৎস।** কাজ শেষ করে এখানে `[x]` না করা মানে কাজ অসম্পূর্ণ।

## অবস্থার সারসংক্ষেপ

| Phase | নাম | অবস্থা |
|---|---|---|
| 0 | Foundation — docs, dependency, DB, env | 🟡 চলছে |
| 1 | Auth ও session | ⬜ বাকি |
| 2 | Blog CMS (admin) | ⬜ বাকি |
| 3 | Public blog | ⬜ বাকি |
| 4 | Staff management ও overview | ⬜ বাকি |
| 5 | QA, a11y, deployment | ⬜ বাকি |

**MVP = Phase 0 → 3 শেষ।** তখনই Shahriar developer ছাড়া post publish করতে পারবেন (G1, G3)। Phase 4 দ্বিতীয় ব্যক্তি যোগ করার আগে লাগবে (G2)।

---

## Phase 0 — Foundation

### Documentation
- [x] `/docs`-এর ছয়টা ফাইল
- [x] Next 16.3 breaking change যাচাই (`middleware`→`proxy`, async `params`/`cookies`)
- [x] `10 Standards/frontend/` scan — 00 · 13 · 12 · 07 পড়া

### কোড শুরুর আগে যেসব সিদ্ধান্ত দরকার
- [x] MongoDB Atlas (local নয়) — ব্যবহারকারী, 2026-09-01
- [x] Role model: `admin` + `editor`
- [x] Public blog + admin CMS দুটোই
- [x] Auth: নিজস্ব DAL + jose (NextAuth নয়)
- [x] Password: `node:crypto` scrypt (bcrypt নয়)
- [ ] **Atlas connection string** — ব্যবহারকারীর কাছ থেকে দরকার ⚠️ blocking
- [ ] Production hosting (architecture.md-এ DECISION-PENDING)

### Setup
- [ ] Dependency: `mongodb` · `jose` · `zod` · `lucide-react` · `marked` · `sanitize-html`
- [ ] `.env.example` — `MONGODB_URI` · `MONGODB_DB` · `SESSION_SECRET`
- [ ] `lib/db.ts` — MongoClient singleton, dev hot-reload safe
- [ ] `lib/types.ts` — `Staff` · `Post` · `ActionState`
- [ ] `lib/validation.ts` — Zod schema
- [ ] Index তৈরি (`staff.email`, `posts.slug`, `posts.{status,publishedAt}`)
- [ ] `scripts/seed-admin.mjs` — প্রথম admin

---

## Phase 1 — Auth ও session

### Core
- [ ] `lib/password.ts` — scrypt hash/verify, `timingSafeEqual` (FR-1.2, 1.3)
- [ ] `lib/session.ts` — jose encrypt/decrypt, cookie set/delete (FR-1.5, 1.6)
- [ ] `lib/dal.ts` — `verifySession()` · `requireAdmin()` · `getCurrentStaff()` (FR-2.2, 2.3)
- [ ] `proxy.ts` — optimistic cookie check (FR-2.1)

### UI
- [ ] `/admin/login` পাতা + form
- [ ] `login` action — generic error, dummy hash (FR-1.4, 1.7)
- [ ] `logout` action (FR-1.8)
- [ ] `app/admin/layout.tsx` — shell, `noindex`
- [ ] `Sidebar` — role অনুযায়ী nav
- [ ] `admin.css` — token, dark + light

### যাচাই
- [ ] ভুল password → generic error
- [ ] মেয়াদোত্তীর্ণ session → login redirect (FR-1.10)
- [ ] `lastLoginAt` আপডেট হয় (FR-1.9)

---

## Phase 2 — Blog CMS (admin)

- [ ] `/admin/posts` তালিকা — status filter (FR-3.11)
- [ ] `/admin/posts/new` ও `/admin/posts/[id]`
- [ ] `PostEditor` — markdown + live preview (F4)
- [ ] Title → slug auto-generate, editable (FR-3.2)
- [ ] `savePost` action — draft ও publish (FR-3.4, 3.6, 3.7)
- [ ] Duplicate slug → field error (FR-3.3)
- [ ] `deletePost` — inline confirm (FR-3.8)
- [ ] `lib/markdown.ts` — sanitize (FR-3.10)
- [ ] Empty state

### যাচাই
- [ ] Editor role post লিখতে/edit করতে পারে
- [ ] `publishedAt` পুনঃপ্রকাশে বদলায় না

---

## Phase 3 — Public blog  ← **MVP এখানে শেষ**

- [ ] `/blog` তালিকা, নতুন আগে (FR-5.1)
- [ ] `/blog/[slug]` — `PageProps<'/blog/[slug]'>`, `await params`
- [ ] না মিললে `notFound()` (FR-5.2)
- [ ] `generateMetadata` — title, description, OG (FR-5.3)
- [ ] `BlogPosting` JSON-LD (FR-5.4)
- [ ] Site header/footer-এর ভাষা (FR-5.5)
- [ ] Empty state (FR-5.6)
- [ ] `revalidatePath` publish-এর পরে

### যাচাই
- [ ] Draft কোনো public route-এ নেই (FR-3.5) 🔴
- [ ] Admin CSS/JS public পাতায় নেই (FR-5.7)
- [ ] Lighthouse ≥ 95

---

## Phase 4 — Staff ও overview

- [ ] `/admin/staff` তালিকা — admin only (FR-4.8)
- [ ] `createStaff` action (FR-4.3, 4.4)
- [ ] `updateStaff` — role ও status (FR-4.5, 4.6)
- [ ] শেষ admin রক্ষা (FR-2.6)
- [ ] নিজের role/status বদলানো বন্ধ (FR-2.5)
- [ ] Editor-এর জন্য 403 UI (FR-2.3)
- [ ] `/admin` overview — **শুধু প্রকৃত গণনা**, fake metric নয় (`13 §45`)

### যাচাই
- [ ] Editor `/admin/staff` → 403
- [ ] Editor সরাসরি `createStaff` ডাকলেও 403 🔴
- [ ] `passwordHash` কোনো response-এ নেই 🔴

---

## Phase 5 — QA, a11y, deployment

- [ ] Visual QA: 1440 · 1280 · 768 · 390 (`13 §69`)
- [ ] `13 §70`-এর screenshot প্রশ্নমালা
- [ ] `00`-এর চারটে test (Human Design · Distinctiveness · Restraint · AI-formula)
- [ ] Contrast যাচাই — দুই theme
- [ ] Keyboard-only navigation
- [ ] `prefers-reduced-motion`
- [ ] `rules.md`-এর manual test তালিকা
- [ ] Production env var
- [ ] Atlas IP allowlist সংকুচিত
- [ ] Deploy

---

## জানা ঝুঁকি

| ঝুঁকি | প্রভাব | কী করব |
|---|---|---|
| Draft post public-এ ফাঁস | 🔴 | প্রতিটা public query-তে `status:'published'` hardcode; DAL-এ আলাদা function, filter param নয় |
| `passwordHash` client-এ যাওয়া | 🔴 | প্রতিটা staff query-তে explicit projection |
| Editor privilege escalation | 🔴 | `requireAdmin()` action-এর ভেতরে, শুধু UI-তে লুকানো নয় |
| Atlas URI commit হয়ে যাওয়া | 🔴 | `.env*` ইতিমধ্যে gitignore-এ; শুধু `.env.example` commit |
| Admin CSS marketing site ভাঙা | 🟡 | সব admin class `a-` prefix, token `.admin` scope-এ |
| শেষ admin lockout | 🟡 | FR-2.6 + `seed-admin.mjs` পুনরায় চালানো যায় |
| Staff disable-এর পরও session টেকা | 🟡 | সচেতন ট্রেড-অফ (A6); জরুরি হলে `SESSION_SECRET` বদল |
| Markdown XSS | 🔴 | `sanitize-html` বাধ্যতামূলক |
| Serverless-এ connection বিস্ফোরণ | 🟡 | Global client cache |
| Automated test নেই | 🟡 | `rules.md`-এর manual checklist; পরে Playwright |
