import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.entity';
import { CreateUserDto } from '../users/models/create-user.dto';
import { LoginDto } from './models/login.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockJwtService: jest.Mocked<JwtService>;

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

  const mockUserWithoutPassword = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    address: mockUser.address,
    phone: '1-770-736-8031',
    website: 'johndoe.com',
    company: mockUser.company,
  };

  beforeEach(async () => {
    const mockUsersServiceMethods = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findByUsername: jest.fn(),
    };

    const mockJwtServiceMethods = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersServiceMethods,
        },
        {
          provide: JwtService,
          useValue: mockJwtServiceMethods,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockUsersService = module.get(UsersService);
    mockJwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const inputEmail = 'john@example.com';
    const inputPassword = 'password123';

    it('should return user without password when credentials are valid', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword,
      );

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        inputPassword,
        mockUser.password,
      );
      expect(actualResult).toEqual(mockUserWithoutPassword);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword,
      );

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail);
      expect(actualResult).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword,
      );

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        inputPassword,
        mockUser.password,
      );
      expect(actualResult).toBeNull();
    });

    it('should return null when user has no password', async () => {
      // Arrange
      const mockUserWithoutPassword = { ...mockUser, password: undefined };
      mockUsersService.findByEmail.mockResolvedValue(mockUserWithoutPassword);

      // Act
      const actualResult = await authService.validateUser(
        inputEmail,
        inputPassword,
      );

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(inputEmail);
      expect(actualResult).toBeNull();
    });
  });

  describe('register', () => {
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

    it('should register a new user successfully', async () => {
      // Arrange
      const hashedPassword = '$2a$10$hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUsersService.createUser.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      // Act
      const actualResult = await authService.register(inputCreateUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(inputCreateUserDto.password, 10);
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...inputCreateUserDto,
        password: hashedPassword,
      });
      expect(actualResult).toEqual(mockUserWithoutPassword);
    });

    it('should throw ConflictException when password is not provided', async () => {
      // Arrange
      const inputWithoutPassword = {
        ...inputCreateUserDto,
        password: undefined,
      };

      // Act & Assert
      await expect(
        authService.register(inputWithoutPassword as CreateUserDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        authService.register(inputWithoutPassword as CreateUserDto),
      ).rejects.toThrow('Password is required for registration.');
    });

    it('should propagate ConflictException from UsersService', async () => {
      // Arrange
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      mockUsersService.createUser.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      // Act & Assert
      await expect(authService.register(inputCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(authService.register(inputCreateUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    const inputLoginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should return access token when credentials are valid', async () => {
      // Arrange
      const expectedToken = 'jwt.token.here';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const actualResult = await authService.login(inputLoginDto);

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        inputLoginDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        inputLoginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(actualResult).toEqual({ accessToken: expectedToken });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        'Invalid credentials. Please check email and password.',
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act & Assert
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        'Invalid credentials. Please check email and password.',
      );
    });

    it('should throw UnauthorizedException when user has no password', async () => {
      // Arrange
      const mockUserWithoutPassword = { ...mockUser, password: undefined };
      mockUsersService.findByEmail.mockResolvedValue(mockUserWithoutPassword);

      // Act & Assert
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(inputLoginDto)).rejects.toThrow(
        'Invalid credentials. Please check email and password.',
      );
    });
  });
});
