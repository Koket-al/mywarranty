'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { UserPlus, Users, Trash2, X, ShieldAlert } from 'lucide-react';

export default function CompanyEmployeesPage() {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('warranty_officer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const [mRes, iRes] = await Promise.all([
        apiRequest('/api/companies/me/members'),
        apiRequest('/api/companies/me/invitations')
      ]);
      setMembers(mRes.members || []);
      setInvitations(iRes.invitations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest('/api/companies/me/invitations', {
        method: 'POST',
        body: JSON.stringify({ email, role })
      });

      if (data.success) {
        setIsModalOpen(false);
        setEmail('');
        setSuccess(`Invitation sent to ${email}`);
        loadStaffData();
      }
    } catch (err) {
      setError(err.message || 'Failed to send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeInvite = async (id) => {
    try {
      await apiRequest(`/api/companies/me/invitations/${id}`, { method: 'DELETE' });
      loadStaffData();
    } catch (err) {
      alert(err.message || 'Failed to revoke invitation.');
    }
  };

  const handleRemoveMember = async (member) => {
    if (member.role === 'owner') {
      alert('Protection rule: Company owner cannot be removed.');
      return;
    }
    if (!confirm(`Revoke access for ${member.userId?.fullName || 'employee'}?`)) return;

    try {
      await apiRequest(`/api/companies/me/members/${member._id}`, { method: 'DELETE' });
      loadStaffData();
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await apiRequest(`/api/companies/me/members/${memberId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      loadStaffData();
    } catch (err) {
      alert(err.message || 'Failed to update employee role.');
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
                Staff & Employee Access
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Invite staff, assign role permissions, and manage shop operational access
              </p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <UserPlus size={18} /> Invite Employee
            </button>
          </div>

          {success && <div className="alert alert-success">{success}</div>}

          {/* Active Members Table */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h2 className="card-title">Active Team Members</h2>
              <span className="badge badge-info">{members.length} Members</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading staff...</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Assigned Role</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m._id}>
                        <td style={{ fontWeight: 600 }}>{m.userId?.fullName}</td>
                        <td>{m.userId?.email}</td>
                        <td>
                          {m.role === 'owner' ? (
                            <span className="badge badge-success">Company Owner</span>
                          ) : (
                            <select
                              className="form-control"
                              style={{ padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8125rem' }}
                              value={m.role}
                              onChange={(e) => handleChangeRole(m._id, e.target.value)}
                            >
                              <option value="admin">Company Admin</option>
                              <option value="warranty_officer">Warranty Officer</option>
                              <option value="support_agent">Support Agent</option>
                              <option value="viewer">Viewer (Read-only)</option>
                            </select>
                          )}
                        </td>
                        <td>{new Date(m.joinedAt || m.createdAt).toLocaleDateString()}</td>
                        <td>
                          {m.role !== 'owner' && (
                            <button onClick={() => handleRemoveMember(m)} className="btn btn-secondary btn-sm" title="Revoke access">
                              <Trash2 size={14} color="var(--danger)" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Invitations Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Pending Invitations</h2>
              <span className="badge badge-warning">{invitations.length} Pending</span>
            </div>

            {invitations.length === 0 ? (
              <p style={{ color: 'rgba(241, 165, 1, 0.75)', fontSize: '0.875rem' }}>No pending invitations.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invited Email</th>
                      <th>Role</th>
                      <th>Expires At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map(i => (
                      <tr key={i._id}>
                        <td style={{ fontWeight: 600 }}>{i.email}</td>
                        <td><span className="badge badge-info">{i.role}</span></td>
                        <td>{new Date(i.expiresAt).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => handleRevokeInvite(i._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invite Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Invite New Employee</h3>
                  <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleInvite}>
                  <div className="form-group">
                    <label className="form-label">Employee Email <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="employee@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span className="form-hint">A secure one-time invitation link will be sent to this email.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Predefined Role <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="warranty_officer">Warranty Officer (Can issue warranties, review cases)</option>
                      <option value="admin">Company Admin (Full operational & claim decision authority)</option>
                      <option value="support_agent">Support Agent (Messages & evidence review, no claim decision)</option>
                      <option value="viewer">Viewer (Read-only access)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold" disabled={submitting}>
                      {submitting ? 'Sending Invite...' : 'Send Invitation'}
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

