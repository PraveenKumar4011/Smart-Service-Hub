import Database from 'better-sqlite3';
import { config } from '../config/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase() {
  const dbPath = path.resolve(__dirname, '../../', config.database.file);
  const db = new Database(dbPath);

  // Create tickets table
  const createTicketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      requestType TEXT NOT NULL CHECK (requestType IN ('Network', 'Security', 'Cloud', 'General')),
      description TEXT NOT NULL,
      audioBase64 TEXT,
      category TEXT,
      priority TEXT,
      summary TEXT,
      entities TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createTicketsTable);

  // Create indexes for better query performance
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_tickets_requestType ON tickets(requestType);
    CREATE INDEX IF NOT EXISTS idx_tickets_createdAt ON tickets(createdAt);
  `;

  db.exec(createIndexes);

  return db;
}

// Run setup if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const db = initializeDatabase();
    console.log('Database initialized successfully');
    db.close();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}