import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A 2D pickleball — shaded disc with the wiffle holes — painted entirely
 * from theme tokens (palette switches recolor it). Used wherever the 3D
 * ball would be overkill: the rally, the fallback for the 3D ball, the
 * scroll companion.
 */
export function PickleballSvg({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={cn("block", className)} {...props}>
      <defs>
        <radialGradient id="pnp-ball-shade" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="rgb(var(--c-surface))" />
          <stop offset="62%" stopColor="rgb(var(--c-surface-2))" />
          <stop offset="100%" stopColor="rgb(var(--c-line-strong))" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#pnp-ball-shade)" stroke="rgb(var(--c-line-strong))" strokeWidth="1.5" />
      {/* holes — a loose lattice, slightly squashed toward the edges for roundness */}
      <g fill="rgb(var(--c-fg-muted))" opacity="0.85">
        <circle cx="50" cy="26" r="4.2" />
        <circle cx="31" cy="36" r="4" />
        <circle cx="69" cy="36" r="4" />
        <circle cx="50" cy="48" r="4.4" />
        <circle cx="28" cy="58" r="3.6" />
        <circle cx="72" cy="58" r="3.6" />
        <circle cx="40" cy="70" r="3.8" />
        <circle cx="60" cy="70" r="3.8" />
        <ellipse cx="50" cy="86" rx="3.2" ry="2.4" />
        <ellipse cx="17" cy="44" rx="2.2" ry="3.4" />
        <ellipse cx="83" cy="44" rx="2.2" ry="3.4" />
        <ellipse cx="18" cy="72" rx="2" ry="2.8" />
        <ellipse cx="82" cy="72" rx="2" ry="2.8" />
      </g>
      {/* highlight */}
      <ellipse cx="36" cy="26" rx="10" ry="6" fill="rgb(var(--c-surface))" opacity="0.7" transform="rotate(-30 36 26)" />
    </svg>
  );
}
