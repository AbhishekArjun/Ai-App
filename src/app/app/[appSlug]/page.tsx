import { query } from '@/lib/db';
import DynamicRenderer from '@/components/DynamicRenderer';
import { notFound } from 'next/navigation';

export default async function AppRuntime({ params }: { params: { appSlug: string } }) {
  const { appSlug } = params;

  try {
    const result = await query(`SELECT config FROM system_applications WHERE slug = $1`, [appSlug]);
    
    if (result.rowCount === 0) {
      notFound();
    }

    const configStr = result.rows[0].config;
    const config = typeof configStr === 'string' ? JSON.parse(configStr) : configStr;

    return <DynamicRenderer config={config} appSlug={appSlug} />;
  } catch (err) {
    console.error('Error fetching app config:', err);
    return <div>Error loading application runtime. Ensure database is connected.</div>;
  }
}
