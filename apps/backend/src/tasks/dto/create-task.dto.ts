/**
 * @file create-task.dto.ts
 * @description Validated payload for creating a task. The order field is optional —
 * the service auto-assigns the next position in the target column when omitted.
 */
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsInt()
  @IsNotEmpty()
  columnId: number;
}
