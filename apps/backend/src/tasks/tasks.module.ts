import { Module } from '@nestjs/common';
import { TasksService } from '@/tasks/tasks.service';
import { TasksController } from '@/tasks/tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@/tasks/entities/task.entity';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { Project } from '@/projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, BoardColumn, Project])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
