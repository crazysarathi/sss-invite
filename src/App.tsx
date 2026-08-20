import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollSmoother, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { sound } from "@/lib/audio";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { ThemeProvider, useTheme } from "@/components/theme/ThemeProvider";
import { OpeningScreen } from "@/components/invitation/OpeningScreen";
import { Invitation } from "@/components/invitation/Invitation";
import { TopBar } from "@/components/layout/TopBar";
import { BackToTop } from "@/components/layout/BackToTop";
import { SoundToggle } from "@/components/shared/SoundToggle";
import { Toaster } from "@/components/ui/sonner";

/**
 * App shell.
 *   - ScrollSmoother on desktop fine pointers only; touch scrolls natively.
 *   - Sections mount only after the smoother exists (pins/fixed inside a
 *     transformed wrapper break otherwise).
 *   - Anything `position: fixed` (opening screen, top bar, back-to-top,
 *     toasts) lives OUTSIDE #smooth-content.
 *   - Colours are fixed to the single court palette (sage/lavender/lime).
 */
function AppShell() {
  const { theme } = useTheme();
  // booted: the opening has started its exit → hero/top-bar entrances play
  // (overlapping the exit). opened: the opening has fully left → unmount it.
  const [booted, setBooted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    if (prefersReducedMotion() || isMobile) {
      setScrollReady(true);
      return;
    }
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: theme.motion.smooth,
      effects: true,
      smoothTouch: 0,
    });
    setScrollReady(true);
    // Recalculate positions once fonts finish loading.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      smoother.kill();
      setScrollReady(false);
    };
    // The smoother is created once per viewport class.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Ambient music: starts as soon as the browser allows (autoplay where
  // trusted, otherwise the first tap / key — the opening's own gesture).
  useEffect(() => {
    sound.boot();
  }, []);

  return (
    <>
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("#main-content", { instant: true, offset: 0 });
          document.getElementById("main-content")?.focus({ preventScroll: true });
        }}
        className="t-accent fixed left-4 top-4 z-[130] -translate-y-24 rounded-btn bg-primary px-5 py-2.5 text-xs text-primary-foreground transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {!opened && (
        <OpeningScreen
          onOpen={() => {
            setBooted(true);
            // The seal serves off — whoosh, then settle the bed to its
            // milder "inside" level for the scroll.
            sound.serve();
            sound.setScene("inside");
          }}
          onComplete={() => {
            setBooted(true);
            setOpened(true);
          }}
        />
      )}
      <TopBar booted={booted} />

      <div id="smooth-wrapper">
        <div id="smooth-content">{scrollReady && <Invitation booted={booted} />}</div>
      </div>

      <BackToTop />
      <SoundToggle />
      <Toaster position="bottom-center" />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
