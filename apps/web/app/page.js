'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { ProcessStepBadge, ProcessArrow } from '../components/ProcessStepBadge';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  ArrowRight, 
  QrCode,
  Building2,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function HomePage() {
  const { user, isCompanyStaff, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
      {/* Floating Island Navigation (Holds Only the Translation Mark) */}
      <Navbar />

      {/* Main Architectural Column with Continuous Left & Right Vertical Lines */}
      <main className="architectural-column" style={{ flex: 1, width: '100%' }}>
        {/* ==========================================================================
            HERO SECTION: Framed by Architectural Vertical Lines
            ========================================================================== */}
        <section className="architectural-section" style={{ padding: '4.75rem 2.5rem 4.5rem' }}>
          {/* Centered Brand Mark & Official MW Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginBottom: '1.85rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
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

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.55rem', 
              padding: '0.35rem 0.95rem',
              backgroundColor: 'var(--feature-primary)',
              borderRadius: '9999px',
              boxShadow: '0 2px 6px rgba(9, 32, 50, 0.2)'
            }}>
              <span style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '1.2rem', 
                fontWeight: 800, 
                color: 'var(--bg)',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}>
                MW
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--bg)' }} />
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--bg)', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1
              }}>
                My Warranty
              </span>
            </div>
          </div>

          {/* Serif Main Headline */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 4rem)',
            fontWeight: 800,
            color: 'var(--primary)',
            lineHeight: 1.15,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.025em',
            maxWidth: '840px',
            margin: '0 auto 1.35rem'
          }}>
            Every product has a story.<br />
            Make that story verifiable.
          </h1>

          {/* Italic Serif Subtitle in Quotes */}
          <p style={{
            fontSize: '1.25rem',
            fontStyle: 'italic',
            color: 'var(--accent)',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.01em',
            marginBottom: '1.35rem'
          }}>
            “Tamper-evident, verifiable, and protected forever.”
          </p>

          {/* Balanced Centered Summary */}
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '660px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65
          }}>
            MW (My Warranty) provides electronics and technology retailers with a trusted digital foundation to issue cryptographically signed warranties, instant QR lookup, and AI-assisted claims—without paperwork or dispute.
          </p>

          {/* Primary Action Capsule Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {user ? (
                <>
                  {isCompanyStaff ? (
                    <Link 
                      href="/company/dashboard" 
                      className="btn btn-primary btn-pill btn-lg" 
                      style={{ padding: '0.8rem 2rem' }}
                    >
                      <Building2 size={18} />
                      <span>Go to Company Portal</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link 
                      href="/customer/dashboard" 
                      className="btn btn-primary btn-pill btn-lg" 
                      style={{ padding: '0.8rem 2rem' }}
                    >
                      <ShieldCheck size={18} />
                      <span>Go to Customer Dashboard</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}

                  <button 
                    onClick={logout} 
                    className="btn btn-secondary btn-pill btn-lg" 
                    style={{ padding: '0.8rem 1.75rem' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/register-company" 
                    className="btn btn-primary btn-pill btn-lg" 
                    style={{ padding: '0.8rem 2rem' }}
                  >
                    <Store size={18} />
                    <span>Register Your Retail Shop</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link 
                    href="/register" 
                    className="btn btn-secondary btn-pill btn-lg" 
                    style={{ padding: '0.8rem 2rem' }}
                  >
                    <span>+ Create Customer Account</span>
                  </Link>
                </>
              )}
            </div>

            {/* Dedicated Warranty QR Verification Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link 
                href="/verify/manual" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--bg)',
                  backgroundColor: 'var(--feature-primary)',
                  padding: '0.45rem 1.15rem',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(9, 32, 50, 0.2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <QrCode size={16} color="var(--bg)" />
                <span>Verify Product Warranty by QR Code</span>
                <ArrowRight size={14} color="var(--bg)" />
              </Link>

              {!user && (
                <Link 
                  href="/login" 
                  style={{
                    fontSize: '0.825rem',
                    color: 'var(--feature-primary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    padding: '0.45rem 0.75rem'
                  }}
                >
                  Retailer Portal Sign In →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            SECOND SECTION: 3-Step Process
            ========================================================================== */}
        <section id="features" className="architectural-section" style={{ padding: '4.75rem 2.5rem 4rem' }}>
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
            fontSize: 'clamp(1.95rem, 4vw, 2.9rem)',
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
            maxWidth: '640px',
            margin: '0 auto 3.75rem',
            lineHeight: 1.6
          }}>
            Four honest answers about cryptographic trust, instant verification, and customer warranty protection.
          </p>

          {/* The 3-Step Process Flow (Exact Composition from User Reference Image) */}
          <div className="process-flow-container">
            {/* Step 1 */}
            <div className="process-step-col">
              <ProcessStepBadge number={1} size={115} theme="light" />
              <h3 className="process-step-title">
                Instant QR Verification
              </h3>
              <p className="process-step-desc">
                Customers scan a unique QR code directly with any smartphone camera. No app download or account creation required for instant authenticity checks.
              </p>
            </div>

            {/* Connecting Arrow 1 (Swooping curve) */}
            <div style={{ paddingTop: '2.5rem' }}>
              <ProcessArrow variant="swoop" width={115} height={48} color="#092032" />
            </div>

            {/* Step 2 */}
            <div className="process-step-col">
              <ProcessStepBadge number={2} size={115} theme="light" />
              <h3 className="process-step-title">
                Cryptographic Integrity
              </h3>
              <p className="process-step-desc">
                Each issued warranty snapshot is sealed with an asymmetric digital signature (RSA-SHA256). Any silent modification to policy terms or dates is instantly detected.
              </p>
            </div>

            {/* Connecting Arrow 2 (Arching curve) */}
            <div style={{ paddingTop: '2.5rem' }}>
              <ProcessArrow variant="arch" width={115} height={48} color="#092032" />
            </div>

            {/* Step 3 */}
            <div className="process-step-col">
              <ProcessStepBadge number={3} size={115} theme="light" />
              <h3 className="process-step-title">
                AI Triage & Human Decision
              </h3>
              <p className="process-step-desc">
                Our Gemini AI Assistant reviews customer claims and diagnostic photos against the exact frozen policy snapshot. A verified retailer staff member makes the final claim decision.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            FOOTER: Clean Minimalist Line
            ========================================================================== */}
        <footer style={{
          padding: '2.5rem 2rem 3rem',
          backgroundColor: 'var(--bg)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.825rem',
            color: 'var(--primary)',
            fontWeight: 500
          }}>
            © 2026 MW (My Warranty). All rights reserved. Designed for independent electronics and technology retailers.
          </p>
        </footer>
      </main>
    </div>
  );
}
