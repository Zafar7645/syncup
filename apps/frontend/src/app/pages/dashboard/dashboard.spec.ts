import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Dashboard } from '@/app/pages/dashboard/dashboard';
import { ProjectService } from '@/app/projects/project.service';
import { Auth } from '@/app/auth/services/auth';
import { Project } from '@/app/projects/project.model';

// ── Stub child components ──────────────────────────────────────────────────────

@Component({ selector: 'app-nav', template: '', standalone: true })
class NavStub {}

@Component({ selector: 'app-project-form', template: '', standalone: true })
class ProjectFormStub {
  @Input() project?: unknown;
  @Output() saved = new EventEmitter<unknown>();
  @Output() cancelled = new EventEmitter<void>();
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockProject = (id = 1): Project => ({
  id,
  name: `Project ${id}`,
  description: 'Desc',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjects',
      'deleteProject',
    ]);
    projectServiceSpy.getProjects.and.returnValue(of([]));

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj<Auth>('Auth', ['getUserEmail']);
    authServiceSpy.getUserEmail.and.returnValue('user@test.com');

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Auth, useValue: authServiceSpy },
      ],
    })
      .overrideComponent(Dashboard, { set: { imports: [NavStub, ProjectFormStub] } })
      .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── loadProjects ─────────────────────────────────────────────────────────────

  describe('loadProjects', () => {
    it('should populate projects and set loading to false on success', () => {
      const projects = [mockProject(1), mockProject(2)];
      projectServiceSpy.getProjects.and.returnValue(of(projects));

      component.loadProjects();

      expect(component.projects).toEqual(projects);
      expect(component.loading).toBeFalse();
    });

    it('should set loading to false on error', () => {
      projectServiceSpy.getProjects.and.returnValue(throwError(() => new Error('fail')));

      component.loadProjects();

      expect(component.loading).toBeFalse();
      expect(component.projects).toEqual([]);
    });
  });

  // ── openCreateModal ──────────────────────────────────────────────────────────

  describe('openCreateModal', () => {
    it('should set showModal to true and clear editingProject', () => {
      component.editingProject = mockProject();
      component.openCreateModal();
      expect(component.showModal).toBeTrue();
      expect(component.editingProject).toBeNull();
    });
  });

  // ── openEditModal ────────────────────────────────────────────────────────────

  describe('openEditModal', () => {
    it('should set editingProject and showModal, stopping event propagation', () => {
      const project = mockProject();
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.openEditModal(project, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.editingProject).toEqual(project);
      expect(component.showModal).toBeTrue();
    });
  });

  // ── closeModal ───────────────────────────────────────────────────────────────

  describe('closeModal', () => {
    it('should set showModal to false and clear editingProject', () => {
      component.showModal = true;
      component.editingProject = mockProject();

      component.closeModal();

      expect(component.showModal).toBeFalse();
      expect(component.editingProject).toBeNull();
    });
  });

  // ── onProjectSaved ───────────────────────────────────────────────────────────

  describe('onProjectSaved', () => {
    it('should append the new project to the list in create mode', () => {
      component.projects = [mockProject(1)];
      component.editingProject = null;

      component.onProjectSaved(mockProject(2));

      expect(component.projects.length).toBe(2);
      expect(component.projects[1].id).toBe(2);
      expect(component.showModal).toBeFalse();
    });

    it('should replace the updated project in the list in edit mode', () => {
      const original = mockProject(1);
      const updated = { ...original, name: 'Alpha v2' };
      component.projects = [original, mockProject(2)];
      component.editingProject = original;

      component.onProjectSaved(updated);

      expect(component.projects[0].name).toBe('Alpha v2');
      expect(component.projects.length).toBe(2);
      expect(component.showModal).toBeFalse();
    });
  });

  // ── deleteProject ────────────────────────────────────────────────────────────

  describe('deleteProject', () => {
    it('should remove the project from the list after successful deletion', () => {
      const project = mockProject(1);
      component.projects = [project, mockProject(2)];
      projectServiceSpy.deleteProject.and.returnValue(of(undefined));
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteProject(project, new MouseEvent('click'));

      expect(projectServiceSpy.deleteProject).toHaveBeenCalledWith(1);
      expect(component.projects.length).toBe(1);
      expect(component.projects[0].id).toBe(2);
    });

    it('should not call the service when the user cancels the confirmation dialog', () => {
      const project = mockProject(1);
      component.projects = [project];
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteProject(project, new MouseEvent('click'));

      expect(projectServiceSpy.deleteProject).not.toHaveBeenCalled();
      expect(component.projects.length).toBe(1);
    });

    it('should show an alert when deletion fails', () => {
      const project = mockProject(1);
      component.projects = [project];
      projectServiceSpy.deleteProject.and.returnValue(throwError(() => new Error('fail')));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      component.deleteProject(project, new MouseEvent('click'));

      expect(window.alert).toHaveBeenCalled();
      expect(component.projects.length).toBe(1);
    });
  });

  // ── navigateToProject ────────────────────────────────────────────────────────

  describe('navigateToProject', () => {
    it('should navigate to /projects/:id', () => {
      component.navigateToProject(mockProject(5));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', 5]);
    });
  });
});
