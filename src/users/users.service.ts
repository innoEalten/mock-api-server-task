import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.entity';
import { CreateUserDto } from './models/create-user.dto';
import { UpdateUserDto } from './models/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if email or username already exists if they are part of CreateUserDto and should be unique
    // This check is more robust here than only in AuthService for direct user creations via UsersService
    if (createUserDto.email) {
      const existingByEmail = await this.userRepository.findOneBy({
        email: createUserDto.email,
      });
      if (existingByEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    if (createUserDto.username) {
      const existingByUsername = await this.userRepository.findOneBy({
        username: createUserDto.username,
      });
      if (existingByUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    const newUser: User = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  public async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async findUserById(id: number): Promise<User> {
    const user: User | null = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  public async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Ensure user exists before trying to preload
    const existingUser = await this.findUserById(id);
    // Check for unique constraint violations if email/username are being updated
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const anotherUserWithEmail = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (anotherUserWithEmail && anotherUserWithEmail.id !== id) {
        throw new ConflictException('Email already in use by another account.');
      }
    }
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const anotherUserWithUsername = await this.userRepository.findOneBy({
        username: updateUserDto.username,
      });
      if (anotherUserWithUsername && anotherUserWithUsername.id !== id) {
        throw new ConflictException(
          'Username already in use by another account.',
        );
      }
    }

    const userToUpdate = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });
    // Preload would return undefined if id doesn't exist, but findUserById already checked.
    // if (!userToUpdate) {
    //   throw new NotFoundException(`User with ID "${id}" not found for update`);
    // }
    return this.userRepository.save(userToUpdate!);
  }

  public async removeUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }
}
