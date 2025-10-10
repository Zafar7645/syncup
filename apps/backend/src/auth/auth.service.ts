import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;
    const saltRounds = 10;
    await bcrypt.hash(password, saltRounds);
    return {
      message: 'User registered successfully!',
      user: {
        name: name,
        email: email,
      },
    };
  }
}
