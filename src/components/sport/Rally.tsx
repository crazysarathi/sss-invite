import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { sound } from "@/lib/audio";
import { useInViewport } from "@/hooks/useInViewport";
import { useThemeMotion } from "@/components/theme/ThemeProvider";

/**
 * The rally — two paddles trading a pickleball over the net, forever.
 * Pure SVG painted from theme tokens + one GSAP timeline (MotionPath arc,
 * paddle swings timed to contact, a ground shadow that shrinks as the ball
 * climbs, an impact ring on every hit). Pauses offscreen; reduced motion
 * shows a single still frame mid-flight.
 */
const W = 600;
const H = 340;
const GROUND = 300;
const NET_X = 300;
const NET_H = 70;
const L = { x: 96, y: 212 };
const R = { x: 504, y: 212 };
const ARC = `M${L.x} ${L.y} Q${NET_X} 40 ${R.x} ${R.y}`;
const ARC_BACK = `M${R.x} ${R.y} Q${NET_X} 40 ${L.x} ${L.y}`;
const FLIGHT = 1.15;

function Paddle({ side }: { side: "left" | "right" }) {
  // Face up-left for the left paddle, mirrored for the right one.
  const flip = side === "right" ? -1 : 1;
  return (
    <g data-paddle={side}>
      <g transform={`translate(${side === "left" ? 60 : 540} 292) scale(${flip} 1)`}>
        {/* the big reference paddle at 0.44 scale: same blade proportions, long wrapped handle */}
        <rect x="-6.5" y="-44" width="13" height="48" rx="5" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" strokeWidth="2.4" />
        <g stroke="rgb(var(--c-line-strong))" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
          <path d="M-5 -32 L5 -35" />
          <path d="M-5 -22 L5 -25" />
          <path d="M-5 -12 L5 -15" />
        </g>
        <rect x="-9.5" y="2" width="19" height="7" rx="3.5" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" strokeWidth="2.4" />
        <g transform="rotate(-28 0 -44)">
          <path
            d="M0 -131
               C20 -131 34 -127 35 -112
               C36.5 -99 36.5 -86 35 -76
               C34 -62 25.5 -51 14 -45
               C9 -42 6 -41 5 -38
               L-5 -38
               C-6 -41 -9 -42 -14 -45
               C-25.5 -51 -34 -62 -35 -76
               C-36.5 -86 -36.5 -99 -35 -112
               C-34 -127 -20 -131 0 -131 Z"
            fill="rgb(var(--c-primary))"
            stroke="rgb(var(--c-accent))"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <g fill="none" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.3">
            <path d="M-28 -106 C-8 -112 12 -115 27 -117" />
            <path d="M-29 -92 C-6 -98 14 -100 28 -102" />
            <path d="M-27 -76 C-4 -82 14 -84 26 -86" />
            <path d="M-22 -58 C0 -64 14 -66 22 -68" />
          </g>
        </g>
      </g>
    </g>
  );
}

interface RallyProps {
  className?: string;
}

