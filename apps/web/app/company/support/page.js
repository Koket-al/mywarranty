'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { LifeBuoy, ArrowRight } from 'lucide-react';

export default function CompanySupportListPage() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await apiRequest('/api/support/tickets');
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = statusFilter ? tickets.filter(t => t.status === statusFilter) : tickets;

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Support Cases & Claims
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Review customer hardware claims, run structured AI investigations, and record final decisions
              </p>
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="waiting_for_customer">Waiting for Customer</option>
              <option value="decision_made">Decision Made</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading tickets...</div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <LifeBuoy size={40} color="var(--bg)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--bg)', marginBottom: '0.5rem' }}>No support cases</h3>
              <p style={{ color: 'rgba(241, 165, 1, 0.75)', fontSize: '0.875rem' }}>
                When customers submit warranty claims or questions, they will appear here.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Subject</th>
                    <th>Warranty ID</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                      <td>{t.subject}</td>
                      <td>{t.warrantyId?.warrantyNumber || 'N/A'}</td>
                      <td>{t.warrantyId?.product?.brand} {t.warrantyId?.product?.name}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link href={`/company/support/${t._id}`} className="btn btn-secondary btn-sm">
                          Review Case <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

