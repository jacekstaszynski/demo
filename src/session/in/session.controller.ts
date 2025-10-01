import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserFromJWT } from '../../auth/user-data.decorator';
import type { UserData } from '../../auth/user-data.type';
import { SessionService } from '../domain/session.service';

import { Mode } from '@prisma/client';
import {
  SessionEventRequest,
  StartSessionRequest,
} from './type/session.request';
import {
  FinishSessionResponse,
  SessionDetailsResponse,
  SessionEventResponse,
  StartSessionResponse,
} from './type/session.response';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async startSession(
    @Body() request: StartSessionRequest,
    @UserFromJWT() userData: UserData,
  ): Promise<StartSessionResponse> {
    if (!Object.values(Mode).includes(request.mode)) {
      throw new BadRequestException('Invalid mode');
    }
    const response = await this.sessionService.startSession(userData.id, {
      mode: request.mode,
    });

    // plainToInstance - NOT needed here just for demo purposes to show how it should look like in real life app.
    return plainToInstance(StartSessionResponse, response);
  }
  @Post(':id/finish')
  async finishSession(
    @Param('id') sessionId: string,
  ): Promise<FinishSessionResponse> {
    const result = await this.sessionService.finishSession(sessionId);
    return plainToInstance(FinishSessionResponse, result);
  }

  @Post(':id/events')
  async addEvent(
    @Param('id') sessionId: string,
    @Body() request: SessionEventRequest,
  ): Promise<SessionEventResponse> {
    const result = await this.sessionService.addEvent(sessionId, request);
    return plainToInstance(SessionEventResponse, result);
  }

  @Get(':id')
  async getSessionDetails(
    @Param('id') sessionId: string,
  ): Promise<SessionDetailsResponse> {
    const result = await this.sessionService.getSessionDetails(sessionId);
    return plainToInstance(SessionDetailsResponse, result);
  }
}
