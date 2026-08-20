import { useEffect, useState } from "react";

/**
 * True once the main thread has gone idle (or `timeout` ms have passed).
 *
 * Gates optional enhancements — the 3D pickleball — so their chunk is
 * fetched and parsed AFTER first paint instead of competing with it:
 * `lazy()` alone splits the code but still downloads it immediately once
 * the component renders, which put ~1s of three.js parse on the mobile
 * critical path. The SVG ball stands in until then.
 */
export function useIdleReady(timeout = 2500): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setReady(true), { timeout });
      return () => w.cancelIdleCallback?.(handle);
    }
    const t = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(t);
  }, [ready, timeout]);

  return ready;
}
