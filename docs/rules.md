---
title: RevOpsTree — Rules
product: RevOpsTree
type: Rules
status: Draft v1
created: 2026-09-01
updated: 2026-09-01
---

# Rules

## ⚠️ Framework gotchas — Next.js 16.3 / React 19.2

> **এই table-টা সবার আগে পড়ো।** এগুলো বেশিরভাগ AI-এর training data-র চেয়ে নতুন। মুখস্থ পুরনো API লিখলে এখানে ভাঙবে।
> যাচাই করা হয়েছে `node_modules/next/dist/docs/`-এ, 2026-09-01।

| বিষয় | ❌ পুরনো / ভুল | ✅ Next 16.3-এ সঠিক |
|---|---|---|
| Proxy/Middleware | `middleware.ts`, `export function middleware()` | **`proxy.ts`**, `export function proxy()` — 16-এ rename হয়েছে |
| Route params | `{ params }: { params: { slug: string } }` | `PageProps<'/blog/[slug]'>`, আর **`await props.params`** — params এখন Promise |
| Layout props | হাতে লেখা `{ children }` type | `LayoutProps<'/admin'>` — global helper, `next dev`/`next build` generate করে |
| `cookies()` | `cookies().get(...)` | **`(await cookies()).get(...)`** — async |
| `headers()` | `headers().get(...)` | **`await headers()`** |
| Cache invalidation | শুধু `revalidatePath` জানা | `updateTag` (read-your-own-writes, Server Action-only) · `revalidateTag` (SWR) · `revalidatePath` · `refresh` |
| Inline `<script>` | JSX-এ কাঁচা `<script>` | `next/script` + `strategy` + `id` — নইলে hydration error |
| Server Action parallel | client থেকে `Promise.all` | কাজ করবে না — client dispatcher **sequential**। একটাই action-এর ভেতরে parallel করো |
| Form state | `useFormState` (react-dom) | **`useActionState`** (react) |
| Pending state | নিজে `useState` | `useActionState`-এর তৃতীয় return, বা `useFormStatus` |

অন্যান্য যা মনে রাখতে হবে:

- Server Action **সবসময়** একটা public POST endpoint। UI-তে button না দেখানো কোনো নিরাপত্তা নয় — প্রতিটা action নিজে auth যাচাই করবে
- Server Action-এর return value client-এ serialize হয় — সেখানে কখনো raw DB document দেবে না
- `redirect()` throw করে; তার পরের কোড চলে না। `revalidatePath` সবসময় `redirect`-এর **আগে**
- MongoDB `ObjectId` RSC boundary পার হয় না — client-এ যাওয়ার আগে `.toString()`

## Coding Standards

- **Server Component default।** `"use client"` কেবল যেখানে state/event/browser API লাগে (এই project-এ: post editor, mobile nav, delete confirm)
- **Business logic কোথায় থাকবে:** `lib/dal.ts` — DB query ও auth। Component-এ কখনো সরাসরি `db` import নয়
- **Business logic কোথায় থাকবে না:** `page.tsx`-এ। Page = assembler (`12 §1`)
- একটা file ৩০০ লাইন ছাড়ালে ভাগ করার কথা ভাবো
- Component বানাও যখন reuse হবে, বা readability বাড়াবে — প্রতিটা `<div>`-এর জন্য নয় (`12 §11`)

## Naming Conventions

| কী | Convention | উদাহরণ |
|---|---|---|
| Component file | PascalCase | `PostEditor.tsx` · `StatusBadge.tsx` |
| lib / util file | kebab-case | `seed-admin.mjs` · `db.ts` |
| Route folder | lowercase | `app/admin/posts/` |
| Route-private folder | `_` prefix | `_components/` |
| Component | PascalCase | `DataTable` |
| Function | camelCase, verb-first | `verifySession()` · `getPublishedPosts()` |
| Server Action | camelCase, verb | `savePost` · `createStaff` |
| Type / Interface | PascalCase | `Post` · `StaffRole` |
| Constant | SCREAMING_SNAKE | `SESSION_COOKIE` · `SESSION_DURATION_MS` |
| Boolean | `is` / `has` / `can` | `isPublished` · `canManageStaff` |
| CSS class (admin) | kebab, `a-` prefix | `.a-table` · `.a-sidebar` |
| MongoDB field | camelCase | `publishedAt` · `passwordHash` |

