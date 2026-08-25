/**
 * Base URL for the PHP admin/RSVP API (sss-admin/).
 *
 * Defaults to a same-origin relative path, which only works when
 * `sss-admin/` is deployed on the exact same domain as the built site
 * (see sss-admin/README.md). Static hosts that can't run PHP themselves
 * (Vercel, Netlify, GitHub Pages, ...) need the PHP backend deployed
 * elsewhere — set VITE_API_BASE_URL to that origin (e.g.
 * "https://admin.your-domain.com") and every environment (local dev,
 * preview, any hosting platform) will point at the right place. The PHP
 * endpoints already send `Access-Control-Allow-Origin: *`, so cross-origin
 * requests work once this is set.
 */
export const API_BASE = `${(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "")}/sss-admin/api`;
