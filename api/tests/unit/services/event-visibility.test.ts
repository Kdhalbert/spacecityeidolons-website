import { describe, it, expect } from 'vitest';
import { EventVisibility, Role } from '@prisma/client';
import { filterEventsByVisibility } from '../../../src/services/event.service.js';

// Pure in-memory test objects - no DB required
const makeEvent = (visibility: EventVisibility, id = 'e1') =>
  ({
    id,
    title: `Event ${id}`,
    description: null,
    date: new Date(),
    time: '19:00',
    endTime: null,
    location: null,
    visibility,
    creatorId: 'creator-1',
    maxAttendees: null,
    games: [],
    recurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as never;

const makeUser = (role: Role, id = 'user-1') =>
  ({
    id,
    discordId: id,
    discordUsername: `user_${id}`,
    email: `${id}@test.com`,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as never;

const publicEvent = makeEvent(EventVisibility.PUBLIC, 'pub');
const membersOnlyEvent = makeEvent(EventVisibility.MEMBERS_ONLY, 'mem');
const privateEvent = makeEvent(EventVisibility.PRIVATE, 'priv');
const adminOnlyEvent = makeEvent(EventVisibility.ADMIN, 'adm');
const allEvents = [publicEvent, membersOnlyEvent, privateEvent, adminOnlyEvent];

const adminUser = makeUser(Role.ADMIN, 'admin-1');
const memberUser = makeUser(Role.MEMBER, 'member-1');
const guestUser = makeUser(Role.GUEST, 'guest-1');
const creatorUser = makeUser(Role.MEMBER, 'creator-1');

describe('Event Visibility Filtering (US4)', () => {
  describe('Unauthenticated User (No User)', () => {
    it('should only see PUBLIC events', () => {
      const visible = filterEventsByVisibility(allEvents, null, false);
      expect(visible.length).toBe(1);
      expect(visible[0].visibility).toBe(EventVisibility.PUBLIC);
    });

    it('should not see MEMBER or PRIVATE events', () => {
      const visible = filterEventsByVisibility(allEvents, null, false);
      const hasPrivate = visible.some((e) => e.visibility !== EventVisibility.PUBLIC);
      expect(hasPrivate).toBe(false);
    });
  });

  describe('Guest User', () => {
    it('should only see PUBLIC events', () => {
      const visible = filterEventsByVisibility(allEvents, guestUser, false);
      expect(visible.length).toBe(1);
      expect(visible[0].visibility).toBe(EventVisibility.PUBLIC);
    });

    it('should not see MEMBERS_ONLY or PRIVATE events', () => {
      const visible = filterEventsByVisibility(allEvents, guestUser, false);
      const hasRestricted = visible.some((e) =>
        [EventVisibility.MEMBERS_ONLY, EventVisibility.PRIVATE].includes(e.visibility)
      );
      expect(hasRestricted).toBe(false);
    });
  });

  describe('Member User', () => {
    it('should see PUBLIC and MEMBERS_ONLY events', () => {
      const visible = filterEventsByVisibility(allEvents, memberUser, false);
      expect(visible.length).toBe(2);
      expect(visible.every((e) =>
        [EventVisibility.PUBLIC, EventVisibility.MEMBERS_ONLY].includes(e.visibility)
      )).toBe(true);
    });

    it('should not see PRIVATE events unless they are the creator', () => {
      const visible = filterEventsByVisibility(allEvents, memberUser, false);
      const hasPrivate = visible.some((e) => e.visibility === EventVisibility.PRIVATE);
      expect(hasPrivate).toBe(false);
    });

    it('should see all events if they are the creator (isCreator=true)', () => {
      const visible = filterEventsByVisibility(allEvents, creatorUser, true);
      expect(visible.length).toBe(4);
    });
  });

  describe('Admin User', () => {
    it('should see all event visibilities', () => {
      const visible = filterEventsByVisibility(allEvents, adminUser, false);
      expect(visible.some((e) => e.visibility === EventVisibility.PUBLIC)).toBe(true);
      expect(visible.some((e) => e.visibility === EventVisibility.MEMBERS_ONLY)).toBe(true);
      expect(visible.some((e) => e.visibility === EventVisibility.PRIVATE)).toBe(true);
      expect(visible.some((e) => e.visibility === EventVisibility.ADMIN)).toBe(true);
    });

    it('should see PRIVATE events even when not creator', () => {
      const visible = filterEventsByVisibility([privateEvent], adminUser, false);
      expect(visible.length).toBe(1);
    });
  });

  describe('Event Creator', () => {
    it('should see their own events of any visibility', () => {
      const visible = filterEventsByVisibility(allEvents, creatorUser, true);
      expect(visible.length).toBe(4);
    });

    it('should see PRIVATE events they created', () => {
      const visible = filterEventsByVisibility([privateEvent], creatorUser, true);
      expect(visible.length).toBe(1);
      expect(visible[0].visibility).toBe(EventVisibility.PRIVATE);
    });
  });

  describe('Null/Empty Cases', () => {
    it('should handle empty event list', () => {
      const visible = filterEventsByVisibility([], memberUser, false);
      expect(visible.length).toBe(0);
    });

    it('should handle null user (anonymous)', () => {
      const visible = filterEventsByVisibility(allEvents, null, false);
      expect(visible.length).toBe(1);
    });

    it('should handle undefined user', () => {
      const visible = filterEventsByVisibility(allEvents, undefined, false);
      expect(visible.length).toBe(1);
    });
  });
});

