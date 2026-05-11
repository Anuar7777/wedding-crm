# Event CRM frontend

Next.js App Router: public invitation pages and authenticated CRM under `/crm`.

## Environment

Copy `frontend/.env.example` to `frontend/.env.local` and set variables there (or export them in your shell). No values are implied by the repo; you choose URLs and ports for your setup.

| Variable                         | Purpose                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_INTERNAL_URL`           | Nest base URL **only for the Next.js server** (rewrites `/api/*` → this host). Local dev: `http://127.0.0.1:<backend port>`. Docker: `http://backend:3000`. |
| `NEXT_PUBLIC_API_BASE_URL`       | Optional. If set, CRM and RSVP call this host instead of same-origin `/api` (direct API + CORS).                                                            |
| `NEXT_PUBLIC_INVITE_URL_WEDDING` | Optional. Public base for the main invitation QR/links. Empty uses same-origin `/invitation`.                                                               |
| `NEXT_PUBLIC_INVITE_URL_BRIDE`   | Optional. Public base for the alternate invitation route. Empty uses same-origin `/wXneoFY1`.                                                               |

## Run locally (monorepo)

From the repository root:

```bash
yarn install
cp frontend/.env.example frontend/.env.local
# edit frontend/.env.local
yarn workspace frontend dev
```

The dev server URL and port are printed by Next.js; open `/` and `/crm` from that origin.

## Invitation and RSVP

- Invitation routes include `/invitation` and `/wXneoFY1` (see `app/`).
- The RSVP form posts to `POST /api/guests` (same origin; Next proxies to Nest when `BACKEND_INTERNAL_URL` is set).

Payload fields include `fullName`, `type`, `status`, and optional `partnerFullName`.

## Docker

Stack configuration lives in the repository root. See the root `README.md` for `docker compose` and the root `.env.example` (required for compose; no substituted defaults).
