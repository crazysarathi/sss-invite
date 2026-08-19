import { useRef } from "react";
import { ArrowUpRight, Instagram } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { action, brand } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Kicker } from "@/components/shared/Kicker";
import { Ticker } from "@/components/shared/Ticker";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Rally } from "@/components/sport/Rally";

/**
 * "See our Smashers in action" — the hosts' line, set big, beside a
 * never-ending rally. A marquee runs along the top; the host crest floats.
 */
export function Action() {
  const ref = useRef<HTMLElement>(null);
  const motion = useThemeMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const stage = root.querySelector("[data-rally]");
      if (stage) {
        gsap.fromTo(
          stage,
          { autoAlpha: 0, y: motion.distance, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: motion.duration.slow,
            ease: motion.ease,
            clearProps: "transform",
            scrollTrigger: { trigger: stage, start: "top 80%", once: true },
          }
        );
      }
      const crest = root.querySelector("[data-crest]");
      if (crest) gsap.to(crest, { y: -8, rotation: 3, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: ref }
  );

  return (
    <section id="action" ref={ref} className="relative overflow-hidden bg-page">
      <div className="border-y border-line/70 py-3">
        <Ticker text={action.ticker} speed={38} textClassName="text-[0.7rem] text-fg-muted md:text-xs" />
      </div>

      <div className="section-shell">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <ScrollReveal className="mb-5 flex items-center gap-4">
              <img
                data-crest
                src={brand.hostCrest}
                alt=""
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-xl bg-surface object-contain p-1 shadow-card md:h-14 md:w-14"
              />
              <Kicker ornament="none">{action.kicker}</Kicker>
            </ScrollReveal>
            <AnimatedText as="h2" className="t-display text-display-lg text-fg">
              {action.title}
            </AnimatedText>
            <ScrollReveal delay={0.15}>
              <p className="mt-5 max-w-md text-pretty text-base text-fg-muted md:mt-6 md:text-lg">{action.body}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.25} className="mt-8">
              <MagneticButton>
                <Button asChild size="lg" variant="outline">
                  <a href={action.cta.href} target="_blank" rel="noopener noreferrer">
                    <Instagram aria-hidden="true" />
                    {action.cta.label}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              </MagneticButton>
            </ScrollReveal>
          </div>

          <div data-rally className="lg:col-span-7">
            <div className="relative rounded-card border border-line bg-surface/70 p-4 shadow-card md:p-8">
              <div className="t-pattern rounded-card" aria-hidden="true" />
              <Rally className="relative" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
