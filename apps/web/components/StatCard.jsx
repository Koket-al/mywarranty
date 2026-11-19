import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.45rem',
            borderRadius: '6px',
            backgroundColor: 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #cce8e0'
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: 700, 
        color: 'var(--primary)', 
        lineHeight: 1.1,
        fontFamily: 'var(--font-serif)',
        letterSpacing: '-0.02em'
      }}>
        {value}
      </div>
      {subtext && (
        <>
          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.2rem 0' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {subtext}
          </span>
        </>
      )}
    </div>
  );
}

