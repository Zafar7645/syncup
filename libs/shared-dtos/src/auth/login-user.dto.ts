/**
 * @file login-user.dto.ts
 * @description Shared DTO for login requests. Used by the backend ValidationPipe
 * and mirrored by the frontend login form's reactive form validators.
 */
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  password!: string;
}
