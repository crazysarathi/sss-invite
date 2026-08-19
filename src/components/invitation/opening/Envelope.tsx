import { lazy, Suspense } from "react";
import { LazyBoundary } from "@/components/shared/LazyBoundary";
import { brand, dateLine, event, opening } from "@/data/siteData";
import { cn } from "@/lib/utils";
import { BallGlyph } from "@/components/shared/Glyphs";
import { Kicker } from "@/components/shared/Kicker";
import { Monogram } from "@/components/stationery/Ornaments";
import type { ThemeThree } from "@/themes/types";

/* The 3D seal is code-split: the SVG glyph stands in until three loads. */
const BallCanvas = lazy(() => import("@/components/three/BallCanvas"));

/* Geometry (fractions of the envelope height) shared with the timeline. */
export const ENVELOPE = {
  /** Flap height — its tip (and the seal) sits at this line. */
  flap: 0.5,
  /** Top edge of the front pocket — meets the flap tip, like a real envelope's folds. */
  pocket: 0.5,
  /** Card top when tucked: only its top edge peeks above the pocket line, beside the seal. */
  cardTop: 0.42,
  /** Card height. */
  cardHeight: 0.74,
  /** How far (× envelope height) the card travels up when pulled out (just clear of the pocket). */
  cardTravel: 0.68,
} as const;

const FLAP_H = `${ENVELOPE.flap * 100}%`;
const POCKET_TOP = `${ENVELOPE.pocket * 100}%`;
const TRI_DOWN = "[clip-path:polygon(0_0,100%_0,50%_100%)]";
const TRI_UP = "[clip-path:polygon(50%_0,100%_100%,0_100%)]";

interface EnvelopeProps {
  palette: ThemeThree["palette"];
  /** Liner classes (flap back face) from the opening preset. */
  liner: string;
}

/**
 * The envelope — CSS layers dressed by tokens, animated by data-attribute
 * from `useOpeningTimeline`:
 *
 *   [data-back]        back paper
 *   [data-sleeve]      clip for the card (open above, closed below)
 *     [data-card]      the invitation card (slides / scales / fades)
 *       [data-card-hover]  hover peek wrapper
 *   [data-pocket]      front pocket with fold lines
 *   [data-flap-shadow] soft shadow the closed flap casts on the pocket
 *   [data-flap]        the flap (rotateX 0 → -180, z-swap at 90°)
 *   [data-ball-shadow] [data-disc] [data-ball]   the seal
 */
