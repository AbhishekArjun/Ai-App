'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const DEFAULT_CONFIG = {
  ui: {
    title: "My Awesome App",
    primaryColor: "#4F46E5"
  },
  auth: {
    required: true,
    logoUrl: ""
  },
  models: [
    {
      name: "Customer",
      fields: [
        { name: "name", type: "string", required: true },
        { name: "email", type: "string", required: true, unique: true },
        { name: "isActive", type: "boolean" },
        { name: "age", type: "number" }
      ]
    },
    {
      name: "Product",
      fields: [
        { name: "title", type: "string", required: true },
        { name: "price", type: "number", required: true },
        { name: "inStock", type: "boolean" }
      ]
    }
  ]
};

export default function Home() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [configStr, setConfigStr] = useState(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch('/api/admin/apps');
      const data = await res.json();
      if (data.data) setApps(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(configStr);
      } catch (err) {
        throw new Error('Invalid JSON configuration');
      }

      const res = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, config: parsedConfig })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create app');
      
      alert(`App created! Available at ${data.appUrl}`);
      fetchApps();
      setName('');
      setSlug('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>AI App Generator Engine</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h2>Create New App</h2>
          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label>App Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. CRM System" />
            </div>
            <div className="input-group">
              <label>App Slug (URL Path)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g. crm-system" pattern="[a-z0-9-]+" title="Lowercase letters, numbers, and hyphens only" />
            </div>
            <div className="input-group">
              <label>JSON Configuration</label>
              <textarea 
                value={configStr} 
                onChange={e => setConfigStr(e.target.value)} 
                rows={15} 
                style={{ fontFamily: 'monospace' }}
                required 
              />
            </div>
            {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Generating App & Database...' : 'Generate App'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Generated Apps</h2>
          {apps.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No apps generated yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {apps.map(app => (
                <li key={app.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{app.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Slug: {app.slug}</p>
                  <Link href={`/app/${app.slug}`} style={{ display: 'inline-block', backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none' }}>
                    Open App
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
