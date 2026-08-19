/**
 * PICKLE & PILATES — single source of truth for all invitation content.
 *
 * This mirrors the content the hosts sent (and nothing more):
 *
 *   Pickle & Pilates with Matcha bar
 *   A wellness experience
 *   Salem Super Smashers × Gurkha Life × The Tens Movement Lab × Cha Wellness
 *   Location: Forest Hills Country Club
 *   Date: coming soon
 *   "See our Smashers in action"
 *   (Collect database) → the "Save your spot" form (never called RSVP on the page)
 *
 * Components never hard-code copy — edit here. Items marked TODO are
 * placeholders awaiting confirmation from the hosts.
 */
import crestNav from "@/assets/logos/sss-logo-nav.png";
import crest from "@/assets/logos/sss-logo-small.png";

/* ------------------------------------------------------------------ */
/* Brand & hosts                                                       */
/* ------------------------------------------------------------------ */
export const brand = {
  name: "Pickle & Pilates",
  /** Split for display type: ["Pickle", "&", "Pilates"]. */
  nameParts: ["Pickle", "&", "Pilates"] as const,
  subline: "with Matcha bar",
  tagline: "A wellness experience",
  host: "Salem Super Smashers",
  hostShort: "SSS",
  hostCrest: crest,
  hostCrestNav: crestNav,
  /** Shown in order, joined with "×" — exactly as the hosts wrote it. */
  partners: [
    { name: "Salem Super Smashers", role: "Pickleball" },
    { name: "Gurkha Life", role: "Lifestyle" },
    { name: "The Tens Movement Lab", role: "Pilates" },
    { name: "Cha Wellness", role: "Matcha bar" },
  ] as const,
  hashtag: "#PickleAndPilates",
} as const;

export const meta = {
  title: "Pickle & Pilates — You're Invited | Salem Super Smashers",
  description:
    "Pickle & Pilates with Matcha bar — a wellness experience by Salem Super Smashers × Gurkha Life × The Tens Movement Lab × Cha Wellness at Forest Hills Country Club, Salem.",
  url: "https://sss.botify.in/pickle-and-pilates/",
} as const;

/* ------------------------------------------------------------------ */
/* Event facts                                                         */
/* ------------------------------------------------------------------ */
export type DateStatus = "confirmed" | "tba";

