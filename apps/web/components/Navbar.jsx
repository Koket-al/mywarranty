'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Building2, Bell, QrCode, ShieldCheck, ChevronRight } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';

export default function Navbar() {
  const { user, activeCompany, logout, isCompanyStaff, isPlatformAdmin } = useAuth();
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <div className="island-nav-wrapper">
      <header className="island-nav">
        {/* Brand Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
          <Link 
            href="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.65rem', 
              textDecoration: 'none',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/logo-black.png" 
                alt="MW Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
              />
            </div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              whiteSpace: 'nowrap',
              lineHeight: 1
            }}>
              <span style={{ 
                fontSize: '1.22rem', 
                fontWeight: 800, 
                color: '#202223', 
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1
              }}>
                MW
              </span>
              <span style={{ 
                display: 'inline-block',
                width: '1px', 
                height: '13px', 
                backgroundColor: '#cbd5e1',
                margin: '0 2px',
                flexShrink: 0
              }} />
              <span style={{ 
                fontSize: '0.72rem', 
                color: '#64748b', 
                fontWeight: 600, 
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1
              }}>
                My Warranty
              </span>
            </div>
          </Link>

          {activeCompany && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.22rem 0.65rem',
              backgroundColor: '#f8fafc',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: '#202223',
              border: '1px solid #e2e8f0',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <Building2 size={13} color="#64748b" />
              <span style={{ 
                maxWidth: '120px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                fontWeight: 600,
                color: '#202223'
              }}>
                {activeCompany.businessName}
              </span>
              <span style={{ 
                fontSize: '0.625rem', 
                padding: '0.12rem 0.45rem', 
                borderRadius: '9999px',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {activeCompany.role}
              </span>
            </div>
          )}
        </div>

        {/* Center Navigation Links (Island Capsule Style) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <Link 
            href="/" 
            className={`nav-pill ${isHome ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/verify/manual" 
            className={`nav-pill ${pathname === '/verify/manual' ? 'active' : ''}`}
          >
            Verify QR
          </Link>
          <Link 
            href="/#features" 
            className="nav-pill"
          >
            Capabilities
          </Link>
          <Link 
            href="/#principles" 
            className="nav-pill"
          >
            Principles
          </Link>
        </nav>

        {/* Right Action Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexShrink: 0 }}>
          <GoogleTranslate />

          {/* Decorative hairline vertical separator */}
          <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', margin: '0 0.15rem', flexShrink: 0 }} />

          {user ? (
            <>
              {isPlatformAdmin && (
                <Link href="/admin/dashboard" className="btn-capsule-secondary">
                  Admin Panel
                </Link>
              )}

              {isCompanyStaff ? (
                <Link href="/company/dashboard" className="btn-capsule-secondary">
                  Company Portal
                </Link>
              ) : (
                <Link href="/customer/dashboard" className="btn-capsule-secondary">
                  My Dashboard
                </Link>
              )}

              <Link 
                href={isCompanyStaff ? "/company/notifications" : "/customer/notifications"} 
                className="btn-circle-subtle"
                title="Notifications"
              >
                <Bell size={15} />
              </Link>

              {/* User Persona Chip */}
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                fontSize: '0.8125rem',
                backgroundColor: '#f8fafc',
                padding: '0.28rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981',
                  display: 'inline-block' 
                }} />
                <span style={{ fontWeight: 600, color: '#202223', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName || user.email}
                </span>
              </div>

              <button 
                onClick={logout} 
                className="btn-circle-subtle" 
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-capsule-secondary">
                Sign In
              </Link>
              <Link href="/register-company" className="btn-capsule-primary">
                Retailer Register
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
