import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../src/lib/db';
import { Role, EventVisibility } from '@prisma/client';
import { filterEventsByVisibility } from '../../src/services/event.service';

describe('Event Visibility Filtering (US4)', () => {
  let events: any[] = [];
  let adminUser: any;
  let memberUser: any;
  let guestUser: any;
  let creatorUser: any;

  beforeAll(async () => {
    // Create test users with different roles
    adminUser = await prisma.user.create({
      data: {
        discordId: 'admin-123',
        discordUsername: 'admin',
        email: 'admin@test.com',
        role: Role.ADMIN,
      },
    });

    memberUser = await prisma.user.create({
      data: {
        discordId: 'member-123',
        discordUsername: 'member',
        email: 'member@test.com',
        role: Role.MEMBER,
      },
    });

    guestUser = await prisma.user.create({
      data: {
        discordId: 'guest-123',
        discordUsername: 'guest',
        email: 'guest@test.com',
        role: Role.GUEST,
      },
    });

    creatorUser = await prisma.user.create({
      data: {
        discordId: 'creator-123',
        discordUsername: 'creator',
        email: 'creator@test.com',
        role: Role.MEMBER,
      },
    });

    // Create test events with different visibility settings
    const baseDate = new Date(Date.now() + 86400000);

    events = [
      await prisma.event.create({
        data: {
          title: 'Public Gaming Night',
          description: 'Open to all',
          date: baseDate,
          time: '19:00',
          visibility: EventVisibility.PUBLIC,
          creatorId: creatorUser.id,
        },
      }),
      await prisma.event.create({
        data: {
          title: 'Member Game Session',
          description: 'Members only',
          date: baseDate,
          time: '20:00',
          visibility: EventVisibility.MEMBER,
          creatorId: creatorUser.id,
        },
      }),
      await prisma.event.create({
        data: {
          title: 'Private Gathering',
          description: 'Creator only',
          date: baseDate,
          time: '21:00',
          visibility: EventVisibility.PRIVATE,
          creatorId: creatorUser.id,
        },
      }),
    ];
  });

  afterAll(async () => {
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('Unauthenticated User (No User)', () => {
    it('should only see PUBLIC events', async () => {
      const visible = filterEventsByVisibility(events, null, false);
      expect(visible.length).toBe(1);
      expect(visible[0].visibility).toBe(EventVisibility.PUBLIC);
    });

    it('should not see MEMBER or PRIVATE events', async () => {
      const visible = filterEventsByVisibility(events, null, false);
      const hasPrivate = visible.some((e) => e.visibility !== EventVisibility.PUBLIC);
      expect(hasPrivate).toBe(false);
    });
  });

  describe('Guest User', () => {
    it('should only see PUBLIC events', async () => {
      const visible = filterEventsByVisibility(events, guestUser, false);
      expect(visible.length).toBe(1);
      expect(visible[0].visibility).toBe(EventVisibility.PUBLIC);
    });

    it('should not see MEMBER or PRIVATE events', async () => {
      const visible = filterEventsByVisibility(events, guestUser, false);
      const hasRestricted = visible.some((e) =>
        [EventVisibility.MEMBER, EventVisibility.PRIVATE].includes(e.visibility)
      );
      expect(hasRestricted).toBe(false);
    });
  });

  describe('Member User', () => {
    it('should see PUBLIC and MEMBER events', async () => {
      const visible = filterEventsByVisibility(events, memberUser, false);
      expect(visible.length).toBe(2);
      expect(visible.every((e) => [EventVisibility.PUBLIC, EventVisibility.MEMBER].includes(e.visibility))).toBe(true);
    });

    it('should not see PRIVATE events unless they are the creator', async () => {
      const visible = filterEventsByVisibility(events, memberUser, false);
      const hasPrivate = visible.some((e) => e.visibility === EventVisibility.PRIVATE);
      expect(hasPrivate).toBe(false);
    });

    it('should see PRIVATE events if they are the creator', async () => {
      // Add creator to the test - they should see their own private event
      const userIsCreator = true;
      const visible = filterEventsByVisibility(events, creatorUser, userIsCreator);
      expect(visible.length).toBe(3); // All events
    });
  });

  describe('Admin User', () => {
    it('should see all events regardless of visibility', async () => {
      const visible = filterEventsByVisibility(events, adminUser, false);
      expect(visible.length).toBe(3); // All events
      expect(visible.map((e) => e.visibility).sort()).toEqual([
        EventVisibility.MEMBER,
        EventVisibility.PRIVATE,
        EventVisibility.PUBLIC,
      ]);
    });

    it('should see PRIVATE events even if not creator', async () => {
      const visible = filterEventsByVisibility(events, adminUser, false);
      const hasPrivate = visible.some((e) => e.visibility === EventVisibility.PRIVATE);
      expect(hasPrivate).toBe(true);
    });
  });

  describe('Event Creator', () => {
    it('should see their own PUBLIC, MEMBER, and PRIVATE events', async () => {
      const visible = filterEventsByVisibility(events, creatorUser, true);
      expect(visible.length).toBe(3); // All their events
    });

    it('should see PRIVATE events they created', async () => {
      const visible = filterEventsByVisibility(events, creatorUser, true);
      const privateEvent = visible.find((e) => e.visibility === EventVisibility.PRIVATE);
      expect(privateEvent).toBeDefined();
    });
  });

  describe('Mixed Visibility Scenarios', () => {
    it('should correctly filter when user is both member and non-creator', async () => {
      const filtered = filterEventsByVisibility(events, memberUser, false);
      expect(filtered.length).toBe(2); // PUBLIC + MEMBER
    });

    it('should correctly filter when user is admin', async () => {
      const filtered = filterEventsByVisibility(events, adminUser, false);
      expect(filtered.length).toBe(3); // ALL
    });

    it('should correctly filter when user is creator of private event', async () => {
      const filtered = filterEventsByVisibility(events, creatorUser, true);
      expect(filtered.length).toBe(3); // ALL (creator override)
    });

    it('should hide events below current user role level', async () => {
      // Create ADMIN-only event
      const adminOnlyEvent = await prisma.event.create({
        data: {
          title: 'Admin Meeting',
          date: new Date(Date.now() + 86400000),
          time: '18:00',
          visibility: 'ADMIN' as any, // if ADMIN visibility is implemented
          creatorId: adminUser.id,
        },
      });

      const memberVisibility = filterEventsByVisibility([adminOnlyEvent], memberUser, false);
      expect(memberVisibility.length).toBe(0);

      await prisma.event.delete({ where: { id: adminOnlyEvent.id } });
    });
  });

  describe('Null/Empty Cases', () => {
    it('should handle empty event list', async () => {
      const visible = filterEventsByVisibility([], memberUser, false);
      expect(visible.length).toBe(0);
    });

    it('should handle null user (anonymous)', async () => {
      const visible = filterEventsByVisibility(events, null, false);
      expect(visible.length).toBe(1); // Only PUBLIC
    });

    it('should handle undefined user', async () => {
      const visible = filterEventsByVisibility(events, undefined, false);
      expect(visible.length).toBe(1); // Only PUBLIC
    });
  });
});
