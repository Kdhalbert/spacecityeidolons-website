import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../src/app.js';
import { config } from '../../src/config/index.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Auth Endpoints', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/auth/discord', () => {
    it('should redirect to Discord OAuth URL', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/discord',
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBeDefined();

      const location = response.headers.location as string;
      expect(location).toContain('discord.com/api/oauth2/authorize');
    });

    it('should include correct OAuth parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/discord',
      });

      const location = response.headers.location as string;
      const url = new URL(location);

      expect(url.searchParams.get('client_id')).toBe(config.DISCORD_CLIENT_ID);
      expect(url.searchParams.get('redirect_uri')).toBe(config.DISCORD_REDIRECT_URI);
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('scope')).toBe(config.DISCORD_OAUTH_SCOPES);
    });
  });

  describe('GET /api/auth/discord/callback', () => {
    it('should return 400 when code is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/discord/callback',
      });

      expect(response.statusCode).toBe(400);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        error: expect.any(String),
      });
    });

    it('should return 400 when error parameter is present', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/discord/callback?error=access_denied',
      });

      expect(response.statusCode).toBe(400);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        error: expect.any(String),
      });
    });

    // Note: Testing successful callback with valid Discord code would require
    // mocking Discord's OAuth API or using a test OAuth server.
    // These tests will validate the error handling; implementation tests
    // will verify the full OAuth flow with mocked Discord responses.
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 when refresh token is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
      });

      expect(response.statusCode).toBe(401);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        error: expect.any(String),
      });
    });

    it('should return 401 when refresh token is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        payload: {
          refreshToken: 'invalid.token.here',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        error: expect.any(String),
      });
    });

    // Note: Testing with valid refresh token requires creating a user
    // and generating valid tokens. This will be added after auth service
    // implementation.
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
      });

      expect(response.statusCode).toBe(401);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        error: expect.any(String),
      });
    });

    it('should return 401 with invalid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      });

      expect(response.statusCode).toBe(401);
      
      const payload = JSON.parse(response.payload);
      expect(payload).toMatchObject({
        error: expect.any(String),
      });
    });

    // Note: Testing successful logout requires valid authentication.
    // This will be added after auth middleware implementation.
  });
});
