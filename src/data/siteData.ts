/**
 * PICKLE & PILATES — single source of truth for all invitation content.
 *
 * This mirrors the content the hosts sent (and nothing more):
 *
 *   Pickle & Pilates with Matcha & Ube bar
 *   A wellness experience
 *   Salem Super Smashers × Gurkha Life × The Tens Movement Lab × Wellness Bar
 *   Location: Forest Hills Country Club
 *   Date: 29th August, Saturday
 *   "See our Smashers in action"
 *   (Collect database) → the "Save your spot" form (never called RSVP on the page)
 *
 * Components never hard-code copy — edit here. Items marked TODO are
 * placeholders awaiting confirmation from the hosts.
 */
import crest from "@/assets/logos/sss-crest.svg";
import gurkhaLogo from "@/assets/logos/gurkha-logo.svg";
import tensLogo from "@/assets/logos/tens-logo.svg";
import sksHospitalLogo from "@/assets/partners/sks-hospital.jpeg";
import mahendraLogo from "@/assets/partners/mahendra.png";
import megawinLogo from "@/assets/partners/megawin.jpeg";
import venusEstatesLogo from "@/assets/partners/venus-estates.jpg";
import technosportLogo from "@/assets/partners/technosport.png";
import armoraaLogo from "@/assets/partners/armoraa.png";
import gurkhaSponsorLogo from "@/assets/partners/gurkha.svg";
import iaMotorsLogo from "@/assets/partners/ia-motors.jpg";
import grandEstanciaLogo from "@/assets/partners/grand-estancia.png";
import tabInfinityLogo from "@/assets/partners/tab-infinity.png";
import weddingWhisperersLogo from "@/assets/partners/wedding-whisperers.webp";
import ecoWellLogo from "@/assets/partners/eco-well.jpg";
import tailoredLuxuryLogo from "@/assets/partners/tailored-luxury.jpeg";
import yococoLogo from "@/assets/partners/yococo.png";
import narasusCoffeeLogo from "@/assets/partners/narasus-coffee.jpg";
import farmHarvestLogo from "@/assets/partners/farm-harvest.jpg";

/* ------------------------------------------------------------------ */
/* Brand & hosts                                                       */
/* ------------------------------------------------------------------ */
export const brand = {
  name: "Pickle & Pilates",
  /** Split for display type: ["Pickle", "&", "Pilates"]. */
  nameParts: ["Pickle", "&", "Pilates"] as const,
  subline: "with Matcha & Ube bar",
  tagline: "A wellness experience",
  host: "Salem Super Smashers",
  hostShort: "SSS",
  /** The hosts' crest, cut out to a transparent SVG (no card, no border). */
  hostCrest: crest,
  /** Shown in order, joined with "×" — exactly as the hosts wrote it. */
  partners: [
    { name: "Salem Super Smashers", role: "Pickleball", logo: crest },
    { name: "Gurkha Life", role: "Lifestyle", logo: gurkhaLogo },
    { name: "The Tens Movement Lab", role: "Pilates", logo: tensLogo },
    { name: "Wellness Bar", role: "Matcha & Ube", logo: undefined },
  ] as const,
  hashtag: "#PickleAndPilates",
} as const;

export const meta = {
  title: "Pickle & Pilates — You're Invited | Salem Super Smashers",
  description:
    "Pickle & Pilates with Matcha & Ube bar — a wellness experience by Salem Super Smashers × Gurkha Life × The Tens Movement Lab × Wellness Bar at Forest Hills Country Club, Salem — 29th August, Saturday.",
  url: "https://sss.botify.in/pickle-and-pilates/",
} as const;

/* ------------------------------------------------------------------ */
/* Event facts                                                         */
/* ------------------------------------------------------------------ */
export type DateStatus = "confirmed" | "tba";

