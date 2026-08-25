# Pickle & Pilates — Digital Invitation

A simple, animated, single-page invitation for **Pickle & Pilates with Matcha
& Ube bar** — a private, ticketed experience by **Salem Super Smashers × Gurkha Life ×
The Tens Movement Lab × Cha Wellness** at Forest Hills Country Club, Salem, on
**29th August, Saturday**.

The page contains exactly the content the hosts sent — title, "a wellness
experience", the four partners, the location, the date, "See our Smashers in
action" and a **Save your spot** form (the "collect database") — and nothing
else. One layout, one fixed colour scheme (the wisteria court palette).

**Mood:** classic invitation stationery (reference: wedding-invitation sites such
as invitationmedia.in / thedigitalyes.com) — portrait paper cards on soft
watercolour washes with courtside sketches, the hosts' crest as the monogram,
hairline frames with corner florets, torn-paper cards, Cormorant serif + Great
Vibes script + Cormorant small caps — crossed with the sport: a court, a 3D
pickleball, paddles and a rally. Washes, frames and ornaments are generated from
the theme tokens (the crest is the one fixed image asset, a transparent SVG).

## What the client sees

1. **Opening** — two paper gate doors sealed at the seam by the 3D pickleball
   in a ring medallion, on a watercolour backdrop. Tap: the ball serves off
   with a spin and the doors swing apart to reveal the page.
2. **Hero — the invitation card** — a framed paper card: the hosts' crest,
   "You're invited to", *Pickle & Pilates*, "with Matcha & Ube bar" in script,
   flourish, "A Private, Ticketed Experience", the four hosts, "Save the date · 29th
   August, Saturday", venue, buttons. Behind it the court lines draw themselves
   in; a 3D pickleball drops and bounces to rest on the card's corner; the
   title springs up letter by letter. On scroll the ball rolls away and the
   card lifts.
3. **Hosts** — "Four partners. One morning." · Introducing *the hosts*: the four
   names on a torn-paper ledger.
4. **Details** — three torn-paper cards: location (directions), date (29th
   August, Saturday), what (pickleball · pilates · Matcha & Ube bar, with
   looping glyphs).
5. **See our Smashers in action** — the hosts' line beside the never-ending rally
   (paddles, net, ball arc, shadow, impact rings) mounted like a taped storyboard
   print, + Instagram.
6. **Save your spot** — an arch-topped card with the monogram, then the guest
   form. Confetti on success.
7. **Footer** — script sign-off, closing lines, host crest, partners, directions,
   Instagram, hashtag.

Colours are **fixed** to the single wisteria palette (lavender & court sage
with the chartreuse ball as accent, sampled from the hosts' court photo) —
the colour picker was removed on the client's request.

## Stack

- React 18 + TypeScript (strict) + Vite 5
- Tailwind CSS 3 + a few shadcn/ui primitives, driven entirely by CSS variables
- GSAP 3 — ScrollTrigger, ScrollSmoother, SplitText, DrawSVG, MotionPath
- Three.js + React Three Fiber — the procedural pickleball (lazy, 2 canvases)
- lucide-react icons, sonner toasts, self-hosted @fontsource fonts (Cormorant, Cormorant SC, Great Vibes, Jost)

## Commands

```bash
npm install          # Node 18+
npm run dev          # dev server
npm run build        # typecheck + production build (dist/)
npm run preview      # preview the build on :4173
npm run shoot -- wisteria /tmp/shots   # visual QA: desktop + mobile screenshots (needs Chrome)
npm run og           # regenerate public/og-image.png after content changes (needs Chrome)
```

## Structure

```
src/
  data/siteData.ts       # ALL copy, venue, links, form config — single source of truth
  themes/
    base.ts              # the one layout/type/shape/motion theme
    palettes.ts          # the single fixed wisteria palette (withPalette)
    types.ts apply.ts index.ts
  components/
    theme/               # ThemeProvider (applies the fixed palette)
    invitation/          # OpeningScreen (+opening/ gate doors), Hero, Hosts, Details, Action, RSVP (+rsvp/), Footer, Invitation
    stationery/          # Watercolor (procedural wash), Botanicals (unused), Ornaments (Monogram = the crest, Flourish, Frame, TornCard)
    sport/               # Court (hero backdrop), Rally (animated rally), PickleballSvg, PaddleSvg
    three/               # models (pickleball, float, lights), BallCanvas
    layout/              # TopBar, BackToTop
    shared/              # SectionHeading, AnimatedText, ScrollReveal, Surface, Kicker, Glyphs, MagneticButton, Ticker, LazyBoundary
    ui/                  # button, input, textarea, label, select, sonner
  hooks/ lib/            # media queries, reduced motion, in-viewport; gsap registration, scroll, motion, form submit, confetti
docs/DESIGN.md           # engineering contract (read before building)
scripts/shoot.mjs        # puppeteer visual QA
scripts/og.mjs           # regenerates public/og-image.png (keep copy in sync with siteData)
```

## Editing

- **Content** — `src/data/siteData.ts`. Date is confirmed ("29th August,
  Saturday"); fill `timeLabel` if the hosts share a time. After copy changes,
  also update `index.html`'s meta/JSON-LD and run `npm run og`.
- **Colours** — the single wisteria palette in `src/themes/palettes.ts` (16
  tokens, keep contrast). There is no picker; the scheme is fixed.
- **Form backend** — `rsvp.submission` in siteData (`mock` by default; `formsubmit`
  or your own `endpoint`), see `src/lib/rsvp.ts`.
- **Logos** — `src/assets/logos/`. The page has no photography by design.
