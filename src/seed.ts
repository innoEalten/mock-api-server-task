import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './shared/seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('SeedRunner'); // Or use appContext.get(Logger) after configuring it
  const seeder = appContext.get(SeederService);

  try {
    logger.log('Starting database seed process...');
    await seeder.seedAll();
    logger.log('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Database seeding failed.', error.stack);
    process.exitCode = 1; // Indicate failure
  } finally {
    await appContext.close();
    logger.log('Application context closed.');
    // process.exit(process.exitCode); // Exit explicitly if needed after logs
  }
}

bootstrap(); // Removed .catch to let NestFactory handle unhandled rejections or allow logger to report before exit