> **`a-` prefix কেন:** admin CSS আর marketing `globals.css` একই document-এ থাকে। Prefix ছাড়া `.button` / `.card` collide করত।

## File Organization

`12 - Project architecture`-এর decision table মেনে:

| প্রশ্ন | কোথায় |
|---|---|
| Route? | `app/` |
| একাধিক route-এ reuse? | `components/` (এই project-এ এখনো লাগেনি) |
| একটাই route-এ? | `app/<route>/_components/` |
| Console-জুড়ে shared? | `app/admin/_components/` |
| DB / auth / helper? | `lib/` |
| Type? | `lib/types.ts` |

### Import order

```ts
// 1. react / next
import { cache } from "react";
import { cookies } from "next/headers";
// 2. third-party
import { z } from "zod";
// 3. internal (@/)
import { getDb } from "@/lib/db";
// 4. relative
import PostEditor from "./_components/PostEditor";
// 5. css
import "./admin.css";
```

Path alias: `@/*` → repo root (tsconfig-এ ইতিমধ্যে আছে)।

## Component Structure

একটা আদর্শ admin component:

```tsx
import type { Post } from "@/lib/types";

type PostRowProps = {
  post: Post;
  canDelete: boolean;
};

// একটাই দায়িত্ব: একটা post row রেন্ডার করা। Fetch করে না, mutate করে না।
export default function PostRow({ post, canDelete }: PostRowProps) {
  return (
    <tr className="a-row">
      <td>{post.title}</td>
      {canDelete && <td>{/* action */}</td>}
    </tr>
  );
}
```

নিয়ম:
- Props explicit type, `any` নয়
- Data component-এর ভেতরে fetch নয় — উপর থেকে props-এ আসবে
- Hard-code করা content নয়, props (`12 §6`)
- `"use client"` file-এর একদম উপরে, আর কেবল প্রয়োজনে

## Preferred Libraries

| কাজ | কী |
|---|---|
| DB | `mongodb` (official driver) |
| Session JWT | `jose` |
| Password | `node:crypto` scrypt — **কোনো dependency নয়** |
| Validation | `zod` |
| Icon | `lucide-react` |
| Markdown | `marked` + `sanitize-html` |
| Form state | `useActionState` |

## Libraries to Avoid

| Library | কেন |
|---|---|
| `bcrypt` | Native build; Windows-এ ভাঙে। scrypt stdlib-এ আছে |
| Mongoose | Zod ইতিমধ্যে validate করছে; দুই schema = drift |
| NextAuth | একটাই provider-এর জন্য অতিরিক্ত; DAL স্বচ্ছতর |
| shadcn / MUI / Chakra | `13 §0` — "must not feel like a shadcn demo" |
| Tailwind utility class | Project প্লেইন CSS-এ (`00 §88`) |
| GSAP **admin-এ** | `13 §56` — dashboard-এ CSS transition যথেষ্ট। Marketing site-এ GSAP থাকবে |
| `dangerouslySetInnerHTML` sanitize ছাড়া | XSS |

## Error Handling

```ts
// Server Action-এর একমাত্র return আকার
type ActionState =
  | { ok: true }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string> };
```

| পরিস্থিতি | করণীয় |
|---|---|
| Validation fail | `fieldErrors` — সংশ্লিষ্ট input-এর নিচে |
| Duplicate key (E11000) | ধরতেই হবে → field error। কখনো 500 নয় |
| Auth নেই | `redirect('/admin/login')` |
| Role নেই | 403 UI |
| অপ্রত্যাশিত | `console.error` + ব্যবহারকারীকে actionable বার্তা |

**Error message নিয়ম (`13 §59`):** কী হয়েছে + কী করা যায়। শুধু "Something went wrong" নয়।

### কখনো log করবে না

```
password · passwordHash · SESSION_SECRET · MONGODB_URI · session JWT · cookie header
```

## Security Rules

