import Database from 'better-sqlite3';
import path from 'path';
import { logger } from '../logger.js';

function resolveDbPath() {
  const cwd = process.cwd().replace(/\\/g, '/');

  if (cwd.endsWith('/packages/backend')) {
    return path.resolve(process.cwd(), '../../earthpulse.db');
  }

  return path.resolve(process.cwd(), 'earthpulse.db');
}

const dbPath = resolveDbPath();

logger.info(`Connecting to SQLite database at: ${dbPath}`);

export const db = new Database(dbPath,{
  verbose:(message)=>logger.debug(message),
});

try {
  db.pragma('journal_mode = DELETE');
} catch {
  logger.warn('Skipping SQLite pragmas');
}