export function Rally({ className }: RallyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewport(ref, "120px");
  const motion = useThemeMotion();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const ball = root.querySelector<SVGGElement>("[data-ball]");
      const shadow = root.querySelector<SVGElement>("[data-shadow]");
      const ringL = root.querySelector<SVGElement>("[data-ring=left]");
      const ringR = root.querySelector<SVGElement>("[data-ring=right]");
      const padL = root.querySelector<SVGElement>("[data-paddle=left]");
      const padR = root.querySelector<SVGElement>("[data-paddle=right]");
      if (!ball || !shadow || !ringL || !ringR || !padL || !padR) return;

      if (prefersReducedMotion()) {
        // Still frame: ball near the apex, paddles at rest.
        gsap.set(ball, { x: NET_X - 40, y: 70 });
        gsap.set(shadow, { x: NET_X - 40, scaleX: 0.6, opacity: 0.18 });
        return;
      }

      gsap.set(ball, { x: L.x, y: L.y });
      gsap.set(shadow, { x: L.x, transformOrigin: "50% 50%" });
      gsap.set([ringL, ringR], { transformOrigin: "50% 50%", scale: 0.2, opacity: 0 });
      // Paddles pivot at the end of their handles (SVG user-space origins).
      gsap.set(padL, { svgOrigin: "60 300" });
      gsap.set(padR, { svgOrigin: "540 300" });

      // Backswing in the 0.3s before contact (for the left paddle that's the
      // tail of the previous loop — the timeline repeats seamlessly), the hit
      // at contact, then a slow return to rest.
      const swing = (paddle: SVGElement, dir: 1 | -1, backAt: number, hitAt: number, tl: gsap.core.Timeline) => {
        tl.to(paddle, { rotation: -22 * dir, duration: 0.26, ease: "power2.out" }, backAt)
          .fromTo(paddle, { rotation: -22 * dir }, { rotation: 34 * dir, duration: 0.16, ease: "power3.out" }, hitAt)
          .to(paddle, { rotation: 0, duration: 0.6, ease: motion.ease }, hitAt + 0.16);
      };
      // set() + to() rather than fromTo(): when the loop wraps, GSAP renders
      // later children at progress 0, and a fromTo would flash its "from"
      // state (a visible ring) until its own start time.
      const impact = (ring: SVGElement, ballScale: number, at: number, tl: gsap.core.Timeline) => {
        tl.set(ring, { scale: 0.2, opacity: 0.55 }, at)
          .to(ring, { scale: 1.6, opacity: 0, duration: 0.55, ease: "power2.out" }, at + 0.001)
          .set(ball, { scale: ballScale }, at)
          .to(ball, { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.5)", transformOrigin: "50% 50%" }, at + 0.001);
      };
      const shadowArc = (from: number, to: number, at: number, tl: gsap.core.Timeline) => {
        tl.fromTo(shadow, { x: from, scaleX: 1, opacity: 0.32 }, { x: to, duration: FLIGHT, ease: "none" }, at)
          .to(shadow, { scaleX: 0.55, opacity: 0.14, duration: FLIGHT / 2, ease: "sine.out" }, at)
          .to(shadow, { scaleX: 1, opacity: 0.32, duration: FLIGHT / 2, ease: "sine.in" }, at + FLIGHT / 2);
      };

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
      // left → right
      tl.to(ball, { motionPath: { path: ARC }, rotation: 360, duration: FLIGHT, ease: "none", transformOrigin: "50% 50%" }, 0);
      shadowArc(L.x, R.x, 0, tl);
      swing(padL, 1, FLIGHT * 2 - 0.3, 0, tl);
      impact(ringL, 1.25, 0, tl);
      // the paddle "pock" at each contact (0.001: a callback at exactly 0
      // would be skipped when the repeating timeline wraps)
      tl.call(() => sound.paddleHit(), [], 0.001);
      // right → left
      tl.to(ball, { motionPath: { path: ARC_BACK }, rotation: 720, duration: FLIGHT, ease: "none" }, FLIGHT);
      shadowArc(R.x, L.x, FLIGHT, tl);
      swing(padR, -1, FLIGHT - 0.3, FLIGHT, tl);
      impact(ringR, 1.25, FLIGHT, tl);
      tl.call(() => sound.paddleHit(), [], FLIGHT);
      // reset spin so it never grows unbounded
      tl.set(ball, { rotation: 0 }, FLIGHT * 2);
      tlRef.current = tl;
      return () => {
        tlRef.current = null;
      };
    },
    { scope: ref }
  );

  useGSAP(
    () => {
      const tl = tlRef.current;
      if (!tl) return;
      if (inView) tl.play();
      else tl.pause();
    },
    { dependencies: [inView] }
  );

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
        <defs>
          {/* light + shade overlaid on the chartreuse ball body */}
          <radialGradient id="pnp-rally-ball" cx="38%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="75%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
          </radialGradient>
          <pattern id="pnp-rally-mesh" width="7" height="7" patternUnits="userSpaceOnUse">
            <path d="M0 0 L7 7 M7 0 L0 7" stroke="rgb(var(--c-primary) / 0.4)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* court surface band + ground line */}
        <rect x="0" y={GROUND - 8} width={W} height="24" rx="12" fill="rgb(var(--c-secondary) / 0.18)" />
        <line x1="18" y1={GROUND} x2={W - 18} y2={GROUND} stroke="rgb(var(--c-line-strong))" strokeWidth="2" strokeLinecap="round" />
        {/* kitchen marks */}
        <line x1={NET_X - 110} y1={GROUND - 6} x2={NET_X - 110} y2={GROUND + 6} stroke="rgb(var(--c-line-strong))" strokeWidth="2" />
        <line x1={NET_X + 110} y1={GROUND - 6} x2={NET_X + 110} y2={GROUND + 6} stroke="rgb(var(--c-line-strong))" strokeWidth="2" />

        {/* net */}
        <rect x={NET_X - 2} y={GROUND - NET_H} width="4" height={NET_H} rx="2" fill="rgb(var(--c-primary))" />
        <rect x={NET_X - 70} y={GROUND - NET_H} width="140" height={NET_H} fill="url(#pnp-rally-mesh)" stroke="rgb(var(--c-primary) / 0.45)" strokeWidth="1" />
        <rect x={NET_X - 74} y={GROUND - NET_H - 3} width="148" height="6" rx="3" fill="rgb(var(--c-primary))" />

        {/* ground shadow */}
        <ellipse data-shadow cx="0" cy={GROUND - 2} rx="16" ry="5" fill="rgb(var(--c-overlay))" opacity="0.3" />

        {/* impact rings */}
        <circle data-ring="left" cx={L.x} cy={L.y} r="22" fill="none" stroke="rgb(var(--c-primary))" strokeWidth="2" />
        <circle data-ring="right" cx={R.x} cy={R.y} r="22" fill="none" stroke="rgb(var(--c-primary))" strokeWidth="2" />

        <Paddle side="left" />
        <Paddle side="right" />

        {/* the ball (at origin; GSAP translates it along the arc) */}
        <g data-ball>
          <circle r="13" fill="rgb(var(--c-accent))" />
          <circle r="13" fill="url(#pnp-rally-ball)" stroke="rgb(var(--c-overlay) / 0.18)" strokeWidth="1" />
          {/* recessed holes: lit rim below, dark hole above */}
          <g>
            {[
              [0, -6],
              [-5.5, -1],
              [5.5, -1],
              [-3, 6],
              [3, 6],
            ].map(([cx, cy]) => (
              <g key={`${cx},${cy}`}>
                <circle cx={cx} cy={cy + 0.5} r="1.7" fill="#ffffff" opacity="0.35" />
                <circle cx={cx} cy={cy} r="1.7" fill="rgb(var(--c-overlay))" opacity="0.55" />
              </g>
            ))}
          </g>
          <ellipse cx="-4.5" cy="-6.5" rx="3" ry="1.8" fill="#ffffff" opacity="0.45" transform="rotate(-30 -4.5 -6.5)" />
        </g>
      </svg>
    </div>
  );
}
