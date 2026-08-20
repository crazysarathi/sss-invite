import { useRef } from "react";
import { Instagram } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { rsvp, social } from "@/data/siteData";
import { useThemeMotion } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/shared/Kicker";

interface RsvpSuccessProps {
  onAnother: () => void;
}

/**
 * Success face of the form panel: a check drawn inside a themed ring,
 * then title / body / "send another" rising in with the theme's stagger.
 * Moves focus to the heading once it is visible. Reduced motion →
 * everything is simply visible and focus moves immediately.
 */
export function RsvpSuccess({ onAnother }: RsvpSuccessProps) {
  const ref = useRef<HTMLDivElement>(null);
  const motion = useThemeMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const parts = el.querySelectorAll<HTMLElement>("[data-reveal]");
      const heading = el.querySelector<HTMLElement>("[data-success-heading]");
      const focusHeading = () => heading?.focus({ preventScroll: true });
      if (prefersReducedMotion()) {
        gsap.set(parts, { autoAlpha: 1 });
        focusHeading();
        return;
      }
      const ring = el.querySelector<HTMLElement>("[data-ring]");
      const circle = el.querySelector<SVGCircleElement>("[data-ring-circle]");
      const check = el.querySelector<SVGPathElement>("[data-ring-check]");
      const texts = el.querySelectorAll<HTMLElement>("[data-success-part]");
      const base = motion.duration.base;
      const tl = gsap.timeline({ defaults: { ease: motion.ease } });

      if (ring) tl.fromTo(ring, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: base * 0.6 }, 0);
      if (circle) {
        const c = circle.getTotalLength();
        tl.fromTo(
          circle,
          { strokeDasharray: c, strokeDashoffset: c },
          { strokeDashoffset: 0, duration: base * 0.8, ease: motion.easeInOut },
          0.05
        );
      }
      if (check) {
        const l = check.getTotalLength();
        tl.fromTo(
          check,
          { strokeDasharray: l, strokeDashoffset: l },
          { strokeDashoffset: 0, duration: base * 0.45 },
          `-=${base * 0.35}`
        );
      }
      if (texts.length) {
        tl.fromTo(
          texts,
          { autoAlpha: 0, y: motion.distance * 0.5 },
          {
            autoAlpha: 1,
            y: 0,
            duration: base * 0.7,
            stagger: motion.stagger.items,
            clearProps: "transform",
          },
          `-=${base * 0.3}`
        );
        // Focus lands as the heading (second part) starts to appear — it must be visible to take focus.
        tl.call(focusHeading, [], `<+=${motion.stagger.items + 0.05}`);
      } else {
        focusHeading();
      }
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center py-6 text-center sm:py-10"
    >
      <div
        data-reveal
        data-ring
        aria-hidden="true"
        className="relative mx-auto flex h-24 w-24 items-center justify-center text-primary sm:h-28 sm:w-28"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle data-ring-circle cx="50" cy="50" r="47" strokeWidth="1.5" transform="rotate(-90 50 50)" />
          <path data-ring-check d="M31 51 L44 64 L70 37" strokeWidth="2.5" />
        </svg>
      </div>

      <div data-reveal data-success-part className="mt-8">
        <Kicker ornament="both">{rsvp.kicker}</Kicker>
      </div>
      <h3
        data-reveal
        data-success-part
        data-success-heading
        tabIndex={-1}
        className="t-display mt-4 max-w-md text-display-sm text-fg outline-none"
      >
        {rsvp.successTitle}
      </h3>
      <p data-reveal data-success-part className="mt-4 max-w-md text-pretty text-base text-fg-muted">
        {rsvp.successBody}
      </p>
      <p data-reveal data-success-part className="mt-6 max-w-md text-pretty text-sm text-fg-muted">
        {social.follow.success.lead}
      </p>
      <div data-reveal data-success-part className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <a href={social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={social.follow.ariaLabel}>
            <Instagram aria-hidden="true" />
            {social.follow.success.cta}
          </a>
        </Button>
        <Button type="button" variant="outline" onClick={onAnother} className="border-[length:var(--border-w)]">
          {rsvp.anotherCta}
        </Button>
      </div>
    </div>
  );
}
