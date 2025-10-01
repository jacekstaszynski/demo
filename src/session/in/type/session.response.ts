import { EventType, Mode } from '@prisma/client';
import { Expose } from 'class-transformer';

export class StartSessionResponse {
  @Expose()
  id: string;

  @Expose()
  playerId: string;

  @Expose()
  mode: Mode;

  @Expose()
  startedAt: Date;
}

export class FinishSessionResponse {
  @Expose()
  id: string;

  @Expose()
  playerId: string;

  @Expose()
  score: number;

  @Expose()
  hits: number;

  @Expose()
  misses: number;

  @Expose()
  finishedAt: Date;
}

export class SessionDetailsResponse {
  @Expose()
  id: string;
  @Expose()
  playerId: string;
  @Expose()
  mode: Mode;
  @Expose()
  startedAt: Date;
  @Expose()
  finishedAt?: Date;
  score?: number;
  @Expose()
  hits?: number;
  @Expose()
  misses?: number;
  @Expose()
  events?: SessionEventResponse[];
}

export class SessionEventResponse {
  @Expose()
  id: string;
  @Expose()
  type: EventType;
  @Expose()
  ts: Date;
  @Expose()
  hit: boolean;
  @Expose()
  distance: number;
  @Expose()
  score: number;
}

export class LeaderboardResponse {
  @Expose()
  players: LeaderboardPlayer[];
}

export class LeaderboardPlayer {
  @Expose()
  playerId: string;
  @Expose()
  playerName: string;
  @Expose()
  score: number;
  @Expose()
  hits: number;
  @Expose()
  misses: number;
  @Expose()
  finishedAt: Date;
}
