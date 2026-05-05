'use client';

import React, { useEffect, useState } from 'react';

export default function DataTableView({ modelConfig, appSlug, onEdit, onDelete }: { modelConfig: any, appSlug: string, onEdit: (record: any) => void, onDelete: (id: string) => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/app/${appSlug}/${modelConfig.name}`);
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // In a real app we might set up an interval or websockets here
  }, [appSlug, modelConfig.name]);

  if (loading) return <div>Loading data...</div>;

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>{modelConfig.name} List</h3>
        <button onClick={fetchData} style={{ backgroundColor: 'var(--border)', color: 'var(--text)', padding: '0.25rem 0.75rem' }}>Refresh</button>
      </div>
      
      {data.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No records found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem' }}>ID</th>
              {modelConfig.fields.map((field: any) => (
                <th key={field.name} style={{ padding: '0.75rem' }}>{field.name}</th>
              ))}
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record: any) => (
              <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{record.id}</td>
                {modelConfig.fields.map((field: any) => (
                  <td key={field.name} style={{ padding: '0.75rem' }}>
                    {typeof record[field.name] === 'boolean' 
                      ? (record[field.name] ? 'Yes' : 'No') 
                      : record[field.name]}
                  </td>
                ))}
                <td style={{ padding: '0.75rem' }}>
                  <button onClick={() => onEdit(record)} style={{ marginRight: '0.5rem', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Edit</button>
                  <button onClick={() => onDelete(record.id)} style={{ backgroundColor: 'transparent', color: 'var(--error)' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
