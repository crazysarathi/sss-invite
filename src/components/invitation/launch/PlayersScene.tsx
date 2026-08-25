import { cn } from "@/lib/utils";

/**
 * The two players for the "Player launch" card — signboard pictograms
 * painted from theme tokens: a server mid-forehand on the left, a
 * receiver low in the ready stance on the right, a net between them on a
 * hairline baseline. Each figure and each paddle carries a data hook so
 * PartnerLaunch can rally the ball between them (the ball itself is a
 * separate element layered over this scene).
 *
 * Paddle groups are drawn around their own origin (the hand at 0,0) and
 * placed with a translate+rotate, so GSAP can swing them about the grip.
 */
const INK = "rgb(var(--c-primary))";
const LINE = "rgb(var(--c-accent))";

function Paddle({ x, y, rotate, ...rest }: { x: number; y: number; rotate: number; [key: `data-${string}`]: string | true }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} {...rest}>
      <rect x="-2.5" y="-13" width="5" height="14" rx="2" fill={INK} />
      <rect x="-8" y="-36" width="16" height="25" rx="8" fill={INK} stroke={LINE} strokeWidth="2.5" />
    </g>
  );
}

export function PlayersScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 130" aria-hidden="true" focusable="false" className={cn("block h-auto w-full overflow-visible", className)}>
      {/* baseline */}
      <line x1="8" y1="121" x2="232" y2="121" stroke={LINE} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />

      {/* the net: two posts, a tape and a hairline mesh */}
      <g stroke={LINE} strokeLinecap="round" opacity="0.85">
        <line x1="109" y1="84" x2="109" y2="121" strokeWidth="2.2" />
        <line x1="131" y1="84" x2="131" y2="121" strokeWidth="2.2" />
        <line x1="109" y1="85" x2="131" y2="85" strokeWidth="3" />
        <g strokeWidth="0.8" opacity="0.7">
          <line x1="109" y1="93" x2="131" y2="93" />
          <line x1="109" y1="100" x2="131" y2="100" />
          <line x1="109" y1="107" x2="131" y2="107" />
          <line x1="109" y1="114" x2="131" y2="114" />
          <line x1="114.5" y1="85" x2="114.5" y2="121" />
          <line x1="120" y1="85" x2="120" y2="121" />
          <line x1="125.5" y1="85" x2="125.5" y2="121" />
        </g>
      </g>

      {/* server — lunging forward, forehand through the ball */}
      <g data-player-left fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="42" cy="38" r="8" fill={INK} stroke="none" />
        <path d="M44 50 L37 82" />
        <path d="M37 82 L22 117" />
        <path d="M37 82 L54 98 L57 118" />
        <path d="M43 58 L27 71" />
        <path d="M43 58 L62 68 L76 58" />
        <Paddle x={76} y={58} rotate={35} data-paddle-left />
      </g>

      {/* receiver — low, wide, paddle up in both hands */}
      <g data-player-right fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="200" cy="44" r="8" fill={INK} stroke="none" />
        <path d="M200 56 L202 86" />
        <path d="M202 86 L187 102 L183 120" />
        <path d="M202 86 L217 104 L221 120" />
        <path d="M200 63 L183 70 L168 64" />
        <path d="M200 63 L186 78 L170 69" />
        <Paddle x={168} y={64} rotate={-35} data-paddle-right />
      </g>
    </svg>
  );
}
