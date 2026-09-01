---
title: RevOpsTree Admin & Blog — Architecture
product: RevOpsTree
type: Architecture
status: Draft v1
created: 2026-09-01
updated: 2026-09-01
---

# Architecture

## System Architecture

```
                        ┌────────────────────────────────┐
   পাঠক (anonymous) ───▶│  PUBLIC SURFACE                │
                        │  /            marketing (GSAP) │
                        │  /blog        post তালিকা      │
                        │  /blog/[slug] post পাতা        │
                        └───────────────┬────────────────┘
                                        │ শুধু published post পড়ে
                                        ▼
   staff (authenticated)         ┌──────────────┐
        │                        │  DAL         │  ← একমাত্র DB প্রবেশপথ
        │  session cookie        │  lib/dal.ts  │     প্রতিটা call-এ auth যাচাই
        ▼                        └──────┬───────┘
   ┌─────────────────────┐              │
   │  proxy.ts           │              ▼
   │  optimistic check   │       ┌──────────────┐
   │  cookie আছে কিনা    │       │ MongoDB      │
   └──────────┬──────────┘       │ Atlas        │
              │                  │              │
              ▼                  │  staff       │
   ┌────────────────────────┐    │  posts       │
   │  ADMIN CONSOLE         │    └──────────────┘
   │  /admin/login          │
   │  /admin        overview│
   │  /admin/posts  CMS     │
   │  /admin/staff  (admin) │
   └────────────────────────┘
```

**দুটো entry point ইচ্ছাকৃতভাবে আলাদা:**

| | Public | Admin |
|---|---|---|
| Auth | নেই | session cookie বাধ্যতামূলক |
| CSS | `globals.css` (marketing) | `admin.css` (`.admin` scope) |
| Motion | GSAP (marketing site) | শুধু CSS transition — GSAP নয় (`13 §56`) |
| Indexing | indexable | `noindex` |
| Density | marketing whitespace | compact-medium |

## Application Flow

### Login (critical path)

```
1. POST  Server Action `login(email, password)`
2.       Zod validate  ─ fail → field error, DB ছোঁয়া হয় না
3.       staff.findOne({ email: normalized })
4.       না পেলে → dummy scrypt চালিয়ে generic error
         (timing দিয়ে email আছে কিনা বোঝা যাবে না)
5.       status !== 'active' → একই generic error
6.       verifyPassword() → timingSafeEqual
7.       createSession(staffId, role) → jose JWT → httpOnly cookie
8.       staff.updateOne({ lastLoginAt })
9.       redirect('/admin')
```

> ধাপ ৪-এর dummy hash গুরুত্বপূর্ণ: নইলে "email নেই" উত্তর দ্রুত আসে, "password ভুল" ধীরে — সেটাই user enumeration।

### Post publish

```
1. Server Action `savePost(formData)`
2. verifySession()      ← না থাকলে redirect
3. Zod validate
4. authorId session থেকে   ← client-এর পাঠানো authorId কখনো নয়
5. status='published' এবং আগে publishedAt নেই → publishedAt = now
6. posts.updateOne(upsert)
   └─ duplicate slug (E11000) → field error, 500 নয়
7. revalidatePath('/blog') + revalidatePath('/blog/'+slug)
8. redirect('/admin/posts')
```

## Folder Structure

```
app/
├── layout.tsx                  # root — font, paint guard (অপরিবর্তিত)
├── globals.css                 # marketing CSS (অপরিবর্তিত)
├── page.tsx                    # homepage (অপরিবর্তিত)
├── motion-system.tsx           # GSAP (অপরিবর্তিত)
│
├── blog/                       # ── PUBLIC BLOG ──
│   ├── blog.css
│   ├── page.tsx                # তালিকা
│   └── [slug]/page.tsx         # একক post
│
└── admin/                      # ── CONSOLE ──
    ├── admin.css               # `.admin` scope, নিজস্ব token
    ├── layout.tsx              # shell (sidebar + header), noindex
    ├── page.tsx                # overview
    ├── login/
    │   ├── layout.tsx          # shell ছাড়া খালি layout
    │   └── page.tsx
    ├── posts/
    │   ├── page.tsx            # তালিকা
    │   ├── new/page.tsx
    │   ├── [id]/page.tsx       # edit
    │   └── _components/PostEditor.tsx
    ├── staff/
    │   ├── page.tsx            # admin only
    │   └── _components/StaffForm.tsx
    └── _components/            # console-জুড়ে shared
        ├── Sidebar.tsx
        ├── PageHeader.tsx
        ├── DataTable.tsx
        ├── StatusBadge.tsx
        └── SubmitButton.tsx

lib/
├── db.ts                       # MongoClient singleton (dev hot-reload safe)
├── session.ts                  # jose encrypt/decrypt, cookie
├── password.ts                 # scrypt hash/verify
├── dal.ts                      # verifySession · requireAdmin · সব query
├── markdown.ts                 # md → sanitized HTML
├── validation.ts               # Zod schema
└── types.ts

proxy.ts                        # root — optimistic /admin গার্ড
scripts/seed-admin.mjs          # প্রথম admin বানানোর CLI
```

