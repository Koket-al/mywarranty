'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileCheck2, 
  Package, 
  ScrollText, 
  Sliders, 
  LifeBuoy, 
  Bot, 
  Users, 
  Settings,
  QrCode,
  Bell,
  Building2,
  LogOut
} from 'lucide-react';

export default function Sidebar({ mode = 'company' }) {
  const pathname = usePathname();
  const { user, activeCompany, logout } = useAuth();

  const companyLinks = [
    { href: '/company/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/company/warranties/new', label: 'Issue Warranty', icon: PlusCircle },
    { href: '/company/warranties', label: 'Warranties', icon: FileCheck2 },
    { href: '/company/products', label: 'Products', icon: Package },
    { href: '/company/policies', label: 'Warranty Policies', icon: ScrollText },
    { href: '/company/warranty-forms', label: 'Form Builder', icon: Sliders },
    { href: '/company/support', label: 'Support & Claims', icon: LifeBuoy },
    { href: '/company/ai', label: 'Policy AI Assistant', icon: Bot },
    { href: '/company/employees', label: 'Employees & Roles', icon: Users },
    { href: '/company/settings', label: 'Settings', icon: Settings },
  ];

  const customerLinks = [
    { href: '/customer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/customer/warranties', label: 'My Warranties', icon: FileCheck2 },
    { href: '/customer/claim-warranty', label: 'Claim Warranty', icon: QrCode },
    { href: '/customer/support', label: 'Support Requests', icon: LifeBuoy },
    { href: '/customer/assistant', label: 'Warranty Assistant AI', icon: Bot },
    { href: '/customer/notifications', label: 'Notifications', icon: Bell },
  ];

  const links = mode === 'company' ? companyLinks : customerLinks;

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--surface)',
      borderRight: 'none',
      minHeight: 'calc(100vh - 61px)',
      padding: '1.25rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--bg)',
        letterSpacing: '0.08em',
        fontFamily: 'var(--font-serif)'
      }}>
        {mode === 'company' ? 'Retailer Portal' : 'Customer Account'}
      </div>

      {/* Retailer Active Company & Role Badge */}
      {mode === 'company' && activeCompany && (
        <div style={{
          padding: '0.55rem 0.75rem',
          backgroundColor: 'var(--feature-secondary)',
          borderRadius: '8px',
          border: 'none',
          margin: '0 0.25rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            backgroundColor: 'var(--feature-primary)',
            color: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Building2 size={14} />
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: 'var(--bg)', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {activeCompany.businessName}
            </div>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 700, 
              color: '#000000', 
              backgroundColor: 'var(--bg)',
              padding: '0.08rem 0.35rem',
              borderRadius: '4px',
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              display: 'inline-block'
            }}>
              {activeCompany.role}
            </span>
          </div>
        </div>
      )}

      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== `/${mode}/dashboard` && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--bg)' : 'rgba(241, 165, 1, 0.7)',
              backgroundColor: isActive ? 'var(--feature-secondary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={18} color={isActive ? 'var(--bg)' : 'rgba(241, 165, 1, 0.7)'} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      {/* Bottom User Persona & Logout in Sidebar */}
      {user && (
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          paddingLeft: '0.5rem',
          paddingRight: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', minWidth: 0 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--bg)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--bg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.fullName || user.email}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--bg)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.15s ease'
            }}
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  );
}

