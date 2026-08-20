import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import type { OpeningPreset } from "./presets";

/**
 * The gate choreography.
 *
 *   INTRO  (auto, once `ready`)  the closed doors are on stage from first
 *          paint (no flash of the page beneath); their decor washes in, the
 *          kicker settles, the seal medallion rises, the ring engraves in,
 *          the ball pops onto it, the title block and gate follow. Then
 *          IDLE: the seal floats, the hint pulses.
 *   OPEN   (tap / Enter / Space)  the copy and ring step aside; the ball
 *          squashes, hops off the seal and serves away past the bottom of
 *          the screen with a spin; the two leaves swing apart and slide off
 *          the sides, revealing the page. `onOpenStart()` fires as the
 *          doors start to move, so the hero entrance overlaps the reveal.
 *   EXIT   when the leaves have cleared the viewport → `onExited()`.
 *   SKIP   (Escape / second tap)  jump to the end; both callbacks still
 *          fire once, in order.
 *
 * All targets are `data-*` nodes inside `scope` (see Gates.tsx +
 * OpeningScreen.tsx). Idle motion is transforms + opacity only.
 */
export interface OpeningTimelineOptions {
  scope: RefObject<HTMLElement>;
  /** Fonts are warm and the stage markup is mounted. */
  ready: boolean;
  preset: OpeningPreset;
  /** The exit begins (the doors start to part). */
  onOpenStart: () => void;
  /** The exit has fully finished. */
  onExited: () => void;
}

export interface OpeningTimelineHandle {
  open: () => void;
  skip: () => void;
  /** Hover peek (fine pointers) — a no-op once the doors are opening. */
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
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(root.querySelectorAll(sel));

      const doorL = one("[data-door-left]");
      const doorR = one("[data-door-right]");
      const decors = all("[data-decor]");
      const kicker = one("[data-kicker]");
      const seal = one("[data-seal]");
      const ring = one("[data-ring]");
      const ball = one("[data-ball]");
      const titleLines = all("[data-titles] > *");
      const gate = one("[data-gate]");
      const hint = one("[data-hint]");
      const host = one("[data-host]");
      if (!doorL || !doorR || !seal || !ball) return;

      const P = presetRef.current;
      const { base } = motion.duration;
      const soft = [kicker, gate, host].filter((el): el is HTMLElement => el != null);

