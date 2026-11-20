'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CornerFlourish from '../components/CornerFlourish';
import { ProcessStepBadge, ProcessArrow } from '../components/ProcessStepBadge';
import { 
  Store, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Floating Island Navigation */}
      <Navbar />

      {/* Main Architectural Column with Continuous Left & Right Vertical Lines */}
      <main className="architectural-column" style={{ flex: 1, width: '100%' }}>
        {/* ==========================================================================
            HERO SECTION: Framed by Vertical Lines & Ornate Corner Flourishes
            ========================================================================== */}
        <section className="architectural-section" style={{ padding: '4.75rem 2.5rem 4.5rem' }}>
          {/* Ornate Architectural Corner Line Flourishes at Grid Intersections */}
          <CornerFlourish position="top-left" size={88} color="#202223" opacity={0.28} />
          <CornerFlourish position="top-right" size={88} color="#202223" opacity={0.28} />
          <CornerFlourish position="bottom-left" size={88} color="#202223" opacity={0.28} />
          <CornerFlourish position="bottom-right" size={88} color="#202223" opacity={0.28} />

          {/* Centered Black Brand Mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
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

          {/* Primary Action Capsule Buttons (Circled in Blue) */}
          <div style={{ 
            display: 'flex', 
            gap: '1.15rem', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
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
          </div>
        </section>

        {/* ==========================================================================
            HORIZONTAL DIVIDER LINE: Crisp Full-Width Boundary Between Sections
            ========================================================================== */}
        <div className="section-divider-h" />

        {/* ==========================================================================
            SECOND SECTION: 3-Step Process (Matching User Reference Design on White)
            ========================================================================== */}
        <section id="features" className="architectural-section" style={{ padding: '4.75rem 2.5rem 4rem' }}>
          {/* Ornate Architectural Corner Line Flourishes */}
          <CornerFlourish position="top-left" size={88} color="#202223" opacity={0.28} />
          <CornerFlourish position="top-right" size={88} color="#202223" opacity={0.28} />
          <CornerFlourish position="bottom-left" size={88} color="#202223" opacity={0.28} />
          <CornerFlourish position="bottom-right" size={88} color="#202223" opacity={0.28} />

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
              <ProcessArrow variant="swoop" width={115} height={48} color="#202223" />
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
              <ProcessArrow variant="arch" width={115} height={48} color="#202223" />
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

          {/* Subtle Hairline Divider and Trust Capsule Chips */}
          <div style={{
            width: '180px',
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '3.5rem auto 1.5rem'
          }} />

          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
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
              padding: '0.3rem 0.95rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              Immutable Policy Snapshots
            </span>

            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              backgroundColor: 'var(--accent-light)',
              padding: '0.3rem 0.95rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              Zero Silent Retroactive Edits
            </span>

            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.78rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              backgroundColor: 'var(--accent-light)',
              padding: '0.3rem 0.95rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              Verified Retailer Authority
            </span>
          </div>
        </section>

        {/* ==========================================================================
            HORIZONTAL DIVIDER LINE: Crisp Full-Width Boundary
            ========================================================================== */}
        <div className="section-divider-h" />

        {/* ==========================================================================
            THIRD SECTION: Core Principles Banner
            ========================================================================== */}
        <section id="principles" className="architectural-section" style={{ padding: '3.75rem 2.5rem 3.5rem' }}>
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

        {/* ==========================================================================
            HORIZONTAL DIVIDER LINE Before Footer
            ========================================================================== */}
        <div className="section-divider-h" />

        {/* ==========================================================================
            FOOTER: Clean Floating Bar with Hairline Lines
            ========================================================================== */}
        <footer style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
          backgroundColor: '#ffffff'
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
      </main>
    </div>
  );
}
