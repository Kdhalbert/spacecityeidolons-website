import { describe, it, expect, beforeEach, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  profile: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('../../../src/lib/db.js', () => ({
  default: prismaMock,
}));

import { profileService } from '../../../src/services/profile.service.js';

describe('ProfileService', () => {
  const baseProfile = {
    id: 'profile-1',
    userId: 'user-1',
    displayName: 'Player One',
    bio: 'private bio',
    twitchUrl: 'https://twitch.tv/playerone',
    gamesPlayed: ['Valorant', 'Apex'],
    avatarUrl: null,
    location: 'Houston',
    timezone: 'America/Chicago',
    privacyProfile: true,
    privacyEvents: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unfiltered profile when viewer is owner', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(baseProfile);

    const result = await profileService.getProfileByUserId('user-1', 'user-1', 'MEMBER');

    expect(result?.bio).toBe('private bio');
    expect(result?.location).toBe('Houston');
    expect(result?._filtered).toBeUndefined();
  });

  it('returns unfiltered profile for admins', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(baseProfile);

    const result = await profileService.getProfileByUserId('user-1', 'admin-1', 'ADMIN');

    expect(result?.bio).toBe('private bio');
    expect(result?.twitchUrl).toBe('https://twitch.tv/playerone');
    expect(result?._filtered).toBeUndefined();
  });

  it('hides private fields for guest/member viewers', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(baseProfile);

    const result = await profileService.getProfileByUserId('user-1', 'other-user', 'MEMBER');

    expect(result?.bio).toBeNull();
    expect(result?.twitchUrl).toBeNull();
    expect(result?.location).toBeNull();
    expect(result?.timezone).toBeNull();
    expect(result?._filtered).toBe(true);
  });

  it('hides sensitive fields for guests even when profile is public', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      ...baseProfile,
      privacyProfile: false,
      bio: 'public bio',
      location: 'Houston',
      timezone: 'America/Chicago',
      twitchUrl: 'https://twitch.tv/playerone',
    });

    const result = await profileService.getProfileByUserId('user-1', undefined, undefined);

    expect(result?.bio).toBeNull();
    expect(result?.twitchUrl).toBeNull();
    expect(result?.location).toBeNull();
    expect(result?.timezone).toBeNull();
    expect(result?._filtered).toBe(true);
  });

  it('creates profile if missing when user requests own profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValueOnce(null);
    prismaMock.profile.create.mockResolvedValue({
      ...baseProfile,
      userId: 'user-2',
      privacyProfile: false,
      bio: '',
      displayName: '',
      gamesPlayed: [],
    });

    const result = await profileService.getProfileByUserId('user-2', 'user-2', 'MEMBER');

    expect(prismaMock.profile.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-2',
        displayName: '',
        bio: '',
        gamesPlayed: [],
        privacyProfile: false,
        privacyEvents: false,
      },
    });
    expect(result?.userId).toBe('user-2');
  });

  it('searches profiles with case-insensitive displayName query', async () => {
    prismaMock.profile.findMany.mockResolvedValue([baseProfile]);

    await profileService.searchProfiles('player', 5);

    expect(prismaMock.profile.findMany).toHaveBeenCalledWith({
      where: {
        displayName: {
          contains: 'player',
          mode: 'insensitive',
        },
      },
      take: 5,
      orderBy: { displayName: 'asc' },
    });
  });

  it('filters profiles by game using array has query', async () => {
    prismaMock.profile.findMany.mockResolvedValue([baseProfile]);

    await profileService.getProfilesByGame('Valorant');

    expect(prismaMock.profile.findMany).toHaveBeenCalledWith({
      where: {
        gamesPlayed: {
          has: 'Valorant',
        },
      },
      orderBy: { displayName: 'asc' },
    });
  });
});
