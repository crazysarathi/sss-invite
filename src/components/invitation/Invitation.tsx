import { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { Hosts } from "./Hosts";
import { PartnersReveal } from "./PartnersReveal";
import { Details } from "./Details";
import { Action } from "./Action";
import { Sponsors } from "./Sponsors";
import { RSVP } from "./RSVP";
import { Footer } from "./Footer";

interface InvitationProps {
  booted: boolean;
}

/**
 * Mounts one more section per idle slice. Mounting everything in one commit
 * produced a single ~600ms style/layout task on phones — right under the
 * opening-gate animation, which is exactly where the jank was visible.
 * One section per slice keeps every task small; all sections are in well
 * before the reader can scroll to them.
 */
function useProgressiveMount(steps: number): number {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= steps) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const next = () => setStage((s) => s + 1);
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(next, { timeout: 900 });
      return () => w.cancelIdleCallback?.(handle);
    }
    const t = window.setTimeout(next, 350);
    return () => window.clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

/**
 * The invitation, card by card — only what the hosts asked for:
 * hero (the card) → hosts (the four names) → the partners launch (a
 * tap-through reveal) → details (where / when / what) → "See our Smashers
 * in action" → sponsors & partners (a logo slider) → save your spot
 * (collect database) → footer.
 *
 * Only the hero renders up front (it's what the gate doors reveal); the
 * sections below the fold stream in during idle time so the first paint on
 * a phone isn't blocked laying out the whole page — including the RSVP
 * form — behind closed doors.
 */
export function Invitation({ booted }: InvitationProps) {
  const stage = useProgressiveMount(7);
  return (
    <>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero booted={booted} />
        {stage > 0 && <Hosts />}
        {stage > 1 && <PartnersReveal />}
        {stage > 2 && <Details />}
        {stage > 3 && <Action />}
        {stage > 4 && <Sponsors />}
        {stage > 5 && <RSVP />}
      </main>
      {stage > 6 && <Footer />}
    </>
  );
}
