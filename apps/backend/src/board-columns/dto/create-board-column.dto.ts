/**
 * @file create-board-column.dto.ts
 * @description Validated payload for creating a board column. The order field is
 * optional — if omitted, the service assigns the next available position automatically.
 */
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateBoardColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsInt()
  @IsNotEmpty()
  projectId: number;
}
