import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../../../src/types';

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
}

/**
 * Middleware to verify user has admin role
 * Must be used after authenticate middleware
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;
  
  if (!user || user.role !== Role.ADMIN) {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
}
