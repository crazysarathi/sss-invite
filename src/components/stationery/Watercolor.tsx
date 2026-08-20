import { cn } from "@/lib/utils";
import washA from "@/assets/watercolor/wash-a.webp";
import washB from "@/assets/watercolor/wash-b.webp";
import washC from "@/assets/watercolor/wash-c.webp";

/**
 * A soft watercolour wash — the backdrop behind every "card" section.
 *
 * Pre-baked to WebP by `node scripts/watercolor.mjs` (the palette is fixed,
 * so the turbulence/displacement/blur filter is rendered once at build time
 * instead of live in the browser — the live SVG filter was the single
 * biggest paint cost on mobile, re-rasterised while the gate doors moved).
 * Still multiplied onto the page, so it sits in the paper exactly as before.
 *
 * `variant` shifts the composition so neighbouring sections don't repeat.
 */
interface WatercolorProps {
  className?: string;
  variant?: "a" | "b" | "c";
  /** Overall strength, 0–1. */
  opacity?: number;
  /**
   * First-viewport washes (the gate doors, the hero) — fetched eagerly at
   * high priority, since the doors' wash is the page's LCP element.
   * Below-fold sections leave this off and lazy-load.
   */
  eager?: boolean;
}

const SRC: Record<NonNullable<WatercolorProps["variant"]>, string> = {
  a: washA,
  b: washB,
  c: washC,
};

export function Watercolor({ className, variant = "a", opacity = 1, eager = false }: WatercolorProps) {
  return (
    <img
      src={SRC[variant]}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      // lowercase: React 18 doesn't know the camelCase fetchPriority prop yet
      {...(eager ? ({ fetchpriority: "high" } as Record<string, string>) : null)}
      className={cn("pointer-events-none absolute inset-0 h-full w-full select-none object-fill", className)}
      style={{ opacity, mixBlendMode: "multiply" }}
    />
  );
}
