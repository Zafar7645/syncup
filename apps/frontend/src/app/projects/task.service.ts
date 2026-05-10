/**
 * @file task.service.ts
 * @description HTTP service for task CRUD and movement operations. updateTask() is
 * called by the Kanban component on every drag-drop event to persist the task's
 * new columnId and order to the backend.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { CreateTaskDto, Task, UpdateTaskDto } from './task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.httpClient.post<Task>(this.apiUrl, dto);
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.httpClient.patch<Task>(`${this.apiUrl}/${id}`, dto);
  }

  deleteTask(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
