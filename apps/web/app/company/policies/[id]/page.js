'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import StatusBadge from '../../../../components/StatusBadge';
import { apiRequest } from '../../../../services/api';
import { CheckCircle2, Lock, Plus, Trash2, ArrowUpRight } from 'lucide-react';

export default function PolicyDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [policy, setPolicy] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Draft editing state
  const [draftVersion, setDraftVersion] = useState(null);
  const [duration, setDuration] = useState(12);
  const [durationUnit, setDurationUnit] = useState('months');
  const [clauses, setClauses] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id) {
      loadPolicyData(id);
    }
  }, [id]);

  const loadPolicyData = async (policyId) => {
    try {
      const data = await apiRequest(`/api/policies/${policyId}`);
      setPolicy(data.policy);
      setVersions(data.versions || []);

      // Find draft version if any
      const draft = data.versions?.find(v => v.status === 'draft');
      if (draft) {
        setDraftVersion(draft);
        setDuration(draft.duration);
        setDurationUnit(draft.durationUnit);
        setClauses(draft.clauses || []);
      } else {
        setDraftVersion(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClause = () => {
    const newClause = {
      clauseId: `clause-${Date.now()}`,
      title: 'New Coverage or Exclusion Clause',
      text: 'Describe the terms, conditions, or exclusions...',
      type: 'coverage'
    };
    setClauses([...clauses, newClause]);
  };

  const handleUpdateClause = (idx, field, val) => {
    const updated = [...clauses];
    updated[idx][field] = val;
    setClauses(updated);
  };

  const handleRemoveClause = (idx) => {
    setClauses(clauses.filter((_, i) => i !== idx));
  };

  const handleSaveDraft = async () => {
    if (!draftVersion) return;
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest(`/api/policies/${id}/drafts/${draftVersion._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ duration, durationUnit, clauses })
      });
      if (data.success) {
        setSuccess('Draft version saved.');
        loadPolicyData(id);
      }
    } catch (err) {
      setError(err.message || 'Failed to save draft.');
    }
  };

  const handlePublish = async (versionId) => {
    if (!confirm('Publish this version? Once published, this policy version becomes strictly immutable and available for new warranties.')) return;
    setPublishing(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest(`/api/policies/${id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ versionId })
      });
      if (data.success) {
        setSuccess(data.message);
        loadPolicyData(id);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish version.');
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateNewVersion = async () => {
    setError('');
    setSuccess('');

    const latest = versions[0];
    try {
      const data = await apiRequest(`/api/policies/${id}/versions`, {
        method: 'POST',
        body: JSON.stringify({
          name: policy.name,
          duration: latest?.duration || 12,
          durationUnit: latest?.durationUnit || 'months',
          startDateRule: latest?.startDateRule || 'purchase_date',
          clauses: latest?.clauses || []
        })
      });
      if (data.success) {
        setSuccess('New draft version initialized.');
        loadPolicyData(id);
      }
    } catch (err) {
      setError(err.message || 'Failed to create new draft version.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="company" />
          <main style={{ flex: 1, padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading policy editor...
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {policy?.name}
                </h1>
                <StatusBadge status={policy?.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {policy?.description || 'No description provided'}
              </p>
            </div>

            {!draftVersion && (
              <button onClick={handleCreateNewVersion} className="btn btn-primary">
                <Plus size={16} /> Draft New Policy Version
              </button>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Active Draft Editor (if un-published draft exists) */}
          {draftVersion ? (
            <div className="card" style={{ marginBottom: '2rem', border: 'none' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">Editing Draft: Version {draftVersion.versionNumber}</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(241, 165, 1, 0.75)' }}>
                    Make adjustments below. Publishing will lock this version as immutable.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSaveDraft} className="btn btn-secondary btn-sm">
                    Save Draft
                  </button>
                  <button onClick={() => handlePublish(draftVersion._id)} className="btn btn-gold btn-sm" disabled={publishing}>
                    {publishing ? 'Publishing...' : 'Publish Version'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration Unit</label>
                  <select
                    className="form-control"
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                  >
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              {/* Clauses List */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)' }}>Policy Clauses & Exclusions</h3>
                  <button onClick={handleAddClause} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add Clause
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {clauses.map((clause, idx) => (
                    <div key={idx} style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Clause Title (e.g. Screen & Display Coverage)"
                          value={clause.title}
                          onChange={(e) => handleUpdateClause(idx, 'title', e.target.value)}
                        />
                        <select
                          className="form-control"
                          value={clause.type}
                          onChange={(e) => handleUpdateClause(idx, 'type', e.target.value)}
                        >
                          <option value="coverage">Coverage Clause</option>
                          <option value="exclusion">Exclusion Clause</option>
                          <option value="procedure">Claim Procedure</option>
                          <option value="general">General Term</option>
                        </select>
                        <button onClick={() => handleRemoveClause(idx)} className="btn btn-secondary btn-sm" title="Remove clause">
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>

                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Detailed legal clause wording..."
                        value={clause.text}
                        onChange={(e) => handleUpdateClause(idx, 'text', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Version History Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Version History</h2>
              <span className="badge badge-info">{versions.length} Total Versions</span>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Duration</th>
                    <th>Clauses</th>
                    <th>Status</th>
                    <th>Published At</th>
                    <th>Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map(v => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600 }}>Version {v.versionNumber}</td>
                      <td>{v.duration} {v.durationUnit}</td>
                      <td>{v.clauses?.length || 0} terms</td>
                      <td><StatusBadge status={v.status} /></td>
                      <td>{v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : 'Unpublished'}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: v.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>
                          <Lock size={12} /> {v.status === 'published' ? 'Immutable' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

