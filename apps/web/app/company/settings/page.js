'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { apiRequest } from '../../../services/api';

export default function CompanySettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [timezone, setTimezone] = useState('Africa/Addis_Ababa');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiRequest('/api/companies/me');
      const c = data.company;
      if (c) {
        setBusinessName(c.businessName || '');
        setPhone(c.phone || '');
        setAddress(c.address || '');
        setWebsite(c.website || '');
        setTimezone(c.timezone || 'Africa/Addis_Ababa');
        setDescription(c.description || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiRequest('/api/companies/me', {
        method: 'PATCH',
        body: JSON.stringify({
          businessName,
          phone,
          address,
          website,
          timezone,
          description
        })
      });

      if (data.success) {
        setSuccess('Company profile successfully updated.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '750px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              Company Settings & Profile
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Update store branding, contact information, and public support details
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading settings...
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Business / Retail Shop Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+251 91 122 3344"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Store Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bole Medhanialem Mall, 2nd Floor, Addis Ababa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Store Timezone</label>
                  <select
                    className="form-control"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT, UTC+3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Public Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Tell customers about your electronics specialization..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

