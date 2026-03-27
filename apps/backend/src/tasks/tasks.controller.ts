import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TasksService } from '@/tasks/tasks.service';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/tasks/dto/update-task.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('columnId', ParseIntPipe) columnId: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.tasksService.findAll(columnId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.tasksService.remove(id, req.user.userId);
  }
}
