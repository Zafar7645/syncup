# SyncUp User Guide

This guide walks you through every feature of SyncUp from signing up to managing a full Kanban board.

---

## Table of Contents

1. [Creating an Account](#1-creating-an-account)
2. [Signing In](#2-signing-in)
3. [The Dashboard](#3-the-dashboard)
4. [Managing Projects](#4-managing-projects)
5. [The Kanban Board](#5-the-kanban-board)
6. [Managing Columns](#6-managing-columns)
7. [Managing Tasks](#7-managing-tasks)
8. [Drag and Drop](#8-drag-and-drop)
9. [Keyboard Shortcuts](#9-keyboard-shortcuts)
10. [Signing Out](#10-signing-out)

---

## 1. Creating an Account

1. Open SyncUp in your browser (`http://localhost:4200` in development).
2. You will be redirected to the **Sign In** page. Click **Create one** at the bottom.
3. Fill in the form:
   - **Name** — Your display name.
   - **Email** — Must be a valid email address. Used to log in.
   - **Password** — Must be at least 8 characters and include: one uppercase letter, one lowercase letter, one number, and one special character (e.g. `!`, `@`, `#`).
4. Click **Create Account**.
5. You will be taken straight to the dashboard.

---

## 2. Signing In

1. Go to `/auth/login`.
2. Enter your email and password.
3. Click **Sign In**.
4. You will be taken to the dashboard.

> Sessions last **60 minutes**. After that, you will be asked to sign in again.

---

## 3. The Dashboard

The dashboard is your home screen. It shows all your projects.

```
┌──────────────────────────────────────────────────────────┐
│ ◆ SyncUp                                         [U ▾]   │
├──────────────────────────────────────────────────────────┤
│  My Projects                          [+ New Project]    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │ A  Website   │  │ B  Mobile    │                      │
│  │    Redesign  │  │    App       │                      │
│  │ Description  │  │              │                      │
│  │        ✏ 🗑  │  │        ✏ 🗑  │                      │
│  └──────────────┘  └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

**When you have no projects:** An empty state is shown with a **Create Project** button.

**When you have projects:** Each project appears as a card showing its name and description. Click anywhere on the card (except the icons) to open its Kanban board.

---

## 4. Managing Projects

### Create a Project

1. Click **+ New Project** (top right of the dashboard) or **Create Project** (empty state).
2. A modal opens. Fill in:
   - **Name** *(required)* — The project's title.
   - **Description** *(optional)* — A short summary.
3. Click **Create Project**.
4. The project card appears on the dashboard. Three default columns — *To Do*, *In Progress*, *Done* — are created automatically.

### Edit a Project

1. Hover over a project card. The **✏** (edit) icon appears in the top-right corner.
2. Click **✏**.
3. The modal opens pre-filled with the current name and description.
4. Make your changes and click **Save Changes**.

### Delete a Project

1. Hover over a project card and click the **🗑** (delete) icon.
2. A confirmation dialog warns you that this cannot be undone.
3. Click **OK** to confirm.

> **Warning:** Deleting a project permanently deletes all its columns and tasks.

---

## 5. The Kanban Board

Click any project card to open its board.

```
┌─────────────────────────────────────────────────────────────┐
│ ◆ SyncUp  / Website Redesign                        [U ▾]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ [+] │
│  │ To Do   ✏ 🗑 │  │ In Progress  │  │ Done    ✏ 🗑 │     │
│  │──────────────│  │──────────────│  │──────────────│     │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │              │     │
│  │ │ Design   │ │  │ │ API docs │ │  │              │     │
│  │ │ homepage │ │  │ └──────────┘ │  │              │     │
│  │ └──────────┘ │  │              │  │              │     │
│  │ + Add task   │  │ + Add task   │  │ + Add task   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

The board scrolls **horizontally** if you have more columns than fit the screen.

---

## 6. Managing Columns

### Add a Column

1. Click the **[+]** button at the right end of the board.
2. An input box appears. Type the column name.
3. Press **Enter** or click **Add**. The column appears at the end of the board.
4. Press **Escape** or click **Cancel** to dismiss without saving.

### Rename a Column

1. Click the **✏** icon in the column header.
2. The column name becomes an editable input.
3. Type the new name and press **Enter** or click away to save.
4. Press **Escape** to cancel.

### Delete a Column

1. Click the **🗑** icon in the column header.
2. A confirmation dialog appears. If the column has tasks, the dialog tells you how many will be deleted.
3. Click **OK** to confirm.

> **Warning:** Deleting a column permanently deletes all tasks inside it.

---

## 7. Managing Tasks

### Add a Task

1. Click **+ Add task** at the bottom of any column.
2. A text area appears. Type the task title.
3. Press **Enter** or click **Add** to create the task.
4. Press **Escape** or click **Cancel** to dismiss.

### Edit a Task

1. Hover over a task card. The **✏** icon appears.
2. Click **✏** to open the edit modal.
3. Update the **Title** and/or **Description**.
4. Click **Save** to apply changes.

### Delete a Task

1. Hover over a task card and click the **🗑** icon.
2. A confirmation dialog appears.
3. Click **OK** to confirm.

---

## 8. Drag and Drop

Tasks are draggable. You can:

- **Reorder within a column** — Drag a task card up or down to change its position.
- **Move between columns** — Drag a task card from one column and drop it into another.

While dragging, a **placeholder** (dashed outline) shows where the task will land if you drop it. The change is saved automatically when you release the card.

---

## 9. Keyboard Shortcuts

| Key | Action |
|---|---|
| `Escape` | Close any open modal or cancel any inline edit |
| `Enter` | Confirm an inline input (add task, add column, rename column) |

---

## 10. Signing Out

1. Click the **[U]** avatar button in the top-right corner of the navigation bar.
2. A menu appears. Click **Sign out**.
3. You are redirected to the sign-in page.
