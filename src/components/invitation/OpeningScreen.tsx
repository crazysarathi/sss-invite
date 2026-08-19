import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { brand, footer, opening } from "@/data/siteData";
import { prefersReducedMotion } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/Kicker";
import type { ThemeDefinition } from "@/themes/types";
import { Envelope } from "./opening/Envelope";
import { OPENING_PRESET } from "./opening/presets";
import { useOpeningTimeline } from "./opening/useOpeningTimeline";

/** Upper bound on how long we hold the stage for the theme's faces. */
const FONT_WAIT_MS = 1500;

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * Warm the theme's display / accent / body faces (bounded) so the card's
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

interface OpeningScreenProps {
  /** The exit begins — start the hero + nav entrances so they overlap it. */
  onOpen?: () => void;
  /** The exit has fully finished — the screen is `display: none` from here. */
  onComplete: () => void;
}

/**
 * The invitation's opening experience: a sealed envelope you tap. The
 * pickleball seal pops off, the flap lifts, the card slides out and grows
 * into the website. Rendered by App outside #smooth-content, so it may be
 * `position: fixed`.
 *
 * Contract:
 *   - locks document scroll while up (restored on finish / unmount);
 *   - reduced motion → renders nothing, `onOpen()` + `onComplete()` at once;
 *   - the envelope itself is the gate (a real button), plus the text
 *     button; Enter / Space open, Escape (or a second tap) skips to the end;
 *   - `onOpen()` fires once when the exit begins, `onComplete()` once when it
 *     has finished — never the other way round.
 * The choreography's tempo comes from opening/presets.
 */
export function OpeningScreen({ onOpen, onComplete }: OpeningScreenProps) {
  const { theme } = useTheme();
  const preset = OPENING_PRESET;
  const rootRef = useRef<HTMLDivElement>(null);
  const envButtonRef = useRef<HTMLButtonElement>(null);
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
    // The envelope stops being a control once it's opening: drop its focus ring.
    envButtonRef.current?.blur();
    stage.open();
  }, [stage]);

  const skip = useCallback(() => {
    if (doneRef.current) return;
    startedRef.current = true;
    envButtonRef.current?.blur();
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

  // Focus the envelope once it's on stage.
  useEffect(() => {
    if (ready) envButtonRef.current?.focus({ preventScroll: true });
  }, [ready]);

  // Keyboard: Enter / Space open (unless a control handles it natively), Escape skips.
  useEffect(() => {
    if (reduced) return;
    const onKey = (e: KeyboardEvent) => {
      if (doneRef.current) return;
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

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Invitation"
      className="fixed inset-0 z-[100] cursor-pointer select-none overflow-hidden touch-none [overscroll-behavior:none]"
      style={hidden ? { display: "none" } : undefined}
      // Buttons inside have no handlers of their own: their clicks bubble here,
      // so a first tap anywhere opens and a second one skips.
      onClick={() => (startedRef.current ? skip() : open())}
    >
      <div data-backdrop aria-hidden="true" className="absolute inset-0 overflow-hidden bg-page-alt">
        <div data-decor className="absolute inset-0">
          <div className="t-pattern" />
        </div>
      </div>

      {ready && (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-5 py-6 text-fg sm:gap-6">
          <p data-kicker className="max-w-full">
            <Kicker
              ornament="both"
              className="max-w-full text-center max-sm:tracking-[0.22em] max-sm:[&>[aria-hidden]]:hidden"
            >
              {opening.eyebrow}
            </Kicker>
          </p>

          <div data-float className="relative">
            <button
              ref={envButtonRef}
              data-env
              type="button"
              aria-label="Open the invitation"
              // Focus lands here on mount: a hairline frame well outside the paper.
              className="relative block cursor-pointer rounded-md focus-visible:outline-1 focus-visible:outline-primary/70 focus-visible:[outline-offset:14px]"
              onPointerEnter={(e) => e.pointerType === "mouse" && stage.hover(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && stage.hover(false)}
            >
              <Envelope palette={theme.three.palette} liner={preset.liner} />
            </button>
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
