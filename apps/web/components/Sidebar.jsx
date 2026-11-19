'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Bell
} from 'lucide-react';

export default function Sidebar({ mode = 'company' }) {
  const pathname = usePathname();

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
      borderRight: '1px solid var(--border)',
      minHeight: 'calc(100vh - 61px)',
      padding: '1.25rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: 'var(--primary)',
        letterSpacing: '0.08em',
        fontFamily: 'var(--font-serif)'
      }}>
        {mode === 'company' ? 'Retailer Portal' : 'Customer Account'}
      </div>

      {/* Decorative horizontal separator */}
      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.2rem 0.5rem 0.65rem' }} />

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
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon size={18} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}

