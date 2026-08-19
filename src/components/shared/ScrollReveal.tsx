import { useRef, type ReactNode, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";
import { revealVars, type RevealDirection } from "@/lib/motion";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import type { RevealStyle } from "@/themes/types";

interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Override the theme's reveal style for this instance. */
  style?: RevealStyle;
  /** Direction the element travels/wipes from. */
  from?: RevealDirection;
  distance?: number;
  delay?: number;
  duration?: number;
  /** Stagger direct children instead of animating the wrapper. */
  staggerChildren?: boolean;
  stagger?: number;
  start?: string;
  /** Animate on mount instead of on scroll (hero-style). */
  trigger?: "scroll" | "mount";
}

/**
 * General-purpose in-view reveal. The animation personality (fade / rise /
 * slide / scale / clip / blur, ease, duration, distance, stagger) comes from
 * the active theme unless overridden per instance.
 */
export function ScrollReveal({
  children,
  as: Tag = "div",
  className,
  style,
  from,
  distance,
  delay = 0,
  duration,
  staggerChildren = false,
  stagger,
  start = "top 85%",
  trigger = "scroll",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const motion = useThemeMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const { from: fromVars, to } = revealVars(motion, style, from, distance);
      const targets = staggerChildren ? Array.from(el.children) : el;
      if (staggerChildren && !el.children.length) return;

      gsap.fromTo(targets, fromVars, {
        ...to,
        duration: duration ?? to.duration,
        delay,
        stagger: staggerChildren ? (stagger ?? motion.stagger.items) : 0,
        scrollTrigger: trigger === "scroll" ? { trigger: el, start, once: true } : undefined,
        // Drop inline transforms when done so CSS hover transforms
        // (.t-hover) work again.
        clearProps: to.clearProps ? `${to.clearProps},transform` : "transform",
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
