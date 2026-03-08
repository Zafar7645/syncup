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
