import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DynamicDBEngine } from '@/lib/dbEngine';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, slug, config } = data;

    if (!name || !slug || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure system tables exist
    await DynamicDBEngine.initSystemTables();

    // Insert app record
    await query(
      `INSERT INTO system_applications (name, slug, config) VALUES (?, ?, ?)`,
      [name, slug, JSON.stringify(config)]
    );

    // Provision the dynamic database tables
    await DynamicDBEngine.syncAppSchema(slug, config);

    return NextResponse.json({ success: true, appUrl: `/app/${slug}` });
  } catch (err: any) {
    console.error('Error creating app:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await DynamicDBEngine.initSystemTables();
    const result = await query(`SELECT id, name, slug, created_at FROM system_applications ORDER BY created_at DESC`);
    return NextResponse.json({ data: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
