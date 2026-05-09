/**
 * @file update-project.dto.ts
 * @description Validated payload for updating a project. All fields from
 * CreateProjectDto are made optional via PartialType, so partial updates are supported.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from '@/projects/dto/create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
