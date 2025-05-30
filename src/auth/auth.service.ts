import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/models/user.entity';
import { CreateUserDto } from '../users/models/create-user.dto';
import { LoginDto } from './models/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Validates a user based on email and password.
   * @param email User's email
   * @param pass User's plain text password
   * @returns User object without password if validation succeeds, otherwise null.
   */
  public async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Registers a new user.
   * Hashes the password before saving.
   * Checks for existing email or username.
   * @param createUserDto DTO containing user data including plain text password.
   * @returns The newly created user object, excluding the password.
   */
  public async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    if (!createUserDto.password) {
      // This check should ideally be enforced by DTO validation (e.g. @IsNotEmpty() on password in a RegisterUserDto)
      // For now, CreateUserDto has password as optional, so manual check is important here.
      throw new ConflictException('Password is required for registration.');
    }
    // UsersService.createUser now handles email/username conflict checks internally
    // So, no need to call findByEmail/findByUsername here again if UsersService.createUser is robust.
    // However, if UsersService.createUser doesn't throw on conflict, these checks are still useful here.
    // Given UsersService has been updated to check, these specific checks can be removed from here for SRP.
    // const existingUserByEmail = await this.usersService.findByEmail(createUserDto.email);
    // if (existingUserByEmail) {
    //   throw new ConflictException("Email already exists");
    // }
    // const existingUserByUsername = await this.usersService.findByUsername(createUserDto.username);
    // if (existingUserByUsername) {
    //   throw new ConflictException("Username already exists");
    // }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    // UsersService.createUser will handle the creation. It already checks for conflicts.
    const newUser = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword, // Pass the hashed password to createUser
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser;
    return result;
  }

  /**
   * Logs in a user.
   * @param loginDto DTO containing email and plain text password.
   * @returns An access token if login is successful.
   * @throws UnauthorizedException if credentials are invalid.
   */
  public async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials. Please check email and password.',
      );
    }
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
