import React from 'react';
import {
  Brain,
  ChevronDown,
  CircleDot,
  Dumbbell,
  LineChart,
  Pause,
  Play,
  Plus,
  Settings
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
      <div className="kora-statusbar-scrim fixed top-0 left-0 right-0 z-30" aria-hidden="true" />
      <header className="relative z-20 mx-auto w-full max-w-xl px-4 pt-[calc(var(--safe-top,0px)+8px)]">
        <div className="w-full liquid-glass-elevated rounded-full px-2.5 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="kora-badge w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <KoraLogo variant={logoVariant} className="w-6 h-6" />
            </div>
            <div className="min-w-0 leading-tight">
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
            <div className="relative liquid-pill h-11 rounded-full pl-3.5 pr-3 flex items-center gap-1.5 max-w-[170px] cursor-pointer active:scale-95 transition-transform">
              <span className="text-xs font-semibold truncate">{activeGym}</span>
              <ChevronDown className="w-4 h-4 kora-muted shrink-0" />
              <select
                aria-label="Aktives Fitnessstudio auswählen"
                value={activeGym}
                onChange={(e) => onChangeGym(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {gyms.map((g) => (
                  <option key={g} value={g} className="bg-neutral-900 text-neutral-100">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Einstellungen, Design & Backup öffnen"
              className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
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

/** Apple-Music-style floating "now playing" Gaussian bar for the active workout / rest timer. */
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
  const showClock = isTimerRunning || remainingSeconds !== totalSeconds;

  return (
    <div
      className="fixed left-0 right-0 z-40 pointer-events-none"
      style={{ bottom: 'calc(var(--safe-bottom, 0px) + 5.5rem)' }}
    >
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="w-full pointer-events-auto liquid-glass-elevated rounded-full px-2.5 py-2">
          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onOpenTimerModal}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
            >
              <div className="liquid-pill min-h-[42px] min-w-[68px] px-3 rounded-full flex items-center justify-center gap-1.5 shrink-0">
                {isTimerRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                )}
                <span className="text-[13px] font-semibold tabular-nums leading-none">
                  {showClock ? formatSecondsClock(remainingSeconds) : 'LIVE'}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate">
                  {exerciseName || 'Aktives Training'}
                </p>
                <p className="text-[11px] kora-muted tabular-nums truncate">
                  {isTimerRunning
                    ? 'Satzpause läuft'
                    : `Session • ${formatElapsedMinutes(startedAt)}`}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onAdd15s}
                className="liquid-pill min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-0.5 active:scale-95 transition-transform"
                title="+15 Sekunden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>15s</span>
              </button>

              <button
                type="button"
                onClick={onToggleTimer}
                aria-label={isTimerRunning ? 'Pause anhalten' : 'Pausen-Timer starten'}
                className="w-11 h-11 rounded-full btn-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                {isTimerRunning ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                )}
              </button>
            </div>
          </div>

          {isTimerRunning && (
            <div className="absolute inset-x-6 bottom-0 h-[2px] rounded-full overflow-hidden pointer-events-none">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
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

const KoraNavIcon: React.FC<{ className?: string }> = ({ className }) => (
  <KoraLogo mono strokeWidth={2.5} className={className} />
);

const DOCK_ITEMS: Array<{
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'core', label: 'Core', icon: CircleDot },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'mind', label: 'Mind', icon: Brain },
  { id: 'coach', label: 'Kora', icon: KoraNavIcon },
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

  return (
    <>
      <div className="kora-bottom-scrim fixed bottom-0 left-0 right-0 z-30" aria-hidden="true" />
      <nav
        aria-label="Hauptnavigation"
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{ bottom: 'calc(var(--safe-bottom, 0px) + 10px)' }}
      >
        <div className="mx-auto w-full max-w-xl px-4">
          <div className="w-full pointer-events-auto liquid-glass-elevated rounded-full p-1">
            {/* Flat minimalist sliding thumb matching the Train segmented filter */}
            <div
              aria-hidden="true"
              className="absolute top-1 bottom-1 pointer-events-none"
              style={{
                left: `calc(4px + ${activeIndex} * ((100% - 8px) / 5))`,
                width: 'calc((100% - 8px) / 5)',
                transition: 'left 320ms cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <div className="w-full h-full rounded-full kora-dock-bubble" />
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
                    aria-current={active ? 'page' : undefined}
                    className={`relative rounded-full min-h-[54px] px-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 cursor-pointer ${
                      active ? 'text-accent font-semibold' : 'kora-muted'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-[20px] h-[20px]" />
                      {item.id === 'coach' && hasUnreadProactive && (
                        <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-accent" />
                      )}
                      {item.id === 'train' && isWorkoutActive && (
                        <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10.5px] leading-none tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
