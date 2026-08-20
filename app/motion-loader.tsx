"use client";

import dynamic from "next/dynamic";

/**
 * Loads the GSAP motion system as its own chunk, after hydration.
 *
 * Imported statically, GSAP + ScrollTrigger + SplitText + DrawSVG evaluate inside the
 * hydration task. That task blocked the browser from presenting the already-painted
 * hero, costing ~0.9s of Largest Contentful Paint. Nothing above the fold depends on
 * it — the hero's entrance is pure CSS — so it is safe to arrive a beat later.
 */
const MotionSystem = dynamic(() => import("./motion-system"), { ssr: false });

export default function MotionLoader() {
  return <MotionSystem />;
}
