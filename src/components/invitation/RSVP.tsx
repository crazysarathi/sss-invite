import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";
import { burstConfetti } from "@/lib/confetti";
import { rsvp } from "@/data/siteData";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { Surface } from "@/components/shared/Surface";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { Flourish, Monogram } from "@/components/stationery/Ornaments";
import { RsvpPanel } from "./rsvp/RsvpPanel";

/**
 * "Save your spot" — the hosts' "collect database": an arch-topped paper
 * card with the monogram at its crown, then the form. A successful send
 * bursts confetti in the palette's colours. (The page never says "RSVP".)
 */
export function RSVP() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopConfetti = useRef<(() => void) | null>(null);

  const celebrate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    stopConfetti.current?.();
    stopConfetti.current = burstConfetti(canvas, 140, [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.surface,
    ]);
  }, [theme]);

  useEffect(() => () => stopConfetti.current?.(), []);

  return (
    <section id={rsvp.id} className="t-paper relative overflow-hidden bg-page">
      <Watercolor variant="b" opacity={0.85} />
      <CourtsideSketches density="light" />

      <div className="section-shell">
        <ScrollReveal className="mx-auto max-w-xl">
          <Surface className="relative rounded-t-[999px] px-5 pb-8 pt-12 sm:px-8 md:px-12 md:pb-12 md:pt-14">
            <div className="mx-auto mb-4 h-[5.5rem] w-[5.5rem] md:h-24 md:w-24">
              <Monogram className="h-full w-full" />
            </div>
            <div className="mx-auto mb-8 max-w-md text-center md:mb-10">
              <p className="t-accent text-kicker text-primary">{rsvp.kicker}</p>
              <AnimatedText as="h2" className="t-display mt-2 text-display-md text-fg">
                {rsvp.title}
              </AnimatedText>
              <Flourish className="mt-4" center="dot" />
              <p className="mt-4 text-balance text-[0.95rem] text-fg-muted md:text-base">{rsvp.lead}</p>
            </div>
            <RsvpPanel onSuccess={celebrate} />
          </Surface>
        </ScrollReveal>
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />
    </section>
  );
}
