import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { gamesService } from '../../src/services/games.service.js';
import { generateTokens } from '../../src/utils/jwt.js';

describe('Game Requests API (US6)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  const memberToken = generateTokens({
    userId: '11111111-1111-1111-1111-111111111111',
    discordId: 'discord-1',
    role: 'MEMBER',
  }).accessToken;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a game request for authenticated users', async () => {
    vi.spyOn(gamesService, 'hasExistingGameOrPendingRequest').mockResolvedValue({ hasDuplicate: false });
    vi.spyOn(gamesService, 'createGameRequest').mockResolvedValue({
      id: 'request-1',
      requesterId: '11111111-1111-1111-1111-111111111111',
      gameName: 'Helldivers 2',
      description: 'Co-op extraction shooter',
      reason: 'Our community has multiple active squads for this game.',
      status: 'PENDING',
      adminNote: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await app.inject({
      method: 'POST',
      url: '/api/game-requests',
      headers: { authorization: `Bearer ${memberToken}` },
      payload: {
        gameName: 'Helldivers 2',
        description: 'Co-op extraction shooter',
        reason: 'Our community has multiple active squads for this game.',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.data.gameName).toBe('Helldivers 2');
    expect(gamesService.createGameRequest).toHaveBeenCalled();
  });

  it('rejects duplicate game request names', async () => {
    vi.spyOn(gamesService, 'hasExistingGameOrPendingRequest').mockResolvedValue({
      hasDuplicate: true,
      reason: 'A pending request already exists for this game',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/game-requests',
      headers: { authorization: `Bearer ${memberToken}` },
      payload: {
        gameName: 'Helldivers 2',
        reason: 'Please add this title to support events and discussion.',
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().message).toContain('pending request');
  });

  it('returns only the requesting user\'s game requests', async () => {
    vi.spyOn(gamesService, 'getGameRequestsByRequester').mockResolvedValue([
      {
        id: 'request-1',
        requesterId: '11111111-1111-1111-1111-111111111111',
        gameName: 'Helldivers 2',
        description: null,
        reason: 'Need a game page',
        status: 'PENDING',
        adminNote: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never);

    const response = await app.inject({
      method: 'GET',
      url: '/api/game-requests',
      headers: { authorization: `Bearer ${memberToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().count).toBe(1);
    expect(gamesService.getGameRequestsByRequester).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
  });
});
