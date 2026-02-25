import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { queryEventsSchema, createEventSchema, updateEventSchema } from '../schemas/event.schema.js';
import * as eventService from '../services/event.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function registerEventRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/events
   * Get all visible events with optional filtering
   * Public endpoint - no authentication required
   * Visibility filtering is applied based on user role
   */
  fastify.get('/api/events', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = queryEventsSchema.parse(request.query);

      // Get user data if authenticated
      const userId = (request.user as any)?.userId || null;
      const userRole = (request.user as any)?.role || null;

      const result = await eventService.getVisibleEvents(userId, userRole, filters);

      return reply.code(200).send({
        data: result.data,
        count: result.count,
        totalCount: result.totalCount,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          error: 'Invalid query parameters',
          details: error.errors,
        });
      }

      console.error('Error fetching events:', error);
      return reply.code(500).send({
        error: 'Failed to fetch events',
      });
    }
  });

  /**
   * GET /api/events/:id
   * Get a specific event with visibility checks
   * Public endpoint - no authentication required
   */
  fastify.get('/api/events/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      const userId = (request.user as any)?.userId || null;
      const userRole = (request.user as any)?.role || null;

      const event = await eventService.getEventById(id, userId, userRole);

      if (!event) {
        return reply.code(404).send({
          error: 'Event not found',
        });
      }

      return reply.code(200).send(event);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      return reply.code(500).send({
        error: 'Failed to fetch event',
      });
    }
  });

  /**
   * POST /api/events
   * Create a new event
   * Requires authentication (MEMBER role or higher)
   */
  fastify.post(
    '/api/events',
    {
      preHandler: authenticate,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const input = createEventSchema.parse(request.body);
        const userId = (request.user as any).userId;

        const event = await eventService.createEvent(input, userId);

        return reply.code(201).send(event);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.code(400).send({
            error: 'Invalid event data',
            details: error.errors,
          });
        }

        console.error('Error creating event:', error);
        return reply.code(500).send({
          error: 'Failed to create event',
        });
      }
    }
  );

  /**
   * PUT /api/events/:id
   * Update an existing event
   * Requires authentication and creator authorization
   */
  fastify.put(
    '/api/events/:id',
    {
      preHandler: authenticate,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const input = updateEventSchema.parse(request.body);
        const userId = (request.user as any).userId;

        const event = await eventService.updateEvent(id, input, userId);

        return reply.code(200).send(event);
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          return reply.code(403).send({
            error: 'You do not have permission to update this event',
          });
        }

        if (error.message === 'Event not found') {
          return reply.code(404).send({
            error: 'Event not found',
          });
        }

        if (error.name === 'ZodError') {
          return reply.code(400).send({
            error: 'Invalid event data',
            details: error.errors,
          });
        }

        console.error('Error updating event:', error);
        return reply.code(500).send({
          error: 'Failed to update event',
        });
      }
    }
  );

  /**
   * DELETE /api/events/:id
   * Delete an event
   * Requires authentication and creator authorization
   */
  fastify.delete(
    '/api/events/:id',
    {
      preHandler: authenticate,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = (request.user as any).userId;

        await eventService.deleteEvent(id, userId);

        return reply.code(204).send();
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          return reply.code(403).send({
            error: 'You do not have permission to delete this event',
          });
        }

        if (error.message === 'Event not found') {
          return reply.code(404).send({
            error: 'Event not found',
          });
        }

        console.error('Error deleting event:', error);
        return reply.code(500).send({
          error: 'Failed to delete event',
        });
      }
    }
  );

  /**
   * GET /api/events/stats
   * Get event statistics
   * Admin only
   */
  fastify.get(
    '/api/events/stats',
    {
      preHandler: authenticate,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userRole = (request.user as any)?.role;

        if (userRole !== 'ADMIN') {
          return reply.code(403).send({
            error: 'Forbidden - Admin access required',
          });
        }

        const stats = await eventService.getEventStats();

        return reply.code(200).send(stats);
      } catch (error: any) {
        console.error('Error fetching event stats:', error);
        return reply.code(500).send({
          error: 'Failed to fetch event statistics',
        });
      }
    }
  );
}
