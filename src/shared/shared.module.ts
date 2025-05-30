import { Module, Global } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Global() // Optional: if you want SeederService to be available globally without importing SharedModule
@Module({
  imports: [
    UsersModule, // Add UsersModule to imports to make UsersService available
    AuthModule, // Add AuthModule to imports to make AuthService available
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SharedModule {}
