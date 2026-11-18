import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.4rem',
            borderRadius: '6px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }}>
        {value}
      </div>
      {subtext && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtext}
        </span>
      )}
    </div>
  );
}

