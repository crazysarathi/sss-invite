import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";
import { burstConfetti } from "@/lib/confetti";
import { rsvp } from "@/data/siteData";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Surface } from "@/components/shared/Surface";
import { PickleballSvg } from "@/components/sport/PickleballSvg";
import { RsvpPanel } from "./rsvp/RsvpPanel";

/**
 * "Save your spot" — the hosts' "collect database": heading, one card with
 * the form. A successful send bursts confetti in the palette's colours.
 * (The page never says "RSVP" — the hosts' content doesn't.)
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
    <section id={rsvp.id} className="relative overflow-hidden bg-page-alt">
      <div className="t-pattern" aria-hidden="true" />
      {/* a couple of resting balls in the corners */}
      <PickleballSvg aria-hidden="true" className="pointer-events-none absolute -left-10 top-16 h-32 w-32 opacity-40 md:h-44 md:w-44" />
      <PickleballSvg aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 opacity-40 md:h-56 md:w-56" />

      <div className="section-shell">
        <SectionHeading kicker={rsvp.kicker} title={rsvp.title} lead={rsvp.lead} />
        <ScrollReveal className="mx-auto max-w-xl">
          <Surface className="p-6 sm:p-10">
            <RsvpPanel onSuccess={celebrate} />
          </Surface>
        </ScrollReveal>
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />
    </section>
  );
}
