import { Injectable } from '@nestjs/common';
import { SessionService } from './domain/session.service';
import { SessionRepository } from './out/session.repository';

@Injectable()
export class SessionFacade {
  constructor(
    private readonly sessionService: SessionService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async getSessionById(id: string) {
    return this.sessionRepository.getSessionById(id);
  }

  async findSessionById(id: string) {
    return this.sessionRepository.findSessionById(id);
  }
}
