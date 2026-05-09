/**
 * @file create-project.dto.ts
 * @description Validated payload for creating a new project.
 * The name field rejects whitespace-only strings via the Matches validator.
 */
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'name must contain non-whitespace characters' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
