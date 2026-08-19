import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";
import { textVars } from "@/lib/motion";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import type { TextSplit } from "@/themes/types";

interface AnimatedTextProps {
  /** Plain string, or markup (e.g. <em>) — SplitText handles nested inline elements. */
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Override the theme's split ("chars" | "words" | "lines"). */
  split?: TextSplit;
  delay?: number;
  stagger?: number;
  /** Animate on scroll into view (default) or immediately on mount. */
  trigger?: "scroll" | "mount";
  start?: string;
  /** Called once the entrance completes. */
  onComplete?: () => void;
}

/**
 * SplitText-powered text reveal whose personality follows the theme:
 * lines glide up behind masks (Elegant / Luxury), words de-blur (Modern /
 * Tropical), chars slam upright (Sporty / Editorial). Reduced motion →
 * text renders plainly.
 */
export function AnimatedText({
  children,
  as: Tag = "div",
  className,
  split,
  delay = 0,
  stagger,
  trigger = "scroll",
  start = "top 85%",
  onComplete,
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const motion = useThemeMotion();
  const mode: TextSplit = split ?? motion.text;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      const { from, to } = textVars({ ...motion, text: mode });
      const each =
        stagger ?? (mode === "chars" ? motion.stagger.chars : mode === "words" ? motion.stagger.items * 0.5 : motion.stagger.lines);
      let fired = false;

      // autoSplit re-splits when fonts finish loading or the width changes, so
      // line boxes are always measured against the real faces; onSplit returns
      // the tween so SplitText can rebuild/resume it after a re-split.
      const splitter = new SplitText(el, {
        type: mode === "chars" ? "chars,words,lines" : mode === "words" ? "words,lines" : "lines",
        mask: mode === "lines" || mode === "chars" ? "lines" : undefined,
        linesClass: "at-line",
        autoSplit: true,
        onSplit: (self) => {
          const targets = mode === "chars" ? self.chars : mode === "words" ? self.words : self.lines;
          gsap.set(el, { autoAlpha: 1 });
          return gsap.fromTo(targets, from, {
            ...to,
            delay,
            stagger: each,
            scrollTrigger: trigger === "scroll" ? { trigger: el, start, once: true } : undefined,
            onComplete: () => {
              if (fired) return;
              fired = true;
              self.revert();
              onComplete?.();
            },
          });
        },
      });
      return () => splitter.revert();
    },
    { scope: ref, dependencies: [mode] }
  );

  return (
    <Tag ref={ref} data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}
