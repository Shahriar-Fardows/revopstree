---
title: RevOpsTree Admin & Blog — PRD
product: RevOpsTree
type: PRD
status: Draft v1
source: "কোনো Obsidian product spec নেই — RevOpsTree `20 Products/`-এ নথিভুক্ত নয়। এই PRD ব্যবহারকারীর 2026-09-01-এর মৌখিক requirement + বিদ্যমান কোড থেকে derived"
created: 2026-09-01
updated: 2026-09-01
---

# RevOpsTree — Admin Panel ও Blog CMS

## Project Overview

| | |
|---|---|
| **নাম** | RevOpsTree Admin (internal console) |
| **সংক্ষেপে** | বিদ্যমান RevOpsTree marketing site-এর সাথে যুক্ত একটি authenticated console — staff manage করা ও blog post প্রকাশ করার জন্য |
| **উদ্দেশ্য** | Marketing site-টা এখন সম্পূর্ণ static। নতুন content দিতে হলে প্রতিবার developer লাগে। এই console সেই নির্ভরতা সরায় |
| **Vision** | RevOpsTree নিজেই যে "operational leak" বন্ধ করার কথা বলে, নিজের content workflow-এও সেই একই শৃঙ্খলা থাকবে — publish করতে ticket লাগবে না |
| **Core philosophy** | Console টা marketing site নয়। এটা dense, restrained, operational — একটা infrastructure product-এর মতো (`10 Standards/frontend/13`) |

## Goals & Objectives

| ID | Goal | কেন | Success signal |
|---|---|---|---|
| **G1** | Developer ছাড়া blog publish | আজ প্রতিটা content update = code deploy | Shahriar নিজে post করে publish করতে পারছেন |
| **G2** | Staff access নিয়ন্ত্রণ | ভবিষ্যতে writer যোগ হবে, সবাইকে full access দেওয়া যাবে না | Editor role blog লিখতে পারে কিন্তু staff manage করতে পারে না |
| **G3** | Blog দিয়ে organic traffic | Site-এ এখন কোনো indexable content নেই, শুধু একটা landing page | `/blog` ও প্রতিটা post আলাদা URL-এ SEO-ready |
| **G4** | Marketing site-এর গতি অক্ষুণ্ণ | বর্তমান Lighthouse 99/100/100/100 | Admin-এর কোনো JS/CSS public page-এ যাবে না |

**Business objective:** Content marketing চালু করা, আর সেটা চালাতে গিয়ে engineering time খরচ না করা।

## Target Users

### Persona 1 — Shahriar (Owner / Admin)
- **প্রেক্ষাপট:** RevOpsTree চালান, একই সাথে developer। সপ্তাহে ১–২ বার console-এ ঢুকবেন
- **কী চান:** দ্রুত একটা post লিখে publish করা; পরে staff যোগ করা
- **সমস্যা:** আজ post করতে হলে কোড এডিট করে deploy করতে হয়

### Persona 2 — Editor (ভবিষ্যতের content writer)
- **প্রেক্ষাপট:** RevOpsTree-এর হয়ে লিখবেন, technical নন
- **কী চান:** Draft লেখা, save করা, publish করা
- **সমস্যা:** CMS জটিল হলে ব্যবহারই করবেন না; আবার তাঁকে staff/settings-এ ঢুকতে দেওয়া যাবে না

### User role table

| Role | Blog: নিজের post | Blog: অন্যের post | Staff manage | নিজের profile |
|---|---|---|---|---|
| **admin** | ✅ CRUD + publish | ✅ CRUD + publish | ✅ add · edit · disable | ✅ |
| **editor** | ✅ CRUD + publish | ✅ edit + publish | ❌ (403) | ✅ |

> **সিদ্ধান্ত (2026-09-01):** Editor অন্যের post-ও edit করতে পারবে — ছোট টিমে per-author lock অকারণ ঘর্ষণ তৈরি করে। শুধু staff management admin-only।

## Problem Statement

আজকের অবস্থা:

