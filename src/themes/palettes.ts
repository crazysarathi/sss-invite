/**
 * Colour palettes — the ONE thing the client switches.
 *
 * The hosts asked for pastels: pink shades, ivory shades, a lighter
 * version of the Smashers' logo green & blue, and a court photo they shared
 * (sage & lavender court, lime ball). Each ask gets two takes, so
 * they can compare side by side. A palette is a full 16-token colour set
 * (see ThemeColors) with readable contrast; `withPalette()` swaps it into
 * the base theme and derives the 3D ball materials from it.
 */
import type { ThemeColors, ThemeDefinition, ThemeThree } from "./types";

export type PaletteId = "blush" | "rose" | "ivory" | "linen" | "sky" | "sage" | "court" | "wisteria";

export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  tagline: string;
  /** Which client ask this answers — groups the chips in the picker. */
  group: "pink" | "ivory" | "logo" | "court";
  scheme: "light" | "dark";
  colors: ThemeColors;
}

export const palettes: readonly PaletteDefinition[] = [
  // {
  //   id: "blush",
  //   name: "Blush",
  //   tagline: "Soft pink & rose",
  //   group: "pink",
  //   scheme: "light",
  //   colors: {
  //     bg: "#fbf3f1",
  //     bgAlt: "#f6e5e1",
  //     surface: "#fffaf8",
  //     surface2: "#f8ebe7",
  //     fg: "#3a2a2c",
  //     fgMuted: "#7a6266",
  //     fgSubtle: "#a89094",
  //     primary: "#c4737f",
  //     primaryFg: "#fff8f6",
  //     secondary: "#a4b3a0",
  //     secondaryFg: "#26302a",
  //     accent: "#d9a37a",
  //     line: "#ecd9d5",
  //     lineStrong: "#d8bdb8",
  //     overlay: "#3a2a2c",
  //     destructive: "#c25a4e",
  //   },
  // },
  // {
  //   id: "rose",
  //   name: "Rose",
  //   tagline: "Dusty pink & plum",
  //   group: "pink",
  //   scheme: "light",
  //   colors: {
  //     bg: "#f9eef0",
  //     bgAlt: "#f2dde1",
  //     surface: "#fdf7f8",
  //     surface2: "#f6e6e9",
  //     fg: "#3b2431",
  //     fgMuted: "#7b5a68",
  //     fgSubtle: "#ab8e99",
  //     primary: "#b3566f",
  //     primaryFg: "#fff6f8",
  //     secondary: "#d8a7b4",
  //     secondaryFg: "#3b2431",
  //     accent: "#8fae9c",
  //     line: "#ead3d9",
  //     lineStrong: "#d6b4be",
  //     overlay: "#3b2431",
  //     destructive: "#c25a4e",
  //   },
  // },
  // {
  //   id: "ivory",
  //   name: "Ivory",
  //   tagline: "Cream, sand & bronze",
  //   group: "ivory",
  //   scheme: "light",
  //   colors: {
  //     bg: "#f8f4ec",
  //     bgAlt: "#f0e9db",
  //     surface: "#fdfbf6",
  //     surface2: "#f4eee2",
  //     fg: "#2e2a24",
  //     fgMuted: "#6d655a",
  //     fgSubtle: "#9d958a",
  //     primary: "#a58a5b",
  //     primaryFg: "#fdfbf6",
  //     secondary: "#8b9c7e",
  //     secondaryFg: "#f8f4ec",
  //     accent: "#c9a86a",
  //     line: "#e6dccb",
  //     lineStrong: "#cfc1a8",
  //     overlay: "#2e2a24",
  //     destructive: "#b8574a",
  //   },
  // },
  // {
  //   id: "linen",
  //   name: "Linen",
  //   tagline: "Warm ivory, oat & clay",
  //   group: "ivory",
  //   scheme: "light",
  //   colors: {
  //     bg: "#faf6f0",
  //     bgAlt: "#f2eadf",
  //     surface: "#fffdf9",
  //     surface2: "#f6f0e6",
  //     fg: "#332b26",
  //     fgMuted: "#72665c",
  //     fgSubtle: "#a3978c",
  //     primary: "#b87a5c",
  //     primaryFg: "#fff8f3",
  //     secondary: "#c9b99a",
  //     secondaryFg: "#332b26",
  //     accent: "#9fb0a2",
  //     line: "#e9dfd2",
  //     lineStrong: "#d3c4b0",
  //     overlay: "#332b26",
  //     destructive: "#b8574a",
  //   },
  // },
  // {
  //   id: "sky",
  //   name: "Sky & Lime",
  //   tagline: "The logo's blue & green, lightened",
  //   group: "logo",
  //   scheme: "light",
  //   colors: {
  //     bg: "#f3f7fb",
  //     bgAlt: "#e4edf6",
  //     surface: "#ffffff",
  //     surface2: "#edf3f9",
  //     fg: "#14202c",
  //     fgMuted: "#4d5b6b",
  //     fgSubtle: "#8896a6",
  //     primary: "#3f7cc2",
  //     primaryFg: "#f7fbff",
  //     secondary: "#c9e48f",
  //     secondaryFg: "#1d2a12",
  //     accent: "#8fd0c4",
  //     line: "#d4e0ec",
  //     lineStrong: "#b6c8dc",
  //     overlay: "#14202c",
  //     destructive: "#c9564a",
  //   },
  // },
  // {
  //   id: "sage",
  //   name: "Sage & Sky",
  //   tagline: "Soft green, pale blue",
  //   group: "logo",
  //   scheme: "light",
  //   colors: {
  //     bg: "#f2f7f3",
  //     bgAlt: "#e4eee7",
  //     surface: "#ffffff",
  //     surface2: "#edf4ef",
  //     fg: "#16261f",
  //     fgMuted: "#4d5f56",
  //     fgSubtle: "#86968e",
  //     primary: "#3b7f6a",
  //     primaryFg: "#f2f7f3",
  //     secondary: "#9cc5e6",
  //     secondaryFg: "#0f2233",
  //     accent: "#c5df7a",
  //     line: "#d3e1d8",
  //     lineStrong: "#b3c8bc",
  //     overlay: "#16261f",
  //     destructive: "#c9564a",
  //   },
  // },
  {
    id: "court",
    name: "Courtside",
    tagline: "Sage court, lavender & lime",
    group: "court",
    scheme: "light",
    colors: {
      bg: "#f3f6f1",
      bgAlt: "#e6ece1",
      surface: "#fdfefc",
      surface2: "#edf2e9",
      fg: "#232b20",
      fgMuted: "#59644f",
      fgSubtle: "#8c9584",
      primary: "#5e7a54",
      primaryFg: "#f5f8f2",
      secondary: "#b7abce",
      secondaryFg: "#2b2438",
      accent: "#c4d45e",
      line: "#dce3d4",
      lineStrong: "#bdc9b2",
      overlay: "#232b20",
      destructive: "#c25a4e",
    },
  },
  {
    id: "wisteria",
    name: "Wisteria",
    tagline: "Lavender-led, sage & lime",
    group: "court",
    scheme: "light",
    colors: {
      bg: "#f6f4f9",
      bgAlt: "#eae6f1",
      surface: "#fefdff",
      surface2: "#f1edf6",
      fg: "#2a2433",
      fgMuted: "#645c72",
      fgSubtle: "#968fa3",
      primary: "#7a6a9d",
      primaryFg: "#f8f5fd",
      secondary: "#a9bfa0",
      secondaryFg: "#25301f",
      accent: "#c9d668",
      line: "#e3ddec",
      lineStrong: "#c8bfd8",
      overlay: "#2a2433",
      destructive: "#c25a4e",
    },
  },
] as const;

