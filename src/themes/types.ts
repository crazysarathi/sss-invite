/**
 * Theme contract for the Pickle & Pilates invitation.
 *
 * There is ONE layout/type/motion theme (`src/themes/base.ts`). The only
 * thing the client switches is the COLOUR PALETTE (`src/themes/palettes.ts`):
 * a palette replaces `colors` (and the derived scheme / 3D palette) and every
 * component re-dresses through CSS variables — nothing remounts.
 *
 *   1. Colour tokens → `applyTheme()` writes `--c-*` channel triples on <html>,
 *      Tailwind utilities (bg-primary, text-fg …) read them.
 *   2. Type / shape / layout tokens → the same mechanism (`--font-*`, `--radius-*` …).
 *   3. Decor flags → `data-*` attributes on <html> that index.css decorates.
 *   4. Motion personality → animation components read `useThemeMotion()`.
 *   5. 3D palette → the pickleball materials (opening seal + hero ball).
 */

export type ThemeId = "pnp";

/* ------------------------------------------------------------------ */
/* Colors — solid hex only. Converted to "r g b" channel triples so     */
/* Tailwind opacity modifiers (bg-primary/20) keep working.             */
/* ------------------------------------------------------------------ */
export interface ThemeColors {
  /** Page ground. */
  bg: string;
  /** Alternate section ground (used to band sections). */
  bgAlt: string;
  /** Card / panel surface. */
  surface: string;
  /** Nested or hovered surface. */
  surface2: string;
  /** Primary text. */
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  /** Brand color for primary CTAs and key accents. */
  primary: string;
  /** Text painted on top of `primary`. */
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  /** Sparse highlight color (kickers, rules, the ball's holes…). */
  accent: string;
  /** Hairlines / borders. */
  line: string;
  lineStrong: string;
  /** Tint used for image overlays / shadows (with alpha). */
  overlay: string;
  destructive: string;
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */
export type TextTransform = "none" | "uppercase";

export interface FontFace {
  /** CSS font-family stack, first entry is the loaded face. */
  family: string;
  weight: number;
}

export interface ThemeTypography {
  display: FontFace & {
    tracking: string;
    transform: TextTransform;
    leading: string;
    /** Render emphasised display words (the "&") in italic. */
    italicAccent: boolean;
  };
  /** Calligraphic accent face (the "with Matcha bar" line, sign-offs). */
  script: FontFace;
  body: FontFace & { leading: string };
  /** Kickers, labels, buttons — the "voice" of the small type. */
  accent: FontFace & { tracking: string; transform: TextTransform };
  /** Fluid display sizes (clamp() strings). */
  scale: { xl: string; lg: string; md: string; sm: string };
  /** Kicker size (rem string). */
  kickerSize: string;
  /** Loads the @fontsource CSS (code-split). */
  load: () => Promise<unknown>;
}

/* ------------------------------------------------------------------ */
/* Shape                                                               */
/* ------------------------------------------------------------------ */
export type CardStyle = "flat" | "outline" | "solid" | "glass" | "lifted" | "paper";

export interface ThemeShape {
  radius: {
    sm: string;
    md: string;
    lg: string;
    card: string;
    button: string;
    image: string;
    field: string;
  };
  borderWidth: string;
  shadow: { card: string; float: string; button: string };
  card: CardStyle;
}

/* ------------------------------------------------------------------ */
/* Layout — spacing only                                               */
/* ------------------------------------------------------------------ */
export interface ThemeLayout {
  /** Content max width (CSS length). */
  maxWidth: string;
  /** Vertical section padding (CSS length / clamp). */
  sectionY: string;
  /** Horizontal gutter (CSS length). */
  gutter: string;
}

/* ------------------------------------------------------------------ */
/* Decor                                                               */
/* ------------------------------------------------------------------ */
export type Pattern = "none" | "grid" | "dots" | "lines" | "court";
export type Ornament = "none" | "rule" | "diamond" | "dot";

export interface ThemeDecor {
  pattern: Pattern;
  /** 0–1 */
  patternOpacity: number;
  grain: boolean;
  /** Small ornament used beside kickers. */
  ornament: Ornament;
}

/* ------------------------------------------------------------------ */
/* Motion personality                                                  */
/* ------------------------------------------------------------------ */
export type RevealStyle = "fade" | "rise" | "slide" | "scale" | "clip" | "blur";
export type TextSplit = "lines" | "words" | "chars";
export type HoverStyle = "lift" | "scale" | "none";

export interface ThemeMotion {
  /** GSAP ease for entrances. */
  ease: string;
  /** GSAP ease for exits / camera moves. */
  easeInOut: string;
  /** Springy ease for sporty beats (ball bounces, paddle swings). */
  easeSpring: string;
  /** CSS cubic-bezier used by transition utilities. */
  cssEase: string;
  duration: { micro: number; base: number; slow: number; cinematic: number };
  stagger: { items: number; chars: number; lines: number };
  /** Travel distance (px) for rise/slide reveals. */
  distance: number;
  reveal: RevealStyle;
  text: TextSplit;
  /** 0 (none) – 1 (strong) scroll parallax. */
  parallax: number;
  /** ScrollTrigger scrub inertia. */
  scrub: number;
  hover: HoverStyle;
  /** ScrollSmoother `smooth` value on desktop. */
  smooth: number;
}

/* ------------------------------------------------------------------ */
/* 3D                                                                  */
/* ------------------------------------------------------------------ */
export interface ThemeThree {
  palette: {
    primary: string;
    secondary: string;
    ball: string;
    holes: string;
    light: string;
    particle: string;
  };
}

/* ------------------------------------------------------------------ */
/* The theme                                                           */
/* ------------------------------------------------------------------ */
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  scheme: "light" | "dark";
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  layout: ThemeLayout;
  decor: ThemeDecor;
  motion: ThemeMotion;
  three: ThemeThree;
}
