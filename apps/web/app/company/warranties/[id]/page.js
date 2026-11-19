'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import StatusBadge from '../../../../components/StatusBadge';
import { apiRequest } from '../../../../services/api';
import { ShieldCheck, ShieldAlert, FileDown, Ban, User, Calendar, Smartphone } from 'lucide-react';

export default function CompanyWarrantyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [warranty, setWarranty] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Revocation state
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [submittingRevoke, setSubmittingRevoke] = useState(false);

  useEffect(() => {
    if (id) {
      loadWarranty(id);
    }
  }, [id]);

  const loadWarranty = async (warrantyId) => {
    try {
      const data = await apiRequest(`/api/warranties/${warrantyId}`);
      setWarranty(data.warranty);
      setIntegrity(data.integrityReport);
    } catch (err) {
      setError(err.message || 'Warranty not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) return;

    setSubmittingRevoke(true);
    try {
      const data = await apiRequest(`/api/warranties/${id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason: revokeReason })
      });
      if (data.success) {
        setIsRevoking(false);
        loadWarranty(id);
      }
    } catch (err) {
      alert(err.message || 'Failed to revoke warranty.');
    } finally {
      setSubmittingRevoke(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="company" />
          <main style={{ flex: 1, padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Verifying cryptographic record integrity...
          </main>
        </div>
      </div>
    );
  }

  if (error || !warranty) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="company" />
          <main style={{ flex: 1, padding: '2rem' }}>
            <div className="alert alert-error">{error || 'Warranty not accessible.'}</div>
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
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {warranty.warrantyNumber}
                </h1>
                <StatusBadge status={warranty.recordStatus} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Issued by {warranty.issuedBy?.role} on {new Date(warranty.issuedAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/warranties/${warranty._id}/pdf`} className="btn btn-primary" download>
                <FileDown size={16} /> Official Certificate PDF
              </a>

              {warranty.recordStatus !== 'revoked' && (
                <button onClick={() => setIsRevoking(true)} className="btn btn-danger btn-sm">
                  <Ban size={15} /> Revoke Warranty
                </button>
              )}
            </div>
          </div>

          {/* Cryptographic Integrity Panel */}
          <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: integrity?.isValid ? 'var(--accent-light)' : '#fef2f2', border: `1px solid ${integrity?.isValid ? '#bce1d6' : '#fecaca'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {integrity?.isValid ? <ShieldCheck size={26} color="var(--accent)" /> : <ShieldAlert size={26} color="var(--danger)" />}
              <div>
                <strong style={{ fontSize: '1rem', color: integrity?.isValid ? 'var(--primary)' : '#991b1b' }}>
                  {integrity?.isValid ? 'Tamper-Evident Record Verified' : 'Cryptographic Mismatch Detected!'}
                </strong>
                <div style={{ fontSize: '0.8125rem', color: integrity?.isValid ? 'var(--primary-light)' : '#b91c1c' }}>
                  SHA-256 Hash: <code style={{ fontSize: '0.75rem' }}>{integrity?.recomputedHash}</code> • Key ID: {warranty.recordIntegrity?.keyId}
                </div>
              </div>
            </div>
          </div>

          {/* Details Overview */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {warranty.product?.imageUrl ? (
                  <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
                    <img src={warranty.product.imageUrl} alt={warranty.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <Smartphone size={20} color="var(--accent)" />
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product & Serial</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{warranty.product?.brand} {warranty.product?.name}</div>
                  <div style={{ fontSize: '0.85rem' }}>Model: {warranty.product?.model}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Serial: {warranty.product?.serialNumber || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <User size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer Details</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{warranty.customerSnapshot?.fullName}</div>
                  <div style={{ fontSize: '0.85rem' }}>{warranty.customerSnapshot?.email}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {warranty.customerSnapshot?.phone || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Calendar size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dates & Term</div>
                  <div style={{ fontSize: '0.85rem' }}>Purchased: {new Date(warranty.purchase?.purchaseDate).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.85rem' }}>Valid From: {new Date(warranty.warranty?.startDate).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)' }}>
                    Expires: {new Date(warranty.warranty?.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Immutable Policy Terms Snapshot */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Policy Snapshot: {warranty.policySnapshot?.name}</h2>
              <span className="badge badge-info">Immutable Copy</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(warranty.policySnapshot?.clauses || []).map((c, idx) => (
                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>{c.title}</strong>
                    <span className="badge badge-info">{c.type}</span>
                  </div>
                  <p style={{ color: 'var(--text)', lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revoke Modal */}
          {isRevoking && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Revoke Warranty Record</h3>
                  <button onClick={() => setIsRevoking(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Revoking this warranty marks the record as void, deactivates its QR token, and creates an append-only audit event. The original record is retained for audit history.
                </p>

                <form onSubmit={handleRevoke}>
                  <div className="form-group">
                    <label className="form-label">Revocation Reason <span className="required">*</span></label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="e.g. Returned product, customer refunded, or duplicate entry..."
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setIsRevoking(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={submittingRevoke}>
                      {submittingRevoke ? 'Revoking...' : 'Confirm Revocation'}
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

