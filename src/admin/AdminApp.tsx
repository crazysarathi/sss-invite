import { useEffect, useState } from "react";
import { adminApi } from "./api";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import type { Session } from "./types";

/**
 * Root of the admin panel — a self-contained React app mounted at /sss-admin
 * (see src/main.tsx) that talks to sss-admin/api/*.php for data. There is no
 * server-rendered admin page any more, so on load/refresh it asks
 * api/me.php whether the PHP session is already signed in.
 */
export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<{ authenticated: boolean; username?: string; csrf?: string }>("me.php")
      .then((data) => {
        if (data.authenticated && data.username && data.csrf) {
          setSession({ username: data.username, csrf: data.csrf });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">Loading…</div>;
  }

  if (!session) {
    return <AdminLogin onLogin={setSession} />;
  }

  return <AdminDashboard session={session} onLogout={() => setSession(null)} />;
}
