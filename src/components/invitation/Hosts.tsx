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
 * Hosts — "Four partners. One morning." The four names presented like a
 * family card: small-caps intro, a script line, then a torn-paper ledger
 * with each host and what they bring. Names stagger in one by one.
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
            <p className="t-accent text-kicker text-fg-muted">{hosts.kicker}</p>
            <Flourish className="mt-4" center="dot" />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="mt-6">
            <p className="t-accent text-[1.05rem] tracking-[0.3em] text-fg md:text-[1.2rem]">{hosts.intro}</p>
          </ScrollReveal>
          <AnimatedText as="h2" split="words" className="t-script mt-1 text-[3rem] leading-none text-primary md:text-[3.8rem]">
            {hosts.script}
          </AnimatedText>

          <TornCard seed={3} className="mt-10 md:mt-12">
            <div data-ledger className="grid grid-cols-1 gap-x-6 gap-y-8 px-6 py-10 sm:grid-cols-2 md:px-12 md:py-12">
              {brand.partners.map((p, i) => (
                <div key={p.name} data-host className="relative text-center">
                  <span aria-hidden="true" className="t-accent mb-2 block text-[0.7rem] text-accent">
                    ✦
                  </span>
                  <p className="t-display text-[1.5rem] leading-tight text-fg md:text-[1.7rem]">{p.name}</p>
                  <p className="t-accent mt-1.5 text-[0.72rem] text-fg-muted md:text-[0.78rem]">{p.role}</p>
                  {i === 0 && (
                    <img
                      src={brand.hostCrest}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="mx-auto mt-3 h-10 w-10 rounded-md bg-surface object-contain p-0.5 shadow-card"
                    />
                  )}
                </div>
              ))}
            </div>
          </TornCard>

          <ScrollReveal delay={0.15} className="mt-8 md:mt-10">
            <p className="t-display text-balance text-[1.35rem] italic leading-snug text-fg-muted md:text-[1.5rem]">{hosts.line}</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
