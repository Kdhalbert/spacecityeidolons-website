import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function registerHealthRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  /**
   * Health check endpoint for monitoring
   * Returns 200 if backend API is running and database is accessible
   * Used by Azure Application Insights availability tests
   */
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Test database connectivity with timeout
      const startTime = Date.now();
      const dbCheckPromise = prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database check timeout')), 5000)
      );
      
      await Promise.race([dbCheckPromise, timeoutPromise]);
      const dbLatency = Date.now() - startTime;

      const now = new Date();
      return reply.code(200).send({
        status: 'ok',
        timestamp: now.toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'connected',
          latency: `${dbLatency}ms`
        },
        uptime: process.uptime(),
        version: '1.0.0'
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      fastify.log.error({ error: errorMsg }, 'Health check failed');
      return reply.code(503).send({
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'disconnected',
          error: errorMsg
        },
        uptime: process.uptime(),
        version: '1.0.0'
      });
    }
  });

  /**
   * Liveness probe for Kubernetes/container orchestration
   * Simple indicator that the process is running (no DB check)
   */
  fastify.get('/live', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send({
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Readiness probe for Kubernetes/container orchestration
   * Indicates if the service is ready to accept traffic
   */
  fastify.get('/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.code(200).send({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } catch {
      return reply.code(503).send({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        reason: 'database-unavailable'
      });
    }
  });
}
