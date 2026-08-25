/**
 * PICKLE & PILATES — single source of truth for all invitation content.
 *
 * This mirrors the content the hosts sent (and nothing more):
 *
 *   Pickle & Pilates with Matcha & Ube Bar
 *   A Private, Ticketed Experience
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
import crestWisteria from "@/assets/logos/sss-crest-wisteria.webp";
import gurkhaLogo from "@/assets/logos/gurkha-logo.svg";
import tensLogo from "@/assets/logos/tens-logo.svg";
import sksHospitalLogo from "@/assets/partners/sks-hospital.webp";
import mahendraLogo from "@/assets/partners/mahendra.png";
import megawinLogo from "@/assets/partners/megawin.webp";
import venusEstatesLogo from "@/assets/partners/venus-estates.webp";
import technosportLogo from "@/assets/partners/technosport.png";
import yabaLogo from "@/assets/partners/yaba.webp";
import armoraaLogo from "@/assets/partners/armoraa.png";
import gurkhaSponsorLogo from "@/assets/partners/gurkha.svg";
import iaMotorsLogo from "@/assets/partners/ia-motors.webp";
import grandEstanciaLogo from "@/assets/partners/grand-estancia.png";
import tabInfinityLogo from "@/assets/partners/tab-infinity.png";
import weddingWhisperersLogo from "@/assets/partners/wedding-whisperers.webp";
import ecoWellLogo from "@/assets/partners/eco-well.jpg";
import tailoredLuxuryLogo from "@/assets/partners/tailored-luxury.webp";
import yococoLogo from "@/assets/partners/yococo.png";
import narasusCoffeeLogo from "@/assets/partners/narasus-coffee.webp";
import farmHarvestLogo from "@/assets/partners/farm-harvest.webp";

/* ------------------------------------------------------------------ */
/* Brand & hosts                                                       */
/* ------------------------------------------------------------------ */
export const brand = {
  name: "Pickle & Pilates",
  /** Split for display type: ["Pickle", "&", "Pilates"]. */
  nameParts: ["Pickle", "&", "Pilates"] as const,
  subline: "with Matcha & Ube Bar",
  tagline: "A Private, Ticketed Experience",
  host: "Salem Super Smashers",
  hostShort: "SSS",
  /** The hosts' crest, cut out to a transparent SVG (no card, no border). */
  hostCrest: crest,
  /**
   * The same crest re-inked in the site's own wisteria/lime — the client
   * asked for the logo on the "Logo launch" card WITHOUT its actual brand
   * colours (2026-08-25). Baked by scripts/crest-wisteria.py.
   */
  hostCrestTinted: crestWisteria,
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
    "Pickle & Pilates with Matcha & Ube Bar — a private, ticketed experience by Salem Super Smashers × Gurkha Life × The Tens Movement Lab × Wellness Bar at Forest Hills Country Club, Salem — 29th August, Saturday.",
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
  /** Runs along the lower arc of the seal's ring. */
  cta: "Open invitation",
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
  /** Client's wording, 2026-08-25. */
  kicker: "Salem Super Smashers: The Launch",
  logoKicker: "Logo launch",
  jerseyKicker: "Jersey launch",
  partnersKicker: "Players’ launch",
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
/* sponsors (their logos arrived the same day) sharing one partnership   */
/* title. Partnership titles from the hosts' sheet, 2026-08-25. Logos    */
/* that arrived on a white box were knocked out to transparent           */
/* (scripts/partners-knockout.py) so they sit on the medallion's paper.  */
/* ------------------------------------------------------------------ */
export interface Sponsor {
  name: string;
  /** "Official … Partner" — set in bold under the logo, inside the medallion. */
  role: string;
  logo?: string;
  /**
   * Let the artwork fill the whole medallion (object-cover, no paper
   * margin) — for logos that come on their own full-bleed background,
   * so the circle takes that background instead of showing a square
   * sitting on paper. Only for square art whose lettering sits well
   * inside the inscribed circle.
   */
  fill?: true;
  /**
   * Shrink the artwork inside its slot (1 = fill the slot). For marks that
   * read too large next to their neighbours — client asked for Venus
   * Estates to sit smaller.
   */
  scale?: number;
}

export const sponsorsSection = {
  id: "sponsors",
  kicker: "Our partners",
} as const;

export const sponsors: readonly Sponsor[] = [
  { name: "SKS Hospital", role: "Official Health Care Partner", logo: sksHospitalLogo },
  { name: "Mahendra", role: "Official Education Partner", logo: mahendraLogo },
  { name: "Megawin", role: "Official Energy Partner", logo: megawinLogo },
  { name: "Venus Estates", role: "Official Lifestyle Properties Partner", logo: venusEstatesLogo, scale: 0.68 },
  { name: "Technosport", role: "Official Activewear Partner", logo: technosportLogo },
  { name: "Yaba", role: "Official Paddle Partner", logo: yabaLogo, scale: 0.8 },
  { name: "Armoraa", role: "Official Skin & Wellness Partner", logo: armoraaLogo },
  { name: "Gurkha", role: "Official Fitness Gear Partner", logo: gurkhaSponsorLogo },
  { name: "IA Motors", role: "Official Automobile Partner", logo: iaMotorsLogo },
  { name: "Grand Estancia", role: "Official Salem Hospitality Partner", logo: grandEstanciaLogo },
  { name: "Tab Infinity", role: "Official Creative Partner", logo: tabInfinityLogo },
  { name: "Wedding Whisperers", role: "Official Photography Partner", logo: weddingWhisperersLogo },
  { name: "Eco Well", role: "Official Eco-Wellness Partner", logo: ecoWellLogo },
  { name: "Tailored Luxury For You", role: "Official Luxury Gifting Partner", logo: tailoredLuxuryLogo },
  { name: "Narasus Coffee", role: "Official Goodie Bag Partner", logo: narasusCoffeeLogo },
  { name: "Farm Harvest", role: "Official Goodie Bag Partner", logo: farmHarvestLogo },
  { name: "Yococo", role: "Official Refreshment Partner", logo: yococoLogo },
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
  /** Client's wording, 2026-08-25. */
  lead: "If you'd like to attend, express your interest below and we'll share the details with you personally.",
  fields: {
    name: { label: "Full name", placeholder: "Your name" },
    email: { label: "Email", placeholder: "you@example.com" },
    phone: { label: "WhatsApp number", placeholder: "98765 43210" },
    attendance: {
      label: "Will you be joining us?",
      options: [
        { value: "yes", label: "Count me in" },
        { value: "no", label: "Can't make it" },
      ],
    },
    /** Client's wording, 2026-08-25. */
    guests: { label: "No of guests attending", min: 1, max: 4 },
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
    /** Client's wording, 2026-08-25. Values are the backend's whitelist — change labels only. */
    interest: {
      label: "I'm here",
      options: [
        { value: "pickle", label: "For pickleball" },
        { value: "pilates", label: "For Pilates" },
        { value: "both", label: "To try both" },
        { value: "matcha", label: "Just for matcha and Ube" },
      ],
      /** Client's wording, 2026-08-25 — set bold and highlighted right under the select. */
      note: "*Session participation is limited to registered participants only.",
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
  /**
   * Client's wording, 2026-08-25 — the crest and "Hosted by" now sit right
   * under the script (the "See you on the court" lines were dropped), with
   * this registration line beneath them.
   */
  secureLine: "Secure your spot & receive your BookMyShow registration link!",
  /**
   * Client's wording, 2026-08-25 — replaces the "host × partners" line
   * under the crest (that list still heads the hero). `lead` is the bold
   * run of the line, `rest` the remainder.
   */
  goodieBag: {
    title: "Your Goodie Bag Awaits",
    line: {
      lead: "Simply present your QR code at the Registration Desk",
      rest: " on the day of the event to collect yours.",
    },
  },
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