> **কেন route group (`(site)`) ব্যবহার করিনি:** homepage আর root layout কাজ করছে — সেটা নাড়ালে GSAP paint-guard, font variable ও Lighthouse tuning ঝুঁকিতে পড়ে (`00 §88 — do not rewrite working systems`)। Admin-এর CSS `.admin` class-এ scope করা, তাই collision নেই।

## Technology Stack

| স্তর | পছন্দ | কেন এটাই |
|---|---|---|
| Framework | Next.js 16.3 (App Router) | ইতিমধ্যে আছে |
| UI | React 19.2 Server Components | Default server; `"use client"` কেবল editor ও menu-তে |
| DB | MongoDB Atlas | ব্যবহারকারীর সিদ্ধান্ত (2026-09-01) |
| Driver | official `mongodb` | Zod ইতিমধ্যে validate করছে, তাই Mongoose-এর schema স্তর duplicate হতো |
| Session | `jose` (HS256 JWT) | Next auth guide-এর সরাসরি সুপারিশ; edge-compatible |
| Password | `node:crypto` scrypt | **শূন্য dependency**। bcrypt native build চায় (Windows-এ ঝামেলা), bcryptjs ধীর ও বাড়তি dep |
| Validation | `zod` | Server-side input validation — NFR-security-এর দাবি |
| Icons | `lucide-react` | `13 §39`-এর সরাসরি সুপারিশ; একটাই consistent outline family |
| Markdown | `marked` + `sanitize-html` | FR-3.10 — কাঁচা HTML pass-through নিষেধ |
| Styling | plain CSS, token-driven | Project-এ কোনো CSS framework ব্যবহৃত হচ্ছে না; Tailwind শুধু import করা আছে কিন্তু কোনো utility class নেই |
| State | `useActionState` + `useState` | `07 §67–69` — অকারণে client query library নয় |
| Forms | Server Actions | React Hook Form দরকার নেই: form ছোট, validation server-side |

### যেসব library **যোগ করিনি** এবং কেন

| Library | কেন নয় |
|---|---|
| Mongoose | Zod ইতিমধ্যে shape যাচাই করছে; দুই জায়গায় schema = drift |
| NextAuth / Auth.js | একটাই provider (email+password), একটাই DB। পুরো framework-এর তুলনায় ~80 লাইন DAL সহজ ও স্বচ্ছ |
| React Hook Form | Form ছোট; `useActionState` যথেষ্ট (`07 §65` "library-র চেয়ে form UX গুরুত্বপূর্ণ") |
| TanStack Query | Server Component-ই data আনছে (`07 §67`) |
| shadcn / কোনো UI kit | `13 §0` — "must not feel like a shadcn demo" |
| Tailwind utility | Project প্লেইন CSS-এ; ecosystem বদলানো `00 §88`-এর বিরুদ্ধে |

## Database Design

```
┌────────────────────┐          ┌─────────────────────┐
│ staff              │          │ posts               │
├────────────────────┤          ├─────────────────────┤
│ _id        ObjectId│◀────┐    │ _id         ObjectId│
│ name       string  │     │    │ title       string  │
│ email      string ⚿│     └────│ authorId    ObjectId│
│ passwordHash string│          │ authorName  string  │  ← denormalized
│ role       enum    │          │ slug        string ⚿│
│ status     enum    │          │ excerpt     string  │
│ createdAt  Date    │          │ content     string  │  ← markdown উৎস
│ updatedAt  Date    │          │ coverImage  string? │
│ lastLoginAt Date?  │          │ tags        string[]│
└────────────────────┘          │ status      enum    │
                                │ publishedAt Date?   │
   ⚿ = unique index             │ createdAt   Date    │
                                │ updatedAt   Date    │
                                └─────────────────────┘
```

### Index

| Collection | Index | কেন |
|---|---|---|
| `staff` | `{ email: 1 }` unique | Login lookup + duplicate ঠেকানো |
| `posts` | `{ slug: 1 }` unique | Public route lookup + FR-3.3 |
| `posts` | `{ status: 1, publishedAt: -1 }` | `/blog` তালিকার প্রধান query |
| `posts` | `{ updatedAt: -1 }` | Admin তালিকা |

### অলঙ্ঘনীয় ডেটা নিয়ম

1. **`passwordHash` কখনো collection-এর বাইরে যাবে না** — প্রতিটা staff query-তে explicit projection, `findOne()` করে পরে delete নয়
2. **`authorName` denormalized রাখা হয়** — staff disable/rename হলেও পুরনো post-এর কৃতিত্ব ঠিক থাকে; `authorId` link হিসেবে রাখা
3. **`publishedAt` একবারই বসে** — পুনঃপ্রকাশে বদলায় না, নইলে blog-এর ক্রম এলোমেলো হয়
4. **`status` কখনো client input থেকে সরাসরি নয়** — কোন action ডাকা হয়েছে (save vs publish) তা থেকে server ঠিক করে
5. **`ObjectId` client-এ যাওয়ার আগে string** — RSC boundary-তে ObjectId serialize হয় না
6. **Delete শুধু post-এ** — staff কখনো delete নয়, `disabled` হয় (নিয়ম ২-এর কারণে)

