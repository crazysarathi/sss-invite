# Pickle & Pilates — Design & Engineering Contract

Binding rules for building any part of the invitation. Read fully before
writing code. The project is a **multi-theme invitation engine**:

```
CONTENT (src/data)  →  THEME (src/themes)  →  REUSABLE COMPONENTS  →  INVITATION
```

One content system, one component system, six visually different themes
(elegant · editorial · modern · sporty · tropical · luxury) and, independently,
eight **colour palettes** (blush · ivory · sage & sky · sky · peach · lavender ·
midnight · court night) that can be applied over any theme. A new theme or
palette must never require rewriting a section.

---

## 1. Layers — what lives where

| Layer | Path | Rule |
| --- | --- | --- |
| Content | `src/data/siteData.ts`, `src/data/assets.ts` | ALL copy, dates, links, images. Components never hard-code event content or image files. |
| Theme | `src/themes/*.ts` | Pure data (`ThemeDefinition` in `types.ts`). Tokens → CSS vars; layout variant selectors; decor flags; motion; optional 3D. |
| Palette | `src/themes/palettes.ts` | Colour-only overrides (`PaletteDefinition`). `withPalette(theme, palette)` resolves the theme; `useTheme().theme` is ALWAYS the resolved theme. Colour switches re-token live (no remount); theme switches remount the invitation tree. |
| Components | `src/components/**` | Read content + `useTheme()`. Present per theme via **tokens** (Tailwind utilities / `.t-*` classes) and **variant maps** — never `if (theme.id === "x")`. |

---

## 2. Theme access

```ts
import { useTheme, useThemeMotion, useThemeLayout } from "@/components/theme/ThemeProvider";
const { theme, palette, setTheme, setPalette, resolve } = useTheme(); // theme = resolved (style × palette)
const motion = useThemeMotion();       // ease, duration, stagger, reveal, text, parallax, hover…
const layout = useThemeLayout();       // per-section variant selectors
```

Never hard-code colours (rgba literals) in theme decor/shadow strings — use
`rgb(var(--c-…) / a)` so palettes recolor them.

**Variant dispatch pattern (required for sections with layout variants):**

```tsx
const VARIANTS: Record<HeroVariant, ComponentType<HeroProps>> = {
  centered: HeroCentered, cinematic: HeroCinematic, split: HeroSplit, poster: HeroPoster, editorial: HeroEditorial,
};
export function Hero(props) { const V = VARIANTS[useThemeLayout().hero]; return <V {...props} />; }
```

Variants may share sub-pieces. Keep each variant genuinely different in
composition — tokens already handle color/type/radius, so a variant is about
**layout, image treatment, hierarchy and choreography**.

Themes → variants (from `src/themes/*.ts`):

| Section | elegant | editorial | modern | sporty | tropical | luxury |
| --- | --- | --- | --- | --- | --- | --- |
| opening (envelope preset) | veil | masthead | panels | slam | bloom | curtain |
| hero | centered | editorial | split | poster | split | cinematic |
| nav | minimal | minimal | pill | bar | pill | minimal |
| countdown | thin | thin | blocks | blocks | rings | cinematic |
| details | strip | strip | cards | cards | cards | strip |
| experience | list | editorial | grid | grid | grid | editorial |
| story | centered | editorial | split | split | split | centered |
| schedule | timeline | ledger | cards | cards | timeline | timeline |
| gallery | salon | editorial | mosaic | accordion | collage | fullbleed |
| venue | split | split | split | fullbleed | split | fullbleed |
| rsvp | centered | centered | split | split | split | poster |
| closing | centered | centered | centered | poster | centered | poster |
| three.hero | none | none | orbs | ball | none | particles |

---

## 3. Design tokens (Tailwind utilities — use these, never raw colors)

