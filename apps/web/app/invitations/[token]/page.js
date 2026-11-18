'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../services/api';
import { Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;
  const { user, refreshSession } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      loadInvitation(token);
    }
  }, [token]);

  const loadInvitation = async (t) => {
    try {
      const data = await apiRequest(`/api/invitations/${t}`);
      setInvitation(data.invitation);
    } catch (err) {
      setError(err.message || 'Invitation is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    try {
      const data = await apiRequest(`/api/invitations/${token}/accept`, { method: 'POST' });
      setSuccess('Invitation accepted! Updating your workspace...');
      await refreshSession();
      setTimeout(() => {
        router.push('/company/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to accept invitation.');
      setAccepting(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '480px', margin: '3.5rem auto', padding: '0 1rem' }}>
        <div className="card">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading invitation details...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.25rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
                Invitation Error
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
              <Link href="/login" className="btn btn-secondary">
                Return to Login
              </Link>
            </div>
          )}

          {success && (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.25rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                Welcome to the Team!
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>{success}</p>
            </div>
          )}

          {invitation && !success && !error && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Building2 size={28} />
                </div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Join {invitation.company?.businessName}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  You have been invited to join the staff on Ewnet
                </p>
              </div>

              <div style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.25rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Invited Email:</span>
                  <strong>{invitation.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
                  <span className="badge badge-info">{invitation.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Expires:</span>
                  <span>{new Date(invitation.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

              {user ? (
                <div>
                  <button onClick={handleAccept} className="btn btn-primary" style={{ width: '100%' }} disabled={accepting}>
                    {accepting ? 'Accepting...' : 'Accept Invitation & Enter Workspace'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    Signed in as <strong>{user.email}</strong>
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Please sign in or create an account with <strong>{invitation.email}</strong> to accept this invitation.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link href={`/login?redirect=/invitations/${token}`} className="btn btn-secondary">
                      Sign In
                    </Link>
                    <Link href={`/register?email=${encodeURIComponent(invitation.email)}`} className="btn btn-accent">
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

