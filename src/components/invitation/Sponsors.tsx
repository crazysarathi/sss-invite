import { useCallback, useEffect, useRef, useState } from "react";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { sponsors, sponsorsSection } from "@/data/siteData";
import { useInViewport } from "@/hooks/useInViewport";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Kicker } from "@/components/shared/Kicker";
import { Flourish } from "@/components/stationery/Ornaments";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";

const AUTOPLAY_MS = 3500;

/**
 * "Our partners" — a testimonial-style slider right before "Save your
 * spot": each logo held in a round paper medallion (lavender half-ring over
 * the top, lavender title segment across the bottom), the medallions strung
 * on a hairline vine that curves through a small chartreuse bud at each
 * joint (the client's reference). One per view on phones, two from sm, three from md,
 * four from xl — CSS decides, no JS re-measuring. Native scroll-snap
 * carries the swipe; below it, phones get a prev/next pair with a "4 / 16"
 * count (one-per-page means a dozen-plus dots, which wrapped into two
 * untidy rows) and wider screens get the dots; it also autoplays, pausing
 * on hover/touch and while off-screen. A sponsor without a logo file yet
 * falls back to its name.
 */
export function Sponsors() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [paused, setPaused] = useState(false);
  const inView = useInViewport(sectionRef, "0px");

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const count = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPageCount(count);
    setActivePage(
      Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth)),
    );
  }, []);

  useEffect(() => {
    updateState();
    const el = trackRef.current;
    // ResizeObserver, not just a window resize listener — logos load async
    // and the card's own width can settle after paint, both of which change
    // how many sponsors fit per page.
    const ro = new ResizeObserver(updateState);
    if (el) ro.observe(el);
    window.addEventListener("resize", updateState);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateState);
    };
  }, [updateState]);

  const goToPage = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  // Autoplay: advance one page every few seconds, wrapping to the start.
  // Holds while hovered/touched, while off-screen, and under reduced motion.
  // activePage is a dep on purpose — any manual page change resets the timer.
  useEffect(() => {
    if (paused || !inView || pageCount <= 1 || prefersReducedMotion()) return;
    const t = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % pageCount;
      el.scrollTo({
        left: next * el.clientWidth,
        behavior: next === 0 ? "auto" : "smooth",
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [paused, inView, pageCount, activePage]);

  return (
    <section
      ref={sectionRef}
      id={sponsorsSection.id}
      className="t-paper relative overflow-hidden bg-page"
    >
      <Watercolor variant="b" opacity={0.8} />
      <CourtsideSketches density="light" />

      <div className="section-shell">
        <div className="mx-auto max-w-[40rem] text-center">
          <ScrollReveal>
            <Kicker className="justify-center">{sponsorsSection.kicker}</Kicker>
            <Flourish className="mt-4" center="dot" />
          </ScrollReveal>
        </div>

        <ScrollReveal className="relative mt-10 md:mt-12" delay={0.1}>
          <div
            ref={trackRef}
            onScroll={updateState}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
            role="region"
            aria-label="Sponsor logos"
            tabIndex={0}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sponsors.map((sponsor, i) => (
              <div
                key={sponsor.name}
                className="relative flex shrink-0 grow-0 basis-full snap-start items-center justify-center px-4 py-4 sm:basis-1/2 md:basis-1/3 xl:basis-1/4"
              >
                {/* the vine — drawn BEHIND the medallions, per the client's
                    reference: from the bud at each joint, TWO hairlines fan
                    out (a pointed lens tip) and run into the neighbouring
                    circle a little above and below its middle, with a small
                    bud where each meets the circle's rim. Percentage units
                    stretched to the slide, non-scaling stroke so the lines
                    stay hairlines at every size. */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                >
                  <g
                    fill="none"
                    stroke="rgb(var(--c-accent) / 0.7)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  >
                    <path d="M0 50 C5 50 7 40 13 40 L50 40" vectorEffect="non-scaling-stroke" />
                    <path d="M0 50 C5 50 7 60 13 60 L50 60" vectorEffect="non-scaling-stroke" />
                    <path d="M50 40 L87 40 C93 40 95 50 100 50" vectorEffect="non-scaling-stroke" />
                    <path d="M50 60 L87 60 C93 60 95 50 100 50" vectorEffect="non-scaling-stroke" />
                  </g>
                </svg>
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                  />
                )}

                {/* the medallion — the client's pick from six mock-ups
                    (2026-08-25): a paper disc with a lavender half-ring
                    arcing over its top from rim-dot to rim-dot (the dots
                    double as the points where the vine meets the disc), the
                    logo in the upper disc, and a solid lavender segment
                    across the bottom carrying the "Official … Partner" title
                    in white bold caps. Big on phones (the hosts found the
                    first cut hard to read); wider screens fit 2–4 per row. */}
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_2px_rgb(var(--c-surface))]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-1/2 z-20 h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_2px_rgb(var(--c-surface))]"
                  />
                  {/* the half-ring: a hairline arc a few px outside the disc,
                      from the left dot over the top to the right dot */}
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 100 100"
                    className="pointer-events-none absolute -inset-1.5 z-10 h-[calc(100%+0.75rem)] w-[calc(100%+0.75rem)]"
                  >
                    <path
                      d="M1 50 A49 49 0 0 1 99 50"
                      fill="none"
                      stroke="rgb(var(--c-primary))"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <div className="group relative h-64 w-64 overflow-hidden rounded-full bg-surface shadow-[var(--shadow-card),inset_0_3px_12px_rgb(var(--c-overlay)/0.08)] sm:h-52 sm:w-52 lg:h-60 lg:w-60">
                    {/* the logo — the upper 70% of the disc, padded in from
                        the curve so wide marks don't touch the rim */}
                    <div className="absolute inset-x-0 top-0 flex h-[70%] items-center justify-center px-[15%] pb-[3%] pt-[12%]">
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          loading="lazy"
                          decoding="async"
                          onLoad={updateState}
                          className={cn(
                            "transition-transform duration-300 ease-out group-hover:scale-[1.06]",
                            sponsor.fill
                              ? // full-bleed art: the medallion IS the logo's background
                                "absolute inset-0 h-full w-full object-cover"
                              : "max-h-full max-w-full object-contain",
                          )}
                          style={
                            // per-logo shrink (siteData `scale`) — sizes the box
                            // rather than transforming, so hover scale still works
                            sponsor.scale && !sponsor.fill
                              ? { maxWidth: `${sponsor.scale * 100}%`, maxHeight: `${sponsor.scale * 100}%` }
                              : undefined
                          }
                        />
                      ) : (
                        <p className="t-accent text-center text-[0.78rem] leading-snug text-fg-muted">
                          {sponsor.name}
                        </p>
                      )}
                    </div>
                    {/* the title segment — a lavender band across the lower
                        30%, clipped into a chord by the disc's rounded
                        overflow. Side padding keeps a two-line title inside
                        the narrowing curve; a touch more padding below than
                        above lifts the text to where the chord is widest. */}
                    <div className="absolute inset-x-0 bottom-0 z-10 flex h-[30%] items-center justify-center bg-primary px-[16%] pb-[3%]">
                      <p className="font-body text-center text-[0.66rem] font-bold uppercase leading-snug tracking-[0.08em] text-page sm:text-[0.56rem] lg:text-[0.62rem]">
                        {sponsor.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-5 sm:hidden">
              <PagerArrow
                dir="prev"
                label="Previous sponsor"
                onClick={() =>
                  goToPage((activePage - 1 + pageCount) % pageCount)
                }
              />
              <p
                aria-live="polite"
                className="t-accent min-w-[4.5rem] text-center text-[0.8rem] tabular-nums text-fg-muted"
              >
                {activePage + 1} / {pageCount}
              </p>
              <PagerArrow
                dir="next"
                label="Next sponsor"
                onClick={() => goToPage((activePage + 1) % pageCount)}
              />
            </div>
          )}

          {pageCount > 1 && (
            <div
              role="group"
              aria-label="Sponsor pages"
              className="mt-7 hidden items-center justify-center gap-2 sm:flex"
            >
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-current={i === activePage ? "true" : undefined}
                  aria-label={`Sponsors, page ${i + 1} of ${pageCount}`}
                  onClick={() => goToPage(i)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block rounded-full transition-[width,background-color] duration-300 ease-out",
                      i === activePage
                        ? "h-2.5 w-7 bg-primary shadow-[0_1px_4px_rgb(var(--c-primary)/0.5)]"
                        : "h-2.5 w-2.5 bg-primary/30 hover:bg-primary/60",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The phone pager's round arrow — same paper-medallion dressing as the */
/* logos above, so the controls belong to the slider.                  */
/* ------------------------------------------------------------------ */
function PagerArrow({
  dir,
  label,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full border border-accent/60 bg-surface text-primary shadow-card transition-transform duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-5 w-5", dir === "prev" && "-scale-x-100")}
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
