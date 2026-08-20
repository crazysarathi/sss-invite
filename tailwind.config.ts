import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Every color / font / radius / shadow utility below reads a CSS variable
 * that `applyTheme()` (src/themes/apply.ts) writes onto <html>. Switching the
 * colour palette rewrites the variables — the utilities never change.
 *
 * Colors are stored as "r g b" channel triples so opacity modifiers work:
 *   bg-primary/20, border-line/60, text-fg/80 …
 */
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        page: { DEFAULT: c("--c-bg"), alt: c("--c-bg-alt") },
        surface: { DEFAULT: c("--c-surface"), 2: c("--c-surface-2") },
        fg: { DEFAULT: c("--c-fg"), muted: c("--c-fg-muted"), subtle: c("--c-fg-subtle") },
        primary: { DEFAULT: c("--c-primary"), foreground: c("--c-primary-fg") },
        secondary: { DEFAULT: c("--c-secondary"), foreground: c("--c-secondary-fg") },
        accent: { DEFAULT: c("--c-accent"), foreground: c("--c-fg") },
        line: { DEFAULT: c("--c-line"), strong: c("--c-line-strong") },
        overlay: c("--c-overlay"),
        destructive: { DEFAULT: c("--c-destructive"), foreground: "#ffffff" },
        // shadcn semantic aliases → same tokens, so ui/* re-skins automatically
        border: c("--c-line"),
        input: c("--c-line-strong"),
        ring: c("--c-primary"),
        background: c("--c-bg"),
        foreground: c("--c-fg"),
        muted: { DEFAULT: c("--c-surface-2"), foreground: c("--c-fg-muted") },
        popover: { DEFAULT: c("--c-surface"), foreground: c("--c-fg") },
        card: { DEFAULT: c("--c-surface"), foreground: c("--c-fg") },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        accent: ["var(--font-accent)"],
        script: ["var(--font-script)"],
      },
      fontSize: {
        "display-xl": ["var(--display-xl)", { lineHeight: "var(--display-leading)" }],
        "display-lg": ["var(--display-lg)", { lineHeight: "var(--display-leading)" }],
        "display-md": ["var(--display-md)", { lineHeight: "calc(var(--display-leading) + 0.06)" }],
        "display-sm": ["var(--display-sm)", { lineHeight: "1.15" }],
        kicker: ["var(--kicker-size)", { lineHeight: "1.2", letterSpacing: "var(--accent-tracking)" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        card: "var(--radius-card)",
        btn: "var(--radius-btn)",
        img: "var(--radius-img)",
        field: "var(--radius-field)",
        pill: "999px",
      },
      borderWidth: {
        theme: "var(--border-w)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
        btn: "var(--shadow-btn)",
      },
      maxWidth: {
        shell: "var(--max-w)",
      },
      spacing: {
        gutter: "var(--gutter)",
        "section-y": "var(--section-y)",
      },
      transitionTimingFunction: {
        theme: "var(--ease)",
      },
      transitionDuration: {
        micro: "var(--dur-micro)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "scroll-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-1.6deg)" },
          "50%": { transform: "rotate(1.6deg)" },
        },
        // dasharray period is 11 (1 + 10); -66 is a whole number of periods,
        // so the loop wraps seamlessly.
        "dash-drift": {
          to: { "stroke-dashoffset": "-66" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        float: "float 6s ease-in-out infinite",
        "scroll-line": "scroll-line 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite",
        sway: "sway 6s ease-in-out infinite",
        "dash-drift": "dash-drift 7s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
