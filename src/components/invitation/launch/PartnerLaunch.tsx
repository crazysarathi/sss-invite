import { lazy, Suspense, useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { sound } from "@/lib/audio";
import { brand, opening, partnersReveal } from "@/data/siteData";
import { useTheme, useThemeMotion } from "@/components/theme/ThemeProvider";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useInViewport } from "@/hooks/useInViewport";
import { TornCard } from "@/components/stationery/Ornaments";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { LazyBoundary } from "@/components/shared/LazyBoundary";
import { PaddleSvg } from "@/components/sport/PaddleSvg";
import { PickleballSvg } from "@/components/sport/PickleballSvg";
import { GiftBoxMark, JerseyMark, SparkleMark } from "./GiftGlyphs";

const BallCanvas = lazy(() => import("@/components/three/BallCanvas"));

const SLATS = 6;
const SPARKLE_SPOTS: readonly CSSProperties[] = [
  { top: "-8%", left: "8%" },
  { top: "-4%", right: "4%" },
  { top: "42%", left: "-10%" },
  { top: "38%", right: "-10%" },
  { bottom: "-6%", left: "22%" },
  { bottom: "-2%", right: "16%" },
];

/**
 * The section that follows "Four collaborations. One experience." — the same
 * kind of plain card grid as the rest of the invitation (no slider, no
 * tap-through), just four set pieces: the host's crest, the team on court,
 * the four partners again up close, and a gift that opens on a callback to
 * the invitation itself. The cards rise in together on scroll; the gift is
 * the one piece that stays interactive — tap it to open.
 */
