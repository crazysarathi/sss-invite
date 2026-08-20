import type { ThemeColors, ThemeDefinition, ThemeThree } from "./types";
export type PaletteId = "wisteria";
export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  tagline: string;
  scheme: "light" | "dark";
  colors: ThemeColors;
}

/**
 * The ONE palette — the site's fixed colours: the wisteria combo, built
 * from the client's reference photo. Lavender leads, court sage seconds,
 * the chartreuse pickleball is the accent. No picker; this is the whole
 * scheme.
 *
 *   lavender     #b3abc8   (panel)  → deepened to #75689f for CTAs/text-on
 *   court sage   #8fa184   (panel)
 *   ball         #c3d64b   (the chartreuse pickleball — the accent)
 */
export const palettes: readonly PaletteDefinition[] = [
  {
    id: "wisteria",
    name: "Wisteria",
    tagline: "Lavender & sage, ball lime",
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
  },
] as const;

export const paletteById: Record<PaletteId, PaletteDefinition> = Object.fromEntries(
  palettes.map((p) => [p.id, p])
) as Record<PaletteId, PaletteDefinition>;

export const PALETTE_IDS = palettes.map((p) => p.id) as PaletteId[];
export const DEFAULT_PALETTE: PaletteId = "wisteria";

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (PALETTE_IDS as string[]).includes(value);
}

/** Mix two hex colours (t = 0 → a, t = 1 → b). */
function mixHex(a: string, b: string, t: number): string {
  const ch = (hex: string) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [ar, ag, ab] = ch(a);
  const [br, bg, bb] = ch(b);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[mix(ar, br), mix(ag, bg), mix(ab, bb)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * 3D palette hints (ball body, holes, lights). The ball is the chartreuse
 * pickleball from the reference photo — the palette's accent — with holes
 * shaded toward the ink colour (dark olive on chartreuse).
 */
function threePalette(colors: ThemeColors, scheme: "light" | "dark"): ThemeThree["palette"] {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    ball: colors.accent,
    holes: mixHex(colors.accent, colors.fg, 0.55),
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
