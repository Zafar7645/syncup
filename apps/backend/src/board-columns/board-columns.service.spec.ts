import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BoardColumnsService } from '@/board-columns/board-columns.service';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { Project } from '@/projects/entities/project.entity';
import { CreateBoardColumnDto } from '@/board-columns/dto/create-board-column.dto';
import { UpdateBoardColumnDto } from '@/board-columns/dto/update-board-column.dto';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 1;
const OTHER_USER_ID = 99;
const PROJECT_ID = 10;
const COLUMN_ID = 20;

const mockProject = (): Project =>
  ({ id: PROJECT_ID, userId: USER_ID }) as Project;

const mockColumn = (): BoardColumn =>
  ({
    id: COLUMN_ID,
    name: 'To Do',
    order: 0,
    projectId: PROJECT_ID,
    project: mockProject(),
    tasks: [],
  }) as unknown as BoardColumn;

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  setLock: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockTransactionalManager = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockColumnsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
};

const mockProjectsRepository = {
  findOne: jest.fn(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('BoardColumnsService', () => {
  let service: BoardColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardColumnsService,
        {
          provide: getRepositoryToken(BoardColumn),
          useValue: mockColumnsRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
      ],
    }).compile();

    service = module.get<BoardColumnsService>(BoardColumnsService);

    jest.clearAllMocks();

    // Default: transaction executes the callback immediately
    mockColumnsRepository.manager.transaction.mockImplementation(
      async (
        cb: (m: typeof mockTransactionalManager) => Promise<BoardColumn>,
      ) => cb(mockTransactionalManager),
    );
    // Default: queryBuilder is set up on the transactional manager
    mockTransactionalManager.createQueryBuilder.mockReturnValue(
      mockQueryBuilder,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a column with auto-assigned order (first column, order = 0)', async () => {
      // Arrange
      const dto: CreateBoardColumnDto = {
        name: 'Backlog',
        projectId: PROJECT_ID,
      };
      const project = mockProject();
      const column = { ...mockColumn(), name: 'Backlog', order: 0 };

      mockQueryBuilder.getOne.mockResolvedValue(project);
      mockTransactionalManager.findOne.mockResolvedValue(null); // no existing columns
      mockTransactionalManager.create.mockReturnValue(column);
      mockTransactionalManager.save.mockResolvedValue(column);

      // Act
      const result = await service.create(dto, USER_ID);

      // Assert
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(
        BoardColumn,
        expect.objectContaining({ name: 'Backlog', order: 0 }),
      );
      expect(result).toEqual(column);
    });

    it('should auto-assign order as last column order + 1', async () => {
      // Arrange
      const dto: CreateBoardColumnDto = {
        name: 'Review',
        projectId: PROJECT_ID,
      };
      const project = mockProject();
      const lastColumn = { order: 2 };
      const column = { ...mockColumn(), name: 'Review', order: 3 };

      mockQueryBuilder.getOne.mockResolvedValue(project);
      mockTransactionalManager.findOne.mockResolvedValue(lastColumn);
      mockTransactionalManager.create.mockReturnValue(column);
      mockTransactionalManager.save.mockResolvedValue(column);

      // Act
      const result = await service.create(dto, USER_ID);

      // Assert
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(
        BoardColumn,
        expect.objectContaining({ order: 3 }),
      );
      expect(result).toEqual(column);
    });

    it('should use the provided order when explicitly supplied', async () => {
      // Arrange
      const dto: CreateBoardColumnDto = {
        name: 'QA',
        projectId: PROJECT_ID,
        order: 1,
      };
      const project = mockProject();
      const column = { ...mockColumn(), name: 'QA', order: 1 };

      mockQueryBuilder.getOne.mockResolvedValue(project);
      mockTransactionalManager.create.mockReturnValue(column);
      mockTransactionalManager.save.mockResolvedValue(column);

      // Act
      const result = await service.create(dto, USER_ID);

      // Assert
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(
        BoardColumn,
        expect.objectContaining({ order: 1 }),
      );
      expect(mockTransactionalManager.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(column);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      // Arrange
      const dto: CreateBoardColumnDto = { name: 'Backlog', projectId: 999 };
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(dto, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the project is owned by another user', async () => {
      // Arrange
      const dto: CreateBoardColumnDto = {
        name: 'Backlog',
        projectId: PROJECT_ID,
      };
      const project = { ...mockProject(), userId: OTHER_USER_ID };
      mockQueryBuilder.getOne.mockResolvedValue(project);

      // Act & Assert
      await expect(service.create(dto, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return columns with tasks for the project', async () => {
      // Arrange
      const project = mockProject();
      const columns = [mockColumn()];
      mockProjectsRepository.findOne.mockResolvedValue(project);
      mockColumnsRepository.find.mockResolvedValue(columns);

      // Act
      const result = await service.findAll(PROJECT_ID, USER_ID);

      // Assert
      expect(mockColumnsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: PROJECT_ID },
          relations: { tasks: true },
          order: { order: 'ASC', tasks: { order: 'ASC' } },
        }),
      );
      expect(result).toEqual(columns);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      // Arrange
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findAll(999, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the project is owned by another user', async () => {
      // Arrange
      const project = { ...mockProject(), userId: OTHER_USER_ID };
      mockProjectsRepository.findOne.mockResolvedValue(project);

      // Act & Assert
      await expect(service.findAll(PROJECT_ID, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the column when it exists and is owned by the user', async () => {
      // Arrange
      const column = mockColumn();
      mockColumnsRepository.findOne.mockResolvedValue(column);

      // Act
      const result = await service.findOne(COLUMN_ID, USER_ID);

      // Assert
      expect(mockColumnsRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: COLUMN_ID } }),
      );
      expect(result).toEqual(column);
    });

    it('should throw NotFoundException when the column does not exist', async () => {
      // Arrange
      mockColumnsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException when the column belongs to another user's project", async () => {
      // Arrange
      const column = {
        ...mockColumn(),
        project: { id: PROJECT_ID, userId: OTHER_USER_ID },
      };
      mockColumnsRepository.findOne.mockResolvedValue(column);

      // Act & Assert
      await expect(service.findOne(COLUMN_ID, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the column', async () => {
      // Arrange
      const column = mockColumn();
      const dto: UpdateBoardColumnDto = { name: 'In Review' };
      const updated = { ...column, name: 'In Review' } as BoardColumn;
      mockColumnsRepository.findOne.mockResolvedValue(column);
      mockColumnsRepository.merge.mockReturnValue(updated);
      mockColumnsRepository.save.mockResolvedValue(updated);

      // Act
      const result = await service.update(COLUMN_ID, dto, USER_ID);

      // Assert
      expect(mockColumnsRepository.merge).toHaveBeenCalledWith(column, dto);
      expect(mockColumnsRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('should strip projectId from the update payload', async () => {
      // Arrange
      const column = mockColumn();
      const dto = { name: 'Done', projectId: 999 } as UpdateBoardColumnDto & {
        projectId?: number;
      };
      const updated = { ...column, name: 'Done' } as BoardColumn;
      mockColumnsRepository.findOne.mockResolvedValue(column);
      mockColumnsRepository.merge.mockReturnValue(updated);
      mockColumnsRepository.save.mockResolvedValue(updated);

      // Act
      await service.update(COLUMN_ID, dto, USER_ID);

      // Assert — projectId must not be in what is merged
      expect(mockColumnsRepository.merge).toHaveBeenCalledWith(
        column,
        expect.not.objectContaining({ projectId: 999 }),
      );
    });

    it('should throw ForbiddenException when the column is not owned by the user', async () => {
      // Arrange
      const column = {
        ...mockColumn(),
        project: { id: PROJECT_ID, userId: OTHER_USER_ID },
      };
      mockColumnsRepository.findOne.mockResolvedValue(column);

      // Act & Assert
      await expect(
        service.update(COLUMN_ID, { name: 'X' }, USER_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove the column and return the deleted entity', async () => {
      // Arrange
      const column = mockColumn();
      mockColumnsRepository.findOne.mockResolvedValue(column);
      mockColumnsRepository.remove.mockResolvedValue(column);

      // Act
      const result = await service.remove(COLUMN_ID, USER_ID);

      // Assert
      expect(mockColumnsRepository.remove).toHaveBeenCalledWith(column);
      expect(result).toEqual(column);
    });

    it('should throw ForbiddenException when the column is not owned by the user', async () => {
      // Arrange
      const column = {
        ...mockColumn(),
        project: { id: PROJECT_ID, userId: OTHER_USER_ID },
      };
      mockColumnsRepository.findOne.mockResolvedValue(column);

      // Act & Assert
      await expect(service.remove(COLUMN_ID, USER_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(mockColumnsRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the column does not exist', async () => {
      // Arrange
      mockColumnsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
