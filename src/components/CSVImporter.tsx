'use client';

import React, { useState } from 'react';

// Basic CSV Importer embedded in the UI
export default function CSVImporter({ modelConfig, appSlug, onImportComplete }: { modelConfig: any, appSlug: string, onImportComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\\n');
      if (lines.length < 2) throw new Error('Invalid CSV file');
      
      const headers = lines[0].split(',').map(h => h.trim());
      
      // We will parse locally and send individual API POSTs for simplicity (or batch if the API supported it)
      const dataRows = lines.slice(1).filter(l => l.trim() !== '');
      
      let successCount = 0;
      for (const row of dataRows) {
        const values = row.split(',').map(v => v.trim());
        const payload: any = {};
        headers.forEach((h, i) => { payload[h] = values[i]; });
        
        // Auto-cast types based on config
        modelConfig.fields.forEach((field: any) => {
          if (payload[field.name]) {
            if (field.type === 'number') payload[field.name] = Number(payload[field.name]);
            if (field.type === 'boolean') payload[field.name] = payload[field.name] === 'true';
          }
        });

        const res = await fetch(`/api/app/${appSlug}/${modelConfig.name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) successCount++;
      }
      
      alert(`Successfully imported ${successCount} records.`);
      onImportComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', border: '1px dashed var(--primary)', backgroundColor: 'transparent' }}>
      <h4>Import from CSV</h4>
      <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
        Expected columns: {modelConfig.fields.map((f: any) => f.name).join(', ')}
      </p>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      {error && <p style={{ color: 'var(--error)', marginTop: '0.5rem' }}>{error}</p>}
      <button onClick={handleImport} disabled={!file || loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Importing...' : 'Upload & Import'}
      </button>
    </div>
  );
}
