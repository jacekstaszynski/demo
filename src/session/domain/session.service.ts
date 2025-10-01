import { BadRequestException, Injectable } from '@nestjs/common';
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
import { SessionRepository } from '../out/session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async startSession(
    userId: string,
    request: StartSessionRequest,
  ): Promise<StartSessionResponse> {
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
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }

    const { totalScore, hits, misses } = this.calculateSessionScore(
      session.events,
    );

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

  async addEvent(
    sessionId: string,
    request: SessionEventRequest,
  ): Promise<Event> {
    const session = await this.sessionRepository.getSessionById(sessionId);

    if (session.finishedAt) {
      throw new BadRequestException('Session is already finished');
    }

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
    if (!payload.hit) return 0;

    let score = 10;

    if (payload.distance > 10) {
      score += 5;
    }

    return score;
  }

  calculateSessionScore(events: Event[] | null): {
    totalScore: number;
    hits: number;
    misses: number;
  } {
    if (!events?.length) {
      return { totalScore: 0, hits: 0, misses: 0 };
    }

    let totalScore = 0;
    let hits = 0;
    let misses = 0;
    let hitStreak = 0;

    const sortedEvents = [...events].sort(
      (a, b) => a.ts.getTime() - b.ts.getTime(),
    );

    for (const event of sortedEvents) {
      totalScore += event.score;

      if (!event.hit) {
        misses++;
        hitStreak = 0;
        continue;
      }

      hits++;
      hitStreak++;

      if (hitStreak % 3 === 0) {
        totalScore += 5;
      }
    }

    return { totalScore, hits, misses };
  }
}
