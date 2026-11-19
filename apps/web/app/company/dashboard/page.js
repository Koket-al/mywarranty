'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatCard from '../../../components/StatCard';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../services/api';
import { 
  FileCheck2, 
  Clock, 
  AlertTriangle, 
  Package, 
  LifeBuoy, 
  PlusCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function CompanyDashboardPage() {
  const { activeCompany } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await apiRequest('/api/companies/me/dashboard');
      setMetrics(data.metrics);
      setRecentEvents(data.recentEvents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="title-with-line" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                {activeCompany?.businessName || 'Retailer Workspace'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Operational overview of your issued warranties, claims, and product catalog
              </p>
            </div>

            <Link href="/company/warranties/new" className="btn btn-primary">
              <PlusCircle size={18} /> Issue New Warranty
            </Link>
          </div>

          <div className="deco-line-h" style={{ margin: '0 0 2rem 0' }} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading metrics...</div>
          ) : (
            <>
              {/* Primary Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <StatCard 
                  title="Total Issued" 
                  value={metrics?.totalWarranties || 0} 
                  icon={FileCheck2} 
                  subtext="Lifetime warranties"
                />
                <StatCard 
                  title="Active Warranties" 
                  value={metrics?.activeWarranties || 0} 
                  icon={Clock} 
                  color="var(--success)"
                  subtext="Currently within validity"
                />
                <StatCard 
                  title="Expiring in 30 Days" 
                  value={metrics?.upcomingExpirations || 0} 
                  icon={AlertTriangle} 
                  color="var(--warning)"
                  subtext="Approaching term conclusion"
                />
                <StatCard 
                  title="Claims Awaiting Review" 
                  value={metrics?.claimsAwaitingReview || 0} 
                  icon={LifeBuoy} 
                  color="var(--danger)"
                  subtext="Requires human decision"
                />
                <StatCard 
                  title="Active Products" 
                  value={metrics?.productCount || 0} 
                  icon={Package} 
                  subtext="Catalog items"
                />
              </div>

              {/* Two Column Layout: Quick Actions + Recent Audit Activity */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {/* Quick Shortcuts */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Quick Actions</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link href="/company/warranties/new" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Issue Individual Warranty</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link href="/company/policies" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Manage Warranty Policies & Terms</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link href="/company/products" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Manage Product Catalog</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link href="/company/support" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Review Support Cases & Claims</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link href="/company/employees" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                      <span>Invite Employees & Assign Roles</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Recent Event Log */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={18} color="var(--accent)" /> Recent Activity
                    </h2>
                  </div>
                  {recentEvents.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent events recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                      {recentEvents.map((evt, idx) => (
                        <div key={idx} style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '0.8125rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>
                              {evt.eventType.replace('_', ' ')}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>by {evt.actor}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(evt.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

