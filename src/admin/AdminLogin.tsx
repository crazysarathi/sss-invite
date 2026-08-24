import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { adminApi } from "./api";
import { inputClass } from "./Modal";
import type { Session } from "./types";

interface AdminLoginProps {
  onLogin: (session: Session) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await adminApi<{ username: string; csrf: string }>("login.php", {
        method: "POST",
        body: { username, password },
      });
      onLogin({ username: data.username, csrf: data.csrf });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Admin login</h1>
        <p className="mt-1 text-sm text-gray-500">Salem Super Smashers — guest &amp; payment records</p>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="mt-5 block text-sm font-medium text-gray-700">
          Username
          <input
            className={`mt-1 ${inputClass}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            className={`mt-1 ${inputClass}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Sign in
        </button>
      </form>
    </div>
  );
}
