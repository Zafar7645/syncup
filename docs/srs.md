# Software Requirements Specification — SyncUp

**Version:** 1.0.0  
**Date:** 2026-04-26  
**Author:** Zafar Shaikh  
**Status:** Released

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
6. [Constraints](#6-constraints)
7. [Future Scope](#7-future-scope)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the software requirements for **SyncUp** v1.0.0. It is intended for developers contributing to the project and serves as the source of truth for what the system must do.

### 1.2 Scope

SyncUp is a web-based Kanban project management tool. Users can register, create projects, define board columns, and manage tasks with drag-and-drop. The system consists of:
- A REST API backend (NestJS + PostgreSQL)
- A single-page application frontend (Angular)
- Shared TypeScript libraries for DTOs and validation

### 1.3 Definitions

| Term | Definition |
|---|---|
| **JWT** | JSON Web Token — a signed token used to authenticate API requests |
| **Kanban** | A visual workflow method using columns and cards |
| **Board Column** | A named stage in a Kanban board (e.g. "To Do") |
| **Task** | A unit of work that lives in a board column |
| **DTO** | Data Transfer Object — a typed shape for request/response data |
| **SPA** | Single-Page Application |
| **CRUD** | Create, Read, Update, Delete |

---

## 2. Overall Description

### 2.1 Product Perspective

SyncUp is a standalone web application. It does not integrate with any external project management tools. The frontend communicates exclusively with the SyncUp REST API via HTTP.

### 2.2 Product Functions (Summary)

- Secure user registration and login
- Project management (CRUD)
- Kanban board with columns and tasks (CRUD)
- Drag-and-drop task ordering and movement

### 2.3 User Classes

**End User (single class):** A person who registers and uses SyncUp to manage their own projects. All registered users have the same capability level. There is no admin role in v1.0.0.

### 2.4 Operating Environment

| Component | Requirement |
|---|---|
| Server OS | Any OS running Node.js 20+ |
| Database | PostgreSQL 15+ |
| Backend runtime | Node.js 20+, npm 10+ |
| Browser | Any modern browser (Chrome, Firefox, Safari, Edge) |
| Network | HTTPS in production, HTTP acceptable in development |

### 2.5 Assumptions

- One user owns all their projects; projects are not shared between users in v1.0.0.
- The database is managed by the operator (no migrations tool yet — TypeORM auto-sync in dev, `init.sql` for production).

---

## 3. Functional Requirements

### 3.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | The system shall allow a visitor to register with a name, email address, and password. |
| AUTH-02 | Email addresses shall be unique across the system. Attempting to register a duplicate email shall return a `409 Conflict` response. |
| AUTH-03 | Passwords shall be validated against the shared password policy: minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character from `!@#$%^&*()`. |
| AUTH-04 | Passwords shall be hashed with bcrypt before being stored. The cost factor is configurable via `BCRYPT_SALT_ROUNDS`. |
| AUTH-05 | On successful registration, the system shall return the user's profile and a signed JWT access token. |
| AUTH-06 | The system shall allow a registered user to log in with their email and password. |
| AUTH-07 | On successful login, the system shall return a signed JWT access token. |
| AUTH-08 | JWT tokens shall expire 60 minutes after issuance. |
| AUTH-09 | All non-auth API routes shall require a valid JWT in the `Authorization: Bearer <token>` header. |
| AUTH-10 | The frontend shall store the JWT in `localStorage` and attach it automatically to every outgoing HTTP request via an interceptor. |
| AUTH-11 | The frontend shall redirect unauthenticated users attempting to access protected routes to `/auth/login`. |
| AUTH-12 | Logging out shall remove the JWT from `localStorage`. |

### 3.2 Projects

| ID | Requirement |
|---|---|
| PROJ-01 | An authenticated user shall be able to create a project with a name (required) and an optional description. |
| PROJ-02 | When a project is created, the system shall automatically create three board columns: "To Do" (order 0), "In Progress" (order 1), "Done" (order 2). Project creation and column seeding shall occur in a single database transaction. |
| PROJ-03 | A user shall only be able to view, edit, and delete their own projects. |
| PROJ-04 | The dashboard shall display all of the user's projects as cards. |
| PROJ-05 | When no projects exist, the dashboard shall display an empty state with a prompt to create the first project. |
| PROJ-06 | A user shall be able to update a project's name and description. |
| PROJ-07 | Deleting a project shall cascade-delete all its board columns and tasks. |
| PROJ-08 | Clicking a project card on the dashboard shall navigate to the project's Kanban board at `/projects/:id`. |

### 3.3 Board Columns

| ID | Requirement |
|---|---|
| COL-01 | An authenticated user shall be able to add a new board column to one of their projects by providing a name. |
| COL-02 | New columns shall be assigned an order value one greater than the current highest, placing them at the end of the board. |
| COL-03 | A user shall be able to rename a board column. |
| COL-04 | A user shall be able to delete a board column. Deleting a column shall cascade-delete all its tasks. |
| COL-05 | The Kanban board shall display columns ordered by their `order` field ascending. |
| COL-06 | The `GET /board-columns?projectId=X` endpoint shall return each column with its tasks included and ordered by `order` ascending, enabling the board to load in a single request. |
| COL-07 | Access to a column shall be refused if the requesting user does not own the parent project (`403 Forbidden`). |

### 3.4 Tasks

| ID | Requirement |
|---|---|
| TASK-01 | An authenticated user shall be able to create a task in a board column with a title (required) and an optional description. |
| TASK-02 | New tasks shall be assigned an order value one greater than the current highest in that column. |
| TASK-03 | A user shall be able to update a task's title and description. |
| TASK-04 | A user shall be able to delete a task. |
| TASK-05 | A user shall be able to move a task to a different column by updating its `columnId`. |
| TASK-06 | A user shall be able to reorder tasks within a column by updating their `order` value. |
| TASK-07 | The frontend shall implement drag-and-drop for tasks using Angular CDK, allowing movement within and between columns. |
| TASK-08 | On drop, the system shall persist the task's new `columnId` and `order` via `PATCH /tasks/:id`. |
| TASK-09 | Moving a task between columns shall use a database transaction with pessimistic locks on both the source and target columns. |
| TASK-10 | Access to a task shall be refused if the requesting user does not own the parent project (`403 Forbidden`). |

---

## 4. Non-Functional Requirements

### 4.1 Security

- Passwords are never stored in plain text (bcrypt, configurable cost factor).
- JWT secret is loaded from the environment, never hardcoded.
- CORS is restricted to the configured `CORS_ORIGIN` value.
- The global `ValidationPipe` uses `whitelist: true` and `forbidNonWhitelisted: true`, stripping unknown fields from all requests.
- Ownership of every resource (project, column, task) is verified at the service layer before any operation.

### 4.2 Performance

- The Kanban board loads all columns and their tasks in a single API call.
- Concurrent writes to the same column use pessimistic locks to prevent race conditions.

### 4.3 Usability

- The UI provides loading states (spinner) and empty states with actionable prompts.
- Errors from the API are displayed inline in forms.
- Destructive actions (delete project, delete column with tasks) require confirmation.
- The Escape key closes modals and cancels inline edit modes.

### 4.4 Maintainability

- Business logic is isolated in services; controllers are thin.
- Shared validation rules (email regex, password regex) are defined once in `libs/shared-validation` and consumed by both the backend and frontend.
- The CSS design system uses custom properties, making visual changes centralised.

---

## 5. Data Requirements

### 5.1 Entity Definitions

**User**
| Field | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `name` | varchar(255) | NOT NULL |
| `email` | varchar(255) | NOT NULL, UNIQUE |
| `password` | varchar(255) | NOT NULL (bcrypt hash) |
| `created_at` | timestamptz | NOT NULL, default NOW() |
| `updated_at` | timestamptz | NOT NULL, default NOW() |

**Project**
| Field | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `name` | varchar(255) | NOT NULL |
| `description` | text | NULL allowed |
| `user_id` | integer | FK → users.id ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

**BoardColumn**
| Field | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `name` | varchar(255) | NOT NULL |
| `order` | integer | NOT NULL |
| `project_id` | integer | FK → projects.id ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

**Task**
| Field | Type | Constraints |
|---|---|---|
| `id` | integer | PK, auto-increment |
| `title` | varchar(255) | NOT NULL |
| `description` | text | NULL allowed |
| `order` | integer | NOT NULL |
| `column_id` | integer | FK → board_columns.id ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

### 5.2 Entity Relationships

```
User (1) ──────> (N) Project
Project (1) ────> (N) BoardColumn
BoardColumn (1) > (N) Task
```

All relationships cascade-delete downward: deleting a user deletes their projects; deleting a project deletes its columns; deleting a column deletes its tasks.

---

## 6. Constraints

| Constraint | Detail |
|---|---|
| No JWT refresh | Tokens expire after 60 minutes with no refresh mechanism. Users must log in again. |
| Single-user projects | Projects are not shareable between users in v1.0.0. |
| PostgreSQL only | TypeORM is configured for PostgreSQL. Other databases are not supported. |
| No file uploads | Tasks support text only (title, description). Attachments are not supported. |
| No real-time sync | The board does not update automatically if another session modifies it. |

---

## 7. Future Scope

The following features are not in scope for v1.0.0 but represent natural next steps:

- **JWT refresh tokens** — Sliding sessions without forced re-login.
- **Real-time updates** — WebSocket integration so the board updates live when another session makes changes.
- **Project collaboration** — Invite other users to a project with read or write access.
- **Task due dates and labels** — Additional task metadata for richer workflows.
- **File attachments** — Attach files or images to tasks.
- **Notifications** — In-app or email notifications for task assignments or comments.
- **Task comments** — Discussion thread on each task.
- **Board column ordering via drag-and-drop** — Currently columns are reordered by editing the `order` field directly.
- **User profile management** — Change name, email, or password.
- **Dark mode** — The design system already uses CSS custom properties, making this straightforward.
