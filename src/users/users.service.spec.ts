import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ConflictException } from '@nestjs/common';

import type { Model } from 'mongoose';
import type { UserDocument } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel: Partial<Record<keyof Model<UserDocument>, jest.Mock>> = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve cadastrar usuário novo', async () => {
    mockUserModel.findOne!.mockResolvedValue(null);
    const mockSave = jest.fn().mockResolvedValue({
      toObject: () => ({ _id: '1', email: 'a@a.com', name: 'A' }),
    });
    // O create do mongoose retorna uma instância, não uma Promise
    // Mocka o model como função construtora para suportar 'new this.userModel(...)'
    service['userModel'] = function () {
      return { save: mockSave };
    } as unknown as Model<UserDocument>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (service['userModel'] as any).findOne = mockUserModel.findOne;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (service['userModel'] as any).findById = mockUserModel.findById;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (service['userModel'] as any).find = mockUserModel.find;
    const result = await service.createUser('a@a.com', 'senha', 'A');
    expect(result.email).toBe('a@a.com');
    // Não existe mais o campo password no retorno (omitido pelo service)
    expect(Object.prototype.hasOwnProperty.call(result, 'password')).toBe(
      false,
    );
  });

  it('não deve cadastrar usuário com e-mail duplicado', async () => {
    mockUserModel.findOne!.mockResolvedValue({ email: 'a@a.com' });
    await expect(service.createUser('a@a.com', 'senha', 'A')).rejects.toThrow(
      ConflictException,
    );
  });

  it('deve buscar usuário por e-mail', async () => {
    mockUserModel.findOne!.mockResolvedValue({ email: 'b@b.com' });
    const user = await service.findByEmail('b@b.com');
    expect(user).not.toBeNull();
    if (user) expect(user.email).toBe('b@b.com');
  });

  it('deve buscar usuário por id', async () => {
    mockUserModel.findById!.mockResolvedValue({ _id: '1', email: 'c@c.com' });
    const user = await service.findById('1');
    expect(user).not.toBeNull();
    if (user) expect(user._id).toBe('1');
  });

  it('deve listar todos os usuários sem senha', async () => {
    mockUserModel.find!.mockReturnValue({
      lean: () => [{ email: 'a@a.com', name: 'A' }],
    });
    const users = await service.getAll();
    expect(Object.prototype.hasOwnProperty.call(users[0], 'password')).toBe(
      false,
    );
    expect(users[0].email).toBe('a@a.com');
  });
});
