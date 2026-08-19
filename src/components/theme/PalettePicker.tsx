import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Palette, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { PALETTE_GROUPS, type PaletteDefinition } from "@/themes";
import { useTheme, useThemeMotion } from "./ThemeProvider";

/* UI chrome copy (not invitation content). */
const COPY = {
  trigger: "Colours",
  title: "Choose your colours",
  sub: "Tap a palette — the whole invitation re-colours live. Pick the one that suits.",
  close: "Close colour picker",
  active: "Selected",
} as const;

const GROUP_ORDER = ["pink", "ivory", "logo"] as const;

/**
 * The client's colour picker: a floating pill (bottom-left) that opens a
 * small panel of palette chips grouped by the hosts' three asks — pink
 * shades, ivory shades, the logo's colours lightened. Choosing a chip
 * re-tokens the page immediately (see ThemeProvider). Portalled to <body>
 * so it can be position: fixed above the smooth-scroll wrapper.
 */
export function PalettePicker() {
  const { palette, palettes, setPalette } = useTheme();
  const motion = useThemeMotion();
  const isMobile = useIsMobile();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const show = useCallback(() => {
    closingRef.current = false;
    setMounted(true);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    if (!open || closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
  }, [open]);

  // Open / close choreography.
  useGSAP(
    () => {
      const panel = panelRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop || !mounted) return;
      const reduced = prefersReducedMotion();
      const d = gsap.utils.clamp(0.3, 0.6, motion.duration.base * 0.45);
      if (open) {
        const chips = gsap.utils.toArray<HTMLElement>("[data-chip]", panel);
        if (reduced) {
          gsap.set([panel, backdrop], { autoAlpha: 1, clearProps: "transform" });
          return;
        }
        gsap.timeline()
          .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: d }, 0)
          .fromTo(
            panel,
            isMobile ? { autoAlpha: 1, yPercent: 100 } : { autoAlpha: 0, y: 18, scale: 0.96, transformOrigin: "0% 100%" },
            { autoAlpha: 1, yPercent: 0, y: 0, scale: 1, duration: d, ease: motion.ease },
            0
          )
          .fromTo(
            chips,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: d, stagger: 0.04, ease: motion.ease, clearProps: "transform" },
            0.08
          );
        panel.querySelector<HTMLElement>("[data-chip][aria-pressed=true]")?.focus({ preventScroll: true });
      } else {
        const finish = () => {
          setMounted(false);
          triggerRef.current?.focus({ preventScroll: true });
        };
        if (reduced) {
          finish();
          return;
        }
        gsap.timeline({ onComplete: finish })
          .to(panel, isMobile ? { yPercent: 100, duration: d, ease: motion.easeInOut } : { autoAlpha: 0, y: 12, scale: 0.97, duration: d * 0.8, ease: motion.easeInOut }, 0)
          .to(backdrop, { autoAlpha: 0, duration: d * 0.8 }, 0);
      }
    },
    { dependencies: [open, mounted, isMobile] }
  );

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        hide();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  const swatches = [palette.colors.primary, palette.colors.secondary, palette.colors.accent];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? hide() : show())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        className={cn(
          "fixed bottom-6 left-5 z-[105] inline-flex items-center gap-2.5 rounded-pill border border-line bg-surface/90 py-2 pl-2.5 pr-4",
          "text-fg shadow-float backdrop-blur-md transition-[transform,box-shadow,border-color] duration-micro ease-theme",
          "hover:-translate-y-0.5 hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
          "md:bottom-7 md:left-7"
        )}
      >
        <span aria-hidden="true" className="flex -space-x-1.5">
          {swatches.map((c, i) => (
            <span key={i} className="block h-5 w-5 rounded-full border-2 border-surface" style={{ backgroundColor: c }} />
          ))}
        </span>
        <span className="t-accent text-[0.68rem]">{COPY.trigger}</span>
        <Palette aria-hidden="true" className="h-4 w-4 text-primary" />
      </button>

      {mounted &&
        createPortal(
          <div className="fixed inset-0 z-[104]" role="presentation">
            <div
              ref={backdropRef}
              aria-hidden="true"
              onClick={hide}
              className="absolute inset-0 bg-overlay/25 opacity-0 backdrop-blur-[2px]"
            />
            <div
              ref={panelRef}
              id={`${uid}-panel`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${uid}-title`}
              aria-describedby={`${uid}-sub`}
              className={cn(
                "absolute flex flex-col overflow-hidden border-line bg-page text-fg shadow-float opacity-0",
                isMobile
                  ? "inset-x-0 bottom-0 max-h-[86svh] rounded-t-[1.5rem] border-t"
                  : "bottom-24 left-7 w-[min(92vw,30rem)] rounded-card border"
              )}
            >
              <div className="flex items-start justify-between gap-4 px-6 pt-6 md:px-7 md:pt-7">
                <div>
                  <h2 id={`${uid}-title`} className="t-display text-[1.6rem] leading-tight">
                    {COPY.title}
                  </h2>
                  <p id={`${uid}-sub`} className="mt-1.5 text-sm text-fg-muted">
                    {COPY.sub}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={hide}
                  aria-label={COPY.close}
                  className="touch-target -mr-2 -mt-2 grid place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 pb-6 pt-5 md:px-7 md:pb-7">
                {GROUP_ORDER.map((g) => {
                  const group = palettes.filter((p) => p.group === g);
                  if (!group.length) return null;
                  return (
                    <div key={g} className="mb-5 last:mb-0">
                      <div className="mb-2.5 flex items-baseline justify-between">
                        <p className="t-label text-fg">{PALETTE_GROUPS[g].label}</p>
                        <p className="text-[0.7rem] text-fg-subtle">{PALETTE_GROUPS[g].hint}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {group.map((p) => (
                          <PaletteChip key={p.id} palette={p} active={p.id === palette.id} onSelect={() => setPalette(p.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */

interface PaletteChipProps {
  palette: PaletteDefinition;
  active: boolean;
  onSelect: () => void;
}

/**
 * A palette as a tiny composition — ground, a title bar, the primary pill,
 * secondary block and accent dot — so the client sees the relationship,
 * not just a swatch row.
 */
function PaletteChip({ palette: p, active, onSelect }: PaletteChipProps) {
  const c = p.colors;
  return (
    <button
      type="button"
      data-chip
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${p.name} — ${p.tagline}${active ? ` (${COPY.active})` : ""}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border text-left",
        "transition-[transform,border-color,box-shadow] duration-micro ease-theme",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page",
        active ? "border-primary shadow-card" : "border-line hover:-translate-y-0.5 hover:border-line-strong"
      )}
    >
      <span aria-hidden="true" className="relative block aspect-[5/3] w-full" style={{ backgroundColor: c.bg }}>
        <span className="absolute left-[10%] top-[16%] block h-[8%] w-[46%] rounded-pill" style={{ backgroundColor: c.fg, opacity: 0.85 }} />
        <span className="absolute left-[10%] top-[32%] block h-[5%] w-[30%] rounded-pill" style={{ backgroundColor: c.fgMuted, opacity: 0.6 }} />
        <span className="absolute bottom-[14%] left-[10%] block h-[16%] w-[34%] rounded-pill" style={{ backgroundColor: c.primary }} />
        <span className="absolute right-[10%] top-[14%] block h-[52%] w-[34%] rounded-[40%]" style={{ backgroundColor: c.secondary, opacity: 0.85 }} />
        <span className="absolute bottom-[12%] right-[16%] block h-[22%] w-[13%] rounded-full" style={{ backgroundColor: c.accent }} />
        <span className="absolute inset-x-0 bottom-0 block h-px" style={{ backgroundColor: c.lineStrong }} />
        {active && (
          <span className="absolute left-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-btn">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="block px-2.5 pb-2.5 pt-2">
        <span className="t-display block text-[0.98rem] leading-tight text-fg">{p.name}</span>
        <span className="mt-0.5 block text-[0.68rem] leading-snug text-fg-muted">{p.tagline}</span>
      </span>
    </button>
  );
}