export function PartnerLaunch() {
  const ref = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const playerLoopRef = useRef<gsap.core.Timeline | null>(null);
  const motion = useThemeMotion();
  const { theme } = useTheme();
  const ballInView = useInViewport(ballRef, "0px");
  // The flat SVG stands in until the main thread is idle — see useIdleReady.
  const enhanced = useIdleReady();
  const [giftOpened, setGiftOpened] = useState(false);
  // Bumped on every open/replay so the gift's own effect re-fires even when
  // giftOpened was already true (React won't re-run on an unchanged dep).
  const [openKey, setOpenKey] = useState(0);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const blocks = gsap.utils.toArray<HTMLElement>("[data-block]", root);
      if (!blocks.length) return;
      const contents = gsap.utils.toArray<HTMLElement>("[data-content]", root);

      gsap.fromTo(
        blocks,
        { autoAlpha: 0, y: motion.distance, scale: 0.92, rotate: (i: number) => (i % 2 === 0 ? -4 : 4) },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: motion.duration.base,
          ease: motion.ease,
          stagger: motion.stagger.items * 1.4,
          clearProps: "transform",
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
          onStart: () => {
            if (contents.length) gsap.fromTo(contents, { scale: 0.9 }, { scale: 1, duration: motion.duration.base * 0.7, ease: "back.out(2.4)", stagger: motion.stagger.items * 1.4, delay: motion.duration.base * 0.35, clearProps: "transform" });
          },
          onComplete: () => {
            const slats = gsap.utils.toArray<HTMLElement>("[data-slat]", root);
            if (slats.length) gsap.to(slats, { scaleX: 0, duration: motion.duration.slow, ease: "power3.inOut", stagger: 0.08 });
          },
        }
      );

      const watermark = root.querySelector("[data-watermark]");
      if (watermark) gsap.to(watermark, { rotation: 4, scale: 1.05, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });

      const jerseyWrap = root.querySelector("[data-jersey-wrap]");
      if (jerseyWrap) gsap.to(jerseyWrap, { rotation: 3, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" });

      const giftWrap = root.querySelector("[data-gift-wrap]");
      if (giftWrap) gsap.to(giftWrap, { y: -5, duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: ref }
  );

  // The "Player launch" card: instead of a static paddle-and-ball tableau,
  // the paddle keeps bouncing the ball off its face — a solo warm-up drill,
  // forever. One timeline owns the entrance *and* the loop so nothing fights
  // over the same transforms; play/pause is driven by ballInView below.
  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const paddle = root.querySelector<HTMLElement>("[data-player-paddle]");
      const ball = root.querySelector<HTMLElement>("[data-player-ball]");
      const impactRing = root.querySelector<HTMLElement>("[data-player-impact]");
      if (!paddle || !ball) return;

      gsap.set(paddle, { autoAlpha: 0, x: -26, rotate: -50 });
      gsap.set(ball, { autoAlpha: 0, y: -20, scale: 0.4 });
      if (impactRing) gsap.set(impactRing, { autoAlpha: 0, scale: 0.3 });

      const tl = gsap.timeline({ paused: true, delay: motion.duration.base * 0.75 });
      tl.to(paddle, { autoAlpha: 1, x: 0, rotate: -12, duration: 0.55, ease: "back.out(2)" }, 0).to(
        ball,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "bounce.out" },
        0.3
      );

      // The bounce: a quick push off the paddle face sends the ball up,
      // gravity brings it back down, and the paddle draws back just before
      // the next hit — like warming up alone on court.
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.1 });
      loop
        .to(paddle, { rotate: -4, duration: 0.12, ease: "power2.out" }, 0)
        .to(paddle, { rotate: -12, duration: 0.3, ease: motion.ease }, 0.12)
        .to(paddle, { rotate: -16, duration: 0.3, ease: "power1.in" }, 0.6)
        .to(ball, { y: -15, duration: 0.4, ease: "power2.out" }, 0)
        .to(ball, { y: 0, duration: 0.5, ease: "power1.in" }, 0.4)
        .set(ball, { scale: 0.85 }, 0)
        .to(ball, { scale: 1, duration: 0.25, ease: "elastic.out(1, 0.5)" }, 0.02)
        .call(() => sound.paddleHit(0.75), [], 0.001);
      if (impactRing) {
        loop
          .set(impactRing, { autoAlpha: 0.6, scale: 0.3 }, 0)
          .to(impactRing, { autoAlpha: 0, scale: 1.5, duration: 0.4, ease: "power2.out" }, 0.001);
      }
      tl.add(loop, ">");
      playerLoopRef.current = tl;

      return () => {
        tl.kill();
        playerLoopRef.current = null;
      };
    },
    { scope: ref, dependencies: [] }
  );

  useGSAP(
    () => {
      const tl = playerLoopRef.current;
      if (!tl) return;
      if (ballInView) tl.play();
      else tl.pause();
    },
    { dependencies: [ballInView] }
  );

  // Replays just the gift's own open animation (the gift card's "Replay"
  // button) — the rest of the section (jersey, logo, paddle cards) is left
  // alone. Bumping openKey re-fires the effect below even though giftOpened
  // is already true.
  const replay = useCallback(() => setOpenKey((k) => k + 1), []);

  // The gift's open animation is state-driven, independent of the scroll entrance above.
  useGSAP(
    () => {
      if (!giftOpened) return;
      const root = ref.current;
      if (!root) return;
      const lid = root.querySelector<HTMLElement>("[data-gift-lid]");
      const sparkles = gsap.utils.toArray<HTMLElement>("[data-sparkle]", root);
      const glow = root.querySelector<HTMLElement>("[data-glow]");
      const burst = root.querySelector<HTMLElement>("[data-burst]");
      const giftWrap = root.querySelector<HTMLElement>("[data-gift-wrap]");

      if (prefersReducedMotion()) {
        if (lid) gsap.set(lid, { rotate: -20, y: -22, x: -8, transformOrigin: "24% 96%" });
        return;
      }

      // Reset to a clean closed state first — replay must look identical to
      // the first open, not resume mid-way from wherever the last play ended.
      gsap.killTweensOf(giftWrap);
      if (lid) gsap.set(lid, { rotate: 0, x: 0, y: 0 });
      if (glow) gsap.set(glow, { autoAlpha: 0, scale: 0.5 });
      if (burst) gsap.set(burst, { autoAlpha: 0, scale: 0.3 });
      if (sparkles.length) gsap.set(sparkles, { autoAlpha: 0, scale: 0, x: 0, y: 0, rotate: 0 });
      if (giftWrap) gsap.set(giftWrap, { rotate: 0, scale: 1, y: 0 });

      const tl = gsap.timeline();

      // Anticipation: a quick excited wiggle before it pops open.
      if (giftWrap) {
        tl.to(giftWrap, { rotate: -4, duration: 0.08, ease: "power1.inOut" }, 0)
          .to(giftWrap, { rotate: 4, duration: 0.08, ease: "power1.inOut" }, 0.08)
          .to(giftWrap, { rotate: 0, duration: 0.08, ease: "power1.inOut" }, 0.16);
      }

      if (glow) tl.fromTo(glow, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 0.85, scale: 1.35, duration: 0.45, ease: "power2.out" }, 0.2);
      if (lid) tl.to(lid, { rotate: -20, y: -22, x: -8, transformOrigin: "24% 96%", duration: 0.5, ease: "back.out(1.7)" }, 0.24);

      // The crack of the "pop": a shockwave ring plus the whole box punching up.
      if (burst) tl.fromTo(burst, { autoAlpha: 0.8, scale: 0.3 }, { autoAlpha: 0, scale: 2.4, duration: 0.6, ease: "power2.out" }, 0.24);
      if (giftWrap) {
        tl.to(giftWrap, { scale: 1.12, y: -6, duration: 0.18, ease: "power2.out" }, 0.24).to(
          giftWrap,
          { scale: 1, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" },
          0.42
        );
      }

      if (sparkles.length) {
        tl.fromTo(
          sparkles,
          { autoAlpha: 0, scale: 0, x: 0, y: 0, rotate: 0 },
          {
            autoAlpha: 1,
            scale: 1,
            x: (i) => Math.round(Math.cos((i / sparkles.length) * Math.PI * 2) * 10),
            y: (i) => Math.round(Math.sin((i / sparkles.length) * Math.PI * 2) * 10),
            rotate: 90,
            duration: 0.5,
            stagger: 0.05,
            ease: "back.out(3)",
          },
          0.34
        ).to(sparkles, { autoAlpha: 0, duration: 0.5 }, 0.75);
      }
      if (glow) tl.to(glow, { autoAlpha: 0, duration: 0.5 }, 0.7);
    },
    { scope: ref, dependencies: [giftOpened, openKey] }
  );

  const openGift = useCallback(() => {
    setGiftOpened(true);
    setOpenKey((k) => k + 1);
  }, []);

  return (
    <div ref={ref} className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-12 md:gap-6">
      <LaunchCard seed={4} kicker={partnersReveal.logoKicker} className="relative overflow-hidden">
        <img
          data-watermark
          src={brand.hostCrest}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.12]"
        />
        <p className="t-display relative text-[1.7rem] leading-tight text-fg sm:text-[2rem]">{brand.host}</p>
        <p className="t-accent relative text-[0.75rem] text-fg-muted">{brand.tagline}</p>
      </LaunchCard>

      <LaunchCard seed={7} kicker={partnersReveal.jerseyKicker}>
        <div data-jersey-wrap className="relative h-32 w-24 sm:h-36 sm:w-28">
          <JerseyMark className="h-full w-full" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex overflow-hidden rounded-[2px]">
            {Array.from({ length: SLATS }).map((_, i) => (
              <span
                key={i}
                data-slat
                className={cn("h-full flex-1 bg-page-alt", prefersReducedMotion() && "hidden")}
                style={{ transformOrigin: i % 2 === 0 ? "left center" : "right center" }}
              />
            ))}
          </div>
        </div>
        <p className="t-accent text-[0.75rem] text-fg-muted">{brand.host}</p>
      </LaunchCard>

      <LaunchCard seed={11} kicker={partnersReveal.partnersKicker}>
        <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
          <div
            data-player-paddle
            className="absolute left-1 top-1/2 h-20 w-14 -translate-y-1/2 -rotate-12 [filter:drop-shadow(0_6px_6px_rgb(var(--c-overlay)/0.18))] sm:h-24 sm:w-16"
          >
            <PaddleSvg className="h-full w-full" />
          </div>
          <span
            data-player-impact
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 h-9 w-9 rounded-full border-2 border-accent opacity-0 sm:h-10 sm:w-10"
          />
          <div ref={ballRef} data-player-ball className="absolute right-2 top-2 h-9 w-9 sm:h-10 sm:w-10">
            {prefersReducedMotion() || !enhanced ? (
              <PickleballSvg className="h-full w-full" />
            ) : (
              <LazyBoundary fallback={<PickleballSvg className="h-full w-full" />}>
                <Suspense fallback={<PickleballSvg className="h-full w-full" />}>
                  <BallCanvas palette={theme.three.palette} spin={0.6} float={0.12} active={ballInView} radius={1.05} />
                </Suspense>
              </LazyBoundary>
            )}
          </div>
        </div>
        <p className="t-accent text-[0.75rem] text-fg-muted">{brand.host}</p>
      </LaunchCard>

      <LaunchCard seed={15} kicker={partnersReveal.surpriseKicker}>
        <div data-gift-wrap className="relative h-28 w-28 sm:h-32 sm:w-32">
          <span
            data-glow
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-primary opacity-0 blur-2xl"
          />
          <span
            data-burst
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary opacity-0"
          />
          {SPARKLE_SPOTS.map((pos, i) => (
            <SparkleMark
              key={i}
              data-sparkle
              aria-hidden="true"
              style={pos}
              className="pointer-events-none absolute h-3.5 w-3.5 text-accent opacity-0"
            />
          ))}
          <button
            type="button"
            onClick={openGift}
            aria-label={partnersReveal.openHint}
            aria-pressed={giftOpened}
            className="relative block h-full w-full cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            <GiftBoxMark data-gift className="h-full w-full" />
          </button>
        </div>
        {giftOpened ? (
          <div className="flex flex-col items-center gap-3">
            <p className="t-display text-balance text-[1.25rem] italic leading-snug text-fg sm:text-[1.4rem]">{opening.invitedLine}</p>
            <MagneticButton>
              <Button type="button" size="sm" onClick={replay}>
                {partnersReveal.replayCta}
              </Button>
            </MagneticButton>
          </div>
        ) : (
          <p className="t-label">{partnersReveal.openHint}</p>
        )}
      </LaunchCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One card in the grid — torn paper, a small kicker, centred content   */
/* ------------------------------------------------------------------ */
interface LaunchCardProps {
  seed: number;
  kicker: string;
  className?: string;
  children: ReactNode;
}

function LaunchCard({ seed, kicker, className, children }: LaunchCardProps) {
  return (
    <TornCard seed={seed} data-block className={cn("opacity-0", prefersReducedMotion() && "opacity-100")}>
      <div className={cn("flex h-full min-h-[15rem] flex-col items-center justify-center gap-2 px-6 py-9 text-center sm:min-h-[17rem]", className)}>
        <p className="t-accent text-[0.68rem] text-primary">{kicker}</p>
        <div data-content className="flex flex-col items-center gap-2">
          {children}
        </div>
      </div>
    </TornCard>
  );
}
