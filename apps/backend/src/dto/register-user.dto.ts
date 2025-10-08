import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8, { message: 'Password must be atleast 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()]).{8,}$/, {
    message:
      'Password is too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;
}
