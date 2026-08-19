import React from 'react';

interface VexoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VexoLogo: React.FC<VexoLogoProps> = ({ className = '', size = 'md' }) => {
  const heightMap = {
    sm: 'h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${heightMap[size]} ${className}`}>
      {/* Vector Logo Graphic */}
      <svg
        viewBox="0 0 420 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto drop-shadow-[0_0_15px_rgba(224,0,0,0.45)]"
      >
        <defs>
          {/* Halftone & Metallic Red Gradients */}
          <linearGradient id="vexoRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D4D" />
            <stop offset="50%" stopColor="#E00000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>

          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <radialGradient id="domeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF3333" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CC0000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Halftone Dome Arch Dots */}
        <g opacity="0.9">
          {/* Row 1 Top */}
          <circle cx="210" cy="12" r="2.5" fill="url(#vexoRedGrad)" />
          {/* Row 2 */}
          <circle cx="198" cy="20" r="3" fill="url(#vexoRedGrad)" />
          <circle cx="210" cy="20" r="3.5" fill="url(#vexoRedGrad)" />
          <circle cx="222" cy="20" r="3" fill="url(#vexoRedGrad)" />
          {/* Row 3 */}
          <circle cx="186" cy="30" r="3.5" fill="url(#vexoRedGrad)" />
          <circle cx="198" cy="30" r="4" fill="url(#vexoRedGrad)" />
          <circle cx="210" cy="30" r="4.5" fill="url(#vexoRedGrad)" />
          <circle cx="222" cy="30" r="4" fill="url(#vexoRedGrad)" />
          <circle cx="234" cy="30" r="3.5" fill="url(#vexoRedGrad)" />
          {/* Row 4 */}
          <circle cx="174" cy="42" r="4" fill="url(#vexoRedGrad)" />
          <circle cx="186" cy="42" r="4.5" fill="url(#vexoRedGrad)" />
          <circle cx="198" cy="42" r="5" fill="url(#vexoRedGrad)" />
          <circle cx="210" cy="42" r="5.5" fill="url(#vexoRedGrad)" />
          <circle cx="222" cy="42" r="5" fill="url(#vexoRedGrad)" />
          <circle cx="234" cy="42" r="4.5" fill="url(#vexoRedGrad)" />
          <circle cx="246" cy="42" r="4" fill="url(#vexoRedGrad)" />
          {/* Row 5 Base Arch */}
          <circle cx="160" cy="56" r="3.5" fill="url(#vexoRedGrad)" />
          <circle cx="172" cy="56" r="4.5" fill="url(#vexoRedGrad)" />
          <circle cx="184" cy="56" r="5" fill="url(#vexoRedGrad)" />
          <circle cx="197" cy="56" r="5.5" fill="url(#vexoRedGrad)" />
          <circle cx="210" cy="56" r="6" fill="url(#vexoRedGrad)" />
          <circle cx="223" cy="56" r="5.5" fill="url(#vexoRedGrad)" />
          <circle cx="236" cy="56" r="5" fill="url(#vexoRedGrad)" />
          <circle cx="248" cy="56" r="4.5" fill="url(#vexoRedGrad)" />
          <circle cx="260" cy="56" r="3.5" fill="url(#vexoRedGrad)" />
        </g>

        {/* 2. Main Brand Title: VEXO */}
        {/* 'V' */}
        <path
          d="M30 68 L58 128 L86 68 H68 L58 108 L48 68 H30 Z"
          fill="url(#silverGrad)"
        />
        {/* 'E' */}
        <path
          d="M92 68 H142 V80 H110 V92 H138 V104 H110 V116 H142 V128 H92 V68 Z"
          fill="url(#silverGrad)"
        />
        {/* 'X' */}
        <path
          d="M148 68 L174 98 L148 128 H166 L184 106 L202 128 H220 L194 98 L220 68 H202 L184 90 L166 68 H148 Z"
          fill="url(#silverGrad)"
        />
        {/* 'O' with Play Button Badge */}
        <g>
          <circle cx="265" cy="98" r="30" fill="url(#vexoRedGrad)" />
          <circle cx="265" cy="98" r="18" fill="#0A0A0A" />
          {/* Play Triangle Symbol inside 'O' */}
          <polygon points="260,89 274,98 260,107" fill="url(#vexoRedGrad)" />
        </g>

        {/* 3. Sub-title: ENTERTAINMENT (Red Stylized Uppercase) */}
        <text
          x="210"
          y="152"
          textAnchor="middle"
          fill="#FF3333"
          fontSize="22"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="6"
        >
          ENTERTAINMENT
        </text>

        {/* 4. Sub-title: PRIVATE LIMITED (Clean White Uppercase) */}
        <text
          x="210"
          y="172"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="4"
          opacity="0.9"
        >
          PRIVATE LIMITED
        </text>
      </svg>
    </div>
  );
};

export default VexoLogo;
