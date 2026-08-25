import { lazy, Suspense } from "react";
import { LazyBoundary } from "@/components/shared/LazyBoundary";
import { useIdleReady } from "@/hooks/useIdleReady";
import { cn } from "@/lib/utils";
import { BallGlyph } from "@/components/shared/Glyphs";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { opening } from "@/data/siteData";
import type { ThemeThree } from "@/themes/types";

/* The 3D seal is code-split: the SVG glyph stands in until three loads. */
const BallCanvas = lazy(() => import("@/components/three/BallCanvas"));

/**
 * The gate doors — two full-height paper leaves meeting at a centre seam,
 * each dressed like a stationery cover: paper ground, watercolour wash,
 * courtside sketches and a double hairline frame. `useOpeningTimeline`
 * slides them apart ([data-door-left] / [data-door-right]) to reveal the
 * page beneath; the decor layer inside each ([data-decor]) fades in with
 * the intro.
 *
 * Each leaf clips a full-viewport decor layer to its own half, so the
 * wash reads as one continuous sheet while the doors are closed.
 */
export function GateDoors() {
  return (
    <div data-doors aria-hidden="true" className="absolute inset-0 z-0 [perspective:1400px]">
      <DoorLeaf side="left" />
      <DoorLeaf side="right" />
    </div>
  );
}

function DoorLeaf({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div
      data-door-left={left ? "" : undefined}
      data-door-right={left ? undefined : ""}
      className={cn(
        "t-paper absolute inset-y-0 w-1/2 overflow-hidden bg-page-alt will-change-transform",
        left ? "left-0 origin-left" : "right-0 origin-right"
      )}
    >
      {/* double hairline frame — each leaf framed like an invitation cover.
          Painted FIRST so the courtside sketches (paddle, balls) sit above
          the frame lines, never sliced by them. */}
      <span className="pointer-events-none absolute inset-3 border border-accent/60 sm:inset-5" />
      <span className="pointer-events-none absolute inset-[18px] border border-accent/25 sm:inset-7" />

      {/* full-viewport decor, clipped to this half so the wash is continuous.
          Starts transparent (no flash before the timeline mounts); the intro
          fades it in. */}
      <div data-decor className={cn("absolute inset-y-0 w-[200%] opacity-0", left ? "left-0" : "right-0")}>
        <Watercolor variant="b" opacity={0.85} eager />
        <CourtsideSketches />
      </div>

      {/* seam: a hairline plus a soft fold shadow where the leaves meet */}
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 w-px bg-line-strong/80",
          left ? "right-0" : "left-0"
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 w-14 from-overlay/[0.07] to-transparent sm:w-20",
          left ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface SealProps {
  palette: ThemeThree["palette"];
}

/**
 * The pickleball seal — the 3D ball held in an engraved ring medallion,
 * sitting on the seam like a wax seal. "Open invitation" runs along the
 * lower arc of the ring, medallion-style, so the seal is its own call to
 * action. The timeline pops the ring away ([data-ring]) and serves the
 * ball off ([data-ball]) on open.
 */
export function SealBall({ palette }: SealProps) {
  // Don't even start fetching three.js until the main thread is idle — the
  // glyph opens the show, the 3D ball takes over as soon as it's cheap to.
  const enhanced = useIdleReady();
  return (
    <span className="relative block h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32">
      {/* engraved ring — outer hairline, the "Open invitation" band, inner hairline */}
      <svg
        data-ring
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 100 100"
        className="absolute -inset-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] text-accent"
      >
        <defs>
          {/* left → bottom → right, so the label reads upright along the lower arc */}
          <path id="seal-arc" d="M 8 50 A 42 42 0 0 0 92 50" />
        </defs>
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeOpacity="0.7" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="50" r="35.5" fill="none" stroke="currentColor" strokeOpacity="0.32" vectorEffect="non-scaling-stroke" />
        {/* studs at top, left and right — the label takes the bottom */}
        {[0, 90, 270].map((deg) => (
          <rect
            key={deg}
            x="47.8"
            y="2.6"
            width="4.4"
            height="4.4"
            fill="currentColor"
            fillOpacity="0.85"
            transform={`rotate(45 50 4.8) rotate(${deg} 50 50)`}
          />
        ))}
        <text
          fill="rgb(var(--c-primary))"
          dominantBaseline="central"
          style={{
            fontFamily: "var(--font-accent)",
            fontWeight: "var(--accent-weight)" as never,
            fontSize: "7px",
            letterSpacing: "0.22em",
          }}
        >
          <textPath href="#seal-arc" startOffset="50%" textAnchor="middle">
            {opening.cta.toUpperCase()}
          </textPath>
        </text>
      </svg>

      {/* the ball itself (flies off on open) */}
      <span
        data-ball
        className="absolute inset-[13%] block [filter:drop-shadow(0_10px_10px_rgb(var(--c-overlay)/0.28))]"
      >
        {enhanced ? (
          <LazyBoundary fallback={<BallGlyph className="h-full w-full text-primary [&>circle:first-child]:fill-surface" />}>
            <Suspense
              fallback={
                <BallGlyph className="h-full w-full text-primary [&>circle:first-child]:fill-surface" />
              }
            >
              <BallCanvas palette={palette} />
            </Suspense>
          </LazyBoundary>
        ) : (
          <BallGlyph className="h-full w-full text-primary [&>circle:first-child]:fill-surface" />
        )}
      </span>
    </span>
  );
}
