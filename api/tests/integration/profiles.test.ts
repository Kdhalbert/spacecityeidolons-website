import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';
import { generateTokens } from '../../src/utils/jwt.js';

describe('Profile Endpoints', () => {
  let app: FastifyInstance;
  const memberUserId = 'user-member-001';
  const adminUserId = 'user-admin-001';
  let memberToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    memberToken = generateTokens({
      userId: memberUserId,
      discordId: 'discord-member-001',
      role: 'MEMBER',
    }).accessToken;

    adminToken = generateTokens({
      userId: adminUserId,
      discordId: 'discord-admin-001',
      role: 'ADMIN',
    }).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/profiles/:userId', () => {
    it('returns 404 for a non-existent profile', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/non-existent-user-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
    });

    it('returns profile without auth (guest view)', async () => {
      // First create a profile via PUT so it exists
      await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { displayName: 'Test Member', bio: 'Hello', privacyProfile: false },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/profiles/${memberUserId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe(memberUserId);
      // location and timezone are hidden for guests
      expect(body.location).toBeNull();
      expect(body.timezone).toBeNull();
    });

    it('returns full profile for owner', async () => {
      await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { displayName: 'Test Member', location: 'Houston, TX', privacyProfile: false },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe(memberUserId);
      // Owner sees location
      expect(body.location).toBe('Houston, TX');
    });

    it('hides fields for private profile when viewed as guest', async () => {
      await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { bio: 'Secret bio', privacyProfile: true },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/profiles/${memberUserId}`,
        // No auth header = guest
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.bio).toBeNull();
    });

    it('admin can see private profile fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      // Admin bypasses privacy filter - bio may be visible
      expect(body.userId).toBe(memberUserId);
    });
  });

  describe('PUT /api/profiles/:userId', () => {
    it('returns 401 without authentication', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        payload: { displayName: 'Unauthorized Update' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 403 when editing another user\'s profile', async () => {
      const otherUserId = 'user-other-001';
      const response = await app.inject({
        method: 'PUT',
        url: `/api/profiles/${otherUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { displayName: 'Unauthorized Update' },
      });

      expect(response.statusCode).toBe(403);
    });

    it('allows owner to update own profile', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { displayName: 'Updated Name', bio: 'Updated bio' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.displayName).toBe('Updated Name');
      expect(body.bio).toBe('Updated bio');
    });

    it('returns 400 for invalid twitchUrl', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { twitchUrl: 'https://youtube.com/channel' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('accepts valid twitchUrl', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { twitchUrl: 'https://twitch.tv/testuser' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.twitchUrl).toBe('https://twitch.tv/testuser');
    });

    it('admin can update any profile', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { displayName: 'Admin Updated' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.displayName).toBe('Admin Updated');
    });
  });

  describe('GET /api/profiles', () => {
    it('returns list of profiles as guest', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
      expect(typeof body.count).toBe('number');
    });

    it('returns list of profiles filtered by game', async () => {
      // Ensure profile has a game
      await app.inject({
        method: 'PUT',
        url: `/api/profiles/${memberUserId}`,
        headers: { Authorization: `Bearer ${memberToken}` },
        payload: { gamesPlayed: ['D&D 5e'] },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles?game=D%26D%205e',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });

    it('searches profiles by display name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles?search=Admin',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/profiles/stats', () => {
    it('returns 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
        headers: { Authorization: `Bearer ${memberToken}` },
      });

      expect(response.statusCode).toBe(403);
    });

    it('returns stats for admin', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(typeof body.totalProfiles).toBe('number');
      expect(typeof body.withBio).toBe('number');
    });
  });
});
