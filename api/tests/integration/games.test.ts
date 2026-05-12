import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { gamesService } from '../../src/services/games.service.js';

describe('Games API (US6)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a paginated game list', async () => {
    vi.spyOn(gamesService, 'getGames').mockResolvedValue({
      data: [
        {
          id: 'game-1',
          name: 'Monster Hunter Wilds',
          slug: 'monster-hunter-wilds',
          description: null,
          content: null,
          imageUrl: null,
          category: 'Action RPG',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      count: 1,
      total: 1,
      limit: 50,
      offset: 0,
    } as never);

    const response = await app.inject({ method: 'GET', url: '/api/games' });

    expect(response.statusCode).toBe(200);
    expect(response.json().count).toBe(1);
  });

  it('returns a single game by id', async () => {
    vi.spyOn(gamesService, 'getGameById').mockResolvedValue({
      id: 'game-1',
      name: 'Monster Hunter Wilds',
      slug: 'monster-hunter-wilds',
      description: null,
      content: null,
      imageUrl: null,
      category: 'Action RPG',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await app.inject({ method: 'GET', url: '/api/games/game-1' });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe('game-1');
  });
});
