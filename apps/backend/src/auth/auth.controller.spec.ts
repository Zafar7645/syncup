import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import { UserResponseDto } from '@/users/user-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessTokenDto } from './dto/access-token.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
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

    it('should propagate ConflictException from the Auth Service', async () => {
      // Arrange
      const mockRegisterUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'StrongPassword@123',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new ConflictException('Unable to complete registration at this time.'),
      );

      // Act & Assert
      await expect(controller.register(mockRegisterUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.register(mockRegisterUserDto)).rejects.toThrow(
        'Unable to complete registration at this time.',
      );
    });

    it('should propagate any general error from the Auth Service', async () => {
      // Arrange
      const mockRegisterUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'StrongPassword@123',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new Error('Something went wrong.'),
      );

      // Act & Assert
      await expect(controller.register(mockRegisterUserDto)).rejects.toThrow(
        'Something went wrong.',
      );
    });
  });

  describe('login', () => {
    it('should call the login method of the Auth Service', async () => {
      // Arrange
      const mockLoginUserDto: LoginUserDto = {
        email: 'test.user@test.com',
        password: 'PlainTextPassword',
      };
      const expectedResponse: AccessTokenDto = {
        access_token: 'SomeReallyLongAccessTokenText',
      };

      (authService.login as jest.Mock).mockResolvedValue(expectedResponse);

      // Act
      const actualResponse = await controller.login(mockLoginUserDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginUserDto);
      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should propagate UnauthorizedException from the Auth Service', async () => {
      // Arrange
      const mockLoginUserDto: LoginUserDto = {
        email: 'test.user@test.com',
        password: 'PlainTextPassword',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials.'),
      );

      // Act & Assert
      await expect(controller.login(mockLoginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(mockLoginUserDto)).rejects.toThrow(
        'Invalid credentials.',
      );
    });
  });
});
