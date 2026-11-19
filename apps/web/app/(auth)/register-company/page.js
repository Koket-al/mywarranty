'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../services/api';
import { Building2, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function CompanyRegisterPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/company/register', {
        method: 'POST',
        body: JSON.stringify({ businessName, email, password, confirmPassword })
      });

      if (data.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=email_verification`);
      }
    } catch (err) {
      setError(err.message || 'Retailer registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '460px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              border: '1px solid var(--border)'
            }}>
              <Building2 size={24} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
              Register Your Retail Shop
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Start issuing tamper-evident digital warranties in minutes
            </p>
            <div className="deco-line-h" style={{ maxWidth: '120px', margin: '0.85rem auto 0' }} />
          </div>

          <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            color: 'var(--primary)',
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span><strong>Instant Setup:</strong> Email verification is sufficient to begin issuing digital warranties immediately. No document uploads required.</span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Business / Shop Name <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="e.g. Bole Electronics Hub"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
                <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business Email Address <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="contact@yourbusiness.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span className="form-hint">A one-time OTP verification code will be sent to this email.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Registering Shop...' : 'Create Retailer Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already registered? <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

