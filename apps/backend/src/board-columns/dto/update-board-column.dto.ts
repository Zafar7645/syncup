import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBoardColumnDto } from '@/board-columns/dto/create-board-column.dto';

export class UpdateBoardColumnDto extends PartialType(
  OmitType(CreateBoardColumnDto, ['projectId'] as const),
) {}
