import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/users/users.service';
import { Repository } from 'typeorm';
import { User } from '@/users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

const mockUserRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should call the query builder to find a user by email', async () => {
      // Arrange
      const mockEmail = 'test.user@test.com';
      const expectedUser = new User();

      (userRepository.createQueryBuilder().getOne as jest.Mock).mockReturnValue(
        expectedUser,
      );

      // Act
      const user = await service.findOneByEmail(mockEmail);

      // Assert
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email: mockEmail },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(user).toEqual(expectedUser);
    });
  });
});
