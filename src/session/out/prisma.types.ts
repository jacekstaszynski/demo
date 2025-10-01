import type { Event, Session } from '@prisma/client';

export type SessionWithEvents = Session & {
  events: Event[];
};
