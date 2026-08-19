import { Hero } from "./Hero";
import { Hosts } from "./Hosts";
import { Details } from "./Details";
import { Action } from "./Action";
import { RSVP } from "./RSVP";
import { Footer } from "./Footer";

interface InvitationProps {
  booted: boolean;
}

/**
 * The invitation, card by card — only what the hosts asked for:
 * hero (the card) → hosts (the four names) → details (where / when / what) →
 * "See our Smashers in action" → save your spot (collect database) → footer.
 */
export function Invitation({ booted }: InvitationProps) {
  return (
    <>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero booted={booted} />
        <Hosts />
        <Details />
        <Action />
        <RSVP />
      </main>
      <Footer />
    </>
  );
}
