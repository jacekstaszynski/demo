import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from '../out/user.repository';
import { CreateUserInput } from './type/user.types';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<User> {
    return this.userRepository.create({
      name: input.name,
      email: input.email,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
