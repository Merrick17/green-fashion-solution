import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login with valid credentials returns 200 and accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@gfs.com', password: 'admin123' })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.role).toBe('ADMIN');
    accessToken = res.body.accessToken as string;
  });

  it('POST /api/auth/login with wrong password returns 401', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@gfs.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /api/auth/login with unknown email returns 401', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'somepassword' })
      .expect(401);
  });

  it('POST /api/auth/login with missing fields returns 400', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@gfs.com' })
      .expect(400);
  });

  it('GET /api/projects without auth returns 401', () => {
    return request(app.getHttpServer())
      .get('/api/projects')
      .expect(401);
  });

  it('GET /api/projects with valid Bearer token returns 200', async () => {
    // Login first if accessToken not yet set
    if (!accessToken) {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@gfs.com', password: 'admin123' });
      accessToken = loginRes.body.accessToken as string;
    }

    return request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /api/proposals without auth returns 401', () => {
    return request(app.getHttpServer())
      .get('/api/proposals')
      .expect(401);
  });
});
