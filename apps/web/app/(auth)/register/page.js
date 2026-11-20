'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { apiRequest } from '../../../services/api';
import { User, Mail, Lock } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
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
      const data = await apiRequest('/api/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });

      if (data.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=email_verification`);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bg)', marginBottom: '0.35rem' }}>
              Create Customer Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(241, 165, 1, 0.75)' }}>
              Manage your digital warranties, downloads, and service claims
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Full Name <span className="required" style={{ color: 'var(--bg)', opacity: 0.85 }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. Abebe Kebede"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={16} color="var(--bg)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.85 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Email Address <span className="required" style={{ color: 'var(--bg)', opacity: 0.85 }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="var(--bg)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.85 }} />
              </div>
              <span className="form-hint" style={{ color: 'rgba(241, 165, 1, 0.75)', marginTop: '0.35rem', display: 'block' }}>
                A one-time verification code will be sent to this address.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Password <span className="required" style={{ color: 'var(--bg)', opacity: 0.85 }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Lock size={16} color="var(--bg)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.85 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Confirm Password <span className="required" style={{ color: 'var(--bg)', opacity: 0.85 }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="var(--bg)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.85 }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.7rem 1.25rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Continue to Verification'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'rgba(241, 165, 1, 0.75)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--bg)', fontWeight: 700, textDecoration: 'underline' }}>
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

