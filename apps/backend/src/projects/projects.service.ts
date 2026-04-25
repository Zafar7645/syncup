import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from '@/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/projects/dto/update-project.dto';
import { Repository } from 'typeorm';
import { Project } from '@/projects/entities/project.entity';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { InjectRepository } from '@nestjs/typeorm';

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(BoardColumn)
    private columnsRepository: Repository<BoardColumn>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: number) {
    return await this.projectsRepository.manager.transaction(async (manager) => {
      const project = manager.create(Project, { ...createProjectDto, userId });
      await manager.save(project);

      const columns = DEFAULT_COLUMNS.map((name, order) =>
        manager.create(BoardColumn, { name, order, projectId: project.id }),
      );
      await manager.save(columns);

      return project;
    });
  }

  async findAll(userId: number) {
    return await this.projectsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const project = await this.projectsRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID "${id}" not found or you don't have access.`,
      );
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    const project = await this.findOne(id, userId);
    const updatedProject = this.projectsRepository.merge(project, updateProjectDto);
    return await this.projectsRepository.save(updatedProject);
  }

  async remove(id: number, userId: number) {
    const project = await this.findOne(id, userId);
    return await this.projectsRepository.remove(project);
  }
}
