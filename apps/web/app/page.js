'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  ArrowRight,
  QrCode,
  Building2,
  LogOut,
  ShieldCheck,
  Database,
  Zap
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
            MW (My Warranty) helps electronics shops create digital warranties. Customers scan a QR code to check their warranty. AI helps shop staff review claims. Less paperwork and fewer problems.
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
            SECOND SECTION: Your Trusted Warranty Companion
            ========================================================================== */}
        <section id="features" className="architectural-section" style={{ padding: '4.5rem 2rem 5rem' }}>
          {/* Main Title matching reference format */}
          <h2 style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.9rem)',
            fontWeight: 800,
            color: 'var(--primary)',
            lineHeight: 1.2,
            fontFamily: 'var(--font-sans)',
            letterSpacing: '-0.02em',
            marginBottom: '3.75rem',
            textAlign: 'center'
          }}>
            Your <span style={{ color: 'var(--feature-primary)' }}>Trusted</span> Warranty Companion
          </h2>

          {/* 3-Column Feature Grid matching reference format */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2.5rem',
            maxWidth: '1040px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            {/* Column 1: Instant Verification */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--feature-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.35rem',
                boxShadow: '0 4px 12px rgba(9, 32, 50, 0.15)'
              }}>
                <ShieldCheck size={30} color="var(--bg)" strokeWidth={2.2} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--primary)',
                fontFamily: 'var(--font-sans)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em'
              }}>
                Instant Verification
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                maxWidth: '260px'
              }}>
                Check warranty details quickly and easily.
              </p>
            </div>

            {/* Column 2: Trusted Information */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--feature-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.35rem',
                boxShadow: '0 4px 12px rgba(9, 32, 50, 0.15)'
              }}>
                <Database size={28} color="var(--bg)" strokeWidth={2.2} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--primary)',
                fontFamily: 'var(--font-sans)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em'
              }}>
                Trusted Information
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                maxWidth: '260px'
              }}>
                Get accurate and reliable data.
              </p>
            </div>

            {/* Column 3: A Better Experience */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--feature-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.35rem',
                boxShadow: '0 4px 12px rgba(9, 32, 50, 0.15)'
              }}>
                <Zap size={28} color="var(--bg)" strokeWidth={2.2} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--primary)',
                fontFamily: 'var(--font-sans)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.01em'
              }}>
                A Better Experience
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                maxWidth: '260px'
              }}>
                Enjoy a smoother and simpler service.
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
