import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from '@/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/projects/dto/update-project.dto';
import { Repository } from 'typeorm';
import { Project } from '@/projects/entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      userId,
    });

    return await this.projectsRepository.save(project);
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

    const updatedProject = this.projectsRepository.merge(
      project,
      updateProjectDto,
    );

    return await this.projectsRepository.save(updatedProject);
  }

  async remove(id: number, userId: number) {
    const project = await this.findOne(id, userId);

    return await this.projectsRepository.remove(project);
  }
}
