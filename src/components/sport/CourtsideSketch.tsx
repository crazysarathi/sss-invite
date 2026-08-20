import { cn } from "@/lib/utils";
import { PaddleSvg } from "./PaddleSvg";
import { BALL_HOLES, holeSquash } from "./PickleballSvg";

/**
 * Courtside art for the hero's flanks — the reference paddle swaying on
 * the left, wiffle balls drifting along dotted flight trails on the
 * right — painted from tokens. Motion is pure CSS (sway / float / slow
 * spin / trail dashes drifting), so the global reduced-motion rule stills
 * everything.
 */

const INK = "rgb(var(--c-primary) / 0.5)";
const INK_SOFT = "rgb(var(--c-primary) / 0.35)";
/** Chartreuse wash — the reference photo's ball colour, kept airy. */
const BALL_WASH = "rgb(var(--c-accent) / 0.28)";

function SketchBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={cn("block h-auto w-full", className)}>
      <circle cx="50" cy="50" r="46" fill={BALL_WASH} stroke={INK} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      {/* wiffle holes — outlined, foreshortened along the sphere's curve like the solid ball's */}
      <g fill={INK_SOFT} stroke={INK} strokeWidth="1.3">
        {BALL_HOLES.map(({ x, y, r }) => {
          const { k, angle } = holeSquash(x, y);
          return (
            <ellipse
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              rx={r * 1.15 * k}
              ry={r * 1.15}
              transform={`rotate(${angle.toFixed(1)} ${x} ${y})`}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>
    </svg>
  );
}

function Trail({ d, className }: { d: string; className?: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={INK_SOFT}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="1 10"
      className={cn("animate-dash-drift", className)}
    />
  );
}

interface CourtsideSketchesProps {
  /** Swap flanks: paddle on the right, balls on the left. Alternate per section. */
  flip?: boolean;
  /** "full" = hero scale; "light" = smaller and airier, for content sections. */
  density?: "full" | "light";
}

/**
 * Both flanks, absolutely positioned inside a section (parent must be
 * `relative overflow-hidden`). Sits behind the content; pointer-transparent.
 * Static transforms live on outer wrappers, CSS animations on inner ones,
 * so the animation's `transform` never cancels the placement. Flipping
 * mirrors each flank with scaleX(-1) — safe, it's all abstract line-art.
 * The balls flank keeps its viewBox's aspect ratio (aspect-[320/460]), so
 * the dotted trails never distort with the viewport.
 */
export function CourtsideSketches({ flip = false, density = "full" }: CourtsideSketchesProps) {
  const full = density === "full";
  return (
    <>
      {/* paddle flank, with a small ball skipping past its feet */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 z-0",
          full ? "w-[clamp(8rem,21vw,19rem)]" : "w-[clamp(5.5rem,12vw,10rem)]",
          flip ? "right-0 -scale-x-100" : "left-0"
        )}
      >
        <div className="absolute -left-[16%] top-1/2 w-[78%] -translate-y-1/2 -rotate-[22deg]">
          <div className="origin-[50%_78%] animate-sway [animation-duration:9s]">
            <PaddleSvg className="opacity-80" />
          </div>
        </div>
        <svg viewBox="0 0 140 60" aria-hidden="true" focusable="false" className="absolute bottom-[4%] left-[4%] w-[70%] overflow-visible">
          <Trail d="M4 12 Q70 62 136 16" />
        </svg>
        <div className="absolute bottom-[8%] left-[46%] w-[30%] animate-float [animation-duration:8s] [animation-delay:-3s]">
          <div className="animate-spin-slow [animation-duration:26s]">
            <SketchBall />
          </div>
        </div>
      </div>

      {/* balls flank — a rally arcing down the edge */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 z-0 aspect-[320/460] -translate-y-1/2",
          full ? "w-[clamp(8rem,22vw,20rem)]" : "w-[clamp(6rem,13vw,11rem)]",
          flip ? "left-0 -scale-x-100" : "right-0"
        )}
      >
        <svg viewBox="0 0 320 460" aria-hidden="true" focusable="false" className="absolute inset-0 h-full w-full overflow-visible">
          <Trail d="M334 20 C260 60 236 130 244 210 C252 292 226 352 150 384" />
          <Trail d="M120 128 Q180 158 246 122" className="[animation-duration:9s]" />
          {full && <Trail d="M10 292 Q66 322 128 296" className="[animation-duration:11s]" />}
        </svg>
        <div className="absolute right-[14%] top-[2%] w-[34%] animate-float [animation-duration:7s]">
          <div className="animate-spin-slow [animation-duration:22s]">
            <SketchBall />
          </div>
        </div>
        {full && (
          <div className="absolute left-[4%] top-[42%] w-[26%] animate-float [animation-duration:8.5s] [animation-delay:-2s]">
            <div className="animate-spin-slow [animation-duration:28s] [animation-direction:reverse]">
              <SketchBall />
            </div>
          </div>
        )}
        <div className="absolute right-[8%] bottom-[4%] w-[42%] animate-float [animation-duration:9.5s] [animation-delay:-4.5s]">
          <div className="animate-spin-slow [animation-duration:32s]">
            <SketchBall />
          </div>
        </div>
      </div>
    </>
  );
}
