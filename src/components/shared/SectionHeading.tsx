import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";
import { revealVars } from "@/lib/motion";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { Kicker } from "@/components/shared/Kicker";

interface SectionHeadingProps {
  kicker?: string;
  /** String or markup — wrap emphasised words in <em> for the theme's italic accent. */
  title: ReactNode;
  lead?: string;
  align?: "center" | "left";
  size?: "md" | "lg";
  /** Optional folio ("01") shown before the kicker — editorial themes love it. */
  folio?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

/**
 * Standard section header: kicker (with theme ornament) / display title /
 * lead. Title uses the theme's text split; kicker and lead use its reveal.
 */
export function SectionHeading({
  kicker,
  title,
  lead,
  align = "center",
  size = "md",
  folio,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const motion = useThemeMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const items = el.querySelectorAll<HTMLElement>("[data-heading-part]");
      if (!items.length) return;
      const { from, to } = revealVars(motion, motion.reveal === "clip" ? "rise" : motion.reveal, "up", 24);
      gsap.fromTo(items, from, {
        ...to,
        stagger: motion.stagger.items,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-10 mb-12 max-w-2xl md:mb-16",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {(kicker || folio) && (
        <div data-reveal data-heading-part className={cn("mb-5 flex items-center gap-4", align === "center" && "justify-center")}>
          {folio && <span className="t-accent text-[0.7rem] text-fg-subtle">{folio}</span>}
          {kicker && <Kicker>{kicker}</Kicker>}
        </div>
      )}
      <AnimatedText as={Tag} className={cn("t-display text-fg", size === "lg" ? "text-display-lg" : "text-display-md")}>
        {title}
      </AnimatedText>
      {lead && (
        <p data-reveal data-heading-part className="mt-5 text-pretty text-base text-fg-muted md:mt-6 md:text-lg">
          {lead}
        </p>
      )}
    </div>
  );
}
