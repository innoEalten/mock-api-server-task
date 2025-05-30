import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.entity';
import { CreateUserDto } from './models/create-user.dto';
import { UpdateUserDto } from './models/update-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let mockUserRepository: jest.Mocked<Repository<User>>;

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
    const mockRepositoryMethods = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositoryMethods,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    mockUserRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const inputCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      address: mockUser.address,
      phone: '1-770-736-8031',
      website: 'johndoe.com',
      company: mockUser.company,
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      const actualResult = await usersService.createUser(inputCreateUserDto);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: inputCreateUserDto.email,
      });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: inputCreateUserDto.username,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        inputCreateUserDto,
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(actualResult).toEqual(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);

      // Act & Assert
      await expect(usersService.createUser(inputCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: inputCreateUserDto.email,
      });
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      mockUserRepository.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      // Act & Assert
      await expect(usersService.createUser(inputCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: inputCreateUserDto.username,
      });
    });

    it('should skip email check when email is not provided', async () => {
      // Arrange
      const inputWithoutEmail = { ...inputCreateUserDto, email: undefined };
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      await usersService.createUser(
        inputWithoutEmail as unknown as CreateUserDto,
      );

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: inputCreateUserDto.username,
      });
    });

    it('should skip username check when username is not provided', async () => {
      // Arrange
      const inputWithoutUsername = {
        ...inputCreateUserDto,
        username: undefined,
      };
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Act
      await usersService.createUser(
        inputWithoutUsername as unknown as CreateUserDto,
      );

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: inputCreateUserDto.email,
      });
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      // Arrange
      mockUserRepository.find.mockResolvedValue(mockUsers);

      // Act
      const actualResult = await usersService.findAllUsers();

      // Assert
      expect(mockUserRepository.find).toHaveBeenCalledWith();
      expect(actualResult).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockUserRepository.find.mockResolvedValue([]);

      // Act
      const actualResult = await usersService.findAllUsers();

      // Assert
      expect(mockUserRepository.find).toHaveBeenCalledWith();
      expect(actualResult).toEqual([]);
    });
  });

  describe('findUserById', () => {
    const inputUserId = 1;

    it('should return user when found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const actualResult = await usersService.findUserById(inputUserId);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: inputUserId,
      });
      expect(actualResult).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(usersService.findUserById(inputUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(usersService.findUserById(inputUserId)).rejects.toThrow(
        `User with ID "${inputUserId}" not found`,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: inputUserId,
      });
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
      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);
      mockUserRepository.preload.mockResolvedValue(updatedUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const actualResult = await usersService.updateUser(
        inputUserId,
        inputUpdateUserDto,
      );

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: inputUserId,
      });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: inputUpdateUserDto.email,
      });
      expect(mockUserRepository.preload).toHaveBeenCalledWith({
        id: inputUserId,
        ...inputUpdateUserDto,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(actualResult).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(
        usersService.updateUser(inputUserId, inputUpdateUserDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        usersService.updateUser(inputUserId, inputUpdateUserDto),
      ).rejects.toThrow(`User with ID "${inputUserId}" not found`);
    });

    it('should throw ConflictException when email is already in use by another user', async () => {
      // Arrange
      const anotherUser = { ...mockUser, id: 2 };
      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      mockUserRepository.findOneBy.mockResolvedValueOnce(anotherUser);

      // Act & Assert
      await expect(
        usersService.updateUser(inputUserId, inputUpdateUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when username is already in use by another user', async () => {
      // Arrange
      const inputWithUsername = {
        ...inputUpdateUserDto,
        username: 'newusername',
      };
      const anotherUser = { ...mockUser, id: 2 };
      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);
      mockUserRepository.findOneBy.mockResolvedValueOnce(anotherUser);

      // Act & Assert
      await expect(
        usersService.updateUser(inputUserId, inputWithUsername),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating email to the same value', async () => {
      // Arrange
      const inputSameEmail = { ...inputUpdateUserDto, email: mockUser.email };
      const updatedUser = { ...mockUser, name: inputUpdateUserDto.name! };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockUserRepository.preload.mockResolvedValue(updatedUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const actualResult = await usersService.updateUser(
        inputUserId,
        inputSameEmail,
      );

      // Assert
      expect(actualResult).toEqual(updatedUser);
    });
  });

  describe('removeUser', () => {
    const inputUserId = 1;

    it('should remove user successfully', async () => {
      // Arrange
      mockUserRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      // Act
      await usersService.removeUser(inputUserId);

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(inputUserId);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      // Act & Assert
      await expect(usersService.removeUser(inputUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(usersService.removeUser(inputUserId)).rejects.toThrow(
        `User with ID "${inputUserId}" not found`,
      );
      expect(mockUserRepository.delete).toHaveBeenCalledWith(inputUserId);
    });
  });

  describe('findByEmail', () => {
    const inputEmail = 'john@example.com';

    it('should return user when found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const actualResult = await usersService.findByEmail(inputEmail);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: inputEmail,
      });
      expect(actualResult).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act
      const actualResult = await usersService.findByEmail(inputEmail);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: inputEmail,
      });
      expect(actualResult).toBeNull();
    });
  });

  describe('findByUsername', () => {
    const inputUsername = 'johndoe';

    it('should return user when found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      // Act
      const actualResult = await usersService.findByUsername(inputUsername);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: inputUsername,
      });
      expect(actualResult).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepository.findOneBy.mockResolvedValue(null);

      // Act
      const actualResult = await usersService.findByUsername(inputUsername);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: inputUsername,
      });
      expect(actualResult).toBeNull();
    });
  });
});
