'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import QRScannerModal from '../../../components/QRScannerModal';
import { apiRequest } from '../../../services/api';
import { QrCode, Camera, CheckCircle2 } from 'lucide-react';

function ClaimWarrantyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLookup = searchParams.get('lookup') || '';

  const [identifier, setIdentifier] = useState(initialLookup);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Verification state
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [warrantyId, setWarrantyId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  useEffect(() => {
    if (initialLookup) {
      handleInitiate(initialLookup);
    }
  }, [initialLookup]);

  const handleInitiate = async (idToLookUp) => {
    const val = (idToLookUp || identifier).trim();
    if (!val) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await apiRequest('/api/claims/initiate', {
        method: 'POST',
        body: JSON.stringify({ identifier: val })
      });

      if (data.alreadyClaimedByMe) {
        setSuccessMsg(data.message);
        setTimeout(() => router.push(`/customer/warranties/${data.warrantyId}`), 1200);
      } else if (data.claimed) {
        setSuccessMsg(data.message);
        setTimeout(() => router.push(`/customer/warranties/${data.warrantyId}`), 1200);
      } else if (data.requiresOtp) {
        setRequiresOtp(true);
        setWarrantyId(data.warrantyId);
        setMaskedEmail(data.recordedEmailMasked);
        setSuccessMsg(data.message);
      }
    } catch (err) {
      setError(err.message || 'Unable to locate warranty record.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/api/claims/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ warrantyId, otpCode })
      });

      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => router.push(`/customer/warranties/${data.warrantyId}`), 1500);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar mode="customer" />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Claim a Digital Warranty
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Add an existing warranty to your account using the QR code or warranty ID
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {!requiresOtp ? (
          <div className="card">
            <form onSubmit={(e) => { e.preventDefault(); handleInitiate(); }}>
              <div className="form-group">
                <label className="form-label">Warranty Number or Scanned Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. EWN-2026-000001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <span className="form-hint">
                  Found on your store purchase receipt or printed warranty card.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Camera size={18} /> Scan with Camera
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ flex: 1, padding: '0.7rem 1.25rem' }}
                  disabled={loading || !identifier.trim()}
                >
                  {loading ? 'Verifying...' : 'Look Up & Claim'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={36} color="var(--bg)" style={{ margin: '0 auto 0.5rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bg)' }}>
                Verify Customer Ownership
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(241, 165, 1, 0.75)' }}>
                A 6-digit confirmation code was sent to the email on record (<strong style={{ color: 'var(--bg)' }}>{maskedEmail}</strong>).
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Confirmation Code</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.25rem', fontWeight: 700, backgroundColor: 'var(--surface-alt)', color: 'var(--bg)', border: '1.5px solid rgba(241, 165, 1, 0.35)' }}
                  placeholder="123456"
                  maxLength={8}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '0.75rem', padding: '0.7rem 1.25rem' }} disabled={loading}>
                {loading ? 'Confirming...' : 'Verify Code & Claim'}
              </button>
            </form>
          </div>
        )}

        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={(scanned) => {
            setIsScannerOpen(false);
            setIdentifier(scanned);
            handleInitiate(scanned);
          }}
        />
      </main>
    </div>
  );
}

export default function ClaimWarrantyPage() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading claim portal...</div>}>
        <ClaimWarrantyContent />
      </Suspense>
    </div>
  );
}

