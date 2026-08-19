import { Instagram, MapPin } from "lucide-react";
import { brand, event, footer, social } from "@/data/siteData";
import { scrollToSection } from "@/lib/scroll";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BrandMark } from "@/components/shared/Glyphs";
import { Button } from "@/components/ui/button";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CornerBotanicals } from "@/components/stationery/Botanicals";
import { Flourish } from "@/components/stationery/Ornaments";

/**
 * Footer — the script sign-off, the closing lines, host crest, partners,
 * directions and Instagram.
 */
export function Footer() {
  return (
    <footer id="footer" className="t-paper relative overflow-hidden bg-page-alt">
      <Watercolor variant="c" opacity={0.8} />
      <CornerBotanicals corner="tl" style="fill" />
      <CornerBotanicals corner="br" style="line" />

      <div className="section-shell pb-28 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedText as="p" split="words" className="t-script text-[2.4rem] leading-none text-primary md:text-[3.2rem]">
            {footer.script}
          </AnimatedText>
          <ScrollReveal delay={0.1}>
            <Flourish className="mt-5" />
          </ScrollReveal>
          <AnimatedText as="p" className="t-display mt-6 text-display-md text-fg">
            {footer.lines[0]} <em className="text-primary">{footer.lines[1]}</em>
          </AnimatedText>

          <ScrollReveal delay={0.2} className="mt-10 flex flex-col items-center gap-5 md:mt-14">
            <img
              src={brand.hostCrest}
              alt={brand.host}
              width={72}
              height={72}
              loading="lazy"
              decoding="async"
              className="h-16 w-16 rounded-md bg-surface object-contain p-1.5 shadow-card md:h-[4.5rem] md:w-[4.5rem]"
            />
            <p className="t-accent text-[0.78rem] text-fg-muted">
              {footer.hostedBy} {brand.host}
            </p>
            <p className="max-w-xl text-balance">
              {brand.partners.map((p, i) => (
                <span key={p.name} className="inline-block whitespace-nowrap">
                  {i > 0 && <span className="mx-2 text-primary">×</span>}
                  <span className="t-display text-[1.1rem] text-fg">{p.name}</span>
                </span>
              ))}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="outline">
                <a href={event.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin aria-hidden="true" className="text-primary" />
                  {footer.directionsCta}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={social.instagram.url} target="_blank" rel="noopener noreferrer">
                  <Instagram aria-hidden="true" className="text-primary" />
                  {social.instagram.handle}
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </div>

        <div className="relative mt-14 flex flex-col items-center justify-between gap-4 border-t border-accent/40 pt-6 text-xs text-fg-subtle md:mt-20 md:flex-row">
          <button
            type="button"
            onClick={() => scrollToSection("#hero", { offset: 0 })}
            className="text-fg transition-opacity hover:opacity-70"
            aria-label="Back to top"
          >
            <BrandMark variant="lockup" markClassName="h-7 w-7 text-primary" textClassName="text-base" />
          </button>
          <p>{footer.copyright}</p>
          <p className="t-accent text-[0.7rem] text-primary">{social.hashtag}</p>
        </div>
      </div>
    </footer>
  );
}
