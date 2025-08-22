interface UserLike {
  email: string;
  _id?: string;
  id?: string;
  role?: string;
  password?: string;
  toObject?: () => UserLike;
}
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { bcryptWrapper } from './bcrypt-wrapper';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserLike | null> {
    const user = (await this.usersService.findByEmail(
      email,
    )) as UserLike | null;
    if (user && (await bcryptWrapper.compare(password, user.password ?? ''))) {
      return user;
    }
    return null;
  }

  login(user: UserLike) {
    const doc: UserLike =
      user && typeof user.toObject === 'function' ? user.toObject() : user;
    const payload = {
      email: doc.email,
      sub: doc._id ? String(doc._id) : doc.id ? String(doc.id) : undefined,
      role: doc.role || 'user',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: { email: string; password: string; name: string }) {
    const hash = await bcryptWrapper.hash(dto.password, 10);
    return this.usersService.createUser(dto.email, hash, dto.name);
  }
}
