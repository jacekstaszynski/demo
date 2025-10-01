import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from '../out/session.repository';

@Injectable()
export class SessionOwnershipGuard implements CanActivate {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.params.id;
    const user = request.user;

    if (!sessionId) {
      throw new NotFoundException('Session ID not provided');
    }
    const session = await this.sessionRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== user.id) {
      throw new ForbiddenException('You can only access your own sessions');
    }

    return true;
  }
}
