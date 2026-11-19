import React, { useSyncExternalStore } from 'react';
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
  { id: 'silver', label: 'Liquid Silver', hex: '#a1a1aa' },
  { id: 'nothing-gray', label: 'Nothing Gray', hex: '#d4d4d8' }
];

/**
 * Kora "Eclipse Orbit" mark — classic base geometry (40x40),
 * preserved for backwards compatibility across favicons and icons.
 */
export const KORA_ORBIT_PATH =
  'M23.24 27.33A16.8 8 -28 1 1 34 18.13';

export type CanonicalLogoVariant = 'holmes' | 'kao' | 'orbital' | 'eclipse';

export interface LogoVariantInfo {
  id: CanonicalLogoVariant;
  name: string;
  subtitle: string;
}

export const LOGO_VARIANTS: LogoVariantInfo[] = [
  {
    id: 'holmes',
    name: 'Holmes Wave Orbit',
    subtitle: 'Fließender Schwung inspiriert vom Holmes-Schriftzug'
  },
  {
    id: 'kao',
    name: 'K·A·O Monogram',
    subtitle: 'Architektonische Fusion aus K, A und O'
  },
  {
    id: 'orbital',
    name: 'Astrolabe Gyro Pro',
    subtitle: 'Verfeinertes Gyro-System mit Kompass-Präzision'
  },
  {
    id: 'eclipse',
    name: 'Nothing Eclipse',
    subtitle: 'Reduzierter Orbit mit innerer Korona'
  }
];

const LOGO_LS_KEY = 'kora_logo_v1';
const DEFAULT_LOGO_VARIANT: CanonicalLogoVariant = 'holmes';
const logoListeners = new Set<() => void>();
let inMemoryLogoVariant: CanonicalLogoVariant | null = null;

/** Map legacy stored variant names onto the 4 active brand designs. */
export function normalizeLogoVariant(variant?: LogoVariant | string | null): CanonicalLogoVariant {
  switch (variant) {
    case 'holmes':
    case 'yinyang':
      return 'holmes';
    case 'kao':
    case 'monogram':
      return 'kao';
    case 'orbital':
    case 'compass':
      return 'orbital';
    case 'eclipse':
      return 'eclipse';
    default:
      return DEFAULT_LOGO_VARIANT;
  }
}

export function readSyncLogoVariant(): LogoVariant {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(LOGO_LS_KEY);
      if (stored) {
        return normalizeLogoVariant(stored);
      }
    } catch {
      // Ignore storage read errors in restricted webviews
    }
  }
  if (typeof document !== 'undefined') {
    const datasetVariant = document.documentElement?.dataset?.logoVariant;
    if (datasetVariant) {
      return normalizeLogoVariant(datasetVariant);
    }
  }
  return inMemoryLogoVariant ?? DEFAULT_LOGO_VARIANT;
}

export function writeSyncLogoVariant(variant: LogoVariant): void {
  const normalized = normalizeLogoVariant(variant);
  const previous = readSyncLogoVariant();
  inMemoryLogoVariant = normalized;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOGO_LS_KEY, normalized);
    } catch {
      // Ignore storage quota errors in restricted webviews
    }
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    try {
      document.documentElement.dataset.logoVariant = normalized;
    } catch {
      // Ignore dataset restrictions
    }
  }

  if (previous !== normalized) {
    logoListeners.forEach((listener) => listener());
  }
}

