import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/models/user.entity';

/**
 * Creates a test application instance with in-memory SQLite database
 * for integration testing.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [User],
        synchronize: true,
        dropSchema: true,
      }),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Mock user data for testing purposes
 */
export const mockUserData = {
  basic: {
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    address: {
      street: '123 Test St',
      suite: 'Apt 1',
      city: 'Test City',
      zipcode: '12345',
      geo: { lat: '40.7128', lng: '-74.0060' },
    },
    phone: '1-555-123-4567',
    website: 'test.com',
    company: {
      name: 'Test Company',
      catchPhrase: 'Testing is everything',
      bs: 'test all the things',
    },
  },

  alternative: {
    name: 'Alternative User',
    username: 'altuser',
    email: 'alt@example.com',
    password: 'Password123!',
    address: {
      street: '456 Alt St',
      suite: 'Apt 2',
      city: 'Alt City',
      zipcode: '67890',
      geo: { lat: '41.8781', lng: '-87.6298' },
    },
    phone: '1-555-987-6543',
    website: 'alt.com',
    company: {
      name: 'Alt Company',
      catchPhrase: 'Alternative solutions',
      bs: 'alt all the things',
    },
  },
};

/**
 * Common test expectations for user objects
 */
export const expectUserObject = (user: any, expectedData: any) => {
  expect(user).toMatchObject({
    id: expect.any(Number),
    name: expectedData.name,
    username: expectedData.username,
    email: expectedData.email,
    address: expectedData.address,
    phone: expectedData.phone,
    website: expectedData.website,
    company: expectedData.company,
  });
  expect(user).not.toHaveProperty('password');
};

/**
 * Helper to create a user via API and return the response
 */
export const createUserViaApi = async (
  app: INestApplication,
  userData: any,
) => {
  const request = await import('supertest');
  return request
    .default(app.getHttpServer())
    .post('/users')
    .send(userData)
    .expect(201);
};

/**
 * Helper to register a user via auth API and return the response
 */
export const registerUserViaApi = async (
  app: INestApplication,
  userData: any,
) => {
  const request = await import('supertest');
  return request
    .default(app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);
};

/**
 * Helper to login and get access token
 */
export const loginAndGetToken = async (
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> => {
  const request = await import('supertest');
  const response = await request
    .default(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  return response.body.accessToken;
};
