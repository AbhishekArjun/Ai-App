import { query } from './db';

// JSON Configuration Interfaces
export interface AppModelField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'relation';
  required?: boolean;
  unique?: boolean;
  relationTo?: string; // model name
}

export interface AppModel {
  name: string;
  fields: AppModelField[];
}

export interface AppConfig {
  models: AppModel[];
  ui: any; // We'll define this later
  auth?: any;
}

// Maps JSON types to SQLite types
function mapTypeToSQLite(type: string): string {
  switch (type) {
    case 'string': return 'TEXT';
    case 'number': return 'INTEGER';
    case 'boolean': return 'INTEGER'; // SQLite uses 0 or 1 for boolean
    case 'date': return 'DATETIME';
    case 'relation': return 'INTEGER';
    default: return 'TEXT';
  }
}

export class DynamicDBEngine {
  /**
   * Initializes the base system tables if they don't exist
   */
  static async initSystemTables() {
    await query(`
      CREATE TABLE IF NOT EXISTS system_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Synchronizes the user-defined models into SQLite tables.
   * Tables will be prefixed with the app slug to avoid collisions.
   */
  static async syncAppSchema(appSlug: string, config: AppConfig) {
    if (!config.models) return;

    for (const model of config.models) {
      const tableName = `${appSlug}_${model.name.toLowerCase()}`;
      
      let columnsDef = [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
      ];

      for (const field of model.fields) {
        let colDef = `"${field.name}" ${mapTypeToSQLite(field.type)}`;
        if (field.required) colDef += ' NOT NULL';
        if (field.unique) colDef += ' UNIQUE';
        if (field.type === 'relation' && field.relationTo) {
           colDef += ` REFERENCES ${appSlug}_${field.relationTo.toLowerCase()}(id) ON DELETE SET NULL`;
        }
        columnsDef.push(colDef);
      }

      const createTableSql = `
        CREATE TABLE IF NOT EXISTS "${tableName}" (
          ${columnsDef.join(',\n          ')}
        );
      `;

      try {
        await query(createTableSql);
        console.log(`Synced table: ${tableName}`);
      } catch (err) {
        console.error(`Error syncing table ${tableName}:`, err);
        throw err;
      }
    }
  }
}
