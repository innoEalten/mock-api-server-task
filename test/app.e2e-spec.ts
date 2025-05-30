import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Smoke Tests', () => {
    it('/auth/admin/test (GET) should return auth module working message', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin/test')
        .expect(200);

      expect(response.text).toBe('Auth module is working!');
    });

    it('/users/admin/test (GET) should return users module working message', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/admin/test')
        .expect(200);

      expect(response.text).toBe('Users module is working!');
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer()).get('/non-existent-route').expect(404);
    });
  });
});
