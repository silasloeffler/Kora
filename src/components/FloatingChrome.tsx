import React from 'react';
import {
  Brain,
  CircleDot,
  Dumbbell,
  LineChart,
  Moon,
  Pause,
  Play,
  Plus,
  Settings,
  Sparkles,
  Sun,
  X
} from 'lucide-react';
import { AppTab, ThemeMode } from '../types/kora';
import { formatElapsedMinutes, formatSecondsClock } from '../services/timer';

interface TopGlassHeaderProps {
  userName: string;
  activeGym: string;
  gyms: string[];
  theme: ThemeMode;
  readinessScore: number;
  onChangeGym: (gym: string) => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const TopGlassHeader: React.FC<TopGlassHeaderProps> = ({
  userName,
  activeGym,
  gyms,
  theme,
  readinessScore,
  onChangeGym,
  onToggleTheme,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-xl px-3.5">
      <div className="liquid-glass-elevated rounded-full px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full kora-orb flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#fa2d48]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight truncate">Kora</span>
              <span className="text-[11px] kora-muted font-medium">
                {readinessScore}% Ready
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
            className="liquid-pill rounded-full px-3 py-1.5 text-[11px] font-medium focus:outline-none max-w-[136px] truncate cursor-pointer bg-transparent"
          >
            {gyms.map((g) => (
              <option key={g} value={g} className="bg-neutral-900 text-neutral-100">
                {g}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Zum Light Mode wechseln' : 'Zum Dark Mode wechseln'}
            className="liquid-pill w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 opacity-85" />
            ) : (
              <Moon className="w-4 h-4 opacity-85" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Einstellungen & Backup öffnen"
            className="liquid-pill w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Settings className="w-4 h-4 opacity-85" />
          </button>
        </div>
      </div>
    </header>
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
  onJumpToWorkout: () => void;
  onDismissTimer: () => void;
}

/**
 * Modeled directly after Apple Music Android's floating Now-Playing Gaussian bar:
 * borderless frosted glass, subtle hairline progress along the bottom edge,
 * clean monochrome controls.
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
  onOpenTimerModal,
  onJumpToWorkout,
  onDismissTimer
}) => {
  if (!isVisible) return null;

  const pct =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100))
      : 0;

  return (
    <div className="fixed bottom-[5.25rem] left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto liquid-glass-elevated rounded-2xl px-3.5 py-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onOpenTimerModal}
            className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl liquid-pill flex items-center justify-center shrink-0">
              <span className="text-[11px] font-mono font-semibold tracking-tight">
                {isTimerRunning || remainingSeconds !== totalSeconds
                  ? formatSecondsClock(remainingSeconds)
                  : 'LIVE'}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold truncate max-w-[155px]">
                {exerciseName || 'Aktives Workout'}
              </p>
              <p className="text-[11px] kora-muted">
                {isTimerRunning
                  ? `Pause läuft • ${formatSecondsClock(remainingSeconds)}`
                  : `Session • ${formatElapsedMinutes(startedAt)}`}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onAdd15s}
              className="liquid-pill px-2.5 py-1.5 rounded-full text-[11px] font-medium cursor-pointer flex items-center gap-0.5"
              title="+15 Sekunden"
            >
              <Plus className="w-3 h-3" />
              15s
            </button>

            <button
              type="button"
              onClick={onToggleTimer}
              aria-label={isTimerRunning ? 'Pause anhalten' : 'Pausen-Timer starten'}
              className="w-8 h-8 rounded-full btn-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={onJumpToWorkout}
              className="liquid-pill px-2.5 py-1.5 rounded-full text-[11px] font-medium cursor-pointer"
            >
              Öffnen
            </button>

            {!startedAt && (
              <button
                type="button"
                onClick={onDismissTimer}
                aria-label="Timer schließen"
                className="w-7 h-7 rounded-full flex items-center justify-center kora-muted hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hairline bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10 dark:bg-white/10">
          <div
            className="h-full bg-[#fa2d48] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
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

const DOCK_ITEMS: Array<{ id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
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
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-3.5 left-0 right-0 z-40 px-4"
    >
      <div className="mx-auto max-w-md liquid-glass-elevated rounded-full p-1.5 grid grid-cols-5 gap-1">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative rounded-full py-2 px-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-black/[0.08] dark:bg-white/[0.14] text-[#fa2d48] font-semibold'
                  : 'kora-muted hover:opacity-100'
              }`}
            >
              <div className="relative">
                <Icon className="w-[18px] h-[18px]" />
                {item.id === 'coach' && hasUnreadProactive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-[#fa2d48]" />
                )}
                {item.id === 'train' && isWorkoutActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-[#fa2d48] animate-pulse" />
                )}
              </div>
              <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
