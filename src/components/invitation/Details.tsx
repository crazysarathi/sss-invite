import { useRef, type ReactNode } from "react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { dateLine, details, event } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { MatchaGlyph, MatGlyph, PaddleGlyph } from "@/components/shared/Glyphs";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { Flourish, TornCard } from "@/components/stationery/Ornaments";

/**
 * Details — where, when, what — three pieces of torn paper on a
 * watercolour wash. The cards "serve" in (rise + a little back-spin); the
 * "what" glyphs swing / breathe / steam on loop.
 */
export function Details() {
  const ref = useRef<HTMLElement>(null);
  const motion = useThemeMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-detail-card]", root);
      if (cards.length) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: motion.distance * 1.6, rotation: (i) => (i % 2 ? 2 : -2), transformOrigin: "50% 100%" },
          {
            autoAlpha: 1,
            y: 0,
            rotation: (i) => (i === 1 ? 0 : i === 0 ? -1 : 1),
            duration: motion.duration.base,
            ease: motion.easeSpring,
            stagger: motion.stagger.items * 1.4,
            scrollTrigger: { trigger: root, start: "top 70%", once: true },
          }
        );
      }
      const paddle = root.querySelector("[data-glyph=pickleball]");
      const mat = root.querySelector("[data-glyph=pilates]");
      const steam = gsap.utils.toArray<HTMLElement>("[data-steam]", root);
      if (paddle) gsap.to(paddle, { rotation: 14, transformOrigin: "50% 90%", duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });
      if (mat) gsap.to(mat, { scale: 1.08, transformOrigin: "50% 50%", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      steam.forEach((s, i) =>
        gsap.fromTo(s, { y: 4, opacity: 0 }, { y: -7, opacity: 0.9, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.4 })
      );
    },
    { scope: ref }
  );

  return (
    <section id="details" ref={ref} className="t-paper relative overflow-hidden bg-page">
      <Watercolor variant="c" opacity={0.85} />
      <CourtsideSketches density="light" />

      <div className="section-shell">
        <div className="mx-auto mb-12 max-w-xl text-center md:mb-16">
          <ScrollReveal>
            <p className="t-accent text-kicker text-primary">{details.kicker}</p>
          </ScrollReveal>
          <AnimatedText as="h2" className="t-display mt-3 text-display-md text-fg">
            {details.title}
          </AnimatedText>
          <ScrollReveal delay={0.1}>
            <Flourish className="mt-5" />
          </ScrollReveal>
        </div>

        <div className="grid gap-7 md:grid-cols-3 md:gap-6">
          <DetailCard seed={4} icon={<MapPin aria-hidden="true" className="h-5 w-5" />} label={details.location.label}>
            <p className="t-display text-[1.4rem] leading-tight text-fg md:text-[1.7rem]">{event.venue.name}</p>
            <p className="t-accent mt-1.5 text-[0.7rem] text-fg-muted md:text-[0.76rem]">{event.venue.city}</p>
            <a
              href={event.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="t-accent group/link mt-5 inline-flex items-center gap-1.5 text-[0.76rem] text-primary"
            >
              <span className="t-underline">{details.location.cta}</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-micro ease-theme group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
            </a>
          </DetailCard>

          <DetailCard seed={8} icon={<CalendarDays aria-hidden="true" className="h-5 w-5" />} label={details.date.label} pulse={event.dateStatus === "tba"}>
            <p className="t-display text-[1.4rem] leading-tight text-fg md:text-[1.7rem]">{dateLine()}</p>
            {(event.dateStatus === "tba" ? event.dateTbaNote : event.timeLabel) && (
              <p className="mt-2 text-balance text-sm text-fg-muted">
                {event.dateStatus === "tba" ? event.dateTbaNote : event.timeLabel}
              </p>
            )}
          </DetailCard>

          <DetailCard seed={12} label={details.what.label}>
            <ul className="space-y-3.5 text-left">
              {details.what.items.map((item) => (
                <li key={item.key} className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/60 text-primary">
                    <WhatGlyph kind={item.key} />
                  </span>
                  <span>
                    <span className="t-display block text-[1.1rem] leading-tight text-fg md:text-[1.25rem]">{item.title}</span>
                    <span className="t-accent block text-[0.64rem] text-fg-muted md:text-[0.68rem]">{item.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </DetailCard>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

interface DetailCardProps {
  icon?: ReactNode;
  label: string;
  seed: number;
  /** A small live dot beside the label (used for "Date coming soon"). */
  pulse?: boolean;
  children: ReactNode;
}

function DetailCard({ icon, label, seed, pulse, children }: DetailCardProps) {
  return (
    <TornCard seed={seed} className={cn("opacity-0", prefersReducedMotion() && "opacity-100")} data-detail-card>
      <div className="flex flex-col items-center px-5 py-8 text-center md:px-7 md:py-10">
        {icon && <span className="mb-4 grid h-11 w-11 place-items-center rounded-full border border-accent/60 text-primary">{icon}</span>}
        <p className="t-accent mb-3 inline-flex items-center gap-2 text-[0.74rem] text-fg-muted">
          {label}
          {pulse && <span aria-hidden="true" className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />}
        </p>
        {children}
      </div>
    </TornCard>
  );
}

function WhatGlyph({ kind }: { kind: (typeof details.what.items)[number]["key"] }) {
  const cls = "h-5 w-5";
  if (kind === "pickleball") return <PaddleGlyph data-glyph="pickleball" className={cls} />;
  if (kind === "pilates") return <MatGlyph data-glyph="pilates" className={cls} />;
  return (
    <span className="relative inline-block">
      <MatchaGlyph data-glyph="matcha" className={cls} />
      <span aria-hidden="true" className="pointer-events-none absolute -top-2 left-1 flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span key={i} data-steam className={cn("block h-2 w-px rounded-full bg-current opacity-0", i === 1 && "h-2.5")} />
        ))}
      </span>
    </span>
  );
}
