# Contributing to SyncUp

Thank you for your interest in contributing! SyncUp is a learning-first project — a place to experiment with real-world patterns in NestJS and Angular, collaborate with others, and grow as a developer. Every contribution, no matter how small, is valued.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/syncup.git
   cd syncup
   ```
3. **Add the upstream remote** so you can pull in future changes:
   ```bash
   git remote add upstream https://github.com/Zafar7645/syncup.git
   ```

---

## Development Setup

Follow the [Quick Start](README.md#-quick-start) in the README. Once the app is running:

```bash
# Lint both apps
npm run lint

# Run backend unit tests
cd apps/backend && npm test

# Run backend e2e tests
cd apps/backend && npm run test:e2e

# Run frontend tests
cd apps/frontend && ng test
```

---

## Branching Strategy

Branch from `main` and merge back to `main`. Use the following prefixes:

| Prefix | When to use |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code change with no behaviour change |
| `test/` | Adding or fixing tests |
| `chore/` | Tooling, dependencies, CI |

**Example:** `feat/task-due-dates`, `fix/drag-drop-reorder`, `docs/api-reference`

---

## Commit Message Convention

SyncUp follows [Conventional Commits](https://www.conventionalcommits.org):

```
type(scope): short imperative description

Optional longer body explaining the why, not the what.
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Scopes:** `auth`, `projects`, `tasks`, `board-columns`, `ui`, `api`, `deps`, `docs`

**Examples:**
```
feat(tasks): add due date field to task entity
fix(auth): handle expired JWT gracefully on route guard
docs(api): add board-columns endpoint examples
chore(deps): upgrade @angular/cdk to 20.3.0
```

---

## Pull Request Process

1. Keep PRs **focused** — one feature or fix per PR.
2. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely.
3. Ensure `npm run lint` passes with no errors.
4. Add or update tests if your change affects business logic.
5. Screenshots are required for any UI change.
6. Link the related issue with `Closes #<issue-number>`.

A maintainer will review and merge. For large changes, open an issue first to discuss the approach.

---

## Code Standards

### General

- **No `any` in TypeScript.** Use proper types or generics.
- **Run the linter before pushing.** `npm run lint` must pass.
- **No hardcoded values.** Use constants, environment variables, or CSS tokens.

---

### Backend (NestJS)

**Architecture rules:**
- Business logic lives in **services**, not controllers. Controllers only handle HTTP concerns (parsing params, calling the service, returning the response).
- All protected routes must use `@UseGuards(JwtAuthGuard)`.
- Database access goes through `@InjectRepository` — never import repositories in controllers.
- Use `@nestjs/config`'s `ConfigService` for all environment variable access. Never use `process.env` directly.

**TypeORM rules:**
- Always declare `type: 'varchar'` on nullable string columns (`string | null`).  
  TypeScript emits `Object` as the reflected type for union types, which breaks PostgreSQL.  
  ✅ `@Column({ type: 'varchar', nullable: true }) description: string | null;`  
  ❌ `@Column({ nullable: true }) description: string | null;`
- Multi-step database writes must use a **transaction** (`manager.transaction(...)`).
- Concurrent-write scenarios must use **pessimistic write locks** (`setLock('pessimistic_write')`).
- When joining relations with a lock, use `innerJoinAndSelect`, not `leftJoinAndSelect` — PostgreSQL disallows `FOR UPDATE` on the nullable side of an outer join.

**Naming conventions:**
```
feature/
  feature.module.ts
  feature.controller.ts
  feature.service.ts
  entities/feature.entity.ts
  dto/create-feature.dto.ts
  dto/update-feature.dto.ts
```

**DTO validation:**
- Always use `class-validator` decorators.
- Use `PartialType` for update DTOs — never duplicate field definitions.
- Use `OmitType` when a field (like `projectId`) should not be updatable.

---

### Frontend (Angular)

**Component rules:**
- Use **standalone components** only. Never add new `NgModule` declarations.
- Use `inject()` for dependency injection in component classes, not constructor injection.
- Use **Reactive Forms** (`FormBuilder`, `FormGroup`). Template-driven forms are not used in this project.
- Page-level components go in `app/pages/<page-name>/`.
- Shared components (used across pages) go in `app/shared/<component-name>/`.

**Service rules:**
- All HTTP services use `environment.apiUrl` as the base URL — never hardcode `localhost:3000`.
- Services are `providedIn: 'root'` (tree-shakeable singletons).
- Use the `TokenInterceptor` to attach JWTs — never manually add `Authorization` headers in services.

**CSS rules:**
- Use CSS custom properties from `styles.css` for all colours, spacing, radii, and shadows.
  - ✅ `color: var(--color-accent);`
  - ❌ `color: #4f46e5;`
- Never use inline `style=""` attributes for anything beyond layout adjustments.
- Component CSS lives in the component's own `.css` file — never in `styles.css` (global file is for tokens and utilities only).

**Naming conventions:**
```
service:    feature.service.ts       (class: FeatureService)
model:      feature.model.ts         (interfaces only, no classes)
component:  my-feature.ts            (class: MyFeature, selector: app-my-feature)
```

**Template rules:**
- Use `@if`, `@for`, `@else` (Angular 17+ control flow) — not `*ngIf`, `*ngFor`.
- Use `@angular-eslint` a11y rules — they are enforced by the linter.

---

### Shared Libraries (`libs/`)

- `shared-dtos` — TypeScript DTO classes used by both the backend (class-validator) and frontend.
- `shared-validation` — Raw regex strings and error messages for email and password. Import these constants in both backend validators and frontend form validators.

Adding a new shared constant or DTO: update both the barrel exports (`index.ts`) and the consuming code.

---

## Testing

| Layer | Framework | Location |
|---|---|---|
| Backend unit | Jest | `apps/backend/src/**/*.spec.ts` |
| Backend e2e | Jest + Supertest | `apps/backend/test/` |
| Frontend unit | Karma + Jasmine | `apps/frontend/src/**/*.spec.ts` |

**Expectations for PRs:**
- New service methods should have unit tests covering the happy path and key error cases.
- Bug fixes should include a regression test.
- UI-only changes (CSS, template structure) do not require tests.

---

## Reporting Issues

- **Bug?** Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template.
- **Feature idea?** Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template.
- **Security vulnerability?** Read [SECURITY.md](SECURITY.md) — do **not** open a public issue.
- **Question?** Open a [Discussion](https://github.com/Zafar7645/syncup/discussions) on GitHub.

---

## Code of Conduct

By participating in this project you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
