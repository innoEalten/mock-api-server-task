import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  //   UseGuards, // Added for potential future use with JWT
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './models/create-user.dto';
import { UpdateUserDto } from './models/update-user.dto';
import { User } from './models/user.entity';
// import { AuthGuard } from '@nestjs/passport'; // Example if you want to protect user routes

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @UseGuards(AuthGuard('jwt')) // Example: Protect user creation
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  public async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  // @UseGuards(AuthGuard('jwt')) // Example: Protect fetching all users
  public async findAllUsers(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  // @UseGuards(AuthGuard('jwt')) // Example: Protect fetching a single user
  public async findUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Patch(':id')
  // @UseGuards(AuthGuard('jwt')) // Example: Protect updating a user
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  public async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard('jwt')) // Example: Protect deleting a user
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.usersService.removeUser(id);
  }

  // Smoke test endpoint
  @Get('admin/test')
  public adminTest(): string {
    return 'Users module is working!';
  }
}
