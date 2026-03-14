import { Module } from '@nestjs/common';
import { BoardColumnsService } from '@/board-columns/board-columns.service';
import { BoardColumnsController } from '@/board-columns/board-columns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { Project } from '@/projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardColumn, Project])],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService],
})
export class BoardColumnsModule {}
