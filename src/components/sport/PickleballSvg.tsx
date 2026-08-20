import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A 2D pickleball — the chartreuse wiffle ball from the client's reference
 * photo: accent-coloured body, soft top-left light, and *recessed* holes.
 * Each hole is foreshortened into an ellipse along the sphere's curve and
 * shaded like an inset: a lit rim on the lower edge, a darker void toward
 * the light. Painted from theme tokens (palette switches recolor it).
 * Used wherever the 3D ball would be overkill: the rally, the fallback
 * for the 3D ball, the scroll companion.
 */

const CX = 50;
const CY = 50;
const R = 47;

/** Hole layout — a wiffle-ball lattice: centre cluster + a ring near the limb. */
export const BALL_HOLES: ReadonlyArray<{ x: number; y: number; r: number }> = [
  { x: 50, y: 23, r: 4.4 },
  { x: 33, y: 32, r: 4.2 },
  { x: 67, y: 32, r: 4.2 },
  { x: 41, y: 46, r: 4.7 },
  { x: 59, y: 46, r: 4.7 },
  { x: 24, y: 46, r: 3.9 },
  { x: 76, y: 46, r: 3.9 },
  { x: 50, y: 61, r: 4.7 },
  { x: 32, y: 63, r: 4.3 },
  { x: 68, y: 63, r: 4.3 },
  { x: 43, y: 79, r: 3.9 },
  { x: 58, y: 78, r: 3.9 },
  { x: 16, y: 58, r: 3.2 },
  { x: 84, y: 58, r: 3.2 },
  { x: 22, y: 73, r: 2.9 },
  { x: 78, y: 73, r: 2.9 },
  { x: 50, y: 90, r: 3.1 },
  { x: 15, y: 40, r: 3 },
  { x: 85, y: 40, r: 3 },
];

/**
 * Spherical foreshortening for a hole at (x, y) on the 100×100 ball: how
 * much its radial axis squashes (`k`) and the rotation that aligns the
 * squash with the sphere's curve.
 */
export function holeSquash(x: number, y: number): { k: number; angle: number } {
  const t = Math.min(Math.hypot(x - CX, y - CY) / R, 0.96);
  return { k: Math.sqrt(1 - t * t), angle: (Math.atan2(y - CY, x - CX) * 180) / Math.PI };
}

/**
 * One recessed hole. The ellipse's minor axis lies along the radial
 * direction (spherical foreshortening); the shading is an inset — a light
 * crescent peeking below, the deepest shadow pushed up toward the light.
 */
function Hole({ x, y, r }: { x: number; y: number; r: number }) {
  const { k, angle } = holeSquash(x, y);
  const rot = (cy: number) => `rotate(${angle.toFixed(1)} ${x} ${cy})`;
  return (
    <g>
      {/* lit inner rim (peeks out along the bottom edge) */}
      <ellipse cx={x} cy={y + r * 0.18} rx={r * k} ry={r} transform={rot(y + r * 0.18)} fill="#ffffff" opacity="0.35" />
      {/* the hole */}
      <ellipse cx={x} cy={y} rx={r * k} ry={r} transform={rot(y)} fill="rgb(var(--c-overlay))" opacity="0.6" />
      {/* deepest shadow, toward the light */}
      <ellipse cx={x} cy={y - r * 0.22} rx={r * 0.72 * k} ry={r * 0.68} transform={rot(y - r * 0.22)} fill="rgb(var(--c-overlay))" opacity="0.45" />
    </g>
  );
}

export function PickleballSvg({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={cn("block", className)} {...props}>
      <defs>
        {/* light + shade in one overlay: white glow top-left, dark rim bottom-right */}
        <radialGradient id="pnp-ball-shade" cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={R} fill="rgb(var(--c-accent))" />
      <circle cx={CX} cy={CY} r={R} fill="url(#pnp-ball-shade)" stroke="rgb(var(--c-overlay) / 0.18)" strokeWidth="1" />
      <g>
        {BALL_HOLES.map((h) => (
          <Hole key={`${h.x}-${h.y}`} {...h} />
        ))}
      </g>
      {/* highlight */}
      <ellipse cx="34" cy="24" rx="11" ry="6.5" fill="#ffffff" opacity="0.5" transform="rotate(-30 34 24)" />
    </svg>
  );
}
