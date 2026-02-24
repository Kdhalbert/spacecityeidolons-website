import { buildApp } from './app.js';
import { config } from './config/index.js';

async function start() {
  try {
    console.log('[STARTUP] Loading configuration...');
    console.log('[STARTUP] Environment:', config.NODE_ENV);
    console.log('[STARTUP] API listening on:', `http://${config.HOST}:${config.PORT}`);
    
    console.log('[STARTUP] Building Fastify application...');
    const app = await buildApp();
    console.log('[STARTUP] Application built successfully');

    // Start server
    console.log('[STARTUP] Starting server...');
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    app.log.info(
      `Server listening on http://${config.HOST}:${config.PORT}`
    );
    app.log.info(`Environment: ${config.NODE_ENV}`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        app.log.info(`${signal} received, closing server gracefully`);
        await app.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('[STARTUP ERROR]', error);
    process.exit(1);
  }
}

console.log('[STARTUP] Application starting...');
start();