      /* ---------- initial state ---------- */
      gsap.set(decors, { autoAlpha: 0 });
      gsap.set(soft, { autoAlpha: 0, y: 14 });
      gsap.set(titleLines, { autoAlpha: 0, y: 16 });
      // opacity (not autoAlpha) so the seal button is focusable at once
      gsap.set(seal, { opacity: 0, y: 26, scale: 0.94, transformOrigin: "50% 50%" });
      gsap.set(ring, { scale: 0.75, autoAlpha: 0, transformOrigin: "50% 50%" });
      gsap.set(ball, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set([doorL, doorR], { xPercent: 0, rotationY: 0 });

      /* ---------- intro ---------- */
      const loops: Loop[] = [];
      const intro = gsap.timeline({
        defaults: { ease: motion.ease, duration: base },
        onComplete: () => {
          if (!openedRef.current) loops.forEach((l) => l.play());
        },
      });
      intro
        .to(decors, { autoAlpha: 1, duration: base * 1.2, ease: "power2.out" }, 0)
        .to(kicker, { autoAlpha: 1, y: 0, duration: base * 0.7 }, 0.1)
        .to(seal, { opacity: 1, y: 0, scale: 1, duration: base * 0.9 }, 0.15)
        .to(ring, { autoAlpha: 1, scale: 1, duration: base * 0.55, ease: "back.out(1.4)" }, 0.15 + base * 0.3)
        .to(ball, { scale: 1, duration: base * 0.6, ease: "back.out(1.7)" }, 0.15 + base * 0.4)
        .to(titleLines, { autoAlpha: 1, y: 0, duration: base * 0.65, stagger: 0.06 }, 0.15 + base * 0.45)
        .to([gate, host].filter(Boolean), { autoAlpha: 1, y: 0, duration: base * 0.6, stagger: 0.1 }, 0.15 + base * 0.65);

      /* ---------- idle loops (start after the intro) ---------- */
      loops.push(
        gsap.to(seal, { y: -6, duration: 1.75, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true })
      );
      if (hint) {
        loops.push(gsap.to(hint, { opacity: 0.45, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true }));
      }

      /* ---------- open (built lazily so measurements are current) ---------- */
      const buildOpen = (): gsap.core.Timeline => {
        gsap.killTweensOf([doorL, doorR, seal]);
        const vh = window.innerHeight;
        const ballRect = ball.getBoundingClientRect();
        // Fall far enough to clear the bottom edge wherever the seal sits.
        const fall = vh - ballRect.top + ballRect.height;

        const d = {
          text: base * P.beats.text,
          ball: base * P.beats.ball,
          doors: base * P.beats.doors,
        };
        const tDoors = base * P.doorsDelay;

        const tl = gsap.timeline({ paused: true, onComplete: () => exitedRef.current() });

        // settle the idle float + hover peek; copy + ring step aside
        tl.to(seal, { y: 0, duration: 0.3, ease: "power2.out" }, 0);
        tl.to([doorL, doorR], { x: 0, duration: 0.3, ease: "power2.out" }, 0);
        tl.to([kicker, ...titleLines, gate, host].filter(Boolean), {
          autoAlpha: 0,
          y: 10,
          duration: d.text,
          ease: "power2.in",
          stagger: 0.02,
        }, 0);
        if (ring) tl.to(ring, { autoAlpha: 0, scale: 1.25, duration: d.text * 1.5, ease: "power2.out" }, 0);

        // a. the ball squashes, hops, then serves off past the floor with a spin
        tl.to(ball, { scaleY: 0.85, duration: d.ball * 0.1, ease: "power2.in", transformOrigin: "50% 100%" }, 0)
          .to(ball, { scaleY: 1, y: -vh * P.ball.rise, duration: d.ball * 0.32, ease: "power2.out" }, d.ball * 0.1)
          .to(ball, { y: fall, duration: d.ball * 0.58, ease: P.ball.ease }, d.ball * 0.42)
          .to(ball, { rotation: P.ball.rotation, duration: d.ball * 0.9, ease: "none" }, d.ball * 0.1)
          .to(ball, { autoAlpha: 0, duration: d.ball * 0.22, ease: "power1.in" }, d.ball * 0.78);

        // b. the leaves swing apart and slide off — the page is live beneath
        tl.call(() => startRef.current(), [], tDoors);
        tl.to(doorL, { xPercent: -P.doors.travel, rotationY: P.doors.rotateY, duration: d.doors, ease: P.doors.ease }, tDoors)
          .to(doorR, { xPercent: P.doors.travel, rotationY: -P.doors.rotateY, duration: d.doors, ease: P.doors.ease }, tDoors);

        // hold a breath so the last frames aren't clipped
        tl.to({}, { duration: 0.05 }, ">");
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
      const root = scope.current;
      if (!root) return;
      const doorL = root.querySelector<HTMLElement>("[data-door-left]");
      const doorR = root.querySelector<HTMLElement>("[data-door-right]");
      const part = presetRef.current.hoverPart;
      // `x` (px) rides on top of the exit's xPercent, so the peek never
      // fights the open tween's values.
      if (doorL) gsap.to(doorL, { x: on ? -part : 0, duration: 0.5, ease: motion.ease, overwrite: "auto" });
      if (doorR) gsap.to(doorR, { x: on ? part : 0, duration: 0.5, ease: motion.ease, overwrite: "auto" });
    },
    [scope, motion.ease]
  );

  return useMemo(() => ({ open, skip, hover }), [open, skip, hover]);
}
