import { GameRequestStatus } from '@prisma/client';
import prisma from '../lib/db.js';
import type { Game } from '../schemas/games.schema.js';
import type { CreateGamePageRequestInput, GamePageRequest } from '../schemas/game-request.schema.js';

interface ListGameRequestsForAdminOptions {
  page: number;
  limit: number;
  status?: GameRequestStatus;
  search?: string;
}

interface ReviewGameRequestInput {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

interface AdminGameInput {
  name: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

interface AdminUpdateGameInput {
  name?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

/**
 * Games service - handles game-related business logic
 * T159: Implements GET /api/games endpoint with filtering
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
class GamesService {
  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private async createUniqueSlug(name: string): Promise<string> {
    const base = this.toSlug(name) || 'game';
    let candidate = base;
    let attempt = 1;

    while (true) {
      const existing = await prisma.game.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      attempt += 1;
      candidate = `${base}-${attempt}`;
    }
  }

  /**
   * Get all games with optional filtering
   */
  async getGames(
    category?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Game[]; count: number; total: number; limit: number; offset: number }> {
    const where: any = {};
    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive' as const,
      };
    }

    const total = await prisma.game.count({ where });
    const data = await prisma.game.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    });

    return {
      data: data as Game[],
      count: data.length,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get game by ID
   */
  async getGameById(id: string): Promise<Game | null> {
    const game = await prisma.game.findUnique({
      where: { id },
    });
    return game as Game | null;
  }

  /**
   * Search games by name
   */
  async searchGames(query: string, limit: number = 20): Promise<Game[]> {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive' as const,
            },
          },
          {
            slug: {
              contains: query,
              mode: 'insensitive' as const,
            },
          },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return games as Game[];
  }

  /**
   * Get games by category
   */
  async getGamesByCategory(category: string, limit: number = 50): Promise<Game[]> {
    const games = await prisma.game.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive' as const,
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return games as Game[];
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const games = await prisma.game.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });

    return games
      .map((g: any) => g.category)
      .filter((c: any): c is string => c !== null)
      .sort();
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const rows = await prisma.$queryRaw<{ tag: string | null }[]>`
      SELECT DISTINCT UNNEST(tags) AS tag
      FROM "Game"
      WHERE tags IS NOT NULL
    `;

    return rows
      .map((row) => row.tag)
      .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      .sort();
  }

  /**
   * Get game count
   */
  async getGameCount(): Promise<number> {
    return prisma.game.count();
  }

  /**
   * Check for duplicate game names across existing games and pending requests.
   */
  async hasExistingGameOrPendingRequest(gameName: string): Promise<{ hasDuplicate: boolean; reason?: string }> {
    const normalizedName = gameName.trim();

    const existingGame = await prisma.game.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (existingGame) {
      return {
        hasDuplicate: true,
        reason: 'A game with this name already exists',
      };
    }

    const pendingRequest = await prisma.gamePageRequest.findFirst({
      where: {
        gameName: {
          equals: normalizedName,
          mode: 'insensitive',
        },
        status: GameRequestStatus.PENDING,
      },
      select: { id: true },
    });

    if (pendingRequest) {
      return {
        hasDuplicate: true,
        reason: 'A pending request already exists for this game',
      };
    }

    return { hasDuplicate: false };
  }

  /**
   * Create a member game page request.
   */
  async createGameRequest(requesterId: string, input: CreateGamePageRequestInput): Promise<GamePageRequest> {
    const request = await prisma.gamePageRequest.create({
      data: {
        requesterId,
        gameName: input.gameName.trim(),
        description: input.description?.trim() || null,
        reason: input.reason.trim(),
        status: GameRequestStatus.PENDING,
      },
    });

    return request as GamePageRequest;
  }

  /**
   * Return game page requests created by a specific user.
   */
  async getGameRequestsByRequester(requesterId: string): Promise<GamePageRequest[]> {
    const requests = await prisma.gamePageRequest.findMany({
      where: { requesterId },
      orderBy: { createdAt: 'desc' },
    });

    return requests as GamePageRequest[];
  }

  async listGameRequestsForAdmin(options: ListGameRequestsForAdminOptions) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { gameName: { contains: search, mode: 'insensitive' as const } },
              { reason: { contains: search, mode: 'insensitive' as const } },
              { requester: { discordUsername: { contains: search, mode: 'insensitive' as const } } },
              { requester: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.gamePageRequest.count({ where }),
      prisma.gamePageRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true,
              discordUsername: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async reviewGameRequest(requestId: string, input: ReviewGameRequestInput) {
    const request = await prisma.gamePageRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Game request not found');
    }

    if (request.status !== GameRequestStatus.PENDING) {
      throw new Error('Game request is no longer pending');
    }

    if (input.status === GameRequestStatus.REJECTED) {
      return prisma.gamePageRequest.update({
        where: { id: requestId },
        data: {
          status: GameRequestStatus.REJECTED,
          adminNote: input.adminNote?.trim() || null,
        },
        include: {
          requester: {
            select: {
              id: true,
              discordUsername: true,
              email: true,
            },
          },
        },
      });
    }

    const existingGame = await prisma.game.findFirst({
      where: {
        name: {
          equals: request.gameName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (!existingGame) {
      const slug = await this.createUniqueSlug(request.gameName);
      await prisma.game.create({
        data: {
          name: request.gameName,
          slug,
          description: request.description || `Community-requested page for ${request.gameName}.`,
          content: [
            `# ${request.gameName}`,
            '',
            '## Overview',
            request.description || 'This page was generated from an approved community request.',
            '',
            '## Community Notes',
            request.reason,
          ].join('\n'),
          tags: [],
        },
      });
    }

    return prisma.gamePageRequest.update({
      where: { id: requestId },
      data: {
        status: GameRequestStatus.APPROVED,
        adminNote: input.adminNote?.trim() || null,
      },
      include: {
        requester: {
          select: {
            id: true,
            discordUsername: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get games for selection (minimal data)
   * Used by profile/game selector component
   */
  async getGamesForSelection(limit: number = 100): Promise<Array<{ id: string; name: string; category: string | null }>> {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        name: true,
        category: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return games;
  }

  async createGameAsAdmin(input: AdminGameInput): Promise<Game> {
    const normalizedName = input.name.trim();
    const duplicate = await prisma.game.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new Error('Game already exists');
    }

    const slug = await this.createUniqueSlug(normalizedName);
    const created = await prisma.game.create({
      data: {
        name: normalizedName,
        slug,
        description: input.description?.trim() || null,
        content: input.content?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        category: input.category?.trim() || null,
        tags: input.tags || [],
      },
    });

    return created as Game;
  }

  async updateGameAsAdmin(gameId: string, input: AdminUpdateGameInput): Promise<Game> {
    const existing = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw new Error('Game not found');
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      content?: string | null;
      imageUrl?: string | null;
      category?: string | null;
      tags?: string[];
    } = {};

    if (input.name !== undefined) {
      const normalizedName = input.name.trim();
      if (!normalizedName) {
        throw new Error('Game name is required');
      }

      const duplicateByName = await prisma.game.findFirst({
        where: {
          id: { not: gameId },
          name: {
            equals: normalizedName,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      if (duplicateByName) {
        throw new Error('Game already exists');
      }

      updateData.name = normalizedName;
      updateData.slug = await this.createUniqueSlug(normalizedName);
    }

    if (input.description !== undefined) updateData.description = input.description.trim() || null;
    if (input.content !== undefined) updateData.content = input.content.trim() || null;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim() || null;
    if (input.category !== undefined) updateData.category = input.category.trim() || null;
    if (input.tags !== undefined) updateData.tags = input.tags;

    const updated = await prisma.game.update({
      where: { id: gameId },
      data: updateData,
    });

    return updated as Game;
  }

  async deleteGameAsAdmin(gameId: string): Promise<void> {
    const existing = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('Game not found');
    }

    await prisma.game.delete({ where: { id: gameId } });
  }
}

export const gamesService = new GamesService();
