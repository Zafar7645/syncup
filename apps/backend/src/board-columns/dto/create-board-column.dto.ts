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
