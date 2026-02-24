import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { FastifyInstance } from 'fastify';
import { generateTokens } from '../../src/utils/jwt.js';
import { Role } from '@prisma/client';
import { profileService } from '../../src/services/profile.service.js';

const BASE_PROFILE = {
  id: 'profile-uuid',
  userId: 'user-uuid',
  displayName: 'Test User',
  bio: 'A short bio',
  twitchUrl: 'https://twitch.tv/testuser',
  gamesPlayed: ['Valorant', 'Apex Legends'],
  avatarUrl: null,
  location: 'Houston, TX',
  timezone: 'America/Chicago',
  privacyProfile: false,
  privacyEvents: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const PRIVATE_PROFILE = {
  ...BASE_PROFILE,
  userId: 'private-user-uuid',
  privacyProfile: true,
  bio: null,
  twitchUrl: null,
  location: null,
  timezone: null,
  _filtered: true,
};

// Mock the profile service to avoid requiring a live database
vi.mock('../../src/services/profile.service.js', () => ({
  profileService: {
    getProfileByUserId: vi.fn(),
    getAllProfiles: vi.fn(),
    updateProfile: vi.fn(),
    getProfileStats: vi.fn(),
    searchProfiles: vi.fn(),
    getProfilesByGame: vi.fn(),
  },
}));

describe('Profiles API', () => {
  let app: FastifyInstance;
  let memberToken: string;
  let adminToken: string;
  let otherMemberToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    memberToken = generateTokens({
      userId: 'user-uuid',
      email: 'member@test.com',
      discordId: '111111',
      role: Role.MEMBER,
    }).accessToken;

    adminToken = generateTokens({
      userId: 'admin-uuid',
      email: 'admin@test.com',
      discordId: '222222',
      role: Role.ADMIN,
    }).accessToken;

    otherMemberToken = generateTokens({
      userId: 'other-user-uuid',
      email: 'other@test.com',
      discordId: '333333',
      role: Role.MEMBER,
    }).accessToken;

    // Set up default mock implementations
    vi.mocked(profileService.getProfileByUserId).mockImplementation(async (userId) => {
      if (userId === 'user-uuid') return { ...BASE_PROFILE };
      if (userId === 'private-user-uuid') return { ...PRIVATE_PROFILE };
      return null;
    });
    vi.mocked(profileService.getAllProfiles).mockResolvedValue([{ ...BASE_PROFILE }]);
    vi.mocked(profileService.updateProfile).mockImplementation(async (userId, data) => ({
      ...BASE_PROFILE,
      userId,
      ...data,
    }));
    vi.mocked(profileService.getProfileStats).mockResolvedValue({
      totalProfiles: 10,
      withBio: 7,
      withTwitchUrl: 4,
      privacyEnabledProfile: 2,
      privacyEnabledEvents: 3,
    });
    vi.mocked(profileService.searchProfiles).mockResolvedValue([{ ...BASE_PROFILE }]);
    vi.mocked(profileService.getProfilesByGame).mockResolvedValue([{ ...BASE_PROFILE }]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/profiles/:userId', () => {
    it('returns a public profile without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/user-uuid',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.userId).toBe('user-uuid');
      expect(body.displayName).toBe('Test User');
    });

    it('returns 404 for a non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/nonexistent-uuid',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Not Found');
    });

    it('returns privacy-filtered profile for anonymous viewer', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/private-user-uuid',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      // Privacy-filtered profile should not expose bio, twitchUrl, location, timezone
      expect(body.bio).toBeNull();
      expect(body.twitchUrl).toBeNull();
      expect(body.location).toBeNull();
      expect(body.timezone).toBeNull();
    });

    it('returns profile with userId and displayName even when private', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/private-user-uuid',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.userId).toBe('private-user-uuid');
    });
  });

  describe('PUT /api/profiles/:userId', () => {
    it('returns 401 when unauthenticated', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        payload: { displayName: 'New Name' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('allows the profile owner to update their own profile', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { displayName: 'Updated Name', bio: 'New bio' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.displayName).toBe('Updated Name');
      expect(body.bio).toBe('New bio');
    });

    it('returns 403 when a non-owner member tries to update another profile', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${otherMemberToken}` },
        payload: { displayName: 'Hijacked Name' },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Forbidden');
    });

    it('allows an admin to update any profile', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { displayName: 'Admin Override Name' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.displayName).toBe('Admin Override Name');
    });

    it('returns 400 when displayName exceeds 100 characters', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { displayName: 'A'.repeat(101) },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Bad Request');
      expect(body.details).toHaveProperty('displayName');
    });

    it('returns 400 when bio exceeds 500 characters', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { bio: 'B'.repeat(501) },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Bad Request');
      expect(body.details).toHaveProperty('bio');
    });

    it('returns 400 when twitchUrl has an invalid format', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { twitchUrl: 'https://youtube.com/testuser' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Bad Request');
      expect(body.details).toHaveProperty('twitchUrl');
    });

    it('accepts a valid twitch URL', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { twitchUrl: 'https://twitch.tv/mystream' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('returns 400 when gamesPlayed exceeds 20 items', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { gamesPlayed: Array.from({ length: 21 }, (_, i) => `Game ${i}`) },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Bad Request');
      expect(body.details).toHaveProperty('gamesPlayed');
    });

    it('returns 400 when timezone has an invalid format', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { timezone: 'InvalidTimezone' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Bad Request');
    });

    it('accepts valid privacy flags', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-uuid',
        headers: { authorization: `Bearer ${memberToken}` },
        payload: { privacyProfile: true, privacyEvents: true },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.privacyProfile).toBe(true);
      expect(body.privacyEvents).toBe(true);
    });
  });

  describe('GET /api/profiles', () => {
    it('returns a list of profiles without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.count).toBe('number');
    });

    it('returns count matching the data array length', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles',
      });

      const body = JSON.parse(response.payload);
      expect(body.count).toBe(body.data.length);
    });

    it('supports search query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles?search=TestUser',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(Array.isArray(body.data)).toBe(true);
      expect(vi.mocked(profileService.searchProfiles)).toHaveBeenCalledWith('TestUser', 50);
    });

    it('supports game filter query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles?game=Valorant',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(Array.isArray(body.data)).toBe(true);
      expect(vi.mocked(profileService.getProfilesByGame)).toHaveBeenCalledWith('Valorant');
    });
  });

  describe('GET /api/profiles/stats', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 403 for non-admin authenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
        headers: { authorization: `Bearer ${memberToken}` },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload);
      expect(body.message).toContain('Admin access required');
    });

    it('returns stats for admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('totalProfiles');
      expect(body).toHaveProperty('withBio');
      expect(body).toHaveProperty('withTwitchUrl');
      expect(body).toHaveProperty('privacyEnabledProfile');
      expect(body).toHaveProperty('privacyEnabledEvents');
    });

    it('returns numeric stats values', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/stats',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const body = JSON.parse(response.payload);
      expect(typeof body.totalProfiles).toBe('number');
      expect(typeof body.withBio).toBe('number');
      expect(typeof body.withTwitchUrl).toBe('number');
    });
  });
});
