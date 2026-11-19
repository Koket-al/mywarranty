'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { ShieldCheck, ShieldAlert, Clock, Building2, Smartphone, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    if (token && token !== 'manual') {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async (qrToken) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/api/verify/${qrToken}`);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Unable to verify QR token.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualToken.trim()) {
      router.push(`/verify/${manualToken.trim()}`);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '650px', margin: '2rem auto', padding: '0 1rem' }}>
        {token === 'manual' && !report && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <QrCode size={20} color="var(--accent)" /> Verify Warranty QR Code
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Enter the unique QR token or scan string from your warranty document to check authenticity and expiry.
            </p>

            <form onSubmit={handleManualSearch}>
              <div className="form-group">
                <label className="form-label">QR Token or Scanned String</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Paste QR token..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Verify Record
              </button>
            </form>
          </div>
        )}

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Cryptographically verifying record integrity...</div>
          </div>
        )}

        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
              <ShieldAlert size={48} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
            <Link href="/verify/manual" className="btn btn-secondary btn-sm">
              Try Another Token
            </Link>
          </div>
        )}

        {report && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: report.verificationStatus === 'VALID' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: report.verificationStatus === 'VALID' ? 'var(--success)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                {report.verificationStatus === 'VALID' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <StatusBadge status={report.verificationStatus} />
              </div>

              {report.product?.imageUrl && (
                <div style={{ width: '90px', height: '90px', margin: '0.75rem auto', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
                  <img src={report.product.imageUrl} alt={report.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}

              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                {report.product?.brand} {report.product?.name}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Warranty ID: <strong>{report.warrantyNumber}</strong>
              </p>
            </div>

            {/* Trust Label Banner */}
            <div style={{
              margin: '1.25rem 0',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-light)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem'
            }}>
              <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Trust Verification Level:</span>
              <span className="badge badge-info" style={{ textTransform: 'none' }}>
                {report.trustLabel}
              </span>
            </div>

            {/* Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Building2 size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issuing Retailer</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{report.company?.businessName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Smartphone size={18} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model / Category</div>
                  <div style={{ fontSize: '0.95rem' }}>{report.product?.model || 'Standard Edition'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Coverage Period</div>
                  <div style={{ fontSize: '0.95rem' }}>
                    Valid until <strong>{new Date(report.warranty?.expiryDate).toLocaleDateString()}</strong> ({report.warranty?.daysRemaining} days remaining)
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Integrity Breakdown */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Digital Signature & Cryptographic Integrity
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', color: 'var(--text-muted)' }}>
                <span>• Algorithm: {report.cryptographicIntegrity?.algorithm}</span>
                <span>• SHA-256 Hash Match: {report.cryptographicIntegrity?.hashMatches ? '✅ Verified' : '❌ Failed'}</span>
                <span>• Asymmetric Signature: {report.cryptographicIntegrity?.signatureValid ? '✅ Authentic' : '❌ Invalid'}</span>
                <span>• Key ID: {report.cryptographicIntegrity?.keyId}</span>
              </div>
            </div>

            {/* Action to Claim */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link href={`/customer/claim-warranty?lookup=${encodeURIComponent(report.warrantyNumber)}`} className="btn btn-accent" style={{ width: '100%' }}>
                Claim this Warranty in Your Account
              </Link>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Linking grants you access to PDF downloads and AI-assisted claims support.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

