import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Kanban } from '@/app/pages/kanban/kanban';
import { BoardColumnService } from '@/app/projects/board-column.service';
import { TaskService } from '@/app/projects/task.service';
import { ProjectService } from '@/app/projects/project.service';
import { Auth } from '@/app/auth/services/auth';
import { BoardColumn } from '@/app/projects/board-column.model';
import { Task } from '@/app/projects/task.model';
import { Project } from '@/app/projects/project.model';

// ── Stub Nav (avoids Auth + Router deps in the child) ─────────────────────────

@Component({ selector: 'app-nav', template: '', standalone: true })
class NavStub {
  @Input() title!: string;
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

const mockTask = (id = 1, columnId = 10): Task => ({
  id, title: `Task ${id}`, description: null, order: 0, columnId,
  createdAt: '', updatedAt: '',
});

const mockColumn = (id = 10, tasks: Task[] = []): BoardColumn => ({
  id, name: `Column ${id}`, order: 0, projectId: 1, tasks,
  createdAt: '', updatedAt: '',
});

const mockProject = (): Project => ({
  id: 1, name: 'Alpha', description: null, createdAt: '', updatedAt: '',
});

const makeDropEvent = (
  prevData: Task[], prevIdx: number,
  currData: Task[], currIdx: number,
  currId: string,
  sameContainer = false,
): CdkDragDrop<Task[]> => {
  const prev = { data: prevData, id: '10' };
  const curr = sameContainer ? prev : { data: currData, id: currId };
  return { previousContainer: prev, container: curr, previousIndex: prevIdx, currentIndex: currIdx } as unknown as CdkDragDrop<Task[]>;
};

describe('Kanban', () => {
  let component: Kanban;
  let fixture: ComponentFixture<Kanban>;
  let boardColumnServiceSpy: jasmine.SpyObj<BoardColumnService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let authServiceSpy: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    boardColumnServiceSpy = jasmine.createSpyObj<BoardColumnService>('BoardColumnService', [
      'getColumns', 'createColumn', 'updateColumn', 'deleteColumn',
    ]);
    taskServiceSpy = jasmine.createSpyObj<TaskService>('TaskService', [
      'createTask', 'updateTask', 'deleteTask',
    ]);
    projectServiceSpy = jasmine.createSpyObj<ProjectService>('ProjectService', ['getProject']);
    authServiceSpy = jasmine.createSpyObj<Auth>('Auth', ['getUserEmail']);

    boardColumnServiceSpy.getColumns.and.returnValue(of([]));
    projectServiceSpy.getProject.and.returnValue(of(mockProject()));
    authServiceSpy.getUserEmail.and.returnValue('user@test.com');

    await TestBed.configureTestingModule({
      imports: [Kanban],
      providers: [
        { provide: BoardColumnService, useValue: boardColumnServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: Auth, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    })
      .overrideComponent(Kanban, {
        set: { imports: [NavStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Kanban);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ─────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should parse projectId from the route and load board + project name', () => {
      expect(component.projectId).toBe(1);
      expect(component.projectName).toBe('Alpha');
      expect(boardColumnServiceSpy.getColumns).toHaveBeenCalledWith(1);
    });
  });

  // ── loadBoard ────────────────────────────────────────────────────────────────

  describe('loadBoard', () => {
    it('should set columns and clear loading flag on success', () => {
      const columns = [mockColumn(10), mockColumn(11)];
      boardColumnServiceSpy.getColumns.and.returnValue(of(columns));

      component.loadBoard();

      expect(component.columns).toEqual(columns);
      expect(component.loading).toBeFalse();
    });

    it('should clear loading flag on error', () => {
      boardColumnServiceSpy.getColumns.and.returnValue(throwError(() => new Error('fail')));

      component.loadBoard();

      expect(component.loading).toBeFalse();
    });
  });

  // ── Escape key ───────────────────────────────────────────────────────────────

  describe('onEscape', () => {
    it('should cancel the task edit when a task is being edited', () => {
      component.editingTask = mockTask();
      component.onEscape();
      expect(component.editingTask).toBeNull();
    });

    it('should do nothing when no task is being edited', () => {
      component.editingTask = null;
      expect(() => component.onEscape()).not.toThrow();
    });
  });

  // ── Drag & Drop ───────────────────────────────────────────────────────────────

  describe('onTaskDrop', () => {
    it('should reorder tasks within the same column on success', () => {
      const t1 = mockTask(1, 10);
      const t2 = mockTask(2, 10);
      const col = { ...mockColumn(10), tasks: [t1, t2] };
      component.columns = [col];
      taskServiceSpy.updateTask.and.returnValue(of({ ...t1, order: 1 }));

      component.onTaskDrop(makeDropEvent(col.tasks, 0, col.tasks, 1, '10', true));

      expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(t1.id, { columnId: 10, order: 1 });
      expect(col.tasks[0].id).toBe(t2.id);
      expect(col.tasks[1].id).toBe(t1.id);
    });

    it('should revert the same-column reorder when the API call fails', () => {
      const t1 = mockTask(1, 10);
      const t2 = mockTask(2, 10);
      const col = { ...mockColumn(10), tasks: [t1, t2] };
      component.columns = [col];
      taskServiceSpy.updateTask.and.returnValue(throwError(() => new Error('fail')));

      component.onTaskDrop(makeDropEvent(col.tasks, 0, col.tasks, 1, '10', true));

      expect(col.tasks[0].id).toBe(t1.id);
      expect(col.tasks[1].id).toBe(t2.id);
    });

    it('should move a task to a different column on success', () => {
      const task = mockTask(1, 10);
      const src = { ...mockColumn(10), tasks: [task] };
      const dst = { ...mockColumn(11), tasks: [] as Task[] };
      component.columns = [src, dst];
      taskServiceSpy.updateTask.and.returnValue(of({ ...task, columnId: 11, order: 0 }));

      component.onTaskDrop(makeDropEvent(src.tasks, 0, dst.tasks, 0, '11'));

      expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(task.id, { columnId: 11, order: 0 });
      expect(src.tasks.length).toBe(0);
      expect(dst.tasks.length).toBe(1);
      expect(dst.tasks[0].id).toBe(task.id);
    });

    it('should revert the cross-column move when the API call fails', () => {
      const task = mockTask(1, 10);
      const src = { ...mockColumn(10), tasks: [task] };
      const dst = { ...mockColumn(11), tasks: [] as Task[] };
      component.columns = [src, dst];
      taskServiceSpy.updateTask.and.returnValue(throwError(() => new Error('fail')));

      component.onTaskDrop(makeDropEvent(src.tasks, 0, dst.tasks, 0, '11'));

      expect(src.tasks.length).toBe(1);
      expect(src.tasks[0].id).toBe(task.id);
      expect(dst.tasks.length).toBe(0);
    });
  });

  // ── Column management ────────────────────────────────────────────────────────

  describe('startAddColumn', () => {
    it('should set addingColumn to true and clear newColumnName', () => {
      component.newColumnName = 'leftover';
      component.startAddColumn();
      expect(component.addingColumn).toBeTrue();
      expect(component.newColumnName).toBe('');
    });
  });

  describe('confirmAddColumn', () => {
    it('should close the input without calling the service when name is empty', () => {
      component.newColumnName = '   ';
      component.addingColumn = true;
      component.confirmAddColumn();
      expect(boardColumnServiceSpy.createColumn).not.toHaveBeenCalled();
      expect(component.addingColumn).toBeFalse();
    });

    it('should call createColumn, append the new column, and reset state', () => {
      const col = mockColumn(99);
      boardColumnServiceSpy.createColumn.and.returnValue(of(col));
      component.columns = [];
      component.newColumnName = 'Backlog';
      component.projectId = 1;

      component.confirmAddColumn();

      expect(boardColumnServiceSpy.createColumn).toHaveBeenCalledWith({ name: 'Backlog', projectId: 1 });
      expect(component.columns.length).toBe(1);
      expect(component.columns[0].id).toBe(99);
      expect(component.addingColumn).toBeFalse();
    });

    it('should alert on error', () => {
      boardColumnServiceSpy.createColumn.and.returnValue(throwError(() => new Error()));
      spyOn(window, 'alert');
      component.newColumnName = 'Backlog';
      component.confirmAddColumn();
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('startRenameColumn', () => {
    it('should set editingColumnId and editingColumnName', () => {
      const col = mockColumn(10);
      component.startRenameColumn(col);
      expect(component.editingColumnId).toBe(10);
      expect(component.editingColumnName).toBe('Column 10');
    });
  });

  describe('confirmRenameColumn', () => {
    it('should cancel when name is empty', () => {
      const col = mockColumn(10);
      component.editingColumnName = '  ';
      component.confirmRenameColumn(col);
      expect(boardColumnServiceSpy.updateColumn).not.toHaveBeenCalled();
      expect(component.editingColumnId).toBeNull();
    });

    it('should cancel when name is unchanged', () => {
      const col = mockColumn(10);
      component.editingColumnName = col.name;
      component.confirmRenameColumn(col);
      expect(boardColumnServiceSpy.updateColumn).not.toHaveBeenCalled();
    });

    it('should call updateColumn and update the column in the list', () => {
      const col = mockColumn(10);
      const updated = { ...col, name: 'In Review' };
      boardColumnServiceSpy.updateColumn.and.returnValue(of(updated));
      component.columns = [col];
      component.editingColumnName = 'In Review';

      component.confirmRenameColumn(col);

      expect(boardColumnServiceSpy.updateColumn).toHaveBeenCalledWith(10, { name: 'In Review' });
      expect(component.columns[0].name).toBe('In Review');
      expect(component.editingColumnId).toBeNull();
    });

    it('should alert and keep the column name unchanged on error', () => {
      const col = mockColumn(10);
      boardColumnServiceSpy.updateColumn.and.returnValue(throwError(() => new Error()));
      spyOn(window, 'alert');
      component.columns = [col];
      component.editingColumnName = 'New Name';

      component.confirmRenameColumn(col);

      expect(window.alert).toHaveBeenCalled();
      expect(component.columns[0].name).toBe('Column 10');
      expect(component.editingColumnId).toBeNull();
    });
  });

  describe('cancelRenameColumn', () => {
    it('should clear editingColumnId', () => {
      component.editingColumnId = 10;
      component.cancelRenameColumn();
      expect(component.editingColumnId).toBeNull();
    });
  });

  describe('deleteColumn', () => {
    it('should call deleteColumn and remove the column from the list', () => {
      const col = mockColumn(10);
      component.columns = [col, mockColumn(11)];
      boardColumnServiceSpy.deleteColumn.and.returnValue(of(undefined));
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteColumn(col);

      expect(boardColumnServiceSpy.deleteColumn).toHaveBeenCalledWith(10);
      expect(component.columns.length).toBe(1);
      expect(component.columns[0].id).toBe(11);
    });

    it('should not call the service when confirm is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteColumn(mockColumn(10));
      expect(boardColumnServiceSpy.deleteColumn).not.toHaveBeenCalled();
    });

    it('should alert and keep the column in the list on error', () => {
      const col = mockColumn(10);
      component.columns = [col];
      boardColumnServiceSpy.deleteColumn.and.returnValue(throwError(() => new Error('fail')));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      component.deleteColumn(col);

      expect(window.alert).toHaveBeenCalled();
      expect(component.columns.length).toBe(1);
    });
  });

  // ── Task management ──────────────────────────────────────────────────────────

  describe('openAddTask', () => {
    it('should set addingTaskInColumnId and clear newTaskTitle', () => {
      component.newTaskTitle = 'leftover';
      component.openAddTask(10);
      expect(component.addingTaskInColumnId).toBe(10);
      expect(component.newTaskTitle).toBe('');
    });
  });

  describe('confirmAddTask', () => {
    it('should close the input without calling the service when title is empty', () => {
      const col = mockColumn(10);
      component.newTaskTitle = '   ';
      component.confirmAddTask(col);
      expect(taskServiceSpy.createTask).not.toHaveBeenCalled();
      expect(component.addingTaskInColumnId).toBeNull();
    });

    it('should call createTask, append the task to the column, and reset state', () => {
      const col = mockColumn(10);
      const task = mockTask(1, 10);
      taskServiceSpy.createTask.and.returnValue(of(task));
      component.columns = [col];
      component.newTaskTitle = 'Fix bug';

      component.confirmAddTask(col);

      expect(taskServiceSpy.createTask).toHaveBeenCalledWith({ title: 'Fix bug', columnId: 10 });
      expect(col.tasks.length).toBe(1);
      expect(component.addingTaskInColumnId).toBeNull();
    });
  });

  describe('cancelAddTask', () => {
    it('should clear addingTaskInColumnId', () => {
      component.addingTaskInColumnId = 10;
      component.cancelAddTask();
      expect(component.addingTaskInColumnId).toBeNull();
    });
  });

  describe('startEditTask', () => {
    it('should populate editing fields from the task', () => {
      const task: Task = { ...mockTask(), title: 'Do work', description: 'Details' };
      component.startEditTask(task);
      expect(component.editingTask).toEqual(task);
      expect(component.editingTaskTitle).toBe('Do work');
      expect(component.editingTaskDescription).toBe('Details');
    });

    it('should set editingTaskDescription to empty string when description is null', () => {
      const task = mockTask();
      component.startEditTask(task);
      expect(component.editingTaskDescription).toBe('');
    });
  });

  describe('confirmEditTask', () => {
    it('should do nothing when editingTask is null', () => {
      component.editingTask = null;
      component.confirmEditTask();
      expect(taskServiceSpy.updateTask).not.toHaveBeenCalled();
    });

    it('should do nothing when the title is empty', () => {
      component.editingTask = mockTask();
      component.editingTaskTitle = '   ';
      component.confirmEditTask();
      expect(taskServiceSpy.updateTask).not.toHaveBeenCalled();
    });

    it('should call updateTask and update the task in its column', () => {
      const task = mockTask(1, 10);
      const updated = { ...task, title: 'Fixed' };
      const col = { ...mockColumn(10), tasks: [task] };
      component.columns = [col];
      component.editingTask = task;
      component.editingTaskTitle = 'Fixed';
      component.editingTaskDescription = '';
      taskServiceSpy.updateTask.and.returnValue(of(updated));

      component.confirmEditTask();

      expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(1, { title: 'Fixed', description: undefined });
      expect(component.columns[0].tasks[0].title).toBe('Fixed');
      expect(component.editingTask).toBeNull();
    });
  });

  describe('cancelEditTask', () => {
    it('should clear editingTask', () => {
      component.editingTask = mockTask();
      component.cancelEditTask();
      expect(component.editingTask).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should call deleteTask and remove the task from the column', () => {
      const task = mockTask(1, 10);
      const col = { ...mockColumn(10), tasks: [task, mockTask(2, 10)] };
      component.columns = [col];
      taskServiceSpy.deleteTask.and.returnValue(of(undefined));
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteTask(task, col);

      expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(1);
      expect(col.tasks.length).toBe(1);
      expect(col.tasks[0].id).toBe(2);
    });

    it('should not call the service when confirm is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteTask(mockTask(), mockColumn());
      expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
    });

    it('should alert and keep the task in the column on error', () => {
      const task = mockTask(1, 10);
      const col = { ...mockColumn(10), tasks: [task] };
      component.columns = [col];
      taskServiceSpy.deleteTask.and.returnValue(throwError(() => new Error('fail')));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      component.deleteTask(task, col);

      expect(window.alert).toHaveBeenCalled();
      expect(col.tasks.length).toBe(1);
    });
  });
});
