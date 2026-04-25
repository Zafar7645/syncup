import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { BoardColumn, CreateBoardColumnDto, UpdateBoardColumnDto } from './board-column.model';

@Injectable({
  providedIn: 'root',
})
export class BoardColumnService {
  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/board-columns`;

  getColumns(projectId: number): Observable<BoardColumn[]> {
    return this.httpClient.get<BoardColumn[]>(this.apiUrl, { params: { projectId } });
  }

  createColumn(dto: CreateBoardColumnDto): Observable<BoardColumn> {
    return this.httpClient.post<BoardColumn>(this.apiUrl, dto);
  }

  updateColumn(id: number, dto: UpdateBoardColumnDto): Observable<BoardColumn> {
    return this.httpClient.patch<BoardColumn>(`${this.apiUrl}/${id}`, dto);
  }

  deleteColumn(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
