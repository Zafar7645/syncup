import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import { AuthService } from '@/auth/auth.service';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: { userId: number; email: string } }) {
    return req.user;
  }
}
