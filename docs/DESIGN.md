# Pickle & Pilates — Design & Engineering Contract

Binding rules for building any part of the invitation. Read fully before
writing code.

```
CONTENT (src/data)  →  THEME (src/themes: ONE base theme × COLOUR PALETTES)  →  COMPONENTS  →  INVITATION
```

There is **one layout/type/motion theme** (`src/themes/base.ts`) and **six colour
palettes** (`src/themes/palettes.ts`). The client only ever switches colours.
A palette must never require touching a component.

---

## 1. Layers

| Layer | Path | Rule |
| --- | --- | --- |
| Content | `src/data/siteData.ts` | ALL copy, venue, links, form config. Components never hard-code event content. The page carries only the content the hosts sent. |
| Theme | `src/themes/base.ts` | Pure data (`ThemeDefinition`): type, shape, layout spacing, decor flags, motion, 3D palette. |
| Palette | `src/themes/palettes.ts` | Colour-only (`PaletteDefinition`: 16 tokens + a `group`). `resolveTheme(palette)` → the resolved theme; `useTheme().theme` is ALWAYS resolved. |
| Components | `src/components/**` | Read content + `useTheme()`. Style via **tokens** (Tailwind utilities / `.t-*` classes) — never hard-code colours. |

Palette switch = `ThemeProvider.setPalette(id)`: `<html>` gets `.palette-morph`
(CSS cross-fade of colour properties only), tokens are rewritten, class removed.
Nothing remounts; scroll is untouched.

---

## 2. Theme access

```ts
import { useTheme, useThemeMotion, useThemeLayout } from "@/components/theme/ThemeProvider";
const { theme, palette, palettes, setPalette } = useTheme();
const motion = useThemeMotion();   // ease, easeInOut, easeSpring, duration, stagger, distance, reveal, text, parallax, scrub, hover, smooth
```

Never hard-code colours (rgba literals) — use `rgb(var(--c-…) / a)` so palettes recolour them. This includes SVG fills/strokes (see `components/sport/*`).

---

## 3. Design tokens (Tailwind utilities — use these, never raw colours)

- **Colours**: `bg-page` `bg-page-alt` `bg-surface` `bg-surface-2` · `text-fg` `text-fg-muted` (smallest token for REAL text — ≥4.5:1) `text-fg-subtle` (decorative micro-labels only) ·
  `bg-primary text-primary-foreground` · `bg-secondary text-secondary-foreground` · `bg-accent` `text-accent` ·
  `border-line` `border-line-strong` · `bg-overlay/60` · `text-destructive`. Opacity modifiers work everywhere.
- **Type**: `.t-display` (Cormorant; `<em>` inside = italic accent, e.g. the "&") + `text-display-xl|lg|md|sm`; `.t-script` (Great Vibes — sign-offs and the "with Matcha bar" line only, never labels); `.t-accent` (Cormorant small caps, tracked — kickers, labels, buttons), `.t-kicker`, `.t-label`; body is Jost (forms, paragraphs).
- **Shape**: `rounded-card` `rounded-btn` `rounded-img` `rounded-field` `rounded-pill` · `border-theme` · `shadow-card` `shadow-float` `shadow-btn`.
- **Layout**: `.section-shell` (max-w + gutter + section-y), `.section-shell-x`, `max-w-shell`, `px-gutter`.
- **Motion (CSS)**: `duration-micro|base|slow`, `ease-theme`; keyframes `marquee`, `pulse-dot`, `float`, `scroll-line`.
- **Helpers**: `.t-surface` (paper card — or `<Surface>`), `.t-paper` (paper grain on a section ground), `.t-frame` (double hairline frame + corner florets — use `<Frame>`), `.t-hover`, `.t-ornament`, `.t-pattern` (the "court" grid), `.t-underline`.

---

## 4. Shared components (use them, don't reinvent)

