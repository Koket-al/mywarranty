'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CornerFlourish from '../components/CornerFlourish';
import { 
  QrCode, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck2, 
  HelpCircle,
  Smartphone,
  KeyRound
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Floating Island Navigation */}
      <Navbar />

      <main style={{ flex: 1, padding: '0 1.25rem' }}>
        {/* ==========================================================================
            HERO SECTION: Framed Canvas Card with Ornate Corner Flourishes
            ========================================================================== */}
        <section className="framed-canvas">
          {/* Ornate Architectural Corner Line Flourishes */}
          <CornerFlourish position="top-left" size={88} opacity={0.28} />
          <CornerFlourish position="top-right" size={88} opacity={0.28} />
          <CornerFlourish position="bottom-left" size={88} opacity={0.28} />
          <CornerFlourish position="bottom-right" size={88} opacity={0.28} />

          {/* Centered Black Brand Mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo-black.png" 
                alt="MW Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
          </div>

          {/* Centered Capsule Category Pill */}
          <div className="hero-pill-badge">
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)', 
              display: 'inline-block' 
            }} />
            Digital Warranty & Claim Verification
          </div>

          {/* Serif Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.35rem, 5vw, 3.85rem)',
            fontWeight: 800,
            color: 'var(--primary)',
            lineHeight: 1.15,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.025em',
            maxWidth: '820px',
            margin: '0 auto 1.25rem'
          }}>
            Every product has a story.<br />
            Make that story verifiable.
          </h1>

          {/* Italic Serif Subtitle in Quotes (from reference aesthetic) */}
          <p style={{
            fontSize: '1.25rem',
            fontStyle: 'italic',
            color: 'var(--accent)',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.01em',
            marginBottom: '1.25rem'
          }}>
            “Tamper-evident, verifiable, and protected forever.”
          </p>

          {/* Balanced Centered Summary */}
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '660px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.65
          }}>
            MW (My Warranty) provides electronics and technology retailers with a trusted digital foundation to issue cryptographically signed warranties, instant QR lookup, and AI-assisted claims—without paperwork or dispute.
          </p>

          {/* Primary Action Capsule Buttons (ANON Reference Composition) */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexWrap: 'wrap', 
            marginBottom: '1.25rem' 
          }}>
            <Link 
              href="/register-company" 
              className="btn btn-primary btn-lg" 
              style={{ padding: '0.75rem 1.85rem' }}
            >
              <Store size={18} />
              <span>Register Your Retail Shop</span>
              <ArrowRight size={16} />
            </Link>

            <Link 
              href="/register" 
              className="btn btn-secondary btn-lg" 
              style={{ padding: '0.75rem 1.85rem' }}
            >
              <span>+ Create Customer Account</span>
            </Link>
          </div>

          {/* Auxiliary Pill Button (matching (i) How It Works & FAQs) */}
          <div style={{ marginBottom: '1.75rem' }}>
            <Link 
              href="/verify/manual" 
              className="btn btn-secondary btn-sm"
              style={{ 
                color: 'var(--text-muted)',
                fontSize: '0.825rem',
                padding: '0.35rem 1.15rem'
              }}
            >
              <QrCode size={14} />
              <span>Instant QR Code Lookup</span>
            </Link>
          </div>

          {/* Decorative Hairline Separator */}
          <div style={{
            width: '180px',
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '0 auto 1.5rem'
          }} />

          {/* Trust Guarantees Chips (matching bottom capsule indicators in reference) */}
          <div style={{ 
            display: 'flex', 
            gap: '0.65rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              backgroundColor: 'var(--accent-light)',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              RSA-SHA256 Signed
            </span>

            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              backgroundColor: 'var(--accent-light)',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              Instant Camera Scan
            </span>

            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              backgroundColor: 'var(--accent-light)',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              Zero Paperwork
            </span>
          </div>
        </section>

        {/* ==========================================================================
            SECOND FRAMED SECTION: "How MW Protects Your Peace of Mind" (ANON Reference)
            ========================================================================== */}
        <section id="features" className="framed-canvas" style={{ padding: '4.5rem 2.5rem 4rem' }}>
          {/* Ornate Architectural Corner Line Flourishes */}
          <CornerFlourish position="top-left" size={88} opacity={0.28} />
          <CornerFlourish position="top-right" size={88} opacity={0.28} />
          <CornerFlourish position="bottom-left" size={88} opacity={0.28} />
          <CornerFlourish position="bottom-right" size={88} opacity={0.28} />

          {/* Category Chip */}
          <div className="hero-pill-badge">
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)', 
              display: 'inline-block' 
            }} />
            FAQ & Architecture
          </div>

          {/* Section Headline */}
          <h2 style={{
            fontSize: 'clamp(1.85rem, 3.8vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--primary)',
            lineHeight: 1.2,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem'
          }}>
            How MW Protects Your Peace of Mind
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '620px',
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}>
            Four honest answers about cryptographic trust, instant verification, and customer warranty protection.
          </p>

          {/* Grid of 4 Architectural Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            {/* Card 1 */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '1.75rem 1.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--border)'
              }}>
                <Smartphone size={20} />
              </div>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'var(--font-serif)',
                marginBottom: '0.65rem'
              }}>
                Instant QR Verification
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Customers scan a unique QR code directly with any smartphone camera. No app download or account creation required for instant authenticity and expiry checks.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '1.75rem 1.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--border)'
              }}>
                <KeyRound size={20} />
              </div>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'var(--font-serif)',
                marginBottom: '0.65rem'
              }}>
                Cryptographic Integrity
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Each issued warranty snapshot is sealed with an asymmetric digital signature (RSA-SHA256). Any silent modification to policy terms or dates is instantly detected.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '1.75rem 1.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--border)'
              }}>
                <Cpu size={20} />
              </div>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'var(--font-serif)',
                marginBottom: '0.65rem'
              }}>
                AI Triage, Human Decision
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Our Gemini AI Assistant reviews customer claims and diagnostic photos against the exact frozen policy snapshot. A verified retailer staff member always makes the final claim decision.
              </p>
            </div>

            {/* Card 4 */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '1.75rem 1.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--border)'
              }}>
                <FileCheck2 size={20} />
              </div>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'var(--font-serif)',
                marginBottom: '0.65rem'
              }}>
                Immutable Policy Snapshots
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                The terms in effect at the exact moment of sale remain locked forever. Neither party can unilaterally alter coverage terms after purchase.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            THIRD SECTION: Core Principles Banner
            ========================================================================== */}
        <section id="principles" className="framed-canvas" style={{ padding: '3.5rem 2.5rem 3rem' }}>
          <CornerFlourish position="top-left" size={72} opacity={0.25} />
          <CornerFlourish position="top-right" size={72} opacity={0.25} />
          <CornerFlourish position="bottom-left" size={72} opacity={0.25} />
          <CornerFlourish position="bottom-right" size={72} opacity={0.25} />

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--primary)',
              fontFamily: 'var(--font-serif)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>
              Built on Core Principles
            </h2>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We believe trust cannot be fabricated through marketing claims—it must be verifiable by design.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={19} color="var(--primary)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--primary)' }}>
                  No universal policy imposed
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={19} color="var(--primary)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--primary)' }}>
                  No silent retroactive edits
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={19} color="var(--primary)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Seller-registered authentic records
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================================================
          FOOTER: Clean Floating Bar with Hairline Lines
          ========================================================================== */}
      <footer style={{
        maxWidth: '1140px',
        margin: '0 auto 2rem',
        padding: '1.75rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.84rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1.5rem', 
          flexWrap: 'wrap',
          marginBottom: '1rem' 
        }}>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>Home</Link>
          <Link href="/verify/manual" style={{ color: 'var(--text-muted)' }}>Verify QR</Link>
          <Link href="/login" style={{ color: 'var(--text-muted)' }}>Sign In</Link>
          <Link href="/register" style={{ color: 'var(--text-muted)' }}>Customer Sign Up</Link>
          <Link href="/register-company" style={{ color: 'var(--text-muted)' }}>Retailer Register</Link>
        </div>
        <p>© 2026 MW | My Warranty. All rights reserved. Designed for independent electronics and technology retailers.</p>
      </footer>
    </div>
  );
}
