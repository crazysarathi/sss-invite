# Pickle & Pilates — Multi-theme Digital Invitation

A premium, interactive invitation website for **Pickle & Pilates with matcha
bar** — a wellness experience by **Salem Super Smashers × Gurkha Life × The
Tens Movement Lab × Cha Wellness** at Forest Hills Country Club, Salem.

Built as a **multi-theme invitation engine**: one content system, one reusable
component system, six completely different layout/type/motion themes — Elegant,
Editorial, Modern, Sporty, Tropical, Luxury — and eight colour palettes
(Blush, Ivory, Sage & Sky, Sky, Peach, Lavender, Midnight, Court Night) that
apply over any theme. Both switch live from the "Choose your colours" picker
(or `?theme=<id>&palette=<id>`). The site opens like a real invitation: a
sealed envelope with a 3D pickleball seal that you tap to open.

## Stack

- **React 18 + TypeScript (strict) + Vite 5**
- **Tailwind CSS 3** + shadcn/ui primitives, driven entirely by theme CSS variables
- **GSAP 3.13** — ScrollTrigger, ScrollSmoother, SplitText, ScrollTo (theme-aware motion)
- **Three.js + React Three Fiber + drei** — optional, lazy, procedural hero scenes per theme
- **lucide-react** icons, **sonner** toasts, self-hosted **@fontsource** fonts (lazy-loaded per theme)

## Commands

```bash
npm install          # Node 18+
npm run dev          # dev server
npm run build        # typecheck + production build (dist/)
npm run preview      # preview the build on :4173
npm run shoot -- all /tmp/shots        # visual QA: every theme, desktop + mobile (needs Chrome)
npm run placeholders                    # regenerate placeholder imagery
```

## Architecture

```
CONTENT (src/data)  →  THEME (src/themes)  →  REUSABLE COMPONENTS  →  INVITATION

src/
  data/
    siteData.ts          # ALL copy, dates, venue, schedule, RSVP config — single source of truth
    assets.ts            # image manifest (placeholders → replace files by name)
  themes/
    types.ts             # ThemeDefinition contract
    apply.ts             # tokens → CSS variables / data-attributes on <html>
    index.ts             # registry, default, URL/localStorage resolution
    palettes.ts          # colour palettes (second axis) + withPalette()
    elegant.ts editorial.ts modern.ts sporty.ts tropical.ts luxury.ts
  components/
    theme/               # ThemeProvider (switching choreography), ThemeTransition, ThemeSelector, ThemePreview
    invitation/          # OpeningScreen (+opening/ envelope), Hero, Welcome, EventDetails, Countdown, Experience, Story,
                         # Schedule, Gallery, Venue, RSVP, Closing (+ per-section variant folders), Invitation.tsx
    layout/              # Navbar (minimal / pill / bar), MobileMenu, BackToTop
    shared/              # SectionHeading, AnimatedText, ScrollReveal, ThemeImage, Surface, Kicker,
                         # Glyphs (BrandMark, paddle/mat/matcha/people), MagneticButton, Ticker, StatCounter, MediaLightbox
    three/               # models.tsx (procedural, recolorable), InvitationScene (per-theme hero scene), SealBall (opening)
    ui/                  # shadcn/ui primitives, token-driven
  hooks/                 # reduced-motion, media-query, in-viewport, countdown, active-section
  lib/                   # gsap registration, scroll helper, motion helpers, date/calendar, rsvp handler, confetti, cn()
docs/
  DESIGN.md              # engineering & design contract (read before building)
  THEMES.md              # how to add a theme / variant
scripts/
  shoot.mjs              # puppeteer visual QA
  make-placeholders.py   # placeholder imagery generator
```

## Key behaviors

- **Colour palettes** are independent of themes: picking a palette re-tokens every colour live (no remount, scroll untouched); picking a theme changes layout variants, type, shape, decor, motion and the opening preset.
- **Theme switching is deep**: colors, fonts (pairing + weights + case + tracking), fluid type scale, radii, borders, shadows, card style, image masks, patterns/ornaments/shapes/dividers, section *layouts* (every section has 2–6 variants), navigation style, opening choreography, animation personality (ease, durations, reveal style, text split, parallax, hover) and the optional 3D scene. Switching animates (each theme has its own transition), keeps the reader's section, and never reloads.
- **ScrollSmoother** runs on desktop fine pointers only; touch devices scroll natively. `position: fixed` must not be used inside `#smooth-content` — overlays portal to `document.body`.
- **Reduced motion** is respected globally: opening screen and heavy animation are skipped, all content is immediately visible.
- **3D** is lazy-loaded only for themes that use it, DPR-capped at 1.75, paused offscreen, simplified on coarse pointers, procedural only.
- **RSVP** has no backend by default (`rsvp.submission.mode = "mock"`); switch to `"formsubmit"` or `"endpoint"` in `siteData.ts` — see `src/lib/rsvp.ts`.
- **Images** are generated placeholders (`scripts/make-placeholders.py`). Replace files in `src/assets/invitation/` by name, or edit `src/data/assets.ts`.
- **Event date** is tentative (`event.dateStatus`): the countdown runs with a "tentative" note; set `"confirmed"` when final, or `"tba"` to hide the countdown.

## Editing content

Everything a client may change lives in `src/data/siteData.ts` — brand, hosts
and partners, event date/time/venue, navigation, opening/hero copy, welcome
letter, details, countdown copy, experience pillars, story, schedule,
gallery captions, venue facts, RSVP fields and copy, closing lines, social.
