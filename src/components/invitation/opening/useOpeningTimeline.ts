import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { ENVELOPE } from "./Envelope";
import type { OpeningPreset } from "./presets";

/**
 * The envelope choreography.
 *
 *   INTRO  (auto, once `ready`)  decor + kicker fade, the envelope rises and
 *          settles from a slight tilt, the seal ball pops in, gate + hint last.
 *          Then IDLE: the envelope floats, the ball's shadow breathes, the hint
 *          pulses. On hover (fine pointer) the card peeks up.
 *   OPEN   (tap / Enter / Space)  the wax disc splits and the ball pops off,
 *          rolls right and drops; the flap swings open (z-swap past 90°); the
 *          card slides up out of the pocket and holds a beat.
 *   EXIT   `onOpenStart()` fires here. The card grows toward the viewer and
 *          moves to the viewport centre while the envelope, stage and backdrop
 *          drop away; finally the card fades (blur per preset) → `onExited()`.
 *   SKIP   (Escape / second tap)  jump to the end; both callbacks still fire
 *          once, in order.
 *
 * All targets are `data-*` nodes inside `scope` (see Envelope.tsx +
 * OpeningScreen.tsx). Idle motion is transforms + opacity only.
 */
export interface OpeningTimelineOptions {
  scope: RefObject<HTMLElement>;
  /** Fonts are warm and the stage markup is mounted. */
  ready: boolean;
  preset: OpeningPreset;
  /** The exit begins (the card starts growing toward the viewer). */
  onOpenStart: () => void;
  /** The exit has fully finished. */
  onExited: () => void;
}

export interface OpeningTimelineHandle {
  open: () => void;
  skip: () => void;
  /** Hover peek (fine pointers) — a no-op once the envelope is opening. */
  hover: (on: boolean) => void;
}

type Loop = gsap.core.Tween | gsap.core.Timeline;

/** timeScale applied to a still-running intro when the reader taps early. */
const INTRO_HURRY = 4;

