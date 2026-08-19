/**
 * Turns a ThemeDefinition into CSS custom properties + data attributes on
 * <html>. Tailwind utilities (tailwind.config.ts) and the helper classes in
 * index.css read these, so switching the colour palette re-skins the whole
 * document without touching a single component.
 */
import type { ThemeDefinition } from "./types";

/** "#a1b2c3" → "161 178 195" (channel triple for rgb(var(--x) / alpha)). */
export function hexToChannels(hex: string): string {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const COLOR_VAR: Record<keyof ThemeDefinition["colors"], string> = {
  bg: "--c-bg",
  bgAlt: "--c-bg-alt",
  surface: "--c-surface",
  surface2: "--c-surface-2",
  fg: "--c-fg",
  fgMuted: "--c-fg-muted",
  fgSubtle: "--c-fg-subtle",
  primary: "--c-primary",
  primaryFg: "--c-primary-fg",
  secondary: "--c-secondary",
  secondaryFg: "--c-secondary-fg",
  accent: "--c-accent",
  line: "--c-line",
  lineStrong: "--c-line-strong",
  overlay: "--c-overlay",
  destructive: "--c-destructive",
};

/** Build the full variable map for a theme (also used for previews). */
export function themeToVars(theme: ThemeDefinition): Record<string, string> {
  const { colors, typography: t, shape, layout, decor, motion } = theme;
  const vars: Record<string, string> = {};

  (Object.keys(COLOR_VAR) as Array<keyof typeof COLOR_VAR>).forEach((k) => {
    vars[COLOR_VAR[k]] = hexToChannels(colors[k]);
  });

  // typography
  vars["--font-display"] = t.display.family;
  vars["--font-body"] = t.body.family;
  vars["--font-accent"] = t.accent.family;
  vars["--font-script"] = t.script.family;
  vars["--script-weight"] = String(t.script.weight);
  vars["--display-weight"] = String(t.display.weight);
  vars["--display-tracking"] = t.display.tracking;
  vars["--display-transform"] = t.display.transform;
  vars["--display-leading"] = t.display.leading;
  vars["--body-weight"] = String(t.body.weight);
  vars["--body-leading"] = t.body.leading;
  vars["--accent-weight"] = String(t.accent.weight);
  vars["--accent-tracking"] = t.accent.tracking;
  vars["--accent-transform"] = t.accent.transform;
  vars["--display-xl"] = t.scale.xl;
  vars["--display-lg"] = t.scale.lg;
  vars["--display-md"] = t.scale.md;
  vars["--display-sm"] = t.scale.sm;
  vars["--kicker-size"] = t.kickerSize;

  // shape
  vars["--radius-sm"] = shape.radius.sm;
  vars["--radius-md"] = shape.radius.md;
  vars["--radius-lg"] = shape.radius.lg;
  vars["--radius-card"] = shape.radius.card;
  vars["--radius-btn"] = shape.radius.button;
  vars["--radius-img"] = shape.radius.image;
  vars["--radius-field"] = shape.radius.field;
  vars["--border-w"] = shape.borderWidth;
  vars["--shadow-card"] = shape.shadow.card;
  vars["--shadow-float"] = shape.shadow.float;
  vars["--shadow-btn"] = shape.shadow.button;

  // layout
  vars["--max-w"] = layout.maxWidth;
  vars["--section-y"] = layout.sectionY;
  vars["--gutter"] = layout.gutter;

  // decor
  vars["--pattern-opacity"] = String(decor.patternOpacity);

  // motion (CSS side)
  vars["--ease"] = motion.cssEase;
  vars["--dur-micro"] = `${motion.duration.micro}s`;
  vars["--dur-base"] = `${motion.duration.base}s`;
  vars["--dur-slow"] = `${motion.duration.slow}s`;

  return vars;
}

export function themeToAttrs(theme: ThemeDefinition): Record<string, string> {
  return {
    "data-theme": theme.id,
    "data-scheme": theme.scheme,
    "data-pattern": theme.decor.pattern,
    "data-card": theme.shape.card,
    "data-ornament": theme.decor.ornament,
    "data-grain": theme.decor.grain ? "on" : "off",
    "data-hover": theme.motion.hover,
    "data-italic": theme.typography.display.italicAccent ? "on" : "off",
  };
}

/** Write a theme's tokens onto <html>. Safe to call before React mounts. */
export function applyTheme(theme: ThemeDefinition, root: HTMLElement = document.documentElement) {
  const vars = themeToVars(theme);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  const attrs = themeToAttrs(theme);
  for (const [k, v] of Object.entries(attrs)) root.setAttribute(k, v);
  root.style.colorScheme = theme.scheme;
  // Browser chrome (mobile address bar) follows the page ground.
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme.colors.bg;
}

