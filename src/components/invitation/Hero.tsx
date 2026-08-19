import { lazy, Suspense, useRef } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { brand, dateLine, event, hero } from "@/data/siteData";
import { useTheme, useThemeMotion } from "@/components/theme/ThemeProvider";
import { useInViewport } from "@/hooks/useInViewport";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/Kicker";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { LazyBoundary } from "@/components/shared/LazyBoundary";
import { Court } from "@/components/sport/Court";
import { PickleballSvg } from "@/components/sport/PickleballSvg";

const BallCanvas = lazy(() => import("@/components/three/BallCanvas"));

interface HeroProps {
  /** The opening has started its exit — play the entrance (overlapping it). */
  booted: boolean;
}

/**
 * Hero — the invitation card, full screen.
 *
 *   ENTRANCE  the court lines draw themselves in; a 3D pickleball drops
 *             from above, bounces twice and settles beside the title
 *             (its ground shadow breathes with the bounce); the title's
 *             characters spring up; kicker, sublines, partners, facts and
 *             CTAs rise in after.
 *   SCROLL    the ball rolls away and sinks with parallax, the court drifts,
 *             the copy lifts and dims (desktop).
 * Reduced motion → everything simply visible, no 3D.
 */
export function Hero({ booted }: HeroProps) {
  const { theme } = useTheme();
  const motion = useThemeMotion();
  const ref = useRef<HTMLElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const ballInView = useInViewport(ballRef, "0px");
  const [a, amp, b] = brand.nameParts;
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !booted) return;
      const q = gsap.utils.selector(root);
      const title = root.querySelector<HTMLElement>("[data-hero-title]");
      const ball = root.querySelector<HTMLElement>("[data-hero-ball]");
      const shadow = root.querySelector<HTMLElement>("[data-hero-shadow]");
      const court = root.querySelector<HTMLElement>("[data-hero-court]");
      const copy = root.querySelector<HTMLElement>("[data-hero-copy]");
      const lines = q("[data-court-line]");
      const reveals = q("[data-reveal]");

      if (prefersReducedMotion()) {
        gsap.set([title, ball, shadow, court, ...reveals], { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      const base = motion.duration.base;
      const tl = gsap.timeline({ defaults: { ease: motion.ease } });

      /* 1. court draws itself */
      if (court) gsap.set(court, { autoAlpha: 1 });
      if (lines.length) {
        tl.fromTo(lines, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: base * 1.2, stagger: 0.05, ease: "power2.inOut" }, 0);
      }
      const surface = root.querySelector("[data-court-surface]");
      if (surface) tl.fromTo(surface, { opacity: 0 }, { opacity: 1, duration: base, ease: "power1.out" }, 0.2);

      /* 2. the ball drops and bounces to rest */
      if (ball && shadow) {
        gsap.set(ball, { autoAlpha: 1 });
        tl.fromTo(ball, { yPercent: -320 }, { yPercent: 0, duration: base * 1.5, ease: "bounce.out" }, 0.15)
          .fromTo(
            shadow,
            { autoAlpha: 0, scale: 0.25 },
            { autoAlpha: 1, scale: 1, duration: base * 1.5, ease: "bounce.out", transformOrigin: "50% 50%" },
            0.15
          )
          // squash on the first landing (bounce.out's first contact ≈ 36% in)
          .to(ball, { scaleY: 0.84, scaleX: 1.1, duration: 0.08, ease: "power2.in", transformOrigin: "50% 100%" }, 0.15 + base * 1.5 * 0.36)
          .to(ball, { scaleY: 1, scaleX: 1, duration: 0.32, ease: "elastic.out(1, 0.45)" }, 0.15 + base * 1.5 * 0.36 + 0.08);
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
          0.35
        );
      }

      /* 4. everything else rises in */
      if (reveals.length) {
        tl.fromTo(
          reveals,
          { autoAlpha: 0, y: motion.distance },
          { autoAlpha: 1, y: 0, duration: base, stagger: motion.stagger.items, clearProps: "transform" },
          0.75
        );
      }

      /* SCROLL — scrubbed across the hero */
      const scrub = {
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: motion.scrub,
      };
      // the ball rolls off to the right and sinks, fading before the hero ends
      if (ball) {
        gsap.to(ball, { x: "22vw", y: "38vh", rotation: 140, ease: "none", scrollTrigger: scrub });
        gsap.to(ball, { autoAlpha: 0, ease: "none", scrollTrigger: { ...scrub, start: "45% top", end: "85% top" } });
      }
      if (shadow) gsap.to(shadow, { x: "22vw", y: "38vh", autoAlpha: 0, ease: "none", scrollTrigger: scrub });
      if (court) gsap.to(court, { yPercent: 14 * motion.parallax * 2, ease: "none", scrollTrigger: scrub });
      gsap.matchMedia().add("(min-width: 768px)", () => {
        if (copy) gsap.to(copy, { yPercent: -18, autoAlpha: 0.1, ease: "none", scrollTrigger: { ...scrub, end: "75% top" } });
      });
    },
    { scope: ref, dependencies: [booted] }
  );

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <section id="hero" ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-page">
      {/* court backdrop */}
      <div
        data-hero-court
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-x-0 bottom-0 top-[18%] opacity-0 will-change-transform", reduced && "opacity-100")}
      >
        <Court className="opacity-60 md:opacity-90" />
      </div>
      {/* soft glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[42%] h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--c-surface)/0.9),rgb(var(--c-surface)/0))]"
      />

      <div className="section-shell-x relative z-10 flex flex-1 flex-col items-center justify-center pb-16 pt-[calc(var(--nav-height)+1.25rem)] text-center md:pb-28 md:pt-[calc(var(--nav-height)+2.5rem)]">
        {/* the ball — in-flow on mobile, floated to the title's shoulder on desktop */}
        <div className="relative mb-3 h-20 w-20 md:absolute md:right-0 md:top-[18%] md:mb-0 md:h-[clamp(10rem,17vw,15rem)] md:w-[clamp(10rem,17vw,15rem)] lg:-right-[2vw]">
          <span
            data-hero-shadow
            aria-hidden="true"
            className={cn("absolute -bottom-2 left-[12%] right-[12%] h-[18%] rounded-full bg-overlay/30 opacity-0 [filter:blur(6px)]", reduced && "opacity-100")}
          />
          <div
            ref={ballRef}
            data-hero-ball
            className={cn("absolute inset-0 opacity-0 [filter:drop-shadow(0_18px_18px_rgb(var(--c-overlay)/0.22))]", reduced && "opacity-100")}
          >
            {reduced ? (
              <PickleballSvg className="h-full w-full" />
            ) : (
              <LazyBoundary fallback={<PickleballSvg className="h-full w-full" />}>
                <Suspense fallback={<PickleballSvg className="h-full w-full" />}>
                  <BallCanvas palette={theme.three.palette} spin={0.35} float={0.12} active={ballInView} radius={1.08} />
                </Suspense>
              </LazyBoundary>
            )}
          </div>
        </div>

        <div data-hero-copy className="flex max-w-4xl flex-col items-center">
          <p data-reveal className="mb-4 md:mb-7">
            <Kicker ornament="both">{hero.eyebrow}</Kicker>
          </p>

          <h1 data-hero-title className="t-display text-display-xl text-fg opacity-0">
            {a} <em className="text-primary">{amp}</em> {b}
          </h1>

          <p data-reveal className="t-display mt-2 text-display-sm italic text-primary md:mt-3">
            {brand.subline}
          </p>
          <p data-reveal className="t-accent mt-4 text-[0.72rem] text-fg-muted md:mt-6 md:text-sm">
            {brand.tagline}
          </p>

          <p data-reveal className="mt-5 max-w-2xl text-balance text-sm leading-relaxed text-fg-muted md:mt-8 md:text-base">
            {brand.partners.map((p, i) => (
              <span key={p.name} className="inline-block whitespace-nowrap">
                {i > 0 && <span className="mx-2 text-primary md:mx-3">×</span>}
                <span className="text-fg">{p.name}</span>
              </span>
            ))}
          </p>

          <ul data-reveal className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-10 md:gap-3">
            <li className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface/80 px-4 py-2 text-sm text-fg shadow-card backdrop-blur">
              <MapPin aria-hidden="true" className="h-4 w-4 text-primary" />
              {event.venue.name}
            </li>
            <li className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface/80 px-4 py-2 text-sm text-fg shadow-card backdrop-blur">
              <CalendarDays aria-hidden="true" className="h-4 w-4 text-primary" />
              {dateLine()}
            </li>
          </ul>

          <div data-reveal className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-11 md:gap-4">
            <MagneticButton>
              <Button asChild size="lg" className="min-w-[10rem]">
                <a href={hero.primaryCta.href} onClick={go(hero.primaryCta.href)}>
                  {hero.primaryCta.label}
                </a>
              </Button>
            </MagneticButton>
            <Button asChild size="lg" variant="outline" className="min-w-[10rem]">
              <a href={hero.secondaryCta.href} onClick={go(hero.secondaryCta.href)}>
                {hero.secondaryCta.label}
              </a>
            </Button>
          </div>
        </div>
      </div>

      <ScrollHint className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 md:flex" show={booted} />
    </section>
  );
}

/** "Scroll" micro-label with a breathing line. */
function ScrollHint({ className, show }: { className?: string; show: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex-col items-center gap-2 text-fg-subtle transition-opacity duration-slow ease-theme",
        show ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <span className="t-label">{hero.scrollHint}</span>
      <span className="relative block h-10 w-px overflow-hidden bg-line-strong">
        <span className="absolute inset-x-0 top-0 block h-1/2 animate-scroll-line bg-primary" />
      </span>
    </div>
  );
}