1. প্রতিটা Server Action **নিজে** `verifySession()` ডাকবে — caller-এর উপর ভরসা নয়
2. Staff management action-এ `requireAdmin()`
3. Client থেকে আসা `role`, `authorId`, `status` **কখনো** বিশ্বাস নয় — session/action থেকে নেওয়া
4. Client identity নয়, **reference** পাঠাবে (postId), বাকিটা server DB থেকে পড়বে
5. সব input Zod-এ validate — client validation শুধু UX
6. Password: scrypt + ১৬-byte random salt; যাচাই `timingSafeEqual`
7. Login-এ email-না-পাওয়া ক্ষেত্রেও dummy hash চালাবে (timing leak ঠেকাতে)
8. ভুল email আর ভুল password — **একই** বার্তা
9. `passwordHash` কোনো query-র projection-এ থাকবে না
10. Secret শুধু `.env.local`; `NEXT_PUBLIC_` কখনো নয়। `.env*` ইতিমধ্যে gitignore-এ
11. Markdown → HTML সবসময় sanitize
12. Cookie: `httpOnly` + `secure` + `sameSite=lax`
13. Admin route `noindex`
14. Session payload-এ শুধু `staffId` · `role` · `expiresAt`

## Performance Guidelines

- Public blog পাতা Server Component — client JS প্রায় শূন্য
- MongoDB client global cache — dev hot-reload-এ pool leak ঠেকাতে
- Query-তে explicit projection — পুরো document টানা নয়
- `revalidatePath` publish-এর পরে, `redirect`-এর আগে
- Admin CSS শুধু `app/admin/*`-এ import — public bundle-এ যাবে না
- Icon named import (`import { Plus } from "lucide-react"`) — tree-shake হয়

### কী cache করা নিষেধ

- `verifySession()`-এর ফল request-এর বাইরে (React `cache()` শুধু এক render pass-এ)
- Staff/session-নির্ভর কিছু `revalidate` দিয়ে
- Draft post কোনো public cache-এ

## Testing Guidelines

আপাতত automated test নেই (স্বীকৃত ফাঁক — `memory.md` Known Issues)। ম্যানুয়ালি যাচাই না করে merge করা যাবে না:

- [ ] ভুল password → generic error, session তৈরি হয়নি
- [ ] Editor `/admin/staff`-এ গেলে 403
- [ ] Editor-এর session নিয়ে `createStaff` সরাসরি ডাকলেও 403
- [ ] Draft post `/blog` আর `/blog/[slug]` দুটোতেই অনুপস্থিত
- [ ] Duplicate slug → field error, 500 নয়
- [ ] শেষ admin disable/demote করা যায় না
- [ ] Logout-এর পরে `/admin` → login
- [ ] Admin UI: 1440 · 1280 · 768 · 390 (`13 §69`)

## Git Rules

| | |
|---|---|
| Branch | `feat/admin-panel` · `fix/<কী>` |
| Commit | imperative, ৭২ অক্ষরের নিচে |
| কখনো commit নয় | `.env.local` · `node_modules` · `.next` |

`AGENTS.md` block টা `next dev` নিজে লেখে — diff থেকে সরালে আবার ফিরে আসবে; কাজের সাথে commit করাই পরিষ্কার।

## AI Development Rules

### সবসময় করবে

1. কোড লেখার আগে `node_modules/next/dist/docs/` পড়ো — উপরের gotcha table কেবল সারাংশ
2. নতুন component বানানোর আগে বিদ্যমানটা খোঁজো (`00 §87`)
3. আশেপাশের কোডের style অনুসরণ করো — এই repo-তে compact plain CSS, inline SVG, minimal dependency
4. Server Component default রাখো
5. প্রতিটা action-এ auth যাচাই
6. UI "শেষ" বলার আগে ব্রাউজারে চোখে দেখো (`13 §69`)
7. কাজ শেষে `phases.md` ও `memory.md` update করো

### কখনো করবে না

1. কাজ করছে এমন কোড না বলে rewrite (marketing page, GSAP, root layout)
2. প্রতিষ্ঠিত architecture বদলানো — আগে জিজ্ঞেস
3. না জিজ্ঞেস করে dependency যোগ
4. Placeholder/mock দিয়ে "শেষ" বলা — কী বাকি স্পষ্ট বলো
5. সম্পর্কহীন file "ঠিক" করা
6. Fake data — testimonial, logo, statistic, metric (`00 §93–94`, `13 §45`)
7. `.env.local` commit বা secret print
8. Marketing site-এর `--blue` / `--orange` token admin-এ অন্ধভাবে ব্যবহার — console-এর নিজস্ব scale আছে
9. Admin-এ decorative UI — gradient blob, glass panel, ৩-stat card (`13 §45`)
