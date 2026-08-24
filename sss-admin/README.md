# Admin panel

PHP + MySQL backend for the Salem Super Smashers guest &amp; payment admin.
The UI itself is **not** here — it's a React app at `src/admin/` in the main
site, mounted at the `/sss-admin` route (see `src/main.tsx`). This folder is
purely a JSON API: session/auth, and CRUD for guests and payments.

Deployed alongside the built site (same domain), so the site and the admin
panel share one URL — the panel lives at `/sss-admin`, its API at
`/sss-admin/api/*.php`.

## Setup

1. Create the database and tables:
   ```
   mysql -u root -p < schema.sql
   ```
   This creates the `smashers_admin` database and seeds one admin login.

2. `config.php` already has the DB credentials (`localhost` / `root` /
   `password` / `smashers_admin`). Edit it if your MySQL setup differs.

3. In production, point an Apache/Nginx vhost (with PHP-FPM) at the site's
   document root, with this `sss-admin/` folder inside it. Two rules matter:
   - Real files under `sss-admin/api/*.php` execute as PHP, as normal.
   - Everything else that isn't a real file (`/sss-admin`, `/sss-admin/`,
     any client-side path) must fall back to the built `index.html`, same
     as every other route on the site — there's no `sss-admin/index.php`
     any more, the React app owns that route. This is the standard SPA
     "try_files" rewrite most static hosts already do by default; just
     make sure it isn't only scoped to the site root.

   For local testing, see "Local dev" below instead.

4. Log in with the seeded account:
   - Username: `admin`
   - Password: `admin123`

   **Change this password immediately.** Generate a new hash and update the row:
   ```
   php -r 'echo password_hash("your-new-password", PASSWORD_DEFAULT), PHP_EOL;'
   mysql -u root -p -e "UPDATE smashers_admin.admin_users SET password_hash='<hash>' WHERE username='admin';"
   ```

## Wiring up the existing RSVP form

`src/data/siteData.ts`'s `rsvp.submission` is already wired to
`mode: "endpoint"` with `endpoint: "/sss-admin/api/rsvp_submit.php"` — a
relative path, so it POSTs to this admin panel automatically once
`sss-admin/` is deployed alongside the built site under the same domain.
`api/rsvp_submit.php` is a public, unauthenticated endpoint that inserts
the payload into the `users` table: name, email, guests, slot, interest,
message, theme, plus a WhatsApp number — the endpoint reads it from either a
`whatsapp` key or the frontend's current `phone` key, since `RsvpPayload`
itself isn't touched by this change. The frontend's `attendance` field, if
sent, is ignored — the admin panel doesn't track it.

If the admin panel ever needs to live on a different domain than the site,
change `endpoint` to that full URL instead (e.g.
`"https://admin.your-domain/api/rsvp_submit.php"`).

## Local dev

Vite can't execute PHP, so `vite.config.ts` proxies just the API calls
(`/sss-admin/api`) to a local PHP server on port 8080 — see the
`server.proxy` entry there. The bare `/sss-admin` route itself is served by
Vite's own SPA fallback (same as production), so it isn't proxied.

Run the PHP server from the project root (one level *above* `sss-admin/`,
so the `/sss-admin/api/...` request paths resolve by folder name):
```
php -S 0.0.0.0:8080
```

## Session &amp; CSRF

There's no server-rendered page to embed a CSRF token into any more, so the
React app asks for one: `GET api/me.php` returns `{authenticated: false}`
or `{authenticated: true, username, csrf}` (checked once on load/refresh),
and `POST api/login.php` returns the same shape on success. The app sends
that token back as `X-CSRF-Token` on every state-changing call
(`*_save.php`, `*_delete.php`, `logout.php`) — see `src/admin/api.ts`.

## Structure

```
sss-admin/
  config.php          DB credentials + PDO connection + session bootstrap
  schema.sql           Tables: admin_users, users, payments
  includes/auth.php      current_admin() / require_api_auth() / require_csrf()
  api/
    bootstrap.php          Shared JSON/auth setup for the endpoints below
    login.php, logout.php, me.php     Session bootstrap for the React app
    stats.php                          Dashboard totals (guests, collected)
    users_list.php, users_save.php, users_delete.php
    payments_list.php, payments_save.php, payments_delete.php
    rsvp_submit.php          Public bridge endpoint (see above)
```

All authenticated endpoints require a logged-in session; state-changing
ones (`*_save.php`, `*_delete.php`, `logout.php`) also require the
`X-CSRF-Token` header.
