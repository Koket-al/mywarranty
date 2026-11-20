'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import { apiRequest } from '../../../../services/api';
import { CheckCircle2, ShieldCheck, QrCode, FileDown, ArrowRight, ArrowLeft } from 'lucide-react';

export default function IssueWarrantyPage() {
  const [products, setProducts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [productId, setProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceReference, setInvoiceReference] = useState('');
  const [policyId, setPolicyId] = useState('');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [issuedWarranty, setIssuedWarranty] = useState(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [pRes, polRes] = await Promise.all([
        apiRequest('/api/products'),
        apiRequest('/api/policies')
      ]);
      setProducts(pRes.products || []);
      setPolicies(polRes.policies || []);
    } catch (err) {
      setError('Failed to load products or policies catalog.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const selectedProduct = products.find(p => p._id === productId);
  const selectedPolicy = policies.find(p => p._id === policyId);
  const publishedVersion = selectedPolicy?.currentPublishedVersionId;

  // Calculate Expiry Preview
  let calculatedExpiry = '';
  if (purchaseDate && publishedVersion) {
    const d = new Date(purchaseDate);
    if (publishedVersion.durationUnit === 'days') {
      d.setDate(d.getDate() + Number(publishedVersion.duration));
    } else if (publishedVersion.durationUnit === 'years') {
      d.setFullYear(d.getFullYear() + Number(publishedVersion.duration));
    } else {
      d.setMonth(d.getMonth() + Number(publishedVersion.duration));
    }
    calculatedExpiry = d.toLocaleDateString();
  }

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!productId) return setError('Please select a product from your catalog.');
      if (selectedProduct?.serialNumberRequired && !serialNumber.trim()) {
        return setError(`Serial number is required for ${selectedProduct.name}.`);
      }
      setStep(2);
    } else if (step === 2) {
      if (!customerName.trim() || !customerEmail.trim()) {
        return setError('Customer full name and email address are required.');
      }
      setStep(3);
    } else if (step === 3) {
      if (!policyId) return setError('Please select a published warranty policy.');
      if (!publishedVersion) return setError('Selected policy does not have a published version.');
      setStep(4); // Review step
    }
  };

  const handleConfirmIssuance = async () => {
    setSubmitting(true);
    setError('');

    try {
      const data = await apiRequest('/api/warranties', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          customerName,
          customerEmail,
          customerPhone,
          serialNumber,
          purchaseDate,
          invoiceReference,
          policyId
        })
      });

      if (data.success) {
        setIssuedWarranty(data.warranty);
        setStep(5); // Completed confirmation step
      }
    } catch (err) {
      setError(err.message || 'Failed to issue warranty.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
              Issue Individual Digital Warranty
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create an immutable, cryptographically signed digital warranty record for your customer
            </p>
          </div>

          {/* Stepper Indicator */}
          {step < 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: step === 1 ? 700 : 500, color: step === 1 ? 'var(--accent)' : 'var(--text-muted)' }}>
                1. Product & Serial
              </span>
              <span>›</span>
              <span style={{ fontWeight: step === 2 ? 700 : 500, color: step === 2 ? 'var(--accent)' : 'var(--text-muted)' }}>
                2. Customer
              </span>
              <span>›</span>
              <span style={{ fontWeight: step === 3 ? 700 : 500, color: step === 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                3. Policy Terms
              </span>
              <span>›</span>
              <span style={{ fontWeight: step === 4 ? 700 : 500, color: step === 4 ? 'var(--accent)' : 'var(--text-muted)' }}>
                4. Confirm
              </span>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {loadingInitial ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading products and policies...
            </div>
          ) : (
            <div className="card">
              {/* Step 1: Product Selection */}
              {step === 1 && (
                <form onSubmit={handleNext}>
                  <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Step 1: Product & Purchase</h2>

                  <div className="form-group">
                    <label className="form-label">Select Product <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose catalog item --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.brand} {p.name} ({p.model})
                        </option>
                      ))}
                    </select>
                    {products.length === 0 && (
                      <span className="form-hint" style={{ color: 'var(--danger)' }}>
                        No products in catalog. <Link href="/company/products">Add a product first</Link>.
                      </span>
                    )}

                    {selectedProduct && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.75rem' }}>
                        {selectedProduct.imageUrl ? (
                          <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: 'none', background: 'var(--feature-secondary)', flexShrink: 0 }}>
                            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={24} color="var(--text-muted)" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>
                            {selectedProduct.brand} {selectedProduct.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Model: {selectedProduct.model} · Category: {selectedProduct.category}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Device Serial Number {selectedProduct?.serialNumberRequired && <span className="required">*</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. SN-9821873891"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      required={selectedProduct?.serialNumberRequired}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Purchase Date <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Invoice / Receipt Reference</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. INV-2026-0044"
                        value={invoiceReference}
                        onChange={(e) => setInvoiceReference(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary">
                      Next: Customer Details <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Customer Details */}
              {step === 2 && (
                <form onSubmit={handleNext}>
                  <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Step 2: Customer Information</h2>

                  <div className="form-group">
                    <label className="form-label">Customer Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Almaz Tadesse"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                    <span className="form-hint">
                      The digital certificate and ownership verification OTP will be sent here.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+251 9..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Next: Policy Terms <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Policy Selection */}
              {step === 3 && (
                <form onSubmit={handleNext}>
                  <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Step 3: Select Published Warranty Policy</h2>

                  <div className="form-group">
                    <label className="form-label">Warranty Policy <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={policyId}
                      onChange={(e) => setPolicyId(e.target.value)}
                      required
                    >
                      <option value="">-- Select published policy --</option>
                      {policies.filter(pol => !!pol.currentPublishedVersionId).map(pol => (
                        <option key={pol._id} value={pol._id}>
                          {pol.name} ({pol.currentPublishedVersionId.duration} {pol.currentPublishedVersionId.durationUnit})
                        </option>
                      ))}
                    </select>
                    {policies.filter(pol => !!pol.currentPublishedVersionId).length === 0 && (
                      <span className="form-hint" style={{ color: 'var(--danger)' }}>
                        No published policies available. <Link href="/company/policies">Create and publish a policy</Link>.
                      </span>
                    )}
                  </div>

                  {publishedVersion && (
                    <div style={{
                      backgroundColor: 'var(--bg)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Policy Summary (Version {publishedVersion.versionNumber})
                      </div>
                      <div>Duration: <strong>{publishedVersion.duration} {publishedVersion.durationUnit}</strong></div>
                      <div>Start Rule: <strong>{publishedVersion.startDateRule.replace('_', ' ')}</strong></div>
                      <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Clauses configured: {publishedVersion.clauses?.length || 0} coverage & exclusion terms.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Next: Review & Confirm <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Review Preview & Issuance Confirmation */}
              {step === 4 && (
                <div>
                  <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Step 4: Review Before Issuance</h2>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Product:</span>
                      <strong>{selectedProduct?.brand} {selectedProduct?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Serial Number:</span>
                      <span>{serialNumber || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                      <strong>{customerName} ({customerEmail})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Purchase Date:</span>
                      <span>{new Date(purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Policy Applied:</span>
                      <span>{selectedPolicy?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Calculated Expiration:</span>
                      <strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>{calculatedExpiry}</strong>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--accent-light)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    fontSize: '0.8125rem',
                    color: 'var(--primary)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                    <span>Upon confirmation, MW (My Warranty) will generate an asymmetric digital signature (RSA-SHA256) and an unguessable QR token. Policy terms are immutably snapshotted.</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" onClick={() => setStep(3)} className="btn btn-secondary" disabled={submitting}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button onClick={handleConfirmIssuance} className="btn btn-primary btn-lg" disabled={submitting}>
                      {submitting ? 'Signing & Issuing...' : 'Confirm & Issue Warranty'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Completed Warranty Issued */}
              {step === 5 && issuedWarranty && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--success-bg)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    Warranty Successfully Issued!
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    The digital warranty record has been sealed and anchored.
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg)',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    maxWidth: '420px',
                    margin: '0 auto 1.5rem',
                    fontSize: '0.875rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Warranty Number:</span>
                      <strong>{issuedWarranty.warrantyNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Expires:</span>
                      <strong>{new Date(issuedWarranty.expiryDate).toLocaleDateString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>SHA-256 Hash:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {issuedWarranty.recordHash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/warranties/${issuedWarranty.id}/pdf`} className="btn btn-primary" download>
                      <FileDown size={16} /> Download Official PDF
                    </a>
                    <Link href={`/verify/${issuedWarranty.qrToken}`} target="_blank" className="btn btn-secondary">
                      <QrCode size={16} /> View Public QR Page
                    </Link>
                    <Link href="/company/warranties" className="btn btn-secondary">
                      View All Warranties
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

