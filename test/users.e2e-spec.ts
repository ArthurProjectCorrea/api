import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface UserResponse {
  _id?: string;
  id?: string;
  email: string;
  name: string;
}
describe('Users e2e', () => {
  let app: INestApplication;
  let jwt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Cria usuário e obtém token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user2@teste.com', password: '123456', name: 'User2' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const login = await request(app.getHttpServer())
      .post('/auth/login')

      .send({ email: 'user2@teste.com', password: '123456' });

    jwt = (login.body as { access_token: string }).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve listar todos os usuários', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get('/users')

      .set('Authorization', `Bearer ${jwt}`)

      .expect(200);

    const users = res.body as UserResponse[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.some((u) => u.email === 'user2@teste.com')).toBe(true);
  });

  it('deve buscar usuário por id', async () => {
    // Busca o id do usuário criado
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const resList = await request(app.getHttpServer())
      .get('/users')

      .set('Authorization', `Bearer ${jwt}`);

    const users = resList.body as UserResponse[];
    const user = users.find((u) => u.email === 'user2@teste.com');
    expect(user).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .get(`/users/${user?._id || user?.id}`)

      .set('Authorization', `Bearer ${jwt}`)

      .expect(200);

    const userById = res.body as UserResponse;
    expect(userById.email).toBe('user2@teste.com');
    expect(userById.name).toBe('User2');
  });
});
