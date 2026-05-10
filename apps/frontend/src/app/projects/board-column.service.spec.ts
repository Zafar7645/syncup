import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BoardColumnService } from '@/app/projects/board-column.service';
import { BoardColumn, CreateBoardColumnDto, UpdateBoardColumnDto } from '@/app/projects/board-column.model';
import { environment } from '@/environments/environment';

const API_URL = `${environment.apiUrl}/board-columns`;

const mockColumn = (): BoardColumn => ({
  id: 1,
  name: 'To Do',
  order: 0,
  projectId: 10,
  tasks: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('BoardColumnService', () => {
  let service: BoardColumnService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BoardColumnService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getColumns', () => {
    it('should GET columns for a project with projectId as query param', () => {
      const columns = [mockColumn()];
      service.getColumns(10).subscribe(result => expect(result).toEqual(columns));
      const req = httpMock.expectOne(r => r.url === API_URL && r.params.get('projectId') === '10');
      expect(req.request.method).toBe('GET');
      req.flush(columns);
    });
  });

  describe('createColumn', () => {
    it('should POST a new column and return it', () => {
      const dto: CreateBoardColumnDto = { name: 'Backlog', projectId: 10 };
      const column = mockColumn();
      service.createColumn(dto).subscribe(result => expect(result).toEqual(column));
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(column);
    });
  });

  describe('updateColumn', () => {
    it('should PATCH a column and return the updated entity', () => {
      const dto: UpdateBoardColumnDto = { name: 'Review' };
      const updated = { ...mockColumn(), name: 'Review' };
      service.updateColumn(1, dto).subscribe(result => expect(result).toEqual(updated));
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(updated);
    });
  });

  describe('deleteColumn', () => {
    it('should DELETE the column', () => {
      service.deleteColumn(1).subscribe(result => expect(result).toBeNull());
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('HTTP errors', () => {
    it('should propagate HTTP errors without transformation', () => {
      service.getColumns(10).subscribe({ error: (err) => expect(err.status).toBe(403) });
      const req = httpMock.expectOne(r => r.url === API_URL && r.params.get('projectId') === '10');
      req.flush(null, { status: 403, statusText: 'Forbidden' });
    });
  });
});
