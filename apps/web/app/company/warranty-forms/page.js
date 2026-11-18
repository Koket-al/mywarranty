'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { apiRequest } from '../../../services/api';
import { PlusCircle, Sliders, Trash2, X } from 'lucide-react';

export default function WarrantyFormBuilderPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [customFields, setCustomFields] = useState([
    { fieldId: 'store_branch', label: 'Store Branch / Mall', fieldType: 'text', required: false, options: [], helpText: '', displayOrder: 1 },
    { fieldId: 'device_color', label: 'Device Color', fieldType: 'text', required: false, options: [], helpText: '', displayOrder: 2 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await apiRequest('/api/warranty-forms');
      setForms(data.forms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setCustomFields([
      ...customFields,
      {
        fieldId: `field_${Date.now()}`,
        label: 'Custom Field',
        fieldType: 'text',
        required: false,
        options: [],
        helpText: '',
        displayOrder: customFields.length + 1
      }
    ]);
  };

  const handleUpdateField = (idx, key, val) => {
    const updated = [...customFields];
    updated[idx][key] = val;
    setCustomFields(updated);
  };

  const handleRemoveField = (idx) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = await apiRequest('/api/warranty-forms', {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          fields: customFields
        })
      });

      if (data.success) {
        // Automatically publish initial version
        await apiRequest(`/api/warranty-forms/${data.form._id}/publish`, {
          method: 'POST',
          body: JSON.stringify({ versionId: data.version._id })
        });

        setIsModalOpen(false);
        setFormName('');
        loadForms();
      }
    } catch (err) {
      setError(err.message || 'Failed to create form schema.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Warranty Form Builder
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Configure standard and custom fields required during individual warranty issuance
              </p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <PlusCircle size={18} /> Create Form Schema
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading form schemas...</div>
          ) : forms.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Sliders size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>No custom form schemas configured</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Warranties currently use default standard fields. Create a custom form to track branch, color, or condition.
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
                Create First Custom Form
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Form Name</th>
                    <th>Published Version</th>
                    <th>Custom Fields Count</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map(f => (
                    <tr key={f._id}>
                      <td style={{ fontWeight: 600 }}>{f.name}</td>
                      <td>Version {f.currentPublishedVersionId?.versionNumber || 1}</td>
                      <td>{f.currentPublishedVersionId?.fields?.length || 0} fields</td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* New Form Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '640px' }}>
                <div className="modal-header">
                  <h3 className="modal-title">Configure Warranty Form Schema</h3>
                  <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleCreateForm}>
                  <div className="form-group">
                    <label className="form-label">Form Schema Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Retail Store Issuance Form"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>Custom Fields</label>
                      <button type="button" onClick={handleAddField} className="btn btn-secondary btn-sm">
                        + Add Custom Field
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {customFields.map((f, idx) => (
                        <div key={idx} style={{
                          padding: '0.75rem',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1fr auto auto',
                          gap: '0.5rem',
                          alignItems: 'center'
                        }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Field Label (e.g. Branch)"
                            value={f.label}
                            onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                            required
                          />
                          <select
                            className="form-control"
                            value={f.fieldType}
                            onChange={(e) => handleUpdateField(idx, 'fieldType', e.target.value)}
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="checkbox">Checkbox</option>
                          </select>
                          <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={f.required}
                              onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                            />
                            Required
                          </label>
                          <button type="button" onClick={() => handleRemoveField(idx)} className="btn btn-secondary btn-sm">
                            <Trash2 size={14} color="var(--danger)" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Publishing...' : 'Save & Publish Schema'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

