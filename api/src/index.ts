import { buildApp } from './app.js';
import { config } from './config/index.js';

async function start() {
  try {
    const app = await buildApp();

    // Start server
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
    console.error(error);
    process.exit(1);
  }
}

start();
