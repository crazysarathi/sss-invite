import type { ThemeDefinition } from "./types";

/**
 * The one Pickle & Pilates theme — classic invitation stationery: Cormorant
 * serif display with an italic "&", Great Vibes script for the accents,
 * Cormorant small caps for kickers/labels, Jost for readable body & forms;
 * paper surfaces with hairline frames, watercolour/botanical decor, and
 * springy, sporty motion.
 *
 * Colours here are only the pre-palette fallback — the wisteria palette in
 * `palettes.ts` (the site's fixed lavender/sage/lime scheme) replaces them
 * in full at boot.
 */
export const base: ThemeDefinition = {
  id: "pnp",
  name: "Pickle & Pilates",
  scheme: "light",

  colors: {
    bg: "#f2f0f6",
    bgAlt: "#e6e2ee",
    surface: "#fcfbfe",
    surface2: "#edeaf3",
    fg: "#282334",
    fgMuted: "#544d63",
    fgSubtle: "#7f7791",
    primary: "#75689f",
    primaryFg: "#f7f5fc",
    secondary: "#8fa184",
    secondaryFg: "#242d1e",
    accent: "#c3d64b",
    line: "#e1dcea",
    lineStrong: "#c4bcd5",
    overlay: "#282334",
    destructive: "#c25a4e",
  },

  typography: {
    display: {
      family: '"Cormorant Variable", "Cormorant Garamond", Georgia, serif',
      weight: 500,
      tracking: "0.01em",
      transform: "none",
      leading: "1.02",
      italicAccent: true,
    },
    script: { family: '"Great Vibes", "Pinyon Script", "Brush Script MT", cursive', weight: 400 },
    body: { family: '"Jost Variable", "Jost", system-ui, sans-serif', weight: 400, leading: "1.7" },
    accent: {
      family: '"Cormorant SC", "Cormorant Variable", "Cormorant Garamond", Georgia, serif',
      weight: 600,
      tracking: "0.22em",
      transform: "none",
    },
    /* vw + rem slopes so phones sit near the (much smaller) minimum while
       desktop keeps the original scale — "reduce the words on mobile". */
    scale: {
      xl: "clamp(2.5rem, 8vw + 1rem, 8.5rem)",
      lg: "clamp(1.9rem, 5vw + 0.6rem, 5rem)",
      md: "clamp(1.6rem, 3.4vw + 0.5rem, 3.5rem)",
      sm: "clamp(1.3rem, 2vw + 0.5rem, 2.25rem)",
    },
    kickerSize: "clamp(0.74rem, 0.55vw + 0.6rem, 0.88rem)",
    load: () =>
      Promise.all([
        import("@fontsource-variable/cormorant/wght.css"),
        import("@fontsource-variable/cormorant/wght-italic.css"),
        import("@fontsource/cormorant-sc/600.css"),
        import("@fontsource/great-vibes/400.css"),
        import("@fontsource-variable/jost/wght.css"),
        import("@fontsource-variable/jost/wght-italic.css"),
      ]),
  },

  shape: {
    radius: { sm: "4px", md: "8px", lg: "14px", card: "6px", button: "999px", image: "6px", field: "6px" },
    borderWidth: "1px",
    shadow: {
      card: "0 22px 50px -30px rgb(var(--c-overlay) / 0.32)",
      float: "0 34px 80px -34px rgb(var(--c-overlay) / 0.4)",
      button: "0 12px 28px -14px rgb(var(--c-primary) / 0.6)",
    },
    card: "paper",
  },

  layout: {
    maxWidth: "1180px",
    sectionY: "clamp(4rem, 8vw + 1.5rem, 9rem)",
    gutter: "clamp(1rem, 4vw, 1.5rem)",
  },

  decor: {
    pattern: "court",
    patternOpacity: 0.55,
    grain: true,
    ornament: "rule",
  },

  motion: {
    ease: "expo.out",
    easeInOut: "power3.inOut",
    easeSpring: "back.out(1.6)",
    cssEase: "cubic-bezier(0.16, 0.84, 0.44, 1)",
    duration: { micro: 0.45, base: 1.1, slow: 1.6, cinematic: 2.2 },
    stagger: { items: 0.1, chars: 0.028, lines: 0.1 },
    distance: 36,
    reveal: "rise",
    text: "chars",
    parallax: 0.35,
    scrub: 1,
    hover: "lift",
    smooth: 1.2,
  },

  three: {
    palette: {
      primary: "#75689f",
      secondary: "#8fa184",
      ball: "#c3d64b",
      holes: "#6e743e",
      light: "#ffffff",
      particle: "#c3d64b",
    },
  },
};
