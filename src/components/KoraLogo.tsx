import React from 'react';
import { LogoVariant } from '../types/kora';

export interface AccentPreset {
  id: string;
  label: string;
  hex: string;
}

export const ACCENT_PALETTE: AccentPreset[] = [
  { id: 'coral', label: 'Apple Coral', hex: '#fa2d48' },
  { id: 'ocean', label: 'Ocean Blue', hex: '#0a84ff' },
  { id: 'nothing', label: 'Nothing Red', hex: '#d71921' },
  { id: 'amber', label: 'Amber Gold', hex: '#ff9f0a' },
  { id: 'sage', label: 'Emerald Sage', hex: '#30d158' },
  { id: 'violet', label: 'Electric Violet', hex: '#bf5af2' },
  { id: 'cyan', label: 'Ice Cyan', hex: '#64d2ff' },
  { id: 'silver', label: 'Liquid Silver', hex: '#a1a1aa' }
];

export interface LogoVariantInfo {
  id: LogoVariant;
  name: string;
  subtitle: string;
}

export const LOGO_VARIANTS: LogoVariantInfo[] = [
  {
    id: 'yinyang',
    name: 'Yin-Yang Core',
    subtitle: 'Kraft & Regeneration im Fluss'
  },
  {
    id: 'eclipse',
    name: 'Eclipse Orbit',
    subtitle: 'Starship-Korona & Umlaufbahn'
  },
  {
    id: 'orbital',
    name: 'Orbital Gyro',
    subtitle: 'Body & Mind in Balance'
  },
  {
    id: 'monogram',
    name: 'Kinetic K-Core',
    subtitle: 'Architektonisches K mit Kern'
  }
];

interface KoraLogoProps {
  variant?: LogoVariant;
  className?: string;
}

export const KoraLogo: React.FC<KoraLogoProps> = ({
  variant = 'yinyang',
  className = 'w-8 h-8'
}) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {variant === 'yinyang' && (
        <g>
          <circle
            cx="20"
            cy="20"
            r="15.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeOpacity="0.88"
          />
          <path
            d="M20 4.5A15.5 15.5 0 0 0 20 35.5A7.75 7.75 0 0 1 20 20A7.75 7.75 0 0 0 20 4.5Z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path
            d="M20 4.5A7.75 7.75 0 0 1 20 20A7.75 7.75 0 0 0 20 35.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeOpacity="0.92"
          />
          <circle cx="20" cy="12.25" r="4.8" fill="var(--kora-accent)" fillOpacity="0.22" />
          <circle cx="20" cy="12.25" r="2.7" fill="var(--kora-accent)" />
          <circle
            cx="20"
            cy="27.75"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeOpacity="0.85"
          />
        </g>
      )}

      {variant === 'orbital' && (
        <g>
          <circle
            cx="20"
            cy="20"
            r="16.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.18"
          />
          <ellipse
            cx="20"
            cy="20"
            rx="15"
            ry="6.6"
            transform="rotate(-34 20 20)"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeOpacity="0.88"
          />
          <ellipse
            cx="20"
            cy="20"
            rx="15"
            ry="6.6"
            transform="rotate(34 20 20)"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
          <circle cx="20" cy="20" r="6" fill="var(--kora-accent)" fillOpacity="0.22" />
          <circle cx="20" cy="20" r="3.4" fill="var(--kora-accent)" />
        </g>
      )}

      {variant === 'eclipse' && (
        <g>
          <ellipse
            cx="20"
            cy="20"
            rx="16.2"
            ry="6.2"
            transform="rotate(-28 20 20)"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.38"
          />
          <path
            d="M32.2 26.8A14 14 0 1 1 26.8 7.8"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
          <path
            d="M11.6 15.2A9.8 9.8 0 0 0 24.8 28.4"
            stroke="var(--kora-accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.72"
          />
          <circle
            cx="29.4"
            cy="10.6"
            r="1.7"
            fill="currentColor"
            fillOpacity="0.72"
          />
          <circle cx="20" cy="20" r="6.2" fill="var(--kora-accent)" fillOpacity="0.2" />
          <circle cx="20" cy="20" r="3.6" fill="var(--kora-accent)" />
        </g>
      )}

      {variant === 'compass' && (
        <g>
          <path
            d="M20 4.5v4.2M20 31.3v4.2M4.5 20h4.2M31.3 20h4.2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <path
            d="M10.4 10.4A13.5 13.5 0 0 1 29.6 10.4M29.6 29.6A13.5 13.5 0 0 1 10.4 29.6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.88"
          />
          <path
            d="M14.2 14.2A8.2 8.2 0 0 0 14.2 25.8M25.8 14.2A8.2 8.2 0 0 1 25.8 25.8"
            stroke="var(--kora-accent)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <circle cx="20" cy="20" r="3.6" fill="var(--kora-accent)" />
        </g>
      )}

      {variant === 'monogram' && (
        <g>
          <rect
            x="3.5"
            y="3.5"
            width="33"
            height="33"
            rx="11"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeOpacity="0.22"
          />
          <path
            d="M12.5 10.5v19"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeOpacity="0.92"
          />
          <path
            d="M26.5 11.2L17.6 20l9.2 9"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.82"
          />
          <circle cx="17.6" cy="20" r="5.5" fill="var(--kora-accent)" fillOpacity="0.2" />
          <circle cx="17.6" cy="20" r="3.2" fill="var(--kora-accent)" />
        </g>
      )}
    </svg>
  );
};
