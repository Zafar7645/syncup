/**
 * @file board-columns.service.ts
 * @description Business logic for Kanban board column management. Every operation
 * verifies that the requesting user owns the parent project before proceeding.
 * Column creation uses a pessimistic write lock to safely auto-assign order values
 * under concurrent requests. The findAll method eagerly loads tasks so the entire
 * board state is returned in a single query.
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardColumnDto } from '@/board-columns/dto/create-board-column.dto';
import { UpdateBoardColumnDto } from '@/board-columns/dto/update-board-column.dto';
import { Project } from '@/projects/entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';

@Injectable()
export class BoardColumnsService {
  constructor(
    @InjectRepository(BoardColumn)
    private columnsRepository: Repository<BoardColumn>,
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
  ) {}

  private async verifyProjectAccess(
    projectId: number,
    userId: number,
  ): Promise<void> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this project board',
      );
    }
  }

  private async verifyColumnAccess(
    columnId: number,
    userId: number,
  ): Promise<BoardColumn> {
    const column = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['project'],
    });
    if (!column) throw new NotFoundException('Column not found');
    if (column.project.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this column',
      );
    }
    return column;
  }

  async create(createDto: CreateBoardColumnDto, userId: number) {
    return await this.columnsRepository.manager.transaction(
      async (transactionalManager) => {
        const project = await transactionalManager
          .createQueryBuilder(Project, 'project')
          .where('project.id = :id', { id: createDto.projectId })
          .setLock('pessimistic_write')
          .getOne();

        if (!project) {
          throw new NotFoundException('Project not found');
        }
        if (project.userId !== userId) {
          throw new ForbiddenException(
            'You do not have permission to modify this project board',
          );
        }

        let order = createDto.order;
        if (order === undefined) {
          const lastColumn = await transactionalManager.findOne(BoardColumn, {
            where: { projectId: createDto.projectId },
            order: { order: 'DESC' },
          });
          order = lastColumn ? lastColumn.order + 1 : 0;
        }

        const column = transactionalManager.create(BoardColumn, {
          ...createDto,
          order,
        });
        return await transactionalManager.save(column);
      },
    );
  }

  async findAll(projectId: number, userId: number) {
    await this.verifyProjectAccess(projectId, userId);
    return await this.columnsRepository.find({
      where: { projectId },
      relations: { tasks: true },
      order: { order: 'ASC', tasks: { order: 'ASC' } },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.verifyColumnAccess(id, userId);
  }

  async update(id: number, updateDto: UpdateBoardColumnDto, userId: number) {
    const column = await this.verifyColumnAccess(id, userId);
    if ('projectId' in updateDto) {
      delete updateDto.projectId;
    }
    const updatedColumn = this.columnsRepository.merge(column, updateDto);
    return await this.columnsRepository.save(updatedColumn);
  }

  async remove(id: number, userId: number) {
    const column = await this.verifyColumnAccess(id, userId);
    return await this.columnsRepository.remove(column);
  }
}
