import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsController } from '@/projects/projects.controller';
import { ProjectsService } from '@/projects/projects.service';
import { CreateProjectDto } from '@/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/projects/dto/update-project.dto';
import { Project } from '@/projects/entities/project.entity';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER_ID = 1;

const mockReq = { user: { userId: USER_ID, email: 'user@test.com' } };

const mockProject = (): Project =>
  ({
    id: 1,
    name: 'Alpha',
    description: 'Test project',
    userId: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Project;

// ── Mock service ──────────────────────────────────────────────────────────────

const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should delegate to ProjectsService.create with dto and userId from JWT', async () => {
      // Arrange
      const dto: CreateProjectDto = { name: 'Alpha', description: 'Desc' };
      const project = mockProject();
      mockProjectsService.create.mockResolvedValue(project);

      // Act
      const result = await controller.create(dto, mockReq);

      // Assert
      expect(mockProjectsService.create).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toEqual(project);
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should delegate to ProjectsService.findAll with userId from JWT', async () => {
      // Arrange
      const projects = [mockProject()];
      mockProjectsService.findAll.mockResolvedValue(projects);

      // Act
      const result = await controller.findAll(mockReq);

      // Assert
      expect(mockProjectsService.findAll).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual(projects);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should delegate to ProjectsService.findOne with id and userId', async () => {
      // Arrange
      const project = mockProject();
      mockProjectsService.findOne.mockResolvedValue(project);

      // Act
      const result = await controller.findOne(project.id, mockReq);

      // Assert
      expect(mockProjectsService.findOne).toHaveBeenCalledWith(
        project.id,
        USER_ID,
      );
      expect(result).toEqual(project);
    });

    it('should propagate NotFoundException from the service', async () => {
      // Arrange
      mockProjectsService.findOne.mockRejectedValue(
        new NotFoundException(
          'Project with ID "99" not found or you don\'t have access.',
        ),
      );

      // Act & Assert
      await expect(controller.findOne(99, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should delegate to ProjectsService.update with id, dto, and userId', async () => {
      // Arrange
      const dto: UpdateProjectDto = { name: 'Alpha v2' };
      const updated = { ...mockProject(), name: 'Alpha v2' } as Project;
      mockProjectsService.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update(1, dto, mockReq);

      // Assert
      expect(mockProjectsService.update).toHaveBeenCalledWith(1, dto, USER_ID);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from the service', async () => {
      // Arrange
      mockProjectsService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.update(99, {}, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delegate to ProjectsService.remove with id and userId', async () => {
      // Arrange
      const project = mockProject();
      mockProjectsService.remove.mockResolvedValue(project);

      // Act
      const result = await controller.remove(project.id, mockReq);

      // Assert
      expect(mockProjectsService.remove).toHaveBeenCalledWith(
        project.id,
        USER_ID,
      );
      expect(result).toEqual(project);
    });

    it('should propagate NotFoundException from the service', async () => {
      // Arrange
      mockProjectsService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(99, mockReq)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
