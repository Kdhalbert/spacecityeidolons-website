import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { gamesService } from '../services/games.service.js';

interface GameParams {
  id: string;
}

interface GamesQuerystring {
  category?: string;
  limit?: string;
  offset?: string;
}

/**
 * Register game discovery routes
 * T159: Implement GET /api/games endpoint with multiple routes
 */
export async function registerGameRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/games
   * Get all games with optional filters
   * Query params:
   * - category: Filter by game category
   * - limit: Results per page (default: 50)
   * - offset: Pagination offset (default: 0)
   */
  fastify.get<{ Querystring: GamesQuerystring }>(
    '/api/games',
    async (request: FastifyRequest<{ Querystring: GamesQuerystring }>, reply: FastifyReply) => {
      try {
        const category = request.query.category;
        const limit = parseInt(request.query.limit || '50', 10);
        const offset = parseInt(request.query.offset || '0', 10);

        const result = await gamesService.getGames(category, limit, offset);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch games',
        });
      }
    }
  );

  /**
   * GET /api/games/:id
   * Get a specific game by ID
   */
  fastify.get<{ Params: GameParams }>(
    '/api/games/:id',
    async (request: FastifyRequest<{ Params: GameParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const game = await gamesService.getGameById(id);

        if (!game) {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Game not found',
          });
        }

        return reply.send(game);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch game',
        });
      }
    }
  );

  /**
   * GET /api/games/search/:query
   * Search games by name or slug
   * Query params:
   * - limit: Maximum results (default: 20)
   */
  fastify.get<{ Params: { query: string }; Querystring: { limit?: string } }>(
    '/api/games/search/:query',
    async (request: FastifyRequest<{ Params: { query: string }; Querystring: { limit?: string } }>, reply: FastifyReply) => {
      try {
        const { query } = request.params;
        const limit = parseInt(request.query.limit || '20', 10);

        const games = await gamesService.searchGames(query, limit);
        return reply.send({ data: games, count: games.length });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to search games',
        });
      }
    }
  );

  /**
   * GET /api/games/categories
   * Get all unique game categories
   */
  fastify.get(
    '/api/games/categories',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const categories = await gamesService.getCategories();
        return reply.send({ data: categories });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch categories',
        });
      }
    }
  );

  /**
   * GET /api/games/tags
   * Get all unique game tags
   */
  fastify.get(
    '/api/games/tags',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tags = await gamesService.getTags();
        return reply.send({ data: tags });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch tags',
        });
      }
    }
  );

  /**
   * GET /api/games/selection
   * Get games for selection (minimal data)
   * Used by frontend game selector component
   */
  fastify.get(
    '/api/games/selection',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const games = await gamesService.getGamesForSelection(100);
        return reply.send({ data: games });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch games for selection',
        });
      }
    }
  );
}
