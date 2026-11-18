'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import { apiRequest } from '../../../services/api';
import { Bot, Sparkles, Check, Copy } from 'lucide-react';
import Link from 'next/link';

export default function CompanyAiAssistantPage() {
  const [category, setCategory] = useState('Smartphones & Mobile Devices');
  const [durationMonths, setDurationMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiRequest('/api/ai/policy-assistant', {
        method: 'POST',
        body: JSON.stringify({ category, durationMonths: Number(durationMonths) })
      });
      setSuggestions(data.suggestions);
    } catch (err) {
      alert('Failed to generate suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar mode="company" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: '900px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#f3e8ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={18} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                Policy Drafting Assistant
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Use AI to draft professional, legally clear warranty terms, hardware coverage definitions, and exclusion clauses
            </p>
          </div>

          <div className="card" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Electronics Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Smartphones & Mobile Devices">Smartphones & Mobile Devices</option>
                  <option value="Laptops & Computing Equipment">Laptops & Computing Equipment</option>
                  <option value="Televisions & Home Theaters">Televisions & Home Theaters</option>
                  <option value="Audio Equipment">Audio & Headphones</option>
                  <option value="Home & Kitchen Appliances">Home & Kitchen Appliances</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Duration</label>
                <select
                  className="form-control"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                >
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '38px' }}>
                <Sparkles size={16} /> {loading ? 'Drafting...' : 'Generate Clauses'}
              </button>
            </form>
          </div>

          {suggestions && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Recommended Policy Terms ({category})</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Copy any clause or insert directly into your policy drafts
                  </p>
                </div>
                <Link href="/company/policies" className="btn btn-accent btn-sm">
                  Go to Policy Editor
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {suggestions.suggestedClauses?.map((c, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${c.type === 'coverage' ? 'badge-success' : c.type === 'exclusion' ? 'badge-danger' : 'badge-info'}`}>
                          {c.type}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{c.title}</strong>
                      </div>

                      <button
                        onClick={() => handleCopy(`${c.title}\n${c.text}`, idx)}
                        className="btn btn-secondary btn-sm"
                      >
                        {copiedIdx === idx ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                        {copiedIdx === idx ? 'Copied' : 'Copy Clause'}
                      </button>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

