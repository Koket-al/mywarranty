'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User, Building2, Bell } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';

export default function Navbar() {
  const { user, activeCompany, logout, isCompanyStaff, isPlatformAdmin } = useAuth();

  return (
    <header style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="#0d9488" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
              EWNET
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 400 }}>
              | እውነት
            </span>
          </div>
        </Link>

        {activeCompany && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.6rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            color: 'var(--primary)'
          }}>
            <Building2 size={14} color="var(--accent)" />
            <strong>{activeCompany.businessName}</strong>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{activeCompany.role}</span>
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <GoogleTranslate />

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

            <Link href={isCompanyStaff ? "/company/notifications" : "/customer/notifications"} style={{ color: 'var(--text-muted)', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={18} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <User size={16} color="var(--text-muted)" />
              <span style={{ fontWeight: 500 }}>{user.fullName}</span>
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
  );
}

