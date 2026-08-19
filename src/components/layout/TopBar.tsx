import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { brand, navCta } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { BrandMark } from "@/components/shared/Glyphs";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  /** The opening has started its exit — slide the bar in. */
  booted: boolean;
}

/**
 * A very small fixed bar: the brand mark (back to top) and a "Join us" button.
 * Transparent over the hero, glassy once the reader scrolls. Lives outside
 * #smooth-content (position: fixed).
 */
export function TopBar({ booted }: TopBarProps) {
  const ref = useRef<HTMLElement>(null);
  const motion = useThemeMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 40,
      end: "max",
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => st.kill();
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !booted) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: -24 },
        { autoAlpha: 1, y: 0, duration: motion.duration.base, ease: motion.ease, delay: 0.6, clearProps: "transform" }
      );
    },
    { scope: ref, dependencies: [booted] }
  );

  return (
    <header
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-[70] opacity-0",
        "transition-[background-color,box-shadow,border-color] duration-base ease-theme",
        scrolled ? "border-b border-line/70 bg-page/80 shadow-[0_10px_30px_-24px_rgb(var(--c-overlay)/0.35)] backdrop-blur-md" : "border-b border-transparent"
      )}
      style={{ height: "var(--nav-height)" }}
    >
      <div className="section-shell-x flex h-full items-center justify-between">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#hero", { offset: 0 });
          }}
          className="rounded-md text-fg transition-opacity hover:opacity-75"
          aria-label={`${brand.name} — back to top`}
        >
          <BrandMark variant="lockup" markClassName="h-8 w-8 text-primary" textClassName="text-[1.05rem] md:text-[1.15rem]" />
        </a>
        <Button asChild size="sm" className="px-5">
          <a
            href={navCta.href}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(navCta.href);
            }}
          >
            {navCta.label}
          </a>
        </Button>
      </div>
    </header>
  );
}
