import { Instagram, MapPin } from "lucide-react";
import { brand, event, footer, social } from "@/data/siteData";
import { scrollToSection } from "@/lib/scroll";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { BrandMark } from "@/components/shared/Glyphs";
import { Button } from "@/components/ui/button";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { Flourish } from "@/components/stationery/Ornaments";

/**
 * Footer — the script sign-off, the closing lines, host crest, partners,
 * directions and Instagram.
 */
export function Footer() {
  return (
    <footer id="footer" className="t-paper relative overflow-hidden bg-page-alt">
      <Watercolor variant="c" opacity={0.8} />
      <CourtsideSketches flip density="light" />

      <div className="section-shell pb-28 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedText as="p" split="words" className="t-script text-[1.85rem] leading-none text-primary sm:text-[2.4rem] md:text-[3.2rem]">
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
              height={83}
              loading="lazy"
              decoding="async"
              className="h-16 w-16 object-contain md:h-[4.5rem] md:w-[4.5rem]"
            />
            <p className="t-accent text-[0.78rem] text-fg-muted">
              {footer.hostedBy} {brand.host}
            </p>
            {/* the goodie-bag / QR note — the client's closing message */}
            <div className="max-w-md">
              <p className="t-display text-[1.05rem] text-fg md:text-[1.15rem]">{footer.goodieBag.title}</p>
              {footer.goodieBag.lines.map((line) => (
                <p key={line} className="mt-1.5 text-balance text-sm text-fg-muted md:text-[0.95rem]">
                  {line}
                </p>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="outline">
                <a href={event.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin aria-hidden="true" className="text-primary" />
                  {footer.directionsCta}
                </a>
              </Button>
              <Button asChild aria-label={social.follow.ariaLabel}>
                <a href={social.instagram.url} target="_blank" rel="noopener noreferrer">
                  <Instagram aria-hidden="true" />
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
            <BrandMark variant="lockup" markClassName="h-8 w-8" textClassName="text-base" />
          </button>
          <p>{footer.copyright}</p>
          <p className="t-accent text-[0.7rem] text-primary">{social.hashtag}</p>
        </div>
      </div>
    </footer>
  );
}
