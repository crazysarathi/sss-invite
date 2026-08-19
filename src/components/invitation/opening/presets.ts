/**
 * Tempo for the envelope opening. Every beat is a multiplier of the
 * theme's `motion.duration.base`, so the preset only shapes the
 * choreography (how the ball leaves, how the flap opens, how the card
 * exits) — the absolute pace comes from the theme's motion.
 */
export interface OpeningPreset {
  /** Beat lengths (× base). */
  beats: {
    /** Seal splits, ball pops off, rolls and drops. */
    ball: number;
    /** Flap rotates open. */
    flap: number;
    /** Card slides up out of the pocket. */
    card: number;
    /** Pause with the card out. */
    hold: number;
    /** Card grows toward the viewer while the envelope drops away. */
    exit: number;
    /** Final card fade. */
    fade: number;
  };
  /** How early the next beat starts before the previous ends (× base). */
  overlap: { flap: number; card: number; fade: number };
  ball: {
    /** Gravity ease on the drop. */
    ease: string;
    /** Total roll rotation (deg). */
    rotation: number;
    /** Bounce once on the pocket before rolling off. */
    bounce: boolean;
    /** Horizontal travel as a fraction of the envelope width. */
    throwX: number;
  };
  flap: { ease: string };
  /** Card slide ease — falls back to `motion.ease` when omitted. */
  cardEase?: string;
  exit: {
    ease: string;
    /** Blur (px) applied while the card fades. 0 = none. */
    blur: number;
    scale: { desktop: number; mobile: number };
  };
  /** Tailwind classes for the flap liner (visible once open). */
  liner: string;
  /** Intro tilt (deg) the envelope settles from. */
  introTilt: number;
}

/** The Pickle & Pilates opening: springy — the seal ball pops, bounces once on the pocket and rolls off; the flap springs open; the card zooms in cleanly. */
export const OPENING_PRESET: OpeningPreset = {
  beats: { ball: 0.75, flap: 0.6, card: 0.65, hold: 0.22, exit: 0.5, fade: 0.3 },
  overlap: { flap: 0.15, card: 0.2, fade: 0.2 },
  ball: { ease: "power2.in", rotation: 600, bounce: true, throwX: 0.55 },
  flap: { ease: "back.out(1.4)" },
  exit: { ease: "power3.inOut", blur: 4, scale: { desktop: 1.9, mobile: 1.5 } },
  liner: "bg-primary/10",
  introTilt: 12,
};
