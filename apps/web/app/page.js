'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { ShieldCheck, QrCode, Cpu, CheckCircle2, Lock, Store } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '5rem 1.5rem 3.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          backgroundColor: '#ccfbf1',
          color: '#0f766e',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={16} /> Ethiopia-First Digital Warranty Platform
        </div>

        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          color: 'var(--primary)',
          lineHeight: 1.15,
          letterSpacing: '-1px',
          marginBottom: '1.25rem'
        }}>
          Every product has a story.<br />
          <span style={{ color: 'var(--accent)' }}>Make that story verifiable.</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Ewnet empowers independent electronics and technology retailers to issue tamper-evident digital warranties with instant QR verification, immutable terms, and AI-assisted claims support.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register-company" className="btn btn-primary btn-lg">
            <Store size={18} /> Register Your Retail Shop
          </Link>
          <Link href="/register" className="btn btn-accent btn-lg">
            Create Customer Account
          </Link>
          <Link href="/verify/manual" className="btn btn-secondary btn-lg">
            <QrCode size={18} /> Verify a Warranty
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        maxWidth: '1100px',
        margin: '2rem auto 5rem',
        padding: '0 1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.75rem'
        }}>
          <div className="card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <QrCode size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Instant QR Verification
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Customers scan a unique QR code directly with any smartphone camera. No app download or account creation required for basic authenticity and expiry lookups.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Cryptographic Integrity
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Each issued record captures an immutable snapshot of terms and is sealed with an asymmetric digital signature (RSA-SHA256). Any silent modification is immediately detected.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#f3e8ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              AI Triage, Human Decision
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Our AI Support Assistant analyzes customer complaints and diagnostic photos against the exact policy snapshot issued. A human retailer employee always makes the final decision.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Guarantees */}
      <section style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
            Built on Core Principles
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', textAlign: 'left', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No universal policy imposed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No silent policy rewrites</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Single honest trust label: Seller registered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem'
      }}>
        <p>© 2026 Ewnet (እውነት). All rights reserved. Designed for independent electronics retailers.</p>
      </footer>
    </div>
  );
}

