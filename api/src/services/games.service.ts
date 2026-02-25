import prisma from '../lib/db.js';
import type { Game } from '../schemas/games.schema.js';

/**
 * Games service - handles game-related business logic
 * T159: Implements GET /api/games endpoint with filtering
 */
class GamesService {
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
}

export const gamesService = new GamesService();
