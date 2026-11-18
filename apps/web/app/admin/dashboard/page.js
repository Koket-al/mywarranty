'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import StatCard from '../../../components/StatCard';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { Building2, Users, FileCheck2, Shield, Ban, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('companies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [mRes, cRes, uRes, aRes] = await Promise.all([
        apiRequest('/api/admin/metrics'),
        apiRequest('/api/admin/companies'),
        apiRequest('/api/admin/users'),
        apiRequest('/api/admin/audit-logs')
      ]);
      setMetrics(mRes.metrics);
      setCompanies(cRes.companies || []);
      setUsers(uRes.users || []);
      setAuditLogs(aRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (companyId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change company status to ${newStatus}?`)) return;

    try {
      await apiRequest(`/api/admin/companies/${companyId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update company status.');
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              Platform Administration
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System-level supervision, retailer verification, account governance, and audit explorer
          </p>
        </div>

        {/* System Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard title="Registered Companies" value={metrics?.totalCompanies || 0} icon={Building2} />
          <StatCard title="Total Platform Users" value={metrics?.totalUsers || 0} icon={Users} color="var(--accent)" />
          <StatCard title="Warranties Issued" value={metrics?.totalWarrantiesIssued || 0} icon={FileCheck2} color="var(--success)" />
          <StatCard title="Audit Log Entries" value={metrics?.totalAuditEvents || 0} icon={Shield} color="var(--info)" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('companies')}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'companies' ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === 'companies' ? 700 : 500,
              color: activeTab === 'companies' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === 'users' ? 700 : 500,
              color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'audit' ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === 'audit' ? 700 : 500,
              color: activeTab === 'audit' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Audit Log Explorer
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading platform records...
          </div>
        ) : activeTab === 'companies' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Owner</th>
                  <th>Contact Email</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.businessName}</td>
                    <td>{c.ownerUserId?.fullName || 'N/A'}</td>
                    <td>{c.email}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(c._id, c.status)}
                        className={`btn ${c.status === 'active' ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                      >
                        {c.status === 'active' ? <><Ban size={13} /> Suspend</> : <><CheckCircle2 size={13} /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'users' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td><StatusBadge status={u.emailVerified ? 'VERIFIED' : 'UNVERIFIED'} /></td>
                    <td>{u.isPlatformAdmin ? <span className="badge badge-info">Platform Admin</span> : 'User'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(a => (
                  <tr key={a._id}>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td><span className="badge badge-info">{a.action}</span></td>
                    <td>{a.actorUserId?.fullName || 'System'}</td>
                    <td>{a.resourceType}</td>
                    <td><code style={{ fontSize: '0.75rem' }}>{a.resourceId}</code></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

