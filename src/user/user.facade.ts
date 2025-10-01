import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserInput } from './domain/type/user.types';
import { UserService } from './domain/user.service';

@Injectable()
export class UserFacade {
  constructor(private readonly userService: UserService) {}

  async createUser(input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userService.findUserByEmail(email);
  }
}
