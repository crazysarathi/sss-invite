import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { brand, dateLine, event, footer, opening } from "@/data/siteData";
import { prefersReducedMotion } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/Kicker";
import type { ThemeDefinition } from "@/themes/types";
import { GateDoors, SealBall } from "./opening/Gates";
import { OPENING_PRESET } from "./opening/presets";
import { useOpeningTimeline } from "./opening/useOpeningTimeline";

/** Upper bound on how long we hold the stage for the theme's faces. */
const FONT_WAIT_MS = 1500;

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * Warm the theme's display / accent / body faces (bounded) so the stage's
 * display type measures right and doesn't swap mid-choreography.
 */
async function warmFonts(theme: ThemeDefinition): Promise<void> {
  const { display, accent, body } = theme.typography;
  try {
    await theme.typography.load();
    await nextFrame();
    if (document.fonts?.load) {
      await Promise.all([
        document.fonts.load(`${display.weight} 1em ${display.family}`),
        document.fonts.load(`italic ${display.weight} 1em ${display.family}`),
        document.fonts.load(`${accent.weight} 1em ${accent.family}`),
        document.fonts.load(`${body.weight} 1em ${body.family}`),
      ]);
    }
  } catch {
    /* fall through — the fallback stack is fine */
  }
}

const isNativeControl = (t: EventTarget | null) =>
  t instanceof HTMLElement && /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

/** The colour picker is up (or still closing) over this screen — its modal
 *  must swallow every open/skip gesture, not just Escape. */
const pickerIsUp = () => document.documentElement.dataset.pickerOpen === "true";

interface OpeningScreenProps {
  /** The exit begins — start the hero + nav entrances so they overlap it. */
  onOpen?: () => void;
  /** The exit has fully finished — the screen is `display: none` from here. */
  onComplete: () => void;
}

/**
 * The invitation's opening experience: two paper leaves sealed at the seam
 * by the pickleball. Tap, and the ball serves off with a spin while the
 * doors swing apart to reveal the website. Rendered by App outside
 * #smooth-content, so it may be `position: fixed`.
 *
 * Contract:
 *   - locks document scroll while up (restored on finish / unmount);
 *   - reduced motion → renders nothing, `onOpen()` + `onComplete()` at once;
 *   - the seal itself is the gate (a real button), plus the text button;
 *     Enter / Space open, Escape (or a second tap) skips to the end;
 *   - `onOpen()` fires once when the exit begins, `onComplete()` once when it
 *     has finished — never the other way round.
 * The choreography's tempo comes from opening/presets.
 */
