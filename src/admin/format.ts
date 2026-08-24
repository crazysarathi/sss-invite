export const SLOT_LABELS: Record<string, string> = {
  "630-730am": "6:30–7:30 am",
  "8-9am": "8–9 am",
  "530-630pm": "5:30–6:30 pm",
};

export const INTEREST_LABELS: Record<string, string> = {
  pickle: "Pickle",
  pilates: "Pilates",
  both: "Want to try both",
  matcha: "Just matcha",
};

export const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatCurrency(value: string | number): string {
  return `₹${Number(value).toFixed(2)}`;
}
