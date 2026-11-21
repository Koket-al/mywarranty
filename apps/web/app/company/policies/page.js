'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { PlusCircle, ScrollText, ArrowRight, X } from 'lucide-react';

export default function CompanyPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Policy Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(12);
  const [durationUnit, setDurationUnit] = useState('months');
  const [startDateRule, setStartDateRule] = useState('purchase_date');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await apiRequest('/api/policies');
      setPolicies(data.policies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const defaultClauses = [
        {
          clauseId: 'cov-defects',
          title: 'Manufacturing & Hardware Defect Coverage',
          text: 'Covers internal electrical and hardware failures under standard operational usage.',
          type: 'coverage'
        },
        {
          clauseId: 'excl-physical',
          title: 'Physical & Water Damage Exclusion',
          text: 'Excludes cracked screens, liquid spills, electrical surges, or unauthorized third-party tampering.',
          type: 'exclusion'
        }
      ];

      const data = await apiRequest('/api/policies', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          duration: Number(duration),
          durationUnit,
          startDateRule,
          clauses: defaultClauses
        })
      });

      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        loadPolicies();
      }
    } catch (err) {
      setError(err.message || 'Failed to create policy draft.');
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
                Warranty Policies
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Define company-specific warranty durations, coverage clauses, and exclusions
              </p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <PlusCircle size={18} /> Create New Policy
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading policies...</div>
          ) : policies.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ScrollText size={40} color="var(--bg)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--bg)', marginBottom: '0.5rem' }}>No policies configured</h3>
              <p style={{ color: 'rgba(241, 165, 1, 0.75)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Every company on MW (My Warranty) defines its own terms. Create a draft and publish it for issuance.
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-gold btn-sm">
                Create First Policy
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Policy Name</th>
                    <th>Published Version</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(pol => {
                    const v = pol.currentPublishedVersionId;
                    return (
                      <tr key={pol._id}>
                        <td style={{ fontWeight: 600 }}>{pol.name}</td>
                        <td>{v ? `Version ${v.versionNumber}` : 'No published version yet'}</td>
                        <td>{v ? `${v.duration} ${v.durationUnit}` : 'N/A'}</td>
                        <td><StatusBadge status={pol.status} /></td>
                        <td>{new Date(pol.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/company/policies/${pol._id}`} className="btn btn-secondary btn-sm">
                            Configure Terms <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* New Policy Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Create Warranty Policy Draft</h3>
                  <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleCreateDraft}>
                  <div className="form-group">
                    <label className="form-label">Policy Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Standard 12-Month Hardware Warranty"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Internal policy description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Warranty Duration <span className="required">*</span></label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
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

                  <div className="form-group">
                    <label className="form-label">Start Date Rule</label>
                    <select
                      className="form-control"
                      value={startDateRule}
                      onChange={(e) => setStartDateRule(e.target.value)}
                    >
                      <option value="purchase_date">Purchase Date (Standard)</option>
                      <option value="issuance_date">Date of Issuance</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Policy Draft'}
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

