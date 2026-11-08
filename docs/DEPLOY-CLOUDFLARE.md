# Deploying GAFOTEC (Cloudflare Workers + Supabase)

Stack: TanStack Start (SSR) on a Cloudflare Worker, Supabase (Postgres, Auth, Storage). No Base44 runtime.

## Variables
| Name | Where | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | build environment (Cloudflare Workers Builds, or local `.env`) | no, public by design |
| `VITE_ENABLE_GOOGLE_LOGIN` | build environment, `true` only once Google is configured in Supabase | no |
| `SUPABASE_URL` | Worker runtime variable | no |
| `SUPABASE_SERVICE_ROLE_KEY` | **Worker secret** (`wrangler secret put SUPABASE_SERVICE_ROLE_KEY`) | **yes. Never in Git, never `VITE_`** |

Local development: put the two runtime values in `.dev.vars` (git-ignored). `vite preview` reads `dist/server/.dev.vars`.

## First deployment (test URL, production untouched)
1. Cloudflare account (free). `npx wrangler login`.
2. `npm ci && npm run build` (with the two `VITE_*` values set), then `npx wrangler deploy` (deploys `gafotec` on `*.workers.dev`).
3. `npx wrangler secret put SUPABASE_URL` and `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`.
4. `npm run check:bundle` after every build: fails if a service-role key or Base44 runtime is in the browser bundle.

## Supabase Auth settings (Dashboard > Authentication)
1. **Sign In / Providers**: disable "Allow new users to sign up".
2. **URL Configuration**: Site URL = the Worker URL (later the domain); add `<site>/reset-password` and `<site>/login` to Redirect URLs.
3. **SMTP**: custom SMTP is required for real e-mails (the built-in sender only reaches project members and is rate-limited). Free options: Brevo, Resend.
4. **Email templates**: signup confirmation must contain `{{ .Token }}` (6-digit code) because the register page asks for a code.
5. **Admin**: Authentication > Users > Add user (auto-confirm), then promote with SQL (see `supabase/` README comments). Never share the password.
