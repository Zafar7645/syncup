import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { DataSource } from 'typeorm';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import { User } from '@/users/user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  manager: {
    save: jest.fn(),
  },
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let dataSource: DataSource;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should save the user in database when user is valid', async () => {
      // Arrange
      const testUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'StrongPassword@123',
      };
      const configuredSaltRounds = '12';
      const expectedSaltRounds = 12;
      const hashedPassword = 'hashed_password';

      const savedUser = new User();
      savedUser.id = 1;
      savedUser.name = testUserDto.name;
      savedUser.email = testUserDto.email;
      savedUser.password = hashedPassword;

      (configService.get as jest.Mock).mockReturnValue(configuredSaltRounds);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        dataSource.createQueryRunner().manager.save as jest.Mock
      ).mockResolvedValue(savedUser);

      // Act
      const actualResponse = await service.register(testUserDto);

      // Assert
      // Verify the transaction lifecycle
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().startTransaction,
      ).toHaveBeenCalled();

      // Verify the business logic
      expect(bcrypt.hash).toHaveBeenCalledWith(
        testUserDto.password,
        expectedSaltRounds,
      );
      expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: testUserDto.name,
          email: testUserDto.email,
          password: hashedPassword,
        }),
      );

      // Verify the transaction was committed and not rolled back
      expect(
        dataSource.createQueryRunner().commitTransaction,
      ).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().rollbackTransaction,
      ).not.toHaveBeenCalled();
      expect(dataSource.createQueryRunner().release).toHaveBeenCalled();

      // Verify the final output
      expect(actualResponse).toEqual({
        id: 1,
        name: testUserDto.name,
        email: testUserDto.email,
      });
    });

    it('should throw a ConflictException when an email already exists', async () => {
      // Arrange
      const testUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'StrongPassword@123',
      };
      const configuredSaltRounds = '2';
      const expectedSaltRounds = 10;
      const hashedPassword = 'hashed_password';
      const duplicateEmailError = {
        code: '23505',
      };

      (configService.get as jest.Mock).mockReturnValue(configuredSaltRounds);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        dataSource.createQueryRunner().manager.save as jest.Mock
      ).mockRejectedValue(duplicateEmailError);

      // Act & Assert
      await expect(service.register(testUserDto)).rejects.toBeInstanceOf(
        ConflictException,
      );

      // Verify transaction is handled correctly
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().startTransaction,
      ).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(
        testUserDto.password,
        expectedSaltRounds,
      );
      expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: testUserDto.name,
          email: testUserDto.email,
          password: hashedPassword,
        }),
      );
      expect(
        dataSource.createQueryRunner().commitTransaction,
      ).not.toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().rollbackTransaction,
      ).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
    });

    it('should rollback a transaction when any generic error occurs', async () => {
      // Arrange
      const testUserDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'StrongPassword@123',
      };
      const configuredSaltRounds = '17';
      const expectedSaltRounds = 10;
      const hashedPassword = 'hashed_password';
      const error = new Error('Database connection lost.');

      (configService.get as jest.Mock).mockReturnValue(configuredSaltRounds);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        dataSource.createQueryRunner().manager.save as jest.Mock
      ).mockRejectedValue(error);

      // Act & Assert
      await expect(service.register(testUserDto)).rejects.toThrow(error);

      // Verify transaction is handled correctly
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().startTransaction,
      ).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(
        testUserDto.password,
        expectedSaltRounds,
      );
      expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: testUserDto.name,
          email: testUserDto.email,
          password: hashedPassword,
        }),
      );
      expect(
        dataSource.createQueryRunner().commitTransaction,
      ).not.toHaveBeenCalled();
      expect(
        dataSource.createQueryRunner().rollbackTransaction,
      ).toHaveBeenCalled();
      expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
    });
  });

  it('should set the default value for saltRounds when invalid', async () => {
    // Arrange
    const testUserDto: RegisterUserDto = {
      name: 'Test User',
      email: 'test.user@test.com',
      password: 'StrongPassword@123',
    };
    const configuredSaltRounds = '';
    const expectedSaltRounds = 10;
    const hashedPassword = 'hashed_password';

    const savedUser = new User();
    savedUser.id = 1;
    savedUser.name = testUserDto.name;
    savedUser.email = testUserDto.email;
    savedUser.password = hashedPassword;

    (configService.get as jest.Mock).mockReturnValue(configuredSaltRounds);
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    (
      dataSource.createQueryRunner().manager.save as jest.Mock
    ).mockResolvedValue(savedUser);

    // Act
    await service.register(testUserDto);

    // Assert
    expect(bcrypt.hash).toHaveBeenCalledWith(
      testUserDto.password,
      expectedSaltRounds,
    );
  });
});