- **Colors**: `bg-page` `bg-page-alt` `bg-surface` `bg-surface-2` · `text-fg` `text-fg-muted` (smallest token for REAL text — ≥4.5:1) `text-fg-subtle` (decorative micro-labels only, fails AA) ·
  `bg-primary text-primary-foreground` · `bg-secondary text-secondary-foreground` · `bg-accent` `text-accent` ·
  `border-line` `border-line-strong` · `bg-overlay/60` (image tints) · `text-destructive`.
  Opacity modifiers work everywhere: `bg-primary/10`, `border-line/50`.
- **Type**: `.t-display` (display family/weight/tracking/case/leading from theme) + size `text-display-xl|lg|md|sm`;
  `.t-accent` (kicker/label voice) ; `.t-kicker` ; `.t-label` ; body is default (`font-body`).
  Wrap emphasised display words in `<em>` — themes with `italicAccent` render them italic, others plain.
- **Shape**: `rounded-card` `rounded-btn` `rounded-img` `rounded-field` `rounded-sm|md|lg` `rounded-pill` ; `border-theme` (theme border width) ;
  `shadow-card` `shadow-float` `shadow-btn`.
- **Layout**: `.section-shell` (max-w + gutter + section-y), `.section-shell-x` (no vertical padding), `max-w-shell`, `px-gutter`, `py-section-y`.
- **Motion (CSS)**: `duration-micro|base|slow`, `ease-theme`.
- **Themed helpers** (index.css): `.t-surface` (card — or use `<Surface>`), `.t-hover`, `.t-photo`/`.t-mask` (or use `<ThemeImage>`),
  `.t-ornament`, `.t-pattern` (background pattern layer), `.t-shapes` (large decorative shapes), `.t-divider`, `.t-underline`.
  Drop `<div className="t-pattern" aria-hidden="true" />` / `<div className="t-shapes" aria-hidden="true" />` inside a
  `relative overflow-hidden` section to get the theme's decoration for free (renders nothing where the theme says none).

Do NOT use the old SSS tokens (`night`, `royal`, `lime`, `ink`, `font-condensed`, `glass-panel`, `kicker`, `display-title`). They no longer exist.

---

## 4. Shared components (use them, don't reinvent)

- `SectionHeading` (`kicker?`, `title` (string | markup with `<em>`), `lead?`, `align?`, `size?`, `folio?`, `as?`)
- `AnimatedText` — SplitText reveal following the theme's split; `split` / `trigger="mount"` / `delay` / `onComplete`
- `ScrollReveal` — theme reveal (fade/rise/slide/scale/clip/blur); `style`, `from`, `staggerChildren`, `trigger="mount"`
- `ThemeImage` (`image: ImageAsset`, `ratio?`, `mask?`, `overlay?`, `priority?`, `position?`, `imgRef?`) — ALL photography goes through this
- `Surface` (`hover?`, `tone?`) — the themed card
- `Kicker` (`ornament?`) — small label with themed ornament
- `MagneticButton` — wrap primary CTAs (desktop only, inert on touch/reduced motion)
- `Ticker`, `StatCounter`, `BlurText`, `MediaLightbox`
- shadcn/ui: `Button` (variants: default, secondary, outline, ghost, inverse, link; sizes default/sm/lg/icon), `Badge` (outline, default, secondary, soft, accent), `Input`, `Textarea`, `Label`, `Select…`, `Card…`, `Separator`, `Dialog…`, `Toaster`/`toast` (sonner)
- Icons: `lucide-react` only, plus the invitation glyphs in `@/components/shared/Glyphs` (`PaddleGlyph`, `MatGlyph`, `MatchaGlyph`, `PeopleGlyph`, `BrandMark`).

Content: `import { hero, event, … } from "@/data/siteData"`; dates via `@/lib/date` (`formatEventDate`, `eventDateParts`, `eventTime`, `buildCalendarFile`); countdown via `useCountdown(eventTime())`.

---

## 5. Hard engineering rules

