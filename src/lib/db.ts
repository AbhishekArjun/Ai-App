import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const getClient = async () => {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return dbInstance;
};

export const query = async (text: string, params: any[] = []) => {
  const db = await getClient();
  
  // Very simple parameter conversion: convert Postgres $1, $2 to SQLite ?
  let sqliteText = text.replace(/\$\d+/g, '?');
  
  // Remove RETURNING * because older SQLite doesn't always support it nicely,
  // we will handle it manually in the API routes.
  const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');
  
  try {
    if (isSelect) {
      const rows = await db.all(sqliteText, params);
      return { rows, rowCount: rows.length };
    } else {
      const result = await db.run(sqliteText, params);
      return { 
        rows: [], 
        rowCount: result.changes, 
        lastID: result.lastID 
      };
    }
  } catch (error) {
    console.error('Database query error:', error, 'Query:', sqliteText, 'Params:', params);
    throw error;
  }
};
