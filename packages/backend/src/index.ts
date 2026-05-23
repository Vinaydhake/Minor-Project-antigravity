import app from './app.js';
import { initSchema } from './db/schema.js';
import { seedData } from './db/seed.js';
import { logger } from './logger.js';

const PORT = process.env.PORT || 8080;

try {
  // Initialize Database Schema & Seed Data
  initSchema();
  seedData();

  // Start Express Server
  app.listen(PORT, () => {
    logger.info(`===================================================`);
    logger.info(`   EarthPulse Backend listening on port ${PORT}      `);
    logger.info(`   API Endpoint: http://localhost:${PORT}/api        `);
    logger.info(`===================================================`);
  });
} catch (error) {
  logger.error(error, 'Failed to start EarthPulse Backend application');
  process.exit(1);
}
