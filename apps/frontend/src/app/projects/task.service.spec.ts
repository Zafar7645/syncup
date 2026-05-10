import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from '@/app/projects/task.service';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/app/projects/task.model';
import { environment } from '@/environments/environment';

const API_URL = `${environment.apiUrl}/tasks`;

const mockTask = (): Task => ({
  id: 1,
  title: 'Fix bug',
  description: null,
  order: 0,
  columnId: 20,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTask', () => {
    it('should POST a new task and return it', () => {
      const dto: CreateTaskDto = { title: 'Fix bug', columnId: 20 };
      const task = mockTask();
      service.createTask(dto).subscribe(result => expect(result).toEqual(task));
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(task);
    });
  });

  describe('updateTask', () => {
    it('should PATCH a task and return the updated entity', () => {
      const dto: UpdateTaskDto = { title: 'Updated', columnId: 21, order: 1 };
      const updated = { ...mockTask(), title: 'Updated', columnId: 21, order: 1 };
      service.updateTask(1, dto).subscribe(result => expect(result).toEqual(updated));
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(updated);
    });
  });

  describe('deleteTask', () => {
    it('should DELETE the task', () => {
      service.deleteTask(1).subscribe(result => expect(result).toBeNull());
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('HTTP errors', () => {
    it('should propagate HTTP errors without transformation', () => {
      service.createTask({ title: 'x', columnId: 1 }).subscribe({ error: (err) => expect(err.status).toBe(403) });
      httpMock.expectOne(API_URL).flush(null, { status: 403, statusText: 'Forbidden' });
    });
  });
});
