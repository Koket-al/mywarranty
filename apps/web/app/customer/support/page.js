'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import { apiRequest } from '../../../services/api';
import { PlusCircle, LifeBuoy, X } from 'lucide-react';

function CustomerSupportContent() {
  const searchParams = useSearchParams();
  const preselectedWarrantyId = searchParams.get('warrantyId') || '';

  const [tickets, setTickets] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedWarrantyId);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(preselectedWarrantyId);
  const [requestType, setRequestType] = useState('warranty_claim');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tRes, wRes] = await Promise.all([
        apiRequest('/api/support/tickets'),
        apiRequest('/api/claims/my-warranties')
      ]);
      setTickets(tRes.tickets || []);
      setWarranties(wRes.warranties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = await apiRequest('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          warrantyId: selectedWarrantyId,
          requestType,
          subject,
          description
        })
      });

      if (data.success) {
        setIsModalOpen(false);
        setSubject('');
        setDescription('');
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit support request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar mode="customer" />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              Support & Warranty Claims
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Communicate directly with your retailer for device issues and warranty claims
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-accent">
            <PlusCircle size={18} /> Open Support Request
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading support tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <LifeBuoy size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>No active support requests</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Experiencing a hardware defect or question with your device? Submit a request to the issuing retailer.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              Open Support Request
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Subject</th>
                  <th>Device / Warranty</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                    <td>{t.subject}</td>
                    <td>{t.warrantyId?.product?.brand} {t.warrantyId?.product?.name} ({t.warrantyId?.warrantyNumber})</td>
                    <td><span className="badge badge-info">{t.requestType.replace('_', ' ')}</span></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{new Date(t.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/customer/support/${t._id}`} className="btn btn-secondary btn-sm">
                        View Thread
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New Ticket Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Open Support Request</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleCreateTicket}>
                <div className="form-group">
                  <label className="form-label">Select Claimed Device <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={selectedWarrantyId}
                    onChange={(e) => setSelectedWarrantyId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose registered device --</option>
                    {warranties.map(w => (
                      <option key={w._id} value={w._id}>
                        {w.product?.brand} {w.product?.name} ({w.warrantyNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Request Type</label>
                  <select
                    className="form-control"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                  >
                    <option value="warranty_claim">Warranty Hardware Claim</option>
                    <option value="product_issue">Product Operational Issue</option>
                    <option value="warranty_question">Warranty Question</option>
                    <option value="document_correction">Document Correction</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief summary of the issue (e.g. Battery not charging)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description <span className="required">*</span></label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe what occurred, any error messages, and when it started..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerSupportPage() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading support portal...</div>}>
        <CustomerSupportContent />
      </Suspense>
    </div>
  );
}

