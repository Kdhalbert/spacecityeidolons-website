import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log the error
  request.log.error(error);

  // Handle Zod validation errors (check instance, cause, name, and issues property)
  const isZodError = error instanceof ZodError || 
                     (error as any).cause instanceof ZodError ||
                     error.name === 'ZodError' ||
                     (error as any).issues !== undefined;
  
  if (isZodError) {
    const zodError = error instanceof ZodError ? error : 
                     (error as any).cause instanceof ZodError ? (error as any).cause : 
                     error;
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: (zodError as any).issues?.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })) || (zodError as any).errors?.map((e: any) => ({
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
