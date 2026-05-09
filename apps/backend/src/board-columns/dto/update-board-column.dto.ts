/**
 * @file update-board-column.dto.ts
 * @description Validated payload for updating a board column. Extends CreateBoardColumnDto
 * with all fields optional, but omits projectId — a column cannot be moved to a
 * different project after creation.
 */
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBoardColumnDto } from '@/board-columns/dto/create-board-column.dto';

export class UpdateBoardColumnDto extends PartialType(
  OmitType(CreateBoardColumnDto, ['projectId'] as const),
) {}
