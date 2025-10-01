import { Module } from '@nestjs/common';
import { SessionService } from './domain/session.service';
import { LeaderboardController } from './in/leader-board.controller';
import { SessionController } from './in/session.controller';
import { SessionRepository } from './out/session.repository';
import { SessionFacade } from './session.facade';

@Module({
  controllers: [SessionController, LeaderboardController],
  providers: [SessionService, SessionRepository, SessionFacade],
  exports: [SessionFacade],
})
export class SessionModule {}
