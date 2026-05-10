import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BoardColumnsController } from '@/board-columns/board-columns.controller';
import { BoardColumnsService } from '@/board-columns/board-columns.service';
import { CreateBoardColumnDto } from '@/board-columns/dto/create-board-column.dto';
import { UpdateBoardColumnDto } from '@/board-columns/dto/update-board-column.dto';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 1;
const PROJECT_ID = 10;
const COLUMN_ID = 20;

const mockReq = { user: { userId: USER_ID, email: 'user@test.com' } };

const mockColumn = (): BoardColumn =>
  ({
    id: COLUMN_ID,
    name: 'To Do',
    order: 0,
    projectId: PROJECT_ID,
    tasks: [],
  }) as unknown as BoardColumn;

// ── Mock service ──────────────────────────────────────────────────────────────

const mockBoardColumnsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('BoardColumnsController', () => {
  let controller: BoardColumnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardColumnsController],
      providers: [
        {
          provide: BoardColumnsService,
          useValue: mockBoardColumnsService,
        },
      ],
    }).compile();

    controller = module.get<BoardColumnsController>(BoardColumnsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should delegate to BoardColumnsService.create with dto and userId', async () => {
      // Arrange
      const dto: CreateBoardColumnDto = {
        name: 'Backlog',
        projectId: PROJECT_ID,
      };
      const column = mockColumn();
      mockBoardColumnsService.create.mockResolvedValue(column);

      // Act
      const result = await controller.create(dto, mockReq);

      // Assert
      expect(mockBoardColumnsService.create).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toEqual(column);
    });

    it('should propagate ForbiddenException from the service', async () => {
      // Arrange
      mockBoardColumnsService.create.mockRejectedValue(
        new ForbiddenException(),
      );

      // Act & Assert
      await expect(
        controller.create({ name: 'X', projectId: 999 }, mockReq),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should delegate to BoardColumnsService.findAll with projectId and userId', async () => {
      // Arrange
      const columns = [mockColumn()];
      mockBoardColumnsService.findAll.mockResolvedValue(columns);

      // Act
      const result = await controller.findAll(PROJECT_ID, mockReq);

      // Assert
      expect(mockBoardColumnsService.findAll).toHaveBeenCalledWith(
        PROJECT_ID,
        USER_ID,
      );
      expect(result).toEqual(columns);
    });

    it('should propagate NotFoundException when the project does not exist', async () => {
      // Arrange
      mockBoardColumnsService.findAll.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(controller.findAll(999, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should delegate to BoardColumnsService.findOne with id and userId', async () => {
      // Arrange
      const column = mockColumn();
      mockBoardColumnsService.findOne.mockResolvedValue(column);

      // Act
      const result = await controller.findOne(COLUMN_ID, mockReq);

      // Assert
      expect(mockBoardColumnsService.findOne).toHaveBeenCalledWith(
        COLUMN_ID,
        USER_ID,
      );
      expect(result).toEqual(column);
    });

    it('should propagate NotFoundException from the service', async () => {
      // Arrange
      mockBoardColumnsService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(controller.findOne(999, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should delegate to BoardColumnsService.update with id, dto, and userId', async () => {
      // Arrange
      const dto: UpdateBoardColumnDto = { name: 'In Review' };
      const updated = { ...mockColumn(), name: 'In Review' } as BoardColumn;
      mockBoardColumnsService.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update(COLUMN_ID, dto, mockReq);

      // Assert
      expect(mockBoardColumnsService.update).toHaveBeenCalledWith(
        COLUMN_ID,
        dto,
        USER_ID,
      );
      expect(result).toEqual(updated);
    });

    it('should propagate ForbiddenException from the service', async () => {
      // Arrange
      mockBoardColumnsService.update.mockRejectedValue(
        new ForbiddenException(),
      );

      // Act & Assert
      await expect(
        controller.update(COLUMN_ID, {}, mockReq),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delegate to BoardColumnsService.remove with id and userId', async () => {
      // Arrange
      const column = mockColumn();
      mockBoardColumnsService.remove.mockResolvedValue(column);

      // Act
      const result = await controller.remove(COLUMN_ID, mockReq);

      // Assert
      expect(mockBoardColumnsService.remove).toHaveBeenCalledWith(
        COLUMN_ID,
        USER_ID,
      );
      expect(result).toEqual(column);
    });

    it('should propagate ForbiddenException from the service', async () => {
      // Arrange
      mockBoardColumnsService.remove.mockRejectedValue(
        new ForbiddenException(),
      );

      // Act & Assert
      await expect(
        controller.remove(COLUMN_ID, mockReq),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
