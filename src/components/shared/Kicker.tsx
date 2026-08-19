import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KickerProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** Ornament placement — the ornament itself is themed via [data-ornament]. */
  ornament?: "before" | "after" | "both" | "none";
  /** "primary" (default) · "muted" · "inverse" (for bg-fg blocks) · "inherit" */
  tone?: "primary" | "muted" | "inverse" | "inherit";
  className?: string;
}

const TONE: Record<NonNullable<KickerProps["tone"]>, string> = {
  primary: "text-primary",
  muted: "text-fg-muted",
  inverse: "text-page/80",
  inherit: "text-current",
};

/**
 * Small "voice" label with the theme's ornament (rule / diamond / leaf /
 * dot / slash — or nothing). Colors and tracking come from the theme.
 */
export function Kicker({ children, ornament = "before", tone = "primary", className, ...props }: KickerProps) {
  return (
    <span className={cn("t-kicker", TONE[tone], className)} {...props}>
      {(ornament === "before" || ornament === "both") && <span aria-hidden="true" className="t-ornament" />}
      <span>{children}</span>
      {(ornament === "after" || ornament === "both") && <span aria-hidden="true" className="t-ornament" />}
    </span>
  );
}
