import {
  Controller,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Mode } from '@prisma/client';
import { SessionService } from '../domain/session.service';
import { LeaderboardResponse } from './type/session.response';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getLeaderboard(
    @Query('mode', new ParseEnumPipe(Mode)) mode: Mode,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<LeaderboardResponse> {
    const result = await this.sessionService.getLeaderboard({ mode, limit });
    return {
      players: result,
    };
  }
}
