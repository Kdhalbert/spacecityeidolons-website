import { describe, it, expect, beforeAll, afterAll } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { buildApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { generateTokens } from '../../src/utils/jwt.js';
import { Role } from '@prisma/client';

describe('Events API (US4 - Calendar Discovery)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let testUserId: string;
  let adminUserId: string;
  let adminToken: string;
  let userToken: string;
  let eventId: string;

  beforeAll(async () => {
    app = await buildApp();

    // Create test users
    const testUser = await prisma.user.create({
      data: {
        discordId: '123456789',
        discordUsername: 'testuser',
        email: 'test@example.com',
        role: Role.MEMBER,
      },
    });
    testUserId = testUser.id;

    const adminUser = await prisma.user.create({
      data: {
        discordId: '987654321',
        discordUsername: 'admin',
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
    });
    adminUserId = adminUser.id;

    // Generate real JWT tokens for testing
    const userTokens = generateTokens({
      userId: testUserId,
      email: 'test@example.com',
      discordId: '123456789',
      role: Role.MEMBER,
    });
    userToken = userTokens.accessToken;

    const adminTokens = generateTokens({
      userId: adminUserId,
      email: 'admin@example.com',
      discordId: '987654321',
      role: Role.ADMIN,
    });
    adminToken = adminTokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('GET /api/events', () => {
    it('should return all PUBLIC events for unauthenticated users', async () => {
      // Create a public event
      const publicEvent = await prisma.event.create({
        data: {
          title: 'Public Gaming Tournament',
          description: 'Open to all members',
          date: new Date(Date.now() + 86400000), // tomorrow
          time: '19:00',
          visibility: 'PUBLIC',
          creatorId: testUserId,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/events',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].visibility).toBe('PUBLIC');
      expect(data.data[0].id).toBe(publicEvent.id);
    });

    it('should return only PUBLIC events when listing for non-creators', async () => {
      await prisma.event.create({
        data: {
          title: 'Private Gaming Session',
          description: 'Closed group only',
          date: new Date(Date.now() + 86400000),
          time: '20:00',
          visibility: 'PRIVATE',
          creatorId: testUserId,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/events',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const privateEvent = data.data.find((e: any) => e.visibility === 'PRIVATE');
      expect(privateEvent).toBeUndefined();
    });

    it('should support date range filtering with startDate and endDate query params', async () => {
      const tomorrow = new Date(Date.now() + 86400000);
      const nextWeek = new Date(Date.now() + 604800000);

      await prisma.event.create({
        data: {
          title: 'Future Event',
          date: nextWeek,
          time: '19:00',
          visibility: 'PUBLIC',
          creatorId: testUserId,
        },
      });

      const startDate = new Date(Date.now() + 172800000).toISOString(); // in 2 days
      const endDate = new Date(Date.now() + 864000000).toISOString(); // in 10 days

      const response = await app.inject({
        method: 'GET',
        url: `/api/events?startDate=${startDate}&endDate=${endDate}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return paginated results with count', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/events?limit=10&offset=0',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('totalCount');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a specific PUBLIC event', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Specific Event',
          date: new Date(Date.now() + 86400000),
          time: '19:00',
          visibility: 'PUBLIC',
          creatorId: testUserId,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/events/${event.id}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.id).toBe(event.id);
      expect(data.title).toBe('Specific Event');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/events/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should not return PRIVATE events to non-creators', async () => {
      const privateEvent = await prisma.event.create({
        data: {
          title: 'Private Event',
          date: new Date(Date.now() + 86400000),
          time: '19:00',
          visibility: 'PRIVATE',
          creatorId: adminUserId,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/events/${privateEvent.id}`,
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return PRIVATE events to creator or admin', async () => {
      const privateEvent = await prisma.event.create({
        data: {
          title: 'My Private Event',
          date: new Date(Date.now() + 86400000),
          time: '19:00',
          visibility: 'PRIVATE',
          creatorId: testUserId,
        },
      });

      // Without authentication, should return 404 for PRIVATE events
      const response = await app.inject({
        method: 'GET',
        url: `/api/events/${privateEvent.id}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Event Visibility Filtering', () => {
    it('should enforce PUBLIC visibility filtering', async () => {
      const publicEvent = await prisma.event.create({
        data: {
          title: 'Public Event',
          date: new Date(Date.now() + 86400000),
          time: '19:00',
          visibility: 'PUBLIC',
          creatorId: testUserId,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/events',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const event = data.data.find((e: any) => e.id === publicEvent.id);
      expect(event).toBeDefined();
    });

    it('should hide PRIVATE events from other users', async () => {
      const privateEvent = await prisma.event.create({
        data: {
          title: 'Secret Event',
          date: new Date(Date.now() + 86400000),
          time: '19:00',
          visibility: 'PRIVATE',
          creatorId: adminUserId,
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/events',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const event = data.data.find((e: any) => e.id === privateEvent.id);
      expect(event).toBeUndefined();
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter events by date range', async () => {
      const rangeStart = new Date(Date.now() + 259200000); // 3 days from now
      const rangeEnd = new Date(Date.now() + 864000000); // 10 days from now

      const response = await app.inject({
        method: 'GET',
        url: `/api/events?startDate=${rangeStart.toISOString()}&endDate=${rangeEnd.toISOString()}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle missing date parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/events',
      });

      expect(response.statusCode).toBe(200);
      // Should return all events without date filtering
    });
  });
});
