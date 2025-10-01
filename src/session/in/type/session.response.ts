import { Mode } from '@prisma/client';

export class StartSessionResponseDto {
  id: string;
  playerId: string;
  mode: Mode;
  startedAt: Date;
}

export class SessionEventResponseDto {
  accepted: boolean;
}

export class FinishSessionResponseDto {
  id: string;
  playerId: string;
  score: number;
  hits: number;
  misses: number;
  finishedAt: Date;
}

export class SessionEventDto {
  id: string;
  type: 'SHOT';
  ts: Date;
  hit: boolean;
  distance: number;
  score: number;
}

export class SessionDetailsResponseDto {
  id: string;
  playerId: string;
  mode: Mode;
  startedAt: Date;
  finishedAt?: Date;
  score?: number;
  hits?: number;
  misses?: number;
  events?: SessionEventDto[];
}

export class LeaderboardEntryDto {
  playerId: string;
  playerName: string;
  score: number;
  hits: number;
  misses: number;
  finishedAt: Date;
}
