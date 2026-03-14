import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsNumber()
  @IsNotEmpty()
  columnId: number;
}
