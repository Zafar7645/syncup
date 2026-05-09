/**
 * @file board-column.model.ts
 * @description TypeScript interfaces for the BoardColumn resource and its request DTOs.
 * The BoardColumn interface includes a nested tasks array because the API returns
 * columns with their tasks embedded (GET /board-columns?projectId=X).
 */
import { Task } from './task.model';

export interface BoardColumn {
  id: number;
  name: string;
  order: number;
  projectId: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardColumnDto {
  name: string;
  projectId: number;
}

export interface UpdateBoardColumnDto {
  name?: string;
  order?: number;
}
