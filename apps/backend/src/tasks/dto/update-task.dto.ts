import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
