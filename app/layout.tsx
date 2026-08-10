import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RevopsTree | Autonomous Revenue Infrastructure",
  description: "Revenue automation, web and app development, WordPress, Shopify, CMS, SaaS, AI lead agents, and live revenue intelligence.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

// Runs before first paint so the hero can't flash in fully-formed before GSAP takes over.
// Opted out entirely for reduced-motion visitors, and self-clears if hydration never happens.
const paintGuard = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var e=document.documentElement;e.setAttribute("data-motion","");setTimeout(function(){e.removeAttribute("data-motion")},2500)}}catch(err){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <Script id="motion-paint-guard" strategy="beforeInteractive">{paintGuard}</Script>
      </body>
    </html>
  );
}
