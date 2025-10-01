import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import {
  LeaderboardQuery,
  SessionEventRequest,
  StartSessionRequest,
} from '../in/type/session.request';
import {
  FinishSessionResponse,
  LeaderboardPlayer,
  SessionDetailsResponse,
  SessionEventResponse,
  StartSessionResponse,
} from '../in/type/session.response';
import type { SessionWithEvents } from '../out/prisma.types';
import { SessionRepository } from '../out/session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async startSession(
    userId: string,
    request: StartSessionRequest,
  ): Promise<StartSessionResponse> {
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

  async finishSession(sessionId: string): Promise<FinishSessionResponse> {
    const finishedAt = new Date();
    const session = await this.sessionRepository.findSessionById(sessionId);
    const validatedSession = this.validateSession(session);

    const { totalScore, hits, misses } = this.calculateSessionScore(
      validatedSession.events,
    );

    await this.sessionRepository.finishSession(
      sessionId,
      totalScore,
      finishedAt,
    );

    return {
      id: validatedSession.id,
      playerId: validatedSession.userId,
      score: totalScore,
      hits,
      misses,
      finishedAt,
    };
  }

  validateSession(session?: SessionWithEvents | null): SessionWithEvents {
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }
    return session;
  }

  async addEvent(
    sessionId: string,
    request: SessionEventRequest,
  ): Promise<Event> {
    const session = await this.sessionRepository.findSessionById(sessionId);
    this.validateSession(session);
    const score = this.calculateEventScore(request.payload);

    const event = await this.sessionRepository.addEvent(sessionId, {
      type: request.type,
      ts: request.ts,
      hit: request.payload.hit,
      distance: request.payload.distance,
      score,
    });

    return event;
  }

  async getSessionDetails(sessionId: string): Promise<SessionDetailsResponse> {
    const session = await this.sessionRepository.getSessionById(sessionId);

    const response: SessionDetailsResponse = {
      id: session.id,
      playerId: session.userId,
      mode: session.mode,
      startedAt: session.startedAt,
      events: plainToInstance(SessionEventResponse, session.events),
    };

    if (session.finishedAt) {
      const { hits, misses } = this.calculateSessionScore(session.events);
      response.finishedAt = session.finishedAt;
      response.score = session.score || 0;
      response.hits = hits;
      response.misses = misses;
    }

    return response;
  }

  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardPlayer[]> {
    const sessions = await this.sessionRepository.getLeaderboard(
      query.mode,
      query.limit,
    );

    return sessions.map((session) => {
      const { hits, misses } = this.calculateSessionScore(session.events);

      return {
        playerId: session.userId,
        playerName: session.user.name,
        score: session.score || 0,
        hits,
        misses,
        finishedAt: session.finishedAt!,
      };
    });
  }

  calculateEventScore(payload: { hit: boolean; distance: number }): number {
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

  calculateSessionScore(events: Event[] | null): {
    totalScore: number;
    hits: number;
    misses: number;
  } {
    if (!events || events.length === 0) {
      return { totalScore: 0, hits: 0, misses: 0 };
    }

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
