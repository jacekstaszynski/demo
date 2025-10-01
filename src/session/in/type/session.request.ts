import { EventType, Mode } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';

export class StartSessionRequest {
  @IsEnum(Mode)
  @IsNotEmpty()
  mode: Mode;
}

export class SessionEventRequest {
  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  ts: Date;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Payload)
  payload: Payload;
}

export class Payload {
  @IsNotEmpty()
  hit: boolean;

  @IsNotEmpty()
  distance: number;
}

export interface LeaderboardQuery {
  mode: Mode;
  limit: number;
}
