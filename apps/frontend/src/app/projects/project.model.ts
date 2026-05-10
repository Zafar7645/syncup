/**
 * @file project.model.ts
 * @description TypeScript interfaces for the Project resource and its request DTOs.
 * Used by ProjectService, DashboardComponent, and ProjectFormComponent.
 */
export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}