export function Envelope({ palette, liner }: EnvelopeProps) {
  const when = dateLine();
  const [a, amp, b] = brand.nameParts;

  return (
    <span
      data-envelope
      className="relative block aspect-[13/10] w-[min(86vw,560px,62svh)] md:aspect-[3/2]"
    >
      {/* back paper */}
      <span
        data-back
        aria-hidden="true"
        className="absolute inset-0 z-0 rounded-md border-theme border-line bg-surface-2"
      />

      {/* card sleeve: clips at the sides + bottom, open above the envelope */}
      <span
        data-sleeve
        className="absolute bottom-0 left-0 right-0 top-[-100%] z-[1] overflow-hidden"
      >
        <span
          data-card
          className="absolute left-[7%] w-[86%]"
          style={{
            top: `${(1 + ENVELOPE.cardTop) * 50}%`,
            height: `${ENVELOPE.cardHeight * 50}%`,
          }}
        >
          <span data-card-hover className="absolute inset-0 block">
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[3px] border-theme border-line-strong bg-surface px-4 py-3 text-center text-fg shadow-card md:gap-1.5 md:px-8 md:py-5">
              <Monogram className="h-9 w-9 md:h-12 md:w-12" />
              <Kicker ornament="none" className="max-md:text-[0.6rem] max-md:tracking-[0.22em]">
                {opening.invitedLine}
              </Kicker>
              <span className="t-display block max-w-full text-display-sm md:text-[length:calc(var(--display-md)*0.82)]">
                {a} <em>{amp}</em> {b}
              </span>
              <span className="t-script text-[1.1rem] leading-none text-primary md:text-[1.5rem]">{brand.subline}</span>
              <span aria-hidden="true" className="my-0.5 block h-px w-10 bg-accent/70" />
              <span className="t-label block text-[0.6rem] leading-relaxed md:text-[0.7rem]">
                {when}
                <br />
                {event.venue.name}
              </span>
            </span>
          </span>
        </span>
      </span>

      {/* front pocket */}
      <span
        data-pocket
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-[2] overflow-hidden rounded-b-md border-theme border-line-strong bg-surface"
        style={{ top: POCKET_TOP }}
      >
        <span className="absolute inset-0 bg-[linear-gradient(100deg,rgb(var(--c-overlay)/0.06),rgb(var(--c-overlay)/0)_38%,rgb(var(--c-overlay)/0)_62%,rgb(var(--c-overlay)/0.05))]" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--c-overlay)/0.05),rgb(var(--c-overlay)/0)_28%)]" />
        <svg
          className="absolute inset-0 h-full w-full text-line-strong"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 100 L50 0 L100 100"
            fill="none"
            stroke="currentColor"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: "var(--border-w)" }}
          />
        </svg>
      </span>

      {/* the closed flap's shadow on the pocket */}
      <span
        data-flap-shadow
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-0 z-[3] [filter:blur(4px)]"
        style={{ height: FLAP_H }}
      >
        <span className={cn("absolute inset-0 translate-y-1.5 bg-overlay/20", TRI_DOWN)} />
      </span>

      {/* the flap: front face (paper) + back face (liner) */}
      <span
        data-flap
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 z-[4] origin-top [transform-style:preserve-3d]"
        style={{ height: FLAP_H }}
      >
        <span className={cn("absolute inset-0 bg-surface [backface-visibility:hidden]", TRI_DOWN)}>
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--c-overlay)/0.02),rgb(var(--c-overlay)/0.08))]" />
          <svg
            className="absolute inset-0 h-full w-full text-line-strong"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M0 0 H100 L50 100 Z"
              fill="none"
              stroke="currentColor"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: "calc(var(--border-w) * 2)" }}
            />
          </svg>
        </span>
        <span
          className={cn(
            "absolute inset-0 overflow-hidden bg-surface [backface-visibility:hidden] [transform:rotateX(180deg)]",
            TRI_UP
          )}
        >
          <span className={cn("absolute inset-0", liner)} />
          <span className="t-pattern" />
          <svg
            className="absolute inset-0 h-full w-full text-line-strong"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M50 0 L100 100 H0 Z"
              fill="none"
              stroke="currentColor"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: "calc(var(--border-w) * 2)" }}
            />
          </svg>
        </span>
      </span>

      {/* the seal: wax disc + 3D pickleball resting on it */}
      <span
        data-seal
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 z-[5] h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 md:h-[112px] md:w-[112px]"
        style={{ top: FLAP_H }}
      >
        <span
          data-ball-shadow
          className="absolute bottom-[-2%] left-[10%] right-[10%] h-[24%] rounded-full bg-overlay/35 [filter:blur(5px)]"
        />
        <span
          data-disc
          className="absolute left-[15%] top-[34%] h-[70%] w-[70%] rounded-full bg-primary shadow-[inset_0_-3px_8px_rgb(var(--c-overlay)/0.28)]"
        />
        <span
          data-ball
          className="absolute inset-0 block [filter:drop-shadow(0_8px_8px_rgb(var(--c-overlay)/0.3))]"
        >
          <LazyBoundary fallback={<BallGlyph className="h-full w-full text-primary [&>circle:first-child]:fill-surface" />}>
            <Suspense
              fallback={
                <BallGlyph className="h-full w-full text-primary [&>circle:first-child]:fill-surface" />
              }
            >
              <BallCanvas palette={palette} />
            </Suspense>
          </LazyBoundary>
        </span>
      </span>
    </span>
  );
}
