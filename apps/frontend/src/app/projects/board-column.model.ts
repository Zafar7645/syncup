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
