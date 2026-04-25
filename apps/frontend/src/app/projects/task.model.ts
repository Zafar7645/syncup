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
