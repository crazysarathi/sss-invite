import { useRef, type ReactNode } from "react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { brand, dateLine, details, event } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Surface } from "@/components/shared/Surface";
import { MatchaGlyph, MatGlyph, PaddleGlyph } from "@/components/shared/Glyphs";

/**
 * Details — where, when, what, and who's hosting. Three cards "serve" in
 * (rise + a little back-spin), the "what" glyphs swing / breathe / steam
 * on loop, and the partners line reveals name by name.
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
          { autoAlpha: 0, y: motion.distance * 1.6, rotation: (i) => (i % 2 ? 2.5 : -2.5), transformOrigin: "50% 100%" },
          {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            duration: motion.duration.base,
            ease: motion.easeSpring,
            stagger: motion.stagger.items * 1.4,
            clearProps: "transform",
            scrollTrigger: { trigger: root, start: "top 72%", once: true },
          }
        );
      }
      // the "what" glyphs: idle loops (paddle swings, mat breathes, matcha steams)
      const paddle = root.querySelector("[data-glyph=pickleball]");
      const mat = root.querySelector("[data-glyph=pilates]");
      const steam = gsap.utils.toArray<HTMLElement>("[data-steam]", root);
      if (paddle) gsap.to(paddle, { rotation: 14, transformOrigin: "50% 90%", duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });
      if (mat) gsap.to(mat, { scale: 1.08, transformOrigin: "50% 50%", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      if (steam.length) {
        steam.forEach((s, i) =>
          gsap.fromTo(
            s,
            { y: 4, opacity: 0 },
            { y: -7, opacity: 0.9, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.4 }
          )
        );
      }
    },
    { scope: ref }
  );

  return (
    <section id="details" ref={ref} className="relative overflow-hidden bg-page-alt">
      <div className="t-pattern" aria-hidden="true" />
      <div className="section-shell">
        <SectionHeading kicker={details.kicker} title={details.title} />

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          <DetailCard
            icon={<MapPin aria-hidden="true" className="h-5 w-5" />}
            label={details.location.label}
            title={event.venue.name}
            note={event.venue.city}
          >
            <a
              href={event.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="t-accent group/link mt-5 inline-flex items-center gap-1.5 text-[0.72rem] text-primary"
            >
              <span className="t-underline">{details.location.cta}</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-micro ease-theme group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
            </a>
          </DetailCard>

          <DetailCard
            icon={<CalendarDays aria-hidden="true" className="h-5 w-5" />}
            label={details.date.label}
            title={dateLine()}
            note={event.dateStatus === "tba" ? event.dateTbaNote : event.timeLabel}
            pulse={event.dateStatus === "tba"}
          />

          <Surface data-detail-card className="p-6 md:p-7">
            <p className="t-label mb-5">{details.what.label}</p>
            <ul className="space-y-4">
              {details.what.items.map((item) => (
                <li key={item.key} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <WhatGlyph kind={item.key} />
                  </span>
                  <span>
                    <span className="t-display block text-[1.25rem] leading-tight text-fg">{item.title}</span>
                    <span className="block text-sm text-fg-muted">{item.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>

        {/* hosted by */}
        <ScrollReveal className="mt-14 text-center md:mt-20" start="top 85%">
          <p className="t-label mb-4">{details.hostedBy}</p>
          <p className="t-display mx-auto max-w-3xl text-balance text-[clamp(1.15rem,2.4vw,1.75rem)] leading-snug text-fg">
            {brand.partners.map((p, i) => (
              <span key={p.name} className="inline-block whitespace-nowrap">
                {i > 0 && <em className="mx-2.5 text-primary md:mx-4">×</em>}
                {p.name}
              </span>
            ))}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

interface DetailCardProps {
  icon: ReactNode;
  label: string;
  title: string;
  note?: string;
  /** A small live dot beside the label (used for "Date coming soon"). */
  pulse?: boolean;
  children?: ReactNode;
}

function DetailCard({ icon, label, title, note, pulse, children }: DetailCardProps) {
  return (
    <Surface data-detail-card hover className="flex flex-col p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between">
        <p className="t-label inline-flex items-center gap-2">
          {label}
          {pulse && <span aria-hidden="true" className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />}
        </p>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
      </div>
      <p className="t-display text-[clamp(1.35rem,2.2vw,1.75rem)] leading-tight text-fg">{title}</p>
      {note && <p className="mt-1.5 text-sm text-fg-muted">{note}</p>}
      {children}
    </Surface>
  );
}

function WhatGlyph({ kind }: { kind: (typeof details.what.items)[number]["key"] }) {
  const cls = "h-5 w-5";
  if (kind === "pickleball") return <PaddleGlyph data-glyph="pickleball" className={cls} />;
  if (kind === "pilates") return <MatGlyph data-glyph="pilates" className={cls} />;
  return (
    <span className="relative inline-block">
      <MatchaGlyph data-glyph="matcha" className={cls} />
      {/* steam wisps */}
      <span aria-hidden="true" className="pointer-events-none absolute -top-2 left-1 flex gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span key={i} data-steam className={cn("block h-2 w-px rounded-full bg-current opacity-0", i === 1 && "h-2.5")} />
        ))}
      </span>
    </span>
  );
}
