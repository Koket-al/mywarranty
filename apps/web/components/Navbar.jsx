'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User, Building2, Bell } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';

export default function Navbar() {
  const { user, activeCompany, logout, isCompanyStaff, isPlatformAdmin } = useAuth();

  return (
    <>
      <header style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo-black.png" 
                alt="mw Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            <div>
              <span style={{ 
                fontSize: '1.45rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-serif)',
                textTransform: 'lowercase'
              }}>
                mw
              </span>
            </div>
          </Link>

          {activeCompany && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.75rem',
              backgroundColor: 'var(--accent-light)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: 'var(--primary)',
              border: '1px solid var(--border)'
            }}>
              <Building2 size={14} color="var(--primary)" />
              <strong>{activeCompany.businessName}</strong>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{activeCompany.role}</span>
            </div>
          )}
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <GoogleTranslate />

          {/* Decorative vertical separator */}
          <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border)', margin: '0 0.25rem' }} />

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

              <Link href={isCompanyStaff ? "/company/notifications" : "/customer/notifications"} style={{ color: 'var(--text-muted)', position: 'relative', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                <Bell size={18} />
              </Link>

              {/* Decorative vertical separator */}
              <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <User size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.fullName}</span>
              </div>

              <button onClick={logout} className="btn btn-secondary btn-sm" title="Log Out">
                <LogOut size={15} />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/verify/manual" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Verify QR
              </Link>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-accent btn-sm">
                Customer Sign Up
              </Link>
              <Link href="/register-company" className="btn btn-primary btn-sm">
                Retailer Register
              </Link>
            </>
          )}
        </nav>
      </header>
      {/* Decorative horizontal accent line under navbar */}
      <div className="deco-line-h-accent" />
    </>
  );
}

