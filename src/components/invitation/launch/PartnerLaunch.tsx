import { lazy, Suspense, useCallback, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { sound } from "@/lib/audio";
import { brand, partnersReveal } from "@/data/siteData";
import technosportMark from "@/assets/partners/technosport-mark.png";
import { useTheme, useThemeMotion } from "@/components/theme/ThemeProvider";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useInViewport } from "@/hooks/useInViewport";
import { TornCard } from "@/components/stationery/Ornaments";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { LazyBoundary } from "@/components/shared/LazyBoundary";
import { PickleballSvg } from "@/components/sport/PickleballSvg";
import { GiftBoxMark, JerseyMark, SparkleMark } from "./GiftGlyphs";
import { PlayersScene } from "./PlayersScene";

const BallCanvas = lazy(() => import("@/components/three/BallCanvas"));

const SLATS = 6;

/** Curtain fabric: fine vertical pleats — a shadow fold and a lit fold per repeat. */
const PLEATS: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, rgb(var(--c-overlay) / 0.22) 0 3px, transparent 3px 8px, rgb(255 255 255 / 0.18) 8px 11px, transparent 11px 20px)",
};
/** The pelmet's scalloped hem — one half-disc per repeat. */
const SCALLOPS: CSSProperties = {
  backgroundImage: "radial-gradient(circle at 50% 0, rgb(var(--c-primary)) 0 62%, transparent 64%)",
  backgroundSize: "22px 100%",
};
/** How far the ball flies between the two paddles, in ball widths. */
const RALLY_X_PERCENT = 218;
const RALLY_HALF = 0.5;
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
 * tap-through), just four set pieces: the host's crest behind a pair of
 * curtains, the jersey, two players rallying on court, and a gift that
 * opens on a callback to the invitation itself. The cards rise in together on scroll; the gift is
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

      // Each card gets its OWN tween (same stagger timing as before, via a
      // per-index delay) so its door/slat reveal fires off ITS OWN landing —
      // not the whole group's. Batching every card into one gsap.fromTo with
      // stagger meant onComplete only fired once, after the LAST card
      // finished, so an early card (e.g. the first) sat fully landed but
      // inert for a beat before its doors even started moving — read as lag.
      blocks.forEach((block, i) => {
        const delay = i * motion.stagger.items * 1.4;

        gsap.fromTo(
          block,
          { autoAlpha: 0, y: motion.distance, scale: 0.92, rotate: i % 2 === 0 ? -4 : 4 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: motion.duration.base,
            ease: motion.ease,
            delay,
            clearProps: "transform",
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
            onComplete: () => {
              const slats = gsap.utils.toArray<HTMLElement>("[data-slat]", block);
              if (slats.length) gsap.to(slats, { scaleX: 0, duration: motion.duration.slow, ease: "power3.inOut", stagger: 0.08 });

              // Curtains don't slide off — they gather: each panel squeezes
              // toward its own edge (the pleats bunch up as scaleX drops)
              // and stays there as a tied-back drape framing the crest.
              const curtainLeft = block.querySelector<HTMLElement>("[data-curtain-left]");
              const curtainRight = block.querySelector<HTMLElement>("[data-curtain-right]");
              if (curtainLeft && curtainRight) {
                const open = { scaleX: 0.13, duration: motion.duration.slow * 1.2, ease: "power3.inOut" };
                sound.curtainOpen(open.duration);
                gsap.to(curtainLeft, { ...open, transformOrigin: "left center" });
                gsap.to(curtainRight, { ...open, transformOrigin: "right center" });
              }
            },
          }
        );

        const content = block.querySelector<HTMLElement>("[data-content]");
        if (content) {
          gsap.fromTo(
            content,
            { scale: 0.9 },
            {
              scale: 1,
              duration: motion.duration.base * 0.7,
              ease: "back.out(2.4)",
              delay: delay + motion.duration.base * 0.35,
              clearProps: "transform",
              scrollTrigger: { trigger: root, start: "top 75%", once: true },
            }
          );
        }
      });

      const crest = root.querySelector("[data-crest]");
      if (crest) gsap.to(crest, { y: -6, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

      const jerseyWrap = root.querySelector("[data-jersey-wrap]");
      if (jerseyWrap) gsap.to(jerseyWrap, { rotation: 3, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%" });

      const giftWrap = root.querySelector("[data-gift-wrap]");
      if (giftWrap) gsap.to(giftWrap, { y: -5, duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: ref }
  );

  // The "Player launch" card: two players rally the ball back and forth
  // over the net, forever. One timeline owns the entrance *and* the loop so
  // nothing fights over the same transforms; play/pause is driven by
  // ballInView below. The ball is a separate element layered over the
  // PlayersScene SVG; it flies between the two paddle faces in ball widths
  // (xPercent), so the same numbers hold at every card size.
  useGSAP(
    () => {
      const root = ref.current;
      if (!root || prefersReducedMotion()) return;
      const left = root.querySelector<HTMLElement>("[data-player-left]");
      const right = root.querySelector<HTMLElement>("[data-player-right]");
      const paddleLeft = root.querySelector<HTMLElement>("[data-paddle-left]");
      const paddleRight = root.querySelector<HTMLElement>("[data-paddle-right]");
      const ball = root.querySelector<HTMLElement>("[data-player-ball]");
      const ringLeft = root.querySelector<HTMLElement>("[data-player-impact-left]");
      const ringRight = root.querySelector<HTMLElement>("[data-player-impact-right]");
      if (!left || !right || !paddleLeft || !paddleRight || !ball) return;

      gsap.set(left, { autoAlpha: 0, x: -24 });
      gsap.set(right, { autoAlpha: 0, x: 24 });
      // Paddles pivot about the grip (bottom-centre of their own box).
      gsap.set(paddleLeft, { rotation: 35, transformOrigin: "50% 100%" });
      gsap.set(paddleRight, { rotation: -35, transformOrigin: "50% 100%" });
      gsap.set(ball, { autoAlpha: 0, y: -20, scale: 0.4 });
      for (const ring of [ringLeft, ringRight]) if (ring) gsap.set(ring, { autoAlpha: 0, scale: 0.3 });

      const tl = gsap.timeline({ paused: true, delay: motion.duration.base * 0.75 });
      tl.to(left, { autoAlpha: 1, x: 0, duration: 0.55, ease: "back.out(2)" }, 0)
        .to(right, { autoAlpha: 1, x: 0, duration: 0.55, ease: "back.out(2)" }, 0.1)
        .to(ball, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "bounce.out" }, 0.35);

      // The rally: a forehand sends the ball in an arc over the net, the
      // receiver blocks it straight back, and each player draws the paddle
      // back while the ball is on its way over.
      const H = RALLY_HALF;
      const hit = (paddle: HTMLElement, player: HTMLElement, ring: HTMLElement | null, rest: number, at: number) => {
        loop
          .call(() => sound.paddleHit(0.7), [], at + 0.001)
          .to(paddle, { rotation: rest * 0.55, duration: 0.16, ease: "power3.out" }, at)
          .to(paddle, { rotation: rest, duration: 0.34, ease: "sine.inOut" }, at + 0.16)
          .to(paddle, { rotation: rest * 1.7, duration: 0.3, ease: "power1.in" }, at + H + 0.15)
          .to(player, { rotation: rest > 0 ? -4 : 4, transformOrigin: "50% 100%", duration: 0.14, ease: "power2.out" }, at)
          .to(player, { rotation: 0, duration: 0.45, ease: "sine.inOut" }, at + 0.14);
        if (ring) {
          loop.set(ring, { autoAlpha: 0.6, scale: 0.3 }, at).to(ring, { autoAlpha: 0, scale: 1.5, duration: 0.4, ease: "power2.out" }, at + 0.001);
        }
      };
      const loop = gsap.timeline({ repeat: -1 });
      hit(paddleLeft, left, ringLeft, 35, 0);
      loop
        .to(ball, { xPercent: RALLY_X_PERCENT, duration: H, ease: "none" }, 0)
        .to(ball, { y: -16, duration: H / 2, ease: "power2.out" }, 0)
        .to(ball, { y: 3, duration: H / 2, ease: "power2.in" }, H / 2);
      hit(paddleRight, right, ringRight, -35, H);
      loop
        .to(ball, { xPercent: 0, duration: H, ease: "none" }, H)
        .to(ball, { y: -16, duration: H / 2, ease: "power2.out" }, H)
        .to(ball, { y: 0, duration: H / 2, ease: "power2.in" }, H * 1.5);
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

      // Rattle → pop → sparkle chime, scheduled on the audio clock to the
      // same offsets as the timeline below (also on every Replay).
      sound.giftOpen();

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
        {/* Just the crest — the hosts asked for the logo alone, nothing written under it. */}
        <img
          data-crest
          src={brand.hostCrest}
          alt={brand.host}
          decoding="async"
          className="h-36 w-36 object-contain [filter:drop-shadow(0_10px_12px_rgb(var(--c-overlay)/0.18))] sm:h-40 sm:w-40"
        />

        {/* The curtains: a pelmet across the top with a scalloped hem, and
            two pleated panels in the house wisteria that gather to each
            side once the card lands (see the open tween above). A chartreuse
            trim runs along every hem. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <div className="h-4 bg-primary" style={PLEATS} />
          <div className="h-3 w-full" style={SCALLOPS} />
          <span className="absolute inset-x-0 top-4 h-px bg-accent/80" />
        </div>
        <div
          data-curtain-left
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 bg-primary", prefersReducedMotion() && "hidden")}
          style={PLEATS}
        >
          <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-overlay/[0.2] to-transparent" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-accent" />
        </div>
        <div
          data-curtain-right
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-y-0 right-0 z-10 w-1/2 bg-primary", prefersReducedMotion() && "hidden")}
          style={PLEATS}
        >
          <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-overlay/[0.2] to-transparent" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-accent" />
        </div>
      </LaunchCard>

      <LaunchCard seed={7} kicker={partnersReveal.jerseyKicker}>
        <div data-jersey-wrap className="relative h-32 w-24 sm:h-36 sm:w-28">
          <JerseyMark className="h-full w-full" />
          {/* Kit sponsor mark — printed straight on the fabric, no patch/badge behind it. */}
          <img
            src={technosportMark}
            alt="Technosport"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute left-1/2 top-[52%] w-[38%] -translate-x-1/2 -translate-y-1/2 object-contain [filter:drop-shadow(0_1px_1px_rgb(var(--c-overlay)/0.4))]"
          />
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
      </LaunchCard>

      <LaunchCard seed={11} kicker={partnersReveal.partnersKicker}>
        {/* Two players, a net, and the ball rallying between them. The ball
            and the two impact rings sit over the SVG at the paddle faces
            (percentages of the scene box, offset by half their own size). */}
        <div className="relative w-56 sm:w-64">
          <PlayersScene />
          {[
            { key: "left", cls: "left-[41%] top-[31%]", attr: { "data-player-impact-left": true } },
            { key: "right", cls: "left-[61%] top-[35%]", attr: { "data-player-impact-right": true } },
          ].map(({ key, cls, attr }) => (
            <span
              key={key}
              {...attr}
              aria-hidden="true"
              className={cn("pointer-events-none absolute -ml-3.5 -mt-3.5 h-7 w-7 rounded-full border-2 border-accent opacity-0", cls)}
            />
          ))}
          <div
            ref={ballRef}
            data-player-ball
            className="absolute left-[41%] top-[31%] -ml-2.5 -mt-2.5 h-5 w-5 sm:-ml-3 sm:-mt-3 sm:h-6 sm:w-6"
          >
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
            <p className="t-display text-balance text-[1.25rem] italic leading-snug text-fg sm:text-[1.4rem]">{partnersReveal.surpriseTeaser}</p>
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
