import React from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
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
    <div className="space-y-5">
      {/* Apple Music Style Large Header Row */}
      <div className="px-1 pt-1 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium kora-muted">{activeGym} • Core Overview</p>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight mt-0.5">
            Core, {userName}
          </h1>
        </div>
        <button
          type="button"
          onClick={onSyncHealth}
          className="liquid-pill rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 kora-muted ${isSyncingHealth ? 'animate-spin text-[#fa2d48]' : ''}`}
          />
          <span>Sync</span>
        </button>
      </div>

      {/* Active Session Recovery OR Clean Start Card */}
      {activeWorkout.isWorkoutActive ? (
        <div className="liquid-glass-elevated rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#fa2d48] animate-pulse shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#fa2d48]">
                    Aktiv • {formatElapsedMinutes(activeWorkout.startedAt)}
                  </span>
                </div>
                <h2 className="text-[15px] font-semibold truncate mt-0.5">
                  {activePlan?.name ?? 'Aktives Training'}
                </h2>
                <p className="text-xs kora-muted truncate">Direkt weitermachen</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeWorkout}
              className="btn-accent px-4 py-2.5 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-90 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Weiter</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="liquid-glass rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full kora-orb flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#1d1d1f]" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold tracking-tight">Heute trainieren</p>
                <p className="text-xs kora-muted truncate">
                  {activePlan?.name ?? 'Session wählen'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => activePlan && onStartWorkout(activePlan.id)}
              className="btn-primary px-4 py-2.5 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-90 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Starten</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimalist 3-Metric Hairline Strip */}
      <div className="liquid-glass rounded-[24px] grid grid-cols-3 divide-x kora-hairline-divider">
        <div className="p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <Activity className="w-3.5 h-3.5 text-[#fa2d48]" />
            <span className="text-[10px] font-medium kora-muted">Readiness</span>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{readiness}</p>
            <p className="text-[10px] kora-muted mt-0.5">Health Connect</p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <HeartPulse className="w-3.5 h-3.5 kora-muted" />
            <span className="text-[10px] font-medium kora-muted">HRV</span>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {latestHealth?.hrvMs ?? 62}
              <span className="text-xs font-normal kora-muted ml-0.5">ms</span>
            </p>
            <p className="text-[10px] kora-muted mt-0.5">
              RHR {latestHealth?.restingHrBpm ?? 55} bpm
            </p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <Moon className="w-3.5 h-3.5 kora-muted" />
            <span className="text-[10px] font-medium kora-muted">Schlaf</span>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {latestHealth?.sleepHours ?? 7.8}
              <span className="text-xs font-normal kora-muted ml-0.5">h</span>
            </p>
            <p className="text-[10px] kora-muted mt-0.5">
              Score {latestHealth?.sleepScore ?? 86}%
            </p>
          </div>
        </div>
      </div>

      {/* Kora Proactive Check-in */}
      <div className="liquid-glass rounded-[24px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fa2d48]" />
            <span className="text-xs font-semibold tracking-tight">Kora Coach</span>
            <span className="text-[11px] kora-muted">• Daily Cron</span>
          </div>
          <button
            type="button"
            onClick={onRunProactiveCheckin}
            className="liquid-pill px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 transition"
          >
            <Sparkles className="w-3 h-3 text-[#fa2d48]" />
            <span>Check-in</span>
          </button>
        </div>

        <p className="text-[13px] leading-relaxed opacity-85 whitespace-pre-line">
          {latestCoachMessage?.content ??
            'Kora überwacht Trainingslast, Regeneration und Mental-Journal für dein optimales Tempo.'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t kora-hairline-divider">
          <span className="text-[11px] kora-muted tabular-nums">
            {latestHealth?.steps.toLocaleString('de-DE') ?? '6.120'} Schritte •{' '}
            {latestHealth?.activeCalories ?? 290} kcal
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('coach')}
            className="text-xs font-semibold text-[#fa2d48] flex items-center gap-0.5 cursor-pointer hover:opacity-80 transition"
          >
            <span>Coach öffnen</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() => onNavigateTab('train')}
          className="liquid-pill px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-80 transition"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Training</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('mind')}
          className="liquid-pill px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-80 transition"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Tagebuch</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('insights')}
          className="liquid-pill px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-80 transition"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Verlauf</span>
        </button>
      </div>

      {/* Recent Activity List with Hairline Dividers */}
      {(latestJournal || history.length > 0) && (
        <div className="liquid-glass rounded-[24px] overflow-hidden divide-y kora-hairline-divider">
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider kora-muted">
              Letzte Aktivität
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('insights')}
              className="text-xs font-medium text-[#fa2d48] cursor-pointer hover:opacity-80 transition"
            >
              Alle
            </button>
          </div>

          {latestJournal && (
            <div className="px-4 py-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Mental Journal • {latestJournal.dateKey}</span>
                <span className="kora-muted tabular-nums">
                  Mood {latestJournal.mood}/10 • Stress {latestJournal.stress}/10
                </span>
              </div>
              <p className="text-xs kora-muted line-clamp-2">{latestJournal.note}</p>
            </div>
          )}

          {history.slice(-1).map((session) => (
            <div key={session.id} className="px-4 py-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">{session.planName}</span>
                <span className="kora-muted">{session.gym}</span>
              </div>
              <p className="text-xs kora-muted tabular-nums">
                {session.totalSets} Sätze • {session.totalVolumeKg.toLocaleString('de-DE')} kg Volumen
                • {session.durationMinutes} Min
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
