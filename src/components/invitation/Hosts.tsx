import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { brand, hosts } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { Flourish, TornCard } from "@/components/stationery/Ornaments";

/**
 * Hosts — "Four partners. One experience." The four names presented like a
 * family card: a torn-paper ledger with each host and what they bring.
 * Names stagger in one by one.
 */
export function Hosts() {
  const ref = useRef<HTMLElement>(null);
  const motion = useThemeMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-host]", root);
      if (!cells.length) return;
      gsap.fromTo(
        cells,
        { autoAlpha: 0, y: motion.distance * 0.8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.base,
          ease: motion.ease,
          stagger: motion.stagger.items * 1.6,
          clearProps: "transform",
          scrollTrigger: { trigger: root.querySelector("[data-ledger]"), start: "top 78%", once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <section id="hosts" ref={ref} className="t-paper relative overflow-hidden bg-page-alt">
      <Watercolor variant="b" opacity={0.85} />
      <CourtsideSketches flip density="light" />

      <div className="section-shell">
        <div className="mx-auto max-w-[40rem] text-center">
          <ScrollReveal>
            <AnimatedText as="h2" className="t-accent text-kicker text-fg-muted">
              {hosts.kicker}
            </AnimatedText>
            <Flourish className="mt-4" center="dot" />
          </ScrollReveal>

          <TornCard seed={3} className="mt-8 md:mt-12">
            <div data-ledger className="grid grid-cols-1 gap-x-6 gap-y-7 px-4 py-8 sm:grid-cols-2 sm:px-6 sm:py-10 md:px-12 md:py-12">
              {brand.partners.map((p, i) => (
                <div key={p.name} data-host className="relative text-center">
                  <span aria-hidden="true" className="t-accent mb-2 block text-[0.7rem] text-accent">
                    ✦
                  </span>
                  <p className="t-display text-[1.3rem] leading-tight text-fg sm:text-[1.5rem] md:text-[1.7rem]">{p.name}</p>
                  <p className="t-accent mt-1.5 text-[0.66rem] text-fg-muted sm:text-[0.72rem] md:text-[0.78rem]">{p.role}</p>
                  {i === 0 && (
                    <img
                      src={brand.hostCrest}
                      alt=""
                      width={40}
                      height={46}
                      loading="lazy"
                      decoding="async"
                      className="mx-auto mt-3 h-10 w-10 object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </TornCard>

          <ScrollReveal delay={0.15} className="mt-8 md:mt-10">
            <p className="t-display text-balance text-[1.1rem] italic leading-snug text-fg-muted sm:text-[1.35rem] md:text-[1.5rem]">{hosts.line}</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
