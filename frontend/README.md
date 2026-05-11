# Wedding CRM frontend

Next.js App Router: public invitation pages and authenticated CRM under `/crm`.

## Environment

Copy `frontend/.env.example` to `frontend/.env.local` and set variables there (or export them in your shell). No values are implied by the repo; you choose URLs and ports for your setup.

| Variable                         | Purpose                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`       | Base URL of the Nest API (browser must reach it; include scheme, no trailing slash).          |
| `NEXT_PUBLIC_INVITE_URL_WEDDING` | Optional. Public base for the main invitation QR/links. Empty uses same-origin `/invitation`. |
| `NEXT_PUBLIC_INVITE_URL_BRIDE`   | Optional. Public base for the alternate invitation route. Empty uses same-origin `/wXneoFY1`. |

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
- The RSVP form posts to `POST /api/guests` on the API configured by `NEXT_PUBLIC_API_BASE_URL`.

Payload fields include `fullName`, `type`, `status`, and optional `partnerFullName`.

## Docker

Stack configuration lives in the repository root. See the root `README.md` for `docker compose` and the root `.env.example` (required for compose; no substituted defaults).
