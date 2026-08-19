import { gsap, ScrollSmoother } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const NAV_OFFSET = 72;

interface ScrollOptions {
  /** Jump without animating (used when restoring position after a theme switch). */
  instant?: boolean;
  offset?: number;
}

/**
 * Smooth-scroll to an in-page anchor. Routes through ScrollSmoother
 * when active (native anchors don't, inside a transformed wrapper),
 * falls back to a plain GSAP scroll tween otherwise. Reduced-motion
 * users jump instantly.
 */
export function scrollToSection(hash: string, { instant = false, offset = NAV_OFFSET }: ScrollOptions = {}) {
  const target = document.querySelector(hash);
  if (!target) return;

  const smoother = ScrollSmoother.get();
  const position = `top ${offset}px`;
  // Move the sequential-focus start point to the section (like a native
  // fragment jump would) without letting the browser fight the scroll.
  const focusTarget = () => {
    const el = target as HTMLElement;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  if (instant || prefersReducedMotion()) {
    if (smoother) {
      smoother.scrollTo(target, false, position);
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
    }
    if (!instant) focusTarget();
    return;
  }

  focusTarget();
  if (smoother) {
    smoother.scrollTo(target, true, position);
  } else {
    // autoKill must stay off: on touch devices, momentum scrolling and
    // ScrollTrigger pin adjustments emit scroll events mid-tween, which
    // autoKill would treat as user input and cancel the scroll outright.
    gsap.to(window, {
      scrollTo: { y: target, offsetY: offset, autoKill: false },
      duration: 1,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  }
}

/**
 * The id of the section currently occupying the viewport (used to keep the
 * reader's place across a theme switch, where section heights change).
 */
export function getActiveSectionId(root: ParentNode = document): string | null {
  const sections = Array.from(root.querySelectorAll<HTMLElement>("main section[id], footer[id]"));
  if (!sections.length) return null;
  const probe = window.innerHeight * 0.4;
  let active: string | null = null;
  for (const s of sections) {
    const rect = s.getBoundingClientRect();
    if (rect.top <= probe) active = s.id;
    else break;
  }
  return active ?? sections[0].id;
}
