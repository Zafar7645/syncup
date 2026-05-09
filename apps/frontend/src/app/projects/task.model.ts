/**
 * @file task.model.ts
 * @description TypeScript interfaces for the Task resource and its request DTOs.
 * Used by TaskService and KanbanComponent. The columnId field is used to move
 * tasks between columns via PATCH /tasks/:id.
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  order: number;
  columnId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  columnId: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  columnId?: number;
  order?: number;
}
