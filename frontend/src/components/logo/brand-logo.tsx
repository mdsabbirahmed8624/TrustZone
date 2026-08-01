import React from 'react';

export interface BrandLogoProps {
  variant?: 'horizontal' | 'icon';
  theme?: 'dark' | 'light' | 'auto';
  width?: string | number;
  height?: string | number;
  className?: string;
}

interface LogoIconProps {
  primary: string;
  accent: string;
}

// SVG Icon Component declared OUTSIDE render to satisfy ESLint static component rules
const LogoIcon: React.FC<LogoIconProps> = ({ primary, accent }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Shield representing TrustZone */}
    <path
      d="M12 2L3 6V12C3 17 8.5 21 12 22C15.5 21 21 17 21 12V6L12 2Z"
      fill="url(#brand-logo-grad)"
    />
    {/* Inner Wrench/Check representing Mobile Care */}
    <path
      d="M9 11L11 13L15 9"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="brand-logo-grad"
        x1="3"
        y1="2"
        x2="21"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={primary} />
        <stop offset="1" stopColor={accent} />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Centralized Brand Logo Configuration Component
 * To replace the logo system, update the SVG path data in this file only.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  theme = 'auto',
  width,
  height,
  className = '',
}) => {
  // Configurable size mappings
  const defaultWidth = variant === 'horizontal' ? 160 : 44;
  const defaultHeight = variant === 'horizontal' ? 44 : 44;

  const w = width || defaultWidth;
  const h = height || defaultHeight;

  // Render thematic stroke/fill overrides
  const getLogoColors = () => {
    switch (theme) {
      case 'light':
        return {
          primary: '#1877f2', // Blue
          accent: '#16a34a',  // Green
          text: '#0f172a',    // Dark slate text
          textSecondary: '#64748b',
        };
      case 'dark':
        return {
          primary: '#3b82f6', // Light Blue
          accent: '#22c55e',  // Vibrant Green
          text: '#f8fafc',    // Slate light text
          textSecondary: '#94a3b8',
        };
      case 'auto':
      default:
        return {
          // Dynamic classes mapped via CSS variables
          primary: 'var(--primary)',
          accent: 'var(--accent)',
          text: 'currentColor',
          textSecondary: 'var(--muted-foreground)',
        };
    }
  };

  const colors = getLogoColors();

  if (variant === 'icon') {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: w, height: h }}
      >
        <LogoIcon primary={colors.primary} accent={colors.accent} />
      </div>
    );
  }

  // Horizontal variant (Icon + Brand Typography)
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      style={{ height: h }}
    >
      <div style={{ width: h, height: h }} className="shrink-0">
        <LogoIcon primary={colors.primary} accent={colors.accent} />
      </div>
      <div className="flex flex-col justify-center select-none">
        <span
          className="font-black text-xl tracking-tight leading-none uppercase"
          style={{ color: colors.text }}
        >
          <span style={{ color: theme === 'light' ? '#1877f2' : 'inherit' }}>TRUST</span>
          <span style={{ color: theme === 'light' ? '#16a34a' : colors.accent }}>ZONE</span>
        </span>
        <span
          className="text-[10px] font-extrabold uppercase tracking-widest leading-none mt-1"
          style={{ color: colors.textSecondary }}
        >
          Mobile Care
        </span>
      </div>
    </div>
  );
};
