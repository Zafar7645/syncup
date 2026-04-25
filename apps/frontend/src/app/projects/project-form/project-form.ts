import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/app/projects/project.model';
import { ProjectService } from '@/app/projects/project.service';

@Component({
  selector: 'app-project-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm implements OnChanges {
  @Input() project?: Project | null;
  @Output() saved = new EventEmitter<Project>();
  @Output() cancelled = new EventEmitter<void>();

  private formBuilder = inject(FormBuilder);
  private projectService = inject(ProjectService);

  submitting = false;
  errorMessage: string | null = null;

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  get isEditMode() {
    return !!this.project;
  }

  get name() {
    return this.form.get('name');
  }

  get description() {
    return this.form.get('description');
  }

  ngOnChanges() {
    this.errorMessage = null;
    if (this.project) {
      this.form.setValue({
        name: this.project.name,
        description: this.project.description ?? '',
      });
    } else {
      this.form.reset();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const { name, description } = this.form.value;

    if (this.project) {
      const dto: UpdateProjectDto = { name: name!, description: description ?? undefined };
      this.projectService.updateProject(this.project.id, dto).subscribe({
        next: (updated) => {
          this.submitting = false;
          this.saved.emit(updated);
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'Failed to update project. Please try again.';
        },
      });
    } else {
      const dto: CreateProjectDto = { name: name!, description: description ?? undefined };
      this.projectService.createProject(dto).subscribe({
        next: (created) => {
          this.submitting = false;
          this.saved.emit(created);
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'Failed to create project. Please try again.';
        },
      });
    }
  }

  @HostListener('document:keydown.escape')
  onCancel() {
    this.cancelled.emit();
  }
}
