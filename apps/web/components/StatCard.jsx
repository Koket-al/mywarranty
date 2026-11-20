import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'var(--bg)' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(241, 165, 1, 0.75)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.4rem',
            borderRadius: '6px',
            backgroundColor: 'var(--feature-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none'
          }}>
            <Icon size={16} color="var(--bg)" />
          </div>
        )}
      </div>
      <div style={{
        fontSize: '1.85rem',
        fontWeight: 700,
        color: 'var(--bg)',
        lineHeight: 1.1,
        letterSpacing: '-0.02em'
      }}>
        {value}
      </div>
      {subtext && (
        <span style={{ fontSize: '0.75rem', color: 'rgba(241, 165, 1, 0.7)' }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
