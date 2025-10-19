import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import { UserResponseDto } from '@/users/user-response.dto';

const mockAuthService = {
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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
    authService = module.get<AuthService>(AuthService);

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
      (authService.register as jest.Mock).mockResolvedValue(
        mockUserResponseDto,
      );

      // Act
      const actualUserResponseDto =
        await controller.register(mockRegisterUserDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockRegisterUserDto);
      expect(actualUserResponseDto).toEqual(mockUserResponseDto);
    });
  });
});
