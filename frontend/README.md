# Wedding CRM Frontend

## Run locally

1. From the repository root, install dependencies (workspaces):

```bash
yarn install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
yarn workspace frontend dev
```

## Invitation route

- Main invitation page: `http://localhost:3000/invitation`
- Landing page: `http://localhost:3000/`

## RSVP backend integration

The invitation form submits to `POST /api/guests` on the backend.

Set these variables in `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL` - backend base URL (example: `http://localhost:3000`)

The form sends `fullName`, hidden `type`, `status`, and optional `partnerFullName`.
