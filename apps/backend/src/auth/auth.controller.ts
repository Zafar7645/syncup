import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import { AuthService } from '@/auth/auth.service';
import { UserResponseDto } from '@/users/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.authService.register(registerUserDto);
  }
}
