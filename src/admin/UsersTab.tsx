import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "./api";
import { inputClass } from "./Modal";
import { INTEREST_LABELS, SLOT_LABELS, formatCurrency, formatDate } from "./format";
import type { Guest } from "./types";

const SLOTS = Object.entries(SLOT_LABELS);
const INTERESTS = Object.entries(INTEREST_LABELS);
const ATTENDANCE_LABELS: Record<string, string> = { yes: "Count me in", no: "Can't make it" };

function paymentBadge(status: string | null, amount: string | null) {
  if (!status) {
    return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">No payment</span>;
  }
  const tone =
    status === "paid"
      ? "bg-green-100 text-green-700"
      : status === "failed"
        ? "bg-red-100 text-red-700"
        : status === "refunded"
          ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-600";
  const label = status.charAt(0).toUpperCase() + status.slice(1) + (amount ? ` · ${formatCurrency(amount)}` : "");
  return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{label}</span>;
}

function attendanceBadge(attendance: string) {
  const tone = attendance === "yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{ATTENDANCE_LABELS[attendance] ?? attendance}</span>;
}

interface UsersTabProps {
  /** Called after every successful load so the Payments tab's guest picker stays fresh. */
  onGuestsChanged: (guests: Guest[]) => void;
}

export function UsersTab({ onGuestsChanged }: UsersTabProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [query, setQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(
    (q: string, attendance: string, slot: string, interest: string) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (attendance) params.set("attendance", attendance);
      if (slot) params.set("slot", slot);
      if (interest) params.set("interest", interest);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return adminApi<{ users: Guest[] }>(`users_list.php${qs}`)
        .then((data) => {
          setGuests(data.users);
          onGuestsChanged(data.users);
        })
        .finally(() => setLoading(false));
    },
    [onGuestsChanged]
  );

  useEffect(() => {
    load("", "", "", "");
    // Loaded once on mount; subsequent loads are driven by the filters below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(value.trim(), attendanceFilter, slotFilter, interestFilter), 300);
  };

  const onAttendanceFilter = (value: string) => {
    setAttendanceFilter(value);
    load(query.trim(), value, slotFilter, interestFilter);
  };

  const onSlotFilter = (value: string) => {
    setSlotFilter(value);
    load(query.trim(), attendanceFilter, value, interestFilter);
  };

  const onInterestFilter = (value: string) => {
    setInterestFilter(value);
    load(query.trim(), attendanceFilter, slotFilter, value);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search name, email or WhatsApp number…"
          className={`max-w-xs flex-1 ${inputClass}`}
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select
          value={attendanceFilter}
          onChange={(e) => onAttendanceFilter(e.target.value)}
          className={`w-auto ${inputClass}`}
          aria-label="Filter by attendance"
        >
          <option value="">Will you be joining us? (all)</option>
          <option value="yes">Count me in</option>
          <option value="no">Can't make it</option>
        </select>
        <select
          value={slotFilter}
          onChange={(e) => onSlotFilter(e.target.value)}
          className={`w-auto ${inputClass}`}
          aria-label="Filter by time slot"
        >
          <option value="">All slots</option>
          {SLOTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={interestFilter}
          onChange={(e) => onInterestFilter(e.target.value)}
          className={`w-auto ${inputClass}`}
          aria-label="Filter by I'm here for"
        >
          <option value="">All interests</option>
          {INTERESTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">WhatsApp</th>
              <th className="px-4 py-2.5">Attending</th>
              <th className="px-4 py-2.5 text-center">Guests</th>
              <th className="px-4 py-2.5">Slot</th>
              <th className="px-4 py-2.5">Interest</th>
              <th className="w-full px-4 py-2.5">Message</th>
              <th className="whitespace-nowrap px-4 py-2.5">Payment</th>
              <th className="whitespace-nowrap px-4 py-2.5">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guests.map((g) => (
              <tr key={g.id} className="align-top text-gray-700">
                <td className="max-w-[10rem] truncate px-4 py-2.5 font-medium text-gray-900">{g.name}</td>
                <td className="max-w-[13rem] truncate px-4 py-2.5">{g.email}</td>
                <td className="whitespace-nowrap px-4 py-2.5">{g.whatsapp}</td>
                <td className="whitespace-nowrap px-4 py-2.5">{attendanceBadge(g.attendance)}</td>
                <td className="px-4 py-2.5 text-center tabular-nums">{g.guests}</td>
                <td className="whitespace-nowrap px-4 py-2.5">{(g.slot && SLOT_LABELS[g.slot]) || g.slot || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5">{(g.interest && INTEREST_LABELS[g.interest]) || g.interest || "—"}</td>
                <td className="whitespace-pre-wrap break-words px-4 py-2.5">{g.message || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5">{paymentBadge(g.payment_status, g.payment_amount)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">{formatDate(g.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && guests.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-400">No submissions match.</p>}
      </div>
    </div>
  );
}
