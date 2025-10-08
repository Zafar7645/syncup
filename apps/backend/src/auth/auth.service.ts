import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from 'src/dto/register-user.dto';

@Injectable()
export class AuthService {
  register(registerUserDto: RegisterUserDto) {
    const { name, email } = registerUserDto;
    return {
      message: 'User registered successfully!',
      user: {
        name: name,
        email: email,
      },
    };
  }
}
