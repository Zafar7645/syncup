/**
 * @file register-user.dto.ts
 * @description Shared DTO for registration requests. The password field is validated
 * against the shared PASSWORD_REGEX_STRING from libs/shared-validation, ensuring the
 * same rules apply on both the backend (class-validator) and frontend (Reactive Forms).
 */
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_REGEX_STRING,
  PASSWORD_VALIDATION_MESSAGE,
} from '@shared/validation/password.constants';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX_STRING), {
    message: PASSWORD_VALIDATION_MESSAGE,
  })
  password!: string;
}
