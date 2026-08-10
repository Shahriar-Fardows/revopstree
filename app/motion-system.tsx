"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

/** useLayoutEffect on the client, useEffect during SSR (avoids the hydration warning). */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const EASE = "power3.out";
const REVEAL_EASE = "expo.out";
const INTRO_DELAY = 0.12;

/** Elements enter when they are ~15% into the viewport. */
const enter = (trigger: Element | string, start = "top 85%"): ScrollTrigger.Vars => ({
  trigger,
  start,
  once: true,
});

export default function MotionSystem() {
  const glowRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Scoped to this mount: the intro plays once, but is not replayed when a
    // matchMedia condition flips (e.g. resizing across the desktop breakpoint).
    let introPlayed = false;
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 901px)",
        finePointer: "(pointer: fine)",
      },
      (self) => {
        const { motion, desktop, finePointer } = self.conditions as {
          motion: boolean;
          desktop: boolean;
          finePointer: boolean;
        };

        // Reduced motion: nothing is hidden, nothing moves. The page renders as authored.
        if (!motion) return;

        const q = <T extends Element = HTMLElement>(selector: string) =>
          gsap.utils.toArray<T>(selector);
        const one = (selector: string) => document.querySelector<HTMLElement>(selector);
        const splits: SplitText[] = [];
        const teardown: Array<() => void> = [];

        /* ---------------------------------------------------------------- *
         * Helpers
         * ---------------------------------------------------------------- */

        /**
         * Line-by-line masked reveal for a major heading. `autoSplit` re-splits on
         * resize / font load and restores the playhead, so reveals never replay.
         */
        const revealHeading = (
          selector: string,
          { trigger, ...vars }: gsap.TweenVars & { trigger?: ScrollTrigger.Vars | false } = {},
        ) => {
          const heading = one(selector);
          if (!heading) return;

          const scrollTrigger = trigger === false ? undefined : trigger ?? enter(heading);

          splits.push(
            SplitText.create(heading, {
              type: "lines",
              mask: "lines",
              linesClass: "reveal-line",
              autoSplit: true,
              onSplit: (instance) =>
                gsap.from(instance.lines, {
                  yPercent: 115,
                  duration: 1.05,
                  ease: REVEAL_EASE,
                  stagger: 0.09,
                  ...(scrollTrigger ? { scrollTrigger } : null),
                  ...vars,
                }),
            }),
          );
        };

        /** Fade-up for supporting copy (kickers, paragraphs, list items). */
        const revealCopy = (selector: string, vars: gsap.TweenVars = {}) => {
          const targets = q(selector);
          if (!targets.length) return;
          gsap.from(targets, {
            y: 26,
            opacity: 0,
            duration: 0.85,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: enter(targets[0]),
            ...vars,
          });
        };

        /** Counts a number up to the value already written in the markup. */
        const countUp = (element: HTMLElement, timeline: gsap.core.Timeline, at: string | number) => {
          const original = element.textContent ?? "";
          if (original.includes(":")) return; // clock-style values ("00:40") stay put
          const match = original.match(/\d[\d,]*(\.\d+)?/);
          if (!match) return;

          const raw = match[0];
          const target = Number(raw.replace(/,/g, ""));
          if (!Number.isFinite(target)) return;

          const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
          const grouped = raw.includes(",");
          const counter = { value: 0 };

          timeline.to(
            counter,
            {
              value: target,
              duration: 1.3,
              ease: "power2.out",
              onUpdate: () => {
                const formatted = grouped
                  ? counter.value.toLocaleString("en-US", {
                      minimumFractionDigits: decimals,
                      maximumFractionDigits: decimals,
                    })
                  : counter.value.toFixed(decimals);
                element.textContent = original.replace(raw, formatted);
              },
              onComplete: () => {
                element.textContent = original;
              },
            },
            at,
          );
        };

        /** Idle loops are expensive off-screen — only run them while visible. */
        const whileVisible = (trigger: string, animation: gsap.core.Animation) => {
          const element = one(trigger);
          if (!element) return;
          animation.pause();
          ScrollTrigger.create({
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            onToggle: ({ isActive }) => (isActive ? animation.play() : animation.pause()),
          });
        };

        /**
         * Hover interaction shared by every button-like element. Uses `y`/`x` so it
         * never collides with entrance tweens (which use `yPercent`).
         */
        const attachButton = (element: HTMLElement, magnetic = false) => {
          const icon = element.querySelector("svg");
          gsap.set(element, { y: 0, x: 0 });
          if (icon) gsap.set(icon, { x: 0 });

          const moveY = gsap.quickTo(element, "y", { duration: 0.4, ease: EASE });
          const moveX = gsap.quickTo(element, "x", { duration: 0.4, ease: EASE });
          const moveIcon = icon ? gsap.quickTo(icon, "x", { duration: 0.4, ease: EASE }) : null;

          const onEnter = () => {
            moveY(-2);
            moveIcon?.(5);
          };
          const onLeave = () => {
            moveY(0);
            moveX(0);
            moveIcon?.(0);
          };
          const onMove = (event: PointerEvent) => {
            // Subtle magnetic pull — capped so it reads as polish, not as a gimmick.
            const box = element.getBoundingClientRect();
            const pullX = (event.clientX - (box.left + box.width / 2)) * 0.16;
            const pullY = (event.clientY - (box.top + box.height / 2)) * 0.22;
            moveX(gsap.utils.clamp(-10, 10, pullX));
            moveY(gsap.utils.clamp(-8, 8, pullY - 2));
          };
          const onDown = () => gsap.to(element, { scale: 0.97, duration: 0.18, ease: "power2.out" });
          const onUp = () => gsap.to(element, { scale: 1, duration: 0.35, ease: "power2.out" });

          element.addEventListener("pointerenter", onEnter);
          element.addEventListener("pointerleave", onLeave);
          element.addEventListener("pointerdown", onDown);
          element.addEventListener("pointerup", onUp);
          if (magnetic) element.addEventListener("pointermove", onMove);

          teardown.push(() => {
            element.removeEventListener("pointerenter", onEnter);
            element.removeEventListener("pointerleave", onLeave);
            element.removeEventListener("pointerdown", onDown);
            element.removeEventListener("pointerup", onUp);
            element.removeEventListener("pointermove", onMove);
          });
        };

        /* ---------------------------------------------------------------- *
         * 1. Page load — hero sequence
         * ---------------------------------------------------------------- */

        const firstLoad = !introPlayed;
        introPlayed = true;

        if (firstLoad) {
          const intro = gsap.timeline({
            defaults: { ease: EASE, duration: 0.9 },
            delay: INTRO_DELAY,
          });

          intro
            .from(".nav", { opacity: 0, duration: 0.6 }, 0)
            .from(
              ".nav .brand-mark i",
              { scaleY: 0, transformOrigin: "bottom", stagger: 0.07, duration: 0.55, ease: "power2.out" },
              0.1,
            )
            .from(".brand > span:last-child", { opacity: 0, x: -10, duration: 0.6 }, 0.18)
            .from(".nav-links a", { opacity: 0, y: -10, stagger: 0.06, duration: 0.6 }, 0.22)
            .from(".nav > .button", { opacity: 0, yPercent: -40, duration: 0.6 }, 0.34)
            .from(".nav-burger", { opacity: 0, yPercent: -40, duration: 0.6 }, 0.4)
            .from(".eyebrow", { opacity: 0, y: 16, duration: 0.7 }, 0.34)
            .from(".pulse", { scale: 0, duration: 0.6, ease: "back.out(2.2)" }, 0.5)
            .from(".hero-lead", { opacity: 0, y: 22 }, 0.72)
            .from(".hero-actions > *", { opacity: 0, yPercent: 45, stagger: 0.1, duration: 0.8 }, 0.84)
            .from(".promise > *", { opacity: 0, y: 14, stagger: 0.06, duration: 0.6 }, 1)
            // Hero graphic: scale + soft slide, then the dashboard layers on top of it.
            .from(".hero-visual", { opacity: 0, xPercent: 6, scale: 0.96, duration: 1.25 }, 0.45)
            .from(".dashboard", { opacity: 0, y: 26, scale: 0.97, duration: 1 }, 0.78)
            .from(".system-badge", { opacity: 0, duration: 0.6 }, 1)
            .from(".dash-head, .dash-kpis > div", { opacity: 0, y: 12, stagger: 0.07, duration: 0.6 }, 0.98)
            .from(
              ".bars i",
              { scaleY: 0, transformOrigin: "bottom", stagger: 0.04, duration: 0.75, ease: "power3.out" },
              1.12,
            )
            .from(".flow-card", { opacity: 0, y: 18, scale: 0.94, duration: 0.7, ease: "back.out(1.4)" }, 1.2)
            .from(".float-stat", { opacity: 0, x: 22, scale: 0.9, duration: 0.7, ease: "back.out(1.4)" }, 1.32)
            .from(".trust > *", { opacity: 0, y: 14, stagger: 0.05, duration: 0.7 }, 1.28);

          q(".dash-kpis strong").forEach((value, index) => countUp(value, intro, 1.05 + index * 0.06));
        }

        // Hero headline: staggered line reveal, kept outside the timeline so
        // SplitText can re-split (resize / font load) without restarting it.
        revealHeading(".hero h1", {
          trigger: false,
          duration: 1.15,
          stagger: 0.11,
          delay: firstLoad ? INTRO_DELAY + 0.33 : 0,
        });

        /* ---------------------------------------------------------------- *
         * 2. Ambient loops
         * ---------------------------------------------------------------- */

        whileVisible(
          ".hero-visual",
          gsap
            .timeline({ repeat: -1, repeatDelay: 1.6, delay: 2 })
            .to(".flow b", { scale: 1.09, y: -2, duration: 0.28, stagger: 0.13, ease: "power2.out" })
            .to(".flow b", { scale: 1, y: 0, duration: 0.35, stagger: 0.13, ease: "power2.inOut" }, 0.2),
        );

        whileVisible(
          ".hero-visual",
          gsap.to(".system-badge i, .live i", { opacity: 0.2, duration: 0.75, repeat: -1, yoyo: true }),
        );

        whileVisible(
          ".engine-map",
          gsap.to(".map-core", { y: -9, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" }),
        );

        whileVisible(
          ".engine-map",
          gsap.fromTo(
            ".map-core i",
            { scale: 1, opacity: 1 },
            { scale: 2.4, opacity: 0.15, duration: 1.1, repeat: -1, ease: "power1.out" },
          ),
        );

        /* ---------------------------------------------------------------- *
         * 3. Navbar on scroll
         * ---------------------------------------------------------------- */

        q(".nav-links a").forEach((link) => {
          gsap.set(link, { y: 0 });
          const moveY = gsap.quickTo(link, "y", { duration: 0.35, ease: EASE });
          const onEnter = () => moveY(-2);
          const onLeave = () => moveY(0);
          link.addEventListener("pointerenter", onEnter);
          link.addEventListener("pointerleave", onLeave);
          teardown.push(() => {
            link.removeEventListener("pointerenter", onEnter);
            link.removeEventListener("pointerleave", onLeave);
          });
        });

        /* ---------------------------------------------------------------- *
         * 4. Hero parallax
         * ---------------------------------------------------------------- */

        if (desktop) {
          gsap.to(".hero-visual", {
            yPercent: -7,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 },
          });

          gsap.to(".visual-grid", {
            backgroundPosition: "0px 90px",
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 },
          });

          gsap.to(".float-stat", {
            yPercent: -22,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
          });
        }

        /* ---------------------------------------------------------------- *
         * 5. Pain section
         * ---------------------------------------------------------------- */

        revealCopy(".pain .kicker");
        revealHeading(".pain h2");
        revealCopy(".pain .section-top > p", { delay: 0.1 });

        gsap.from(".pain-grid article", {
          yPercent: 9,
          opacity: 0,
          duration: 1,
          ease: EASE,
          stagger: 0.11,
          scrollTrigger: enter(".pain-grid", "top 82%"),
        });

        gsap.from(".leak-line i", {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.09,
          scrollTrigger: enter(".pain-grid", "top 70%"),
          delay: 0.35,
        });

        gsap.from(".mini-metrics span", {
          y: 14,
          opacity: 0,
          duration: 0.55,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: enter(".pain-grid", "top 70%"),
          delay: 0.45,
        });

        /* ---------------------------------------------------------------- *
         * 6. Engine section
         * ---------------------------------------------------------------- */

        revealCopy(".engine .kicker");
        revealHeading(".engine h2");
        revealCopy(".engine-grid > div:first-child > p", { delay: 0.1 });

        const engineList = gsap.timeline({ scrollTrigger: enter(".engine ul", "top 88%") });
        engineList
          .from(".engine li", { x: -18, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.1 })
          .from(
            ".engine li svg path",
            { drawSVG: "0%", duration: 0.5, ease: "power2.out", stagger: 0.1 },
            0.15,
          )
          .from(".engine .button", { yPercent: 40, opacity: 0, duration: 0.8, ease: EASE }, 0.35);

        // Engine map: clip-path wipe, then the nodes settle in around the core.
        gsap.from(".engine-map", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: enter(".engine-map", "top 82%"),
          onComplete() {
            gsap.set(".engine-map", { clearProps: "clipPath" });
          },
        });

        gsap.from(".map-core", {
          scale: 0.6,
          opacity: 0,
          duration: 0.9,
          ease: "back.out(1.6)",
          scrollTrigger: enter(".engine-map", "top 82%"),
          delay: 0.35,
        });

        gsap.from(".map-node", {
          y: 22,
          opacity: 0,
          scale: 0.94,
          duration: 0.65,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: enter(".engine-map", "top 82%"),
          delay: 0.5,
        });

        if (desktop) {
          q(".map-node").forEach((node, index) => {
            gsap.to(node, {
              yPercent: index % 2 === 0 ? -16 : 12,
              ease: "none",
              scrollTrigger: {
                trigger: ".engine",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            });
          });
        }

        /* ---------------------------------------------------------------- *
         * 7. Services grid
         * ---------------------------------------------------------------- */

        revealCopy(".services .kicker");
        revealHeading(".services h2");
        revealCopy(".services .section-top > p", { delay: 0.1 });

        const serviceCards = q(".services article");
        gsap.set(serviceCards, { yPercent: 7, opacity: 0 });
        ScrollTrigger.batch(serviceCards, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              yPercent: 0,
              opacity: 1,
              duration: 0.9,
              ease: EASE,
              stagger: 0.07,
              overwrite: true,
            }),
        });

        serviceCards.forEach((card) => {
          const symbol = card.querySelector<HTMLElement>(".service-symbol");
          gsap.set(card, { y: 0 });
          if (symbol) gsap.set(symbol, { y: 0, scale: 1 });

          const moveCard = gsap.quickTo(card, "y", { duration: 0.45, ease: EASE });
          const onEnter = () => {
            moveCard(-5);
            if (symbol) gsap.to(symbol, { y: -5, scale: 1.08, duration: 0.45, ease: EASE });
          };
          const onLeave = () => {
            moveCard(0);
            if (symbol) gsap.to(symbol, { y: 0, scale: 1, duration: 0.45, ease: EASE });
          };

          card.addEventListener("pointerenter", onEnter);
          card.addEventListener("pointerleave", onLeave);
          teardown.push(() => {
            card.removeEventListener("pointerenter", onEnter);
            card.removeEventListener("pointerleave", onLeave);
          });
        });

        /* ---------------------------------------------------------------- *
         * 8. Stats bar
         * ---------------------------------------------------------------- */

        const statsTimeline = gsap.timeline({ scrollTrigger: enter(".stats", "top 92%") });
        statsTimeline.from(".stats-grid > div", {
          y: 26,
          opacity: 0,
          duration: 0.8,
          ease: EASE,
          stagger: 0.09,
        });
        q(".stats-grid strong").forEach((value, index) => countUp(value, statsTimeline, 0.1 + index * 0.09));

        /* ---------------------------------------------------------------- *
         * 9. Case studies
         * ---------------------------------------------------------------- */

        revealCopy(".cases > .kicker");
        revealHeading(".cases > h2");

        gsap.from(".case-main", {
          yPercent: 4,
          opacity: 0,
          duration: 1,
          ease: EASE,
          scrollTrigger: enter(".case-grid", "top 82%"),
        });

        gsap.from(".case-copy > *", {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: EASE,
          stagger: 0.09,
          scrollTrigger: enter(".case-grid", "top 78%"),
          delay: 0.2,
        });

        // Clip-path wipe on the dark graphic panel, then the phone slides in.
        gsap.from(".case-graphic", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: enter(".case-grid", "top 80%"),
          onComplete() {
            gsap.set(".case-graphic", { clearProps: "clipPath" });
          },
        });

        gsap.from(".phone", {
          yPercent: 14,
          rotation: 9,
          opacity: 0,
          duration: 1.1,
          ease: EASE,
          scrollTrigger: enter(".case-grid", "top 80%"),
          delay: 0.25,
        });

        // Messages land in sequence, echoing the 40-second story they describe.
        gsap.from(".message", {
          y: 16,
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          ease: "back.out(1.4)",
          stagger: 0.22,
          scrollTrigger: enter(".case-graphic", "top 72%"),
          delay: 0.6,
        });

        const caseSide = gsap.timeline({ scrollTrigger: enter(".case-side", "top 82%") });
        caseSide
          .from(".case-side > .case-label, .case-side > h3, .case-side > p", {
            y: 24,
            opacity: 0,
            duration: 0.8,
            ease: EASE,
            stagger: 0.09,
          })
          .from(".case-side > div", { y: 22, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.12 }, 0.25);
        q(".case-side strong").forEach((value, index) => countUp(value, caseSide, 0.45 + index * 0.12));

        if (desktop) {
          gsap.to(".phone", {
            yPercent: -7,
            ease: "none",
            scrollTrigger: { trigger: ".case-main", start: "top bottom", end: "bottom top", scrub: 0.9 },
          });
        }

        /* ---------------------------------------------------------------- *
         * 10. Process
         * ---------------------------------------------------------------- */

        revealCopy(".process .kicker");
        revealHeading(".process h2");
        revealCopy(".process .section-top > p", { delay: 0.1 });

        const steps = gsap.timeline({ scrollTrigger: enter(".steps", "top 84%") });
        steps
          .from(".steps article", { y: 46, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.14 })
          .from(".steps article > span", { y: 18, opacity: 0, duration: 0.7, ease: EASE, stagger: 0.14 }, 0.15)
          .from(
            ".steps article > i",
            { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.16 },
            0.55,
          );

        /* ---------------------------------------------------------------- *
         * 11. Final CTA
         * ---------------------------------------------------------------- */

        const cta = gsap.timeline({ scrollTrigger: enter(".cta", "top 78%") });
        cta
          .from(".cta .kicker", { y: 24, opacity: 0, duration: 0.8, ease: EASE })
          .from(".cta p", { y: 24, opacity: 0, duration: 0.9, ease: EASE }, 0.45)
          .from(".cta .button-white", { yPercent: 45, opacity: 0, duration: 0.9, ease: EASE }, 0.55)
          .from(".cta small", { opacity: 0, duration: 0.8, ease: EASE }, 0.7)
          .from(".cta-orbit i", { scale: 0.72, opacity: 0, duration: 1.4, ease: "power3.out", stagger: 0.12 }, 0);

        revealHeading(".cta h2", { trigger: enter(".cta", "top 78%"), delay: 0.15 });

        whileVisible(
          ".cta",
          gsap.to(".cta-orbit i", {
            opacity: 0.45,
            duration: 4.5,
            stagger: 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }),
        );

        if (desktop) {
          gsap.to(".cta-orbit i", {
            scale: 1.14,
            ease: "none",
            stagger: 0.06,
            scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: 1 },
          });
        }

        /* ---------------------------------------------------------------- *
         * 12. Footer
         * ---------------------------------------------------------------- */

        gsap.from(".footer-grid > div", {
          y: 30,
          opacity: 0,
          duration: 0.85,
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: enter("footer", "top 88%"),
        });

        gsap.from(".footer-bottom", {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: EASE,
          scrollTrigger: enter("footer", "top 88%"),
          delay: 0.25,
        });

        /* ---------------------------------------------------------------- *
         * 13. Buttons & links
         * ---------------------------------------------------------------- */

        if (finePointer) {
          q(".button").forEach((button) => attachButton(button, desktop));
          q(".case-copy a").forEach((link) => attachButton(link));

          const textLink = one(".text-link");
          const play = one(".play");
          if (textLink && play) {
            gsap.set(play, { scale: 1 });
            const onEnter = () => gsap.to(play, { scale: 1.12, duration: 0.4, ease: EASE });
            const onLeave = () => gsap.to(play, { scale: 1, duration: 0.4, ease: EASE });
            textLink.addEventListener("pointerenter", onEnter);
            textLink.addEventListener("pointerleave", onLeave);
            teardown.push(() => {
              textLink.removeEventListener("pointerenter", onEnter);
              textLink.removeEventListener("pointerleave", onLeave);
            });
          }
        }

        /* ---------------------------------------------------------------- *
         * 14. Cursor glow (fine pointers only)
         * ---------------------------------------------------------------- */

        if (finePointer && glowRef.current) {
          const glow = glowRef.current;
          gsap.set(glow, { opacity: 1 });
          const glowX = gsap.quickTo(glow, "x", { duration: 0.55, ease: EASE });
          const glowY = gsap.quickTo(glow, "y", { duration: 0.55, ease: EASE });
          const onPointerMove = (event: PointerEvent) => {
            glowX(event.clientX);
            glowY(event.clientY);
          };
          window.addEventListener("pointermove", onPointerMove, { passive: true });
          teardown.push(() => window.removeEventListener("pointermove", onPointerMove));
        }

        return () => {
          teardown.forEach((fn) => fn());
          splits.forEach((split) => split.revert());
        };
      },
    );

    // Sticky navbar: solid background once you leave the top. Runs outside
    // gsap.matchMedia so reduced-motion visitors get a readable nav too.
    const navElement = document.querySelector(".nav");
    const onNavScroll = () => navElement?.classList.toggle("nav-scrolled", window.scrollY > 24);
    onNavScroll();
    window.addEventListener("scroll", onNavScroll, { passive: true });

    // Mobile menu: hamburger opens a sidebar from the right. Outside gsap.matchMedia
    // for the same reason — reduced-motion users get an instant open/close.
    const burger = document.querySelector<HTMLElement>(".nav-burger");
    const menu = document.querySelector<HTMLElement>(".mobile-menu");
    const backdrop = document.querySelector<HTMLElement>(".menu-backdrop");
    const closeButton = document.querySelector<HTMLElement>(".menu-close");
    const menuCleanup: Array<() => void> = [];

    if (burger && menu && backdrop && closeButton) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const links = gsap.utils.toArray<HTMLElement>(".menu-links a");
      const menuCta = menu.querySelector<HTMLElement>(".button");

      gsap.set(menu, { xPercent: 100 });
      const menuTimeline = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .set([menu, backdrop], { visibility: "visible" }, 0)
        .to(backdrop, { opacity: 1, duration: 0.4 }, 0)
        .to(menu, { xPercent: 0, duration: 0.55, ease: "power4.out" }, 0.02)
        // fromTo with explicit end values: .from() would capture whatever inline style
        // is current, which a torn-down previous mount can leave at opacity 0.
        .fromTo(
          [closeButton, ...links],
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.06, immediateRender: false },
          0.14,
        )
        .fromTo(
          menuCta,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, immediateRender: false },
          0.38,
        );

      let menuOpen = false;
      const openMenu = () => {
        if (menuOpen) return;
        menuOpen = true;
        document.body.style.overflow = "hidden";
        burger.setAttribute("aria-expanded", "true");
        menu.setAttribute("aria-hidden", "false");
        if (reduced.matches) menuTimeline.progress(1).pause();
        else menuTimeline.timeScale(1).play();
        closeButton.focus({ preventScroll: true });
      };
      const closeMenu = () => {
        if (!menuOpen) return;
        menuOpen = false;
        // Restore scrolling immediately so anchor links can start their jump.
        document.body.style.overflow = "";
        burger.setAttribute("aria-expanded", "false");
        burger.focus({ preventScroll: true });
        menu.setAttribute("aria-hidden", "true");
        if (reduced.matches) menuTimeline.progress(0).pause();
        else menuTimeline.timeScale(1.4).reverse();
      };
      const onEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") closeMenu();
      };
      // Force-close if the viewport grows past the mobile breakpoint mid-open.
      const breakpoint = window.matchMedia("(min-width: 901px)");
      const onBreakpoint = () => {
        if (breakpoint.matches && menuOpen) {
          menuOpen = false;
          document.body.style.overflow = "";
          burger.setAttribute("aria-expanded", "false");
          menu.setAttribute("aria-hidden", "true");
          menuTimeline.progress(0).pause();
        }
      };

      burger.addEventListener("click", openMenu);
      closeButton.addEventListener("click", closeMenu);
      backdrop.addEventListener("click", closeMenu);
      links.forEach((link) => link.addEventListener("click", closeMenu));
      menuCta?.addEventListener("click", closeMenu);
      window.addEventListener("keydown", onEscape);
      breakpoint.addEventListener("change", onBreakpoint);

      menuCleanup.push(() => {
        burger.removeEventListener("click", openMenu);
        closeButton.removeEventListener("click", closeMenu);
        backdrop.removeEventListener("click", closeMenu);
        links.forEach((link) => link.removeEventListener("click", closeMenu));
        menuCta?.removeEventListener("click", closeMenu);
        window.removeEventListener("keydown", onEscape);
        breakpoint.removeEventListener("change", onBreakpoint);
        document.body.style.overflow = "";
        menuTimeline.revert(); // revert (not kill): clears the inline styles it wrote
        gsap.set(menu, { clearProps: "transform,visibility" });
      });
    }

    // Initial states are set — drop the pre-hydration paint guard.
    document.documentElement.removeAttribute("data-motion");

    // Layout shifts once webfonts swap in; recalculate every trigger position.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("scroll", onNavScroll);
      menuCleanup.forEach((fn) => fn());
      mm.revert();
    };
  }, []);

  return <div className="signal-glow" ref={glowRef} aria-hidden="true" />;
}
