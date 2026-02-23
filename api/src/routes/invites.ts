import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { inviteRequestService } from '../services/inviteRequest.service.js';
import {
  createInviteRequestSchema,
  updateInviteRequestSchema,
} from '../schemas/inviteRequest.schema.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { Platform, InviteStatus } from '../../../src/types/index.js';

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
      } catch (error) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Invite request not found',
        });
      }
    }
  );
}
