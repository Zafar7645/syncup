import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { CreateProjectDto, Project, UpdateProjectDto } from './project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  getProjects(): Observable<Project[]> {
    return this.httpClient.get<Project[]>(this.apiUrl);
  }

  getProject(id: number): Observable<Project> {
    return this.httpClient.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    return this.httpClient.post<Project>(this.apiUrl, dto);
  }

  updateProject(id: number, dto: UpdateProjectDto): Observable<Project> {
    return this.httpClient.patch<Project>(`${this.apiUrl}/${id}`, dto);
  }

  deleteProject(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
