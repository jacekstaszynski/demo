import { EventType, Mode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';

export class StartSessionRequest {
  @IsEnum(Mode)
  @IsNotEmpty()
  mode: Mode;
}

export class SessionEventRequest {
  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsNotEmpty()
  ts: string;

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
