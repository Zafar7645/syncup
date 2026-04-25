import { Module } from '@nestjs/common';
import { ProjectsService } from '@/projects/projects.service';
import { ProjectsController } from '@/projects/projects.controller';
import { Project } from '@/projects/entities/project.entity';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Project, BoardColumn])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
