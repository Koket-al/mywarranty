'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      if (data.memberships && data.memberships.length > 0) {
        router.push('/company/dashboard');
      } else if (data.user?.isPlatformAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err) {
      if (err.data?.requiresEmailVerification) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=email_verification`);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '420px', margin: '3.5rem auto', padding: '0 1rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bg)', marginBottom: '0.35rem' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(241, 165, 1, 0.75)' }}>
              Sign in to your customer or retailer account
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Email Address</label>
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
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--bg)', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'rgba(241, 165, 1, 0.75)' }}>
            <div style={{ marginBottom: '0.5rem' }}>Don't have an account yet?</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ color: 'var(--bg)', fontWeight: 700, textDecoration: 'underline' }}>
                Create Customer Account
              </Link>
              <span style={{ color: 'rgba(241, 165, 1, 0.5)' }}>•</span>
              <Link href="/register-company" style={{ color: 'var(--bg)', fontWeight: 700, textDecoration: 'underline' }}>
                Retailer Register
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

