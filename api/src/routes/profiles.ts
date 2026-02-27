import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { profileService } from '../services/profile.service.js';
import { authenticate, requireAdmin, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { profileUpdateSchema } from '../schemas/profile.schema.js';
import type { Role } from '@prisma/client';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface GetProfileParams {
  userId: string;
}

export async function registerProfileRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/profiles/:userId
   * Get a specific user's profile with privacy filtering
   * Access: Public (with privacy filtering applied)
   */
  fastify.get<{ Params: GetProfileParams }>(
    '/api/profiles/:userId',
    { preHandler: optionalAuthenticate },
    async (request: FastifyRequest<{ Params: GetProfileParams }>, reply: FastifyReply) => {
      try {
        const { userId } = request.params;

        // Get viewer info
        const user = request.user as any;
        const viewerUserId = user?.userId;
        const viewerRole = user?.role as Role | undefined;

        const profile = await profileService.getProfileByUserId(
          userId,
          viewerUserId,
          viewerRole
        );

        if (!profile) {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Profile not found',
          });
        }

        return reply.code(200).send({
          data: profile,
          _filtered: viewerUserId !== userId,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch profile',
        });
      }
    }
  );

  /**
   * PUT /api/profiles/:userId
   * Update a user's profile
   * Access: Owner (user can only edit own) or Admin (can edit any)
   */
  fastify.put<{ Params: GetProfileParams; Body: any }>(
    '/api/profiles/:userId',
    { preHandler: authenticate },
    async (request: FastifyRequest<{ Params: GetProfileParams; Body: any }>, reply: FastifyReply) => {
      try {
        const { userId } = request.params;
        const user = request.user as any;
        const viewerUserId = user?.userId;
        const viewerRole = user?.role as Role;

        // Authorization check: user can only edit own profile, admins can edit any
        if (viewerUserId !== userId && viewerRole !== 'ADMIN') {
          return reply.code(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'You can only edit your own profile',
          });
        }

        // Validate request body
        const validationResult = profileUpdateSchema.safeParse(request.body);
        if (!validationResult.success) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid profile data',
            details: validationResult.error.flatten().fieldErrors,
          });
        }

        const updatedProfile = await profileService.updateProfile(
          userId,
          validationResult.data
        );

        return reply.code(200).send({
          data: updatedProfile,
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to update profile',
        });
      }
    }
  );

  /**
   * GET /api/profiles
   * Get all profiles with privacy filtering
   * Access: Public (with privacy filtering applied)
   * Query params:
   * - game: Filter by game played
   * - search: Search by display name
   */
  fastify.get<{ Querystring: any }>(
    '/api/profiles',
    { preHandler: optionalAuthenticate },
    async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
      try {
        const query = request.query as any;
        const { game, search } = query;
        const user = request.user as any;
        const viewerUserId = user?.userId;
        const viewerRole = user?.role as Role | undefined;

        let profiles;

        if (game) {
          profiles = await profileService.getProfilesByGame(game);
        } else if (search) {
          profiles = await profileService.searchProfiles(search, 50);
        } else {
          profiles = await profileService.getAllProfiles(viewerUserId, viewerRole);
        }

        return reply.code(200).send({
          data: profiles,
          count: profiles.length,
        });
      } catch (error) {
        console.error('Error fetching profiles:', error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch profiles',
        });
      }
    }
  );

  /**
   * GET /api/profiles/stats (Admin only)
   * Get profile statistics for admin dashboard
   * Access: Admin only
   */
  fastify.get(
    '/api/profiles/stats',
    { preHandler: [authenticate, requireAdmin] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = await profileService.getProfileStats();
        return reply.code(200).send(stats);
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to fetch profile statistics',
        });
      }
    }
  );
}
