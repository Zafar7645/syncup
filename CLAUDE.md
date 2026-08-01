# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SyncUp is a full-stack project management and collaboration tool — a Kanban-style app with real-time task tracking. It's structured as an NPM Workspaces monorepo with a NestJS backend, Angular 20 frontend, and shared TypeScript libraries.

## Commands

Run from the repo root unless noted otherwise.

### Development

```bash
npm run start:backend    # NestJS API on :3000 (watch mode)
npm run start:frontend   # Angular dev server on :4200
npm run lint             # Lint both apps
```

### Backend only (from apps/backend/)

```bash
npm run start:dev        # Watch mode
npm run test             # Jest unit tests
npm run test:watch       # Jest in watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # End-to-end tests
npm run format           # Prettier (src/ and test/)
```

### Frontend only (from apps/frontend/)

```bash
ng serve --open          # Dev server + open browser
ng test                  # Karma + Jasmine
ng lint                  # ESLint
ng build                 # Production build to dist/
```

### Docker

Runs the whole stack (Postgres, backend, frontend) in containers — an alternative to the native workflow above, not a replacement for it. Requires a root-level `.env` (copy from `.env.example`); see [Environment Setup](#environment-setup).

```bash
docker compose up -d --build   # Build images and start db, backend, frontend
docker compose logs -f backend # Tail a single service's logs
docker compose down            # Stop and remove containers (keeps the db volume)
docker compose down -v         # Also drop the db volume (required after changing DB_USERNAME/DB_PASSWORD)
```

- `apps/backend/Dockerfile` — multi-stage build; `nest build` (webpack) bundles all dependencies into a single `dist/main.js`, so the runtime image ships no `node_modules` and runs as the unprivileged `node` user.
- `apps/frontend/Dockerfile` — builds the Angular app, then serves the static `browser/` output via `nginx`. `apps/frontend/nginx.conf.template` proxies `/api/*` to the `backend` container and is rendered from `BACKEND_HOST`/`BACKEND_PORT` at container start.
- The frontend is reached at `http://localhost:${FRONTEND_PORT:-4200}`; Postgres is bound to `127.0.0.1` only, not exposed beyond the host.

## Architecture

### Entity Relationships

```
User (1) ──> (N) Project ──> (N) BoardColumn ──> (N) Task
```

### Data Flow

1. Frontend attaches JWT via `TokenInterceptor` on every outgoing request.
2. Backend `JwtAuthGuard` (Passport.js) validates the token on protected routes.
3. `req.user` is populated as `{ userId: number, email: string }` from the JWT payload.
4. Services query PostgreSQL via TypeORM repositories.
5. Response shapes use shared DTOs from `libs/shared-dtos`.

### Backend (`apps/backend/`)

NestJS 11 with TypeORM and PostgreSQL. Feature modules: `auth`, `users`, `projects`, `board-columns`, `tasks` — all imported into `AppModule`.

Key patterns:
- Protected routes use `@UseGuards(JwtAuthGuard)`.
- `@nestjs/config` + `ConfigService` for all env access.
- `ValidationPipe` is global with `whitelist: true` and `forbidNonWhitelisted: true`.
- TypeORM auto-sync is on in development, off in production.
- Registration uses a transaction and rolls back on duplicate email (`ConflictException`).

### Frontend (`apps/frontend/`)

Angular 20 with standalone components. Lazy-loaded `AuthModule` handles login/register. The `dashboard` page is the main protected route.

Key patterns:
- `AuthGuard` on protected routes; redirects unauthenticated users to `/auth/login`.
- `TokenInterceptor` reads the JWT from `localStorage` and injects `Authorization: Bearer <token>`.
- API base URL is set in `src/environments/` and read by `AuthService`.
- JWT expires in 60 minutes; no refresh token flow exists yet.

### Shared Libraries (`libs/`)

| Library | Contents |
|---|---|
| `shared-dtos` | `LoginUserDto`, `RegisterUserDto`, `AccessTokenDto`, `UserResponseDto` |
| `shared-validation` | Email regex, password regex and constants (min length, required char classes) |

Both frontend form validators and backend class-validator decorators consume the same constants from `shared-validation`.

## Environment Setup

Two separate `.env` files depending on how you run the app — they are not interchangeable and neither is read by the other workflow.

**Native (`npm run start:backend`)** — requires `apps/backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...
JWT_SECRET=...
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGIN=http://localhost:4200
```

PostgreSQL must be running on `:5432` yourself (e.g. `docker compose up -d db`, or a local install). Database schema is in `database/init.sql`.

**Docker (`docker compose up`)** — requires a root-level `.env` (copy from `.env.example`). Same variable names, but `DB_HOST` is not needed (compose sets it to `db` internally) and it additionally sets `DB_PORT`/`BACKEND_PORT`/`FRONTEND_PORT` for host port mappings. See [Docker](#docker) above. `DB_USERNAME`/`DB_PASSWORD` are only applied the first time the `pgdata` volume is created — changing them later requires `docker compose down -v`.

## Path Aliases

- Backend: `@/` → `src/`
- Frontend: `@/` → `src/`
- Shared libs: `@shared/dtos` and `@shared/validation` → `libs/*/src`
