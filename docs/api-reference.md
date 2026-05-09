# API Reference

**Base URL (development):** `http://localhost:3000`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /auth/register

Register a new user account.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Secret123!"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | yes | Non-empty |
| `email` | string | yes | Valid email format |
| `password` | string | yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |

**Response `201 Created`:**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

| Status | Reason |
|---|---|
| `400 Bad Request` | Validation failed (missing fields, invalid format) |
| `409 Conflict` | Email already registered |

---

### POST /auth/login

Log in with email and password.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "Secret123!"
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

| Status | Reason |
|---|---|
| `401 Unauthorized` | Invalid email or password |

---

### GET /auth/profile

Return the authenticated user's identity from the JWT payload.

**Auth:** Required

**Response `200 OK`:**
```json
{
  "userId": 1,
  "email": "jane@example.com"
}
```

---

## Projects

All project endpoints require authentication. Users can only access their own projects.

### GET /projects

Return all projects owned by the authenticated user, ordered by creation date descending.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Overhaul the marketing site",
    "userId": 1,
    "createdAt": "2026-04-26T10:00:00.000Z",
    "updatedAt": "2026-04-26T10:00:00.000Z"
  }
]
```

---

### POST /projects

Create a new project. Automatically creates three default board columns: *To Do* (order 0), *In Progress* (order 1), *Done* (order 2).

**Request body:**
```json
{
  "name": "Website Redesign",
  "description": "Overhaul the marketing site"
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `description` | string | no |

**Response `201 Created`:**
```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Overhaul the marketing site",
  "userId": 1,
  "createdAt": "2026-04-26T10:00:00.000Z",
  "updatedAt": "2026-04-26T10:00:00.000Z"
}
```

---

### GET /projects/:id

Return a single project by ID.

**Response `200 OK`:** Same shape as a single item in `GET /projects`.

**Errors:**

| Status | Reason |
|---|---|
| `404 Not Found` | Project not found or not owned by user |

---

### PATCH /projects/:id

Update a project's name and/or description.

**Request body (all fields optional):**
```json
{
  "name": "New Name",
  "description": "Updated description"
}
```

**Response `200 OK`:** Updated project object.

---

### DELETE /projects/:id

Delete a project and all its columns and tasks.

**Response `200 OK`:** The deleted project object.

**Errors:**

| Status | Reason |
|---|---|
| `404 Not Found` | Project not found or not owned by user |

---

## Board Columns

All board-column endpoints require authentication. Users can only access columns belonging to their own projects.

### GET /board-columns?projectId=:id

Return all columns for a project, ordered by `order` ascending. Each column includes its tasks ordered by `order` ascending.

**Query params:**

| Param | Type | Required |
|---|---|---|
| `projectId` | integer | yes |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "To Do",
    "order": 0,
    "projectId": 1,
    "createdAt": "2026-04-26T10:00:00.000Z",
    "updatedAt": "2026-04-26T10:00:00.000Z",
    "tasks": [
      {
        "id": 1,
        "title": "Design homepage",
        "description": null,
        "order": 0,
        "columnId": 1,
        "createdAt": "2026-04-26T11:00:00.000Z",
        "updatedAt": "2026-04-26T11:00:00.000Z"
      }
    ]
  }
]
```

**Errors:**

| Status | Reason |
|---|---|
| `403 Forbidden` | Project not owned by user |
| `404 Not Found` | Project not found |

---

### POST /board-columns

Create a new board column. If `order` is not provided, it is assigned as `max(existing order) + 1`.

**Request body:**
```json
{
  "name": "Review",
  "projectId": 1
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `projectId` | integer | yes |
| `order` | integer | no |

**Response `201 Created`:** The created column object (without tasks).

---

### GET /board-columns/:id

Return a single column by ID.

**Response `200 OK`:** Single column object.

---

### PATCH /board-columns/:id

Update a column's name and/or order.

**Request body (all fields optional):**
```json
{
  "name": "QA Review",
  "order": 3
}
```

**Response `200 OK`:** Updated column object.

---

### DELETE /board-columns/:id

Delete a column and all its tasks.

**Response `200 OK`:** The deleted column object.

---

## Tasks

All task endpoints require authentication. Users can only access tasks belonging to their own projects.

### GET /tasks?columnId=:id

Return all tasks in a column, ordered by `order` ascending.

**Query params:**

| Param | Type | Required |
|---|---|---|
| `columnId` | integer | yes |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "Design homepage",
    "description": "Figma mockup first",
    "order": 0,
    "columnId": 1,
    "createdAt": "2026-04-26T11:00:00.000Z",
    "updatedAt": "2026-04-26T11:00:00.000Z"
  }
]
```

---

### POST /tasks

Create a new task. If `order` is not provided, it is assigned as `max(existing order in column) + 1`.

**Request body:**
```json
{
  "title": "Design homepage",
  "description": "Figma mockup first",
  "columnId": 1
}
```

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `columnId` | integer | yes |
| `description` | string | no |
| `order` | integer | no |

**Response `201 Created`:** The created task object.

---

### GET /tasks/:id

Return a single task by ID.

**Response `200 OK`:** Single task object.

---

### PATCH /tasks/:id

Update a task. All fields are optional. Changing `columnId` moves the task to a different column (uses a transaction with pessimistic locks).

**Request body:**
```json
{
  "title": "Design homepage v2",
  "description": "Updated brief",
  "columnId": 2,
  "order": 0
}
```

**Response `200 OK`:** Updated task object.

---

### DELETE /tasks/:id

Delete a task.

**Response `200 OK`:** The deleted task object.

---

## Error Format

All error responses follow NestJS's default format:

```json
{
  "statusCode": 404,
  "message": "Project with ID \"5\" not found or you don't have access.",
  "error": "Not Found"
}
```

Validation errors return an array of messages:

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```
