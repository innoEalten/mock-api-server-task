import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/models/user.entity';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: '$2a$10$hashedPassword',
    address: {
      street: '123 Main St',
      suite: 'Apt 1',
      city: 'Anytown',
      zipcode: '12345',
      geo: { lat: '40.7128', lng: '-74.0060' },
    },
    phone: '1-770-736-8031',
    website: 'johndoe.com',
    company: {
      name: 'Doe Enterprises',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
  };

  beforeEach(async () => {
    const mockUsersServiceMethods = {
      findUserById: jest.fn(),
    };

    const mockConfigServiceMethods = {
      get: jest.fn().mockReturnValue('test-jwt-secret-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
        {
          provide: ConfigService,
          useValue: mockConfigServiceMethods,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    mockUsersService = module.get(UsersService);
    mockConfigService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const inputPayload: JwtPayload = {
      email: 'john@example.com',
      sub: 1,
    };

    it('should return user when payload is valid and user exists', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockUser);

      // Act
      const actualResult = await jwtStrategy.validate(inputPayload);

      // Assert
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(
        inputPayload.sub,
      );
      expect(actualResult).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(null as any);

      // Act & Assert
      await expect(jwtStrategy.validate(inputPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtStrategy.validate(inputPayload)).rejects.toThrow(
        'Invalid token',
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(
        inputPayload.sub,
      );
    });

    it('should throw UnauthorizedException when UsersService throws error', async () => {
      // Arrange
      mockUsersService.findUserById.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(jwtStrategy.validate(inputPayload)).rejects.toThrow(
        'Database error',
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(
        inputPayload.sub,
      );
    });
  });
});
