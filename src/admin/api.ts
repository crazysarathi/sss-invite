const BASE = "/sss-admin/api/";

export class ApiError extends Error {}

interface ApiOpts {
  method?: "GET" | "POST";
  body?: unknown;
  csrf?: string;
}

/** Thin fetch wrapper for the PHP JSON API — mirrors the old admin.js `api()` helper. */
export async function adminApi<T = unknown>(path: string, opts: ApiOpts = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = {};
  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
    if (opts.csrf) headers["X-CSRF-Token"] = opts.csrf;
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(typeof data.error === "string" ? data.error : `Request failed (${res.status})`);
  }
  return data as T;
}
