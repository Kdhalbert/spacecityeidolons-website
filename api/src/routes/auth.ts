import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

interface DiscordCallbackQuerystring {
  code?: string;
  error?: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

export async function registerAuthRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/auth/discord
   * Initiate Discord OAuth flow - redirects to Discord authorization page
   */
  fastify.get(
    '/api/auth/discord',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const authUrl = authService.generateDiscordAuthUrl();
      return reply.redirect(authUrl);
    }
  );

  /**
   * GET /api/auth/discord/callback
   * Handle Discord OAuth callback
   * Exchange code for tokens and create/login user
   */
  fastify.get<{ Querystring: DiscordCallbackQuerystring }>(
    '/api/auth/discord/callback',
    async (
      request: FastifyRequest<{ Querystring: DiscordCallbackQuerystring }>,
      reply: FastifyReply
    ) => {
      try {
        const { code, error } = request.query;

        // Handle OAuth error (user denied authorization)
        if (error) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: `OAuth error: ${error}`,
          });
        }

        // Validate code parameter
        if (!code) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Authorization code is required',
          });
        }

        // Complete OAuth flow and generate tokens
        const result = await authService.handleDiscordCallback(code);

        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Failed to complete OAuth flow',
        });
      }
    }
  );

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  fastify.post<{ Body: RefreshTokenBody }>(
    '/api/auth/refresh',
    async (
      request: FastifyRequest<{ Body: RefreshTokenBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { refreshToken } = request.body;

        if (!refreshToken) {
          return reply.code(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Refresh token is required',
          });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        return reply.code(200).send(result);
      } catch (error) {
        return reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: error instanceof Error ? error.message : 'Invalid refresh token',
        });
      }
    }
  );

  /**
   * POST /api/auth/logout
   * Logout user (invalidate tokens)
   * Note: With JWT, actual invalidation requires token blacklist (future enhancement)
   * For now, this endpoint just validates the token and returns success
   * Client is responsible for removing tokens from storage
   */
  fastify.post(
    '/api/auth/logout',
    {
      preHandler: authenticate,
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      // Token is validated by authenticate middleware
      // In a production system, you might want to add the token to a blacklist here
      return reply.code(200).send({
        message: 'Logged out successfully',
      });
    }
  );

  /**
   * GET /api/auth/me
   * Get current authenticated user with profile
   */
  fastify.get(
    '/api/auth/me',
    {
      preHandler: authenticate,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // User JWT payload is attached to request by authenticate middleware
        const jwtUser = request.user as any;
        
        // Fetch full user data from database including profile
        const user = await authService.getUserWithProfile(jwtUser.userId);
        
        if (!user) {
          return reply.code(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'User not found',
          });
        }

        return reply.code(200).send({
          user,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to retrieve user data',
        });
      }
    }
  );
}
