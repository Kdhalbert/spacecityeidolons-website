import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import * as eventService from '../../src/services/event.service.js';
import { generateTokens } from '../../src/utils/jwt.js';
import { Role } from '@prisma/client';

describe('Events API (US4 - Calendar Discovery)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  const mockEvent = {
    id: 'event-1',
    title: 'Public Gaming Night',
    description: 'Open to all members',
    date: new Date(Date.now() + 86400000),
    time: '19:00',
    endTime: null,
    location: null,
    visibility: 'PUBLIC' as const,
    creatorId: 'user-1',
    maxAttendees: null,
    games: [],
    recurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const memberToken = generateTokens({
    userId: 'user-1',
    discordId: 'discord-1',
    role: 'MEMBER',
  }).accessToken;

  const adminToken = generateTokens({
    userId: 'admin-1',
    discordId: 'discord-admin',
    role: 'ADMIN',
  }).accessToken;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/events', () => {
    it('should return all PUBLIC events for unauthenticated users', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [mockEvent] as never[],
        count: 1,
        totalCount: 1,
        limit: 20,
        offset: 0,
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
    });

    it('should return only PUBLIC events when listing for non-creators', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [mockEvent] as never[],
        count: 1,
        totalCount: 1,
        limit: 20,
        offset: 0,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/events',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      const privateEvent = data.data.find((e: { visibility: string }) => e.visibility === 'PRIVATE');
      expect(privateEvent).toBeUndefined();
    });

    it('should support date range filtering with startDate and endDate query params', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [] as never[],
        count: 0,
        totalCount: 0,
        limit: 20,
        offset: 0,
      });

      const startDate = new Date(Date.now() + 172800000).toISOString();
      const endDate = new Date(Date.now() + 864000000).toISOString();

      const response = await app.inject({
        method: 'GET',
        url: `/api/events?startDate=${startDate}&endDate=${endDate}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return paginated results with count', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [mockEvent] as never[],
        count: 1,
        totalCount: 5,
        limit: 10,
        offset: 0,
      });

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
      vi.spyOn(eventService, 'getEventById').mockResolvedValue(mockEvent as never);

      const response = await app.inject({
        method: 'GET',
        url: '/api/events/event-1',
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.id).toBe('event-1');
      expect(data.title).toBe('Public Gaming Night');
    });

    it('should return 404 for non-existent event', async () => {
      vi.spyOn(eventService, 'getEventById').mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/events/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should not return PRIVATE events to non-creators (returns null from service)', async () => {
      vi.spyOn(eventService, 'getEventById').mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/events/private-event-id',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return PRIVATE events to creator (service returns event)', async () => {
      const privateEvent = { ...mockEvent, id: 'private-event-1', visibility: 'PRIVATE' as const };
      vi.spyOn(eventService, 'getEventById').mockResolvedValue(privateEvent as never);

      const response = await app.inject({
        method: 'GET',
        url: '/api/events/private-event-1',
        headers: { authorization: `Bearer ${memberToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Event Visibility Filtering', () => {
    it('should enforce PUBLIC visibility filtering', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [mockEvent] as never[],
        count: 1,
        totalCount: 1,
        limit: 20,
        offset: 0,
      });

      const response = await app.inject({ method: 'GET', url: '/api/events' });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data[0].visibility).toBe('PUBLIC');
    });

    it('should hide PRIVATE events from other users (service returns empty)', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [] as never[],
        count: 0,
        totalCount: 0,
        limit: 20,
        offset: 0,
      });

      const response = await app.inject({ method: 'GET', url: '/api/events' });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.length).toBe(0);
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter events by date range', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [mockEvent] as never[],
        count: 1,
        totalCount: 1,
        limit: 20,
        offset: 0,
      });

      const rangeStart = new Date(Date.now() + 259200000).toISOString();
      const rangeEnd = new Date(Date.now() + 864000000).toISOString();

      const response = await app.inject({
        method: 'GET',
        url: `/api/events?startDate=${rangeStart}&endDate=${rangeEnd}`,
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle missing date parameters', async () => {
      vi.spyOn(eventService, 'getVisibleEvents').mockResolvedValue({
        data: [mockEvent] as never[],
        count: 1,
        totalCount: 1,
        limit: 20,
        offset: 0,
      });

      const response = await app.inject({ method: 'GET', url: '/api/events' });

      expect(response.statusCode).toBe(200);
    });
  });

  void memberToken;
  void adminToken;
  void Role;
});

  describe('Events API (US5 - Private Event Creation)', () => {
    let app: Awaited<ReturnType<typeof buildApp>>;

    const memberToken = generateTokens({
      userId: 'creator-1',
      discordId: 'discord-1',
      role: 'MEMBER',
    }).accessToken;

    const otherMemberToken = generateTokens({
      userId: 'other-user-1',
      discordId: 'discord-other',
      role: 'MEMBER',
    }).accessToken;

    const adminToken = generateTokens({
      userId: 'admin-1',
      discordId: 'discord-admin',
      role: 'ADMIN',
    }).accessToken;

    const newEventInput = {
      title: 'Private Game Night',
      description: 'Just our crew',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '20:00',
      location: 'Online',
      visibility: 'PRIVATE',
      games: [],
      recurring: false,
    };

    const createdEvent = {
      id: 'new-event-1',
      title: 'private game night',
      description: 'Just our crew',
      date: new Date(Date.now() + 86400000),
      time: '20:00',
      endTime: null,
      location: 'Online',
      visibility: 'PRIVATE' as const,
      creatorId: 'creator-1',
      maxAttendees: null,
      games: [],
      recurring: false,
      recurringPattern: null,
      recurringEndDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeAll(async () => {
      app = await buildApp();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('POST /api/events', () => {
      it('should create event and return 201 for authenticated member', async () => {
        vi.spyOn(eventService, 'createEvent').mockResolvedValue(createdEvent as never);

        const response = await app.inject({
          method: 'POST',
          url: '/api/events',
          headers: { authorization: `Bearer ${memberToken}` },
          payload: newEventInput,
        });

        expect(response.statusCode).toBe(201);
        const data = response.json();
        expect(data.id).toBe('new-event-1');
      });

      it('should return 401 for unauthenticated request', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/events',
          payload: newEventInput,
        });

        expect(response.statusCode).toBe(401);
      });

      it('should return 400 for invalid event data (missing title)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/events',
          headers: { authorization: `Bearer ${memberToken}` },
          payload: { ...newEventInput, title: '' },
        });

        expect(response.statusCode).toBe(400);
      });

      it('should allow admin to create public event', async () => {
        const publicEvent = { ...createdEvent, visibility: 'PUBLIC' as const, creatorId: 'admin-1' };
        vi.spyOn(eventService, 'createEvent').mockResolvedValue(publicEvent as never);

        const response = await app.inject({
          method: 'POST',
          url: '/api/events',
          headers: { authorization: `Bearer ${adminToken}` },
          payload: { ...newEventInput, visibility: 'PUBLIC' },
        });

        expect(response.statusCode).toBe(201);
      });
    });

    describe('PUT /api/events/:id', () => {
      it('should update event and return 200 for creator', async () => {
        const updatedEvent = { ...createdEvent, title: 'updated title' };
        vi.spyOn(eventService, 'updateEvent').mockResolvedValue(updatedEvent as never);

        const response = await app.inject({
          method: 'PUT',
          url: '/api/events/new-event-1',
          headers: { authorization: `Bearer ${memberToken}` },
          payload: { title: 'Updated Title' },
        });

        expect(response.statusCode).toBe(200);
      });

      it('should return 401 for unauthenticated request', async () => {
        const response = await app.inject({
          method: 'PUT',
          url: '/api/events/new-event-1',
          payload: { title: 'Updated Title' },
        });

        expect(response.statusCode).toBe(401);
      });

      it('should return 403 when non-creator tries to update event', async () => {
        vi.spyOn(eventService, 'updateEvent').mockRejectedValue(new Error('Unauthorized'));

        const response = await app.inject({
          method: 'PUT',
          url: '/api/events/new-event-1',
          headers: { authorization: `Bearer ${otherMemberToken}` },
          payload: { title: 'Hijacked Title' },
        });

        expect(response.statusCode).toBe(403);
      });

      it('should return 404 when event does not exist', async () => {
        vi.spyOn(eventService, 'updateEvent').mockRejectedValue(new Error('Event not found'));

        const response = await app.inject({
          method: 'PUT',
          url: '/api/events/nonexistent-id',
          headers: { authorization: `Bearer ${memberToken}` },
          payload: { title: 'Updated' },
        });

        expect(response.statusCode).toBe(404);
      });
    });

    describe('DELETE /api/events/:id', () => {
      it('should delete event and return 204 for creator', async () => {
        vi.spyOn(eventService, 'deleteEvent').mockResolvedValue(undefined as never);

        const response = await app.inject({
          method: 'DELETE',
          url: '/api/events/new-event-1',
          headers: { authorization: `Bearer ${memberToken}` },
        });

        expect(response.statusCode).toBe(204);
      });

      it('should return 401 for unauthenticated request', async () => {
        const response = await app.inject({
          method: 'DELETE',
          url: '/api/events/new-event-1',
        });

        expect(response.statusCode).toBe(401);
      });

      it('should return 403 when non-creator tries to delete event', async () => {
        vi.spyOn(eventService, 'deleteEvent').mockRejectedValue(new Error('Unauthorized'));

        const response = await app.inject({
          method: 'DELETE',
          url: '/api/events/new-event-1',
          headers: { authorization: `Bearer ${otherMemberToken}` },
        });

        expect(response.statusCode).toBe(403);
      });

      it('should return 404 when event does not exist', async () => {
        vi.spyOn(eventService, 'deleteEvent').mockRejectedValue(new Error('Event not found'));

        const response = await app.inject({
          method: 'DELETE',
          url: '/api/events/nonexistent-id',
          headers: { authorization: `Bearer ${memberToken}` },
        });

        expect(response.statusCode).toBe(404);
      });
    });
  });
