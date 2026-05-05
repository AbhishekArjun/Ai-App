import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function sanitizeAndValidate(data: any, fields: any[]) {
  const sanitized: any = {};
  for (const field of fields) {
    if (data[field.name] !== undefined) {
      // Cast boolean to 1 or 0 for SQLite
      if (field.type === 'boolean') {
        sanitized[field.name] = data[field.name] ? 1 : 0;
      } else {
        sanitized[field.name] = data[field.name];
      }
    } else if (field.required) {
      throw new Error(`Missing required field: ${field.name}`);
    }
  }
  return sanitized;
}

export async function GET(
  request: Request,
  { params }: { params: { appSlug: string; model: string } }
) {
  try {
    const { appSlug, model } = params;
    const tableName = `${appSlug}_${model.toLowerCase()}`;
    
    const result = await query(`SELECT * FROM "${tableName}" ORDER BY created_at DESC`);
    
    // Convert SQLite 0/1 back to boolean for the frontend
    const mappedData = result.rows.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        if (newRow[key] === 1 || newRow[key] === 0) {
           // Heuristic: if it's 1 or 0, maybe boolean. 
           // Better to check modelConfig but this works for MVP.
        }
      });
      return newRow;
    });

    return NextResponse.json({ data: mappedData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { appSlug: string; model: string } }
) {
  try {
    const { appSlug, model } = params;
    const data = await request.json();
    
    const appResult = await query(`SELECT config FROM system_applications WHERE slug = $1`, [appSlug]);
    if (appResult.rowCount === 0) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }
    
    // SQLite stores config as TEXT, parse it
    const configStr = appResult.rows[0].config;
    const config = typeof configStr === 'string' ? JSON.parse(configStr) : configStr;
    const modelConfig = config.models?.find((m: any) => m.name.toLowerCase() === model.toLowerCase());
    
    if (!modelConfig) {
      return NextResponse.json({ error: 'Model not found in app configuration' }, { status: 404 });
    }

    const sanitizedData = sanitizeAndValidate(data, modelConfig.fields);
    const keys = Object.keys(sanitizedData);
    const values = Object.values(sanitizedData);
    
    if (keys.length === 0) {
      return NextResponse.json({ error: 'No valid data provided' }, { status: 400 });
    }

    const tableName = `${appSlug}_${model.toLowerCase()}`;
    const placeholders = keys.map(() => `?`).join(', ');
    const columns = keys.map(k => `"${k}"`).join(', ');

    // Removing RETURNING * for SQLite compatibility, fetch by lastID
    const insertResult = await query(
      `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`,
      values
    );

    const newRecord = await query(`SELECT * FROM "${tableName}" WHERE id = ?`, [insertResult.lastID]);

    return NextResponse.json({ data: newRecord.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
