import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { AuthService } from '@/auth/auth.service';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<AccessTokenDto> {
    return this.authService.login(loginUserDto);
  }
}
