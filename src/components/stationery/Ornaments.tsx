import { useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { brand } from "@/data/siteData";

/* ------------------------------------------------------------------ */
/* Monogram — "P & P" in a leaf wreath, a pickleball at the crown       */
/* ------------------------------------------------------------------ */
interface MonogramProps {
  className?: string;
  /** Ink colour class for the letters (defaults to text-fg). */
  inkClassName?: string;
}

/**
 * The invitation's monogram: the two initials with the italic ampersand,
 * ringed by a laurel wreath, crowned by a tiny pickleball — the stationery
 * version of the brand. Pure SVG + tokens.
 */
export function Monogram({ className, inkClassName }: MonogramProps) {
  const [a, amp, b] = brand.nameParts;
  const leaves = useMemo(() => {
    const out: Array<{ angle: number; side: 1 | -1 }> = [];
    // two arcs of leaves, left and right, leaving the crown (top) and the foot open
    // SVG angles: 0° = right, 90° = bottom, 180° = left, 270° = top.
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      out.push({ angle: 102 + t * 104, side: 1 }); // left arc: bottom → upper-left
      out.push({ angle: 78 - t * 104, side: -1 }); // right arc: bottom → upper-right
    }
    return out;
  }, []);
  return (
    <span className={cn("relative inline-block", className)} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="block h-full w-full" focusable="false">
        {/* wreath */}
        <g fill="none" stroke="rgb(var(--c-accent) / 0.9)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M100 186 A 86 86 0 0 1 26 52" />
          <path d="M100 186 A 86 86 0 0 0 174 52" />
        </g>
        {leaves.map((l, i) => {
          const r = 85;
          const rad = (l.angle * Math.PI) / 180;
          const cx = 100 + r * Math.cos(rad);
          const cy = 100 + r * Math.sin(rad);
          // leaves lean "up" the wreath toward the crown, pointing outward
          const rot = l.angle + l.side * 55;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(1.35)`}>
              <path
                d="M0 0 C 5 -5, 13 -5, 17 0 C 13 5, 5 5, 0 0 Z"
                fill="rgb(var(--c-secondary) / 0.55)"
                stroke="rgb(var(--c-accent) / 0.9)"
                strokeWidth="0.9"
              />
            </g>
          );
        })}
        {/* crown: a small pickleball */}
        <g transform="translate(100 14)">
          <circle r="9" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" strokeWidth="1.2" />
          <g fill="rgb(var(--c-accent))">
            <circle cx="0" cy="-4" r="1.2" />
            <circle cx="-3.8" cy="-0.8" r="1.2" />
            <circle cx="3.8" cy="-0.8" r="1.2" />
            <circle cx="-2.2" cy="3.6" r="1.2" />
            <circle cx="2.2" cy="3.6" r="1.2" />
          </g>
        </g>
        {/* initials */}
        <text
          x="100"
          y="118"
          textAnchor="middle"
          className={cn("t-display fill-current", inkClassName ?? "text-fg")}
          style={{ fontSize: 74, fontWeight: 500 }}
        >
          {a[0]}
          <tspan style={{ fontStyle: "italic", fontWeight: 400 }} className="fill-primary" dx="2" dy="-2">
            {amp}
          </tspan>
          <tspan dx="2" dy="2">
            {b[0]}
          </tspan>
        </text>
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Flourish — a calligraphic divider with a pickleball at the centre     */
/* ------------------------------------------------------------------ */
interface FlourishProps {
  className?: string;
  /** Width in CSS (defaults to 11rem). */
  style?: CSSProperties;
  /** "ball" puts a tiny pickleball in the middle; "dot" a diamond. */
  center?: "ball" | "dot";
}

export function Flourish({ className, style, center = "ball" }: FlourishProps) {
  return (
    <svg
      viewBox="0 0 220 28"
      aria-hidden="true"
      focusable="false"
      className={cn("mx-auto block h-auto w-44 text-accent", className)}
      style={style}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M8 14 C 40 14, 52 4, 70 14 S 96 22, 100 14" />
        <path d="M212 14 C 180 14, 168 4, 150 14 S 124 22, 120 14" />
        <path d="M30 14 c 6 -6, 12 -6, 18 0" opacity="0.7" />
        <path d="M190 14 c -6 -6, -12 -6, -18 0" opacity="0.7" />
      </g>
      {center === "ball" ? (
        <g transform="translate(110 14)">
          <circle r="6.5" fill="rgb(var(--c-surface))" stroke="currentColor" strokeWidth="1.1" />
          <g fill="currentColor">
            <circle cx="0" cy="-2.8" r="0.9" />
            <circle cx="-2.6" cy="-0.4" r="0.9" />
            <circle cx="2.6" cy="-0.4" r="0.9" />
            <circle cx="-1.5" cy="2.6" r="0.9" />
            <circle cx="1.5" cy="2.6" r="0.9" />
          </g>
        </g>
      ) : (
        <rect x="106" y="10" width="8" height="8" transform="rotate(45 110 14)" fill="currentColor" />
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Frame — double hairline + corner florets (CSS in index.css)          */
/* ------------------------------------------------------------------ */
export function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("t-frame", className)}>
      <span className="t-frame-corner" aria-hidden="true" />
      <span className="t-frame-corner" aria-hidden="true" />
      <span className="t-frame-corner" aria-hidden="true" />
      <span className="t-frame-corner" aria-hidden="true" />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TornCard — paper with deckled top & bottom edges                     */
/* ------------------------------------------------------------------ */
interface TornCardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  /** Deterministic edge variation. */
  seed?: number;
  /** Which edges are torn. */
  edges?: "both" | "top" | "bottom";
  style?: CSSProperties;
}

function tornPolygon(seed: number, edges: NonNullable<TornCardProps["edges"]>): string {
  // tiny seeded PRNG so the edge is stable across renders
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const N = 26;
  const amp = 1.1; // % of height
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * 100;
    const jt = edges === "bottom" ? 0 : rnd() * amp;
    const jb = edges === "top" ? 0 : rnd() * amp;
    top.push(`${x.toFixed(2)}% ${jt.toFixed(2)}%`);
    bottom.push(`${x.toFixed(2)}% ${(100 - jb).toFixed(2)}%`);
  }
  return `polygon(${[...top, ...bottom.reverse()].join(", ")})`;
}

/**
 * A piece of torn paper: `.t-surface` with a jagged clip-path top and
 * bottom, plus a soft drop shadow carried by a wrapper (clip-path would
 * cut the card's own shadow).
 */
export function TornCard({ className, children, seed = 1, edges = "both", style, ...rest }: TornCardProps) {
  const clip = useMemo(() => tornPolygon(seed, edges), [seed, edges]);
  return (
    <div className={cn("relative [filter:drop-shadow(0_24px_40px_rgb(var(--c-overlay)/0.16))]", className)} style={style} {...rest}>
      <div className="t-surface !rounded-none !shadow-none" style={{ clipPath: clip }}>
        {children}
      </div>
    </div>
  );
}
