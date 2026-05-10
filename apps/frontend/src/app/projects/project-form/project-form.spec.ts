import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectForm } from '@/app/projects/project-form/project-form';
import { ProjectService } from '@/app/projects/project.service';
import { Project } from '@/app/projects/project.model';

const mockProject = (): Project => ({
  id: 1,
  name: 'Alpha',
  description: 'Test project',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('ProjectForm', () => {
  let component: ProjectForm;
  let fixture: ComponentFixture<ProjectForm>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'createProject',
      'updateProject',
    ]);

    await TestBed.configureTestingModule({
      imports: [ProjectForm],
      providers: [{ provide: ProjectService, useValue: projectServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Create mode ──────────────────────────────────────────────────────────────

  describe('create mode (no project input)', () => {
    it('should start with isEditMode = false', () => {
      expect(component.isEditMode).toBeFalse();
    });

    it('should start with an empty form', () => {
      expect(component.form.value).toEqual({ name: '', description: '' });
    });

    it('should mark all fields touched and not call service when form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched');
      component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(projectServiceSpy.createProject).not.toHaveBeenCalled();
    });

    it('should call createProject and emit saved on success', () => {
      const created = mockProject();
      projectServiceSpy.createProject.and.returnValue(of(created));
      const savedSpy = spyOn(component.saved, 'emit');

      component.form.setValue({ name: 'Alpha', description: 'Desc' });
      component.onSubmit();

      expect(projectServiceSpy.createProject).toHaveBeenCalledWith({
        name: 'Alpha',
        description: 'Desc',
      });
      expect(savedSpy).toHaveBeenCalledWith(created);
      expect(component.submitting).toBeFalse();
    });

    it('should show errorMessage and reset submitting on error', () => {
      projectServiceSpy.createProject.and.returnValue(throwError(() => new Error('fail')));

      component.form.setValue({ name: 'Alpha', description: '' });
      component.onSubmit();

      expect(component.errorMessage).toBe('Failed to create project. Please try again.');
      expect(component.submitting).toBeFalse();
    });
  });

  // ── Edit mode ────────────────────────────────────────────────────────────────

  describe('edit mode (project input provided)', () => {
    beforeEach(() => {
      component.project = mockProject();
      component.ngOnChanges();
      fixture.detectChanges();
    });

    it('should set isEditMode = true', () => {
      expect(component.isEditMode).toBeTrue();
    });

    it('should pre-fill the form with the project values', () => {
      expect(component.form.value).toEqual({ name: 'Alpha', description: 'Test project' });
    });

    it('should call updateProject and emit saved on success', () => {
      const updated = { ...mockProject(), name: 'Alpha v2' };
      projectServiceSpy.updateProject.and.returnValue(of(updated));
      const savedSpy = spyOn(component.saved, 'emit');

      component.form.setValue({ name: 'Alpha v2', description: 'Test project' });
      component.onSubmit();

      expect(projectServiceSpy.updateProject).toHaveBeenCalledWith(
        1,
        { name: 'Alpha v2', description: 'Test project' },
      );
      expect(savedSpy).toHaveBeenCalledWith(updated);
    });

    it('should show errorMessage on update error', () => {
      projectServiceSpy.updateProject.and.returnValue(throwError(() => new Error('fail')));

      component.form.setValue({ name: 'Alpha v2', description: '' });
      component.onSubmit();

      expect(component.errorMessage).toBe('Failed to update project. Please try again.');
    });

    it('should reset form when switching back to create mode', () => {
      component.project = null;
      component.ngOnChanges();

      expect(component.isEditMode).toBeFalse();
      expect(component.form.value).toEqual({ name: null, description: null });
    });
  });

  // ── onCancel ─────────────────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('should emit the cancelled event', () => {
      const cancelledSpy = spyOn(component.cancelled, 'emit');
      component.onCancel();
      expect(cancelledSpy).toHaveBeenCalled();
    });

    it('should emit cancelled when the Escape key is pressed on the document', () => {
      const cancelledSpy = spyOn(component.cancelled, 'emit');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(cancelledSpy).toHaveBeenCalled();
    });
  });

  // ── description omitted when empty ───────────────────────────────────────────

  describe('description handling', () => {
    it('should pass undefined for description when the field is empty', () => {
      const created = mockProject();
      projectServiceSpy.createProject.and.returnValue(of(created));

      component.form.setValue({ name: 'Alpha', description: '' });
      component.onSubmit();

      expect(projectServiceSpy.createProject).toHaveBeenCalledWith(
        jasmine.objectContaining({ description: undefined }),
      );
    });
  });
});
