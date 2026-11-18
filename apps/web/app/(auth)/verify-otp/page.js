'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../services/api';
import { CheckCircle2, RotateCw } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  const purposeParam = searchParams.get('purpose') || 'email_verification';

  const [email, setEmail] = useState(emailParam);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await apiRequest('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode, purpose: purposeParam })
      });

      if (data.success) {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setMessage('');

    try {
      const data = await apiRequest('/api/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose: purposeParam })
      });
      setMessage(data.message || 'A new code has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main style={{ maxWidth: '420px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            Enter Verification Code
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            We sent a 6-digit code to <strong>{email || 'your email'}</strong>
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          {!emailParam && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">6-Digit OTP Code</label>
            <input
              type="text"
              className="form-control"
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.35rem',
                fontWeight: 700
              }}
              maxLength={8}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              autoFocus
            />
            <span className="form-hint" style={{ textAlign: 'center', display: 'block' }}>
              Valid for 10 minutes
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RotateCw size={14} /> {resending ? 'Sending...' : 'Resend Verification Code'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading verification...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}

