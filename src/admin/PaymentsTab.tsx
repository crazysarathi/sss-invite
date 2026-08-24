import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { adminApi } from "./api";
import { Modal, ConfirmDialog, inputClass } from "./Modal";
import { METHOD_LABELS, formatCurrency, formatDate } from "./format";
import type { Guest, Payment, Session } from "./types";

const METHODS = Object.entries(METHOD_LABELS);
const STATUSES = ["pending", "paid", "failed", "refunded"] as const;

const emptyForm = {
  id: 0,
  user_id: "",
  amount: "",
  method: "upi",
  status: "pending",
  reference: "",
  notes: "",
  paid_at: "",
};
type FormState = typeof emptyForm;

function statusBadge(status: string) {
  const tone =
    status === "paid"
      ? "bg-green-100 text-green-700"
      : status === "failed"
        ? "bg-red-100 text-red-700"
        : status === "refunded"
          ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-600";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>{status}</span>;
}

/** "2026-08-24 15:30:00" <-> "2026-08-24T15:30" (datetime-local input value). */
function toLocalInput(value: string | null): string {
  return value ? value.replace(" ", "T").slice(0, 16) : "";
}
function fromLocalInput(value: string): string {
  return value ? `${value.replace("T", " ")}:00` : "";
}

interface PaymentsTabProps {
  session: Session;
  guests: Guest[];
}

export function PaymentsTab({ session, guests }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback((q: string) => {
    setLoading(true);
    const qs = q ? `?q=${encodeURIComponent(q)}` : "";
    return adminApi<{ payments: Payment[] }>(`payments_list.php${qs}`)
      .then((data) => setPayments(data.payments))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(value.trim()), 300);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (p: Payment) => {
    setForm({
      id: p.id,
      user_id: String(p.user_id),
      amount: p.amount,
      method: p.method,
      status: p.status,
      reference: p.reference ?? "",
      notes: p.notes ?? "",
      paid_at: toLocalInput(p.paid_at),
    });
    setFormError("");
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    await adminApi("payments_delete.php", { method: "POST", csrf: session.csrf, body: { id } });
    load(query.trim());
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await adminApi("payments_save.php", {
        method: "POST",
        csrf: session.csrf,
        body: {
          id: form.id || undefined,
          user_id: Number(form.user_id),
          amount: Number(form.amount || 0),
          method: form.method,
          status: form.status,
          reference: form.reference,
          notes: form.notes,
          paid_at: fromLocalInput(form.paid_at),
        },
      });
      setModalOpen(false);
      load(query.trim());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search guest, email or reference…"
          className={`max-w-xs flex-1 ${inputClass}`}
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button
          onClick={openAdd}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Record payment
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Guest</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Method</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Reference</th>
              <th className="px-4 py-2.5">Paid at</th>
              <th className="px-4 py-2.5">Notes</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="text-gray-700">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">{p.user_name}</div>
                  <div className="text-xs text-gray-400">{p.user_email}</div>
                </td>
                <td className="px-4 py-2.5">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-2.5">{METHOD_LABELS[p.method] || p.method}</td>
                <td className="px-4 py-2.5">{statusBadge(p.status)}</td>
                <td className="px-4 py-2.5">{p.reference || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">{formatDate(p.paid_at)}</td>
                <td className="max-w-[14rem] whitespace-pre-wrap break-words px-4 py-2.5">{p.notes || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right">
                  <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-gray-900">
                    Edit
                  </button>
                  <button onClick={() => setPendingDelete(p)} className="ml-3 text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && payments.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-400">No payments recorded yet.</p>
        )}
      </div>

      {modalOpen && (
        <Modal title={form.id ? "Edit payment" : "Record payment"} onClose={() => setModalOpen(false)}>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Guest
              <select
                className={`mt-1 ${inputClass}`}
                value={form.user_id}
                onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Choose a guest…
                </option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} — {g.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹)
              <input
                type="number"
                min={0}
                step="0.01"
                className={`mt-1 ${inputClass}`}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Method
              <select
                className={`mt-1 ${inputClass}`}
                value={form.method}
                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
              >
                {METHODS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Status
              <select
                className={`mt-1 ${inputClass}`}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Reference
              <input
                placeholder="Transaction / UTR id"
                className={`mt-1 ${inputClass}`}
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Paid at
              <input
                type="datetime-local"
                className={`mt-1 ${inputClass}`}
                value={form.paid_at}
                onChange={(e) => setForm((f) => ({ ...f, paid_at: e.target.value }))}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Notes
              <textarea
                rows={2}
                className={`mt-1 ${inputClass}`}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </label>

            {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete payment?"
          body={
            <>
              This removes the {formatCurrency(pendingDelete.amount)} payment record for{" "}
              <strong className="text-gray-900">{pendingDelete.user_name}</strong>. This can't be undone.
            </>
          }
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