```
নতুন blog post লিখতে হলে
   ↓
app/page.tsx বা নতুন route হাতে লিখতে হয়
   ↓
git commit → push → deploy
   ↓
মানে: প্রতিটা লেখায় একজন developer আটকে থাকে
```

ফল: content marketing কখনো শুরুই হয় না, কারণ প্রতিটা post-এর খরচ একটা deploy cycle। আর নতুন লেখক যোগ করার কোনো উপায়ই নেই — repo access দেওয়া ছাড়া।

## Core Features

| # | Feature | Category | Phase |
|---|---|---|---|
| F1 | Email + password দিয়ে staff login | Auth | 1 |
| F2 | Session cookie + role-based access | Auth | 1 |
| F3 | Blog post CRUD (draft/publish) | CMS | 2 |
| F4 | Markdown editor + live preview | CMS | 2 |
| F5 | Public `/blog` তালিকা | Public | 3 |
| F6 | Public `/blog/[slug]` post পাতা | Public | 3 |
| F7 | Staff তালিকা, add, role বদল, disable | Staff | 4 |
| F8 | Admin overview (post/staff গণনা) | Console | 4 |

## Optional Features (পরের release)

| Feature | কেন এখন নয় |
|---|---|
| Image upload (S3/Cloudinary) | আপাতত cover image URL যথেষ্ট; storage vendor সিদ্ধান্ত বাকি |
| Post scheduling | কেউ চায়নি; `publishedAt` field রাখা আছে যাতে পরে সহজ হয় |
| Category / tag archive পাতা | Tag field আছে, কিন্তু আলাদা পাতা যথেষ্ট content ছাড়া অর্থহীন |
| Email invite flow | আপাতত admin সরাসরি password দিয়ে staff বানাবে |
| Audit log | Staff সংখ্যা কম, এখন over-engineering |
| 2FA | Staff সংখ্যা কম; পরে admin role-এর জন্য |

## User Flow

### Flow A — Post লিখে publish করা

```
/admin/login
   │ email + password
   ▼
session cookie সেট → /admin
   │
   ▼
Posts → "New post"
   │
   ├─ title লিখলে slug auto-generate (editable)
   ├─ markdown লিখতে লিখতে preview
   │
   ├─→ "Save draft"    → status=draft   → public site-এ নেই
   └─→ "Publish"       → status=published, publishedAt=now
                          ↓
                    /blog আর /blog/<slug> এ তৎক্ষণাৎ দৃশ্যমান
```

### Flow B — Staff যোগ করা (admin only)

```
/admin/staff  ─── editor হলে ──→ 403 forbidden পাতা
   │ admin
   ▼
"Add staff" → name · email · role · temporary password
   ▼
scrypt hash হয়ে staff collection-এ insert
   ▼
নতুন staff ঐ credential দিয়ে login করতে পারে
```

### Flow C — পাঠক blog পড়ছে

```
/blog  → published post-এর তালিকা (নতুন আগে)
   ▼ click
/blog/<slug> → পুরো লেখা, metadata, JSON-LD
```

## Functional Requirements

### FR-1 · Authentication

| ID | Requirement |
|---|---|
| FR-1.1 | `/admin/login`-এ email + password form থাকবে |
| FR-1.2 | Password `node:crypto` scrypt দিয়ে hash হবে, ১৬-byte random salt, `scrypt$N$salt$hash` format-এ সংরক্ষিত |
| FR-1.3 | Password যাচাই `timingSafeEqual` দিয়ে হবে — string `===` নয় |
| FR-1.4 | ভুল email আর ভুল password দুটোতেই **একই** বার্তা: "Invalid email or password" (user enumeration ঠেকাতে) |
| FR-1.5 | সফল login-এ JWT (HS256, jose) তৈরি হয়ে `session` নামের httpOnly · secure · sameSite=lax cookie-তে বসবে, মেয়াদ ৭ দিন |
| FR-1.6 | JWT payload-এ **শুধু** `staffId`, `role`, `expiresAt` থাকবে — নাম/email/hash কখনো নয় |
| FR-1.7 | `status !== 'active'` staff login করতে পারবে না, একই generic বার্তা পাবে |
| FR-1.8 | Logout করলে cookie মুছে `/admin/login`-এ redirect হবে |
| FR-1.9 | সফল login-এ `lastLoginAt` আপডেট হবে |
| FR-1.10 | Session মেয়াদোত্তীর্ণ হলে যেকোনো `/admin/*` request `/admin/login`-এ redirect হবে |

