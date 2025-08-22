import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<Omit<User, 'password'>> {
    const exists = await this.userModel.findOne({ email });
    if (exists) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const created = new this.userModel({ email, password, name });
    const saved = await created.save();
    const obj = saved.toObject();
    delete (obj as { password?: string }).password;
    return obj as Omit<User, 'password'>;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async getAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel.find().lean();
    return users.map((user: { password?: string; [key: string]: any }) => {
      if ('password' in user) {
        delete user.password;
      }
      return user as Omit<User, 'password'>;
    });
  }
}
