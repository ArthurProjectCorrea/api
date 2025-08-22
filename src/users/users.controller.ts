import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IsEmail, IsString, MinLength } from 'class-validator';

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    if (!dto.email || !dto.password || !dto.name) {
      throw new NotFoundException('Dados obrigatórios ausentes');
    }
    return this.usersService.createUser(dto.email, dto.password, dto.name);
  }

  @Get()
  async findAll() {
    return this.usersService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    // Garante que retorna objeto plano sem password
    const plainUser = (
      user.toObject ? user.toObject() : user
    ) as import('./schemas/user.schema').User;
    // Remove o campo password do retorno sem criar variável não usada
    const rest = { ...plainUser };
    delete (rest as { password?: string }).password;
    return rest;
  }
}
