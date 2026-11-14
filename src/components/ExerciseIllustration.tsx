import React from 'react';
import { ExercisePattern } from '../types/kora';

interface ExerciseIllustrationProps {
  pattern: ExercisePattern;
  className?: string;
}

/**
 * Minimalist Black & White architectural line-art exercise visualizer.
 * Monochrome stroke adapts to dark/light themes, with a subtle Apple Music
 * coral locus on the primary target muscle.
 */
export const ExerciseIllustration: React.FC<ExerciseIllustrationProps> = ({
  pattern,
  className = 'w-20 h-16'
}) => {
  const accentFill = 'kora-svg-accent-fill';
  const accentStroke = 'kora-svg-accent-stroke';

  const renderScene = () => {
    switch (pattern) {
      case 'leg_press':
      case 'hack_squat':
        return (
          <g>
            <path d="M12 52h56M18 52V28l28 16M58 52l8-28" strokeWidth="1.6" opacity="0.38" />
            <rect x="61" y="18" width="5" height="18" rx="1.5" strokeWidth="1.5" opacity="0.65" />
            <circle cx="24" cy="28" r="4.2" strokeWidth="1.75" />
            <path d="M27 32l12 10 12-10 11-5" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="46" cy="36" rx="6" ry="3" transform="rotate(-24 46 36)" className={accentFill} strokeWidth="1.4" />
          </g>
        );
      case 'leg_extension':
        return (
          <g>
            <path d="M18 54h44M26 54V26M26 38h18v16" strokeWidth="1.5" opacity="0.38" />
            <circle cx="28" cy="18" r="4.2" strokeWidth="1.75" />
            <path d="M28 23v14h15l12-8" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M43 37l3 14" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.4" />
            <ellipse cx="41" cy="36" rx="5.5" ry="2.6" className={accentFill} strokeWidth="1.4" />
          </g>
        );
      case 'leg_curl':
        return (
          <g>
            <path d="M16 54h48M24 54V26M24 38h20v16" strokeWidth="1.5" opacity="0.38" />
            <circle cx="26" cy="18" r="4.2" strokeWidth="1.75" />
            <path d="M26 23v14h18l2 14" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="37" cy="40" rx="5.5" ry="2.4" className={accentFill} strokeWidth="1.4" />
          </g>
        );
      case 'hip_abduction':
        return (
          <g>
            <path d="M20 54h40M40 54V24" strokeWidth="1.4" opacity="0.35" />
            <circle cx="40" cy="16" r="4.2" strokeWidth="1.75" />
            <path d="M40 21v14M40 35l-13 8-2 10M40 35l13 8 2 10" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 44c-3-2-3-5 0-7M56 44c3-2 3-5 0-7" strokeWidth="1.4" className={accentStroke} strokeLinecap="round" />
            <circle cx="33" cy="37" r="3" className={accentFill} strokeWidth="1.2" />
            <circle cx="47" cy="37" r="3" className={accentFill} strokeWidth="1.2" />
          </g>
        );
      case 'lunge':
      case 'squat':
        return (
          <g>
            <path d="M12 54h56" strokeWidth="1.4" opacity="0.3" />
            <circle cx="38" cy="14" r="4.2" strokeWidth="1.75" />
            <path d="M38 19v15l-11 7v12M38 34l12 6 3 13" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 22h20" strokeWidth="1.8" opacity="0.65" />
            <ellipse cx="33" cy="38" rx="4.5" ry="3" className={accentFill} strokeWidth="1.4" />
          </g>
        );
      case 'lat_pulldown':
        return (
          <g>
            <path d="M14 54h52M54 54V10H24" strokeWidth="1.5" opacity="0.38" />
            <path d="M26 14h24" strokeWidth="2" opacity="0.7" />
            <circle cx="38" cy="22" r="4" strokeWidth="1.75" />
            <path d="M38 27v16M38 29l-10-9-2-6M38 29l10-9 2-6M38 43l-8 10M38 43l8 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M33 29l5 8 5-8Z" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'seated_row':
        return (
          <g>
            <path d="M12 54h56M62 54V16M24 54V38h18" strokeWidth="1.5" opacity="0.38" />
            <path d="M60 28L38 30" strokeWidth="1.4" strokeDasharray="2.5 2.5" opacity="0.5" />
            <circle cx="28" cy="19" r="4" strokeWidth="1.75" />
            <path d="M28 24v15l14 4 8 10M29 27l11 3" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="29" cy="29" rx="4" ry="5" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'back_extension':
        return (
          <g>
            <path d="M14 54h52M30 54l10-20" strokeWidth="1.5" opacity="0.38" />
            <circle cx="54" cy="20" r="4" strokeWidth="1.75" />
            <path d="M22 52l14-18 15-10" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="41" cy="30" rx="5" ry="2.6" transform="rotate(-32 41 30)" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'chest_press':
        return (
          <g>
            <path d="M14 54h52M22 54V16M22 40h18v14" strokeWidth="1.5" opacity="0.38" />
            <circle cx="29" cy="18" r="4" strokeWidth="1.75" />
            <path d="M29 23v16h12l4 14M29 27l18 0" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M47 20v14" strokeWidth="2.2" opacity="0.65" />
            <circle cx="32" cy="28" r="4.2" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'butterfly':
        return (
          <g>
            <path d="M16 54h48M40 54V14" strokeWidth="1.4" opacity="0.35" />
            <circle cx="40" cy="17" r="4" strokeWidth="1.75" />
            <path d="M40 22v17M40 25l-13 2 2 9M40 25l13 2-2 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M29 36c3 2 6 2 8 0M51 36c-3 2-6 2-8 0" className={accentStroke} strokeWidth="1.4" strokeLinecap="round" />
            <ellipse cx="40" cy="27" rx="6.5" ry="3.2" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'shoulder_press':
        return (
          <g>
            <path d="M16 54h48M26 54V18" strokeWidth="1.4" opacity="0.35" />
            <circle cx="40" cy="22" r="4" strokeWidth="1.75" />
            <path d="M40 27v16M30 28l-3-12M50 28l3-12M30 28h20" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="31" cy="27" r="3" className={accentFill} strokeWidth="1.3" />
            <circle cx="49" cy="27" r="3" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'lateral_raise':
        return (
          <g>
            <path d="M16 54h48" strokeWidth="1.4" opacity="0.3" />
            <circle cx="40" cy="15" r="4" strokeWidth="1.75" />
            <path d="M40 20v18l-5 15M40 38l5 15M40 24l-19-2M40 24l19-2" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="22" r="2.2" strokeWidth="1.6" />
            <circle cx="60" cy="22" r="2.2" strokeWidth="1.6" />
            <circle cx="35" cy="24" r="3" className={accentFill} strokeWidth="1.2" />
            <circle cx="45" cy="24" r="3" className={accentFill} strokeWidth="1.2" />
          </g>
        );
      case 'bicep_curl':
        return (
          <g>
            <path d="M16 54h48M28 54V32l12-4" strokeWidth="1.4" opacity="0.38" />
            <circle cx="32" cy="16" r="4" strokeWidth="1.75" />
            <path d="M32 21v18l8 14M32 25l10 8 5-9" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="47" cy="22" r="2.4" strokeWidth="1.6" />
            <ellipse cx="38" cy="29" rx="4" ry="2.5" transform="rotate(28 38 29)" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'tricep_pushdown':
      case 'dip':
        return (
          <g>
            <path d="M16 54h48M56 54V12H36" strokeWidth="1.4" opacity="0.38" />
            <path d="M42 12v18" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.5" />
            <circle cx="32" cy="18" r="4" strokeWidth="1.75" />
            <path d="M32 23v16l-3 14M32 23l3 30M32 26l6 8h6" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="36" cy="30" rx="3.2" ry="4" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      case 'core_crunch':
        return (
          <g>
            <path d="M14 54h52M22 54V38h20v16" strokeWidth="1.4" opacity="0.38" />
            <circle cx="32" cy="20" r="4" strokeWidth="1.75" />
            <path d="M28 24c0 8 4 12 10 14l10 3 3 12" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="33" cy="33" rx="4.5" ry="3" transform="rotate(-15 33 33)" className={accentFill} strokeWidth="1.3" />
          </g>
        );
      default:
        return (
          <g>
            <circle cx="40" cy="32" r="16" strokeWidth="1.75" opacity="0.5" />
            <circle cx="40" cy="32" r="6" className={accentFill} strokeWidth="1.5" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 80 64"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      {renderScene()}
    </svg>
  );
};
