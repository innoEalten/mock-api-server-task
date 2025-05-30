import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './models/create-user.dto';
import { UpdateUserDto } from './models/update-user.dto';
import { User } from './models/user.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;

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

  const mockUsers: User[] = [
    mockUser,
    {
      ...mockUser,
      id: 2,
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
    },
  ];

  beforeEach(async () => {
    const mockUsersServiceMethods = {
      createUser: jest.fn(),
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUser: jest.fn(),
      removeUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    mockUsersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const inputCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      address: mockUser.address,
      phone: '1-770-736-8031',
      website: 'johndoe.com',
      company: mockUser.company,
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockUsersService.createUser.mockResolvedValue(mockUser);

      // Act
      const actualResult = await usersController.createUser(inputCreateUserDto);

      // Assert
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        inputCreateUserDto,
      );
      expect(actualResult).toEqual(mockUser);
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const mockError = new Error('User creation failed');
      mockUsersService.createUser.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        usersController.createUser(inputCreateUserDto),
      ).rejects.toThrow('User creation failed');
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        inputCreateUserDto,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue(mockUsers);

      // Act
      const actualResult = await usersController.findAllUsers();

      // Assert
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith();
      expect(actualResult).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockUsersService.findAllUsers.mockResolvedValue([]);

      // Act
      const actualResult = await usersController.findAllUsers();

      // Assert
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith();
      expect(actualResult).toEqual([]);
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockUsersService.findAllUsers.mockRejectedValue(mockError);

      // Act & Assert
      await expect(usersController.findAllUsers()).rejects.toThrow(
        'Database error',
      );
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith();
    });
  });

  describe('findUserById', () => {
    const inputUserId = 1;

    it('should return user when found', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockUser);

      // Act
      const actualResult = await usersController.findUserById(inputUserId);

      // Assert
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(inputUserId);
      expect(actualResult).toEqual(mockUser);
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const mockError = new Error('User not found');
      mockUsersService.findUserById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(usersController.findUserById(inputUserId)).rejects.toThrow(
        'User not found',
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(inputUserId);
    });
  });

  describe('updateUser', () => {
    const inputUserId = 1;
    const inputUpdateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...inputUpdateUserDto };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      // Act
      const actualResult = await usersController.updateUser(
        inputUserId,
        inputUpdateUserDto,
      );

      // Assert
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        inputUserId,
        inputUpdateUserDto,
      );
      expect(actualResult).toEqual(updatedUser);
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const mockError = new Error('Update failed');
      mockUsersService.updateUser.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        usersController.updateUser(inputUserId, inputUpdateUserDto),
      ).rejects.toThrow('Update failed');
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(
        inputUserId,
        inputUpdateUserDto,
      );
    });
  });

  describe('removeUser', () => {
    const inputUserId = 1;

    it('should remove user successfully', async () => {
      // Arrange
      mockUsersService.removeUser.mockResolvedValue(undefined);

      // Act
      const actualResult = await usersController.removeUser(inputUserId);

      // Assert
      expect(mockUsersService.removeUser).toHaveBeenCalledWith(inputUserId);
      expect(actualResult).toBeUndefined();
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      const mockError = new Error('Deletion failed');
      mockUsersService.removeUser.mockRejectedValue(mockError);

      // Act & Assert
      await expect(usersController.removeUser(inputUserId)).rejects.toThrow(
        'Deletion failed',
      );
      expect(mockUsersService.removeUser).toHaveBeenCalledWith(inputUserId);
    });
  });

  describe('adminTest', () => {
    it('should return users module working message', () => {
      // Act
      const actualResult = usersController.adminTest();

      // Assert
      expect(actualResult).toBe('Users module is working!');
    });
  });
});
