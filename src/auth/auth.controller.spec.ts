import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve fazer login com sucesso', async () => {
    (authService.validateUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'a@a.com',
    });
    (authService.login as jest.Mock).mockResolvedValue({
      access_token: 'token',
    });
    const dto = { email: 'a@a.com', password: 'senha' };
    const result = await controller.login(dto);
    expect((authService.validateUser as jest.Mock).mock).toBeDefined();
    (authService.validateUser as jest.Mock).mock.calls.forEach((call) => {
      expect(call).toEqual(['a@a.com', 'senha']);
    });
    expect(result).toEqual({ access_token: 'token' });
  });

  it('deve lançar UnauthorizedException se login inválido', async () => {
    (authService.validateUser as jest.Mock).mockResolvedValue(null);
    const dto = { email: 'a@a.com', password: 'errada' };
    await expect(controller.login(dto)).rejects.toThrow(
      'Credenciais inválidas',
    );
  });

  it('deve registrar usuário', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      email: 'a@a.com',
      name: 'A',
    });
    const dto = { email: 'a@a.com', password: 'senha', name: 'A' };
    const result = await controller.register(dto);
    expect((authService.register as jest.Mock).mock).toBeDefined();
    (authService.register as jest.Mock).mock.calls.forEach((call) => {
      expect(call).toEqual([dto]);
    });
    expect(result).toEqual({ email: 'a@a.com', name: 'A' });
  });

  it('deve retornar dados do usuário autenticado em /me', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue({
      toObject: () => ({ email: 'a@a.com', name: 'A', _id: '1' }),
    });
    const req = { user: { userId: '1' } };
    const result = await controller.me(req);
    expect((usersService.findById as jest.Mock).mock).toBeDefined();
    (usersService.findById as jest.Mock).mock.calls.forEach((call) => {
      expect(call).toEqual(['1']);
    });
    expect(result).toEqual({ email: 'a@a.com', name: 'A', _id: '1' });
  });

  it('deve retornar objeto vazio se usuário não encontrado em /me', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(null);
    const req = { user: { userId: '2' } };
    const result: object = await controller.me(req);
    expect(result).toEqual({});
  });
});
