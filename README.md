# Event CRM

Monorepo: NestJS API (`backend/`), Next.js frontend (`frontend/`), PostgreSQL via Docker Compose.

## Configuration

1. Copy the root template and fill every key:

   ```bash
   cp .env.example .env
   ```

2. Compose reads **only** the root `.env`. It does **not** fill in missing variables; leave nothing to “guess” at runtime.

3. Local development without the full stack:
   - Backend: `cp backend/.env.example backend/.env` and set `DATABASE_URL` to your Postgres instance.
   - Frontend: `cp frontend/.env.example frontend/.env.local` and set `BACKEND_INTERNAL_URL` to your Nest URL (e.g. `http://127.0.0.1:3000`).

### Root `.env` keys (Docker Compose)

| Variable                                                             | Used for                                                                                                                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WEDDING_CRM_IMAGE_REGISTRY`                                         | Prefix for built images (`image:` and `build` context tags).                                                                                                                                        |
| `WEDDING_CRM_IMAGE_TAG`                                              | Image tag for backend and frontend services.                                                                                                                                                        |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Database container and connection strings wired into the backend.                                                                                                                                   |
| `BACKEND_PORT`, `FRONTEND_PORT`                                      | Host ports mapped to containers.                                                                                                                                                                    |
| `JWT_*`, `TELEGRAM_BOT_TOKEN`, `CORS_ORIGIN`, `LOG_*`                | Backend container environment.                                                                                                                                                                      |
| `SEED_SUPERADMIN_EMAIL`, `SEED_SUPERADMIN_PASSWORD`                  | Optional. If both are set, the backend container runs `prisma db seed` after migrations and creates a `SUPERADMIN` when missing. Password must be at least 12 characters. Leave both empty to skip. |
| `DEFAULT_RESET_PASSWORD`                                             | Optional. Backend exposes it to SuperAdmin CRM as the suggested value when resetting another user’s password. Leave empty to require typing a new password each time.                               |
| `BACKEND_INTERNAL_URL`                                               | Optional. Nest URL for the Next.js `/api` proxy inside Docker (default in compose: `http://backend:3000`).                                                                                          |

Use the compose file that matches your workflow (`docker-compose.yml` vs `docker-compose-dev.yml`); both expect the same root `.env` shape for shared variables.

## Docker

Production-style stack (built images):

```bash
docker compose -f docker-compose.yml up --build
```

Development stack (bind-mounted frontend, Postgres + backend):

```bash
docker compose -f docker-compose-dev.yml up --build
```

## Local scripts (without Docker)

```bash
yarn install
yarn workspace backend start:dev
yarn workspace frontend dev
```

Ensure Postgres is running and `backend/.env` / `frontend/.env.local` are configured as above.

### Database seed (SuperAdmin)

The production Docker image runs `prisma migrate deploy`, then `prisma db seed`, then the API. Seed behavior is documented in `backend/README.md`. Configure `SEED_SUPERADMIN_*` in the root `.env` when using Compose, or in `backend/.env` when running seed locally.
