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
import { ActiveWorkoutState, Exercise, MuscleCategory, WorkoutPlan } from '../types/kora';
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

const CATEGORIES: Array<'Alle' | MuscleCategory> = [
  'Alle',
  'Beine',
  'Rücken',
  'Brust',
  'Schultern',
  'Arme',
  'Core'
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
  const [categoryFilter, setCategoryFilter] = useState<'Alle' | MuscleCategory>('Alle');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activePlan = plans.find((p) => p.id === activeWorkout.activePlanId) ?? plans[0];
  const planExercises = (activePlan?.exerciseIds ?? [])
    .map((id) => exercises.find((e) => e.id === id))
    .filter((e): e is Exercise => Boolean(e));

  const filteredExercises = planExercises.filter((ex) => {
    if (categoryFilter !== 'Alle' && ex.category !== categoryFilter) return false;
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

  return (
    <div className="space-y-4">
      {recoveredBannerVisible && (
        <div className="liquid-pill rounded-2xl px-4 py-2.5 text-xs font-medium flex items-center justify-between">
          <span>Session aus dem Hintergrund wiederhergestellt</span>
          <Check className="w-4 h-4 text-[#fa2d48]" />
        </div>
      )}

      {/* Horizontal Plan Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {plans.map((plan) => {
          const selected = plan.id === activePlan?.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selected ? 'btn-primary' : 'liquid-pill kora-muted hover:opacity-100'
              }`}
            >
              <span>{plan.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                  selected
                    ? 'bg-white/20 dark:bg-black/15'
                    : 'bg-black/[0.06] dark:bg-white/[0.08]'
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
          className="shrink-0 liquid-pill rounded-full px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#fa2d48]" />
          <span>KI-Plan</span>
        </button>
      </div>

      {/* Workout Action & Filter Surface */}
      <div className="liquid-glass rounded-[24px] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] kora-muted truncate">{activePlan?.subtitle}</p>
            <p className="text-[13px] font-semibold mt-0.5 tabular-nums">
              {completedSetsCount} / {totalSetsCount} Sätze • {activeWorkout.gym}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAddExercise}
              className="liquid-pill px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer hover:opacity-85 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Katalog</span>
            </button>
            {activeWorkout.isWorkoutActive ? (
              <button
                type="button"
                onClick={onFinishWorkout}
                className="btn-accent px-3.5 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Abschließen</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartWorkout}
                className="btn-primary px-3.5 py-2 rounded-full font-semibold text-xs cursor-pointer hover:opacity-90 transition"
              >
                Starten
              </button>
            )}
          </div>
        </div>

        {/* Status + Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t kora-hairline-divider">
          {(['all', 'open', 'done'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                statusFilter === st ? 'btn-primary' : 'liquid-pill kora-muted'
              }`}
            >
              {st === 'all' ? 'Alle' : st === 'open' ? 'Offen' : 'Erledigt'}
            </button>
          ))}
          <span className="kora-muted opacity-40 px-1">|</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition ${
                categoryFilter === cat ? 'btn-accent' : 'liquid-pill kora-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3.5">
        {filteredExercises.map((ex) => {
          const isFocused = activeWorkout.focusedExerciseId === ex.id;
          const doneCount = ex.sets.filter((s) => s.done).length;
          const allDone = ex.sets.length > 0 && doneCount === ex.sets.length;
          const gymNote = ex.gymSettings[activeWorkout.gym] || Object.values(ex.gymSettings)[0] || '';

          return (
            <div
              key={ex.id}
              ref={(el) => {
                cardRefs.current[ex.id] = el;
              }}
              className={`liquid-glass rounded-[24px] p-4 space-y-3 transition-all ${
                isFocused ? 'ring-1 ring-[#fa2d48]/45' : ''
              } ${allDone ? 'opacity-75' : ''}`}
            >
              {/* Header Row */}
              <div
                onClick={() => onFocusExercise(ex.id)}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center shrink-0 p-1.5">
                    <ExerciseIllustration pattern={ex.pattern} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug tracking-tight">
                      {ex.name}
                    </h3>
                    <p className="text-[11px] kora-muted mt-0.5 tabular-nums">
                      {ex.category} • {doneCount}/{ex.sets.length} Sätze
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {ex.targetWeight !== undefined && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/[0.09] tabular-nums">
                          Ziel {ex.targetWeight} kg
                        </span>
                      )}
                      {ex.topWeight !== undefined && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full kora-muted bg-black/[0.03] dark:bg-white/[0.05] tabular-nums">
                          Peak {ex.topWeight} kg
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusExercise(isFocused ? '' : ex.id);
                    }}
                    aria-label="Details umschalten"
                    className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    {isFocused ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExerciseFromPlan(ex.id);
                    }}
                    aria-label="Aus Plan entfernen"
                    className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center kora-muted hover:text-[#fa2d48] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Optional Seat / Gym Note */}
              <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] px-3 py-2 text-[11px]">
                {editingNoteId === ex.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder={`Sitzeinstellung / Notiz für ${activeWorkout.gym}...`}
                      className="flex-1 bg-transparent focus:outline-none text-xs"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdatePinNote(ex.id, activeWorkout.gym, noteDraft);
                        setEditingNoteId(null);
                      }}
                      className="btn-primary px-2.5 py-1 rounded-full font-semibold text-[10px] cursor-pointer"
                    >
                      Sichern
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate kora-muted flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3 h-3 shrink-0" />
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
                      className="font-semibold flex items-center gap-1 shrink-0 cursor-pointer hover:text-[#fa2d48] transition"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Notiz</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Clean Borderless Set Rows with Subtle Hairline Dividers */}
              <div className="rounded-2xl overflow-hidden divide-y kora-hairline-divider bg-black/[0.025] dark:bg-white/[0.03]">
                {ex.sets.map((st, idx) => (
                  <div
                    key={st.id}
                    className={`px-3 py-2 flex items-center justify-between gap-1.5 transition ${
                      st.done ? 'bg-black/[0.04] dark:bg-white/[0.06]' : ''
                    }`}
                  >
                    {/* Set Number + Remove */}
                    <div className="flex items-center gap-1 w-8 shrink-0">
                      <span className="text-xs font-semibold kora-muted tabular-nums">
                        {idx + 1}
                      </span>
                      {ex.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteSet(ex.id, st.id)}
                          aria-label="Satz löschen"
                          className="kora-muted opacity-45 hover:opacity-100 hover:text-[#fa2d48] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Weight Stepper */}
                    <div className="flex items-center gap-1 flex-1 justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSet(ex.id, st.id, 'weight', Math.max(0, st.weight - 2.5))
                        }
                        aria-label="Gewicht verringern"
                        className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center active:scale-90 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        value={st.weight}
                        onChange={(e) =>
                          onUpdateSet(ex.id, st.id, 'weight', Number(e.target.value) || 0)
                        }
                        className="w-12 text-center bg-transparent font-mono text-xs font-semibold tabular-nums focus:outline-none"
                      />
                      <span className="text-[10px] kora-muted -ml-1 mr-0.5">kg</span>
                      <button
                        type="button"
                        onClick={() => onUpdateSet(ex.id, st.id, 'weight', st.weight + 2.5)}
                        aria-label="Gewicht erhöhen"
                        className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Reps Stepper */}
                    <div className="flex items-center gap-1 flex-1 justify-center">
                      <button
                        type="button"
                        onClick={() => onUpdateSet(ex.id, st.id, 'reps', Math.max(1, st.reps - 1))}
                        aria-label="Wiederholungen verringern"
                        className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center active:scale-90 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={st.reps}
                        onChange={(e) =>
                          onUpdateSet(ex.id, st.id, 'reps', Number(e.target.value) || 0)
                        }
                        className="w-8 text-center bg-transparent font-mono text-xs font-semibold tabular-nums focus:outline-none"
                      />
                      <span className="text-[10px] kora-muted -ml-1">x</span>
                      <button
                        type="button"
                        onClick={() => onUpdateSet(ex.id, st.id, 'reps', st.reps + 1)}
                        aria-label="Wiederholungen erhöhen"
                        className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Complete Set Check Button */}
                    <button
                      type="button"
                      onClick={() => onToggleSetDone(ex.id, st.id)}
                      aria-label={st.done ? 'Satz als offen markieren' : 'Satz abschließen'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                        st.done ? 'btn-accent' : 'liquid-pill kora-muted hover:opacity-100'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => onAddSet(ex.id)}
                  className="font-semibold flex items-center gap-1 py-1 cursor-pointer hover:text-[#fa2d48] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Satz hinzufügen</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartRestTimer(ex.defaultRestSeconds)}
                  className="kora-muted hover:opacity-100 flex items-center gap-1 py-1 cursor-pointer tabular-nums transition"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{ex.defaultRestSeconds}s Pause</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="liquid-glass rounded-[24px] p-8 text-center space-y-2">
            <p className="text-xs kora-muted">Keine Übungen für diesen Filter gefunden.</p>
            <button
              type="button"
              onClick={onOpenAddExercise}
              className="btn-primary px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
            >
              Übung aus Katalog wählen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
