import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { appSlug: string; model: string; id: string } }
) {
  try {
    const { appSlug, model, id } = params;
    const data = await request.json();
    const tableName = `${appSlug}_${model.toLowerCase()}`;
    
    const keys = Object.keys(data);
    if (keys.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 });

    const setClause = keys.map((k) => `"${k}" = ?`).join(', ');
    const values = [...Object.values(data), id];

    await query(
      `UPDATE "${tableName}" SET ${setClause} WHERE id = ?`,
      values
    );

    const newRecord = await query(`SELECT * FROM "${tableName}" WHERE id = ?`, [id]);

    if (newRecord.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: newRecord.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { appSlug: string; model: string; id: string } }
) {
  try {
    const { appSlug, model, id } = params;
    const tableName = `${appSlug}_${model.toLowerCase()}`;
    
    const result = await query(`DELETE FROM "${tableName}" WHERE id = ?`, [id]);
    
    if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
