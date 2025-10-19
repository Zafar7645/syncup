import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '@/users/user.entity';
import { UserResponseDto } from '@/users/user-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}
  async register(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const { name, email, password } = registerUserDto;
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);

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

      const response: UserResponseDto = {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
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
}
