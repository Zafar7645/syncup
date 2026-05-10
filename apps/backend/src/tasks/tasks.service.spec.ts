import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from '@/tasks/tasks.service';
import { Task } from '@/tasks/entities/task.entity';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/tasks/dto/update-task.dto';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 1;
const OTHER_USER_ID = 99;
const PROJECT_ID = 10;
const COLUMN_ID = 20;
const TARGET_COLUMN_ID = 21;
const TASK_ID = 30;

const mockProject = () => ({ id: PROJECT_ID, userId: USER_ID });

const mockColumnWithProject = (userId = USER_ID) =>
  ({
    id: COLUMN_ID,
    name: 'To Do',
    order: 0,
    projectId: PROJECT_ID,
    project: { id: PROJECT_ID, userId },
  }) as unknown as BoardColumn;

const mockTask = (): Task =>
  ({
    id: TASK_ID,
    title: 'Fix bug',
    description: null,
    order: 0,
    columnId: COLUMN_ID,
    column: mockColumnWithProject(),
  }) as unknown as Task;

// ── Helpers for query builder mocks ──────────────────────────────────────────

const makeQB = (resolvedValue: unknown) => ({
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  setLock: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(resolvedValue),
});

// ── Repository mocks ──────────────────────────────────────────────────────────

const mockTasksRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
};

