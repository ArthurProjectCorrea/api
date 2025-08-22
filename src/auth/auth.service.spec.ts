import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve validar usuário com senha correta', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      password: 'hash',
      email: 'a@a.com',
      _id: '1',
      role: 'user',
      toObject: () => ({
        password: 'hash',
        email: 'a@a.com',
        _id: '1',
        role: 'user',
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (bcrypt.compare as jest.Mock).mockImplementation(function (
      a: string,
      b: string,
    ) {
      return a === 'senha' && b === 'hash';
    });
    const user = await service.validateUser('a@a.com', 'senha');
    expect(user && user.email).toBe('a@a.com');
  });

  it('não deve validar usuário com senha errada', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      password: 'hash',
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (bcrypt.compare as jest.Mock).mockImplementation(() => {
      return false;
    });
    const user = await service.validateUser('a@a.com', 'errada');
    expect(user).toBeNull();
  });

  it('deve gerar token no login', () => {
    const user = {
      email: 'a@a.com',
      _id: '1',
      role: 'user',
      toObject: () => ({ email: 'a@a.com', _id: '1', role: 'user' }),
    };
    const result = service.login(user);
    expect((jwtService.sign as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    expect(result.access_token).toBe('token');
  });

  it('deve registrar usuário', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    (usersService.createUser as jest.Mock).mockResolvedValue({
      email: 'a@a.com',
      name: 'A',
    });
    const result = await service.register({
      email: 'a@a.com',
      password: 'senha',
      name: 'A',
    });
    expect(result.email).toBe('a@a.com');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((bcrypt.hash as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    expect(
      (usersService.createUser as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(0);
  });
});
