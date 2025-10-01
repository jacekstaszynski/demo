import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserFromJWT } from '../../auth/user-data.decorator';
import type { UserData } from '../../auth/user-data.type';
import { UserService } from '../domain/user.service';
import { CreateUserRequest } from './type/user.request';
import { UserResponse } from './type/user.response';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser(@UserFromJWT() userData: UserData): UserData {
    // We dont need to call the service here because we already have done it while authenticating
    return userData;
  }

  @Post()
  async createUser(
    @Body() request: CreateUserRequest,
    @UserFromJWT() userData: UserData,
  ): Promise<UserResponse> {
    // TODO: remove this
    console.log(userData.email);
    const user = await this.userService.createUser({
      name: request.name,
      email: request.email,
    });

    return plainToInstance(UserResponse, user);
  }
}