export const event = {
  /**
   * "tba" → every date slot reads `dateTbaLabel`. Confirmed by the hosts
   * on 2026-08-20: 29th August, Saturday.
   */
  dateStatus: "confirmed" as DateStatus,
  dateTbaLabel: "Date coming soon",
  dateTbaNote: "Save your spot and we'll tell you first",
  /** Used once dateStatus is "confirmed" (display string). */
  dateLabel: "29th August, Saturday",
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
/* Opening screen (the sealed doors)                                   */
/* ------------------------------------------------------------------ */
export const opening = {
  eyebrow: "Salem Super Smashers presents",
  invitedLine: "You're specially handpicked to experience our",
  cta: "Open invitation",
  hint: "Tap to open",
  skipHint: "Press Esc to skip",
} as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export const hero = {
  eyebrow: "You're specially handpicked to experience our",
  saveTheDate: "Save the date",
  /** Small-caps prefix before the venue line. */
  venueLabel: "Venue",
  primaryCta: { label: "Save my spot", href: "#register" },
  secondaryCta: { label: "The details", href: "#details" },
} as const;

/* ------------------------------------------------------------------ */
/* Hosts — the four names, introduced like a family card               */
/* ------------------------------------------------------------------ */
export const hosts = {
  kicker: "Four collaborations. One experience.",
  /** Sign-off under the names. */
  line: "Moving well, gathering often — together.",
} as const;

/* ------------------------------------------------------------------ */
/* Partners reveal — right after "Four collaborations. One experience.": a    */
/* plain card grid (no slider) with four set pieces — logo, jersey,     */
/* partners, and a gift that opens on a callback to the invitation.     */
/* ------------------------------------------------------------------ */
export const partnersReveal = {
  id: "partners-reveal",
  kicker: "A closer look",
  logoKicker: "Logo launch",
  jerseyKicker: "Jersey launch",
  partnersKicker: "Player launch",
  surpriseKicker: "Surprise element",
  openHint: "Tap to open",
  /** Shown once the gift is opened — a tease, not the actual reveal. */
  surpriseTeaser: "Curious? Find it on our launch day 😉",
  replayCta: "Replay",
} as const;

/* ------------------------------------------------------------------ */
/* Sponsors — the wider sponsor roster (distinct from the four hosting */
/* partners above), shown as a logo slider right before "Save your     */
/* spot". Roster and display order confirmed by the hosts on            */
/* 2026-08-25; Narasus Coffee and Farm Harvest are two separate         */
/* sponsors (their logos arrived the same day).                          */
/* ------------------------------------------------------------------ */
export interface Sponsor {
  name: string;
  logo?: string;
  /**
   * Let the artwork fill the whole medallion (object-cover, no paper
   * margin) — for logos that come on their own full-bleed background,
   * so the circle takes that background instead of showing a square
   * sitting on paper. Only for square art whose lettering sits well
   * inside the inscribed circle.
   */
  fill?: true;
}

export const sponsorsSection = {
  id: "sponsors",
  kicker: "Sponsors & partners",
} as const;

export const sponsors: readonly Sponsor[] = [
  { name: "SKS Hospital", logo: sksHospitalLogo },
  { name: "Mahendra", logo: mahendraLogo },
  { name: "Megawin", logo: megawinLogo },
  { name: "Venus Estates", logo: venusEstatesLogo },
  { name: "Technosport", logo: technosportLogo },
  { name: "Armoraa", logo: armoraaLogo },
  { name: "Gurkha", logo: gurkhaSponsorLogo },
  { name: "IA Motors", logo: iaMotorsLogo },
  { name: "Grand Estancia", logo: grandEstanciaLogo },
  { name: "Tab Infinity", logo: tabInfinityLogo },
  { name: "Wedding Whisperers", logo: weddingWhisperersLogo },
  { name: "Eco Well", logo: ecoWellLogo },
  { name: "Tailored Luxury For You", logo: tailoredLuxuryLogo },
  { name: "Narasus Coffee", logo: narasusCoffeeLogo },
  { name: "Farm Harvest", logo: farmHarvestLogo },
  { name: "Yococo", logo: yococoLogo },
] as const;

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
      { key: "pickleball", title: "Pickleball", note: "Indoor courts" },
      { key: "pilates", title: "Mat Pilates", note: "Guided session" },
      { key: "matcha", title: "Wellness Bar", note: "Matcha & Ube" },
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
  /** Script caption under the rally "print". */
  caption: "Salem super smashers on the court",
  cta: { label: "Follow the Smashers", href: "https://www.instagram.com/salemsupersmashers?igsh=d2l6YmlhMGZpM3hn" },
  ticker: "SEE OUR SMASHERS IN ACTION ✦ FOLLOW @SALEMSUPERSMASHERS ✦ PICKLE & PILATES ✦ WITH MATCHA & UBE BAR ✦ 29TH AUGUST, SATURDAY ✦ FOREST HILLS COUNTRY CLUB ✦ ",
} as const;

