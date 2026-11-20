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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/logo-black.png" 
                alt="MW Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span style={{ 
                fontSize: '1.35rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1
              }}>
                MW
              </span>
              <span style={{ 
                fontSize: '0.78rem', 
                color: 'var(--text-muted)', 
                fontWeight: 500, 
                letterSpacing: '0.02em',
                lineHeight: 1
              }}>
                | My Warranty
              </span>
            </div>
          </Link>

          {activeCompany && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.65rem',
              backgroundColor: 'var(--accent-light)',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: 'var(--primary)',
              border: '1px solid var(--border)'
            }}>
              <Building2 size={13} color="var(--primary)" />
              <strong style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeCompany.businessName}
              </strong>
              <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '9999px' }}>
                {activeCompany.role}
              </span>
            </div>
          )}
        </div>

        {/* Center Navigation Links (Island Capsule Style) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <GoogleTranslate />

          {/* Decorative hairline vertical separator */}
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 0.15rem' }} />

          {user ? (
            <>
              {isPlatformAdmin && (
                <Link href="/admin/dashboard" className="btn btn-secondary btn-sm">
                  Admin Panel
                </Link>
              )}

              {isCompanyStaff ? (
                <Link href="/company/dashboard" className="btn btn-secondary btn-sm">
                  Company Portal
                </Link>
              ) : (
                <Link href="/customer/dashboard" className="btn btn-secondary btn-sm">
                  My Dashboard
                </Link>
              )}

              <Link 
                href={isCompanyStaff ? "/company/notifications" : "/customer/notifications"} 
                style={{ 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0.35rem',
                  borderRadius: '9999px',
                  transition: 'color 0.15s ease'
                }}
                title="Notifications"
              >
                <Bell size={17} />
              </Link>

              {/* Decorative separator */}
              <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />

              {/* User Persona Chip */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                fontSize: '0.8125rem',
                backgroundColor: 'var(--accent-light)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--border)'
              }}>
                <span style={{ 
                  width: '7px', 
                  height: '7px', 
                  borderRadius: '50%', 
                  backgroundColor: '#202223',
                  display: 'inline-block' 
                }} />
                <span style={{ fontWeight: 600, color: 'var(--primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName || user.email}
                </span>
              </div>

              <button 
                onClick={logout} 
                className="btn btn-secondary btn-sm" 
                title="Log Out"
                style={{ padding: '0.3rem 0.65rem' }}
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link href="/register-company" className="btn btn-primary btn-sm">
                Retailer Register
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