export const PALETTE_GROUPS: Record<PaletteDefinition["group"], { label: string; hint: string }> = {
  pink: { label: "Pink shades", hint: "Blush & rose" },
  ivory: { label: "Ivory shades", hint: "Cream & linen" },
  logo: { label: "Logo colours", hint: "Lighter blue & green" },
  court: { label: "Court colours", hint: "Sage & lavender" },
};

export const paletteById: Record<PaletteId, PaletteDefinition> = Object.fromEntries(
  palettes.map((p) => [p.id, p])
) as Record<PaletteId, PaletteDefinition>;

export const PALETTE_IDS = palettes.map((p) => p.id) as PaletteId[];
export const DEFAULT_PALETTE: PaletteId = "blush";

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (PALETTE_IDS as string[]).includes(value);
}

/** 3D palette hints derived from a colour set (ball body, holes, lights). */
function threePalette(colors: ThemeColors, scheme: "light" | "dark"): ThemeThree["palette"] {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    ball: scheme === "dark" ? colors.fg : colors.surface,
    holes: scheme === "dark" ? colors.lineStrong : colors.fgMuted,
    light: scheme === "dark" ? colors.accent : "#ffffff",
    particle: colors.accent,
  };
}

/** Resolve the base theme with a palette applied (colours + derived 3D palette). */
export function withPalette(theme: ThemeDefinition, palette: PaletteDefinition): ThemeDefinition {
  return {
    ...theme,
    scheme: palette.scheme,
    colors: palette.colors,
    three: { ...theme.three, palette: threePalette(palette.colors, palette.scheme) },
  };
}
