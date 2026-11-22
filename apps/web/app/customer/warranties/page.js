'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { Search, QrCode, FileDown, ArrowRight } from 'lucide-react';

export default function CustomerWarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    try {
      const data = await apiRequest('/api/claims/my-warranties');
      setWarranties(data.warranties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const filtered = warranties.filter(w => 
    w.warrantyNumber?.toLowerCase().includes(search.toLowerCase()) ||
    w.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.product?.brand?.toLowerCase().includes(search.toLowerCase()) ||
    w.companySnapshot?.businessName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="customer" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                My Claimed Warranties
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Official records of your registered electronic devices and terms
              </p>
            </div>
            <Link href="/customer/claim-warranty" className="btn btn-accent">
              <QrCode size={18} /> Claim Another Warranty
            </Link>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by product, brand, retailer, or warranty ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} color="var(--bg)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.85 }} />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading warranties...</div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'rgba(241, 165, 1, 0.75)' }}>No warranties match your query.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(w => {
                const isExpired = new Date(w.warranty?.expiryDate) < now;
                return (
                  <div key={w._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--bg)', letterSpacing: '0.5px' }}>
                          {w.warrantyNumber}
                        </span>
                        <StatusBadge status={isExpired ? 'EXPIRED' : w.recordStatus} />
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--bg)', marginBottom: '0.25rem' }}>
                        {w.product?.brand} {w.product?.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(241, 165, 1, 0.75)', marginBottom: '1rem' }}>
                        Retailer: <strong style={{ color: 'var(--bg)' }}>{w.companySnapshot?.businessName}</strong>
                      </div>

                      <div style={{
                        backgroundColor: 'var(--surface-alt)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        marginBottom: '1.25rem',
                        color: 'var(--bg)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'rgba(241, 165, 1, 0.75)' }}>Valid From:</span>
                          <span>{new Date(w.warranty?.startDate).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'rgba(241, 165, 1, 0.75)' }}>Expires:</span>
                          <strong style={{ color: isExpired ? 'var(--bg)' : 'var(--bg)' }}>
                            {new Date(w.warranty?.expiryDate).toLocaleDateString()}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Policy:</span>
                          <span>{w.policySnapshot?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link href={`/customer/warranties/${w._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        View Terms <ArrowRight size={14} />
                      </Link>
                      <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/warranties/${w._id}/pdf`} className="btn btn-primary btn-sm" download>
                        <FileDown size={14} /> PDF
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

