import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from 'src/users/user-response.dto';

const mockAuthService = {
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call the register method of the Auth Service', async () => {
      // Arrange
      const mockRegisterUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'StrongPassword@123',
      };
      const mockUserResponseDto: UserResponseDto = {
        id: 1,
        name: 'Test User',
        email: 'test.user@test.com',
      };
      mockAuthService.register.mockResolvedValue(mockUserResponseDto);

      // Act
      const actualUserResponseDto =
        await controller.register(mockRegisterUserDto);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(
        mockRegisterUserDto,
      );
      expect(actualUserResponseDto).toEqual(mockUserResponseDto);
    });
  });
});
