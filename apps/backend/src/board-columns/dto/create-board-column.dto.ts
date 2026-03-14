import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBoardColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
