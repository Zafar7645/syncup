/**
 * @file dashboard.ts
 * @description Main page component for authenticated users (/dashboard). Displays the
 * user's project grid (or an empty state) and orchestrates the create/edit project
 * modal. Clicking a project card navigates to the Kanban board for that project.
 */
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Nav } from '@/app/shared/nav/nav';
import { ProjectService } from '@/app/projects/project.service';
import { Project } from '@/app/projects/project.model';
import { ProjectForm } from '@/app/projects/project-form/project-form';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Nav, ProjectForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  projects: Project[] = [];
  loading = true;
  showModal = false;
  editingProject: Project | null = null;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openCreateModal() {
    this.editingProject = null;
    this.showModal = true;
  }

  openEditModal(project: Project, event: Event) {
    event.stopPropagation();
    this.editingProject = project;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProject = null;
  }

  onProjectSaved(project: Project) {
    if (this.editingProject) {
      this.projects = this.projects.map((p) => (p.id === project.id ? project : p));
    } else {
      this.projects = [...this.projects, project];
    }
    this.closeModal();
  }

  deleteProject(project: Project, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.projects = this.projects.filter((p) => p.id !== project.id);
      },
      error: () => {
        alert(`Failed to delete "${project.name}". Please try again.`);
      },
    });
  }

  navigateToProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }
}
