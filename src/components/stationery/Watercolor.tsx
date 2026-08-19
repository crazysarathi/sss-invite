import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A soft watercolour wash — the backdrop behind every "card" section.
 * Procedural (no artwork): a few tinted blobs pushed through turbulence +
 * displacement + blur, multiplied onto the page. Painted from tokens, so a
 * palette switch re-tints it. Static (no animation) — SVG filters are
 * rasterised once per paint.
 *
 * `variant` shifts the composition so neighbouring sections don't repeat.
 */
interface WatercolorProps {
  className?: string;
  variant?: "a" | "b" | "c";
  /** Overall strength, 0–1. */
  opacity?: number;
}

const BLOBS: Record<NonNullable<WatercolorProps["variant"]>, Array<{ cx: number; cy: number; rx: number; ry: number; fill: string; o: number; rot?: number }>> = {
  a: [
    { cx: 10, cy: 16, rx: 30, ry: 22, fill: "secondary", o: 0.3, rot: -12 },
    { cx: 22, cy: 30, rx: 18, ry: 14, fill: "secondary", o: 0.18, rot: 30 },
    { cx: 90, cy: 12, rx: 26, ry: 18, fill: "primary", o: 0.2, rot: 10 },
    { cx: 78, cy: 26, rx: 16, ry: 12, fill: "accent", o: 0.16, rot: -20 },
    { cx: 84, cy: 86, rx: 32, ry: 20, fill: "secondary", o: 0.26, rot: 18 },
    { cx: 12, cy: 90, rx: 26, ry: 16, fill: "accent", o: 0.22, rot: -8 },
    { cx: 30, cy: 78, rx: 14, ry: 10, fill: "primary", o: 0.14, rot: 12 },
  ],
  b: [
    { cx: 92, cy: 20, rx: 30, ry: 24, fill: "secondary", o: 0.26, rot: 14 },
    { cx: 76, cy: 10, rx: 16, ry: 12, fill: "accent", o: 0.18, rot: -10 },
    { cx: 6, cy: 42, rx: 24, ry: 30, fill: "primary", o: 0.16, rot: -20 },
    { cx: 20, cy: 60, rx: 14, ry: 10, fill: "secondary", o: 0.16, rot: 25 },
    { cx: 42, cy: 98, rx: 34, ry: 18, fill: "accent", o: 0.22, rot: 6 },
    { cx: 72, cy: 72, rx: 28, ry: 20, fill: "secondary", o: 0.2, rot: -30 },
  ],
  c: [
    { cx: 18, cy: 8, rx: 32, ry: 20, fill: "primary", o: 0.16, rot: 8 },
    { cx: 36, cy: 20, rx: 14, ry: 10, fill: "accent", o: 0.16, rot: -18 },
    { cx: 86, cy: 40, rx: 26, ry: 30, fill: "secondary", o: 0.18, rot: -14 },
    { cx: 24, cy: 82, rx: 30, ry: 22, fill: "accent", o: 0.2, rot: 22 },
    { cx: 78, cy: 94, rx: 26, ry: 14, fill: "primary", o: 0.18, rot: -6 },
    { cx: 60, cy: 80, rx: 14, ry: 10, fill: "secondary", o: 0.16, rot: 40 },
  ],
};

export function Watercolor({ className, variant = "a", opacity = 1 }: WatercolorProps) {
  const id = useId().replace(/:/g, "");
  const filterId = `wc-${id}`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity, mixBlendMode: "multiply" }}
    >
      <defs>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.045" numOctaves="4" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feGaussianBlur in="disp" stdDeviation="2.6" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {BLOBS[variant].map((b, i) => (
          <ellipse
            key={i}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            transform={b.rot ? `rotate(${b.rot} ${b.cx} ${b.cy})` : undefined}
            fill={`rgb(var(--c-${b.fill}) / ${b.o})`}
          />
        ))}
      </g>
    </svg>
  );
}
