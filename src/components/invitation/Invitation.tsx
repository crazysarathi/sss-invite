import { Hero } from "./Hero";
import { Details } from "./Details";
import { Action } from "./Action";
import { RSVP } from "./RSVP";
import { Footer } from "./Footer";

interface InvitationProps {
  booted: boolean;
}

/**
 * The invitation, section by section — only what the hosts asked for:
 * hero (the card) → details (where / when / what / hosted by) →
 * "See our Smashers in action" → RSVP (collect database) → footer.
 */
export function Invitation({ booted }: InvitationProps) {
  return (
    <>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero booted={booted} />
        <Details />
        <Action />
        <RSVP />
      </main>
      <Footer />
    </>
  );
}