### FR-2 · Authorization

| ID | Requirement |
|---|---|
| FR-2.1 | `proxy.ts` শুধু **optimistic** check করবে — cookie আছে কিনা। সেখানে JWT verify বা DB call হবে না |
| FR-2.2 | আসল যাচাই প্রতিটা page/action-এ DAL-এর `verifySession()` দিয়ে হবে |
| FR-2.3 | `requireAdmin()` role যাচাই করবে; editor `/admin/staff*`-এ গেলে 403 পাতা পাবে |
| FR-2.4 | প্রতিটা Server Action নিজে auth যাচাই করবে — UI-তে button লুকানো কোনো নিরাপত্তা নয় |
| FR-2.5 | Admin নিজের role বদলাতে বা নিজেকে disable করতে পারবে না |
| FR-2.6 | সিস্টেমে অন্তত একজন active admin সবসময় থাকবে — শেষ admin-কে disable/demote করা যাবে না |

### FR-3 · Blog post

| ID | Requirement |
|---|---|
| FR-3.1 | Post-এর field: `title` · `slug` · `excerpt` · `content` (markdown) · `coverImage?` · `tags[]` · `status` · `authorId` · `authorName` · `publishedAt?` · `createdAt` · `updatedAt` |
| FR-3.2 | `title` থেকে slug auto-generate হবে (lowercase, non-alphanumeric → `-`), কিন্তু হাতে বদলানো যাবে |
| FR-3.3 | `slug` unique — DB-তে unique index; সংঘর্ষে মাঠ-নির্দিষ্ট error দেখাবে, 500 নয় |
| FR-3.4 | `status` কেবল `draft` বা `published` |
| FR-3.5 | `draft` post কোনো public route-এ কখনো আসবে না |
| FR-3.6 | প্রথমবার `published` হলে `publishedAt` বসবে; পরে edit করলে বদলাবে না |
| FR-3.7 | Published post আবার draft-এ ফেরানো যাবে (unpublish) |
| FR-3.8 | Delete-এর আগে confirm লাগবে; delete স্থায়ী |
| FR-3.9 | Validation: title ১–160 অক্ষর, slug ১–120 এবং `^[a-z0-9-]+$`, excerpt ≤ 300, content খালি নয় |
| FR-3.10 | Markdown server-side এ HTML-এ রূপান্তরিত হবে এবং **sanitize** হবে — কাঁচা HTML pass-through নয় |
| FR-3.11 | Post তালিকায় status, লেখক, তারিখ দেখা যাবে; status দিয়ে filter করা যাবে |

### FR-4 · Staff management

| ID | Requirement |
|---|---|
| FR-4.1 | Staff-এর field: `name` · `email` · `passwordHash` · `role` · `status` · `createdAt` · `updatedAt` · `lastLoginAt?` |
| FR-4.2 | `email` unique এবং lowercase-এ normalize হয়ে সংরক্ষিত |
| FR-4.3 | Admin নতুন staff বানাতে পারবে: name · email · role · প্রাথমিক password |
| FR-4.4 | Password অন্তত ১০ অক্ষর |
| FR-4.5 | Admin অন্য staff-এর role বদলাতে পারবে (FR-2.5/2.6 সীমার মধ্যে) |
| FR-4.6 | Admin staff-কে `disabled` করতে পারবে — delete নয়, কারণ post-এর authorship থেকে যায় |
| FR-4.7 | `passwordHash` কোনো query থেকে কখনো client-এ যাবে না |
| FR-4.8 | Staff তালিকায় name · email · role · status · শেষ login দেখা যাবে |

