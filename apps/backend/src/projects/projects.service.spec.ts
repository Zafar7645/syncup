import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from '@/projects/projects.service';
import { Project } from '@/projects/entities/project.entity';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { CreateProjectDto } from '@/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/projects/dto/update-project.dto';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 1;

const mockProject = (): Project =>
  ({
    id: 1,
    name: 'Alpha',
    description: 'Test project',
    userId: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Project;

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockTransactionalManager = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockProjectsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
};

const mockColumnsRepository = {}; // satisfies the DI token; no column repo methods are exercised

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
        {
          provide: getRepositoryToken(BoardColumn),
          useValue: mockColumnsRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);

    jest.clearAllMocks();

    // Default: transaction calls the callback with the mock manager
    mockProjectsRepository.manager.transaction.mockImplementation(
      async (
        cb: (manager: typeof mockTransactionalManager) => Promise<Project>,
      ) => cb(mockTransactionalManager),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a project and seed three default board columns', async () => {
      // Arrange
      const dto: CreateProjectDto = { name: 'Alpha', description: 'Desc' };
      const project = mockProject();

      mockTransactionalManager.create
        .mockReturnValueOnce(project) // first call → Project
        .mockReturnValueOnce({ name: 'To Do', order: 0, projectId: project.id })
        .mockReturnValueOnce({
          name: 'In Progress',
          order: 1,
          projectId: project.id,
        })
        .mockReturnValueOnce({ name: 'Done', order: 2, projectId: project.id });
      mockTransactionalManager.save
        .mockResolvedValueOnce(project) // save project
        .mockResolvedValueOnce([]); // save columns

      // Act
      const result = await service.create(dto, USER_ID);

      // Assert
      expect(mockProjectsRepository.manager.transaction).toHaveBeenCalled();
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(Project, {
        ...dto,
        userId: USER_ID,
      });
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(
        BoardColumn,
        expect.objectContaining({
          name: 'To Do',
          order: 0,
          projectId: project.id,
        }),
      );
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(
        BoardColumn,
        expect.objectContaining({
          name: 'In Progress',
          order: 1,
          projectId: project.id,
        }),
      );
      expect(mockTransactionalManager.create).toHaveBeenCalledWith(
        BoardColumn,
        expect.objectContaining({
          name: 'Done',
          order: 2,
          projectId: project.id,
        }),
      );
      expect(mockTransactionalManager.save).toHaveBeenCalledTimes(2);
      expect(result).toEqual(project);
    });

    it('should propagate errors thrown inside the transaction', async () => {
      // Arrange
      const dto: CreateProjectDto = { name: 'Alpha' };
      mockProjectsRepository.manager.transaction.mockRejectedValue(
        new Error('DB connection lost'),
      );

      // Act & Assert
      await expect(service.create(dto, USER_ID)).rejects.toThrow(
        'DB connection lost',
      );
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all projects belonging to the user ordered by createdAt DESC', async () => {
      // Arrange
      const projects = [
        mockProject(),
        { ...mockProject(), id: 2, name: 'Beta' },
      ];
      mockProjectsRepository.find.mockResolvedValue(projects);

      // Act
      const result = await service.findAll(USER_ID);

      // Assert
      expect(mockProjectsRepository.find).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(projects);
    });

    it('should return an empty array when the user has no projects', async () => {
      // Arrange
      mockProjectsRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll(USER_ID);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the project when it exists and belongs to the user', async () => {
      // Arrange
      const project = mockProject();
      mockProjectsRepository.findOne.mockResolvedValue(project);

      // Act
      const result = await service.findOne(project.id, USER_ID);

      // Assert
      expect(mockProjectsRepository.findOne).toHaveBeenCalledWith({
        where: { id: project.id, userId: USER_ID },
      });
      expect(result).toEqual(project);
    });

    it('should throw NotFoundException when project does not exist or is owned by another user', async () => {
      // Arrange
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(99, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should merge and save the updated project', async () => {
      // Arrange
      const project = mockProject();
      const dto: UpdateProjectDto = { name: 'Alpha v2' };
      const updated = { ...project, name: 'Alpha v2' } as Project;

      mockProjectsRepository.findOne.mockResolvedValue(project);
      mockProjectsRepository.merge.mockReturnValue(updated);
      mockProjectsRepository.save.mockResolvedValue(updated);

      // Act
      const result = await service.update(project.id, dto, USER_ID);

      // Assert
      expect(mockProjectsRepository.merge).toHaveBeenCalledWith(project, dto);
      expect(mockProjectsRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when the project is not found', async () => {
      // Arrange
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(99, { name: 'X' }, USER_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockProjectsRepository.merge).not.toHaveBeenCalled();
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove the project and return the deleted entity', async () => {
      // Arrange
      const project = mockProject();
      mockProjectsRepository.findOne.mockResolvedValue(project);
      mockProjectsRepository.remove.mockResolvedValue(project);

      // Act
      const result = await service.remove(project.id, USER_ID);

      // Assert
      expect(mockProjectsRepository.remove).toHaveBeenCalledWith(project);
      expect(result).toEqual(project);
    });

    it('should throw NotFoundException when the project is not found', async () => {
      // Arrange
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(99, USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockProjectsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
