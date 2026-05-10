/**
 * @file update-task.dto.ts
 * @description Validated payload for updating a task. All fields are optional.
 * Providing columnId moves the task to a different column; providing order
 * reorders it within its current (or new) column.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from '@/tasks/dto/create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
