# SyncUp: Full-Stack Project Management Tool 🚀

This is a monorepo for **SyncUp**, a real-time project management and collaboration tool. It contains the Angular frontend and the NestJS backend, managed using NPM Workspaces.

---

## 🏛️ Repository Structure

This monorepo is structured with two main applications:

-   `apps/frontend`: The Angular client application.
-   `apps/backend`: The NestJS API.

---

## ✨ Features

* **User Authentication**: Secure user registration and login using JWT.
* **Project Management**: Full CRUD operations for projects.
* **Kanban Board**: Interactive drag-and-drop task management.
* **Real-time Collaboration**: WebSocket integration for live updates.

---

## 🛠️ Tech Stack

* **Monorepo Management**: NPM Workspaces
* **Frontend**: Angular, TypeScript, RxJS, Angular Material
* **Backend**: NestJS, PostgreSQL, WebSockets, JWT
* **Deployment**: Docker

---

## ⚙️ Getting Started

### Prerequisites

-   Node.js and npm
-   Angular CLI (`npm install -g @angular/cli`)
-   NestJS CLI (`npm install -g @nestjs/cli`)

### Running Locally

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/syncup.git](https://github.com/Zafar7645/syncup.git)
    cd syncup
    ```

2.  **Install all dependencies**:
    Running `npm install` in the root directory will install dependencies for the root, the backend, and the frontend all at once.
    ```bash
    npm install
    ```

3.  **Run the Backend**:
    ```bash
    # This runs the "start" script inside apps/backend/package.json
    npm run start:backend
    ```
    The backend will be running on `http://localhost:3000`.

4.  **Run the Frontend** (in a new terminal):
    ```bash
    # This runs the "start" script inside apps/frontend/package.json
    npm run start:frontend
    ```
    The frontend will be running on `http://localhost:4200`.