function subscribeLogoVariant(listener: () => void): () => void {
  logoListeners.add(listener);
  if (typeof window === 'undefined') {
    return () => {
      logoListeners.delete(listener);
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOGO_LS_KEY) {
      const next = normalizeLogoVariant(event.newValue);
      inMemoryLogoVariant = next;
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.dataset.logoVariant = next;
      }
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    logoListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function renderLogoMark(
  variant: CanonicalLogoVariant,
  mono: boolean,
  strokeWidth: number
): React.ReactNode {
  const coreFill = mono ? 'currentColor' : 'var(--kora-accent)';
  const sw = (factor: number, min: number) =>
    Math.max(min, Number((strokeWidth * factor).toFixed(2)));

  switch (variant) {
    case 'holmes':
      return (
        <>
          <path
            d="M 4.4 23.0 C 6.0 13.4 11.2 6.8 17.6 6.8 C 23.6 6.8 28.4 13.0 35.6 12.2 C 36.1 12.15 36.1 12.9 35.5 13.05 C 28.0 14.9 23.2 10.1 18.0 10.1 C 12.2 10.1 7.8 15.2 5.3 23.4 C 5.1 24.0 4.3 23.7 4.4 23.0 Z"
            fill="currentColor"
          />
          <path
            d="M 34.8 18.6 C 32.8 27.8 26.8 32.6 19.6 32.0 C 13.8 31.5 9.8 27.6 5.2 27.8"
            stroke="currentColor"
            strokeWidth={sw(0.78, 1.5)}
            strokeOpacity={mono ? 0.82 : 0.68}
            strokeLinecap="round"
          />
          {!mono && (
            <circle cx="20" cy="20" r="7.2" fill="var(--kora-accent)" fillOpacity="0.16" />
          )}
          <circle cx="20" cy="20" r="4.3" fill={coreFill} />
        </>
      );

    case 'kao':
      return (
        <>
          <path
            d="M 32.6 10.8 A 15.4 15.4 0 1 0 32.6 29.2"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 10.5 13.4 V 26.6 M 10.5 20.2 L 16.6 13.4 M 13.1 17.3 L 16.8 26.6"
            stroke="currentColor"
            strokeWidth={sw(0.9, 1.8)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 20.2 26.6 L 25.0 13.4 L 29.8 26.6"
            stroke="currentColor"
            strokeWidth={sw(0.9, 1.8)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="25.0" cy="22.6" r="2.4" fill={coreFill} />
        </>
      );

    case 'orbital':
      return (
        <>
          <circle
            cx="20"
            cy="20"
            r="16.2"
            stroke="currentColor"
            strokeWidth={sw(0.55, 1.1)}
            strokeOpacity="0.22"
          />
          <path
            d="M 20 2.2 V 5.4 M 20 34.6 V 37.8 M 2.2 20 H 5.4 M 34.6 20 H 37.8"
            stroke="currentColor"
            strokeWidth={sw(0.6, 1.2)}
            strokeOpacity="0.45"
            strokeLinecap="round"
          />
          <ellipse
            cx="20"
            cy="20"
            rx="15.2"
            ry="6.2"
            transform="rotate(-32 20 20)"
            stroke="currentColor"
            strokeWidth={sw(0.78, 1.5)}
          />
          <ellipse
            cx="20"
            cy="20"
            rx="15.2"
            ry="6.2"
            transform="rotate(32 20 20)"
            stroke="currentColor"
            strokeWidth={sw(0.68, 1.3)}
            strokeOpacity="0.48"
          />
          <circle cx="31.6" cy="10.9" r="1.75" fill={coreFill} />
          <circle cx="20" cy="20" r="6.8" fill={coreFill} fillOpacity="0.2" />
          <circle cx="20" cy="20" r="3.8" fill={coreFill} />
        </>
      );

    case 'eclipse':
      return (
        <>
          <path
            d={KORA_ORBIT_PATH}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d="M 24.62 14.87 A 6.9 6.9 0 0 1 24.06 25.58"
            stroke="currentColor"
            strokeWidth={sw(0.65, 1.3)}
            strokeOpacity="0.45"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="4.5" fill={coreFill} />
        </>
      );
  }
}

interface KoraLogoProps {
  /** Explicit variant (e.g. for picker previews); omits subscription when set. */
  variant?: LogoVariant;
  className?: string;
  /**
   * `mono` draws the core in currentColor (for nav icons / inline AI badges),
   * otherwise the core uses the accent color.
   */
  mono?: boolean;
  strokeWidth?: number;
}

export const KoraLogo: React.FC<KoraLogoProps> = ({
  variant,
  className = 'w-8 h-8',
  mono = false,
  strokeWidth = 2.3
}) => {
  const syncedVariant = useSyncExternalStore(
    subscribeLogoVariant,
    readSyncLogoVariant,
    readSyncLogoVariant
  );
  const activeVariant = normalizeLogoVariant(variant ?? syncedVariant);

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {renderLogoMark(activeVariant, mono, strokeWidth)}
    </svg>
  );
};

/** Flat circular brand badge used wherever "Kora" (the AI coach) speaks. */
export const KoraBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  variant?: LogoVariant;
  className?: string;
}> = ({ size = 'md', variant, className = '' }) => {
  const box = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const mark = size === 'sm' ? 'w-[22px] h-[22px]' : size === 'lg' ? 'w-8 h-8' : 'w-7 h-7';
  return (
    <span className={`kora-badge ${box} rounded-full flex items-center justify-center shrink-0 ${className}`}>
      <KoraLogo variant={variant} className={mark} />
    </span>
  );
};
