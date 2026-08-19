import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { ScrollTrigger } from "@/lib/gsap";

const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Floating back-to-top button. Lives OUTSIDE the ScrollSmoother wrapper
 * (position:fixed), fades in once the reader has scrolled half a viewport
 * and wears a progress ring in the theme's primary color.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  // Driven by ScrollTrigger (proxied by ScrollSmoother on desktop) so the
  // button and its ring follow the smoothed content, not the native scrollbar.
  useEffect(() => {
    const sync = (st: ScrollTrigger) => {
      const y = st.scroll();
      setVisible(y > window.innerHeight * 0.5);
      const max = ScrollTrigger.maxScroll(window);
      const progress = max > 0 ? Math.min(1, y / max) : 0;
      ringRef.current?.style.setProperty("stroke-dashoffset", String(CIRCUMFERENCE * (1 - progress)));
    };
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: sync, onRefresh: sync });
    sync(st);
    return () => st.kill();
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => scrollToSection("#hero")}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-btn",
        "border-theme border-line-strong bg-surface/90 text-fg-muted shadow-float backdrop-blur-md",
        "transition-[opacity,transform,color,border-color] duration-500 ease-out",
        "hover:border-primary hover:text-primary focus-visible:text-primary",
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" fill="none">
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={RADIUS}
          stroke="rgb(var(--c-primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          opacity="0.9"
        />
      </svg>
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