export const event = {
  /**
   * "tba" → every date slot reads `dateTbaLabel` (the hosts announced
   * "date coming soon"). Set to "confirmed" and fill `dateLabel` when final.
   * TODO: confirm date with the hosts.
   */
  dateStatus: "tba" as DateStatus,
  dateTbaLabel: "Date coming soon",
  dateTbaNote: "Save your spot and we'll tell you first",
  /** Used once dateStatus is "confirmed" (display string, e.g. "Sunday, 4 October 2026"). */
  dateLabel: "",
  timeLabel: "",
  venue: {
    name: "Forest Hills Country Club",
    city: "Salem",
    address: "Forest Hills Country Club, Salem, Tamil Nadu",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Forest+Hills+Country+Club%2C+Salem%2C+Tamil+Nadu",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Opening screen (the envelope)                                       */
/* ------------------------------------------------------------------ */
export const opening = {
  eyebrow: "Salem Super Smashers presents",
  invitedLine: "You're invited",
  cta: "Open invitation",
  hint: "Tap to open",
  skipHint: "Press Esc to skip",
} as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export const hero = {
  eyebrow: "You're invited to",
  primaryCta: { label: "Save my spot", href: "#register" },
  secondaryCta: { label: "The details", href: "#details" },
  scrollHint: "Scroll",
} as const;

/** The small button in the top bar. */
export const navCta = { label: "Join us", href: "#register" } as const;

/* ------------------------------------------------------------------ */
/* Details                                                             */
/* ------------------------------------------------------------------ */
export const details = {
  kicker: "The details",
  title: "Where & when",
  location: { label: "Location", cta: "Get directions" },
  date: { label: "Date" },
  /** What the morning is made of — the three words in the name. */
  what: {
    label: "What",
    items: [
      { key: "pickleball", title: "Pickleball", note: "Open courts" },
      { key: "pilates", title: "Pilates", note: "Guided session" },
      { key: "matcha", title: "Matcha bar", note: "By Cha Wellness" },
    ],
  },
  hostedBy: "Hosted by",
} as const;

/* ------------------------------------------------------------------ */
/* "See our Smashers in action"                                        */
/* ------------------------------------------------------------------ */
export const action = {
  kicker: "Salem Super Smashers",
  /** The hosts' line, verbatim. */
  title: "See our Smashers in action",
  body: "Salem's own pickleball team takes the court — then it's your turn.",
  cta: { label: "Follow the Smashers", href: "https://www.instagram.com/salemsupersmashers?igsh=d2l6YmlhMGZpM3hn" },
  ticker: "SEE OUR SMASHERS IN ACTION ✦ PICKLE & PILATES ✦ WITH MATCHA BAR ✦ FOREST HILLS COUNTRY CLUB ✦ ",
} as const;

/* ------------------------------------------------------------------ */
/* Save your spot — "collect database" (the word RSVP never appears)   */
/* ------------------------------------------------------------------ */
export const rsvp = {
  /** Section anchor (used by every "Save my spot" / "Join us" button). */
  id: "register",
  kicker: "Join us",
  title: "Save your spot",
  lead: "Leave your details — we'll share the date and everything you need to know with you first.",
  fields: {
    name: { label: "Full name", placeholder: "Your name" },
    email: { label: "Email", placeholder: "you@example.com" },
    phone: { label: "Phone", placeholder: "+91 98765 43210" },
    attendance: {
      label: "Will you be joining us?",
      options: [
        { value: "yes", label: "Count me in" },
        { value: "maybe", label: "Not sure yet" },
        { value: "no", label: "Can't make it" },
      ],
    },
    guests: { label: "Guests (including you)", min: 1, max: 4 },
    interest: {
      label: "I'm here for",
      options: [
        { value: "both", label: "Pickleball & pilates" },
        { value: "pickleball", label: "Pickleball" },
        { value: "pilates", label: "Pilates" },
        { value: "matcha", label: "The matcha & the company" },
      ],
    },
    message: { label: "A note for the hosts", placeholder: "Questions, or just say hi" },
  },
  cta: "Save my spot",
  submitting: "Sending…",
  successTitle: "You're on the list",
  successBody: "Thank you — we'll be in touch with the date and details soon.",
  successToast: "Got it — see you on the court and on the mat.",
  errorToast: "Something went wrong sending your details. Please try again.",
  anotherCta: "Add another guest",
  /**
   * Submission handler configuration (see src/lib/rsvp.ts):
   *   mode "mock"       — no backend; resolves after a short delay (default)
   *   mode "formsubmit" — POSTs to https://formsubmit.co/<endpoint>
   *   mode "endpoint"   — POSTs JSON to `endpoint`
   */
  submission: {
    mode: "mock" as "mock" | "formsubmit" | "endpoint",
    endpoint: "",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Social & footer                                                     */
/* ------------------------------------------------------------------ */
export const social = {
  instagram: {
    handle: "@salemsupersmashers",
    url: "https://www.instagram.com/salemsupersmashers?igsh=d2l6YmlhMGZpM3hn",
  },
  hashtag: brand.hashtag,
} as const;

export const footer = {
  hostedBy: "Hosted by",
  lines: ["See you on the court.", "And on the mat."],
  copyright: "© 2026 Salem Super Smashers · Pickle & Pilates",
} as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
/** The date line as it should read today. */
export function dateLine(): string {
  return event.dateStatus === "confirmed" && event.dateLabel ? event.dateLabel : event.dateTbaLabel;
}

export const siteData = { brand, meta, event, opening, hero, navCta, details, action, rsvp, social, footer } as const;
export type SiteData = typeof siteData;
