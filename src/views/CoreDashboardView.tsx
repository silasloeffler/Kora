import React from 'react';
import {
  Activity,
  ArrowUpRight,
  Brain,
  Clock,
  Dumbbell,
  HeartPulse,
  Moon,
  Play,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  ActiveWorkoutState,
  AppTab,
  CoachMessage,
  HealthConnectDailyMetric,
  JournalEntry,
  WorkoutPlan,
  WorkoutSessionRecord
} from '../types/kora';
import { formatElapsedMinutes } from '../services/timer';

interface CoreDashboardViewProps {
  userName: string;
  activeGym: string;
  activeWorkout: ActiveWorkoutState;
  plans: WorkoutPlan[];
  latestHealth: HealthConnectDailyMetric | undefined;
  latestCoachMessage: CoachMessage | undefined;
  latestJournal: JournalEntry | undefined;
  history: WorkoutSessionRecord[];
  isSyncingHealth: boolean;
  onSyncHealth: () => void;
  onStartWorkout: (planId: string) => void;
  onResumeWorkout: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onRunProactiveCheckin: () => void;
}

export const CoreDashboardView: React.FC<CoreDashboardViewProps> = ({
  userName,
  activeGym,
  activeWorkout,
  plans,
  latestHealth,
  latestCoachMessage,
  latestJournal,
  history,
  isSyncingHealth,
  onSyncHealth,
  onStartWorkout,
  onResumeWorkout,
  onNavigateTab,
  onRunProactiveCheckin
}) => {
  const readiness = latestHealth?.readinessScore ?? 85;
  const activePlan = plans.find((p) => p.id === activeWorkout.activePlanId) ?? plans[0];

  return (
    <div className="space-y-4">
      {/* Greeting & Atmospheric Title (Liquid Glass System style) */}
      <div className="px-1 pt-1 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium opacity-60">Holistic Wellness Core • {activeGym}</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Dein Core, {userName}</h1>
        </div>
        <button
          type="button"
          onClick={onSyncHealth}
          className="liquid-pill rounded-full px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingHealth ? 'animate-spin' : ''}`} />
          <span>Health Sync</span>
        </button>
      </div>

      {/* Active Workout 0-Click Recovery Banner OR Quick Start Card */}
      {activeWorkout.isWorkoutActive ? (
        <div className="liquid-glass-elevated rounded-3xl p-4 border-cyan-400/35 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/35 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Session aktiv ({formatElapsedMinutes(activeWorkout.startedAt)})
                  </span>
                </div>
                <h2 className="text-sm font-bold mt-0.5">{activePlan?.name ?? 'Aktives Training'}</h2>
                <p className="text-[11px] opacity-65">0-Klick-Recovery bereit — direkt weitertrainieren</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeWorkout}
              className="px-4 py-2.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Weiter</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="liquid-glass rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full kora-orb flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Bereit für deine Session?</p>
                <p className="text-xs opacity-65">
                  Empfohlen: <span className="font-semibold opacity-100">{activePlan?.name}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => activePlan && onStartWorkout(activePlan.id)}
              className="px-4 py-2 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Starten</span>
            </button>
          </div>
        </div>
      )}

      {/* Bento 3-Tile Biometric & Core Metrics (Liquid Glass System style) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="liquid-glass rounded-2xl p-3.5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] opacity-60">Readiness</span>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{readiness}</p>
            <p className="text-[10px] opacity-65">Health Connect</p>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3.5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] opacity-60">HRV</span>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {latestHealth?.hrvMs ?? 62}
              <span className="text-xs font-normal opacity-60 ml-0.5">ms</span>
            </p>
            <p className="text-[10px] opacity-65">RHR {latestHealth?.restingHrBpm ?? 55} bpm</p>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-3.5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] opacity-60">Schlaf</span>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {latestHealth?.sleepHours ?? 7.8}
              <span className="text-xs font-normal opacity-60 ml-0.5">h</span>
            </p>
            <p className="text-[10px] opacity-65">Score {latestHealth?.sleepScore ?? 86}%</p>
          </div>
        </div>
      </div>

      {/* Proactive Always-On Kora Agent Briefing */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold">Kora Proactive Agent</span>
            <span className="text-[10px] opacity-55">• Always-On Cron</span>
          </div>
          <button
            type="button"
            onClick={onRunProactiveCheckin}
            className="liquid-pill px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Check-in</span>
          </button>
        </div>

        <p className="text-xs leading-relaxed opacity-85 whitespace-pre-line">
          {latestCoachMessage?.content ??
            'Kora überwacht Trainingslast, Regeneration und Mental-Journal für dein optimales Re-Entry-Tempo.'}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] opacity-55">
            {latestHealth?.steps.toLocaleString('de-DE') ?? '6.120'} Schritte heute • {latestHealth?.activeCalories ?? 290} kcal
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('coach')}
            className="text-[11px] font-bold text-cyan-400 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Coach öffnen</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Actions Floating Pills */}
      <div className="liquid-glass rounded-3xl p-4 space-y-2.5">
        <p className="text-xs font-bold opacity-85">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('train')}
            className="liquid-pill px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition"
          >
            <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trainingsplan</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('mind')}
            className="liquid-pill px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Mental Check-in</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('insights')}
            className="liquid-pill px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Geräte-Pins</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Letzte Impulse</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('insights')}
            className="text-[11px] opacity-60 hover:opacity-100 cursor-pointer"
          >
            Alle Details
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {latestJournal && (
            <div className="p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">Mental Tagebuch • {latestJournal.dateKey}</span>
                <span className="opacity-65">Mood {latestJournal.mood}/10 • Stress {latestJournal.stress}/10</span>
              </div>
              <p className="opacity-80 line-clamp-2">{latestJournal.note}</p>
            </div>
          )}

          {history.slice(-1).map((session) => (
            <div key={session.id} className="p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">{session.planName}</span>
                <span className="opacity-65">{session.gym}</span>
              </div>
              <p className="opacity-75">
                {session.totalSets} Sätze • {session.totalVolumeKg.toLocaleString('de-DE')} kg Volumen • {session.durationMinutes} Min
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