export function useOpeningTimeline({
  scope,
  ready,
  preset,
  onOpenStart,
  onExited,
}: OpeningTimelineOptions): OpeningTimelineHandle {
  const motion = useThemeMotion();
  const introRef = useRef<gsap.core.Timeline | null>(null);
  const openRef = useRef<gsap.core.Timeline | null>(null);
  const loopsRef = useRef<Loop[]>([]);
  const buildOpenRef = useRef<(() => gsap.core.Timeline) | null>(null);
  const openedRef = useRef(false);
  const pendingRef = useRef(false);
  const startRef = useRef(onOpenStart);
  const exitedRef = useRef(onExited);
  startRef.current = onOpenStart;
  exitedRef.current = onExited;
  const presetRef = useRef(preset);
  presetRef.current = preset;

  useGSAP(
    () => {
      const root = scope.current;
      if (!ready || !root) return;
      const one = (sel: string) => root.querySelector<HTMLElement>(sel);

      const backdrop = one("[data-backdrop]");
      const decor = one("[data-decor]");
      const kicker = one("[data-kicker]");
      const float = one("[data-float]");
      const env = one("[data-env]");
      const envelope = one("[data-envelope]");
      const back = one("[data-back]");
      const sleeve = one("[data-sleeve]");
      const card = one("[data-card]");
      const cardHover = one("[data-card-hover]");
      const pocket = one("[data-pocket]");
      const flapShadow = one("[data-flap-shadow]");
      const flap = one("[data-flap]");
      const ballShadow = one("[data-ball-shadow]");
      const disc = one("[data-disc]");
      const ball = one("[data-ball]");
      const gate = one("[data-gate]");
      const hint = one("[data-hint]");
      const host = one("[data-host]");
      if (!env || !envelope || !card || !flap || !ball || !disc || !sleeve) return;

      const P = presetRef.current;
      const { base } = motion.duration;
      const soft = [kicker, gate, host].filter((el): el is HTMLElement => el != null);

      /* ---------- initial state ---------- */
      gsap.set(decor, { autoAlpha: 0 });
      gsap.set(soft, { autoAlpha: 0, y: 14 });
      // opacity (not autoAlpha) so the envelope button is focusable at once
      gsap.set(env, {
        opacity: 0,
        y: 48,
        rotationX: P.introTilt,
        transformPerspective: 1200,
        transformOrigin: "50% 100%",
      });
      gsap.set(flap, { rotationX: 0, transformPerspective: 1200, transformOrigin: "50% 0%" });
      gsap.set([ball, disc], { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(ballShadow, { scale: 0.4, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(card, { y: 0 });

      /* ---------- intro ---------- */
      const loops: Loop[] = [];
      const intro = gsap.timeline({
        defaults: { ease: motion.ease, duration: base },
        onComplete: () => {
          if (!openedRef.current) loops.forEach((l) => l.play());
        },
      });
      intro
        .to(decor, { autoAlpha: 0.55, duration: base * 1.2, ease: "power2.out" }, 0)
        .to(kicker, { autoAlpha: 1, y: 0, duration: base * 0.7 }, 0.1)
        .to(env, { opacity: 1, y: 0, rotationX: 0, duration: base }, 0.15)
        .to(disc, { scale: 1, duration: base * 0.4, ease: "back.out(1.4)" }, 0.15 + base * 0.4)
        .to(ball, { scale: 1, duration: base * 0.6, ease: "back.out(1.7)" }, 0.15 + base * 0.48)
        .to(ballShadow, { scale: 1, opacity: 1, duration: base * 0.6, ease: "power2.out" }, 0.15 + base * 0.5)
        .to([gate, host].filter(Boolean), { autoAlpha: 1, y: 0, duration: base * 0.6, stagger: 0.1 }, 0.15 + base * 0.6);

      /* ---------- idle loops (start after the intro) ---------- */
      if (float) {
        loops.push(
          gsap.to(float, { y: -6, duration: 1.75, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true })
        );
      }
      if (ballShadow) {
        loops.push(
          gsap.to(ballShadow, {
            scaleX: 1.1,
            scaleY: 0.92,
            opacity: 0.75,
            duration: 1.75,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            paused: true,
          })
        );
      }
      if (hint) {
        loops.push(gsap.to(hint, { opacity: 0.45, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true }));
      }

      /* ---------- open (built lazily so measurements are current) ---------- */
      const buildOpen = (): gsap.core.Timeline => {
        if (cardHover) gsap.killTweensOf(cardHover);
        const envRect = envelope.getBoundingClientRect();
        const W = envRect.width;
        const H = envRect.height;
        const floatY = float ? Number(gsap.getProperty(float, "y")) : 0;
        const hoverY = cardHover ? Number(gsap.getProperty(cardHover, "y")) : 0;
        const cardRect = card.getBoundingClientRect();
        // Card centre at rest (no idle float / hover peek) → exit target = viewport centre.
        const restCX = cardRect.left + cardRect.width / 2;
        const restCY = cardRect.top + cardRect.height / 2 - floatY - hoverY;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const mobile = vw < 768;
        const exitScale = mobile ? P.exit.scale.mobile : P.exit.scale.desktop;

        const d = {
          ball: base * P.beats.ball,
          flap: base * P.beats.flap,
          card: base * P.beats.card,
          hold: base * P.beats.hold,
          exit: base * P.beats.exit,
          fade: base * P.beats.fade,
        };
        const tBall = 0;
        const tFlap = tBall + d.ball - base * P.overlap.flap;
        const tCard = tFlap + d.flap - base * P.overlap.card;
        const tExit = tCard + d.card + d.hold;
        const tFade = tExit + d.exit - base * P.overlap.fade;

        const tl = gsap.timeline({ paused: true, onComplete: () => exitedRef.current() });

        // settle idle offsets; the kicker + gate step aside (the host line stays until the exit)
        tl.to([float, cardHover].filter(Boolean), { y: 0, duration: 0.35, ease: "power2.out" }, 0);
        tl.to([kicker, gate].filter(Boolean), { autoAlpha: 0, y: 10, duration: 0.35, ease: "power2.out" }, 0);

        // a. seal splits, ball pops off, rolls right and drops
        tl.to(disc, { scaleX: 1.15, duration: d.ball * 0.18, ease: "power2.out" }, tBall)
          .to(disc, { autoAlpha: 0, duration: d.ball * 0.2, ease: "power2.in" }, tBall + d.ball * 0.14)
          .to(ballShadow, { autoAlpha: 0, scale: 1.3, duration: d.ball * 0.25, ease: "power2.out" }, tBall)
          .to(ball, { scaleY: 0.88, duration: d.ball * 0.09, ease: "power2.in" }, tBall)
          .to(ball, { scaleY: 1, y: -H * 0.05, duration: d.ball * 0.12, ease: "power2.out" }, tBall + d.ball * 0.09);
        const roll = tBall + d.ball * 0.2;
        const rollDur = d.ball * 0.8;
        tl.to(ball, { x: W * P.ball.throwX, duration: rollDur, ease: "none" }, roll)
          .to(ball, { rotation: P.ball.rotation, duration: rollDur, ease: P.ball.bounce ? "power1.in" : "none" }, roll)
          .to(ball, { autoAlpha: 0, duration: rollDur * 0.3, ease: "power1.in" }, roll + rollDur * 0.7);
        if (P.ball.bounce) {
          tl.to(ball, { y: H * 0.16, duration: rollDur * 0.32, ease: "power2.in" }, roll)
            .to(ball, { y: H * 0.02, duration: rollDur * 0.22, ease: "power2.out" }, roll + rollDur * 0.32)
            .to(ball, { y: H * 0.85, duration: rollDur * 0.46, ease: "power2.in" }, roll + rollDur * 0.54);
        } else {
          tl.to(ball, { y: H * 0.85, duration: rollDur, ease: P.ball.ease }, roll);
        }

        // b. flap opens (z-swap once past 90°)
        tl.to(flapShadow, { autoAlpha: 0, duration: d.flap * 0.35, ease: "power2.out" }, tFlap).to(
          flap,
          {
            rotationX: -180,
            duration: d.flap,
            ease: P.flap.ease,
            onUpdate() {
              const r = Number(gsap.getProperty(flap, "rotationX"));
              flap.style.zIndex = r < -90 ? "0" : "4";
            },
          },
          tFlap
        );
        tl.set(flap, { zIndex: 0 }, tFlap + d.flap);

        // c. the card slides up out of the pocket, then holds
        tl.to(card, { y: -H * ENVELOPE.cardTravel, duration: d.card, ease: P.cardEase ?? motion.ease }, tCard);

        // d. exit — the card grows toward the viewer; everything else drops away
        tl.call(() => startRef.current(), [], tExit);
        tl.set(sleeve, { overflow: "visible", zIndex: 8 }, tExit);
        tl.to(
          [back, pocket, flap, flapShadow, host].filter(Boolean),
          { y: "+=40", autoAlpha: 0, duration: d.exit * 0.85, ease: "power2.in" },
          tExit
        );
        tl.to(
          card,
          { x: vw / 2 - restCX, y: vh / 2 - restCY, scale: exitScale, duration: d.exit + d.fade * 0.6, ease: P.exit.ease },
          tExit
        );
        tl.to(backdrop, { autoAlpha: 0, duration: d.exit * 0.9, ease: "power2.inOut" }, tExit + d.exit * 0.2);
        const fadeVars: gsap.TweenVars = { autoAlpha: 0, duration: d.fade, ease: "power2.in" };
        if (P.exit.blur > 0) {
          tl.set(card, { filter: "blur(0px)" }, tExit);
          fadeVars.filter = `blur(${P.exit.blur}px)`;
        }
        tl.to(card, fadeVars, tFade);
        return tl;
      };

      introRef.current = intro;
      loopsRef.current = loops;
      buildOpenRef.current = buildOpen;
      openRef.current = null;
      openedRef.current = false;

      return () => {
        loops.forEach((l) => l.kill());
        introRef.current = null;
        loopsRef.current = [];
        buildOpenRef.current = null;
        openRef.current?.kill();
        openRef.current = null;
      };
    },
    { scope, dependencies: [ready] }
  );

  const startOpen = useCallback(() => {
    if (openRef.current || !buildOpenRef.current) return;
    openRef.current = buildOpenRef.current();
    openRef.current.play(0);
  }, []);

  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    const intro = introRef.current;
    if (!intro || !buildOpenRef.current) {
      // Tapped before the stage mounted — open as soon as it does.
      pendingRef.current = true;
      return;
    }
    loopsRef.current.forEach((l) => l.pause());
    if (intro.progress() < 1) {
      // Mid-intro: hurry it to its end state, then open.
      intro.timeScale(INTRO_HURRY);
      intro.eventCallback("onComplete", startOpen);
    } else {
      startOpen();
    }
  }, [startOpen]);

  const skip = useCallback(() => {
    openedRef.current = true;
    pendingRef.current = false;
    loopsRef.current.forEach((l) => l.kill());
    const intro = introRef.current;
    if (intro) {
      intro.eventCallback("onComplete", null);
      intro.progress(1);
    }
    let tl = openRef.current;
    if (!tl && buildOpenRef.current) tl = openRef.current = buildOpenRef.current();
    if (tl) {
      tl.pause();
      tl.progress(1, true);
    }
    // Callbacks are guarded by the caller; always in this order.
    startRef.current();
    exitedRef.current();
  }, []);

  // A tap that arrived before the stage mounted opens it now.
  useEffect(() => {
    if (ready && pendingRef.current) {
      pendingRef.current = false;
      openedRef.current = false;
      open();
    }
  }, [ready, open]);

  const hover = useCallback(
    (on: boolean) => {
      if (openedRef.current) return;
      const cardHover = scope.current?.querySelector<HTMLElement>("[data-card-hover]");
      if (!cardHover) return;
      gsap.to(cardHover, { y: on ? -8 : 0, duration: 0.45, ease: motion.ease, overwrite: "auto" });
    },
    [scope, motion.ease]
  );

  return useMemo(() => ({ open, skip, hover }), [open, skip, hover]);
}
