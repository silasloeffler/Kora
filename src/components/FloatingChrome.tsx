import React from 'react';
import {
  Activity,
  Brain,
  Dumbbell,
  Flame,
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
    <header className="sticky top-2.5 z-40 mx-auto w-full max-w-xl px-3 pt-1">
      <div className="liquid-glass-elevated rounded-full px-3.5 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full kora-orb animate-kora-orb flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight truncate">Kora</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-400/25">
                {readinessScore}% Ready
              </span>
            </div>
            <p className="text-[11px] opacity-65 truncate">Hi {userName} • Core Active</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            aria-label="Aktives Fitnessstudio auswählen"
            value={activeGym}
            onChange={(e) => onChangeGym(e.target.value)}
            className="liquid-pill rounded-full px-2.5 py-1.5 text-[11px] font-semibold focus:outline-none max-w-[132px] truncate cursor-pointer bg-transparent"
          >
            {gyms.map((g) => (
              <option key={g} value={g} className="bg-slate-900 text-slate-100">
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
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Einstellungen & Backup öffnen"
            className="liquid-pill w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Settings className="w-4 h-4 opacity-80" />
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

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const ratio = totalSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds)) : 0;
  const offset = circumference - ratio * circumference;

  return (
    <div className="fixed bottom-[5.35rem] left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto liquid-glass-elevated rounded-full px-3 py-2 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onOpenTimerModal}
          className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
        >
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-15"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={isTimerRunning ? 'text-cyan-400 transition-all duration-300' : 'text-emerald-400'}
                fill="none"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold">
              {isTimerRunning || remainingSeconds !== totalSeconds ? formatSecondsClock(remainingSeconds) : 'LIVE'}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold truncate max-w-[145px]">
                {exerciseName || 'Aktives Workout'}
              </span>
            </div>
            <p className="text-[10px] opacity-65 font-medium">
              {isTimerRunning
                ? `Pause: ${formatSecondsClock(remainingSeconds)}`
                : `Session: ${formatElapsedMinutes(startedAt)}`}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onAdd15s}
            className="liquid-pill px-2 py-1 rounded-full text-[10px] font-bold hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center gap-0.5"
            title="+15 Sekunden"
          >
            <Plus className="w-3 h-3" />
            15s
          </button>

          <button
            type="button"
            onClick={onToggleTimer}
            aria-label={isTimerRunning ? 'Pause anhalten' : 'Pausen-Timer starten'}
            className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onJumpToWorkout}
            className="px-2.5 py-1 rounded-full bg-white/15 dark:bg-white/15 text-[10px] font-bold hover:bg-white/25 active:scale-95 transition cursor-pointer"
          >
            Fokus
          </button>

          {!startedAt && (
            <button
              type="button"
              onClick={onDismissTimer}
              aria-label="Timer schließen"
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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

const DOCK_ITEMS: Array<{ id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'core', label: 'Core', icon: Flame },
  { id: 'train', label: 'Train', icon: Dumbbell },
  { id: 'mind', label: 'Mind', icon: Brain },
  { id: 'coach', label: 'Kora AI', icon: Sparkles },
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
                  ? 'bg-cyan-500/20 dark:bg-white/15 text-cyan-600 dark:text-cyan-300 shadow-sm font-bold'
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.id === 'coach' && hasUnreadProactive && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                )}
                {item.id === 'train' && isWorkoutActive && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
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

export const HealthBridgeBadge: React.FC<{ connected: boolean; onClick: () => void }> = ({
  connected,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className="liquid-pill rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition"
  >
    <Activity className={`w-3.5 h-3.5 ${connected ? 'text-emerald-400' : 'text-amber-400'}`} />
    <span>{connected ? 'Health Connect Sync' : 'Bridge verbinden'}</span>
  </button>
);