## API Architecture

কোনো public REST API নেই। সব mutation **Server Action**, সব read **Server Component**।

| কাজ | কী | Auth |
|---|---|---|
| Login | action `login` | public |
| Logout | action `logout` | session |
| Post save/publish | action `savePost` | session |
| Post delete | action `deletePost` | session |
| Staff create | action `createStaff` | **admin** |
| Staff update | action `updateStaff` | **admin** |
| Blog তালিকা/পাতা | Server Component | public (published only) |

### Error envelope (Server Action-এর return)

```ts
type ActionState =
  | { ok: true }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string> }
```

`redirect()` throw করে, তাই সফল হলে সাধারণত কিছু return হয় না।

| পরিস্থিতি | আচরণ |
|---|---|
| Validation fail | `fieldErrors` — input-এর নিচে দেখাবে |
| ভুল credential | `formError: "Invalid email or password"` |
| Duplicate slug/email | `fieldErrors.slug` / `.email` |
| Session নেই | `redirect('/admin/login')` |
| Role নেই | `forbidden` UI (403) |
| DB down | `formError` — retry করার কথা সহ (`13 §59`) |

## Authentication Flow

```
Registration : নেই। প্রথম admin `scripts/seed-admin.mjs` দিয়ে,
               বাকিরা admin console থেকে।

Login        : FR-1.x (উপরে "Application Flow" দ্রষ্টব্য)

Session      : jose HS256 JWT, payload { staffId, role, expiresAt }
               cookie: session · httpOnly · secure · sameSite=lax · path=/ · 7d

Authorization: দুই স্তর
               ┌ proxy.ts     — cookie আছে কিনা (optimistic, দ্রুত)
               └ DAL          — JWT verify + role (প্রকৃত সীমানা)
```

> **Proxy কেন যথেষ্ট নয়:** Next docs স্পষ্ট বলে proxy "should not be used as a full session management or authorization solution"। ওখানে DB call বা ভারী যাচাই করলে প্রতিটা request ধীর হয়, আর static route-এ চলেই না। তাই সীমানা DAL-এ।

## Deployment Architecture

| Env | কী |
|---|---|
| Development | `npm run dev` (Turbopack) · Atlas dev cluster · `.env.local` |
| Production | DECISION-PENDING (নিচে) |

### Environment variables

| নাম | কী | উদাহরণ |
|---|---|---|
| `MONGODB_URI` | Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB` | Database নাম | `revopstree` |
| `SESSION_SECRET` | JWT signing key, ৩২+ byte | `openssl rand -base64 32` |

সবগুলোই server-only। **কোনোটিতে `NEXT_PUBLIC_` prefix দেওয়া যাবে না।**

> **DECISION-PENDING:** Production hosting — বিকল্প: Vercel (Next-এর নিজের platform, শূন্য কনফিগ) · VPS + `next start` · Docker।
> **সুপারিশ:** Vercel — Atlas-এর সাথে নেটওয়ার্ক দূরত্ব কম রাখতে region একই রাখতে হবে।
> **কবে:** প্রথম post publish করার আগে।

> **DECISION-PENDING:** Atlas network access — dev-এ `0.0.0.0/0` সহজ কিন্তু production-এ hosting provider-এর IP range-এ সীমিত করা উচিত।
> **কবে:** deploy-এর সময়।

## Third-Party Services

| Service | কোন phase | কোন file-এর পেছনে |
|---|---|---|
| MongoDB Atlas | 1 | `lib/db.ts` — driver-এর একমাত্র স্পর্শবিন্দু |
| (ভবিষ্যৎ) image CDN | পরে | `lib/uploads.ts` — এখনো নেই |

## Scalability

| কোথায় চাপ | আজকের সমাধান | পরে কী |
|---|---|---|
| `/blog` প্রতি request-এ DB query | Compound index + Next cache | পোস্ট বাড়লে `cacheLife` / ISR |
| Post তালিকা সব একসাথে | আপাতত ঠিক (post কম) | ৫০+ হলে pagination |
| Serverless-এ DB connection | Global client cache | Atlas-এ pool size সীমিত করা |
| Markdown প্রতি render-এ parse | Post পাতা cache হয় | দরকার হলে `contentHtml` DB-তে জমানো |
| Session যাচাই | Stateless JWT, DB hit নেই | তৎক্ষণাৎ revoke লাগলে DB session |

> **সচেতন ট্রেড-অফ:** JWT stateless বলে staff disable করলে তার চালু session ৭ দিন পর্যন্ত টিকতে পারে। ছোট টিমে গ্রহণযোগ্য; জরুরি হলে `SESSION_SECRET` বদলালে সব session একসাথে বাতিল হয়। `memory.md`-তে A6 হিসেবে নথিভুক্ত।
