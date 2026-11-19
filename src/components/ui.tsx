import React from 'react';

/**
 * Shared UI primitives so every tab uses the exact same building blocks
 * modeled after the Train filter (Alle / Offen / Erledigt).
 */

interface SegmentedOption<T extends string> {
  id: T;
  label: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

/** Flat segmented control with a sliding thumb (the Train "Alle / Offen / Erledigt" look). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md'
}: SegmentedProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === value)
  );
  const count = options.length;
  return (
    <div className={`kora-segment relative rounded-full p-0.5 overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className="kora-segment-thumb absolute top-0.5 bottom-0.5 rounded-full pointer-events-none"
        style={{
          left: `calc(2px + ${index} * ((100% - 4px) / ${count}))`,
          width: `calc((100% - 4px) / ${count})`,
          transition: 'left 280ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      />
      <div
        className="relative z-10 grid"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className={`${
                size === 'sm' ? 'min-h-[38px]' : 'min-h-[42px]'
              } rounded-full text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 px-2 whitespace-nowrap ${
                active ? 'text-[var(--kora-text)] font-semibold' : 'kora-muted font-medium'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  leading?: React.ReactNode;
}

/** Large Apple-Music-style page title used consistently at the top of every tab. */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, action, leading }) => (
  <div className="px-1 pt-1 flex items-end justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      {leading}
      <div className="min-w-0">
        <p className="text-xs font-medium kora-muted truncate">{eyebrow}</p>
        <h1 className="text-[26px] sm:text-[28px] leading-tight font-bold tracking-tight mt-0.5 truncate">
          {title}
        </h1>
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/** Renders coach/journal text with **bold** and *italic* markdown without raw asterisks. */
export const RichText: React.FC<{ text: string }> = ({ text }) => {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
          return (
            <strong key={i} className="font-semibold text-[var(--kora-text)]">
              {tok.slice(2, -2)}
            </strong>
          );
        }
        if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
          return (
            <em key={i} className="italic">
              {tok.slice(1, -1)}
            </em>
          );
        }
        return <React.Fragment key={i}>{tok}</React.Fragment>;
      })}
    </>
  );
};
