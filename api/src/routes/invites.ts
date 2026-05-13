import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { inviteRequestService } from '../services/inviteRequest.service.js';
import {
  createInviteRequestSchema,
  createMemberRequestSchema,
  updateInviteRequestSchema,
} from '../schemas/inviteRequest.schema.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { Platform, InviteStatus } from '../types/index.js';

interface CreateInviteRequestBody {
  email: string;
  name: string;
  platform: Platform;
  message?: string;
}

interface UpdateInviteRequestBody {
  status?: InviteStatus;
  adminNote?: string;
}

interface CreateMemberRequestBody {
  email?: string;
  name?: string;
  message?: string;
}

interface InviteRequestParams {
  id: string;
}

interface ListInviteRequestsQuerystring {
  page?: string;
  limit?: string;
  status?: InviteStatus;
  platform?: Platform;
}

export async function registerInviteRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/invites
   * Create a new invite request (public endpoint, no auth required)
   */
  fastify.post<{ Body: CreateInviteRequestBody }>(
    '/api/invites',
    async (request: FastifyRequest<{ Body: CreateInviteRequestBody }>, reply: FastifyReply) => {
      try {
        // Validate request body
        const validatedData = createInviteRequestSchema.parse(request.body);

        // Create invite request
        const inviteRequest = await inviteRequestService.create(validatedData);
        return reply.code(201).send(inviteRequest);
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          return reply.code(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: error.message,
          });
        }
        throw error;
      }
    }
  );

  /**
   * POST /api/invites/member-request
   * Create a member request for authenticated guest users
   */
  fastify.post<{ Body: CreateMemberRequestBody }>(
    '/api/invites/member-request',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest<{ Body: CreateMemberRequestBody }>, reply: FastifyReply) => {
      try {
        const jwtUser = request.user as { userId: string };
        const validatedData = createMemberRequestSchema.parse(request.body || {});
        const inviteRequest = await inviteRequestService.createMemberRequest(jwtUser.userId, validatedData);
        return reply.code(201).send({ data: inviteRequest });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Only guest users')) {
            return reply.code(403).send({
              statusCode: 403,
              error: 'Forbidden',
              message: error.message,
            });
          }

          if (error.message.includes('required')) {
            return reply.code(400).send({
              statusCode: 400,
              error: 'Bad Request',
              message: error.message,
            });
          }

          if (error.message.includes('already exists')) {
            return reply.code(409).send({
              statusCode: 409,
              error: 'Conflict',
              message: error.message,
            });
          }

          if (error.message.includes('User not found')) {
            return reply.code(404).send({
              statusCode: 404,
              error: 'Not Found',
              message: error.message,
            });
          }
        }

        throw error;
      }
    }
  );

  /**
   * GET /api/invites
   * List all invite requests with pagination and filtering (admin only)
   */
  fastify.get<{ Querystring: ListInviteRequestsQuerystring }>(
    '/api/invites',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest<{ Querystring: ListInviteRequestsQuerystring }>, reply: FastifyReply) => {
      const { page, limit, status, platform } = request.query;

      const result = await inviteRequestService.list({
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        status,
        platform,
      });

      return reply.code(200).send(result);
    }
  );

  /**
   * GET /api/invites/:id
   * Get a single invite request by ID (admin only)
   */
  fastify.get<{ Params: InviteRequestParams }>(
    '/api/invites/:id',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest<{ Params: InviteRequestParams }>, reply: FastifyReply) => {
      const inviteRequest = await inviteRequestService.getById(request.params.id);

      if (!inviteRequest) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Invite request not found',
        });
      }

      return reply.code(200).send(inviteRequest);
    }
  );

  /**
   * PATCH /api/invites/:id
   * Update an invite request (status, admin note) (admin only)
   */
  fastify.patch<{ Params: InviteRequestParams; Body: UpdateInviteRequestBody }>(
    '/api/invites/:id',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (
      request: FastifyRequest<{ Params: InviteRequestParams; Body: UpdateInviteRequestBody }>,
      reply: FastifyReply
    ) => {
      try {
        // Validate request body
        const validatedData = updateInviteRequestSchema.parse(request.body);

        // Update invite request
        const inviteRequest = await inviteRequestService.update(request.params.id, validatedData);

        return reply.code(200).send(inviteRequest);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
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

  /**
   * DELETE /api/invites/:id
   * Delete an invite request (admin only)
   */
  fastify.delete<{ Params: InviteRequestParams }>(
    '/api/invites/:id',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest<{ Params: InviteRequestParams }>, reply: FastifyReply) => {
      try {
        await inviteRequestService.delete(request.params.id);
        return reply.code(204).send();
      } catch {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Invite request not found',
        });
      }
    }
  );
}
