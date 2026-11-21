'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { Search, PlusCircle, FileDown, ArrowRight } from 'lucide-react';

export default function CompanyWarrantiesListPage() {
  const [warranties, setWarranties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async (query = '') => {
    try {
      const url = query ? `/api/warranties?search=${encodeURIComponent(query)}` : '/api/warranties';
      const data = await apiRequest(url);
      setWarranties(data.warranties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadWarranties(search);
  };

  const now = new Date();

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                Issued Digital Warranties
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Manage all registered customer warranties, cryptographic proofs, and downloads
              </p>
            </div>

            <Link href="/company/warranties/new" className="btn btn-primary">
              <PlusCircle size={18} /> Issue Warranty
            </Link>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search by warranty number, customer name, email, or serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={18} color="var(--bg)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.85 }} />
              </div>
              <button type="submit" className="btn btn-secondary">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading records...</div>
          ) : warranties.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'rgba(241, 165, 1, 0.75)' }}>No warranties match the search criteria.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Warranty ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Serial Number</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warranties.map(w => {
                    const isExpired = new Date(w.warranty?.expiryDate) < now;
                    return (
                      <tr key={w._id}>
                        <td style={{ fontWeight: 600 }}>{w.warrantyNumber}</td>
                        <td>{w.product?.brand} {w.product?.name}</td>
                        <td>
                          <div>{w.customerSnapshot?.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(241, 165, 1, 0.75)' }}>{w.customerSnapshot?.email}</div>
                        </td>
                        <td>{w.product?.serialNumber || 'N/A'}</td>
                        <td>{new Date(w.warranty?.expiryDate).toLocaleDateString()}</td>
                        <td><StatusBadge status={isExpired ? 'EXPIRED' : w.recordStatus} /></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <Link href={`/company/warranties/${w._id}`} className="btn btn-secondary btn-sm" style={{ marginRight: '0.4rem' }}>
                            View <ArrowRight size={13} />
                          </Link>
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/warranties/${w._id}/pdf`} className="btn btn-secondary btn-sm" download>
                            <FileDown size={13} /> PDF
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

