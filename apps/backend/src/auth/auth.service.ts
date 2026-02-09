import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '@shared/dtos/auth/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from '@/users/user.entity';
import { UserResponseDto } from '@shared/dtos/user/user-response.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '@shared/dtos/auth/login-user.dto';
import { AccessTokenDto } from '@shared/dtos/auth/access-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async register(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const { name, email, password } = registerUserDto;
    const raw = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
    let saltRounds = parseInt(raw ?? '', 10);
    if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 15) {
      saltRounds = 10;
    }

    let savedUser: User;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = await bcrypt.hash(password, saltRounds);

      savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      const payload = {
        sub: savedUser.id,
        email: savedUser.email,
      };
      const accessToken = await this.jwtService.signAsync(payload);

      const response: UserResponseDto = {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        access_token: accessToken,
      };

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Check for the unique violation error code from PostgreSQL
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'Unable to complete registration at this time.',
        );
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<AccessTokenDto> {
    const lowerCaseEmail = loginUserDto.email.toLowerCase().trim();
    const user = await this.usersService.findOneByEmail(lowerCaseEmail);

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials.',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException({
        message: 'Invalid credentials.',
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
    };
  }
}
