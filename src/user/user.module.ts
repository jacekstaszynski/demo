import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserService } from './domain/user.service';
import { UserController } from './in/user.controller';
import { UserRepository } from './out/user.repository';
import { UserFacade } from './user.facade';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserFacade, UserRepository],
  exports: [UserFacade],
})
export class UserModule {}
