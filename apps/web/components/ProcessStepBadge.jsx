'use client';

import React from 'react';

/**
 * ProcessStepBadge
 * Renders the circular step number badge with organic hand-drawn concentric scribble loops
 * matching the user's reference design.
 * 
 * theme: 'light' (for white background) | 'dark' (for dark background)
 */
export function ProcessStepBadge({ number = 1, size = 110, theme = 'light' }) {
  const isLight = theme === 'light';
  const strokeColor = '#092032';
  const circleBg = '#092032';
  const numberColor = '#f1a501';

  // Variations in loop path geometry for each step to give an authentic hand-sketched feel
  const getLoops = (num) => {
    switch (num) {
      case 2:
        return (
          <>
            <path
              d="M 52 14 C 78 12, 104 26, 105 54 C 106 82, 86 104, 58 105 C 30 106, 12 84, 14 56 C 16 28, 38 15, 66 14"
              stroke={strokeColor}
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity={isLight ? 0.75 : 0.85}
            />
            <path
              d="M 58 11 C 86 15, 107 38, 103 66 C 99 94, 76 107, 50 105 C 24 103, 11 78, 13 52 C 15 24, 38 12, 64 13"
              stroke={strokeColor}
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity={isLight ? 0.6 : 0.7}
            />
            <path
              d="M 64 16 C 92 20, 109 46, 101 74 C 93 100, 68 106, 44 102 C 20 98, 12 74, 16 48 C 20 22, 44 14, 70 17"
              stroke={strokeColor}
              strokeWidth="0.95"
              strokeLinecap="round"
              opacity={isLight ? 0.45 : 0.55}
            />
          </>
        );
      case 3:
        return (
          <>
            <path
              d="M 56 12 C 84 10, 107 32, 106 60 C 105 88, 83 108, 55 107 C 27 106, 11 84, 12 56 C 13 28, 36 12, 62 13"
              stroke={strokeColor}
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity={isLight ? 0.75 : 0.85}
            />
            <path
              d="M 60 16 C 88 18, 108 42, 102 70 C 96 96, 72 108, 46 104 C 20 100, 12 76, 15 50 C 18 24, 42 14, 68 16"
              stroke={strokeColor}
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity={isLight ? 0.6 : 0.7}
            />
            <path
              d="M 50 11 C 78 12, 106 34, 105 62 C 104 90, 80 109, 52 107 C 24 105, 10 82, 13 54 C 16 26, 38 11, 64 12"
              stroke={strokeColor}
              strokeWidth="0.95"
              strokeLinecap="round"
              opacity={isLight ? 0.45 : 0.55}
            />
          </>
        );
      case 1:
      default:
        return (
          <>
            <path
              d="M 58 12 C 86 11, 108 32, 107 60 C 106 88, 85 109, 58 108 C 32 107, 12 86, 13 58 C 14 31, 34 13, 60 12 Z"
              stroke={strokeColor}
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity={isLight ? 0.75 : 0.85}
            />
            <path
              d="M 63 15 C 90 18, 109 40, 105 66 C 101 92, 78 106, 52 104 C 26 102, 14 78, 16 52 C 18 26, 42 13, 68 16"
              stroke={strokeColor}
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity={isLight ? 0.6 : 0.7}
            />
            <path
              d="M 54 10 C 82 9, 112 28, 110 58 C 108 86, 88 111, 60 110 C 30 109, 8 87, 10 56 C 12 28, 32 12, 58 10"
              stroke={strokeColor}
              strokeWidth="0.95"
              strokeLinecap="round"
              opacity={isLight ? 0.45 : 0.55}
            />
          </>
        );
    }
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <svg
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hand-drawn organic concentric scribble loops */}
        {getLoops(number)}

        {/* Central solid circle */}
        <circle cx="60" cy="60" r="32" fill={circleBg} />

        {/* Bold step number */}
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fill={numberColor}
          fontSize="24"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {number}
        </text>
      </svg>
    </div>
  );
}

/**
 * ProcessArrow
 * Hand-drawn connecting arrows matching the swoop and arch curves of the reference design.
 * variant: 'swoop' (dips down and rises) | 'arch' (arcs up and dips)
 */
export function ProcessArrow({ 
  variant = 'swoop', 
  width = 120, 
  height = 48, 
  color = '#092032',
  className = '' 
}) {
  return (
    <div
      className={`process-arrow ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg
        viewBox="0 0 130 55"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {variant === 'swoop' ? (
          // Swooping curve from Step 1 to Step 2 (curves down and arcs up to the right)
          <g>
            <path
              d="M 12 36 Q 64 68, 114 26"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Arrowhead */}
            <path
              d="M 98 22 L 114 26 L 108 38"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        ) : (
          // Arching curve from Step 2 to Step 3 (arcs up and curves down to the right)
          <g>
            <path
              d="M 12 42 Q 66 12, 116 38"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Arrowhead */}
            <path
              d="M 104 27 L 116 38 L 102 46"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export default ProcessStepBadge;
