import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log the error
  request.log.error(error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'A resource with this unique value already exists',
      });
    }
    if (prismaError.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'The requested resource was not found',
      });
    }
  }

  // Handle JWT errors
  if (error.message.includes('jwt') || error.message.includes('token')) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
      details: error.validation,
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : error.message || 'An error occurred';

  return reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Error',
    message,
  });
}
