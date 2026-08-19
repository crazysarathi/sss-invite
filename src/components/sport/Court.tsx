import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * A pickleball court in soft perspective — the hero's backdrop. Hairlines
 * in `--c-line-strong`, the net in the primary colour. Every stroke carries
 * `data-court-line` so GSAP can draw the court in (DrawSVG) on boot.
 *
 * Geometry: t = 0 at the far baseline, 1 at the near one. y and the
 * half-width ease with t^1.35 to fake perspective.
 */
const W = 1200;
const H = 700;
const FAR_Y = 110;
const NEAR_Y = 700;
const FAR_HW = 230;
const NEAR_HW = 880;
const CX = W / 2;
const KITCHEN = 7 / 44;

const ty = (t: number) => FAR_Y + (NEAR_Y - FAR_Y) * Math.pow(t, 1.35);
const hw = (t: number) => FAR_HW + (NEAR_HW - FAR_HW) * Math.pow(t, 1.35);

interface CourtLine {
  key: string;
  d: string;
  kind: "line" | "net";
}

function buildLines(): CourtLine[] {
  const across = (t: number, key: string, kind: CourtLine["kind"] = "line"): CourtLine => ({
    key,
    d: `M${CX - hw(t)} ${ty(t)} L${CX + hw(t)} ${ty(t)}`,
    kind,
  });
  const along = (x: (t: number) => number, t0: number, t1: number, key: string): CourtLine => {
    // polyline so the perspective curve reads smoothly
    const steps = 10;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = t0 + ((t1 - t0) * i) / steps;
      pts.push(`${i === 0 ? "M" : "L"}${x(t)} ${ty(t)}`);
    }
    return { key, d: pts.join(" "), kind: "line" };
  };
  return [
    across(0, "base-far"),
    across(1, "base-near"),
    along((t) => CX - hw(t), 0, 1, "side-left"),
    along((t) => CX + hw(t), 0, 1, "side-right"),
    across(0.5 - KITCHEN, "kitchen-far"),
    across(0.5 + KITCHEN, "kitchen-near"),
    along(() => CX, 0, 0.5 - KITCHEN, "center-far"),
    along(() => CX, 0.5 + KITCHEN, 1, "center-near"),
    across(0.5, "net", "net"),
  ];
}

interface CourtProps {
  className?: string;
}

export function Court({ className }: CourtProps) {
  const lines = useMemo(buildLines, []);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-full w-full", className)}
    >
      <defs>
        <linearGradient id="pnp-court-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="22%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="pnp-court-mask">
          <rect width={W} height={H} fill="url(#pnp-court-fade)" />
        </mask>
      </defs>
      <g mask="url(#pnp-court-mask)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* the playing surface, barely tinted */}
        <path
          data-court-surface
          d={`M${CX - hw(0)} ${ty(0)} L${CX + hw(0)} ${ty(0)} L${CX + hw(1)} ${ty(1)} L${CX - hw(1)} ${ty(1)} Z`}
          fill="rgb(var(--c-secondary) / 0.12)"
        />
        {lines
          .filter((l) => l.kind === "line")
          .map((l) => (
            <path
              key={l.key}
              data-court-line
              d={l.d}
              stroke="rgb(var(--c-line-strong))"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        {/* the net: posts + a tape with a fine mesh */}
        {lines
          .filter((l) => l.kind === "net")
          .map((l) => {
            const y = ty(0.5);
            const x0 = CX - hw(0.5);
            const x1 = CX + hw(0.5);
            const h = 44;
            return (
              <g key={l.key}>
                <path
                  data-court-line
                  d={`M${x0} ${y} L${x0} ${y - h} M${x1} ${y} L${x1} ${y - h}`}
                  stroke="rgb(var(--c-primary))"
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  data-court-line
                  d={`M${x0} ${y - h} L${x1} ${y - h}`}
                  stroke="rgb(var(--c-primary))"
                  strokeWidth={4}
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  data-court-net
                  d={`M${x0} ${y - h} L${x1} ${y - h} L${x1} ${y} L${x0} ${y} Z`}
                  fill="url(#pnp-net-mesh)"
                  stroke="rgb(var(--c-primary) / 0.45)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
      </g>
      <defs>
        <pattern id="pnp-net-mesh" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0 L8 8 M8 0 L0 8" stroke="rgb(var(--c-primary) / 0.35)" strokeWidth="0.8" />
        </pattern>
      </defs>
    </svg>
  );
}
