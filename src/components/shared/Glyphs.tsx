import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import { brand } from "@/data/siteData";

/**
 * Invitation glyphs — thin line-art in currentColor so they take on any
 * theme's ink. lucide has no paddle / mat / matcha, so these fill the gap
 * with the same 24-unit grid and 1.5 stroke.
 */
type GlyphProps = SVGProps<SVGSVGElement>;

const base = (props: GlyphProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

/** Pickleball paddle with a few face holes. */
export function PaddleGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="2.5" width="12" height="13" rx="6" />
      <path d="M10.5 15.5v5.5M13.5 15.5v5.5M10.5 21h3" />
      <circle cx="10" cy="7" r="0.6" fill="currentColor" />
      <circle cx="14" cy="6" r="0.6" fill="currentColor" />
      <circle cx="12" cy="10" r="0.6" fill="currentColor" />
      <circle cx="9" cy="11" r="0.6" fill="currentColor" />
      <circle cx="15" cy="10.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/** Rolled pilates mat. */
export function MatGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M17 8H7a4 4 0 0 0 0 8h10" />
      <circle cx="17" cy="12" r="4" />
      <circle cx="17" cy="12" r="1.6" />
    </svg>
  );
}

/** Matcha bowl with a chasen whisk. */
export function MatchaGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 11h16c0 4.4-3.1 8-8 8s-8-3.6-8-8Z" />
      <path d="M8 19.5h8" />
      <path d="M14.5 11 17 3.5M15.2 11l1.9-7M13.8 11l3.2-7.2" />
      <path d="M6.5 8c.5-1 .5-1.8 0-2.8" />
      <path d="M9.5 8c.5-1 .5-1.8 0-2.8" />
    </svg>
  );
}

/** Two people — the social. */
export function PeopleGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M3.5 19c.5-3.3 2.6-5 5.5-5s5 1.7 5.5 5" />
      <path d="M14.8 14.6c.6-.4 1.2-.6 1.7-.6 2.2 0 3.6 1.3 4 4" />
    </svg>
  );
}

/** Wiffle ball. */
export function BallGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="15" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="15" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Brand mark                                                          */
/* ------------------------------------------------------------------ */

interface BrandMarkProps {
  /** "mark" = ball monogram only · "wordmark" = name only · "lockup" = both */
  variant?: "mark" | "wordmark" | "lockup";
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

/**
 * The Pickle & Pilates mark. The monogram is a wiffle ball whose holes are
 * arranged as a "P" — the wordmark is set in the theme's display face with
 * the ampersand as the italic accent, so the logo re-dresses per theme.
 */
export function BrandMark({ variant = "lockup", className, markClassName, textClassName }: BrandMarkProps) {
  const [a, amp, b] = brand.nameParts;
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {variant !== "wordmark" && (
        <svg
          viewBox="0 0 48 48"
          className={cn("h-9 w-9 shrink-0", markClassName)}
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {/* holes tracing a soft "P" */}
          <circle cx="18" cy="14" r="2.1" fill="currentColor" />
          <circle cx="18" cy="21" r="2.1" fill="currentColor" />
          <circle cx="18" cy="28" r="2.1" fill="currentColor" />
          <circle cx="18" cy="35" r="2.1" fill="currentColor" />
          <circle cx="25" cy="13.5" r="2.1" fill="currentColor" />
          <circle cx="30.5" cy="17.5" r="2.1" fill="currentColor" />
          <circle cx="30" cy="24" r="2.1" fill="currentColor" />
          <circle cx="25" cy="27.5" r="2.1" fill="currentColor" />
        </svg>
      )}
      {variant !== "mark" && (
        <span className={cn("t-display whitespace-nowrap text-[1.15rem] leading-none", textClassName)}>
          {a} <em>{amp}</em> {b}
        </span>
      )}
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}
