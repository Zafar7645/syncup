import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService } from '@/app/projects/project.service';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/app/projects/project.model';
import { environment } from '@/environments/environment';

const API_URL = `${environment.apiUrl}/projects`;

const mockProject = (): Project => ({
  id: 1,
  name: 'Alpha',
  description: 'Test project',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects', () => {
    it('should GET all projects', () => {
      const projects = [mockProject()];
      service.getProjects().subscribe(result => expect(result).toEqual(projects));
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(projects);
    });
  });

  describe('getProject', () => {
    it('should GET a single project by id', () => {
      const project = mockProject();
      service.getProject(1).subscribe(result => expect(result).toEqual(project));
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(project);
    });
  });

  describe('createProject', () => {
    it('should POST a new project and return it', () => {
      const dto: CreateProjectDto = { name: 'Alpha', description: 'Desc' };
      const project = mockProject();
      service.createProject(dto).subscribe(result => expect(result).toEqual(project));
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(project);
    });
  });

  describe('updateProject', () => {
    it('should PATCH an existing project and return the updated entity', () => {
      const dto: UpdateProjectDto = { name: 'Alpha v2' };
      const updated = { ...mockProject(), name: 'Alpha v2' };
      service.updateProject(1, dto).subscribe(result => expect(result).toEqual(updated));
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(updated);
    });
  });

  describe('deleteProject', () => {
    it('should DELETE the project', () => {
      service.deleteProject(1).subscribe(result => expect(result).toBeNull());
      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('HTTP errors', () => {
    it('should propagate HTTP errors without transformation', () => {
      service.getProjects().subscribe({ error: (err) => expect(err.status).toBe(403) });
      httpMock.expectOne(API_URL).flush(null, { status: 403, statusText: 'Forbidden' });
    });
  });
});
