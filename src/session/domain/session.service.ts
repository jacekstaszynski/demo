import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { SessionRepository } from '../out/session.repository';
import {
  FinishSessionResponse,
  LeaderboardEntry,
  LeaderboardQuery,
  SessionDetailsResponse,
  SessionEventRequest,
  SessionEventResponse,
  StartSessionRequest,
  StartSessionResponse,
} from './type/session.types.ts';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async startSession(
    userId: string,
    request: StartSessionRequest,
  ): Promise<StartSessionResponse> {
    // Check if user has an active session
    const activeSession =
      await this.sessionRepository.getUserActiveSession(userId);
    if (activeSession) {
      throw new BadRequestException('User already has an active session');
    }

    const session = await this.sessionRepository.createSession(
      userId,
      request.mode,
    );

    return {
      id: session.id,
      playerId: session.userId,
      mode: session.mode,
      startedAt: session.startedAt,
    };
  }

  async addEvent(
    sessionId: string,
    userId: string,
    request: SessionEventRequest,
  ): Promise<SessionEventResponse> {
    const session = await this.sessionRepository.findSessionByIdAndUser(
      sessionId,
      userId,
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }

    const score = this.calculateEventScore(request.payload);

    await this.sessionRepository.addEvent(sessionId, {
      type: 'SHOT',
      ts: new Date(request.ts),
      hit: request.payload.hit,
      distance: request.payload.distance,
      score,
    });

    return { accepted: true };
  }

  async finishSession(
    sessionId: string,
    userId: string,
  ): Promise<FinishSessionResponse> {
    const session = await this.sessionRepository.findSessionByIdAndUser(
      sessionId,
      userId,
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }

    const { totalScore, hits, misses } = this.calculateSessionScore(
      session.events,
    );
    const finishedAt = new Date();

    await this.sessionRepository.finishSession(
      sessionId,
      totalScore,
      finishedAt,
    );

    return {
      id: session.id,
      playerId: session.userId,
      score: totalScore,
      hits,
      misses,
      finishedAt,
    };
  }

  async getSessionDetails(
    sessionId: string,
    userId: string,
  ): Promise<SessionDetailsResponse> {
    const session = await this.sessionRepository.findSessionByIdAndUser(
      sessionId,
      userId,
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const events = session.events.map((event) => ({
      id: event.id,
      type: event.type as 'SHOT',
      ts: event.ts,
      hit: event.hit,
      distance: event.distance,
      score: event.score,
    }));

    const response: SessionDetailsResponse = {
      id: session.id,
      playerId: session.userId,
      mode: session.mode,
      startedAt: session.startedAt,
      events,
    };

    if (session.finishedAt) {
      const { hits, misses } = this.calculateSessionScore(session.events);
      response.finishedAt = session.finishedAt;
      response.score = session.score;
      response.hits = hits;
      response.misses = misses;
    }

    return response;
  }

  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardEntry[]> {
    const sessions = await this.sessionRepository.getLeaderboard(
      query.mode,
      query.limit,
    );

    return sessions.map((session) => {
      const { hits, misses } = this.calculateSessionScore(session.events);

      return {
        playerId: session.userId,
        playerName: session.user.name,
        score: session.score!,
        hits,
        misses,
        finishedAt: session.finishedAt!,
      };
    });
  }

  private calculateEventScore(payload: {
    hit: boolean;
    distance: number;
  }): number {
    let score = 0;

    if (payload.hit) {
      // Base hit score: +10 points
      score += 10;

      // Distance bonus: +5 points if distance > 10
      if (payload.distance > 10) {
        score += 5;
      }
    }

    return score;
  }

  private calculateSessionScore(events: Event[]): {
    totalScore: number;
    hits: number;
    misses: number;
  } {
    let totalScore = 0;
    let hits = 0;
    let misses = 0;
    let hitStreak = 0;

    // Sort events by timestamp to ensure correct order
    const sortedEvents = [...events].sort(
      (a, b) => a.ts.getTime() - b.ts.getTime(),
    );

    for (const event of sortedEvents) {
      if (event.hit) {
        hits++;
        hitStreak++;

        // Combo bonus: +5 points for every 3 consecutive hits
        if (hitStreak % 3 === 0) {
          totalScore += 5;
        }
      } else {
        misses++;
        hitStreak = 0; // Reset streak on miss
      }

      totalScore += event.score;
    }

    return { totalScore, hits, misses };
  }
}
