import React, { useState } from 'react';
import { Activity, Pencil, Search, Trash2, TrendingUp, Wrench } from 'lucide-react';
import { Exercise, HealthConnectDailyMetric, WorkoutSessionRecord } from '../types/kora';
import { ExerciseIllustration } from '../components/ExerciseIllustration';

interface InsightsViewProps {
  exercises: Exercise[];
  history: WorkoutSessionRecord[];
  healthMetrics: HealthConnectDailyMetric[];
  activeGym: string;
  onUpdatePinNote: (exerciseId: string, gym: string, note: string) => void;
  onDeleteHistory: (sessionId: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  exercises,
  history,
  healthMetrics,
  activeGym,
  onUpdatePinNote,
  onDeleteHistory
}) => {
  const [pinQuery, setPinQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinDraft, setPinDraft] = useState('');

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

  const filteredMachines = exercises.filter((ex) =>
    `${ex.name} ${ex.category} ${ex.gymSettings[activeGym] ?? ''}`
      .toLowerCase()
      .includes(pinQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="px-1">
        <p className="text-xs opacity-60 font-medium">C24-Style Analytics &amp; Geräte-Pins</p>
        <h2 className="text-xl font-bold tracking-tight">Insights &amp; Progression</h2>
      </div>

      {/* Strength Recovery vs Peak */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-65 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Re-Entry vs. All-Time Peak</span>
            </p>
            <p className="text-2xl font-bold tracking-tight mt-0.5">{avgRecovery}% Ø Kraft-Basis</p>
          </div>
          <span className="liquid-pill px-3 py-1 rounded-full text-[11px] font-semibold">
            {exercises.length} Übungen
          </span>
        </div>

        <div className="space-y-2">
          {recoveryItems.map(({ ex, current, pct }) => (
            <div key={ex.id} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold truncate pr-2">{ex.name}</span>
                <span className="font-mono opacity-75 shrink-0">
                  {current} / {ex.topWeight} kg ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/15 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-500"
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
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Health Connect Readiness (7 Tage)</span>
          </h3>
          <span className="text-[11px] opacity-65">HRV &amp; Schlaf</span>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
          {healthMetrics.slice(-7).map((m) => (
            <div key={m.dateKey} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-mono opacity-75">{m.readinessScore}</span>
              <div className="w-full max-w-[26px] flex-1 flex items-end bg-black/10 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-emerald-500 to-cyan-400 transition-all"
                  style={{ height: `${m.readinessScore}%` }}
                />
              </div>
              <span className="text-[9px] opacity-60">{m.dateKey.slice(5)}</span>
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

      {/* Machine Pin Reference per Studio */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>TechnoGym Geräte-Pins</span>
            </h3>
            <p className="text-[11px] opacity-65">Aktives Studio: {activeGym}</p>
          </div>
        </div>

        <div className="liquid-pill rounded-2xl px-3 py-2 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 opacity-55" />
          <input
            type="text"
            value={pinQuery}
            onChange={(e) => setPinQuery(e.target.value)}
            placeholder="Gerät, Muskelgruppe oder Pin suchen..."
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
          {filteredMachines.map((ex) => {
            const note = ex.gymSettings[activeGym] || '';
            return (
              <div
                key={ex.id}
                className="p-3 rounded-2xl bg-black/10 dark:bg-white/[0.04] border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ExerciseIllustration pattern={ex.pattern} className="w-11 h-9 shrink-0 opacity-85" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{ex.name}</p>
                      <p className="text-[10px] opacity-60">
                        {ex.category} • Ziel {ex.targetWeight || '-'} kg • Peak {ex.topWeight ?? '-'} kg
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(ex.id);
                      setPinDraft(note);
                    }}
                    className="liquid-pill px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3 text-amber-400" />
                    <span>Pin</span>
                  </button>
                </div>

                {editingId === ex.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pinDraft}
                      onChange={(e) => setPinDraft(e.target.value)}
                      placeholder={`Einstellung für ${activeGym}...`}
                      className="flex-1 liquid-pill rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdatePinNote(ex.id, activeGym, pinDraft);
                        setEditingId(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] opacity-80">
                    {note || <span className="opacity-50 italic">Noch keine Notiz für {activeGym}</span>}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout History */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Workout-Historie</h3>
          <span className="text-[11px] opacity-65">{history.length} Einheiten</span>
        </div>

        <div className="space-y-2.5">
          {history
            .slice()
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-black/10 dark:bg-white/[0.04] border border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{session.planName}</p>
                    <p className="text-[11px] opacity-65">
                      {session.dateLabel} • {session.gym} • {session.durationMinutes} Min
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHistory(session.id)}
                    aria-label="Eintrag löschen"
                    className="opacity-50 hover:opacity-100 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 pt-1 border-t border-white/10">
                  {session.summary.map((item) => (
                    <div key={item.exerciseId} className="flex justify-between text-[11px] opacity-85">
                      <span className="truncate pr-2">{item.name}</span>
                      <span className="font-mono shrink-0">
                        {item.sets} Sätze • max {item.maxWeight} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
