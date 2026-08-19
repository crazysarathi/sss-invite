import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { applyMotionDefaults } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import {
  applyTheme,
  paletteById,
  palettes,
  persistPalette,
  resolveInitialPalette,
  resolveTheme,
  type PaletteDefinition,
  type PaletteId,
} from "@/themes";
import type { ThemeDefinition, ThemeLayout, ThemeMotion } from "@/themes/types";

interface ThemeContextValue {
  /** The RESOLVED theme (base layout/type/motion + the active palette's colours). */
  theme: ThemeDefinition;
  /** Active colour palette. */
  palette: PaletteDefinition;
  palettes: readonly PaletteDefinition[];
  /** Swap the colours. Every token morphs live — nothing remounts, scroll is untouched. */
  setPalette: (id: PaletteId) => void;
  isSwitching: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const FONT_TIMEOUT = 2500;
/** How long colours cross-fade when a palette is chosen (see index.css `.palette-morph`). */
const MORPH_MS = 750;
let fontsLoaded = false;

function loadFonts(theme: ThemeDefinition): Promise<unknown> {
  if (fontsLoaded) return Promise.resolve();
  const timeout = new Promise((r) => setTimeout(r, FONT_TIMEOUT));
  return Promise.race([
    theme.typography.load().then(() => {
      fontsLoaded = true;
      return Promise.race([document.fonts?.ready ?? Promise.resolve(), timeout]);
    }),
    timeout,
  ]).catch(() => undefined);
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Force an initial palette (otherwise URL → localStorage → Blush). */
  initial?: PaletteId;
}

/**
 * Owns the active colour palette. Choosing a palette rewrites the colour
 * tokens on <html> under a short CSS cross-fade (`.palette-morph`), so the
 * client watches the whole invitation re-colour in place.
 */
export function ThemeProvider({ children, initial }: ThemeProviderProps) {
  const [palette, setPaletteState] = useState<PaletteDefinition>(() =>
    initial ? paletteById[initial] : resolveInitialPalette()
  );
  const [isSwitching, setSwitching] = useState(false);
  const morphTimer = useRef<number | null>(null);

  const theme = useMemo(() => resolveTheme(palette), [palette]);

  // Tokens on <html> before first paint of the tree (idempotent — main.tsx
  // already applied the initial theme before React mounted).
  useLayoutEffect(() => {
    applyTheme(theme);
    applyMotionDefaults(theme.motion);
  }, [theme]);

  // Fonts.
  useEffect(() => {
    let cancelled = false;
    loadFonts(theme).then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
    // Fonts are the same for every palette — load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPalette = useCallback(
    (id: PaletteId) => {
      const next = paletteById[id];
      if (!next || next.id === palette.id) return;
      const root = document.documentElement;
      if (!prefersReducedMotion()) {
        root.classList.add("palette-morph");
        setSwitching(true);
        if (morphTimer.current) window.clearTimeout(morphTimer.current);
        morphTimer.current = window.setTimeout(() => {
          root.classList.remove("palette-morph");
          setSwitching(false);
          morphTimer.current = null;
        }, MORPH_MS);
      }
      persistPalette(id);
      setPaletteState(next);
    },
    [palette.id]
  );

  useEffect(
    () => () => {
      if (morphTimer.current) window.clearTimeout(morphTimer.current);
      document.documentElement.classList.remove("palette-morph");
    },
    []
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, palette, palettes, setPalette, isSwitching }),
    [theme, palette, setPalette, isSwitching]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export function useThemeMotion(): ThemeMotion {
  return useTheme().theme.motion;
}

export function useThemeLayout(): ThemeLayout {
  return useTheme().theme.layout;
}