const mockColumnsRepository = {
  findOne: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
        {
          provide: getRepositoryToken(BoardColumn),
          useValue: mockColumnsRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const setupCreateTransaction = (
      columnWithProject: unknown,
      lastTask: unknown,
      savedTask: Task,
    ) => {
      const mockManager = {
        createQueryBuilder: jest
          .fn()
          .mockReturnValue(makeQB(columnWithProject)),
        findOne: jest.fn().mockResolvedValue(lastTask),
        create: jest.fn().mockReturnValue(savedTask),
        save: jest.fn().mockResolvedValue(savedTask),
      };
      // create() uses columnsRepository.manager.transaction, not tasksRepository
      mockColumnsRepository.manager.transaction.mockImplementation(
        async (cb: (m: typeof mockManager) => Promise<Task>) => cb(mockManager),
      );
      return mockManager;
    };

    it('should create a task with auto-assigned order 0 when the column is empty', async () => {
      // Arrange
      const dto: CreateTaskDto = { title: 'Fix bug', columnId: COLUMN_ID };
      const task = mockTask();
      const manager = setupCreateTransaction(
        mockColumnWithProject(),
        null,
        task,
      );

      // Act
      const result = await service.create(dto, USER_ID);

      // Assert
      expect(manager.create).toHaveBeenCalledWith(
        Task,
        expect.objectContaining({
          title: 'Fix bug',
          columnId: COLUMN_ID,
          order: 0,
        }),
      );
      expect(result).toEqual(task);
    });

    it('should auto-assign order as last task order + 1', async () => {
      // Arrange
      const dto: CreateTaskDto = { title: 'Second task', columnId: COLUMN_ID };
      const task = { ...mockTask(), order: 3 } as Task;
      const manager = setupCreateTransaction(
        mockColumnWithProject(),
        { order: 2 },
        task,
      );

      // Act
      await service.create(dto, USER_ID);

      // Assert
      expect(manager.create).toHaveBeenCalledWith(
        Task,
        expect.objectContaining({ order: 3 }),
      );
    });

    it('should use the provided order when explicitly supplied', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        title: 'Pinned',
        columnId: COLUMN_ID,
        order: 5,
      };
      const task = { ...mockTask(), order: 5 } as Task;
      const manager = setupCreateTransaction(
        mockColumnWithProject(),
        null,
        task,
      );

      // Act
      await service.create(dto, USER_ID);

      // Assert
      expect(manager.create).toHaveBeenCalledWith(
        Task,
        expect.objectContaining({ order: 5 }),
      );
    });

    it('should throw NotFoundException when the column does not exist', async () => {
      // Arrange
      const dto: CreateTaskDto = { title: 'Fix bug', columnId: 999 };
      setupCreateTransaction(null, null, mockTask());

      // Act & Assert
      await expect(service.create(dto, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the column belongs to another user', async () => {
      // Arrange
      const dto: CreateTaskDto = { title: 'Fix bug', columnId: COLUMN_ID };
      setupCreateTransaction(
        mockColumnWithProject(OTHER_USER_ID),
        null,
        mockTask(),
      );

      // Act & Assert
      await expect(service.create(dto, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return tasks in the column ordered by order ASC', async () => {
      // Arrange
      const column = mockColumnWithProject();
      const tasks = [mockTask()];
      mockColumnsRepository.findOne.mockResolvedValue(column);
      mockTasksRepository.find.mockResolvedValue(tasks);

      // Act
      const result = await service.findAll(COLUMN_ID, USER_ID);

      // Assert
      expect(mockTasksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { columnId: COLUMN_ID },
          order: { order: 'ASC' },
        }),
      );
      expect(result).toEqual(tasks);
    });

    it('should throw NotFoundException when the column does not exist', async () => {
      // Arrange
      mockColumnsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findAll(999, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the column belongs to another user', async () => {
      // Arrange
      mockColumnsRepository.findOne.mockResolvedValue(
        mockColumnWithProject(OTHER_USER_ID),
      );

      // Act & Assert
      await expect(service.findAll(COLUMN_ID, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the task when it exists and is owned by the user', async () => {
      // Arrange
      const task = mockTask();
      mockTasksRepository.findOne.mockResolvedValue(task);

      // Act
      const result = await service.findOne(TASK_ID, USER_ID);

      // Assert
      expect(mockTasksRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: TASK_ID } }),
      );
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      // Arrange
      mockTasksRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the task belongs to another user', async () => {
      // Arrange
      const task = {
        ...mockTask(),
        column: mockColumnWithProject(OTHER_USER_ID),
      } as Task;
      mockTasksRepository.findOne.mockResolvedValue(task);

      // Act & Assert
      await expect(service.findOne(TASK_ID, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── update (same column) ─────────────────────────────────────────────────────

  describe('update — same column', () => {
    it('should merge and save when columnId is unchanged', async () => {
      // Arrange
      const task = mockTask();
      const dto: UpdateTaskDto = { title: 'Updated title' };
      const updated = { ...task, title: 'Updated title' } as Task;
      mockTasksRepository.findOne.mockResolvedValue(task);
      mockTasksRepository.merge.mockReturnValue(updated);
      mockTasksRepository.save.mockResolvedValue(updated);

      // Act
      const result = await service.update(TASK_ID, dto, USER_ID);

      // Assert
      expect(mockTasksRepository.merge).toHaveBeenCalledWith(task, dto);
      expect(mockTasksRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      // Arrange
      mockTasksRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(999, { title: 'X' }, USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ForbiddenException when the task belongs to another user', async () => {
      // Arrange
      const task = {
        ...mockTask(),
        column: mockColumnWithProject(OTHER_USER_ID),
      } as Task;
      mockTasksRepository.findOne.mockResolvedValue(task);

      // Act & Assert
      await expect(
        service.update(TASK_ID, { title: 'X' }, USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── update (cross-column move) ───────────────────────────────────────────────

  describe('update — cross-column move', () => {
    const setupMoveTransaction = (
      lockedTask: unknown,
      targetColumn: unknown,
      lastTaskInTarget: unknown,
      updatedTask: Task,
    ) => {
      const taskQB = makeQB(lockedTask);
      const columnQB = makeQB(targetColumn);

      const mockManager = {
        createQueryBuilder: jest
          .fn()
          .mockReturnValueOnce(taskQB) // first call: lock the task
          .mockReturnValueOnce(columnQB), // second call: lock the target column
        findOne: jest.fn().mockResolvedValue(lastTaskInTarget),
        getRepository: jest.fn().mockReturnValue({
          merge: jest.fn().mockReturnValue(updatedTask),
          save: jest.fn().mockResolvedValue(updatedTask),
        }),
      };

      mockTasksRepository.manager.transaction.mockImplementation(
        async (cb: (m: typeof mockManager) => Promise<Task>) => cb(mockManager),
      );

      return mockManager;
    };

    it('should move the task and auto-assign order in the target column', async () => {
      // Arrange
      const task = mockTask();
      const lockedTask = {
        ...task,
        column: mockColumnWithProject(),
      };
      const targetColumn = {
        id: TARGET_COLUMN_ID,
        project: mockProject(),
      };
      const updatedTask = {
        ...task,
        columnId: TARGET_COLUMN_ID,
        order: 0,
      } as Task;
      const dto: UpdateTaskDto = { columnId: TARGET_COLUMN_ID };

      mockTasksRepository.findOne.mockResolvedValue(task);
      const manager = setupMoveTransaction(
        lockedTask,
        targetColumn,
        null,
        updatedTask,
      );

      // Act
      const result = await service.update(TASK_ID, dto, USER_ID);

      // Assert
      expect(mockTasksRepository.manager.transaction).toHaveBeenCalled();
      expect(manager.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedTask);
    });

    it('should assign order as last task order + 1 in the target column', async () => {
      // Arrange
      const task = mockTask();
      const lockedTask = { ...task, column: mockColumnWithProject() };
      const targetColumn = { id: TARGET_COLUMN_ID, project: mockProject() };
      const lastTask = { order: 4 };
      const updatedTask = {
        ...task,
        columnId: TARGET_COLUMN_ID,
        order: 5,
      } as Task;
      const dto: UpdateTaskDto = { columnId: TARGET_COLUMN_ID };

      mockTasksRepository.findOne.mockResolvedValue(task);
      const manager = setupMoveTransaction(
        lockedTask,
        targetColumn,
        lastTask,
        updatedTask,
      );

      // Act
      const result = await service.update(TASK_ID, dto, USER_ID);

      // Assert — verify the service passed the computed order to merge, not just the return value
      const taskRepo = manager.getRepository.mock.results[0].value as {
        merge: jest.Mock;
        save: jest.Mock;
      };
      expect(taskRepo.merge).toHaveBeenCalledWith(
        lockedTask,
        expect.objectContaining({ columnId: TARGET_COLUMN_ID, order: 5 }),
      );
      expect(result.order).toBe(5);
    });

    it('should throw NotFoundException when the target column does not exist', async () => {
      // Arrange
      const task = mockTask();
      const lockedTask = { ...task, column: mockColumnWithProject() };
      const dto: UpdateTaskDto = { columnId: TARGET_COLUMN_ID };

      mockTasksRepository.findOne.mockResolvedValue(task);
      setupMoveTransaction(lockedTask, null, null, task);

      // Act & Assert
      await expect(
        service.update(TASK_ID, dto, USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ForbiddenException when the target column belongs to another user', async () => {
      // Arrange
      const task = mockTask();
      const lockedTask = { ...task, column: mockColumnWithProject() };
      const targetColumn = {
        id: TARGET_COLUMN_ID,
        project: { id: PROJECT_ID, userId: OTHER_USER_ID },
      };
      const dto: UpdateTaskDto = { columnId: TARGET_COLUMN_ID };

      mockTasksRepository.findOne.mockResolvedValue(task);
      setupMoveTransaction(lockedTask, targetColumn, null, task);

      // Act & Assert
      await expect(
        service.update(TASK_ID, dto, USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw NotFoundException when the task disappears inside the transaction', async () => {
      // Arrange — simulates the task being deleted between the outer findOne and the lock
      const task = mockTask();
      const dto: UpdateTaskDto = { columnId: TARGET_COLUMN_ID };
      mockTasksRepository.findOne.mockResolvedValue(task);
      setupMoveTransaction(null, mockColumnWithProject(), null, task);

      // Act & Assert
      await expect(
        service.update(TASK_ID, dto, USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove the task and return the deleted entity', async () => {
      // Arrange
      const task = mockTask();
      mockTasksRepository.findOne.mockResolvedValue(task);
      mockTasksRepository.remove.mockResolvedValue(task);

      // Act
      const result = await service.remove(TASK_ID, USER_ID);

      // Assert
      expect(mockTasksRepository.remove).toHaveBeenCalledWith(task);
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      // Arrange
      mockTasksRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockTasksRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the task belongs to another user', async () => {
      // Arrange
      const task = {
        ...mockTask(),
        column: mockColumnWithProject(OTHER_USER_ID),
      } as Task;
      mockTasksRepository.findOne.mockResolvedValue(task);

      // Act & Assert
      await expect(service.remove(TASK_ID, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(mockTasksRepository.remove).not.toHaveBeenCalled();
    });
  });
});
