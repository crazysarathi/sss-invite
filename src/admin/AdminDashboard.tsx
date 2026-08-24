import { useCallback, useEffect, useState } from "react";
import { adminApi } from "./api";
import { UsersTab } from "./UsersTab";
import { PaymentsTab } from "./PaymentsTab";
import { formatCurrency } from "./format";
import type { Guest, Session } from "./types";

interface AdminDashboardProps {
  session: Session;
  onLogout: () => void;
}

export function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<"users" | "payments">("users");
  const [stats, setStats] = useState<{ totalGuests: number; totalCollected: number } | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    adminApi<{ totalGuests: number; totalCollected: number }>("stats.php").then(setStats);
  }, []);

  const onGuestsChanged = useCallback((list: Guest[]) => setGuests(list), []);

  const logout = async () => {
    try {
      await adminApi("logout.php", { method: "POST", csrf: session.csrf });
    } finally {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Salem Super Smashers</h1>
          <p className="text-sm text-gray-500">Guest &amp; payment admin</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-700">{session.username}</span>
          <button onClick={logout} className="text-gray-500 hover:text-gray-900">
            Log out
          </button>
        </div>
      </header>

      <section className="mx-auto mt-6 grid max-w-[1600px] grid-cols-2 gap-4 px-6 sm:max-w-xs sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-semibold text-gray-900">{stats?.totalGuests ?? "—"}</div>
          <div className="text-xs text-gray-500">Total submissions</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-semibold text-gray-900">
            {stats ? formatCurrency(stats.totalCollected) : "—"}
          </div>
          <div className="text-xs text-gray-500">Collected</div>
        </div>
      </section>

      <nav className="mx-auto mt-6 flex max-w-[1600px] gap-1 px-6" role="tablist">
        {(["users", "payments"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-t-md border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "users" ? "Users" : "Payments"}
          </button>
        ))}
      </nav>

      <main className="mx-auto mt-4 max-w-[1600px] px-6">
        {/* Both tabs stay mounted (just hidden) so the guest list is ready for the
            Payments picker even if that tab is opened before Users ever loads. */}
        <div hidden={tab !== "users"}>
          <UsersTab onGuestsChanged={onGuestsChanged} />
        </div>
        <div hidden={tab !== "payments"}>
          <PaymentsTab session={session} guests={guests} />
        </div>
      </main>
    </div>
  );
}
