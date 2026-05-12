import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../middleware/auth.middleware.js';
import { gamesService } from '../services/games.service.js';
import { createGamePageRequestSchema } from '../schemas/game-request.schema.js';

interface CreateGameRequestBody {
  gameName: string;
  description?: string;
  reason: string;
}

export async function registerGameRequestRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateGameRequestBody }>(
    '/api/game-requests',
    { preHandler: authenticate },
    async (request: FastifyRequest<{ Body: CreateGameRequestBody }>, reply: FastifyReply) => {
      try {
        const user = request.user as { userId: string };
        const parseResult = createGamePageRequestSchema.safeParse(request.body);

        if (!parseResult.success) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid game request payload',
            details: parseResult.error.flatten().fieldErrors,
          });
        }

        const duplicate = await gamesService.hasExistingGameOrPendingRequest(parseResult.data.gameName);
        if (duplicate.hasDuplicate) {
          return reply.code(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: duplicate.reason ?? 'A game or request with this name already exists',
          });
        }

        const requestRecord = await gamesService.createGameRequest(user.userId, parseResult.data);
        return reply.code(201).send({ data: requestRecord });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to create game request',
        });
      }
    }
  );

  fastify.get(
    '/api/game-requests',
    { preHandler: authenticate },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as { userId: string };
        const requests = await gamesService.getGameRequestsByRequester(user.userId);
        return reply.code(200).send({
          data: requests,
          count: requests.length,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch game requests',
        });
      }
    }
  );
}
