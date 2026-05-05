'use client';

import React, { useState } from 'react';
import AuthView from './AuthView';
import FormBuilder from './FormBuilder';
import DataTableView from './DataTableView';
import CSVImporter from './CSVImporter';

export default function DynamicRenderer({ config, appSlug }: { config: any, appSlug: string }) {
  const [user, setUser] = useState<any>(null);
  const [activeModel, setActiveModel] = useState<string>(config.models?.[0]?.name || '');
  const [showForm, setShowForm] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  if (!config) return <div>No configuration provided.</div>;

  // Handle Authentication Requirements
  if (config.auth?.required && !user) {
    return <AuthView authConfig={config.auth} onLogin={setUser} />;
  }

  const modelConfig = config.models?.find((m: any) => m.name === activeModel);

  const handleCreate = async (data: any) => {
    const res = await fetch(`/api/app/${appSlug}/${activeModel}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save');
    setShowForm(false);
    // Realistically we'd force a re-fetch in the table here, 
    // for MVP we can rely on manual refresh or a context provider
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/app/${appSlug}/${activeModel}/${id}`, {
      method: 'DELETE',
    });
    // Table handles its own state, but we should probably lift it
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <nav style={{ width: '250px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem 1rem' }}>
        <h2 style={{ marginBottom: '2rem', color: config.ui?.primaryColor || 'var(--primary)' }}>
          {config.ui?.title || 'Generated App'}
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {config.models?.map((model: any) => (
            <li key={model.name} style={{ marginBottom: '0.5rem' }}>
              <button 
                onClick={() => { setActiveModel(model.name); setShowForm(false); setShowCSV(false); }}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  backgroundColor: activeModel === model.name ? 'var(--primary)' : 'transparent',
                  color: activeModel === model.name ? 'white' : 'var(--text)',
                }}
              >
                {model.name}s
              </button>
            </li>
          ))}
        </ul>
        {user && (
          <button 
            onClick={() => setUser(null)} 
            style={{ position: 'absolute', bottom: '2rem', backgroundColor: 'transparent', color: 'var(--text-muted)' }}
          >
            Logout
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        {modelConfig ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ margin: 0 }}>{modelConfig.name} Dashboard</h1>
              <div>
                <button onClick={() => setShowCSV(!showCSV)} style={{ marginRight: '1rem', backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
                  {showCSV ? 'Close Import' : 'Import CSV'}
                </button>
                <button onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : `Add ${modelConfig.name}`}
                </button>
              </div>
            </div>

            {showCSV && (
              <CSVImporter 
                modelConfig={modelConfig} 
                appSlug={appSlug} 
                onImportComplete={() => setShowCSV(false)} 
              />
            )}

            {showForm ? (
              <FormBuilder 
                modelConfig={modelConfig} 
                onSubmit={handleCreate} 
                onCancel={() => setShowForm(false)} 
              />
            ) : (
              // Use a key to force re-render when switching models
              <DataTableView 
                key={activeModel}
                modelConfig={modelConfig} 
                appSlug={appSlug} 
                onEdit={() => alert('Edit not fully implemented in MVP UI')} 
                onDelete={handleDelete} 
              />
            )}
          </div>
        ) : (
          <p>Please select a module from the sidebar.</p>
        )}
      </main>
    </div>
  );
}
