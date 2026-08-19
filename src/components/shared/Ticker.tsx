import { cn } from "@/lib/utils";

interface TickerProps {
  text: string;
  className?: string;
  /** Seconds per loop. */
  speed?: number;
  /** Classes for the moving text row (color/size overrides). */
  textClassName?: string;
}

/**
 * Infinite marquee strip. Pure CSS animation (GPU-composited); the global
 * reduced-motion rule freezes it. Type follows the theme's accent voice.
 */
export function Ticker({ text, className, speed = 32, textClassName }: TickerProps) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none w-full overflow-hidden", className)}>
      <div
        className={cn("t-accent flex w-max animate-marquee whitespace-nowrap text-sm text-fg-subtle", textClassName)}
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="pr-2">{text}</span>
        <span className="pr-2">{text}</span>
      </div>
    </div>
  );
}
