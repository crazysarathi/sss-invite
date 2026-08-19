/**
 * Theme registry: one base theme, many colour palettes.
 * `?palette=<id>` in the URL wins, then localStorage, then Blush.
 */
import { base } from "./base";
import { DEFAULT_PALETTE, isPaletteId, paletteById, withPalette, type PaletteDefinition, type PaletteId } from "./palettes";
import type { ThemeDefinition } from "./types";

export const baseTheme: ThemeDefinition = base;

const PALETTE_STORAGE_KEY = "pnp-palette";
const PALETTE_URL_PARAM = "palette";

export function resolveInitialPalette(): PaletteDefinition {
  if (typeof window === "undefined") return paletteById[DEFAULT_PALETTE];
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(PALETTE_URL_PARAM);
    if (isPaletteId(fromUrl)) return paletteById[fromUrl];
    const stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (isPaletteId(stored)) return paletteById[stored];
  } catch {
    // storage/URL unavailable — fall through
  }
  return paletteById[DEFAULT_PALETTE];
}

export function persistPalette(id: PaletteId) {
  try {
    window.localStorage.setItem(PALETTE_STORAGE_KEY, id);
    const url = new URL(window.location.href);
    url.searchParams.set(PALETTE_URL_PARAM, id);
    window.history.replaceState(window.history.state, "", url);
  } catch {
    // ignore — persistence is a convenience only
  }
}

/** The resolved theme for a palette (base layout/type/motion + the palette's colours). */
export function resolveTheme(palette: PaletteDefinition): ThemeDefinition {
  return withPalette(base, palette);
}

export * from "./types";
export * from "./palettes";
export { applyTheme, themeToVars, hexToChannels } from "./apply";
