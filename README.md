# ⚡ RevopsTree — Autonomous Revenue Infrastructure

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<p align="center">
  <strong>Stop fighting your tech stack. Automate your revenue.</strong><br>
  Enterprise-grade revenue operations, CRM architecture, AI booking agents, and end-to-end automation engineered for modern, scaling agencies.
</p>

[Explore Services](#-core-services-14-departments) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack--architecture) • [Motion System](#-motion-system--performance) • [Integrations](#-supported-integrations)

</div>

---

## 📖 Overview

**RevopsTree** is a Next.js 16 web application and technical platform built for agencies and high-growth businesses. It delivers an autonomous revenue backend — unifying CRMs, AI conversational agents, smart workflows, and live attribution dashboards into one cohesive engine.

### Why RevopsTree?
* **Zero Leakage:** Connects disconnected tools (CRMs, lead capture forms, schedulers, and payment processors) with instant server-side data sync.
* **Sub-Minute Speed-to-Lead:** Deploys 24/7 AI voice and chat agents that qualify prospects and book meetings in under 40 seconds.
* **Server-Side Attribution:** Bridges the gap between ad spend and actual closed-won revenue with real-time ROI telemetry.
* **30-Day Launch Sprint:** Complete audit, custom architecture build, and live deployment in 30 days.

---

## 🚀 Key Features

* **⚡ Command Center Visualizer:** Interactive live revenue dashboard simulating pipeline metrics, speed-to-lead telemetry, and autonomous event flows (`AD → n8n → GHL → AI → ROI`).
* **🎬 High-Performance GSAP Motion System:** Handcrafted scroll-driven reveals, SplitText typography animations, cursor-follower glows, magnetic buttons, and dynamic SVG trajectory draws.
* **🛡️ Zero-FOUC Paint Guard:** Inline SSR paint-guard script preventing hydration flash and respecting `prefers-reduced-motion` preferences.
* **💼 14 Revenue & Development Capabilities:** Modular department-as-a-service grid spanning CRM architecture, full-stack web/app/SaaS builds, Shopify, WordPress, and custom API bridges.
* **📱 Responsive & Accessible UI:** Mobile drawer menu, micro-interactions, dark glassmorphic styling, and semantic HTML structure.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.3 (App Router)](https://nextjs.org/) | Server Components, Turbopack, and Next.js font optimization |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type-safety across components and animation systems |
| **Library** | [React 19](https://react.dev/) | Modern concurrent rendering and hooks |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & CSS Tokens | Glassmorphism, CSS grid layouts, and custom design tokens |
| **Animation Engine** | [GSAP 3.15](https://greensock.com/) | ScrollTrigger, SplitText, DrawSVG, and matchMedia responsive motion |
| **Typography** | [Geist & Geist Mono](https://vercel.com/font) | Clean, technical variable typography via `next/font` |
| **Package Manager** | `pnpm` / `npm` | Fast, deterministic dependency management |

---

## 📂 Project Structure

```text
revops/
├── .claude/                # Agent configurations and launch profiles
├── app/
│   ├── favicon.ico         # Application favicon
│   ├── globals.css         # Global stylesheet, design system tokens, and layouts
│   ├── icon.svg            # Vector branding mark
│   ├── layout.tsx          # Root layout with font injection & motion paint-guard
│   ├── motion-system.tsx   # Custom GSAP animation controller & lifecycle hooks
│   └── page.tsx            # Main landing page & interactive visual sections
├── public/                 # Static public assets
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js compiler & build settings
├── package.json            # Dependencies and npm scripts
├── pnpm-lock.yaml          # Pnpm lockfile
├── postcss.config.mjs      # PostCSS & Tailwind v4 plugin config
└── tsconfig.json           # TypeScript configuration
```

---

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js 18+ or 20+ installed on your machine.

* Node.js: `>= 18.18.0` (or `20.x` / `22.x` recommended)
* Package Manager: `pnpm` (recommended), `npm`, `yarn`, or `bun`

### 1. Clone the Repository

```bash
git clone https://github.com/Foxses-Studio/revopstree.git
cd revopstree
```

### 2. Install Dependencies

Using **pnpm**:
```bash
pnpm install
```

Or using **npm**:
```bash
npm install
```

### 3. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server with hot reload |
| `pnpm build` | Compiles and builds the production-ready application |
| `pnpm start` | Runs the production server after building |
| `pnpm lint` | Runs ESLint to check for code quality and syntax issues |

---

## 💼 Core Services (14 Departments)

RevopsTree provides end-to-end technical departments as a service:

1. **Elite CRM Architecture:** Complete lead journey from opt-in to closed-won, migrated and optimized inside your CRM.
2. **AI Booking Agents:** 24/7 Voice and chat qualification agents that fill calendars from ads and social comments.
3. **Content & Social Engine:** Multi-channel automated scheduling and distribution pipelines.
4. **Real-Time ROI Dashboards:** Live command centers for speed-to-lead, close rate, and revenue attribution.
5. **Email Automation:** Personalized, trigger-based lifecycle campaigns adapting to real-time behavior.
6. **Landing Page Systems:** Ultra-fast, high-converting mobile-first landing pages with CRM handoffs.
7. **SMS Messaging:** Two-way conversational SMS workflows for appointment reminders and nurturing.
8. **Revenue Operations:** Server-side tracking closing the loop between ad spend and closed deals.
9. **Web Development:** Modern, SEO-optimized, responsive web applications built with Next.js.
10. **App Development:** Tailored web and mobile applications simplifying complex operational workflows.
11. **WordPress Development:** Custom themes, headless setups, and speed-optimized WordPress architectures.
12. **Shopify Development:** High-converting eCommerce storefronts with custom sections and checkout flows.
13. **CMS Development:** Headless content modeling and scalable publishing platforms.
14. **SaaS Development:** MVP development, subscription infrastructure, and secure scalable backends.

---

## 🔌 Supported Integrations

RevopsTree bridges and synchronizes across leading platforms:

* **CRMs & Sales:** GoHighLevel (GHL), HubSpot, Salesforce
* **Workflow Automation:** n8n, Make (Integromat), Zapier
* **AI & Voice Models:** OpenAI (GPT-4o), Google Gemini, Retell AI, ElevenLabs
* **Payments & Billing:** Stripe, Chargebee
* **Call Tracking & Data:** CallRail, Meta Conversions API, Google Ads API, Google Tag Manager

---

## ⚡ Motion System & Performance

The animation system in `app/motion-system.tsx` is built for 60fps cinematic fluidity:

* **Paint Guard (`layout.tsx`):** Pre-paint execution prevents FOUC (Flash of Unstyled Content) before GSAP initialises.
* **Accessibility:** Automatically checks `window.matchMedia("(prefers-reduced-motion: reduce)")` to disable intense transitions for sensitive users.
* **Responsive Scopes:** GSAP `matchMedia` ensures desktop animations cleanly unbind and adapt on mobile viewport resize.
* **Auto-Split Headings:** Uses `SplitText` with resize-recalculating boundaries to ensure multi-line typography stays pixel-perfect across all screen ratios.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Contact

Distributed under the MIT License.

* **Agency:** RevopsTree ([Foxses Studio](https://github.com/Foxses-Studio))
* **Email:** [hello@revopstree.com](mailto:hello@revopstree.com)
* **Website:** [https://github.com/Foxses-Studio/revopstree](https://github.com/Foxses-Studio/revopstree)

---

<div align="center">
  <sub>Built with ❤️ by Foxses Studio & RevopsTree Team.</sub>
</div>
