'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import StatusBadge from '../../../../components/StatusBadge';
import { apiRequest } from '../../../../services/api';
import { ShieldCheck, FileDown, LifeBuoy, Building2, Calendar, Smartphone } from 'lucide-react';

export default function CustomerWarrantyDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadWarranty(id);
    }
  }, [id]);

  const loadWarranty = async (warrantyId) => {
    try {
      const data = await apiRequest(`/api/claims/my-warranties/${warrantyId}`);
      setWarranty(data.warranty);
    } catch (err) {
      setError(err.message || 'Warranty not found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex' }}>
          <Sidebar mode="customer" />
          <main style={{ flex: 1, padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading warranty terms...
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
          <Sidebar mode="customer" />
          <main style={{ flex: 1, padding: '2rem' }}>
            <div className="alert alert-error">{error || 'Warranty not accessible.'}</div>
          </main>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isExpired = new Date(warranty.warranty?.expiryDate) < now;

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="customer" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {warranty.product?.brand} {warranty.product?.name}
                </h1>
                <StatusBadge status={isExpired ? 'EXPIRED' : warranty.recordStatus} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Warranty ID: <strong>{warranty.warrantyNumber}</strong> • Registered by <strong>{warranty.companySnapshot?.businessName}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/warranties/${warranty._id}/pdf`} className="btn btn-secondary" download>
                <FileDown size={16} /> Download Official PDF
              </a>
              <Link href={`/customer/support?warrantyId=${warranty._id}`} className="btn btn-accent">
                <LifeBuoy size={16} /> Request Support
              </Link>
            </div>
          </div>

          {/* Key Details Card */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Smartphone size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product Details</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{warranty.product?.brand} {warranty.product?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serial: {warranty.product?.serialNumber || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Calendar size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purchase & Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Purchased {new Date(warranty.purchase?.purchaseDate).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration: {warranty.warranty?.duration} {warranty.warranty?.durationUnit}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Building2 size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issuing Retailer</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{warranty.companySnapshot?.businessName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{warranty.companySnapshot?.contactEmail}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Terms Snapshot */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Issued Policy Terms: {warranty.policySnapshot?.name}</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Exact terms snapshotted at time of issuance. These terms are immutable.
                </p>
              </div>
              <span className="badge badge-info">Snapshot Hash Verified</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(warranty.policySnapshot?.clauses || []).map((c, idx) => (
                <div key={idx} style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: c.type === 'coverage' ? 'var(--accent-light)' : c.type === 'exclusion' ? '#fef2f2' : 'var(--bg)',
                  border: `1px solid ${c.type === 'coverage' ? 'var(--border)' : c.type === 'exclusion' ? '#fecaca' : 'var(--border)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{c.title}</strong>
                    <span className={`badge ${c.type === 'coverage' ? 'badge-success' : c.type === 'exclusion' ? 'badge-danger' : 'badge-info'}`}>
                      {c.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

