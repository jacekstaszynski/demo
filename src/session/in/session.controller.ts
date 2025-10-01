import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Mode } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserFromJWT } from '../../auth/user-data.decorator';
import type { UserData } from '../../auth/user-data.type';
import { SessionService } from '../domain/session.service';
import {
  SessionEventRequest,
  StartSessionRequest,
} from './type/session.request';
import {
  FinishSessionResponseDto,
  LeaderboardEntryDto,
  SessionDetailsResponseDto,
  SessionEventResponseDto,
  StartSessionResponseDto,
} from './type/session.response';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async startSession(
    @Body() request: StartSessionRequest,
    @UserFromJWT() userData: UserData,
  ): Promise<StartSessionResponseDto> {
    return this.sessionService.startSession(userData.email, {
      mode: request.mode,
    });
  }

  @Post(':id/events')
  async addEvent(
    @Param('id') sessionId: string,
    @Body() request: SessionEventRequest,
    @UserFromJWT() userData: UserData,
  ): Promise<SessionEventResponseDto> {
    return this.sessionService.addEvent(sessionId, userData.email, request);
  }

  @Post(':id/finish')
  async finishSession(
    @Param('id') sessionId: string,
    @UserFromJWT() userData: UserData,
  ): Promise<FinishSessionResponseDto> {
    return this.sessionService.finishSession(sessionId, userData.email);
  }

  @Get(':id')
  async getSessionDetails(
    @Param('id') sessionId: string,
    @UserFromJWT() userData: UserData,
  ): Promise<SessionDetailsResponseDto> {
    return this.sessionService.getSessionDetails(sessionId, userData.email);
  }
}

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getLeaderboard(
    @Query('mode', new ParseEnumPipe(Mode)) mode: Mode,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<LeaderboardEntryDto[]> {
    return this.sessionService.getLeaderboard({ mode, limit });
  }
}
