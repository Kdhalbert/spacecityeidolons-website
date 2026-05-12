import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { profileService } from '../../src/services/profile.service.js';
import { generateTokens } from '../../src/utils/jwt.js';

describe('Profile Endpoints', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    displayName: 'Test User',
    bio: 'A profile bio',
    twitchUrl: 'https://twitch.tv/testuser',
    gamesPlayed: ['Valorant'],
    avatarUrl: null,
    location: 'Houston, TX',
    timezone: 'America/Chicago',
    privacyProfile: false,
    privacyEvents: false,
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

  describe('GET /api/profiles/:userId', () => {
    it('returns profile data when profile exists', async () => {
      vi.spyOn(profileService, 'getProfileByUserId').mockResolvedValue(mockProfile as never);

      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/user-1',
      });

      expect(response.statusCode).toBe(200);
      const payload = response.json();
      expect(payload.data.userId).toBe('user-1');
      expect(payload._filtered).toBe(true);
    });

    it('returns 404 when profile does not exist', async () => {
      vi.spyOn(profileService, 'getProfileByUserId').mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles/unknown-user',
      });

      expect(response.statusCode).toBe(404);
      const payload = response.json();
      expect(payload.message).toBe('Profile not found');
    });
  });

  describe('PUT /api/profiles/:userId', () => {
    it('returns 401 when unauthenticated', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-1',
        payload: {
          displayName: 'New Name',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 403 when member updates another user profile', async () => {
      const token = generateTokens({
        userId: 'user-2',
        discordId: 'discord-2',
        role: 'MEMBER',
      }).accessToken;

      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-1',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          displayName: 'Not Allowed',
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json().message).toBe('You can only edit your own profile');
    });

    it('allows owner to update profile', async () => {
      vi.spyOn(profileService, 'updateProfile').mockResolvedValue({
        ...mockProfile,
        displayName: 'Updated Name',
      } as never);

      const token = generateTokens({
        userId: 'user-1',
        discordId: 'discord-1',
        role: 'MEMBER',
      }).accessToken;

      const response = await app.inject({
        method: 'PUT',
        url: '/api/profiles/user-1',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          displayName: 'Updated Name',
          twitchUrl: 'https://twitch.tv/newname',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.displayName).toBe('Updated Name');
      expect(profileService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ displayName: 'Updated Name' })
      );
    });
  });

  describe('GET /api/profiles', () => {
    it('returns all profiles when no query filter is provided', async () => {
      vi.spyOn(profileService, 'getAllProfiles').mockResolvedValue([mockProfile] as never);

      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().count).toBe(1);
      expect(profileService.getAllProfiles).toHaveBeenCalled();
    });

    it('applies game filter when game query is present', async () => {
      vi.spyOn(profileService, 'getProfilesByGame').mockResolvedValue([mockProfile] as never);

      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles?game=Valorant',
      });

      expect(response.statusCode).toBe(200);
      expect(profileService.getProfilesByGame).toHaveBeenCalledWith('Valorant');
    });

    it('applies search filter when search query is present', async () => {
      vi.spyOn(profileService, 'searchProfiles').mockResolvedValue([mockProfile] as never);

      const response = await app.inject({
        method: 'GET',
        url: '/api/profiles?search=test',
      });

      expect(response.statusCode).toBe(200);
      expect(profileService.searchProfiles).toHaveBeenCalledWith('test', 50);
    });
  });
});
