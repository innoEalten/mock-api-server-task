import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../users/models/user.entity';

describe('SeederService', () => {
  let seederService: SeederService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockLogger: jest.Mocked<Logger>;

  const mockUser: User = {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    password: '$2a$10$hashedPassword',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' },
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
  };

  beforeEach(async () => {
    const mockUsersServiceMethods = {
      findAllUsers: jest.fn(),
    };

    const mockAuthServiceMethods = {
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
        {
          provide: AuthService,
          useValue: mockAuthServiceMethods,
        },
      ],
    }).compile();

    seederService = module.get<SeederService>(SeederService);
    mockUsersService = module.get(UsersService);
    mockAuthService = module.get(AuthService);

    // Mock the logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    // Replace the logger instance
    (seederService as any).logger = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seedUsers', () => {
    it('should skip seeding when users already exist', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue([mockUser]);

      // Act
      await seederService.seedUsers();

      // Assert
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith();
      expect(mockLogger.log).toHaveBeenCalledWith('Starting to seed users...');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Users table already seeded. Skipping.',
      );
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should seed users when no users exist', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue([]);
      mockAuthService.register.mockResolvedValue(mockUser);

      // Act
      await seederService.seedUsers();

      // Assert
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith();
      expect(mockLogger.log).toHaveBeenCalledWith('Starting to seed users...');
      expect(mockAuthService.register).toHaveBeenCalledTimes(10); // 10 initial users
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Successfully seeded user: Bret',
      );
      expect(mockLogger.log).toHaveBeenCalledWith('User seeding finished.');
    });

    it('should handle errors during user seeding', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue([]);
      const mockError = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(mockError);

      // Act
      await seederService.seedUsers();

      // Assert
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith();
      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to seed user Bret: Registration failed',
        mockError.stack,
      );
      expect(mockLogger.log).toHaveBeenCalledWith('User seeding finished.');
    });

    it('should create users with correct password', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue([]);
      mockAuthService.register.mockResolvedValue(mockUser);

      // Act
      await seederService.seedUsers();

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Leanne Graham',
          username: 'Bret',
          email: 'Sincere@april.biz',
          password: 'Password123!',
        }),
      );
    });
  });

  describe('seedAll', () => {
    it('should call seedUsers and log completion', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue([mockUser]);
      const seedUsersSpy = jest.spyOn(seederService, 'seedUsers');

      // Act
      await seederService.seedAll();

      // Assert
      expect(seedUsersSpy).toHaveBeenCalledWith();
      expect(mockLogger.log).toHaveBeenCalledWith('All data seeding finished.');
    });

    it('should handle errors from seedUsers', async () => {
      // Arrange
      const mockError = new Error('Seeding failed');
      jest.spyOn(seederService, 'seedUsers').mockRejectedValue(mockError);

      // Act & Assert
      await expect(seederService.seedAll()).rejects.toThrow('Seeding failed');
    });
  });
});
