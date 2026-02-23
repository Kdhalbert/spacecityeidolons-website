import { describe, it, expect } from 'vitest';
import {
  createInviteRequestSchema,
  updateInviteRequestSchema,
  inviteRequestResponseSchema,
} from '../inviteRequest.schema';
import { Platform, InviteStatus } from '../../types';

describe('InviteRequest Schema Validation', () => {
  describe('createInviteRequestSchema', () => {
    it('validates a valid Discord invite request', () => {
      const validRequest = {
        email: 'player@example.com',
        name: 'John Gamer',
        platform: Platform.DISCORD,
        message: 'I love gaming and want to join!',
      };

      const result = createInviteRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('player@example.com');
        expect(result.data.platform).toBe(Platform.DISCORD);
      }
    });

    it('validates a valid Matrix invite request', () => {
      const validRequest = {
        email: 'player@example.com',
        name: 'Jane Gamer',
        platform: Platform.MATRIX,
      };

      const result = createInviteRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('validates without optional message field', () => {
      const requestWithoutMessage = {
        email: 'player@example.com',
        name: 'Test User',
        platform: Platform.DISCORD,
      };

      const result = createInviteRequestSchema.safeParse(requestWithoutMessage);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const invalidEmail = {
        email: 'not-an-email',
        name: 'Test User',
        platform: Platform.DISCORD,
      };

      const result = createInviteRequestSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('rejects empty name', () => {
      const emptyName = {
        email: 'player@example.com',
        name: '',
        platform: Platform.DISCORD,
      };

      const result = createInviteRequestSchema.safeParse(emptyName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('rejects name that is too short', () => {
      const shortName = {
        email: 'player@example.com',
        name: 'A',
        platform: Platform.DISCORD,
      };

      const result = createInviteRequestSchema.safeParse(shortName);
      expect(result.success).toBe(false);
    });

    it('rejects invalid platform value', () => {
      const invalidPlatform = {
        email: 'player@example.com',
        name: 'Test User',
        platform: 'SLACK', // Invalid platform
      };

      const result = createInviteRequestSchema.safeParse(invalidPlatform);
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const missingFields = {
        email: 'player@example.com',
      };

      const result = createInviteRequestSchema.safeParse(missingFields);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('trims whitespace from email and name', () => {
      const withWhitespace = {
        email: '  player@example.com  ',
        name: '  Test User  ',
        platform: Platform.DISCORD,
      };

      const result = createInviteRequestSchema.safeParse(withWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('player@example.com');
        expect(result.data.name).toBe('Test User');
      }
    });

    it('rejects message that exceeds maximum length', () => {
      const longMessage = {
        email: 'player@example.com',
        name: 'Test User',
        platform: Platform.DISCORD,
        message: 'a'.repeat(1001), // Assuming 1000 char limit
      };

      const result = createInviteRequestSchema.safeParse(longMessage);
      expect(result.success).toBe(false);
    });
  });

  describe('updateInviteRequestSchema', () => {
    it('validates status update to APPROVED', () => {
      const updateToApproved = {
        status: InviteStatus.APPROVED,
      };

      const result = updateInviteRequestSchema.safeParse(updateToApproved);
      expect(result.success).toBe(true);
    });

    it('validates status update to REJECTED with admin note', () => {
      const updateToRejected = {
        status: InviteStatus.REJECTED,
        adminNote: 'Spam request',
      };

      const result = updateInviteRequestSchema.safeParse(updateToRejected);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.adminNote).toBe('Spam request');
      }
    });

    it('validates admin note without status update', () => {
      const justAdminNote = {
        adminNote: 'Following up with applicant',
      };

      const result = updateInviteRequestSchema.safeParse(justAdminNote);
      expect(result.success).toBe(true);
    });

    it('rejects invalid status value', () => {
      const invalidStatus = {
        status: 'MAYBE', // Invalid status
      };

      const result = updateInviteRequestSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    it('allows empty update object', () => {
      const emptyUpdate = {};

      const result = updateInviteRequestSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('inviteRequestResponseSchema', () => {
    it('validates a complete invite request response', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'player@example.com',
        name: 'Test User',
        platform: Platform.DISCORD,
        message: 'I want to join!',
        status: InviteStatus.PENDING,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const result = inviteRequestResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('validates response with admin note', () => {
      const responseWithNote = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'player@example.com',
        name: 'Test User',
        platform: Platform.MATRIX,
        status: InviteStatus.APPROVED,
        adminNote: 'Approved by John',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const result = inviteRequestResponseSchema.safeParse(responseWithNote);
      expect(result.success).toBe(true);
    });

    it('rejects response missing required fields', () => {
      const incomplete = {
        email: 'player@example.com',
        name: 'Test User',
        // Missing other required fields
      };

      const result = inviteRequestResponseSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('validates date fields as Date objects', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'player@example.com',
        name: 'Test User',
        platform: Platform.DISCORD,
        status: InviteStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = inviteRequestResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      }
    });
  });
});
