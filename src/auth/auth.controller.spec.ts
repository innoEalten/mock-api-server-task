import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/models/create-user.dto';
import { LoginDto } from './models/login.dto';
import { User } from '../users/models/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  const mockUser: Omit<User, 'password'> = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
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

  const mockUserWithPassword: User = {
    ...mockUser,
    password: '$2a$10$hashedPassword',
  };

  beforeEach(async () => {
    const mockAuthServiceMethods = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthServiceMethods,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    mockAuthService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      mockAuthService.register.mockResolvedValue(mockUser);

      // Act
      const actualResult = await authController.register(inputCreateUserDto);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(inputCreateUserDto);
      expect(actualResult).toEqual(mockUser);
    });

    it('should propagate errors from AuthService', async () => {
      // Arrange
      const mockError = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(mockError);

      // Act & Assert
      await expect(authController.register(inputCreateUserDto)).rejects.toThrow(
        'Registration failed',
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(inputCreateUserDto);
    });
  });

  describe('login', () => {
    const inputLoginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      // Arrange
      const expectedTokenResponse = { accessToken: 'jwt.token.here' };
      mockAuthService.login.mockResolvedValue(expectedTokenResponse);

      // Act
      const actualResult = await authController.login(inputLoginDto);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(inputLoginDto);
      expect(actualResult).toEqual(expectedTokenResponse);
    });

    it('should propagate errors from AuthService', async () => {
      // Arrange
      const mockError = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(mockError);

      // Act & Assert
      await expect(authController.login(inputLoginDto)).rejects.toThrow(
        'Login failed',
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(inputLoginDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', () => {
      // Arrange
      const mockRequest = {
        user: mockUserWithPassword,
      } as any;

      // Act
      const actualResult = authController.getProfile(mockRequest);

      // Assert
      expect(actualResult).toEqual(mockUser);
      expect(actualResult).not.toHaveProperty('password');
    });

    it('should handle user with no password field', () => {
      // Arrange
      const mockRequest = {
        user: mockUser,
      } as any;

      // Act
      const actualResult = authController.getProfile(mockRequest);

      // Assert
      expect(actualResult).toEqual(mockUser);
    });
  });

  describe('adminTest', () => {
    it('should return auth module working message', () => {
      // Act
      const actualResult = authController.adminTest();

      // Assert
      expect(actualResult).toBe('Auth module is working!');
    });
  });
});
