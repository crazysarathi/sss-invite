/**
 * Theme-aware motion helpers. Shared animation components ask the active
 * theme for its personality (ease, durations, reveal style…) and build
 * GSAP vars from it, so one <ScrollReveal> fades softly in Elegant, slides
 * hard in Sporty and clip-reveals in Editorial.
 */
import type { RevealStyle, ThemeMotion } from "@/themes/types";
import { gsap } from "@/lib/gsap";

export type RevealDirection = "up" | "down" | "left" | "right";

export interface RevealVars {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

/**
 * Build from/to vars for a reveal. `style` defaults to the theme's reveal,
 * `direction` biases rise/slide/clip.
 */
export function revealVars(
  motion: ThemeMotion,
  style: RevealStyle = motion.reveal,
  direction: RevealDirection = style === "slide" ? "left" : "up",
  distance: number = motion.distance
): RevealVars {
  const from: gsap.TweenVars = { autoAlpha: 0 };
  const to: gsap.TweenVars = {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: motion.duration.base,
    ease: motion.ease,
  };

  switch (style) {
    case "fade":
      from.y = Math.min(distance, 16);
      break;
    case "rise":
      if (direction === "up") from.y = distance;
      else if (direction === "down") from.y = -distance;
      else if (direction === "left") from.x = -distance;
      else from.x = distance;
      break;
    case "slide":
      if (direction === "left") from.x = -distance;
      else if (direction === "right") from.x = distance;
      else if (direction === "up") from.y = distance;
      else from.y = -distance;
      break;
    case "scale":
      from.scale = 0.9;
      from.y = distance * 0.4;
      break;
    case "clip": {
      // Wipe in from an edge; opacity stays 1 so the clip does the work.
      const closed =
        direction === "up"
          ? "inset(100% 0 0 0)"
          : direction === "down"
            ? "inset(0 0 100% 0)"
            : direction === "left"
              ? "inset(0 100% 0 0)"
              : "inset(0 0 0 100%)";
      from.clipPath = closed;
      from.autoAlpha = 1;
      to.clipPath = "inset(0% 0% 0% 0%)";
      to.clearProps = "clipPath";
      break;
    }
    case "blur":
      from.filter = "blur(14px)";
      from.y = distance;
      to.filter = "blur(0px)";
      to.clearProps = "filter";
      break;
  }
  return { from, to };
}

/** Text-split reveal vars — chars slam up in Sporty, lines glide in Elegant. */
export function textVars(motion: ThemeMotion): { from: gsap.TweenVars; to: gsap.TweenVars } {
  switch (motion.text) {
    case "chars":
      return {
        from: { yPercent: 110, rotateX: -30, transformOrigin: "50% 100%", transformPerspective: 600, opacity: 0 },
        to: { yPercent: 0, rotateX: 0, opacity: 1, duration: motion.duration.base, ease: motion.ease },
      };
    case "words":
      return {
        from: { yPercent: 60, opacity: 0, filter: "blur(6px)" },
        to: {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: motion.duration.base,
          ease: motion.ease,
          clearProps: "filter",
        },
      };
    case "lines":
    default:
      return {
        from: { yPercent: 100 },
        to: { yPercent: 0, duration: motion.duration.base, ease: motion.ease },
      };
  }
}

/** Sync gsap defaults with a theme (called by ThemeProvider on switch). */
export function applyMotionDefaults(motion: ThemeMotion) {
  gsap.defaults({ ease: motion.ease, duration: motion.duration.base });
}
