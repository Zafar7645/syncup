# High-Level Design — SyncUp

**Version:** 1.0.0

---

## 1. System Overview

SyncUp is a Kanban project management tool delivered as a web application. A user opens a browser, authenticates, and manages projects and tasks through a single-page Angular application that communicates with a NestJS REST API backed by PostgreSQL.

The primary design goals are:
- **Simplicity** — no microservices, no message queues; a single API server with a single database.
- **Learnability** — the codebase is structured to teach patterns (clean architecture, JWT auth, reactive frontend) rather than to optimise for scale.
- **Extensibility** — the monorepo and module structure make it straightforward to add features without touching unrelated code.

---

## 2. Architecture Pattern

**Monorepo** managed with NPM Workspaces:

```
syncup/
├── apps/backend/   → NestJS REST API
├── apps/frontend/  → Angular SPA
└── libs/           → Shared TypeScript code (consumed by both apps)
```

**Architectural style:** Traditional three-tier web application.

| Tier | Technology | Responsibility |
|---|---|---|
| Presentation | Angular 20 SPA | UI, routing, state management, drag-and-drop |
| Application | NestJS 11 REST API | Business logic, authentication, data validation |
| Data | PostgreSQL 15 | Persistent storage |

---

## 3. System Context Diagram

```mermaid
graph TD
    User(["👤 User\n(Browser)"])
    FE["Angular SPA\nlocalhost:4200"]
    BE["NestJS API\nlocalhost:3000"]
    DB[("PostgreSQL\nlocalhost:5432")]

    User -->|"HTTP / HTTPS\n(HTML, JS, CSS)"| FE
    FE -->|"REST + JWT\nJSON over HTTP"| BE
    BE -->|"SQL\n(TypeORM)"| DB
```

---

## 4. Component Diagram

```mermaid
graph LR
    subgraph Browser["Browser (Angular SPA)"]
        Router["Angular Router"]
        AuthMod["Auth Module\n(login, register)"]
        Dashboard["Dashboard Page\n(project list)"]
        Kanban["Kanban Board Page\n(columns + tasks)"]
        CDK["Angular CDK\n(drag & drop)"]
        TokenInt["Token Interceptor\n(attaches JWT)"]
        AuthGuard["Auth Guard\n(route protection)"]

        Router --> AuthMod
        Router --> Dashboard
        Router --> Kanban
        Kanban --> CDK
        TokenInt -.->|"adds Bearer header"| Router
        AuthGuard -.->|"redirects if unauth"| Router
    end

    subgraph API["NestJS API"]
        JwtGuard["JwtAuthGuard\n(validates token)"]
        AuthCtrl["Auth Controller\n/auth"]
        ProjCtrl["Projects Controller\n/projects"]
        ColCtrl["Board Columns Controller\n/board-columns"]
        TaskCtrl["Tasks Controller\n/tasks"]
        AuthSvc["Auth Service"]
        ProjSvc["Projects Service"]
        ColSvc["Board Columns Service"]
        TaskSvc["Tasks Service"]

        JwtGuard -.->|"protects"| ProjCtrl
        JwtGuard -.->|"protects"| ColCtrl
        JwtGuard -.->|"protects"| TaskCtrl

        AuthCtrl --> AuthSvc
        ProjCtrl --> ProjSvc
        ColCtrl --> ColSvc
        TaskCtrl --> TaskSvc
    end

    subgraph Shared["Shared Libraries (libs/)"]
        DTOs["shared-dtos\n(LoginUserDto, RegisterUserDto…)"]
        Val["shared-validation\n(email regex, password regex)"]
    end

    Browser -->|"HTTP requests"| API
    AuthSvc --> DTOs
    AuthMod --> DTOs
    AuthMod --> Val
    AuthSvc --> Val
```

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant TokenInterceptor
    participant API
    participant DB

    Browser->>API: POST /auth/login { email, password }
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User row (with hashed password)
    API->>API: bcrypt.compare(password, hash)
    API-->>Browser: 200 { access_token: "eyJ..." }
    Browser->>Browser: localStorage.setItem('access_token', token)

    Note over Browser,API: Subsequent protected requests

    Browser->>TokenInterceptor: HTTP request
    TokenInterceptor->>TokenInterceptor: Read token from localStorage
    TokenInterceptor->>API: HTTP request + Authorization: Bearer eyJ...
    API->>API: JwtAuthGuard validates token
    API-->>Browser: Protected resource
```

---

## 6. Kanban Board Load Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Angular
    participant API
    participant DB

    Browser->>Angular: Navigate to /projects/:id
    Angular->>Angular: AuthGuard checks localStorage token
    Angular->>API: GET /projects/:id
    API->>DB: SELECT project WHERE id=? AND user_id=?
    DB-->>API: Project row
    API-->>Angular: { id, name, ... }
    Angular->>API: GET /board-columns?projectId=:id
    API->>DB: SELECT columns + tasks WHERE projectId=? ORDER BY order
    DB-->>API: Columns with nested tasks
    API-->>Angular: [{ id, name, tasks: [...] }]
    Angular->>Browser: Render Kanban board
```

---

## 7. Drag & Drop — Task Move Flow

```mermaid
sequenceDiagram
    participant User
    participant Angular
    participant CDK as Angular CDK
    participant API

    User->>CDK: Drag task card from column A to column B
    CDK->>Angular: cdkDropListDropped event
    Angular->>Angular: transferArrayItem(colA.tasks, colB.tasks, fromIdx, toIdx)
    Note over Angular: UI updates instantly (optimistic)
    Angular->>API: PATCH /tasks/:id { columnId: B.id, order: newIdx }
    API-->>Angular: Updated task
    Note over Angular,API: On error: revert transferArrayItem
```

---

## 8. Security Architecture

| Concern | Mechanism |
|---|---|
| Password storage | bcrypt (configurable cost factor via `BCRYPT_SALT_ROUNDS`) |
| Session | Stateless JWT, signed with `JWT_SECRET`, 60-minute expiry |
| Transport | CORS restricted to `CORS_ORIGIN` env variable |
| Input sanitisation | NestJS `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true` |
| Authorisation | Service-layer ownership checks on every resource access |
| Token delivery | HTTP `Authorization: Bearer` header (not cookies) |

---

## 9. Deployment Topology (Development)

```
Developer machine
├── PostgreSQL on :5432
├── NestJS API on :3000  (npm run start:backend)
└── Angular DevServer on :4200  (npm run start:frontend)
```

Production topology is not defined in v1.0.0. The project is intended to be deployed by contributors as they see fit — Docker, cloud VMs, PaaS, etc.
