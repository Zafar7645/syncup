import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_REGEX_STRING,
  PASSWORD_VALIDATION_MESSAGE,
} from '@shared/validation/password.constants';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX_STRING), {
    message: PASSWORD_VALIDATION_MESSAGE,
  })
  password: string;
}
