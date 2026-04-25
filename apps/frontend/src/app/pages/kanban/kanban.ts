import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Nav } from '@/app/shared/nav/nav';
import { BoardColumnService } from '@/app/projects/board-column.service';
import { TaskService } from '@/app/projects/task.service';
import { ProjectService } from '@/app/projects/project.service';
import { Project } from '@/app/projects/project.model';
import { BoardColumn } from '@/app/projects/board-column.model';
import { Task } from '@/app/projects/task.model';

@Component({
  selector: 'app-kanban',
  imports: [CommonModule, FormsModule, Nav, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
})
export class Kanban implements OnInit {
  private route = inject(ActivatedRoute);
  private boardColumnService = inject(BoardColumnService);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);

  projectId!: number;
  projectName = '';
  columns: BoardColumn[] = [];
  loading = true;

  // Column management
  editingColumnId: number | null = null;
  editingColumnName = '';
  addingColumn = false;
  newColumnName = '';

  // Task management
  addingTaskInColumnId: number | null = null;
  newTaskTitle = '';
  editingTask: Task | null = null;
  editingTaskTitle = '';
  editingTaskDescription = '';

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.projectService.getProject(this.projectId).subscribe({
      next: (project: Project) => {
        this.projectName = project.name;
      },
    });
    this.loadBoard();
  }

  loadBoard() {
    this.loading = true;
    this.boardColumnService.getColumns(this.projectId).subscribe({
      next: (columns) => {
        this.columns = columns;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.editingTask) this.cancelEditTask();
  }

  // ── Drag & Drop ────────────────────────────────────────────────────
  onTaskDrop(event: CdkDragDrop<Task[]>) {
    const task = event.previousContainer.data[event.previousIndex];
    const newColumnId = Number(event.container.id);

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    this.taskService
      .updateTask(task.id, { columnId: newColumnId, order: event.currentIndex })
      .subscribe({
        error: () => {
          if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
          } else {
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex,
            );
          }
        },
      });
  }

  // ── Column CRUD ────────────────────────────────────────────────────
  startAddColumn() {
    this.addingColumn = true;
    this.newColumnName = '';
  }

  confirmAddColumn() {
    const name = this.newColumnName.trim();
    if (!name) {
      this.addingColumn = false;
      return;
    }
    this.boardColumnService.createColumn({ name, projectId: this.projectId }).subscribe({
      next: (col) => {
        this.columns = [...this.columns, { ...col, tasks: [] }];
        this.addingColumn = false;
        this.newColumnName = '';
      },
      error: () => {
        alert('Failed to add column. Please try again.');
      },
    });
  }

  startRenameColumn(col: BoardColumn) {
    this.editingColumnId = col.id;
    this.editingColumnName = col.name;
  }

  confirmRenameColumn(col: BoardColumn) {
    const name = this.editingColumnName.trim();
    if (!name || name === col.name) {
      this.editingColumnId = null;
      return;
    }
    this.boardColumnService.updateColumn(col.id, { name }).subscribe({
      next: (updated) => {
        this.columns = this.columns.map((c) => (c.id === col.id ? { ...updated, tasks: c.tasks } : c));
        this.editingColumnId = null;
      },
      error: () => {
        this.editingColumnId = null;
        alert('Failed to rename column. Please try again.');
      },
    });
  }

  cancelRenameColumn() {
    this.editingColumnId = null;
  }

  deleteColumn(col: BoardColumn) {
    const msg = col.tasks.length
      ? `Delete "${col.name}"? This will also delete its ${col.tasks.length} task(s). This cannot be undone.`
      : `Delete "${col.name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    this.boardColumnService.deleteColumn(col.id).subscribe({
      next: () => {
        this.columns = this.columns.filter((c) => c.id !== col.id);
      },
      error: () => {
        alert(`Failed to delete "${col.name}". Please try again.`);
      },
    });
  }

  // ── Task CRUD ──────────────────────────────────────────────────────
  openAddTask(columnId: number) {
    this.addingTaskInColumnId = columnId;
    this.newTaskTitle = '';
  }

  confirmAddTask(col: BoardColumn) {
    const title = this.newTaskTitle.trim();
    if (!title) {
      this.addingTaskInColumnId = null;
      return;
    }
    this.taskService.createTask({ title, columnId: col.id }).subscribe({
      next: (task) => {
        col.tasks = [...col.tasks, task];
        this.addingTaskInColumnId = null;
        this.newTaskTitle = '';
      },
      error: () => {
        alert('Failed to add task. Please try again.');
      },
    });
  }

  cancelAddTask() {
    this.addingTaskInColumnId = null;
  }

  startEditTask(task: Task) {
    this.editingTask = task;
    this.editingTaskTitle = task.title;
    this.editingTaskDescription = task.description ?? '';
  }

  confirmEditTask() {
    if (!this.editingTask) return;
    const title = this.editingTaskTitle.trim();
    if (!title) return;
    this.taskService
      .updateTask(this.editingTask.id, { title, description: this.editingTaskDescription.trim() || undefined })
      .subscribe({
        next: (updated) => {
          this.columns = this.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === updated.id ? updated : t)),
          }));
          this.editingTask = null;
        },
        error: () => {
          this.editingTask = null;
          alert('Failed to update task. Please try again.');
        },
      });
  }

  cancelEditTask() {
    this.editingTask = null;
  }

  deleteTask(task: Task, col: BoardColumn) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        col.tasks = col.tasks.filter((t) => t.id !== task.id);
      },
      error: () => {
        alert(`Failed to delete "${task.title}". Please try again.`);
      },
    });
  }
}