1. **Imports**: `@/` → `src/`. GSAP ONLY from `@/lib/gsap` (`gsap`, `ScrollTrigger`, `ScrollSmoother`, `SplitText`, `useGSAP`). Animations inside `useGSAP(() => {…}, { scope: ref })`.
2. **Named exports** exactly as imported by `Invitation.tsx` / `App.tsx`.
3. **ScrollSmoother is active on desktop** (fine pointer): `position: fixed` DOES NOT WORK inside sections. Full-screen overlays → `createPortal(…, document.body)`. In-page anchors → `scrollToSection(hash)` from `@/lib/scroll`.
4. **Reduced motion**: check `prefersReducedMotion()` (`@/lib/utils`) and skip/flatten. Content must be fully readable with animations off. Elements you animate in carry `data-reveal` AND are animated with `autoAlpha` (CSS hides `[data-reveal]` pre-boot only when motion is allowed). Never leave content hidden waiting for an animation that won't run.
5. **Theme-aware motion**: take ease/duration/stagger/distance from `useThemeMotion()`; use `revealVars()` / `textVars()` from `@/lib/motion` where a custom timeline is needed. Parallax intensity = `motion.parallax` (0 → skip parallax). Pinned storytelling is desktop-only (`gsap.matchMedia("(min-width: 768px)")`) and only where designed for it.
6. **Three.js**: only in `components/three/*`, `React.lazy` + `<Suspense fallback={null}>`, `dpr={[1, 1.75]}`, `gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}`, `frameloop={inView ? "always" : "never"}` via `useInViewport`, `"demand"` under reduced motion, halve counts when `useIsCoarsePointer()`. Only primitives from `@/components/three/models` + basic three geometry. No drei Environment/HDR/external assets. Colors from `theme.three.palette`.
7. **Images**: `<ThemeImage>` only, `loading="lazy"` except the hero (`priority`). Intrinsic width/height come from the asset manifest.
8. **Accessibility**: semantic elements, meaningful `alt`, real `<button>`/`<a>`, ≥44px touch targets, `aria-hidden` on decor, visible focus (global).
9. **TypeScript strict** — no `any`, no unused vars (`noUnusedLocals`).
10. **File ownership**: write ONLY the files assigned to you. Never edit siteData, themes, index.css, tailwind config, App.tsx, Invitation.tsx, ThemeProvider or shared components unless the task says so. If you need a token/prop that doesn't exist, work with what exists and note it in your report.
11. External links: `target="_blank" rel="noopener"`.
12. z-index bands: content ≤ 40, nav 50–60, fixed overlays 70–90 (grain 80, dialogs 90–95), opening screen 100, theme selector 105, theme transition 120, skip link 130.
13. **Responsive**: design 360 / 390 / 430 / 768 / 1024 / 1440 / 1920 intentionally. Mobile is not desktop scaled down: single columns, generous tap targets, display sizes already clamp.
14. **No AI-generic look**: no random gradients/blobs beyond the theme's own `t-shapes`, no glassmorphism unless the theme's card style is `glass`, no icon soup, no shadow stacks. Strong type, deliberate spacing, one hero moment per section.

## Opening screen contract

`OpeningScreen({ onOpen, onComplete })` (rendered by App outside the smoother):
a sealed envelope with a 3D pickleball seal (lazy `three/SealBall`). `onOpen()`
fires when the exit starts (hero + nav entrances overlap it), `onComplete()`
when it has fully left. Reduced motion → both fire immediately, nothing renders.
`layout.opening` picks a timing/flourish preset (`opening/presets.ts`), not a
different metaphor.

## Section IDs (must match exactly)

`hero`, `welcome`, `details`, `countdown`, `experience`, `story`, `schedule`, `gallery`, `venue`, `rsvp`, `closing`.

## Motion grammar

- Entrances use `motion.ease`; camera/scroll moves `motion.easeInOut`. Durations: micro `motion.duration.micro`, component `.base`, cinematic `.cinematic`.
- Scrub timelines: `scrub: motion.scrub` (never `true`).
- Stagger: `motion.stagger.items` for cards, `.chars` for chars, `.lines` for lines.
- Every ScrollTrigger reveal fires `once: true` unless it's a scrubbed storytelling timeline.
- Restraint: one hero moment per section; support animations stay subtle.
