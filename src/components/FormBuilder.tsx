'use client';

import React, { useState } from 'react';

export default function FormBuilder({ modelConfig, onSubmit, onCancel }: { modelConfig: any, onSubmit: (data: any) => Promise<void>, onCancel: () => void }) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <h3>Create {modelConfig.name}</h3>
      <form onSubmit={handleSubmit}>
        {modelConfig.fields.map((field: any) => (
          <div key={field.name} className="input-group">
            <label>{field.name} {field.required && '*'}</label>
            {field.type === 'string' ? (
              <input type="text" onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} />
            ) : field.type === 'number' ? (
              <input type="number" onChange={(e) => handleChange(field.name, Number(e.target.value))} required={field.required} />
            ) : field.type === 'boolean' ? (
              <input type="checkbox" onChange={(e) => handleChange(field.name, e.target.checked)} style={{ width: 'auto' }} />
            ) : (
              <input type="text" onChange={(e) => handleChange(field.name, e.target.value)} required={field.required} />
            )}
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} style={{ backgroundColor: 'var(--border)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
