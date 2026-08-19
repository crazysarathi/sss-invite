import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Apply the theme's hover personality (lift / scale / none). */
  hover?: boolean;
  /** Use the alternate (nested) surface tone. */
  tone?: "default" | "alt";
  className?: string;
}

/**
 * The themed card. Border, radius, shadow and background all resolve from
 * the active theme (`shape.card`: flat / outline / solid / glass / lifted).
 * Replaces the SSS GlassCard.
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { children, hover = false, tone = "default", className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("t-surface", hover && "t-hover", tone === "alt" && "!bg-surface-2", className)}
      {...props}
    >
      {children}
    </div>
  );
});
