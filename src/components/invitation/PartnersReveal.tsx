import { partnersReveal } from "@/data/siteData";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { Watercolor } from "@/components/stationery/Watercolor";
import { CourtsideSketches } from "@/components/sport/CourtsideSketch";
import { Flourish } from "@/components/stationery/Ornaments";
import { PartnerLaunch } from "@/components/invitation/launch/PartnerLaunch";

/**
 * Right after "Four collaborations. One experience." (Hosts): a four-stage
 * launch the reader taps through — the host's crest, the team on court,
 * the four partners again up close, then a gift that opens on a callback
 * to the invitation. See launch/PartnerLaunch for the interactive panel.
 */
export function PartnersReveal() {
  return (
    <section id={partnersReveal.id} className="t-paper relative overflow-hidden bg-page">
      <Watercolor variant="a" opacity={0.85} />
      <CourtsideSketches density="light" />

      <div className="section-shell">
        <div className="mx-auto max-w-[40rem] text-center">
          <ScrollReveal>
            <AnimatedText as="h2" className="t-accent text-kicker text-fg-muted">
              {partnersReveal.kicker}
            </AnimatedText>
            <Flourish className="mt-4" center="dot" />
          </ScrollReveal>

          <PartnerLaunch />
        </div>
      </div>
    </section>
  );
}
