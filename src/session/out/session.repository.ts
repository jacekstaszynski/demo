import { Injectable } from '@nestjs/common';
import { EventType, Mode, type Session } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, mode: Mode) {
    return this.prisma.session.create({
      data: {
        userId,
        mode,
      },
    });
  }

  async findSessionById(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        events: true,
        user: true,
      },
    });
  }

  async getSessionById(id: string) {
    return this.prisma.session.findUniqueOrThrow({
      where: { id },
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
  ) {
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
        events: true,
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
    });
  }

  async getUserActiveSession(userId: string) {
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
