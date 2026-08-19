import { Instagram } from "lucide-react";
import { brand, footer, social } from "@/data/siteData";
import { scrollToSection } from "@/lib/scroll";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BrandMark } from "@/components/shared/Glyphs";

/**
 * Footer — the sign-off lines, the host crest, partners and Instagram.
 */
export function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-page">
      <div className="section-shell pb-28 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedText as="p" className="t-display text-display-md text-fg">
            {footer.lines[0]} <em className="text-primary">{footer.lines[1]}</em>
          </AnimatedText>

          <ScrollReveal delay={0.2} className="mt-12 flex flex-col items-center gap-5 md:mt-16">
            <img
              src={brand.hostCrest}
              alt={brand.host}
              width={72}
              height={72}
              loading="lazy"
              decoding="async"
              className="h-16 w-16 rounded-2xl bg-surface object-contain p-1.5 shadow-card md:h-[4.5rem] md:w-[4.5rem]"
            />
            <p className="t-label">
              {footer.hostedBy} {brand.host}
            </p>
            <p className="max-w-xl text-balance text-sm text-fg-muted">
              {brand.partners.map((p, i) => (
                <span key={p.name} className="inline-block whitespace-nowrap">
                  {i > 0 && <span className="mx-2 text-primary">×</span>}
                  {p.name}
                </span>
              ))}
            </p>
            <a
              href={social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="t-accent inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-[0.72rem] text-fg shadow-card transition-[transform,box-shadow] duration-micro ease-theme hover:-translate-y-0.5 hover:shadow-float"
            >
              <Instagram aria-hidden="true" className="h-4 w-4 text-primary" />
              {social.instagram.handle}
            </a>
          </ScrollReveal>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-fg-subtle md:mt-20 md:flex-row">
          <button
            type="button"
            onClick={() => scrollToSection("#hero", { offset: 0 })}
            className="text-fg transition-opacity hover:opacity-70"
            aria-label="Back to top"
          >
            <BrandMark variant="lockup" markClassName="h-7 w-7" textClassName="text-base" />
          </button>
          <p>{footer.copyright}</p>
          <p className="t-accent text-[0.65rem] text-primary">{social.hashtag}</p>
        </div>
      </div>
    </footer>
  );
}
