import type { ThemeDefinition } from "./types";

/**
 * The one Pickle & Pilates theme — classic invitation stationery: Cormorant
 * serif display with an italic "&", Great Vibes script for the accents,
 * Cormorant small caps for kickers/labels, Jost for readable body & forms;
 * paper surfaces with hairline frames, watercolour/botanical decor, and
 * springy, sporty motion.
 *
 * Colours here are only the pre-palette fallback — every palette in
 * `palettes.ts` replaces them in full. The default palette is Blush.
 */
export const base: ThemeDefinition = {
  id: "pnp",
  name: "Pickle & Pilates",
  scheme: "light",

  colors: {
    bg: "#fbf3f1",
    bgAlt: "#f6e5e1",
    surface: "#fffaf8",
    surface2: "#f8ebe7",
    fg: "#3a2a2c",
    fgMuted: "#7a6266",
    fgSubtle: "#a89094",
    primary: "#c4737f",
    primaryFg: "#fff8f6",
    secondary: "#a4b3a0",
    secondaryFg: "#26302a",
    accent: "#d9a37a",
    line: "#ecd9d5",
    lineStrong: "#d8bdb8",
    overlay: "#3a2a2c",
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
    scale: {
      xl: "clamp(3.6rem, 9.5vw, 8.5rem)",
      lg: "clamp(2.6rem, 6vw, 5rem)",
      md: "clamp(2.1rem, 4.2vw, 3.5rem)",
      sm: "clamp(1.6rem, 2.6vw, 2.25rem)",
    },
    kickerSize: "0.82rem",
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
    sectionY: "clamp(5.5rem, 11vw, 9rem)",
    gutter: "1.5rem",
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
      primary: "#c4737f",
      secondary: "#a4b3a0",
      ball: "#fffaf8",
      holes: "#7a6266",
      light: "#ffffff",
      particle: "#d9a37a",
    },
  },
};
