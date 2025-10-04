import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(s => s.trim());
  statements.forEach(statement => {
    if (statement.trim()) {
      try {
        db.exec(statement);
      } catch (err) {
        // Ignore "table already exists" errors
        if (!(err as any).message?.includes('already exists')) {
          console.error('Schema error:', err);
        }
      }
    }
  });
  console.log('✅ Database schema initialized');
}

// Query result interface
export interface QueryResult<T = any> {
  rows: T[];
  lastID?: number | bigint;
  changes?: number;
}

// Helper function to run queries with parameter binding
export const query = <T = any>(sql: string, params: any[] = []): QueryResult<T> => {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return { rows: stmt.all(...params) as T[] };
    } else {
      const info = stmt.run(...params);
      return {
        rows: [],
        lastID: info.lastInsertRowid,
        changes: info.changes
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default db;
