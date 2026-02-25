import { describe, it, expect, beforeEach, vi } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticate, requireAdmin } from '../../../src/middleware/auth.middleware.js';
import { generateTokens } from '../../../src/utils/jwt.js';
import { Role } from '@prisma/client';
import type { FastifyRequest, FastifyReply } from 'fastify';

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let replyStatusSpy: ReturnType<typeof vi.fn>;
    let replySendSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      replyStatusSpy = vi.fn().mockReturnThis();
      replySendSpy = vi.fn().mockReturnThis();

      mockRequest = {
        headers: {},
      };

      mockReply = {
        status: replyStatusSpy,
        send: replySendSpy,
      };
    });

    it('should authenticate valid JWT token', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        discordId: '123456',
        role: Role.MEMBER,
      };

      const { accessToken } = generateTokens(payload);

      mockRequest.headers = {
        authorization: `Bearer ${accessToken}`,
      };

      await authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      // Should not call reply.status or reply.send (authentication successful)
      expect(replyStatusSpy).not.toHaveBeenCalled();
      expect(replySendSpy).not.toHaveBeenCalled();

      // Should attach user to request
      expect(mockRequest.user).toBeDefined();
      expect((mockRequest.user as any).userId).toBe(payload.userId);
      expect((mockRequest.user as any).role).toBe(payload.role);
    });

    it('should reject request with missing authorization header', async () => {
      await authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({
        statusCode: 401,
        error: 'Unauthorized',
        message: expect.stringContaining('Authentication required'),
      });
    });

    it('should reject request with malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      await authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({
        statusCode: 401,
        error: 'Unauthorized',
        message: expect.any(String),
      });
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      await authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({
        statusCode: 401,
        error: 'Unauthorized',
        message: expect.any(String),
      });
    });

    it('should reject expired token', async () => {
      // Note: Testing expired tokens would require either:
      // 1. Mocking jwt.sign to create expired token
      // 2. Or creating token with very short expiry and waiting
      // This test is a placeholder for that functionality
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await authenticate(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({
        statusCode: 401,
        error: 'Unauthorized',
        message: expect.any(String),
      });
    });
  });

  describe('requireAdmin', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let replyStatusSpy: ReturnType<typeof vi.fn>;
    let replySendSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      replyStatusSpy = vi.fn().mockReturnThis();
      replySendSpy = vi.fn().mockReturnThis();

      mockRequest = {};

      mockReply = {
        status: replyStatusSpy,
        send: replySendSpy,
      };
    });

    it('should allow admin user', async () => {
      mockRequest.user = {
        userId: 'admin-user-id',
        email: 'admin@example.com',
        discordId: '123456',
        role: Role.ADMIN,
      };

      await requireAdmin(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      // Should not call reply.status or reply.send (authorization successful)
      expect(replyStatusSpy).not.toHaveBeenCalled();
      expect(replySendSpy).not.toHaveBeenCalled();
    });

    it('should reject non-admin user', async () => {
      mockRequest.user = {
        userId: 'member-user-id',
        email: 'member@example.com',
        discordId: '123456',
        role: Role.MEMBER,
      };

      await requireAdmin(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(replyStatusSpy).toHaveBeenCalledWith(403);
      expect(replySendSpy).toHaveBeenCalledWith({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Admin access required',
      });
    });

    it('should reject request with no user', async () => {
      await requireAdmin(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(replyStatusSpy).toHaveBeenCalledWith(403);
      expect(replySendSpy).toHaveBeenCalledWith({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Admin access required',
      });
    });
  });
});
