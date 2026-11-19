import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  Minus,
  Pencil,
  Plus,
  SlidersHorizontal,
  Timer,
  Trash2
} from 'lucide-react';
import { ActiveWorkoutState, Exercise, WorkoutPlan } from '../types/kora';
import { ExerciseIllustration } from '../components/ExerciseIllustration';
import { KoraLogo } from '../components/KoraLogo';
import { PageHeader, Segmented } from '../components/ui';

interface TrainViewProps {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  activeWorkout: ActiveWorkoutState;
  recoveredBannerVisible: boolean;
  onSelectPlan: (planId: string) => void;
  onStartWorkout: () => void;
  onFinishWorkout: () => void;
  onFocusExercise: (exerciseId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => void;
  onToggleSetDone: (exerciseId: string, setId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onUpdatePinNote: (exerciseId: string, gym: string, note: string) => void;
  onRemoveExerciseFromPlan: (exerciseId: string) => void;
  onOpenAddExercise: () => void;
  onStartRestTimer: (seconds: number) => void;
  onAskAiPlanAdapter: () => void;
}

const isExerciseAllDone = (ex: Exercise): boolean =>
  ex.sets.length > 0 && ex.sets.every((s) => s.done);

export const TrainView: React.FC<TrainViewProps> = ({
  exercises,
  plans,
  activeWorkout,
  recoveredBannerVisible,
  onSelectPlan,
  onStartWorkout,
  onFinishWorkout,
  onFocusExercise,
  onUpdateSet,
  onToggleSetDone,
  onAddSet,
  onDeleteSet,
  onUpdatePinNote,
  onRemoveExerciseFromPlan,
  onOpenAddExercise,
  onStartRestTimer,
  onAskAiPlanAdapter
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevAllDoneRef = useRef<Record<string, boolean>>({});

  const activePlan = plans.find((p) => p.id === activeWorkout.activePlanId) ?? plans[0];
  const planExercises = (activePlan?.exerciseIds ?? [])
    .map((id) => exercises.find((e) => e.id === id))
    .filter((e): e is Exercise => Boolean(e));

  const doneExercisesCount = planExercises.filter(isExerciseAllDone).length;
  const openExercisesCount = planExercises.length - doneExercisesCount;

  const filteredExercises = planExercises.filter((ex) => {
    const allDone = isExerciseAllDone(ex);
    if (statusFilter === 'open' && allDone) return false;
    if (statusFilter === 'done' && !allDone) return false;
    return true;
  });

  const completedSetsCount = planExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  );
  const totalSetsCount = planExercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  // Auto-collapse exercises when the last remaining set transitions to done
  useEffect(() => {
    const toCollapse: string[] = [];
    for (const ex of exercises) {
      const nowDone = isExerciseAllDone(ex);
      const wasDone = prevAllDoneRef.current[ex.id];
      if (wasDone === false && nowDone) {
        toCollapse.push(ex.id);
      }
      prevAllDoneRef.current[ex.id] = nowDone;
    }
    if (toCollapse.length > 0) {
      setExpandedIds((prev) => {
        const next = { ...prev };
        for (const id of toCollapse) {
          next[id] = false;
        }
        return next;
      });
    }
  }, [exercises]);

  // Seamless recovery scroll to last focused exercise
  useEffect(() => {
    const focusId = activeWorkout.focusedExerciseId;
    if (!focusId) return;
    const el = cardRefs.current[focusId];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }, [activeWorkout.focusedExerciseId]);

  const toggleExpanded = (exId: string) => {
    setExpandedIds((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`${activeWorkout.gym} • ${completedSetsCount}/${totalSetsCount} Sätze`}
        title="Training"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddExercise}
              className="liquid-pill min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Katalog</span>
            </button>
            {activeWorkout.isWorkoutActive ? (
              <button
                type="button"
                onClick={onFinishWorkout}
                className="btn-accent min-h-[44px] px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Abschließen</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartWorkout}
                className="btn-accent min-h-[44px] px-4 py-2 rounded-full font-semibold text-xs cursor-pointer active:scale-95 transition"
              >
                Starten
              </button>
            )}
          </div>
        }
      />

      {recoveredBannerVisible && (
        <div className="liquid-pill rounded-2xl px-4 py-3 text-xs font-medium flex items-center justify-between">
          <span>Session aus dem Hintergrund wiederhergestellt</span>
          <Check className="w-4 h-4 text-accent" />
        </div>
      )}

      {/* Horizontal Flat Plan Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {plans.map((plan) => {
          const selected = plan.id === activePlan?.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              className={`kora-chip ${
                selected ? 'is-active' : ''
              } shrink-0 rounded-full min-h-[42px] px-4 py-1.5 text-xs cursor-pointer flex items-center gap-2 active:scale-95 transition`}
            >
              {selected && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
              <span>{plan.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full tabular-nums bg-black/[0.06] dark:bg-white/[0.08]">
                {plan.exerciseIds.length}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onAskAiPlanAdapter}
          className="kora-chip shrink-0 rounded-full min-h-[42px] px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
        >
          <KoraLogo className="w-4 h-4" />
          <span>KI-Plan</span>
        </button>
      </div>

      {/* Flat Minimalist 3-Segment Status Switch with Live Counts */}
      <div className="space-y-2">
        <Segmented
          options={[
            { id: 'all', label: `Alle (${planExercises.length})` },
            { id: 'open', label: `Offen (${openExercisesCount})` },
            { id: 'done', label: `Erledigt (${doneExercisesCount})` }
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {statusFilter === 'all' && doneExercisesCount > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStatusFilter('open')}
              className="liquid-pill min-h-[38px] px-3.5 py-1.5 rounded-full text-[11px] font-medium kora-muted hover:text-[var(--kora-text)] flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>{doneExercisesCount} erledigt • ausblenden</span>
            </button>
          </div>
        )}
      </div>

      {/* Exercise Cards (collapsed by default, tap anywhere on card to expand) */}
      <div className="space-y-3">
        {filteredExercises.map((ex) => {
          const isFocused = activeWorkout.focusedExerciseId === ex.id;
          const isExpanded = Boolean(expandedIds[ex.id]);
          const isCollapsed = !isExpanded;
          const doneCount = ex.sets.filter((s) => s.done).length;
          const allDone = isExerciseAllDone(ex);
          const isCompletedCollapsed = allDone && isCollapsed;
          const gymNote = ex.gymSettings[activeWorkout.gym] || Object.values(ex.gymSettings)[0] || '';

          return (
            <div
              key={ex.id}
              ref={(el) => {
                cardRefs.current[ex.id] = el;
              }}
              onClick={() => {
                if (isCollapsed) {
                  onFocusExercise(ex.id);
                  toggleExpanded(ex.id);
                }
              }}
              className={`liquid-glass rounded-[24px] transition-all ${
                isCompletedCollapsed
                  ? 'opacity-45 bg-black/[0.04] dark:bg-white/[0.02] border-transparent py-2.5 px-3.5'
                  : 'p-2.5 min-[380px]:p-3.5 sm:p-4 space-y-3'
              } ${isCollapsed ? 'cursor-pointer' : ''} ${
                isFocused && !allDone ? 'kora-focus-ring' : ''
              }`}
            >
              {/* Header Row */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusExercise(ex.id);
                  toggleExpanded(ex.id);
                }}
                className={`flex ${
                  isCompletedCollapsed ? 'items-center' : 'items-start'
                } justify-between gap-2.5 cursor-pointer`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      isCompletedCollapsed
                        ? 'w-10 h-9 rounded-xl liquid-pill flex items-center justify-center shrink-0 p-1 opacity-40 grayscale'
                        : 'w-15 h-13 rounded-2xl liquid-pill flex items-center justify-center shrink-0 p-1.5'
                    }
                  >
                    <ExerciseIllustration pattern={ex.pattern} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className={
                        isCompletedCollapsed
                          ? 'text-[14px] font-semibold leading-snug tracking-tight line-through decoration-current/40 kora-muted'
                          : 'text-[15px] font-semibold leading-snug tracking-tight'
                      }
                    >
                      {ex.name}
                    </h3>
                    {isCompletedCollapsed ? (
                      <p className="text-[11px] kora-muted mt-0.5 tabular-nums">
                        ✓ Erledigt • {doneCount}/{ex.sets.length} Sätze
                      </p>
                    ) : (
                      <>
                        <p className="text-xs kora-muted mt-0.5 tabular-nums">
                          {ex.category} • {doneCount}/{ex.sets.length} Sätze
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {ex.targetWeight !== undefined && (
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full liquid-pill tabular-nums">
                              Ziel {ex.targetWeight} kg
                            </span>
                          )}
                          {ex.topWeight !== undefined && ex.topWeight !== null && (
                            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full kora-muted liquid-pill tabular-nums">
                              Peak {ex.topWeight} kg
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(ex.id);
                    }}
                    aria-label={isCollapsed ? 'Sätze einblenden' : 'Sätze einklappen'}
                    className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExerciseFromPlan(ex.id);
                    }}
                    aria-label="Aus Plan entfernen"
                    className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center kora-muted hover:text-accent cursor-pointer active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isCollapsed && !allDone && (
                <div className="h-[2px] w-full rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ex.sets.length > 0 ? Math.round((doneCount / ex.sets.length) * 100) : 0
                      }%`
                    }}
                  />
                </div>
              )}

              {!isCollapsed && (
                <>
                  {/* Optional Seat / Gym Note */}
                  <div className="rounded-2xl liquid-pill px-3.5 py-2 text-xs">
                    {editingNoteId === ex.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder={`Sitzeinstellung / Notiz für ${activeWorkout.gym}...`}
                          className="flex-1 bg-transparent focus:outline-none text-xs min-h-[40px]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdatePinNote(ex.id, activeWorkout.gym, noteDraft);
                            setEditingNoteId(null);
                          }}
                          className="btn-accent min-h-[40px] px-3.5 rounded-full font-semibold text-xs cursor-pointer"
                        >
                          Sichern
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate kora-muted flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {gymNote || `Optional: Sitz- & Gerätenotiz (${activeWorkout.gym})`}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(ex.id);
                            setNoteDraft(ex.gymSettings[activeWorkout.gym] || '');
                          }}
                          className="font-semibold flex items-center gap-1 shrink-0 cursor-pointer hover:text-accent transition min-h-[40px] px-2"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Notiz</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ergonomic Set Rows with Hairline Dividers */}
                  <div className="rounded-2xl overflow-hidden divide-y kora-hairline-divider liquid-pill">
                    {ex.sets.map((st, idx) => (
                      <div
                        key={st.id}
                        className={`px-1 min-[380px]:px-2 py-2.5 flex items-center justify-between gap-0 min-[380px]:gap-1 transition ${
                          st.done ? 'opacity-50 bg-black/[0.05] dark:bg-white/[0.03]' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center w-4 min-[380px]:w-5 shrink-0 gap-1">
                          <span className="text-xs font-semibold kora-muted tabular-nums">
                            {idx + 1}
                          </span>
                          {ex.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteSet(ex.id, st.id)}
                              aria-label="Satz löschen"
                              className="kora-muted opacity-45 hover:opacity-100 hover:text-accent cursor-pointer p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Weight Stepper */}
                        <div className="flex items-center gap-0 min-[380px]:gap-0.5 justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSet(ex.id, st.id, 'weight', Math.max(0, st.weight - 2.5))
                            }
                            aria-label="Gewicht verringern"
                            className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform shrink-0"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex flex-col items-center w-9 min-[380px]:w-10">
                            <input
                              type="number"
                              step="0.5"
                              value={st.weight}
                              onChange={(e) =>
                                onUpdateSet(ex.id, st.id, 'weight', Number(e.target.value) || 0)
                              }
                              className="w-9 min-[380px]:w-10 text-center bg-transparent font-mono text-[13px] font-bold tabular-nums focus:outline-none leading-tight [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[9px] kora-muted leading-none">kg</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateSet(ex.id, st.id, 'weight', st.weight + 2.5)}
                            aria-label="Gewicht erhöhen"
                            className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Reps Stepper */}
                        <div className="flex items-center gap-0 min-[380px]:gap-0.5 justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSet(ex.id, st.id, 'reps', Math.max(1, st.reps - 1))
                            }
                            aria-label="Wiederholungen verringern"
                            className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform shrink-0"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex flex-col items-center w-6 min-[380px]:w-7">
                            <input
                              type="number"
                              value={st.reps}
                              onChange={(e) =>
                                onUpdateSet(ex.id, st.id, 'reps', Number(e.target.value) || 0)
                              }
                              className="w-6 min-[380px]:w-7 text-center bg-transparent font-mono text-[13px] font-bold tabular-nums focus:outline-none leading-tight [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[9px] kora-muted leading-none">Wdh</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateSet(ex.id, st.id, 'reps', st.reps + 1)}
                            aria-label="Wiederholungen erhöhen"
                            className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Complete Set Check Button */}
                        <button
                          type="button"
                          onClick={() => onToggleSetDone(ex.id, st.id)}
                          aria-label={st.done ? 'Satz als offen markieren' : 'Satz abschließen'}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 active:scale-90 ${
                            st.done ? 'btn-accent' : 'liquid-pill kora-muted'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-0.5 text-xs gap-2">
                    <button
                      type="button"
                      onClick={() => onAddSet(ex.id)}
                      className="min-h-[42px] px-3.5 py-2 liquid-pill rounded-full font-semibold flex items-center gap-1.5 cursor-pointer hover:text-accent active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Satz hinzufügen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartRestTimer(ex.defaultRestSeconds)}
                      className="min-h-[42px] px-3.5 py-2 liquid-pill rounded-full kora-muted flex items-center gap-1.5 cursor-pointer tabular-nums active:scale-95 transition"
                    >
                      <Timer className="w-4 h-4" />
                      <span>{ex.defaultRestSeconds}s Pause</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="liquid-glass rounded-[24px] p-8 text-center space-y-3">
            {statusFilter === 'done' ? (
              <>
                <p className="text-xs kora-muted leading-relaxed">
                  Noch keine Übung komplett abgeschlossen. Sobald alle Sätze einer Übung abgehakt sind, erscheint sie hier.
                </p>
                {planExercises.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter('open')}
                    className="liquid-pill min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition"
                  >
                    Zu offenen Übungen
                  </button>
                )}
              </>
            ) : statusFilter === 'open' && planExercises.length > 0 ? (
              <>
                <p className="text-sm font-semibold">
                  Stark! Alle Übungen dieses Plans sind erledigt. 🎉
                </p>
                <button
                  type="button"
                  onClick={onFinishWorkout}
                  className="btn-accent min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Workout abschließen</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-xs kora-muted">Keine Übungen für diesen Filter gefunden.</p>
                <button
                  type="button"
                  onClick={onOpenAddExercise}
                  className="btn-accent min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition"
                >
                  Übung aus Katalog wählen
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
