import { lazy, Suspense, useRef } from "react";
import { Instagram } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { sound } from "@/lib/audio";
import { brand, dateLine, event, hero, opening, social } from "@/data/siteData";
import { useTheme, useThemeMotion } from "@/components/theme/ThemeProvider";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useInViewport } from "@/hooks/useInViewport";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { LazyBoundary } from "@/components/shared/LazyBoundary";
import { Surface } from "@/components/shared/Surface";
import { Court } from "@/components/sport/Court";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { PickleballSvg } from "@/components/sport/PickleballSvg";
import { Watercolor } from "@/components/stationery/Watercolor";
import { Flourish, Frame, Monogram } from "@/components/stationery/Ornaments";

const BallCanvas = lazy(() => import("@/components/three/BallCanvas"));

interface HeroProps {
  /** The opening has started its exit — play the entrance (overlapping it). */
  booted: boolean;
}

/**
 * Hero — the invitation card itself, centred on a watercolour backdrop.
 *
 *   ENTRANCE  the card settles in (under the opening doors' reveal),
 *             the court lines draw themselves behind it, a 3D pickleball
 *             drops and bounces to rest on the card's corner (its shadow
 *             breathing with the bounce), the title springs up letter by
 *             letter, then monogram, script line, partners, date and CTAs
 *             rise in.
 *   SCROLL    the ball rolls off and sinks, the court drifts, the card lifts.
 * Reduced motion → everything simply visible, no 3D.
 */
