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
  RefreshCw
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
import { KoraBadge, KoraLogo } from '../components/KoraLogo';
import { PageHeader, RichText } from '../components/ui';

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
      <PageHeader
        eyebrow={`${activeGym} • Core Overview`}
        title={`Core, ${userName}`}
        action={
          <button
            type="button"
            onClick={onSyncHealth}
            className="liquid-pill min-h-[44px] rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncingHealth ? 'animate-spin text-accent' : 'kora-muted'}`}
            />
            <span>Sync</span>
          </button>
        }
      />

      {/* Active Session Recovery OR Clean Start Card */}
      {activeWorkout.isWorkoutActive ? (
        <div className="liquid-glass rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
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
              className="btn-accent min-h-[44px] px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 hover:opacity-90 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Weiter</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="liquid-glass rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5" />
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
              className="btn-accent min-h-[44px] px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Starten</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimalist 3-Metric Hairline Strip */}
      <div className="liquid-glass rounded-[24px] grid grid-cols-3 divide-x kora-hairline-divider">
        <div className="p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <Activity className="w-3.5 h-3.5 text-accent" />
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
          <div className="flex items-center gap-2.5 min-w-0">
            <KoraBadge size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="text-[13px] font-semibold tracking-tight">Kora Coach</p>
              <p className="text-[11px] kora-muted">Täglicher Check-in</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRunProactiveCheckin}
            className="liquid-pill min-h-[44px] px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
          >
            <KoraLogo mono className="w-4 h-4" />
            <span>Check-in</span>
          </button>
        </div>

        <p className="text-[13px] leading-relaxed opacity-85 whitespace-pre-line">
          <RichText
            text={
              latestCoachMessage?.content ??
              'Kora überwacht Trainingslast, Regeneration und Mental-Journal für dein optimales Tempo.'
            }
          />
        </p>

        <div className="flex items-center justify-between pt-2 border-t kora-hairline-divider">
          <span className="text-[11px] kora-muted tabular-nums">
            {latestHealth?.steps.toLocaleString('de-DE') ?? '6.120'} Schritte •{' '}
            {latestHealth?.activeCalories ?? 290} kcal
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('coach')}
            className="text-xs font-semibold text-accent flex items-center gap-0.5 cursor-pointer hover:opacity-80 transition min-h-[44px] px-3"
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
          className="kora-chip min-h-[44px] px-4 py-2 rounded-full text-xs flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Training</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('mind')}
          className="kora-chip min-h-[44px] px-4 py-2 rounded-full text-xs flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition"
        >
          <Brain className="w-4 h-4" />
          <span>Tagebuch</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('insights')}
          className="kora-chip min-h-[44px] px-4 py-2 rounded-full text-xs flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Verlauf</span>
        </button>
      </div>

      {/* Recent Activity List with Hairline Dividers */}
      {(latestJournal || history.length > 0) && (
        <div className="liquid-glass rounded-[24px] overflow-hidden divide-y kora-hairline-divider">
          <div className="px-4 py-1.5 flex items-center justify-between">
            <h3 className="kora-eyebrow">Letzte Aktivität</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('insights')}
              className="text-xs font-semibold text-accent cursor-pointer hover:opacity-80 transition min-h-[44px] px-3 flex items-center"
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