/* ------------------------------------------------------------------ */
/* Save your spot — "collect database" (the word RSVP never appears)   */
/* ------------------------------------------------------------------ */
export const rsvp = {
  /** Section anchor (used by every "Save my spot" / "Join us" button). */
  id: "register",
  kicker: "Join us",
  title: "Save your spot",
  lead: "Leave your details — we'll share everything you need to know with you first.",
  fields: {
    name: { label: "Full name", placeholder: "Your name" },
    email: { label: "Email", placeholder: "you@example.com" },
    phone: { label: "WhatsApp number", placeholder: "+91 98765 43210" },
    attendance: {
      label: "Will you be joining us?",
      options: [
        { value: "yes", label: "Count me in" },
        { value: "no", label: "Can't make it" },
      ],
    },
    guests: { label: "Guests (including you)", min: 1, max: 4 },
    /** Confirmed by the hosts on 2026-08-24. Each slot caps at 15 registrations — see sss-admin/config.php's SLOT_CAPACITY. */
    slot: {
      label: "Time slot",
      soldOutLabel: "Sold out",
      options: [
        { value: "630-730am", label: "6:30 am to 7:30 am" },
        { value: "8-9am", label: "8 am to 9 am" },
        { value: "530-630pm", label: "5:30 pm to 6:30 pm" },
      ],
    },
    interest: {
      label: "I'm here for",
      options: [
        { value: "pickle", label: "Pickle" },
        { value: "pilates", label: "Pilates" },
        { value: "both", label: "Want to try both" },
        { value: "matcha", label: "Just matcha" },
      ],
    },
    message: { label: "A note for the hosts", placeholder: "Questions, or just say hi" },
  },
  cta: "Save my spot",
  submitting: "Sending…",
  successTitle: "You're on the list",
  successBody: "Thank you — we'll be in touch with the details soon.",
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
    mode: "endpoint" as "mock" | "formsubmit" | "endpoint",
    endpoint: "/sss-admin/api/rsvp_submit.php",
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
  /**
   * The follow ask, everywhere it appears — always in the invitation's
   * voice ("Follow the Smashers"), never a bare "Follow us on Instagram".
   */
  follow: {
    ariaLabel: "Follow Salem Super Smashers on Instagram",
    /** Small pill on the hero card, right under the CTAs. */
    hero: "Follow along",
    /** After a guest saves their spot — the warmest moment to ask. */
    success: {
      lead: "The buildup, the courts, the day itself — it all plays out on Instagram.",
      cta: "Follow the buildup",
    },
  },
  hashtag: brand.hashtag,
} as const;

export const footer = {
  hostedBy: "Hosted by",
  /** Script sign-off. */
  script: "Celebrate this experience with us",
  lines: ["See you on the court.", "And on the mat."],
  directionsCta: "Get directions",
  copyright: "© 2026 Salem Super Smashers · Pickle & Pilates",
} as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
/** The date line as it should read today. */
export function dateLine(): string {
  return event.dateStatus === "confirmed" && event.dateLabel ? event.dateLabel : event.dateTbaLabel;
}

export const siteData = { brand, meta, event, opening, hero, navCta, hosts, partnersReveal, details, action, sponsorsSection, sponsors, rsvp, social, footer } as const;
export type SiteData = typeof siteData;
