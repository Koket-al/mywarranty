'use client';

import React from 'react';
import GoogleTranslate from './GoogleTranslate';

export default function Navbar() {
  return (
    <div className="island-nav-wrapper">
      <header style={{
        maxWidth: '1140px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 0.5rem',
        pointerEvents: 'auto'
      }}>
        <GoogleTranslate />
      </header>
    </div>
  );
}
