# Changelog

All notable changes to SyncUp are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Changes on `main` not yet tagged as a release.

---

## [1.0.0] - 2026-04-26

### Added

**Authentication**
- User registration with name, email, and bcrypt-hashed password
- User login returning a signed JWT (60-minute expiry)
- `JwtAuthGuard` protecting all non-auth routes
- `TokenInterceptor` on the frontend automatically attaching `Authorization: Bearer` headers
- `AuthGuard` route guard redirecting unauthenticated users to `/auth/login`

**Projects**
- Full CRUD for user-owned projects (name, optional description)
- Dashboard page listing all projects with edit and delete actions
- Auto-creation of three default board columns ("To Do", "In Progress", "Done") when a project is created
- Navigation from project card to Kanban board at `/projects/:id`

**Kanban Board**
- Board columns with name and display order
- Full CRUD for columns: add, rename (inline), delete with task-count confirmation
- Tasks within columns: title and optional description
- Drag-and-drop task reordering within a column (Angular CDK)
- Drag-and-drop task movement between columns, persisted via `PATCH /tasks/:id`
- Inline "Add task" form at the bottom of each column
- Edit task modal (title and description)

**Design System**
- Light-and-clean UI with Inter font
- CSS custom properties for all design tokens (colours, radii, shadows, typography)
- Shared utility classes: `.btn`, `.form-input`, `.card`, `.modal-*`, `.spinner`, `.alert`
- Responsive project grid on the dashboard
- Sticky top navigation with user avatar menu and sign-out

**Infrastructure**
- NPM Workspaces monorepo (`apps/backend`, `apps/frontend`, `libs/`)
- Shared `libs/shared-dtos` and `libs/shared-validation` consumed by both apps
- PostgreSQL schema in `database/init.sql`
- GitHub Actions workflow for linting on push and pull request
- `.env`-based configuration via `@nestjs/config`

---

[Unreleased]: https://github.com/Zafar7645/syncup/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Zafar7645/syncup/releases/tag/v1.0.0
