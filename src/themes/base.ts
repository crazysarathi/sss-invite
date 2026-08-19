import type { ThemeDefinition } from "./types";

/**
 * The one Pickle & Pilates theme: soft invitation typography (Fraunces
 * serif display with an italic "&", Jost for body and labels), rounded
 * pastel surfaces, hairline court-line decor and springy, sporty motion.
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
      family: '"Fraunces Variable", "Fraunces", "Cormorant Garamond", Georgia, serif',
      weight: 500,
      tracking: "-0.015em",
      transform: "none",
      leading: "1.0",
      italicAccent: true,
    },
    body: { family: '"Jost Variable", "Jost", system-ui, sans-serif', weight: 400, leading: "1.7" },
    accent: {
      family: '"Jost Variable", "Jost", system-ui, sans-serif',
      weight: 500,
      tracking: "0.28em",
      transform: "uppercase",
    },
    scale: {
      xl: "clamp(3.4rem, 9.5vw, 8.5rem)",
      lg: "clamp(2.5rem, 6vw, 5rem)",
      md: "clamp(2rem, 4.2vw, 3.5rem)",
      sm: "clamp(1.5rem, 2.6vw, 2.125rem)",
    },
    kickerSize: "0.72rem",
    load: () =>
      Promise.all([
        import("@fontsource-variable/fraunces/wght.css"),
        import("@fontsource-variable/fraunces/wght-italic.css"),
        import("@fontsource-variable/jost/wght.css"),
        import("@fontsource-variable/jost/wght-italic.css"),
      ]),
  },

  shape: {
    radius: { sm: "6px", md: "12px", lg: "20px", card: "22px", button: "999px", image: "18px", field: "12px" },
    borderWidth: "1px",
    shadow: {
      card: "0 18px 50px -28px rgb(var(--c-overlay) / 0.28)",
      float: "0 30px 70px -30px rgb(var(--c-overlay) / 0.38)",
      button: "0 12px 28px -14px rgb(var(--c-primary) / 0.7)",
    },
    card: "lifted",
  },

  layout: {
    maxWidth: "1180px",
    sectionY: "clamp(5.5rem, 11vw, 9rem)",
    gutter: "1.5rem",
  },

  decor: {
    pattern: "court",
    patternOpacity: 0.9,
    grain: false,
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
