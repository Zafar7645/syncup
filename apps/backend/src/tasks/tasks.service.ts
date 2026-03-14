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
    await this.verifyColumnAccess(createTaskDto.columnId, userId);

    let order = createTaskDto.order;
    if (order === undefined) {
      const lastTask = await this.tasksRepository.findOne({
        where: { columnId: createTaskDto.columnId },
        order: { order: 'DESC' },
      });
      order = lastTask ? lastTask.order + 1 : 0;
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      order,
    });

    return await this.tasksRepository.save(task);
  }

  findAll() {
    return `This action returns all tasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.verifyTaskAccess(id, userId);

    if (updateTaskDto.columnId && updateTaskDto.columnId !== task.columnId) {
      await this.verifyColumnAccess(updateTaskDto.columnId, userId);
    }

    const updatedTask = this.tasksRepository.merge(task, updateTaskDto);
    return await this.tasksRepository.save(updatedTask);
  }

  async remove(id: number, userId: number) {
    const task = await this.verifyTaskAccess(id, userId);
    return await this.tasksRepository.remove(task);
  }
}
