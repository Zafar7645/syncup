/**
 * @file tasks.service.ts
 * @description Business logic for task management. Ownership is verified by traversing
 * task → column → project → userId on every operation. Cross-column moves use a
 * transaction with pessimistic write locks on both source and target columns to prevent
 * order conflicts under concurrent requests. innerJoinAndSelect is used (not left join)
 * because PostgreSQL disallows FOR UPDATE on the nullable side of an outer join.
 */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/tasks/dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@/tasks/entities/task.entity';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
    @InjectRepository(BoardColumn)
    private columnsRepository: Repository<BoardColumn>,
  ) {}

  private async verifyColumnAccess(
    columnId: number,
    userId: number,
  ): Promise<void> {
    const column = await this.columnsRepository.findOne({
      where: { id: columnId },
      relations: ['project'],
    });

    if (!column) throw new NotFoundException('Column not found');
    if (column.project.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to add tasks to this board',
      );
    }
  }

  private async verifyTaskAccess(
    taskId: number,
    userId: number,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['column', 'column.project'],
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.column.project.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this task',
      );
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: number) {
    return await this.columnsRepository.manager.transaction(
      async (transactionalManager) => {
        const column = await transactionalManager
          .createQueryBuilder(BoardColumn, 'column')
          .innerJoinAndSelect('column.project', 'project')
          .where('column.id = :id', { id: createTaskDto.columnId })
          .setLock('pessimistic_write')
          .getOne();

        if (!column) {
          throw new NotFoundException('Column not found');
        }
        if (column.project.userId !== userId) {
          throw new ForbiddenException(
            'You do not have permission to add tasks to this board',
          );
        }

        let order = createTaskDto.order;
        if (order === undefined) {
          const lastTask = await transactionalManager.findOne(Task, {
            where: { columnId: createTaskDto.columnId },
            order: { order: 'DESC' },
          });
          order = lastTask ? lastTask.order + 1 : 0;
        }

        const task = transactionalManager.create(Task, {
          ...createTaskDto,
          order,
        });

        return await transactionalManager.save(task);
      },
    );
  }

  async findAll(columnId: number, userId: number) {
    await this.verifyColumnAccess(columnId, userId);
    return await this.tasksRepository.find({
      where: {
        columnId: columnId,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.verifyTaskAccess(id, userId);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.verifyTaskAccess(id, userId);

    if (
      updateTaskDto.columnId !== undefined &&
      updateTaskDto.columnId !== task.columnId
    ) {
      return await this.tasksRepository.manager.transaction(
        async (transactionalManager) => {
          const lockedTask = await transactionalManager
            .createQueryBuilder(Task, 'task')
            .innerJoinAndSelect('task.column', 'column')
            .innerJoinAndSelect('column.project', 'project')
            .where('task.id = :id', { id })
            .setLock('pessimistic_write')
            .getOne();

          if (!lockedTask) throw new NotFoundException('Task not found');
          if (lockedTask.column.project.userId !== userId) {
            throw new ForbiddenException(
              'You do not have permission to modify this task',
            );
          }

          const targetColumn = await transactionalManager
            .createQueryBuilder(BoardColumn, 'column')
            .innerJoinAndSelect('column.project', 'project')
            .where('column.id = :id', { id: updateTaskDto.columnId })
            .setLock('pessimistic_write')
            .getOne();

          if (!targetColumn) {
            throw new NotFoundException('Target column not found');
          }
          if (targetColumn.project.userId !== userId) {
            throw new ForbiddenException(
              'You do not have permission to move tasks to this board',
            );
          }

          if (updateTaskDto.order === undefined) {
            const lastTask = await transactionalManager.findOne(Task, {
              where: { columnId: updateTaskDto.columnId },
              order: { order: 'DESC' },
            });
            updateTaskDto.order = lastTask ? lastTask.order + 1 : 0;
          }

          const taskRepo = transactionalManager.getRepository(Task);
          const updatedTask = taskRepo.merge(lockedTask, updateTaskDto);
          return await taskRepo.save(updatedTask);
        },
      );
    }

    const updatedTask = this.tasksRepository.merge(task, updateTaskDto);
    return await this.tasksRepository.save(updatedTask);
  }

  async remove(id: number, userId: number) {
    const task = await this.verifyTaskAccess(id, userId);
    return await this.tasksRepository.remove(task);
  }
}
