import React, { useEffect, useRef, useState } from 'react';
import {
  Brain,
  CircleDot,
  Dumbbell,
  LineChart,
  Pause,
  Play,
  Plus,
  Settings,
  Sparkles
} from 'lucide-react';
import { AppTab, LogoVariant } from '../types/kora';
import { formatElapsedMinutes, formatSecondsClock } from '../services/timer';
import { KoraLogo } from './KoraLogo';

interface TopGlassHeaderProps {
  userName: string;
  activeGym: string;
  gyms: string[];
  logoVariant: LogoVariant;
  readinessScore: number;
  onChangeGym: (gym: string) => void;
  onOpenSettings: () => void;
}

export const TopGlassHeader: React.FC<TopGlassHeaderProps> = ({
  userName,
  activeGym,
  gyms,
  logoVariant,
  readinessScore,
  onChangeGym,
  onOpenSettings
}) => {
  return (
    <>
      <div
        className="kora-statusbar-scrim fixed top-0 left-0 right-0 z-30"
        aria-hidden="true"
      />
      <header className="sticky top-0 z-40 mx-auto w-full max-w-xl px-4 pt-[calc(var(--safe-top,0px)+8px)]">
        <div className="w-full liquid-glass-elevated rounded-full px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center shrink-0">
              <KoraLogo variant={logoVariant} className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-semibold text-[15px] tracking-tight shrink-0">Kora</span>
                <span className="text-[11px] text-accent font-semibold tabular-nums shrink-0">
                  {readinessScore}%
                </span>
              </div>
              <p className="text-[11px] kora-muted truncate">{userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              aria-label="Aktives Fitnessstudio auswählen"
              value={activeGym}
              onChange={(e) => onChangeGym(e.target.value)}
              className="liquid-pill min-h-[40px] rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none max-w-[136px] truncate cursor-pointer"
            >
              {gyms.map((g) => (
                <option key={g} value={g} className="bg-neutral-900 text-neutral-100">
                  {g}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Einstellungen, Design & Backup öffnen"
              className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Settings className="w-[18px] h-[18px] opacity-85" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

interface FloatingWorkoutPillProps {
  isVisible: boolean;
  exerciseName: string;
  startedAt: number | null;
  remainingSeconds: number;
  totalSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onAdd15s: () => void;
  onOpenTimerModal: () => void;
}

/**
 * Modeled directly after Apple Music Android's floating Now-Playing Gaussian bar:
 * aligned with content cards & bottom dock, tactile ergonomic buttons.
 */
export const FloatingWorkoutPill: React.FC<FloatingWorkoutPillProps> = ({
  isVisible,
  exerciseName,
  startedAt,
  remainingSeconds,
  totalSeconds,
  isTimerRunning,
  onToggleTimer,
  onAdd15s,
  onOpenTimerModal
}) => {
  if (!isVisible) return null;

  const pct =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100))
      : 0;

  return (
    <div
      className="fixed left-0 right-0 z-40 pointer-events-none"
      style={{ bottom: 'calc(var(--safe-bottom, 0px) + 5.5rem)' }}
    >
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="w-full pointer-events-auto liquid-glass-elevated rounded-[24px] px-4 py-3 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onOpenTimerModal}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl liquid-pill flex items-center justify-center shrink-0">
                <span className="text-xs font-mono font-semibold tracking-tight tabular-nums">
                  {isTimerRunning || remainingSeconds !== totalSeconds
                    ? formatSecondsClock(remainingSeconds)
                    : 'LIVE'}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate">
                  {exerciseName || 'Aktives Training'}
                </p>
                <p className="text-[11px] kora-muted tabular-nums">
                  {isTimerRunning
                    ? `Pause läuft • ${formatSecondsClock(remainingSeconds)}`
                    : `Session • ${formatElapsedMinutes(startedAt)}`}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onAdd15s}
                className="liquid-pill h-10 px-3.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
                title="+15 Sekunden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>15s</span>
              </button>

              <button
                type="button"
                onClick={onToggleTimer}
                aria-label={isTimerRunning ? 'Pause anhalten' : 'Pausen-Timer starten'}
                className="w-10 h-10 rounded-full btn-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                {isTimerRunning ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Hairline bottom progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/10 dark:bg-white/10">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface KoraDockProps {
  activeTab: AppTab;
  hasUnreadProactive: boolean;
  isWorkoutActive: boolean;
  onSelectTab: (tab: AppTab) => void;
}

const DOCK_ITEMS: Array<{
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'core', label: 'Core', icon: CircleDot },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'mind', label: 'Mind', icon: Brain },
  { id: 'coach', label: 'Kora', icon: Sparkles },
  { id: 'insights', label: 'Insights', icon: LineChart }
];

export const KoraDock: React.FC<KoraDockProps> = ({
  activeTab,
  hasUnreadProactive,
  isWorkoutActive,
  onSelectTab
}) => {
  const activeIndex = Math.max(
    0,
    DOCK_ITEMS.findIndex((item) => item.id === activeTab)
  );
  const [bubblePulse, setBubblePulse] = useState(0);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setBubblePulse((n) => n + 1);
  }, [activeTab]);

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed left-0 right-0 z-40 pointer-events-none"
      style={{ bottom: 'calc(var(--safe-bottom, 0px) + 10px)' }}
    >
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="w-full pointer-events-auto liquid-glass-elevated rounded-full p-1.5 relative">
          {/* Sliding Liquid Glass Bubble with wobble spring on tab switch */}
          <div
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 pointer-events-none"
            style={{
              left: `calc(6px + ${activeIndex} * ((100% - 12px) / 5))`,
              width: 'calc((100% - 12px) / 5)',
              transition: 'left 480ms cubic-bezier(0.28, 1.38, 0.52, 1)'
            }}
          >
            <div
              key={bubblePulse}
              className={`w-full h-full rounded-full kora-dock-bubble ${
                bubblePulse > 0 ? 'animate-liquid-bubble' : ''
              }`}
            />
          </div>

          <div className="relative z-10 grid grid-cols-5 gap-0">
            {DOCK_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative rounded-full min-h-[54px] px-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 cursor-pointer ${
                    active ? 'text-accent font-semibold' : 'kora-muted hover:opacity-100'
                  }`}
                >
                  <div className={`relative ${active && bubblePulse > 0 ? 'animate-icon-pop' : ''}`}>
                    <Icon className="w-[21px] h-[21px]" />
                    {item.id === 'coach' && hasUnreadProactive && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-accent" />
                    )}
                    {item.id === 'train' && isWorkoutActive && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
