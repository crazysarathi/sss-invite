import { useEffect } from "react";
import { sound } from "@/lib/audio";

/**
 * The paper "crick-crack" while the reader scrolls — the stationery moving
 * under their fingers. Fired sparsely: one crackle per ~120–280px of travel,
 * rate-capped, with randomized strength so it reads as texture, never as a
 * rhythm. Works with both native scroll (mobile) and ScrollSmoother (which
 * keeps the window's real scroll position; only the content transform lags).
 * Enable only once the gates have opened — that tap also unlocked audio.
 */
export function useScrollCrackle(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let last = window.scrollY;
    let travelled = 0;
    let nextAt = 160;
    let lastTick = 0;
    const onScroll = () => {
      const y = window.scrollY;
      travelled += Math.abs(y - last);
      last = y;
      if (travelled < nextAt) return;
      travelled = 0;
      nextAt = 120 + Math.random() * 160;
      const now = performance.now();
      if (now - lastTick < 110) return;
      lastTick = now;
      sound.scrollCrackle(0.6 + Math.random() * 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}
