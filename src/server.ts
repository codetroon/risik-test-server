import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/lib/logger.js";
import { prisma } from "./db/prisma.js";

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `🚀 Server running on http://localhost:${env.PORT}`,
  );
});

// Graceful shutdown
function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    void prisma.$disconnect().then(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
