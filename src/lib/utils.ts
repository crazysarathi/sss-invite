import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must be taught our custom font-size utilities, otherwise
 * it treats `text-display-*` / `text-kicker` as colors and drops them when
 * a `text-<color>` class follows in the same cn() call.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-xl", "display-lg", "display-md", "display-sm", "kicker"] }],
      // `border-theme` is a border WIDTH (var(--border-w)), not a color —
      // otherwise `border-theme border-line` drops the width.
      "border-w": [{ border: ["theme"] }],
      rounded: [{ rounded: ["card", "btn", "img", "field", "pill"] }],
      shadow: [{ shadow: ["card", "float", "btn"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
