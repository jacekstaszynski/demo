import type { Prisma } from '@prisma/client';

export type SessionWithEvents = Prisma.SessionGetPayload<{
  include: {
    events: true;
  };
}>;

export type SessionWithEventsAndUser = Prisma.SessionGetPayload<{
  include: {
    events: true;
    user: true;
  };
}>;

export type SessionWithUser = Prisma.SessionGetPayload<{
  include: {
    user: true;
  };
}>;
