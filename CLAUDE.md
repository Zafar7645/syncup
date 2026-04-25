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

Backend requires a `.env` file at `apps/backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:4200
```

Database schema is in `database/init.sql`. PostgreSQL must be running on `:5432`.

## Path Aliases

- Backend: `@/` → `src/`
- Frontend: `@/` → `src/`
- Shared libs: `@shared/dtos` and `@shared/validation` → `libs/*/src`
