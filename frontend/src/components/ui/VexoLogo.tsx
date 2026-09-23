import React from 'react';

export interface VexoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  revealWidth?: number; // Wordmark clip width (0 to 420). If undefined, full wordmark is shown.
  accentsOpacity?: number; // Opacity of crown dots & subtitle (0 to 1). Defaults to 1 if undefined.
  clipId?: string; // Optional unique ID for wordmark clipPath
}

export const VexoLogo: React.FC<VexoLogoProps> = ({
  className = '',
  size = 'md',
  revealWidth,
  accentsOpacity,
  clipId,
}) => {
  const heightMap = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-13 sm:h-15',
    xl: 'h-18 sm:h-22 md:h-26',
  };

  const hasClip = clipId && revealWidth !== undefined;
  const showAccents = accentsOpacity === undefined || accentsOpacity > 0;
  const currentAccentsOpacity = accentsOpacity !== undefined ? accentsOpacity : 1;

  return (
    <div className={`flex items-center select-none ${heightMap[size]} ${className}`}>
      {/* Vector Logo Graphic with Apple-Grade Crispness */}
      <svg
        viewBox="0 0 420 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <defs>
          {/* Halftone & Metallic Red Gradient */}
          <linearGradient id="vexoRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2020" />
            <stop offset="50%" stopColor="#E00000" />
            <stop offset="100%" stopColor="#A80000" />
          </linearGradient>

          {hasClip && (
            <clipPath id={clipId}>
              <rect
                x="0"
                y="55"
                width={revealWidth}
                height="85"
                style={{
                  transition: 'width 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </clipPath>
          )}
        </defs>

        {/* 1. Halftone Dome Arch Dots */}
        {showAccents && (
          <g
            opacity={currentAccentsOpacity * 0.95}
            style={{
              transition: 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
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
            <circle cx="236" cy="56" r="5.5" fill="url(#vexoRedGrad)" />
            <circle cx="248" cy="56" r="4.5" fill="url(#vexoRedGrad)" />
            <circle cx="260" cy="56" r="3.5" fill="url(#vexoRedGrad)" />
          </g>
        )}

        {/* 2. Main Brand Title: VEXO (Clean mask / clip reveal) */}
        <g clipPath={hasClip ? `url(#${clipId})` : undefined}>
          {/* 'V' */}
          <path
            d="M30 68 L58 128 L86 68 H68 L58 108 L48 68 H30 Z"
            fill="var(--logo-primary, #FFFFFF)"
          />
          {/* 'E' */}
          <path
            d="M92 68 H142 V80 H110 V92 H138 V104 H110 V116 H142 V128 H92 V68 Z"
            fill="var(--logo-primary, #FFFFFF)"
          />
          {/* 'X' */}
          <path
            d="M148 68 L174 98 L148 128 H166 L184 106 L202 128 H220 L194 98 L220 68 H202 L184 90 L166 68 H148 Z"
            fill="var(--logo-primary, #FFFFFF)"
          />
          {/* 'O' with Center Core & Play Triangle */}
          <g>
            <circle cx="265" cy="98" r="30" fill="url(#vexoRedGrad)" />
            <circle cx="265" cy="98" r="18" fill="var(--logo-o-bg, #0A0A0A)" />
            <polygon points="260,89 274,98 260,107" fill="url(#vexoRedGrad)" />
          </g>
        </g>

        {/* 3. Sub-title: ENTERTAINMENT & PRIVATE LIMITED */}
        {showAccents && (
          <g
            opacity={currentAccentsOpacity}
            style={{
              transition: 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <text
              x="210"
              y="152"
              textAnchor="middle"
              fill="#E00000"
              fontSize="22"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing="6"
            >
              ENTERTAINMENT
            </text>
            <text
              x="210"
              y="172"
              textAnchor="middle"
              fill="var(--logo-subtext, #94A3B8)"
              fontSize="13"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing="4"
            >
              PRIVATE LIMITED
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default VexoLogo;
