import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';
import { config, isDevelopment } from './config/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import prisma from './lib/db.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerInviteRoutes } from './routes/invites.js';
import { registerAuthRoutes } from './routes/auth.js';

export async function buildApp() {
  // Create Fastify instance
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'test' ? 'silent' : 'info',
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  // Register plugins
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API
  });

  await app.register(cors, {
    origin: config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(sensible);

  await app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    },
  });

  // Register health check routes with database connectivity monitoring
  await registerHealthRoutes(app, prisma);

  // Register routes
  await app.register(registerAuthRoutes);
  await app.register(registerInviteRoutes);
  // TODO: Import and register other route modules here
  // await app.register(userRoutes, { prefix: '/api/users' });
  // etc.

  // Register error handler
  app.setErrorHandler(errorHandler);

  return app;
}
