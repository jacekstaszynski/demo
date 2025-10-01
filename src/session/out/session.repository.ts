import { Injectable } from '@nestjs/common';
import { Event, EventType, Mode, Session } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, mode: Mode): Promise<Session> {
    return this.prisma.session.create({
      data: {
        userId,
        mode,
      },
    });
  }

  async findSessionById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        events: true,
        user: true,
      },
    });
  }

  async findSessionByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: { id, userId },
      include: {
        events: true,
        user: true,
      },
    });
  }

  async addEvent(
    sessionId: string,
    eventData: {
      type: EventType;
      ts: Date;
      hit: boolean;
      distance: number;
      score: number;
    },
  ): Promise<Event> {
    return this.prisma.event.create({
      data: {
        sessionId,
        ...eventData,
      },
    });
  }

  async finishSession(
    id: string,
    score: number,
    finishedAt: Date,
  ): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: {
        finishedAt,
        score,
      },
    });
  }

  async getLeaderboard(mode: Mode, limit: number) {
    return this.prisma.session.findMany({
      where: {
        mode,
        finishedAt: { not: null },
      },
      include: {
        user: true,
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
    });
  }

  async getUserActiveSession(userId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: {
        userId,
        finishedAt: null,
      },
      include: {
        events: true,
      },
    });
  }
}
