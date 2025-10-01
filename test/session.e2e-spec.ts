import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventType, Mode } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ConfigurationService } from '../src/config/configuration.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserFacade } from '../src/user/user.facade';

describe('SessionController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let userFacade: UserFacade;
  let configurationService: ConfigurationService;
  let authToken: string;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-123',
    userId: mockUser.id,
    mode: Mode.arcade,
    startedAt: new Date(),
    finishedAt: null,
    score: null,
  };

  const mockEvent = {
    id: 'event-123',
    sessionId: mockSession.id,
    type: EventType.SHOT,
    ts: new Date(),
    hit: true,
    distance: 15,
    score: 15,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    prismaService = module.get(PrismaService);
    userFacade = module.get(UserFacade);
    configurationService = module.get(ConfigurationService);

    const payload = { sub: mockUser.email };
    authToken = jwt.sign(payload, configurationService.auth0.secret, {
      expiresIn: '1h',
    });

    jest.spyOn(userFacade, 'findUserByEmail').mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /sessions - startSession', () => {
    it('should start a new session successfully', async () => {
      jest.spyOn(prismaService.session, 'findFirst').mockResolvedValue(null); // No active session
      jest
        .spyOn(prismaService.session, 'create')
        .mockResolvedValue(mockSession);

      const response = await request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ mode: Mode.arcade })
        .expect(201);

      expect(response.body.id).toBe(mockSession.id);
    });
  });

  describe('POST /sessions/:id/finish - finishSession', () => {
    it('should finish a session successfully', async () => {
      const finishedSession = {
        ...mockSession,
        finishedAt: new Date(),
        score: 15,
      };

      jest.spyOn(prismaService.session, 'findUniqueOrThrow').mockResolvedValue({
        ...mockSession,
        events: [mockEvent] as any,
        user: mockUser,
      });
      jest
        .spyOn(prismaService.session, 'update')
        .mockResolvedValue(finishedSession);

      const response = await request(app.getHttpServer())
        .post(`/sessions/${mockSession.id}/finish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.score).toBeDefined();
    });
  });

  describe('POST /sessions/:id/events - addEvent', () => {
    it('should add an event to a session successfully', async () => {
      jest.spyOn(prismaService.session, 'findUniqueOrThrow').mockResolvedValue({
        ...mockSession,
        events: [] as any,
        user: mockUser,
      });
      jest.spyOn(prismaService.event, 'create').mockResolvedValue(mockEvent);

      const eventRequest = {
        type: EventType.SHOT,
        ts: new Date().toISOString(),
        payload: {
          hit: true,
          distance: 15,
        },
      };

      const response = await request(app.getHttpServer())
        .post(`/sessions/${mockSession.id}/events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventRequest)
        .expect(201);

      expect(response.body.id).toBe(mockEvent.id);
    });
  });

  describe('GET /sessions/:id - getSessionDetails', () => {
    it('should get session details successfully', async () => {
      jest.spyOn(prismaService.session, 'findUniqueOrThrow').mockResolvedValue({
        ...mockSession,
        events: [mockEvent] as any,
        user: mockUser as any,
      });

      const response = await request(app.getHttpServer())
        .get(`/sessions/${mockSession.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(mockSession.id);
    });
  });
});
