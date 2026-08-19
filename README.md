# Pickle & Pilates — Digital Invitation

A simple, animated, single-page invitation for **Pickle & Pilates with Matcha
bar** — a wellness experience by **Salem Super Smashers × Gurkha Life × The
Tens Movement Lab × Cha Wellness** at Forest Hills Country Club, Salem.

The page contains exactly the content the hosts sent — title, "a wellness
experience", the four partners, the location, "date coming soon", "See our
Smashers in action" and a **Save your spot** form (the "collect database") —
and nothing else. One layout; the client chooses only the **colours**.

## What the client sees

1. **Opening** — a sealed envelope with a 3D pickleball as the wax seal. Tap it:
   the ball pops off and rolls away, the flap springs open, the card slides out
   and grows into the page.
2. **Hero** — the court lines draw themselves in, a 3D pickleball drops in and
   bounces to rest beside the title, the title springs up letter by letter.
   On scroll the ball rolls away with parallax.
3. **Details** — location (with directions), date (coming soon), what
   (pickleball · pilates · matcha bar, with looping glyphs) and "hosted by".
4. **See our Smashers in action** — the hosts' line beside a never-ending
   animated rally (paddles, net, ball arc, shadow, impact rings) + Instagram.
5. **Save your spot** — the guest form. Confetti on success.
6. **Footer** — sign-off, host crest, partners, Instagram, hashtag.
7. **Colours** (floating pill, bottom-left) — six pastel palettes grouped by the
   hosts' asks: *pink shades* (Blush, Rose), *ivory shades* (Ivory, Linen),
   *logo colours lightened* (Sky & Lime, Sage & Sky). Picking one re-colours the
   whole page live (`?palette=<id>` also works and the choice is remembered).

## Stack

- React 18 + TypeScript (strict) + Vite 5
- Tailwind CSS 3 + a few shadcn/ui primitives, driven entirely by CSS variables
- GSAP 3 — ScrollTrigger, ScrollSmoother, SplitText, DrawSVG, MotionPath
- Three.js + React Three Fiber — the procedural pickleball (lazy, 2 canvases)
- lucide-react icons, sonner toasts, self-hosted @fontsource fonts (Fraunces + Jost)

## Commands

```bash
npm install          # Node 18+
npm run dev          # dev server
npm run build        # typecheck + production build (dist/)
npm run preview      # preview the build on :4173
npm run shoot -- all /tmp/shots        # visual QA: every palette, desktop + mobile (needs Chrome)
```

## Structure

```
src/
  data/siteData.ts       # ALL copy, venue, links, form config — single source of truth
  themes/
    base.ts              # the one layout/type/shape/motion theme
    palettes.ts          # the six colour palettes (+ groups, withPalette)
    types.ts apply.ts index.ts
  components/
    theme/               # ThemeProvider (palette state, live morph), PalettePicker
    invitation/          # OpeningScreen (+opening/ envelope), Hero, Details, Action, RSVP (+rsvp/), Footer, Invitation
    sport/               # Court (hero backdrop), Rally (animated rally), PickleballSvg
    three/               # models (pickleball, float, lights), BallCanvas
    layout/              # TopBar, BackToTop
    shared/              # SectionHeading, AnimatedText, ScrollReveal, Surface, Kicker, Glyphs, MagneticButton, Ticker, LazyBoundary
    ui/                  # button, input, textarea, label, select, sonner
  hooks/ lib/            # media queries, reduced motion, in-viewport; gsap registration, scroll, motion, form submit, confetti
docs/DESIGN.md           # engineering contract (read before building)
scripts/shoot.mjs        # puppeteer visual QA
```

## Editing

- **Content** — `src/data/siteData.ts`. Date: set `event.dateStatus = "confirmed"`
  and fill `dateLabel` / `timeLabel` when the hosts confirm.
- **Colours** — add/adjust a palette in `src/themes/palettes.ts` (16 tokens, keep
  contrast); it appears in the picker automatically.
- **Form backend** — `rsvp.submission` in siteData (`mock` by default; `formsubmit`
  or your own `endpoint`), see `src/lib/rsvp.ts`.
- **Logos** — `src/assets/logos/`. The page has no photography by design.
