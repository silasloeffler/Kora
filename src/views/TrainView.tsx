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
  Sparkles,
  Timer,
  Trash2
} from 'lucide-react';
import { ActiveWorkoutState, Exercise, WorkoutPlan } from '../types/kora';
import { ExerciseIllustration } from '../components/ExerciseIllustration';

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

const STATUS_FILTERS: Array<{ id: 'all' | 'open' | 'done'; label: string }> = [
  { id: 'all', label: 'Alle' },
  { id: 'open', label: 'Offen' },
  { id: 'done', label: 'Erledigt' }
];

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

  const activePlan = plans.find((p) => p.id === activeWorkout.activePlanId) ?? plans[0];
  const planExercises = (activePlan?.exerciseIds ?? [])
    .map((id) => exercises.find((e) => e.id === id))
    .filter((e): e is Exercise => Boolean(e));

  const filteredExercises = planExercises.filter((ex) => {
    const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
    if (statusFilter === 'open' && allDone) return false;
    if (statusFilter === 'done' && !allDone) return false;
    return true;
  });

  const completedSetsCount = planExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  );
  const totalSetsCount = planExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const statusIndex = Math.max(
    0,
    STATUS_FILTERS.findIndex((s) => s.id === statusFilter)
  );

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
              className={`shrink-0 rounded-full min-h-[40px] px-4 py-2 text-xs transition cursor-pointer flex items-center gap-2 ${
                selected
                  ? 'bg-black/[0.08] dark:bg-white/[0.12] text-[var(--kora-text)] border border-black/15 dark:border-white/20 font-semibold'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] kora-muted border border-transparent font-medium hover:opacity-100'
              }`}
            >
              {selected && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
              <span>{plan.name}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full tabular-nums ${
                  selected
                    ? 'bg-black/[0.08] dark:bg-white/[0.14]'
                    : 'bg-black/[0.05] dark:bg-white/[0.07]'
                }`}
              >
                {plan.exerciseIds.length}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onAskAiPlanAdapter}
          className="shrink-0 bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--kora-hairline)] rounded-full min-h-[40px] px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>KI-Plan</span>
        </button>
      </div>

      {/* Workout Action & Flat 3-Segment Status Switch */}
      <div className="liquid-glass rounded-[24px] p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <p className="text-[11px] kora-muted truncate">{activePlan?.subtitle}</p>
            <p className="text-sm font-semibold mt-0.5 tabular-nums">
              {completedSetsCount} / {totalSetsCount} Sätze • {activeWorkout.gym}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAddExercise}
              className="liquid-pill min-h-[42px] px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Katalog</span>
            </button>
            {activeWorkout.isWorkoutActive ? (
              <button
                type="button"
                onClick={onFinishWorkout}
                className="btn-accent min-h-[42px] px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition"
              >
                <Flag className="w-4 h-4" />
                <span>Abschließen</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartWorkout}
                className="btn-primary min-h-[42px] px-5 py-2 rounded-full font-semibold text-xs cursor-pointer hover:opacity-90 transition"
              >
                Starten
              </button>
            )}
          </div>
        </div>

        {/* Flat Minimalist 3-Segment Status Switch */}
        <div className="relative rounded-full bg-black/[0.035] dark:bg-white/[0.04] border border-[var(--kora-hairline)] p-0.5 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-0.5 bottom-0.5 rounded-full bg-black/[0.08] dark:bg-white/[0.11] border border-black/10 dark:border-white/15 pointer-events-none"
            style={{
              left: `calc(2px + ${statusIndex} * ((100% - 4px) / 3))`,
              width: 'calc((100% - 4px) / 3)',
              transition: 'left 300ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />
          <div className="relative z-10 grid grid-cols-3">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`min-h-[36px] rounded-full text-xs cursor-pointer transition-colors ${
                  statusFilter === st.id
                    ? 'text-[var(--kora-text)] font-semibold'
                    : 'kora-muted font-medium hover:opacity-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Cards (collapsed by default, tap anywhere on card to expand) */}
      <div className="space-y-3.5">
        {filteredExercises.map((ex) => {
          const isFocused = activeWorkout.focusedExerciseId === ex.id;
          const isExpanded = Boolean(expandedIds[ex.id]);
          const isCollapsed = !isExpanded;
          const doneCount = ex.sets.filter((s) => s.done).length;
          const allDone = ex.sets.length > 0 && doneCount === ex.sets.length;
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
              className={`liquid-glass rounded-[24px] p-3.5 sm:p-4 space-y-3 transition-all ${
                isCollapsed
                  ? 'cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  : ''
              } ${isFocused ? 'kora-focus-ring' : ''} ${allDone ? 'opacity-75' : ''}`}
            >
              {/* Header Row (tapping expands collapsed card or collapses open card) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusExercise(ex.id);
                  toggleExpanded(ex.id);
                }}
                className="flex items-start justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center shrink-0 p-1.5">
                    <ExerciseIllustration pattern={ex.pattern} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug tracking-tight">
                      {ex.name}
                    </h3>
                    <p className="text-xs kora-muted mt-0.5 tabular-nums">
                      {ex.category} • {doneCount}/{ex.sets.length} Sätze
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {ex.targetWeight !== undefined && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.09] tabular-nums">
                          Ziel {ex.targetWeight} kg
                        </span>
                      )}
                      {ex.topWeight !== undefined && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full kora-muted bg-black/[0.03] dark:bg-white/[0.05] tabular-nums">
                          Peak {ex.topWeight} kg
                        </span>
                      )}
                    </div>
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
                    className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
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
                    className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center kora-muted hover:text-accent cursor-pointer active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isCollapsed && (
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
                  <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-3.5 py-2.5 text-xs">
                    {editingNoteId === ex.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder={`Sitzeinstellung / Notiz für ${activeWorkout.gym}...`}
                          className="flex-1 bg-transparent focus:outline-none text-xs min-h-[36px]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdatePinNote(ex.id, activeWorkout.gym, noteDraft);
                            setEditingNoteId(null);
                          }}
                          className="btn-primary min-h-[36px] px-3.5 rounded-full font-semibold text-xs cursor-pointer"
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
                          className="font-semibold flex items-center gap-1 shrink-0 cursor-pointer hover:text-accent transition min-h-[32px] px-2"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Notiz</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ergonomic 40px-44px Set Rows with Hairline Dividers */}
                  <div className="rounded-2xl overflow-hidden divide-y kora-hairline-divider bg-black/[0.025] dark:bg-white/[0.03]">
                    {ex.sets.map((st, idx) => (
                      <div
                        key={st.id}
                        className={`px-2 py-2.5 flex items-center justify-between gap-1 transition ${
                          st.done ? 'bg-black/[0.04] dark:bg-white/[0.06]' : ''
                        }`}
                      >
                        {/* Set Number + optional Delete */}
                        <div className="flex flex-col items-center justify-center w-5 shrink-0 gap-1">
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

                        {/* Weight Stepper (40px hit targets) */}
                        <div className="flex items-center gap-0.5 justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSet(ex.id, st.id, 'weight', Math.max(0, st.weight - 2.5))
                            }
                            aria-label="Gewicht verringern"
                            className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex flex-col items-center w-11">
                            <input
                              type="number"
                              step="0.5"
                              value={st.weight}
                              onChange={(e) =>
                                onUpdateSet(ex.id, st.id, 'weight', Number(e.target.value) || 0)
                              }
                              className="w-11 text-center bg-transparent font-mono text-[13px] font-bold tabular-nums focus:outline-none leading-tight"
                            />
                            <span className="text-[9px] kora-muted leading-none">kg</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateSet(ex.id, st.id, 'weight', st.weight + 2.5)}
                            aria-label="Gewicht erhöhen"
                            className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Reps Stepper (40px hit targets) */}
                        <div className="flex items-center gap-0.5 justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSet(ex.id, st.id, 'reps', Math.max(1, st.reps - 1))
                            }
                            aria-label="Wiederholungen verringern"
                            className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex flex-col items-center w-8">
                            <input
                              type="number"
                              value={st.reps}
                              onChange={(e) =>
                                onUpdateSet(ex.id, st.id, 'reps', Number(e.target.value) || 0)
                              }
                              className="w-8 text-center bg-transparent font-mono text-[13px] font-bold tabular-nums focus:outline-none leading-tight"
                            />
                            <span className="text-[9px] kora-muted leading-none">Wdh</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onUpdateSet(ex.id, st.id, 'reps', st.reps + 1)}
                            aria-label="Wiederholungen erhöhen"
                            className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center active:scale-90 cursor-pointer transition-transform"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Complete Set Check Button (44px ergonomic hit target) */}
                        <button
                          type="button"
                          onClick={() => onToggleSetDone(ex.id, st.id)}
                          aria-label={st.done ? 'Satz als offen markieren' : 'Satz abschließen'}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 active:scale-90 ${
                            st.done ? 'btn-accent' : 'liquid-pill kora-muted hover:opacity-100'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => onAddSet(ex.id)}
                      className="min-h-[38px] px-2 font-semibold flex items-center gap-1.5 cursor-pointer hover:text-accent transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Satz hinzufügen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartRestTimer(ex.defaultRestSeconds)}
                      className="min-h-[38px] px-2 kora-muted hover:opacity-100 flex items-center gap-1.5 cursor-pointer tabular-nums transition"
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
            <p className="text-xs kora-muted">Keine Übungen für diesen Filter gefunden.</p>
            <button
              type="button"
              onClick={onOpenAddExercise}
              className="btn-primary min-h-[44px] px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer"
            >
              Übung aus Katalog wählen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
