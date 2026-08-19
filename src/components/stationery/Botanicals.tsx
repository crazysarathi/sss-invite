import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Botanical line-art, generated: an olive / eucalyptus sprig — a softly
 * curved stem with alternating leaves — painted from tokens. A few sprigs
 * fanned at a section corner make the watercolour backdrops feel like
 * stationery. Sway is a tiny CSS rotation from the stem base.
 */
interface SprigProps {
  className?: string;
  /** Number of leaf pairs. */
  leaves?: number;
  /** Mirror the curve. */
  flip?: boolean;
  /** Deterministic variation. */
  seed?: number;
  /** "line" = outlined leaves, "fill" = tinted leaves. */
  style?: "line" | "fill";
}

const W = 100;
const H = 260;

function sprigGeometry(leaves: number, seed: number, flip: boolean) {
  // stem: from bottom centre, bending to one side
  const bend = (18 + (seed % 5) * 4) * (flip ? -1 : 1);
  const stem = `M${W / 2} ${H} Q${W / 2 + bend} ${H * 0.55} ${W / 2 + bend * 0.6} 8`;
  // leaves along the stem (quadratic bezier sample)
  const pts: Array<{ x: number; y: number; a: number; s: number; side: 1 | -1 }> = [];
  for (let i = 0; i < leaves * 2; i++) {
    const t = 0.12 + (0.82 * i) / (leaves * 2 - 1);
    const x = (1 - t) * (1 - t) * (W / 2) + 2 * (1 - t) * t * (W / 2 + bend) + t * t * (W / 2 + bend * 0.6);
    const y = (1 - t) * (1 - t) * H + 2 * (1 - t) * t * (H * 0.55) + t * t * 8;
    const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
    // tangent angle of the stem at t
    const dx = 2 * (1 - t) * (W / 2 + bend - W / 2) + 2 * t * (W / 2 + bend * 0.6 - (W / 2 + bend));
    const dy = 2 * (1 - t) * (H * 0.55 - H) + 2 * t * (8 - H * 0.55);
    const tangent = (Math.atan2(dy, dx) * 180) / Math.PI;
    const a = tangent + side * (48 + ((seed * 7 + i * 13) % 14));
    const s = 1 - t * 0.55; // leaves shrink toward the tip
    pts.push({ x, y, a, s, side });
  }
  return { stem, pts };
}

export function Sprig({ className, leaves = 6, flip = false, seed = 1, style = "line" }: SprigProps) {
  const { stem, pts } = useMemo(() => sprigGeometry(leaves, seed, flip), [leaves, seed, flip]);
  const stroke = "rgb(var(--c-fg-muted) / 0.55)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false" className={cn("block h-auto w-full", className)}>
      <path d={stem} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.s})`}>
          <path
            d="M0 0 C 10 -9, 26 -9, 34 0 C 26 9, 10 9, 0 0 Z"
            fill={style === "fill" ? "rgb(var(--c-secondary) / 0.55)" : "rgb(var(--c-surface) / 0.5)"}
            stroke={stroke}
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
          />
          <path d="M2 0 L30 0" fill="none" stroke={stroke} strokeWidth="0.7" vectorEffect="non-scaling-stroke" opacity="0.8" />
        </g>
      ))}
      {/* a few olive-like buds near the tip */}
      <circle cx={W / 2 + (flip ? -1 : 1) * 10} cy={26} r="3.2" fill="rgb(var(--c-accent) / 0.8)" />
      <circle cx={W / 2 + (flip ? -1 : 1) * 4} cy={16} r="2.4" fill="rgb(var(--c-accent) / 0.7)" />
    </svg>
  );
}

interface CornerBotanicalsProps {
  /** Which corner of the parent the cluster grows from. */
  corner: "tl" | "tr" | "bl" | "br";
  className?: string;
  size?: string;
  style?: "line" | "fill";
}

/** Three sprigs fanned from a corner, gently swaying. Parent must be `relative overflow-hidden`. */
export function CornerBotanicals({ corner, className, size = "clamp(9rem, 22vw, 18rem)", style = "line" }: CornerBotanicalsProps) {
  const top = corner.startsWith("t");
  const left = corner.endsWith("l");
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute",
        top ? "-top-[6%]" : "-bottom-[6%]",
        left ? "-left-[3%]" : "-right-[3%]",
        className
      )}
      style={{ width: size, height: `calc(${size} * 1.35)` }}
    >
      <div
        className="relative h-full w-full"
        style={{ transform: `${top ? "scaleY(-1)" : ""} ${left ? "" : "scaleX(-1)"}`.trim() || undefined }}
      >
        <div className="absolute bottom-0 left-[8%] w-[46%] origin-bottom animate-sway">
          <Sprig leaves={6} seed={2} style={style} />
        </div>
        <div className="absolute bottom-0 left-[30%] w-[54%] origin-bottom animate-sway [animation-delay:-1.6s]">
          <Sprig leaves={7} seed={5} flip style={style} />
        </div>
        <div className="absolute bottom-[2%] left-[0%] w-[40%] origin-bottom animate-sway [animation-delay:-3.1s]">
          <Sprig leaves={5} seed={9} flip style={style} />
        </div>
      </div>
    </div>
  );
}
