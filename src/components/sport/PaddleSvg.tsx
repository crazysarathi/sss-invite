import { cn } from "@/lib/utils";

/**
 * The paddle from the client's third reference photo: a modern elongated
 * blade (rounded top, gently tapered sides, shoulders curving into a
 * throat), a bold accent edge guard, flowing line-art across the face and
 * a LONG wrapped handle with a flared butt cap. Painted from theme tokens.
 */
function PaddleShape() {
  return (
    <g>
      {/* long wrapped handle + butt cap (drawn first so the throat overlaps it) */}
      <g>
        <rect x="86" y="205" width="28" height="78" rx="9" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" strokeWidth="7" />
        {/* grip wrap */}
        <g stroke="rgb(var(--c-line-strong))" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          <path d="M88 226 L112 220" />
          <path d="M88 240 L112 234" />
          <path d="M88 254 L112 248" />
          <path d="M88 268 L112 262" />
        </g>
        {/* butt cap */}
        <rect x="81" y="281" width="38" height="16" rx="8" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" strokeWidth="7" />
      </g>

      {/* blade: elongated face, shoulders tapering into the throat */}
      <path
        d="M100 10
           C146 10 177 20 180 54
           C183 84 183 112 180 136
           C177 168 158 192 132 206
           C120 213 113 216 111 222
           L89 222
           C87 216 80 213 68 206
           C42 192 23 168 20 136
           C17 112 17 84 20 54
           C23 20 54 10 100 10 Z"
        fill="rgb(var(--c-primary))"
        stroke="rgb(var(--c-accent))"
        strokeWidth="9"
        strokeLinejoin="round"
      />

      {/* flowing line-art across the face (the reference's leaf-vein print) */}
      <g fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.3">
        <path d="M28 64 C70 52 122 44 172 38" />
        <path d="M24 92 C76 78 128 70 176 60" />
        <path d="M23 118 C80 104 134 94 177 86" />
        <path d="M26 144 C84 130 138 120 175 114" />
        <path d="M38 170 C92 156 142 146 168 142" />
        <path d="M58 194 C98 184 134 176 152 172" />
        <path d="M60 78 C96 100 128 110 170 116" />
      </g>
    </g>
  );
}

export function PaddleSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 302" aria-hidden="true" focusable="false" className={cn("block h-auto w-full", className)}>
      <PaddleShape />
    </svg>
  );
}
