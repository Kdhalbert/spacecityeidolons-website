import { describe, it, expect } from 'vitest';
import { profileUpdateSchema } from '../../../src/schemas/profile.schema.js';

describe('profileUpdateSchema', () => {
  it('accepts valid profile update payload', () => {
    const result = profileUpdateSchema.safeParse({
      displayName: 'Player One',
      bio: 'I play tactical shooters',
      twitchUrl: 'https://twitch.tv/playerone',
      gamesPlayed: ['Valorant', 'Apex Legends'],
      location: 'Houston, TX',
      timezone: 'America/Chicago',
      privacyProfile: false,
      privacyEvents: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid twitch URL', () => {
    const result = profileUpdateSchema.safeParse({
      twitchUrl: 'https://youtube.com/playerone',
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty twitch URL', () => {
    const result = profileUpdateSchema.safeParse({
      twitchUrl: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects more than 20 games', () => {
    const games = Array.from({ length: 21 }, (_, idx) => `Game-${idx + 1}`);

    const result = profileUpdateSchema.safeParse({
      gamesPlayed: games,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid timezone format', () => {
    const result = profileUpdateSchema.safeParse({
      timezone: 'not/a/timezone?',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid timezone format', () => {
    const result = profileUpdateSchema.safeParse({
      timezone: 'America/Chicago',
    });

    expect(result.success).toBe(true);
  });
});