export function Hero({ booted }: HeroProps) {
  const { theme } = useTheme();
  const motion = useThemeMotion();
  const ref = useRef<HTMLElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const ballInView = useInViewport(ballRef, "0px");
  // The SVG ball stands in until the main thread is idle — see useIdleReady.
  const enhanced = useIdleReady();
  const [a, amp, b] = brand.nameParts;
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !booted) return;
      const q = gsap.utils.selector(root);
      const card = root.querySelector<HTMLElement>("[data-hero-card]");
      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const ball = root.querySelector<HTMLElement>("[data-hero-ball]");
      const shadow = root.querySelector<HTMLElement>("[data-hero-shadow]");
      const court = root.querySelector<HTMLElement>("[data-hero-court]");
      const lines = q("[data-court-line]");
      const reveals = q("[data-reveal]");

      if (prefersReducedMotion()) {
        gsap.set([card, title, ball, shadow, court, ...reveals], { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      const base = motion.duration.base;
      const tl = gsap.timeline({ defaults: { ease: motion.ease } });

      /* 0. the card settles */
      if (card) tl.fromTo(card, { autoAlpha: 0, y: 36, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: base, ease: "power3.out" }, 0);

      /* 1. court draws itself */
      if (court) gsap.set(court, { autoAlpha: 1 });
      if (lines.length) {
        tl.fromTo(lines, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: base * 1.2, stagger: 0.05, ease: "power2.inOut" }, 0.1);
      }
      const surface = root.querySelector("[data-court-surface]");
      if (surface) tl.fromTo(surface, { opacity: 0 }, { opacity: 1, duration: base, ease: "power1.out" }, 0.3);

      /* 2. the ball drops and bounces to rest on the card corner */
      if (ball && shadow) {
        gsap.set(ball, { autoAlpha: 1 });
        const t0 = 0.45;
        tl.fromTo(ball, { yPercent: -420 }, { yPercent: 0, duration: base * 1.5, ease: "bounce.out" }, t0)
          .fromTo(
            shadow,
            { autoAlpha: 0, scale: 0.25 },
            { autoAlpha: 1, scale: 1, duration: base * 1.5, ease: "bounce.out", transformOrigin: "50% 50%" },
            t0
          )
          .to(ball, { scaleY: 0.84, scaleX: 1.1, duration: 0.08, ease: "power2.in", transformOrigin: "50% 100%" }, t0 + base * 1.5 * 0.36)
          .to(ball, { scaleY: 1, scaleX: 1, duration: 0.32, ease: "elastic.out(1, 0.45)" }, t0 + base * 1.5 * 0.36 + 0.08);

        /* bounce.out touches the floor at p = 1/2.75, 2/2.75, 2.5/2.75 and 1
           of the drop — a "pock" per impact, each softer as the ball settles. */
        const drop = base * 1.5;
        [
          { p: 1 / 2.75, s: 1 },
          { p: 2 / 2.75, s: 0.5 },
          { p: 2.5 / 2.75, s: 0.28 },
          { p: 1, s: 0.16 },
        ].forEach(({ p, s }) => tl.call(() => sound.floorBounce(s), [], t0 + drop * p));
      }

      /* 3. the title springs up, character by character */
      if (title) {
        gsap.set(title, { autoAlpha: 1 });
        const split = new SplitText(title, { type: "chars,words", mask: "chars" });
        tl.from(
          split.chars,
          {
            yPercent: 115,
            rotateX: -40,
            transformOrigin: "50% 100%",
            transformPerspective: 600,
            duration: base,
            ease: "back.out(1.4)",
            stagger: { each: motion.stagger.chars, from: "start" },
            onComplete: () => split.revert(),
          },
          0.55
        );
      }

      /* 4. everything else rises in */
      if (reveals.length) {
        tl.fromTo(
          reveals,
          { autoAlpha: 0, y: motion.distance * 0.7 },
          { autoAlpha: 1, y: 0, duration: base, stagger: motion.stagger.items * 0.8, clearProps: "transform" },
          0.8
        );
      }

      /* SCROLL — scrubbed across the hero. The scrub tweens target wrapper
         elements the entrance never animates: a scrubbed tween captures its
         start values whenever it first renders, so sharing an element with
         the entrance would freeze a mid-entrance opacity and restore it
         (card invisible) every time the user scrolls back to the top. */
      const scrub = { trigger: root, start: "top top", end: "bottom top", scrub: motion.scrub };
      const ballWrap = root.querySelector<HTMLElement>("[data-hero-ball-wrap]");
      const cardLift = root.querySelector<HTMLElement>("[data-hero-card-lift]");
      if (ballWrap) {
        gsap.to(ballWrap, { x: "26vw", y: "40vh", ease: "none", scrollTrigger: scrub });
        gsap.to(ballWrap, { autoAlpha: 0, ease: "none", scrollTrigger: { ...scrub, start: "40% top", end: "80% top" } });
      }
      if (ball) gsap.to(ball, { rotation: 160, ease: "none", scrollTrigger: scrub });
      if (court) gsap.to(court, { yPercent: 12 * motion.parallax * 2, ease: "none", scrollTrigger: scrub });
      gsap.matchMedia().add("(min-width: 768px)", () => {
        if (cardLift) gsap.to(cardLift, { yPercent: -14, autoAlpha: 0.15, ease: "none", scrollTrigger: { ...scrub, end: "80% top" } });
      });
    },
    { scope: ref, dependencies: [booted] }
  );

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <section id="hero" ref={ref} className="t-paper relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-page">
      <Watercolor variant="a" opacity={0.9} eager />
      {/* court backdrop */}
      <div
        data-hero-court
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-x-0 bottom-0 top-[22%] opacity-0 will-change-transform", reduced && "opacity-100")}
      >
        <Court className="opacity-50 md:opacity-70" />
      </div>
      <CourtsideSketches />

      <div className="section-shell-x relative z-10 flex flex-1 flex-col items-center justify-center pb-14 pt-[calc(var(--nav-height)+1rem)] md:pb-16 md:pt-[calc(var(--nav-height)+0.5rem)]">
        {/* data-hero-card-lift: scroll-scrub target — never touched by the entrance */}
        <div data-hero-card-lift className="w-full max-w-[34rem] md:max-w-[40rem]">
        <div data-hero-card className={cn("relative w-full opacity-0", reduced && "opacity-100")}>
          {/* the ball — resting on the card's top-right corner */}
          <div
            data-hero-ball-wrap
            className="absolute -right-2 -top-5 z-20 h-[4.75rem] w-[4.75rem] sm:-right-8 sm:-top-12 sm:h-28 sm:w-28 md:-right-14 md:-top-16 md:h-36 md:w-36"
          >
            <span
              data-hero-shadow
              aria-hidden="true"
              className={cn("absolute -bottom-1.5 left-[14%] right-[14%] h-[16%] rounded-full bg-overlay/35 opacity-0 [filter:blur(5px)]", reduced && "opacity-100")}
            />
            <div
              ref={ballRef}
              data-hero-ball
              className={cn("absolute inset-0 opacity-0 [filter:drop-shadow(0_16px_16px_rgb(var(--c-overlay)/0.22))]", reduced && "opacity-100")}
            >
              {reduced || !enhanced ? (
                <PickleballSvg className="h-full w-full" />
              ) : (
                <LazyBoundary fallback={<PickleballSvg className="h-full w-full" />}>
                  <Suspense fallback={<PickleballSvg className="h-full w-full" />}>
                    <BallCanvas palette={theme.three.palette} spin={0.35} float={0.1} active={ballInView} radius={1.08} />
                  </Suspense>
                </LazyBoundary>
              )}
            </div>
          </div>

          <Surface className="px-4 py-7 sm:px-8 sm:py-8 md:px-12 md:py-9">
            <Frame className="px-2.5 py-6 text-center sm:px-6 sm:py-7 md:px-8">
              <div data-reveal className="mx-auto mb-2.5 h-[4.25rem] w-[4.25rem] sm:h-[5.25rem] sm:w-[5.25rem] md:mb-4 md:h-24 md:w-24">
                <Monogram className="h-full w-full" />
              </div>

              <p data-reveal className="t-accent text-[0.72rem] text-fg-muted sm:text-[0.78rem] md:text-[0.84rem]">
                {opening.eyebrow}
              </p>
              <p data-reveal className="t-accent mt-3 text-kicker text-primary md:mt-4">
                {hero.eyebrow}
              </p>

              <h1
                data-hero-title
                className="t-display mt-2 text-[clamp(2.05rem,9vw,3.4rem)] text-fg opacity-0 md:mt-2 md:text-[clamp(3rem,5vw,4rem)]"
              >
                {a} <em className="text-primary">{amp}</em> {b}
              </h1>
              <p data-reveal className="t-script mt-1.5 text-[1.65rem] leading-none text-primary sm:mt-2 sm:text-[2.1rem] md:mt-3 md:text-[2.6rem]">
                {brand.subline}
              </p>

              <div data-reveal className="mt-4 md:mt-4">
                <Flourish />
              </div>

              <p data-reveal className="t-accent mt-4 text-[0.76rem] tracking-[0.24em] text-fg sm:text-[0.84rem] sm:tracking-[0.3em] md:text-[0.92rem]">
                {brand.tagline}
              </p>

              <p data-reveal className="mt-4 text-balance leading-relaxed md:mt-4">
                {brand.partners.map((p, i) => (
                  <span key={p.name} className="inline-block whitespace-nowrap">
                    {i > 0 && <span className="mx-1.5 text-primary sm:mx-2">×</span>}
                    <span className="t-display text-[1rem] text-fg sm:text-[1.15rem] md:text-[1.25rem]">{p.name}</span>
                  </span>
                ))}
              </p>

              <div data-reveal className="mt-4 md:mt-4">
                <Flourish center="dot" className="w-28" />
              </div>

              <p data-reveal className="t-accent mt-4 text-[0.72rem] text-fg-muted sm:text-[0.78rem] md:text-[0.82rem]">
                {hero.saveTheDate}
              </p>
              <p data-reveal className="t-display mt-0.5 text-[1.4rem] leading-tight text-fg sm:text-[1.7rem] md:text-[1.9rem]">
                {dateLine()}
              </p>
              <p data-reveal className="t-accent mt-1.5 text-[0.74rem] text-fg sm:text-[0.8rem] md:text-[0.86rem]">
                {hero.venueLabel}: {event.venue.name} · {event.venue.city}
              </p>

              <div data-reveal className="mt-5 flex flex-wrap items-center justify-center gap-2.5 max-[420px]:flex-col max-[420px]:items-stretch sm:gap-3 md:mt-6">
                <MagneticButton>
                  <Button asChild className="min-w-[10rem]">
                    <a href={hero.primaryCta.href} onClick={go(hero.primaryCta.href)}>
                      {hero.primaryCta.label}
                    </a>
                  </Button>
                </MagneticButton>
                <Button asChild variant="outline" className="min-w-[10rem]">
                  <a href={hero.secondaryCta.href} onClick={go(hero.secondaryCta.href)}>
                    {hero.secondaryCta.label}
                  </a>
                </Button>
              </div>

              <div data-reveal className="mt-4 md:mt-5">
                <a
                  href={social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.follow.ariaLabel}
                  className="t-accent inline-flex max-w-full items-center gap-2 rounded-full border border-primary bg-primary/[0.18] px-4 py-1.5 text-[0.68rem] text-fg transition-colors duration-micro ease-theme hover:border-primary hover:bg-primary hover:text-primary-foreground sm:text-[0.72rem]"
                >
                  <Instagram aria-hidden="true" className="size-[1.25em] shrink-0" />
                  <span className="truncate">
                    {social.follow.hero} · {social.instagram.handle}
                  </span>
                </a>
              </div>
            </Frame>
          </Surface>
        </div>
        </div>
      </div>
    </section>
  );
}
