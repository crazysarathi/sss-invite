import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Line-art marks for the "Four partners" launch sequence — a placeholder
 * team jersey (stage 2) and a gift box with a hinged lid (stage 4).
 * Painted from theme tokens like PaddleSvg / PickleballSvg, so they
 * recolor with the palette instead of carrying fixed art.
 */

/* ------------------------------------------------------------------ */
/* Jersey — a sleeveless court jersey with a v-neck                     */
/* ------------------------------------------------------------------ */
export function JerseyMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" focusable="false" className={cn("block", className)} {...props}>
      <path
        d="M100 14
           C130 14 150 22 158 34
           L188 54
           C194 58 194 66 188 70
           L168 58
           L168 196
           C168 205 160 211 149 211
           L51 211
           C40 211 32 205 32 196
           L32 58
           L12 70
           C6 66 6 58 12 54
           L42 34
           C50 22 70 14 100 14 Z"
        fill="rgb(var(--c-primary))"
        stroke="rgb(var(--c-accent))"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* v-neck collar notch */}
      <path
        d="M100 14 L84 38 L100 52 L116 38 Z"
        fill="rgb(var(--c-surface))"
        stroke="rgb(var(--c-accent))"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* sleeve + hem trim */}
      <path d="M168 58 L188 70 M32 58 L12 70" stroke="rgb(var(--c-secondary))" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M40 196 L160 196" stroke="rgb(var(--c-secondary))" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Gift box — base + a separately-transformable lid (data-gift-lid)     */
/* ------------------------------------------------------------------ */
export function GiftBoxMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false" className={cn("block overflow-visible", className)} {...props}>
      {/* base + front */}
      <g>
        <rect x="34" y="96" width="132" height="88" rx="8" fill="rgb(var(--c-primary))" stroke="rgb(var(--c-accent))" strokeWidth="6" />
        <rect x="92" y="96" width="16" height="88" fill="rgb(var(--c-surface))" opacity="0.9" />
      </g>

      {/* lid — pivots open around its lower-left corner (see the GSAP tween's transformOrigin) */}
      <g data-gift-lid>
        <rect x="22" y="72" width="156" height="30" rx="7" fill="rgb(var(--c-secondary))" stroke="rgb(var(--c-accent))" strokeWidth="6" />
        <rect x="92" y="72" width="16" height="30" fill="rgb(var(--c-surface))" opacity="0.9" />
        {/* bow */}
        <g transform="translate(100 66)">
          <path d="M0 4 C-22 -18 -34 6 -14 10 C-30 16 -18 32 0 12 Z" fill="rgb(var(--c-secondary))" stroke="rgb(var(--c-accent))" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M0 4 C22 -18 34 6 14 10 C30 16 18 32 0 12 Z" fill="rgb(var(--c-secondary))" stroke="rgb(var(--c-accent))" strokeWidth="3.5" strokeLinejoin="round" />
          <circle r="6.5" fill="rgb(var(--c-accent))" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkle — a tiny four-point star for the gift's confetti burst       */
/* ------------------------------------------------------------------ */
export function SparkleMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={cn("block", className)} {...props}>
      <path d="M12 1 L14.4 9.6 L23 12 L14.4 14.4 L12 23 L9.6 14.4 L1 12 L9.6 9.6 Z" fill="currentColor" />
    </svg>
  );
}