export function OpeningScreen({ onOpen, onComplete }: OpeningScreenProps) {
  const { theme } = useTheme();
  const preset = OPENING_PRESET;
  const rootRef = useRef<HTMLDivElement>(null);
  const sealButtonRef = useRef<HTMLButtonElement>(null);
  const [reduced] = useState(() => prefersReducedMotion());
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const openedRef = useRef(false);
  const doneRef = useRef(false);
  const onOpenRef = useRef(onOpen);
  const onCompleteRef = useRef(onComplete);
  onOpenRef.current = onOpen;
  onCompleteRef.current = onComplete;

  const fireOpen = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    onOpenRef.current?.();
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    fireOpen();
    doneRef.current = true;
    document.documentElement.style.overflow = "";
    setHidden(true);
    onCompleteRef.current();
  }, [fireOpen]);

  const stage = useOpeningTimeline({
    scope: rootRef,
    ready,
    preset,
    onOpenStart: fireOpen,
    onExited: finish,
  });

  const startedRef = useRef(false);
  const open = useCallback(() => {
    if (doneRef.current || startedRef.current) return;
    startedRef.current = true;
    // The seal stops being a control once it's opening: drop its focus ring.
    sealButtonRef.current?.blur();
    stage.open();
  }, [stage]);

  const skip = useCallback(() => {
    if (doneRef.current) return;
    startedRef.current = true;
    sealButtonRef.current?.blur();
    stage.skip();
  }, [stage]);

  // Scroll lock while the screen is up.
  useLayoutEffect(() => {
    if (reduced) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [reduced]);

  // Reduced motion: no gate, no 3D, no animation.
  useEffect(() => {
    if (reduced) finish();
  }, [reduced, finish]);

  // Hold the stage (bounded) until the theme's faces are in.
  useEffect(() => {
    if (reduced) return;
    let alive = true;
    const timeout = new Promise<void>((r) => setTimeout(r, FONT_WAIT_MS));
    Promise.race([warmFonts(theme), timeout]).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [reduced, theme]);

  // Focus the seal once it's on stage — unless the user is in the
  // colour picker, which this must not yank focus out of.
  useEffect(() => {
    if (ready && !pickerIsUp()) sealButtonRef.current?.focus({ preventScroll: true });
  }, [ready]);

  // Keyboard: Enter / Space open (unless a control handles it natively), Escape skips.
  useEffect(() => {
    if (reduced) return;
    const onKey = (e: KeyboardEvent) => {
      if (doneRef.current || pickerIsUp()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      } else if ((e.key === "Enter" || e.key === " ") && !isNativeControl(e.target)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduced, open, skip]);

  if (reduced) return null;

  const [a, amp, b] = brand.nameParts;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Invitation"
      className="fixed inset-0 z-[100] cursor-pointer select-none overflow-hidden touch-none [overscroll-behavior:none]"
      style={hidden ? { display: "none" } : undefined}
      // Buttons inside have no handlers of their own: their clicks bubble here,
      // so a first tap anywhere opens and a second one skips. Guarded against
      // the picker: with no focus trap, Tab can reach the seal button under
      // the picker's backdrop, and Enter would click it natively.
      onClick={() => {
        if (pickerIsUp()) return;
        if (startedRef.current) skip();
        else open();
      }}
    >
      <GateDoors />

      {ready && (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 px-6 py-6 text-fg sm:gap-5">
          <p data-kicker className="max-w-full">
            <Kicker
              ornament="both"
              className="max-w-full text-center max-sm:text-[0.62rem] max-sm:tracking-[0.2em] max-sm:[&>[aria-hidden]]:hidden"
            >
              {opening.eyebrow}
            </Kicker>
          </p>

          <button
            ref={sealButtonRef}
            data-seal
            type="button"
            aria-label="Open the invitation"
            // Focus lands here on mount: a hairline ring well outside the medallion.
            className="relative block cursor-pointer rounded-full focus-visible:outline-1 focus-visible:outline-primary/70 focus-visible:[outline-offset:12px]"
            onPointerEnter={(e) => e.pointerType === "mouse" && stage.hover(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && stage.hover(false)}
          >
            <SealBall palette={theme.three.palette} />
          </button>

          <div data-titles className="flex max-w-[88vw] flex-col items-center gap-1 text-center sm:gap-1.5">
            <Kicker ornament="none" className="text-[0.62rem] tracking-[0.22em] md:text-[0.7rem]">
              {opening.invitedLine}
            </Kicker>
            <span className="t-display block text-[clamp(1.9rem,7.5vw,2.5rem)] md:text-[clamp(2.5rem,3.6vw,3.1rem)]">
              {a} <em>{amp}</em> {b}
            </span>
            <span className="t-script text-[1.25rem] leading-none text-primary md:text-[1.6rem]">
              {brand.subline}
            </span>
            <span aria-hidden="true" className="my-1 block h-px w-12 bg-accent/70" />
            <span className="t-label block text-[0.62rem] leading-relaxed md:text-[0.7rem]">
              {dateLine()} · {event.venue.name}
            </span>
          </div>

          <div data-gate className="flex flex-col items-center gap-3 text-center sm:gap-4">
            <Button type="button" variant="outline" className="min-w-44">
              {opening.cta}
            </Button>
            <p data-hint className="t-label">
              <span>{opening.hint}</span>
              <span className="hidden md:inline"> · {opening.skipHint}</span>
            </p>
          </div>

          <p data-host className="t-label">
            {footer.hostedBy} {brand.host}
          </p>
        </div>
      )}
    </div>
  );
}
