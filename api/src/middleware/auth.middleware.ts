import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid authorization header format',
      });
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);
    
    // Attach user info to request
    request.user = payload;
  } catch (error) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
}

/**
 * Middleware to optionally verify JWT token
 * If token is present and valid, attaches user to request
 * If token is missing or invalid, continues without error
 */
export async function optionalAuthenticate(request: FastifyRequest) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      // No auth header, continue without authentication
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Invalid format, continue without authentication
      return;
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);
    
    // Attach user info to request
    request.user = payload;
  } catch (error) {
    // Token verification failed, continue without authentication
    // Don't throw error for optional auth
  }
}

/**
 * Middleware to verify user has admin role
 * Must be used after authenticate middleware
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = (request.user as unknown) as { role: string } | undefined;
  
  if (!user || user.role !== Role.ADMIN) {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
}
