import { rsvp } from "@/data/siteData";

/** The guest-details payload — mirrors the form fields configured in siteData. */
export interface RsvpPayload {
  name: string;
  email: string;
  phone: string;
  attendance: string;
  guests: number;
  /** Which time slot the guest picked (e.g. "630-730am"). */
  slot: string;
  /** Which activity the guest is here for (e.g. "pickle", "pilates", "both", "matcha"). */
  interest: string;
  message: string;
  /** Which colour palette the guest submitted from — handy analytics for the client. */
  theme?: string;
}

/**
 * Submission handler. There is no backend in this project, so the default
 * mode is a mock that resolves after a short delay. Switch
 * `rsvp.submission.mode` in siteData to:
 *   - "formsubmit": POST as form-data to https://formsubmit.co/<endpoint>
 *     (endpoint = the destination email or its FormSubmit hash)
 *   - "endpoint":   POST JSON to `endpoint` (your own API)
 */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  const { mode, endpoint } = rsvp.submission;

  if (mode === "mock" || !endpoint) {
    await new Promise((r) => setTimeout(r, 900));
    if (import.meta.env.DEV) console.info("[rsvp:mock]", payload);
    return;
  }

  if (mode === "formsubmit") {
    const body = new FormData();
    Object.entries(payload).forEach(([k, v]) => body.append(k, String(v ?? "")));
    body.append("_subject", "Pickle & Pilates — new guest");
    body.append("_captcha", "false");
    const res = await fetch(`https://formsubmit.co/ajax/${endpoint}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
    });
    if (!res.ok) throw new Error(`FormSubmit ${res.status}`);
    return;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error((data && typeof data.error === "string" && data.error) || `Guest endpoint ${res.status}`);
  }
}

/** Per-slot registration counts, for greying out full slots in the form. */
export interface SlotAvailability {
  capacity: number;
  counts: Record<string, number>;
}

/**
 * Reads how full each time slot is from the same PHP endpoint `submitRsvp`
 * posts to (mode "endpoint" only — mock/formsubmit modes have no backend to ask).
 */
export async function fetchSlotAvailability(): Promise<SlotAvailability | null> {
  const { mode, endpoint } = rsvp.submission;
  if (mode !== "endpoint" || !endpoint) return null;

  try {
    const url = endpoint.replace(/rsvp_submit\.php$/, "slot_availability.php");
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as SlotAvailability;
  } catch {
    return null;
  }
}
