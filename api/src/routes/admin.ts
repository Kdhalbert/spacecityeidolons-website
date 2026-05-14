import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { GameRequestStatus } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { userService } from '../services/user.service.js';
import { gamesService } from '../services/games.service.js';
import { Role, UserStatus } from '../types/index.js';

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

const listGameRequestsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(GameRequestStatus).optional(),
  search: z.string().optional(),
});

const reviewGameRequestSchema = z.object({
  status: z.enum([GameRequestStatus.APPROVED, GameRequestStatus.REJECTED]),
  adminNote: z.string().max(1000).optional(),
});

interface UserParams {
  id: string;
}

interface ListUsersQuerystring {
  page?: string;
  limit?: string;
  role?: Role;
  status?: UserStatus;
  search?: string;
}

interface ListGameRequestsQuerystring {
  page?: string;
  limit?: string;
  status?: GameRequestStatus;
  search?: string;
}

const adminPreHandler = [authenticate, requireAdmin];

export async function registerAdminRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/admin/users
   * List all users with pagination and optional filters (admin only)
   */
  fastify.get<{ Querystring: ListUsersQuerystring }>(
    '/api/admin/users',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest<{ Querystring: ListUsersQuerystring }>, reply: FastifyReply) => {
      const { page, limit, role, status, search } = request.query;

      // Validate pagination inputs
      const parsedPage = page ? parseInt(page, 10) : 1;
      const parsedLimit = limit ? parseInt(limit, 10) : 20;
      
      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'page must be a positive integer',
        });
      }
      if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'limit must be a positive integer between 1 and 100',
        });
      }

      const result = await userService.list({
        page: parsedPage,
        limit: parsedLimit,
        role,
        status,
        search,
      });

      return reply.code(200).send(result);
    }
  );

  /**
   * GET /api/admin/users/:id
   * Get a single user by ID (admin only)
   */
  fastify.get<{ Params: UserParams }>(
    '/api/admin/users/:id',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
      const user = await userService.getById(request.params.id);

      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.code(200).send(user);
    }
  );

  /**
   * PATCH /api/admin/users/:id/role
   * Assign a role to a user (admin only)
   */
  fastify.patch<{ Params: UserParams; Body: { role: Role } }>(
    '/api/admin/users/:id/role',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest<{ Params: UserParams; Body: { role: Role } }>, reply: FastifyReply) => {
      const parsed = updateRoleSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.errors[0]?.message ?? 'Invalid role',
        });
      }

      try {
        const user = await userService.updateRole(request.params.id, parsed.data.role);
        return reply.code(200).send(user);
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: error.message });
        }
        throw error;
      }
    }
  );

  /**
   * PATCH /api/admin/users/:id/status
   * Update a user's status (activate, suspend, ban) (admin only)
   */
  fastify.patch<{ Params: UserParams; Body: { status: UserStatus } }>(
    '/api/admin/users/:id/status',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest<{ Params: UserParams; Body: { status: UserStatus } }>, reply: FastifyReply) => {
      const parsed = updateStatusSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.errors[0]?.message ?? 'Invalid status',
        });
      }

      try {
        const user = await userService.updateStatus(request.params.id, parsed.data.status);
        return reply.code(200).send(user);
      } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
          return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: error.message });
        }
        throw error;
      }
    }
  );

  /**
   * GET /api/admin/game-requests
   * List game page requests with pagination/filters (admin only)
   */
  fastify.get<{ Querystring: ListGameRequestsQuerystring }>(
    '/api/admin/game-requests',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest<{ Querystring: ListGameRequestsQuerystring }>, reply: FastifyReply) => {
      const parsedQuery = listGameRequestsQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid query parameters',
        });
      }

      const page = parsedQuery.data.page ? parseInt(parsedQuery.data.page, 10) : 1;
      const limit = parsedQuery.data.limit ? parseInt(parsedQuery.data.limit, 10) : 20;

      if (!Number.isInteger(page) || page < 1) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'page must be a positive integer',
        });
      }

      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'limit must be a positive integer between 1 and 100',
        });
      }

      const result = await gamesService.listGameRequestsForAdmin({
        page,
        limit,
        status: parsedQuery.data.status,
        search: parsedQuery.data.search,
      });

      return reply.code(200).send(result);
    }
  );

  /**
   * PATCH /api/admin/game-requests/:id
   * Approve or reject a game page request (admin only)
   */
  fastify.patch<{ Params: UserParams; Body: { status: GameRequestStatus; adminNote?: string } }>(
    '/api/admin/game-requests/:id',
    { preHandler: adminPreHandler },
    async (request: FastifyRequest<{ Params: UserParams; Body: { status: GameRequestStatus; adminNote?: string } }>, reply: FastifyReply) => {
      const parsed = reviewGameRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: parsed.error.errors[0]?.message ?? 'Invalid review payload',
        });
      }

      try {
        const updated = await gamesService.reviewGameRequest(request.params.id, {
          status: parsed.data.status,
          adminNote: parsed.data.adminNote,
        });
        return reply.code(200).send(updated);
      } catch (error) {
        if (error instanceof Error && error.message === 'Game request not found') {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: error.message,
          });
        }
        throw error;
      }
    }
  );
}
