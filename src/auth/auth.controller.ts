import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Request,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './models/login.dto';
import { CreateUserDto } from '../users/models/create-user.dto'; // For registration
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/models/user.entity'; // Assuming User entity is needed for return types

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: CreateUserDto,
    // Consider a specific DTO for registration if it differs significantly from CreateUserDto for general user creation
  ): Promise<Omit<User, 'password'>> {
    // Return type typically doesn't include hashedPassword alias
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }

  // Example of a protected route
  @UseGuards(AuthGuard('jwt')) // Use the 'jwt' strategy from passport
  @Get('profile')
  getProfile(@Request() req): Omit<User, 'password'> {
    // req.user will be the User entity instance from JwtStrategy
    // req.user is populated by the JwtStrategy
    // The password field is already excluded by the User entity's `@Column({ select: false })` decorator
    // or should be manually excluded if not.
    // Forcing Omit<User, 'password'> is a good practice for explicit contract.
    const { password, ...userWithoutPassword } = req.user; // req.user is User, so password exists here
    return userWithoutPassword; // Ensure this matches Omit<User, 'password'>
  }

  // Smoke test endpoint
  @Get('admin/test')
  public adminTest(): string {
    return 'Auth module is working!';
  }
}
