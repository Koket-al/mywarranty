'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { QrCode, Cpu, CheckCircle2, Lock, Store } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '5.5rem 1.5rem 3.5rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Decorative corner guidelines */}
        <div style={{
          position: 'absolute',
          top: '2rem',
          left: '1.5rem',
          width: '40px',
          height: '40px',
          borderTop: '2px solid var(--accent)',
          borderLeft: '2px solid var(--accent)',
          opacity: 0.4
        }} />
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '1.5rem',
          width: '40px',
          height: '40px',
          borderTop: '2px solid var(--accent)',
          borderRight: '2px solid var(--accent)',
          opacity: 0.4
        }} />

        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: 800,
          color: 'var(--primary)',
          lineHeight: 1.15,
          fontFamily: 'var(--font-serif)',
          letterSpacing: '-0.02em',
          marginBottom: '1.25rem'
        }}>
          Every product has a story.<br />
          <span style={{ color: 'var(--accent)' }}>Make that story verifiable.</span>
        </h1>

        {/* Decorative horizontal accent line */}
        <div className="deco-line-h" style={{ maxWidth: '400px', margin: '1.5rem auto' }} />

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          mw empowers independent electronics and technology retailers to issue tamper-evident digital warranties with instant QR verification, immutable terms, and AI-assisted claims support.
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

      {/* Decorative full-width horizontal rule */}
      <div className="deco-line-h" style={{ maxWidth: '1100px', margin: '0 auto 2rem' }} />

      {/* Features Grid */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto 5rem',
        padding: '0 1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.75rem'
        }}>
          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}>
              <QrCode size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
              Instant QR Verification
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Customers scan a unique QR code directly with any smartphone camera. No app download or account creation required for basic authenticity and expiry lookups.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
              Cryptographic Integrity
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Each issued record captures an immutable snapshot of terms and is sealed with an asymmetric digital signature (RSA-SHA256). Any silent modification is immediately detected.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
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
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Top decorative accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '2px',
          background: 'var(--accent)'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
            Built on Core Principles
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', textAlign: 'left', marginTop: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>No universal policy imposed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>No silent policy rewrites</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>Single honest trust label: Seller registered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--primary)',
        color: '#9ba2a4',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="deco-line-h-accent" style={{ maxWidth: '200px', margin: '0 auto 1.5rem', opacity: 0.6 }} />
        <p>© 2026 mw. All rights reserved. Designed for independent electronics retailers.</p>
      </footer>
    </div>
  );
}

