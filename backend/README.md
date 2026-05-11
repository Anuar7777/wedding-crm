# Event CRM API (NestJS)

REST API under the global prefix `/api`. OpenAPI UI: `/api/docs` when the server is running.

## Environment variables

Values are read from `process.env`. For local runs, use `backend/.env` (see `backend/.env.example`). In Docker, the root `.env` is interpolated into `docker-compose*.yml` and passed into the backend container.

Store secrets outside version control. Use long random strings for JWT signing keys in production.

| Variable                   | Required    | Description                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | Yes         | PostgreSQL connection URI (`postgresql://…`). Used by Prisma and the Nest `PrismaService` (driver adapter).                                                                                                                                                                                                                                                                                                                |
| `PG_POOL_MAX`              | No          | Max connections in the Node `pg` pool used by the Prisma driver adapter (`PrismaService`). Integer **1–200**; empty or unset → **20**. Raise only if you run many concurrent DB-heavy requests **and** Postgres `max_connections` (and any pooler) still has headroom; otherwise keep default or lower.                                                                                                                    |
| `TRUST_PROXY`              | No          | Must be the literal string `true` or `false` (empty counts as unset → validated default **`false`**). When **`true`**, Express `trust proxy` is enabled so **per-IP rate limits** on `POST /api/guests` use `X-Forwarded-For` / proxy headers. Use **`true`** behind nginx, Traefik, Cloudflare, or Docker reverse proxies; use **`false`** for direct local access or if you do not terminate TLS/proxy in front of Nest. |
| `JWT_ACCESS_SECRET`        | Yes         | Secret for signing access JWTs. Minimum length enforced by config validation (8+).                                                                                                                                                                                                                                                                                                                                         |
| `JWT_REFRESH_SECRET`       | Yes         | Secret for signing refresh JWTs. Must differ from the access secret.                                                                                                                                                                                                                                                                                                                                                       |
| `JWT_ACCESS_EXPIRATION`    | No          | Access token lifetime (e.g. `15m`). Default `15m` if unset in validation.                                                                                                                                                                                                                                                                                                                                                  |
| `JWT_REFRESH_EXPIRATION`   | No          | Refresh token lifetime (e.g. `7d`). Default `7d` if unset in validation.                                                                                                                                                                                                                                                                                                                                                   |
| `PORT`                     | No          | HTTP listen port. Defaults to `3000` in code and in Docker.                                                                                                                                                                                                                                                                                                                                                                |
| `NODE_ENV`                 | No          | Typical values `development` / `production`. Affects Nest logging mode, not Joi defaults.                                                                                                                                                                                                                                                                                                                                  |
| `TELEGRAM_BOT_TOKEN`       | No          | Telegram Bot API token. If empty, RSVP notifications are skipped (see `TelegramService`).                                                                                                                                                                                                                                                                                                                                  |
| `CORS_ORIGIN`              | Recommended | Comma-separated list of allowed browser origins (no spaces, or trim in code). If unset, `main.ts` falls back to `http://localhost:3001` only — set explicitly for production frontends.                                                                                                                                                                                                                                    |
| `LOG_LEVEL`                | No          | Comma-separated Nest log levels (`log`, `error`, `warn`, `debug`, `verbose`, `fatal`). Invalid tokens are ignored.                                                                                                                                                                                                                                                                                                         |
| `LOG_STACK`                | No          | When not `false`, exception stacks are included in error logs for non-5xx where applicable.                                                                                                                                                                                                                                                                                                                                |
| `LOG_BODY`                 | No          | When `true`, request bodies may be logged (sanitized). Prefer `false` in production unless debugging.                                                                                                                                                                                                                                                                                                                      |
| `LOG_4XX`                  | No          | When `false`, successful responses that are HTTP 4xx may be suppressed from access-style logging. Default-on behavior in `HttpLoggingInterceptor`.                                                                                                                                                                                                                                                                         |
| `SEED_SUPERADMIN_EMAIL`    | For seed    | Used only by `prisma/seed.ts`. Together with `SEED_SUPERADMIN_PASSWORD`, creates a `SUPERADMIN` if that email does not exist.                                                                                                                                                                                                                                                                                              |
| `SEED_SUPERADMIN_PASSWORD` | For seed    | Plain-text password only for the seed run; stored hashed (Argon2). Minimum **12** characters. **Never** log or commit.                                                                                                                                                                                                                                                                                                     |
| `DEFAULT_RESET_PASSWORD`   | No          | If non-empty, `GET /api/users/reset-password-default` returns it so the CRM can prefill the SuperAdmin “reset password” dialog. Same value for every user; rotate after use in production.                                                                                                                                                                                                                                 |

### Typical defaults by environment

| Scenario                                                                  | `PG_POOL_MAX`                                                                                        | `TRUST_PROXY`                                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Local dev (`nest start`, browser hits API directly)                       | omit (**20** in code)                                                                                | **`false`** or omit                                                    |
| Docker Compose, port published to host, no reverse proxy in front of Nest | omit (**20**)                                                                                        | **`false`**                                                            |
| Production behind nginx, Kubernetes ingress, or CDN                       | **20–40** for a single instance if Postgres `max_connections` (and PgBouncer, if any) still has room | **`true`**, otherwise throttling sees one upstream IP for every client |
| Several backend replicas                                                  | Sum of all instances’ pools must stay under the DB limit; often **10–20** per replica                | **`true`** when the same L7 proxy fronts all replicas                  |

`PG_POOL_MAX` and `TRUST_PROXY` are validated in `src/config/env.validation.ts`. An empty `PG_POOL_MAX` in Compose is treated as unset; the app keeps the built-in pool default (**20**).

### Variables not in Joi but used at bootstrap

`CORS_ORIGIN` and `LOG_LEVEL` are read in `main.ts` without going through Joi; all other variables in the table above are validated in `src/config/env.validation.ts` unless noted otherwise.

## Prisma and database

```bash
yarn workspace backend prisma:generate
yarn workspace backend prisma:migrate        # dev migrations
yarn workspace backend prisma:migrate:deploy # CI / production
```

### SuperAdmin seed

Configured in `prisma.config.ts` (`migrations.seed`). Run manually:

```bash
cd backend
cp .env.example .env
# set DATABASE_URL and optional SEED_SUPERADMIN_*
yarn prisma db seed
```

- If **both** `SEED_SUPERADMIN_EMAIL` and `SEED_SUPERADMIN_PASSWORD` are unset or empty, the seed exits successfully without touching the database.
- If only one of them is set, the seed **fails** (misconfiguration).
- If the user already exists, the seed logs and does nothing.
- Passwords are **not** printed to stdout.

## Docker

The backend image entrypoint runs, in order: **`prisma migrate deploy`** → **`prisma db seed`** → **`yarn start:prod`**. Pass `SEED_SUPERADMIN_*` through Compose when you want an initial SuperAdmin; omit both to skip seeding.

## PostgreSQL CLI

`psql` defaults the database name to the username when `-d` is omitted. Use your application database explicitly:

```bash
docker exec -it wedding-crm-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

(Adjust container name and variables to match your `docker-compose` service and `.env`.)

## Security notes

- Treat JWT secrets and seed passwords like production credentials: rotate them if exposed.
- Prefer an explicit `CORS_ORIGIN` allowlist over relying on localhost defaults on servers.
- Avoid enabling `LOG_BODY` on production unless necessary; logs should not become a data exfiltration channel.
