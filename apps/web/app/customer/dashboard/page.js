'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatCard from '../../../components/StatCard';
import StatusBadge from '../../../components/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../services/api';
import { FileCheck2, Clock, LifeBuoy, QrCode, ArrowRight } from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const [wRes, tRes] = await Promise.all([
        apiRequest('/api/claims/my-warranties'),
        apiRequest('/api/support/tickets')
      ]);
      setWarranties(wRes.warranties || []);
      setTickets(tRes.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const activeWarranties = warranties.filter(w => new Date(w.warranty?.expiryDate) > now && w.recordStatus !== 'revoked');
  const openTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'decision_made');

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="customer" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                Welcome, {user?.fullName || 'Customer'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Manage your claimed electronics warranties, document downloads, and service requests
              </p>
            </div>
            <Link href="/customer/claim-warranty" className="btn btn-accent">
              <QrCode size={18} /> Claim New Warranty
            </Link>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <StatCard title="Total Warranties" value={warranties.length} icon={FileCheck2} />
            <StatCard title="Active Warranties" value={activeWarranties.length} icon={Clock} color="var(--success)" />
            <StatCard title="Open Support Cases" value={openTickets.length} icon={LifeBuoy} color="var(--warning)" />
          </div>

          {/* Claimed Warranties Section */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h2 className="card-title">My Recent Warranties</h2>
              <Link href="/customer/warranties" className="btn btn-secondary btn-sm">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(241, 165, 1, 0.75)' }}>Loading records...</div>
            ) : warranties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <QrCode size={40} color="var(--bg)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--bg)', marginBottom: '0.5rem' }}>No claimed warranties yet</h3>
                <p style={{ color: 'rgba(241, 165, 1, 0.75)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Have a receipt with a QR code or warranty ID? Add it to your account in seconds.
                </p>
                <Link href="/customer/claim-warranty" className="btn btn-gold btn-sm">
                  Claim Your Warranty
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Warranty Number</th>
                      <th>Product</th>
                      <th>Retailer</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warranties.slice(0, 5).map(w => (
                      <tr key={w._id}>
                        <td style={{ fontWeight: 600 }}>{w.warrantyNumber}</td>
                        <td>{w.product?.brand} {w.product?.name}</td>
                        <td>{w.companySnapshot?.businessName}</td>
                        <td>{new Date(w.warranty?.expiryDate).toLocaleDateString()}</td>
                        <td><StatusBadge status={new Date(w.warranty?.expiryDate) < now ? 'EXPIRED' : w.recordStatus} /></td>
                        <td>
                          <Link href={`/customer/warranties/${w._id}`} className="btn btn-secondary btn-sm">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