### FR-5 · Public blog

| ID | Requirement |
|---|---|
| FR-5.1 | `/blog`-এ শুধু published post, `publishedAt` অনুযায়ী নতুন আগে |
| FR-5.2 | `/blog/[slug]` না মিললে 404 (`notFound()`) |
| FR-5.3 | প্রতিটা post পাতায় `<title>`, meta description (excerpt থেকে), OpenGraph tag থাকবে |
| FR-5.4 | Post পাতায় `BlogPosting` JSON-LD থাকবে |
| FR-5.5 | Blog পাতাগুলো site-এর বিদ্যমান header/footer ভাষা মেনে চলবে |
| FR-5.6 | কোনো post না থাকলে `/blog` একটা পরিচ্ছন্ন empty state দেখাবে, ভাঙা পাতা নয় |
| FR-5.7 | Admin-এর CSS/JS কোনো public পাতায় load হবে না |

## Non-Functional Requirements

| ধরন | Requirement |
|---|---|
| **Performance** | Public blog পাতার Lighthouse ≥ 95 (বর্তমান site 99/100/100/100 — নামানো যাবে না)। Admin পাতা TTI < 2s local-এ |
| **Performance** | MongoDB connection dev-এ hot-reload জুড়ে reuse হবে (global cache), প্রতি request-এ নতুন pool নয় |
| **Security** | সব input server-side এ Zod দিয়ে validate হবে; client validation শুধু UX |
| **Security** | Secret কেবল `.env.local`-এ; কোনো secret `NEXT_PUBLIC_*` নয় |
| **Security** | Password/hash/token কখনো log হবে না |
| **Security** | Server Action-এ client থেকে আসা `authorId`/`role` বিশ্বাস করা হবে না — session থেকে নেওয়া হবে |
| **Accessibility** | WCAG 2.2 AA। প্রতিটা input-এ label, দৃশ্যমান focus ring, keyboard-এ পূর্ণ navigation |
| **Accessibility** | Status কেবল রঙে বোঝানো যাবে না — dot/icon + text |
| **Scalability** | `posts` collection-এ `{status, publishedAt}` compound index; `slug` ও `email`-এ unique index |
| **Reliability** | DB down থাকলে admin actionable error দেখাবে, সাদা পর্দা নয় |
| **Observability** | Server-side error `console.error`-এ context সহ; PII বাদ |
| **SEO** | Admin route `noindex`; blog পাতা indexable |

## Success Criteria

| Metric | Target |
|---|---|
| Post publish করতে লাগা সময় | < ৫ মিনিট, deploy ছাড়া |
| Public blog Lighthouse (perf/a11y/SEO) | ≥ 95 / 100 / 100 |
| Editor staff পাতায় ঢুকতে পারে | ০ বার (403) |
| Draft public-এ ফাঁস | ০ |
| নতুন staff যোগ করতে লাগা সময় | < ২ মিনিট |

## Future Improvements

- Cloudinary/S3 image upload, editor-এ drag-drop
- Post preview link (unpublished post শেয়ার করার signed URL)
- RSS feed ও sitemap-এ blog auto-inclusion
- Password reset flow (এখন admin হাতে reset করবে)
- Homepage-এ "Latest from the blog" section (PDF-এ যেমন reference দেখানো হয়েছিল)

## Product Summary

| Key | Value |
|---|---|
| Surface | Public marketing site (বিদ্যমান) + `/blog` (নতুন) + `/admin` console (নতুন) |
| Auth | Email + password, jose JWT session cookie |
| Roles | `admin` · `editor` |
| DB | MongoDB Atlas, official `mongodb` driver |
| Collections | `staff` · `posts` |
| Editor | Markdown + live preview |
| Admin design law | `10 Standards/frontend/13 - Product UI design system` |
| Public design law | বিদ্যমান site-এর ভাষা + `01` / `05` |
