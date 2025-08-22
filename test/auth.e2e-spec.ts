import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth e2e', () => {
  let app: INestApplication;
  let jwt: string;
  // userId removido pois não é utilizado

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve registrar um novo usuário', async () => {
    const uniqueEmail = `e2e_${Date.now()}@teste.com`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: uniqueEmail, password: '123456', name: 'E2E' })
      .expect(201);
    const body = res.body as { email: string };
    expect(body.email).toBe(uniqueEmail);
  });

  it('deve fazer login e retornar token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@teste.com', password: '123456' })
      .expect(201);
    const body = res.body as { access_token: string };
    expect(body.access_token).toBeDefined();
    jwt = body.access_token;
  });

  it('deve retornar dados do usuário autenticado em /me', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/me')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(201);
    const body = res.body as { email: string; name: string };
    expect(body.email).toBe('e2e@teste.com');
    expect(body.name).toBe('E2E');
  });
});
