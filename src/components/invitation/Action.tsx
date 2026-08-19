import { useRef } from "react";
import { ArrowUpRight, Instagram } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { action, brand } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Ticker } from "@/components/shared/Ticker";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Rally } from "@/components/sport/Rally";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CornerBotanicals } from "@/components/stationery/Botanicals";
import { Flourish } from "@/components/stationery/Ornaments";

/**
 * "See our Smashers in action" — the hosts' line, set big, beside the
 * never-ending rally mounted like a photograph in a storyboard: a paper
 * print, taped at two corners, slightly tilted, with a script caption.
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
          { autoAlpha: 0, y: motion.distance, rotation: -4 },
          {
            autoAlpha: 1,
            y: 0,
            rotation: -1.5,
            duration: motion.duration.slow,
            ease: motion.easeSpring,
            scrollTrigger: { trigger: stage, start: "top 80%", once: true },
          }
        );
      }
      const crest = root.querySelector("[data-crest]");
      if (crest) gsap.to(crest, { y: -6, rotation: 3, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: ref }
  );

  return (
    <section id="action" ref={ref} className="t-paper relative overflow-hidden bg-page-alt">
      <Watercolor variant="a" opacity={0.8} />
      <CornerBotanicals corner="bl" style="fill" />
      <div className="relative border-y border-accent/40 bg-surface/40 py-2.5">
        <Ticker text={action.ticker} speed={42} textClassName="text-[0.7rem] text-fg-muted md:text-[0.74rem]" />
      </div>

      <div className="section-shell">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14 [&>*]:min-w-0">
          <div className="text-center lg:col-span-5 lg:text-left">
            <ScrollReveal className="mb-5 flex items-center justify-center gap-4 lg:justify-start">
              <img
                data-crest
                src={brand.hostCrest}
                alt=""
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-md bg-surface object-contain p-1 shadow-card md:h-14 md:w-14"
              />
              <p className="t-accent text-kicker text-primary">{action.kicker}</p>
            </ScrollReveal>
            <AnimatedText as="h2" className="t-display text-display-lg text-fg">
              {action.title}
            </AnimatedText>
            <ScrollReveal delay={0.1}>
              <Flourish className="mx-0 mt-5 max-lg:mx-auto" />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="mx-auto mt-5 max-w-md text-pretty text-base text-fg-muted md:mt-6 md:text-lg lg:mx-0">{action.body}</p>
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

          {/* the storyboard print */}
          <div data-rally className="opacity-0 lg:col-span-7">
            <div className="relative mx-auto max-w-2xl">
              <div className="t-surface relative px-4 pb-14 pt-4 !rounded-[3px] md:px-6 md:pb-16 md:pt-6">
                <div className="relative overflow-hidden rounded-[2px] border border-line bg-page-alt/60 p-3 md:p-5">
                  <div className="t-pattern" aria-hidden="true" />
                  <Rally className="relative" />
                </div>
                <p className="t-script pointer-events-none absolute inset-x-0 bottom-4 text-center text-[1.6rem] leading-none text-fg-muted md:bottom-5 md:text-[1.9rem]">
                  {action.caption}
                </p>
                {/* tape */}
                <span aria-hidden="true" className="absolute -left-4 -top-3 h-7 w-24 -rotate-[28deg] bg-accent/35 shadow-sm backdrop-blur-[1px]" />
                <span aria-hidden="true" className="absolute -right-4 -top-3 h-7 w-24 rotate-[28deg] bg-accent/35 shadow-sm backdrop-blur-[1px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