- `SectionHeading`, `AnimatedText` (SplitText, follows `motion.text`), `ScrollReveal`, `Surface`, `Kicker`, `MagneticButton`, `Ticker`, `LazyBoundary`
- Stationery (`components/stationery`): `Watercolor` (procedural wash, `variant` a/b/c — one per section, multiply-blended), `CornerBotanicals` / `Sprig` (generated line-art foliage, swaying), `Monogram` (P&P in a laurel wreath), `Flourish` (divider, `center` ball/dot), `Frame`, `TornCard` (deckled paper, `seed`). All painted from tokens — a palette re-tints everything.
- Sport: `Court` (perspective court, `[data-court-line]` for DrawSVG), `Rally` (self-contained loop), `PickleballSvg`
- 3D: `three/BallCanvas` (lazy; props `palette`, `spin`, `float`, `active`, `radius`) over `three/models` (`Pickleball`, `FloatGroup`, `SceneLights`)
- Glyphs: `PaddleGlyph`, `MatGlyph`, `MatchaGlyph`, `PeopleGlyph`, `BallGlyph`, `BrandMark`; icons otherwise `lucide-react` only
- shadcn/ui: `Button` (default, secondary, outline, ghost, inverse, link; sm/default/lg/icon), `Input`, `Textarea`, `Label`, `Select…`, `Toaster`/`toast`

---

## 5. Hard engineering rules

1. **Imports**: `@/` → `src/`. GSAP ONLY from `@/lib/gsap` (`gsap`, `ScrollTrigger`, `ScrollSmoother`, `SplitText`, `DrawSVGPlugin`, `MotionPathPlugin`, `useGSAP`). Animations inside `useGSAP(() => {…}, { scope: ref })`.
2. **ScrollSmoother is active on desktop** (fine pointer): `position: fixed` DOES NOT WORK inside `#smooth-content`. Overlays → `createPortal(…, document.body)`. In-page anchors → `scrollToSection(hash)` from `@/lib/scroll`.
3. **Reduced motion**: check `prefersReducedMotion()` and skip/flatten — every animated thing must read fully with motion off (Rally shows a still frame, the 3D ball becomes `PickleballSvg`). Elements animated in on boot carry `data-reveal` AND animate with `autoAlpha`.
4. **Theme-aware motion**: ease/duration/stagger/distance from `useThemeMotion()`; `revealVars()` / `textVars()` from `@/lib/motion` for custom timelines. Scrubs use `scrub: motion.scrub`. Reveals are `once: true` unless scrubbed.
5. **Looping animations** (rally, glyph idles, floats): pause when offscreen (`useInViewport`) or keep them transform/opacity only; inside repeating timelines prefer `set()+to()` over `fromTo()` for later children (a `fromTo` flashes its from-state on loop wrap).
6. **Three.js**: only in `components/three/*`, `React.lazy` + `<Suspense>` + `LazyBoundary`, `dpr={[1, 1.75]}`, frameloop `"never"` offscreen / `"demand"` under reduced motion, fewer holes on coarse pointers, colours from `theme.three.palette`. No drei, no external assets.
7. **Accessibility**: semantic elements, real `<button>`/`<a>`, ≥44px touch targets, `aria-hidden` on decor, visible focus, dialogs close on Escape and restore focus.
8. **TypeScript strict** — no `any`, no unused vars.
9. External links: `target="_blank" rel="noopener noreferrer"`.
10. z-index bands: content ≤ 40, back-to-top 60, top bar 70, opening screen 100, colour picker 104–105, skip link 130.
11. **Responsive**: design 360 / 390 / 430 / 768 / 1024 / 1440 intentionally. Nothing may widen the mobile layout (grid children get `min-w-0`; buttons never exceed the viewport).
12. **Copy**: the page never says "RSVP" — the form is "Save your spot" / "Join us" (`siteData.rsvp.id = "register"`).

## Opening screen contract

`OpeningScreen({ onOpen, onComplete })` (rendered by App outside the smoother):
a sealed envelope with a 3D pickleball seal. `onOpen()` fires when the exit
starts (hero + top bar entrances overlap it), `onComplete()` when it has fully
left. Reduced motion → both fire immediately, nothing renders. Tempo lives in
`opening/presets.ts` (`OPENING_PRESET`).

## Section IDs (must match exactly)

`hero`, `hosts`, `details`, `action`, `register`, `footer`.

## Motion grammar

- Entrances `motion.ease`; scroll moves `motion.easeInOut`; sporty beats (bounces, swings, card "serves") `motion.easeSpring` / `bounce.out` / `back.out`.
- One hero moment per section: hero = card settles + ball drop + court draw; hosts = names stagger; details = torn cards serve in; action = the rally (print tilts in); register = confetti on success.
- Stationery rule: every section is a **card on a wash** — `t-paper` ground + `<Watercolor>` + one or two `<CornerBotanicals>`, content centred in a portrait card (`max-w` 34–40rem). Desktop is the same card, larger, with the wash filling the viewport (the reference sites are portrait-first too).
- Support animations stay subtle; the client is comparing colours, not motion.
