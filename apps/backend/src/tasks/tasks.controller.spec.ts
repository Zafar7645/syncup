import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksController } from '@/tasks/tasks.controller';
import { TasksService } from '@/tasks/tasks.service';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/tasks/dto/update-task.dto';
import { Task } from '@/tasks/entities/task.entity';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 1;
const COLUMN_ID = 20;
const TASK_ID = 30;

const mockReq = { user: { userId: USER_ID, email: 'user@test.com' } };

const mockTask = (): Task =>
  ({
    id: TASK_ID,
    title: 'Fix bug',
    description: null,
    order: 0,
    columnId: COLUMN_ID,
  }) as Task;

// ── Mock service ──────────────────────────────────────────────────────────────

const mockTasksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should delegate to TasksService.create with dto and userId', async () => {
      // Arrange
      const dto: CreateTaskDto = { title: 'Fix bug', columnId: COLUMN_ID };
      const task = mockTask();
      mockTasksService.create.mockResolvedValue(task);

      // Act
      const result = await controller.create(dto, mockReq);

      // Assert
      expect(mockTasksService.create).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toEqual(task);
    });

    it('should propagate ForbiddenException from the service', async () => {
      // Arrange
      mockTasksService.create.mockRejectedValue(new ForbiddenException());

      // Act & Assert
      await expect(
        controller.create({ title: 'X', columnId: 999 }, mockReq),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should delegate to TasksService.findAll with columnId and userId', async () => {
      // Arrange
      const tasks = [mockTask()];
      mockTasksService.findAll.mockResolvedValue(tasks);

      // Act
      const result = await controller.findAll(COLUMN_ID, mockReq);

      // Assert
      expect(mockTasksService.findAll).toHaveBeenCalledWith(COLUMN_ID, USER_ID);
      expect(result).toEqual(tasks);
    });

    it('should propagate ForbiddenException when the column is not owned by the user', async () => {
      // Arrange
      mockTasksService.findAll.mockRejectedValue(new ForbiddenException());

      // Act & Assert
      await expect(controller.findAll(999, mockReq)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should delegate to TasksService.findOne with id and userId', async () => {
      // Arrange
      const task = mockTask();
      mockTasksService.findOne.mockResolvedValue(task);

      // Act
      const result = await controller.findOne(TASK_ID, mockReq);

      // Assert
      expect(mockTasksService.findOne).toHaveBeenCalledWith(TASK_ID, USER_ID);
      expect(result).toEqual(task);
    });

    it('should propagate NotFoundException from the service', async () => {
      // Arrange
      mockTasksService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(999, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should delegate to TasksService.update with id, dto, and userId', async () => {
      // Arrange
      const dto: UpdateTaskDto = { title: 'Updated title' };
      const updated = { ...mockTask(), title: 'Updated title' } as Task;
      mockTasksService.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update(TASK_ID, dto, mockReq);

      // Assert
      expect(mockTasksService.update).toHaveBeenCalledWith(
        TASK_ID,
        dto,
        USER_ID,
      );
      expect(result).toEqual(updated);
    });

    it('should propagate ForbiddenException when moving to a column the user does not own', async () => {
      // Arrange
      mockTasksService.update.mockRejectedValue(new ForbiddenException());

      // Act & Assert
      await expect(
        controller.update(TASK_ID, { columnId: 999 }, mockReq),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should propagate NotFoundException when the task does not exist', async () => {
      // Arrange
      mockTasksService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.update(999, {}, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delegate to TasksService.remove with id and userId', async () => {
      // Arrange
      const task = mockTask();
      mockTasksService.remove.mockResolvedValue(task);

      // Act
      const result = await controller.remove(TASK_ID, mockReq);

      // Assert
      expect(mockTasksService.remove).toHaveBeenCalledWith(TASK_ID, USER_ID);
      expect(result).toEqual(task);
    });

    it('should propagate ForbiddenException from the service', async () => {
      // Arrange
      mockTasksService.remove.mockRejectedValue(new ForbiddenException());

      // Act & Assert
      await expect(controller.remove(TASK_ID, mockReq)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should propagate NotFoundException when the task does not exist', async () => {
      // Arrange
      mockTasksService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(999, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
