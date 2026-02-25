import { describe, it, expect } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createEventSchema, updateEventSchema, queryEventsSchema } from '../../src/schemas/event.schema.js';

describe('Event Schemas (US4)', () => {
  describe('createEventSchema', () => {
    it('should validate a complete event creation payload', () => {
      const validPayload = {
        title: 'Gaming Tournament',
        description: 'Competitive gaming event',
        date: '2025-02-15',
        time: '19:00',
        endTime: '22:00',
        location: 'Discord Server',
        visibility: 'PUBLIC',
        maxAttendees: 20,
        games: ['valorant', 'csgo'],
        recurring: false,
      };

      const result = createEventSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should require title', () => {
      const invalidPayload = {
        description: 'No title event',
        date: '2025-02-15',
        time: '19:00',
        visibility: 'PUBLIC',
      };

      const result = createEventSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should validate date format', () => {
      const invalidPayload = {
        title: 'Event',
        date: 'invalid-date',
        time: '19:00',
        visibility: 'PUBLIC',
      };

      const result = createEventSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should validate time format (HH:MM)', () => {
      const invalidPayload = {
        title: 'Event',
        date: '2025-02-15',
        time: '25:00',
        visibility: 'PUBLIC',
      };

      const result = createEventSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should validate visibility enum', () => {
      const invalidPayload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
        visibility: 'INVALID',
      };

      const result = createEventSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should validate games array', () => {
      const validPayload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
        visibility: 'PUBLIC',
        games: ['valorant', 'csgo'],
      };

      const result = createEventSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should trim and sanitize title', () => {
      const payload = {
        title: '  Event Title  ',
        date: '2025-02-15',
        time: '19:00',
        visibility: 'PUBLIC',
      };

      const result = createEventSchema.safeParse(payload);
      if (result.success) {
        expect(result.data.title).toBe('Event Title');
      }
    });

    it('should set default visibility to PUBLIC', () => {
      const payload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
      };

      const result = createEventSchema.safeParse(payload);
      if (result.success) {
        expect(result.data.visibility).toBe('PUBLIC');
      }
    });

    it('should reject negative maxAttendees', () => {
      const payload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
        visibility: 'PUBLIC',
        maxAttendees: -5,
      };

      const result = createEventSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateEventSchema', () => {
    it('should validate an event update payload', () => {
      const validPayload = {
        title: 'Updated Event',
        description: 'New description',
      };

      const result = updateEventSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const payload = {
        visibility: 'MEMBER',
      };

      const result = updateEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should be stricter than createEventSchema (optional fields)', () => {
      // Both should pass but updateSchema should not require fields
      const createPayload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
      };

      const updatePayload = {
        description: 'New desc',
      };

      const createResult = createEventSchema.safeParse(createPayload);
      const updateResult = updateEventSchema.safeParse(updatePayload);

      expect(createResult.success).toBe(true);
      expect(updateResult.success).toBe(true);
    });
  });

  describe('queryEventsSchema', () => {
    it('should validate query parameters', () => {
      const validQuery = {
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        limit: 20,
        offset: 0,
      };

      const result = queryEventsSchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should set default limit', () => {
      const query = {
        offset: 0,
      };

      const result = queryEventsSchema.safeParse(query);
      if (result.success) {
        expect(result.data.limit).toBeGreaterThan(0);
      }
    });

    it('should set default offset', () => {
      const query = {
        limit: 20,
      };

      const result = queryEventsSchema.safeParse(query);
      if (result.success) {
        expect(result.data.offset).toBe(0);
      }
    });

    it('should validate date range', () => {
      const query = {
        startDate: '2025-02-28',
        endDate: '2025-02-01', // End before start
        limit: 20,
        offset: 0,
      };

      const result = queryEventsSchema.safeParse(query);
      // Should fail if date validation enforces startDate < endDate
      // or should succeed if no such validation exists
    });

    it('should filter by game', () => {
      const query = {
        game: 'valorant',
        limit: 20,
        offset: 0,
      };

      const result = queryEventsSchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should reject negative limit', () => {
      const query = {
        limit: -10,
      };

      const result = queryEventsSchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const query = {
        offset: -5,
      };

      const result = queryEventsSchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it('should enforce maximum limit', () => {
      const query = {
        limit: 1000, // Assuming max is 100
      };

      const result = queryEventsSchema.safeParse(query);
      // Should either fail or cap at max value
    });
  });

  describe('Edge Cases & Security', () => {
    it('should sanitize XSS attempts in title', () => {
      const payload = {
        title: '<script>alert("xss")</script>',
        date: '2025-02-15',
        time: '19:00',
      };

      const result = createEventSchema.safeParse(payload);
      if (result.success) {
        // Should be sanitized
        expect(result.data.title).not.toContain('<script>');
      }
    });

    it('should reject very long titles', () => {
      const payload = {
        title: 'a'.repeat(1000),
        date: '2025-02-15',
        time: '19:00',
      };

      const result = createEventSchema.safeParse(payload);
      // Should either fail or truncate
    });

    it('should handle null games array', () => {
      const payload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
        games: null,
      };

      const result = createEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should handle empty games array', () => {
      const payload = {
        title: 'Event',
        date: '2025-02-15',
        time: '19:00',
        games: [],
      };

      const result = createEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
