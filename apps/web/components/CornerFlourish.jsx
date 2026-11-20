'use client';

import React from 'react';

/**
 * CornerFlourish
 * Renders an ornate classical corner flourish inspired by vintage engraving
 * and modern framed canvas aesthetics.
 * 
 * Supports position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
 */
export default function CornerFlourish({ 
  position = 'top-left', 
  size = 84, 
  color = '#202223', 
  opacity = 0.28,
  className = '',
  style = {}
}) {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      case 'top-left':
      default:
        return 'none';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: '10px', right: '10px' };
      case 'bottom-left':
        return { bottom: '10px', left: '10px' };
      case 'bottom-right':
        return { bottom: '10px', right: '10px' };
      case 'top-left':
      default:
        return { top: '10px', left: '10px' };
    }
  };

  return (
    <div
      className={`corner-flourish ${className}`}
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        zIndex: 2,
        opacity,
        transform: getTransform(),
        transformOrigin: 'center center',
        ...getPositionStyles(),
        ...style
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer framing line with rounded return */}
        <path
          d="M 6 92 L 6 22 C 6 13 13 6 22 6 L 92 6"
          stroke={color}
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Fine inner accent border */}
        <path
          d="M 14 84 L 14 26 C 14 19 19 14 26 14 L 84 14"
          stroke={color}
          strokeWidth="0.75"
          strokeDasharray="2 3"
          strokeLinecap="round"
        />

        {/* Corner diagonal accent dot / diamond */}
        <rect
          x="19"
          y="19"
          width="4"
          height="4"
          transform="rotate(45 21 21)"
          fill={color}
        />

        {/* Ornate Acanthus / Scroll Filigree */}
        {/* Main central curving floral stem */}
        <path
          d="M 21 21 C 28 32 38 42 54 46 C 70 50 82 42 80 34 C 78 26 66 26 62 34 C 58 42 66 54 74 62 C 82 70 90 74 94 74"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Secondary counter-scroll */}
        <path
          d="M 21 21 C 32 28 42 38 46 54 C 50 70 42 82 34 80 C 26 78 26 66 34 62 C 42 58 54 66 62 74 C 70 82 74 90 74 94"
          stroke={color}
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Inner delicate spiral swirl */}
        <path
          d="M 24 24 Q 38 38 34 46 Q 30 54 22 50 Q 14 46 18 36 Q 22 26 34 26"
          stroke={color}
          strokeWidth="0.85"
          strokeLinecap="round"
        />
        <path
          d="M 24 24 Q 38 38 46 34 Q 54 30 50 22 Q 46 14 36 18 Q 26 22 26 34"
          stroke={color}
          strokeWidth="0.85"
          strokeLinecap="round"
        />

        {/* Small terminal accent beads */}
        <circle cx="6" cy="94" r="1.5" fill={color} />
        <circle cx="94" cy="6" r="1.5" fill={color} />
        <circle cx="62" cy="34" r="1.2" fill={color} />
        <circle cx="34" cy="62" r="1.2" fill={color} />
      </svg>
    </div>
  );
}

