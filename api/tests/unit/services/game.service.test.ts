import { describe, it, expect, beforeEach, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  game: {
    findFirst: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  gamePageRequest: {
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
}));

vi.mock('../../../src/lib/db.js', () => ({
  default: prismaMock,
}));

import { gamesService } from '../../../src/services/games.service.js';

describe('GamesService duplicate detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects duplicate when game name already exists', async () => {
    prismaMock.game.findFirst.mockResolvedValue({ id: 'game-1', name: 'Helldivers 2' });

    const result = await gamesService.hasExistingGameOrPendingRequest('Helldivers 2');

    expect(result.hasDuplicate).toBe(true);
    expect(result.reason).toContain('already exists');
  });

  it('detects duplicate when pending request exists', async () => {
    prismaMock.game.findFirst.mockResolvedValue(null);
    prismaMock.gamePageRequest.findFirst.mockResolvedValue({ id: 'req-1', gameName: 'Helldivers 2' });

    const result = await gamesService.hasExistingGameOrPendingRequest('Helldivers 2');

    expect(result.hasDuplicate).toBe(true);
    expect(result.reason).toContain('pending request');
  });

  it('allows request when no duplicates are found', async () => {
    prismaMock.game.findFirst.mockResolvedValue(null);
    prismaMock.gamePageRequest.findFirst.mockResolvedValue(null);

    const result = await gamesService.hasExistingGameOrPendingRequest('Helldivers 2');

    expect(result).toEqual({ hasDuplicate: false });
  });
});
