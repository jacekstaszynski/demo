import { Test, TestingModule } from '@nestjs/testing';
import { Event } from '@prisma/client';
import { SessionRepository } from '../out/session.repository';
import { SessionService } from './session.service';

describe('SessionService - Score Calculations', () => {
  let service: SessionService;
  let mockRepository: jest.Mocked<SessionRepository>;

  beforeEach(async () => {
    mockRepository = {
      createSession: jest.fn(),
      getUserActiveSession: jest.fn(),
      findSessionById: jest.fn(),
      finishSession: jest.fn(),
      addEvent: jest.fn(),
      getSessionById: jest.fn(),
      getLeaderboard: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  describe('calculateEventScore', () => {
    describe('hits/misses', () => {
      it('should return 0 for a miss', () => {
        const payload = { hit: false, distance: 5 };
        const score = service.calculateEventScore(payload);
        expect(score).toBe(0);
      });

      it('should return base score of 10 for a hit', () => {
        const payload = { hit: true, distance: 5 };
        const score = service.calculateEventScore(payload);
        expect(score).toBe(10);
      });
    });

    describe('distance bonus', () => {
      it('should add 5 bonus points for distance > 10', () => {
        const payload = { hit: true, distance: 11 };
        const score = service.calculateEventScore(payload);
        expect(score).toBe(15);
      });

      it('should not add bonus for distance <= 10', () => {
        const payload = { hit: true, distance: 10 };
        const score = service.calculateEventScore(payload);
        expect(score).toBe(10);
      });
    });
  });

  describe('calculateSessionScore', () => {
    const createEvent = (
      hit: boolean,
      distance: number,
      tsOffset: number,
    ): Event => {
      const baseTs = new Date('2024-01-01T00:00:00Z');
      const score = hit ? (distance > 10 ? 15 : 10) : 0;

      return {
        id: `event-${tsOffset}`,
        sessionId: 'session-1',
        type: 'SHOT',
        ts: new Date(baseTs.getTime() + tsOffset * 1000),
        hit,
        distance,
        score,
        createdAt: new Date(),
      } as Event;
    };

    describe('empty sequence', () => {
      it('should return zeros for null events', () => {
        const result = service.calculateSessionScore(null);
        expect(result).toEqual({ totalScore: 0, hits: 0, misses: 0 });
      });

      it('should return zeros for empty array', () => {
        const result = service.calculateSessionScore([]);
        expect(result).toEqual({ totalScore: 0, hits: 0, misses: 0 });
      });
    });

    describe('hits/misses', () => {
      it('should count only misses', () => {
        const events = [createEvent(false, 5, 1), createEvent(false, 5, 2)];

        const result = service.calculateSessionScore(events);
        expect(result.hits).toBe(0);
        expect(result.misses).toBe(2);
        expect(result.totalScore).toBe(0);
      });

      it('should count both hits and misses', () => {
        const events = [
          createEvent(true, 5, 1),
          createEvent(false, 5, 2),
          createEvent(true, 5, 3),
          createEvent(false, 5, 4),
        ];

        const result = service.calculateSessionScore(events);
        expect(result.hits).toBe(2);
        expect(result.misses).toBe(2);
        expect(result.totalScore).toBe(20); // 2 hits * 10 points
      });
    });

    describe('distance bonus', () => {
      it('should add distance bonus to score', () => {
        const events = [
          createEvent(true, 15, 1), // 15 points (10 + 5 bonus)
          createEvent(false, 20, 2), // 0 points
          createEvent(true, 5, 3), // 10 points
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(25); // 15 + 0 + 10
        expect(result.hits).toBe(2);
        expect(result.misses).toBe(1);
      });
    });

    describe('combo (3/6/7 consecutive hits)', () => {
      it('should add 5 bonus points for 3 consecutive hits', () => {
        const events = [
          createEvent(true, 5, 1), // 10 points
          createEvent(true, 5, 2), // 10 points
          createEvent(true, 5, 3), // 10 points + 5 combo bonus
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(35); // 30 base + 5 combo
        expect(result.hits).toBe(3);
        expect(result.misses).toBe(0);
      });

      it('should add bonus for 6 consecutive hits', () => {
        const events = [
          createEvent(true, 5, 1), // 10
          createEvent(true, 5, 2), // 10
          createEvent(true, 5, 3), // 10 + 5 combo (3rd hit)
          createEvent(true, 5, 4), // 10
          createEvent(true, 5, 5), // 10
          createEvent(true, 5, 6), // 10 + 5 combo (6th hit)
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(70); // 60 base + 10 combo
        expect(result.hits).toBe(6);
      });

      it('should add bonus for 7 consecutive hits', () => {
        const events = [
          createEvent(true, 5, 1), // 10
          createEvent(true, 5, 2), // 10
          createEvent(true, 5, 3), // 10 + 5 combo
          createEvent(true, 5, 4), // 10
          createEvent(true, 5, 5), // 10
          createEvent(true, 5, 6), // 10 + 5 combo
          createEvent(true, 5, 7), // 10
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(80); // 70 base + 10 combo
        expect(result.hits).toBe(7);
      });
    });

    describe('mixed sequences with combo breaks', () => {
      it('should reset combo on miss', () => {
        const events = [
          createEvent(true, 5, 1), // 10
          createEvent(true, 5, 2), // 10
          createEvent(false, 5, 3), // 0 - breaks combo
          createEvent(true, 5, 4), // 10
          createEvent(true, 5, 5), // 10
          createEvent(true, 5, 6), // 10 + 5 combo (3rd hit after reset)
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(55); // 50 base + 5 combo
        expect(result.hits).toBe(5);
        expect(result.misses).toBe(1);
      });

      it('should handle multiple combo breaks', () => {
        const events = [
          createEvent(true, 5, 1), // 10
          createEvent(true, 5, 2), // 10
          createEvent(true, 5, 3), // 10 + 5 combo
          createEvent(false, 5, 4), // 0 - break
          createEvent(true, 5, 5), // 10
          createEvent(true, 5, 6), // 10
          createEvent(false, 5, 7), // 0 - break
          createEvent(true, 5, 8), // 10
          createEvent(true, 5, 9), // 10
          createEvent(true, 5, 10), // 10 + 5 combo
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(90); // 80 base + 10 combo
        expect(result.hits).toBe(8);
        expect(result.misses).toBe(2);
      });

      it('should combine distance bonus with combo bonus', () => {
        const events = [
          createEvent(true, 15, 1), // 15 (10 + 5 distance)
          createEvent(true, 20, 2), // 15 (10 + 5 distance)
          createEvent(true, 12, 3), // 15 (10 + 5 distance) + 5 combo
        ];

        const result = service.calculateSessionScore(events);
        expect(result.totalScore).toBe(50); // 45 base + 5 combo
        expect(result.hits).toBe(3);
      });
    });
  });
});
