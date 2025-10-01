import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from './user-data.type';

export const UserFromJWT = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserData => {
    const request = context.switchToHttp().getRequest();

    return { ...request.user };
  },
);
