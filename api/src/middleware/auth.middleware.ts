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
 * Optional middleware to verify JWT token if present
 * Does not return 401 when no token is provided - allows public access
 * Populates request.user when a valid token is provided
 */
export async function optionalAuthenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return; // No token - continue as unauthenticated
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return; // Malformed header - treat as unauthenticated
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);
    request.user = payload;
  } catch {
    // Invalid token - continue as unauthenticated (do not 401)
  }
}

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
