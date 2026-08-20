/**
 * Tempo for the gate opening. Every beat is a multiplier of the theme's
 * `motion.duration.base`, so the preset only shapes the choreography (how
 * the ball serves off, how the doors swing apart) — the absolute pace
 * comes from the theme's motion.
 */
export interface OpeningPreset {
  /** Beat lengths (× base). */
  beats: {
    /** Copy + ring step aside. */
    text: number;
    /** The seal ball squashes, hops and serves off past the floor. */
    ball: number;
    /** The door leaves swing apart. */
    doors: number;
  };
  /** How long after the open begins the doors start moving (× base). */
  doorsDelay: number;
  ball: {
    /** Hop height as a fraction of the viewport height. */
    rise: number;
    /** Total spin (deg) across the serve. */
    rotation: number;
    /** Gravity ease on the drop. */
    ease: string;
  };
  doors: {
    ease: string;
    /** Slight swing (deg) each leaf takes as it slides out. */
    rotateY: number;
    /** How far each leaf travels (xPercent — >100 clears its own shadow). */
    travel: number;
  };
  /** How far (px) the leaves part on hover — a little "peek" invitation. */
  hoverPart: number;
}

/** The Pickle & Pilates opening: the seal ball serves off with a spin and
 *  the two paper leaves swing apart like the doors of the club. */
export const OPENING_PRESET: OpeningPreset = {
  beats: { text: 0.3, ball: 0.85, doors: 1.05 },
  doorsDelay: 0.3,
  ball: { rise: 0.16, rotation: 780, ease: "power2.in" },
  doors: { ease: "power3.inOut", rotateY: 6, travel: 106 },
  hoverPart: 9,
};
