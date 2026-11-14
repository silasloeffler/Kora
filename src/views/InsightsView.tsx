import React from 'react';
import { Activity, Trash2, TrendingUp } from 'lucide-react';
import { Exercise, HealthConnectDailyMetric, WorkoutSessionRecord } from '../types/kora';

interface InsightsViewProps {
  exercises: Exercise[];
  history: WorkoutSessionRecord[];
  healthMetrics: HealthConnectDailyMetric[];
  onDeleteHistory: (sessionId: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  exercises,
  history,
  healthMetrics,
  onDeleteHistory
}) => {
  const recoveryItems = exercises
    .filter((ex) => ex.topWeight && ex.topWeight > 0)
    .map((ex) => {
      const current = Math.max(...ex.sets.map((s) => s.weight), 0);
      const pct = Math.min(100, Math.round((current / (ex.topWeight as number)) * 100));
      return { ex, current, pct };
    })
    .slice(0, 8);

  const avgRecovery =
    recoveryItems.length > 0
      ? Math.round(recoveryItems.reduce((acc, item) => acc + item.pct, 0) / recoveryItems.length)
      : 0;

  return (
    <div className="space-y-5">
      <div className="px-1">
        <p className="text-xs font-medium kora-muted">Analytics &amp; Verlauf</p>
        <h2 className="text-[26px] leading-tight font-bold tracking-tight mt-0.5">
          Insights &amp; Progression
        </h2>
      </div>

      {/* Strength Recovery vs Peak */}
      <div className="liquid-glass rounded-[24px] p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs kora-muted flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <span>Re-Entry vs. All-Time Peak</span>
            </p>
            <p className="text-2xl font-bold tracking-tight mt-0.5 tabular-nums">
              {avgRecovery}% Ø Kraft-Basis
            </p>
          </div>
          <span className="liquid-pill px-3 py-1 rounded-full text-[11px] font-semibold tabular-nums">
            {exercises.length} Übungen
          </span>
        </div>

        <div className="space-y-2.5">
          {recoveryItems.map(({ ex, current, pct }) => (
            <div key={ex.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium truncate pr-2">{ex.name}</span>
                <span className="font-mono kora-muted shrink-0 tabular-nums text-[11px]">
                  {current} / {ex.topWeight} kg ({pct}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Semantic Accessible Fallback Table */}
        <table className="sr-only">
          <caption>Re-Entry Trainingsgewicht im Vergleich zum bisherigen Peak</caption>
          <thead>
            <tr>
              <th>Übung</th>
              <th>Aktuell (kg)</th>
              <th>Peak (kg)</th>
              <th>Prozent</th>
            </tr>
          </thead>
          <tbody>
            {recoveryItems.map(({ ex, current, pct }) => (
              <tr key={ex.id}>
                <td>{ex.name}</td>
                <td>{current}</td>
                <td>{ex.topWeight}</td>
                <td>{pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 7-Day Health Connect Chart */}
      <div className="liquid-glass rounded-[24px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-accent" />
            <span>Health Connect Readiness (7 Tage)</span>
          </h3>
          <span className="text-[11px] kora-muted">HRV &amp; Schlaf</span>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
          {healthMetrics.slice(-7).map((m) => (
            <div key={m.dateKey} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-mono kora-muted tabular-nums">
                {m.readinessScore}
              </span>
              <div className="w-full max-w-[24px] flex-1 flex items-end bg-black/[0.05] dark:bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                <div
                  className="w-full rounded-full bg-accent transition-all"
                  style={{ height: `${m.readinessScore}%` }}
                />
              </div>
              <span className="text-[9px] kora-muted tabular-nums">{m.dateKey.slice(5)}</span>
            </div>
          ))}
        </div>

        <table className="sr-only">
          <caption>7-Tage Health Connect Readiness und HRV</caption>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Readiness</th>
              <th>HRV (ms)</th>
              <th>Schlaf (h)</th>
            </tr>
          </thead>
          <tbody>
            {healthMetrics.slice(-7).map((m) => (
              <tr key={m.dateKey}>
                <td>{m.dateKey}</td>
                <td>{m.readinessScore}</td>
                <td>{m.hrvMs}</td>
                <td>{m.sleepHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Workout History List */}
      <div className="liquid-glass rounded-[24px] overflow-hidden divide-y kora-hairline-divider">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Workout-Historie</h3>
          <span className="text-xs kora-muted tabular-nums">{history.length} Einheiten</span>
        </div>

        {history.length === 0 ? (
          <div className="p-6 text-center text-xs kora-muted">
            Noch keine abgeschlossenen Workouts gespeichert.
          </div>
        ) : (
          history
            .slice()
            .reverse()
            .map((session) => (
              <div key={session.id} className="p-4 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[13px]">{session.planName}</p>
                    <p className="text-[11px] kora-muted mt-0.5">
                      {session.dateLabel} • {session.gym} • {session.durationMinutes} Min
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHistory(session.id)}
                    aria-label="Eintrag löschen"
                    className="liquid-pill w-9 h-9 rounded-full flex items-center justify-center kora-muted hover:text-accent cursor-pointer transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 pt-2 border-t kora-hairline-divider">
                  {session.summary.map((item) => (
                    <div key={item.exerciseId} className="flex justify-between text-[11px]">
                      <span className="truncate pr-2 opacity-85">{item.name}</span>
                      <span className="font-mono kora-muted shrink-0 tabular-nums">
                        {item.sets} Sätze • max {item.maxWeight} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
