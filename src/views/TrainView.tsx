import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Timer,
  Trash2,
  Wrench
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
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [pinDraft, setPinDraft] = useState('');
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

  // 0-Click Recovery Auto-Scroll to last focused exercise
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
    <div className="space-y-3.5">
      {recoveredBannerVisible && (
        <div className="liquid-pill rounded-2xl px-3.5 py-2 text-xs font-semibold text-emerald-400 flex items-center justify-between border-emerald-400/30">
          <span>Session nahtlos aus Hintergrund wiederhergestellt</span>
          <Check className="w-4 h-4" />
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
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selected
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'liquid-pill opacity-80 hover:opacity-100'
              }`}
            >
              <span>{plan.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selected ? 'bg-slate-950/15 text-slate-950' : 'bg-white/10 opacity-75'
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
          className="shrink-0 liquid-pill rounded-full px-3 py-2 text-xs font-semibold text-cyan-400 flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>KI-Plan</span>
        </button>
      </div>

      {/* Workout Action & Progress Bar */}
      <div className="liquid-glass rounded-3xl p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] opacity-60 truncate">{activePlan?.subtitle}</p>
            <p className="text-xs font-bold mt-0.5">
              {completedSetsCount} / {totalSetsCount} Sätze • {activeWorkout.gym}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAddExercise}
              className="liquid-pill px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Übung</span>
            </button>
            {activeWorkout.isWorkoutActive ? (
              <button
                type="button"
                onClick={onFinishWorkout}
                className="px-3.5 py-2 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Abschließen</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartWorkout}
                className="px-3.5 py-2 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Session starten
              </button>
            )}
          </div>
        </div>

        {/* Status + Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'open', 'done'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-slate-950 dark:bg-white dark:text-slate-950'
                  : 'liquid-pill opacity-70'
              }`}
            >
              {st === 'all' ? 'Alle' : st === 'open' ? 'Offen' : 'Erledigt'}
            </button>
          ))}
          <span className="opacity-30 px-1">|</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer ${
                categoryFilter === cat ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/35' : 'liquid-pill opacity-65'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
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
              className={`liquid-glass rounded-3xl p-4 space-y-3 transition-all ${
                isFocused ? 'ring-1 ring-cyan-400/55' : ''
              } ${allDone ? 'opacity-80' : ''}`}
            >
              {/* Header Row */}
              <div
                onClick={() => onFocusExercise(ex.id)}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-14 rounded-2xl bg-black/10 dark:bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 p-1">
                    <ExerciseIllustration pattern={ex.pattern} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold leading-snug">{ex.name}</h3>
                    </div>
                    <p className="text-[11px] opacity-60 mt-0.5">
                      {ex.category} • {doneCount}/{ex.sets.length} Sätze
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {ex.targetWeight && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-400/25">
                          Ziel: {ex.targetWeight} kg
                        </span>
                      )}
                      {ex.topWeight && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 opacity-75">
                          Peak: {ex.topWeight} kg
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
                    {isFocused ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExerciseFromPlan(ex.id);
                    }}
                    aria-label="Aus Plan entfernen"
                    className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center opacity-60 hover:text-rose-400 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Gym-specific Machine Pin / Seat Note */}
              <div className="rounded-2xl bg-black/10 dark:bg-black/25 border border-white/10 px-3 py-2 text-[11px]">
                {editingPinId === ex.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pinDraft}
                      onChange={(e) => setPinDraft(e.target.value)}
                      placeholder={`Einstellung für ${activeWorkout.gym}...`}
                      className="flex-1 bg-transparent focus:outline-none text-xs"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdatePinNote(ex.id, activeWorkout.gym, pinDraft);
                        setEditingPinId(null);
                      }}
                      className="px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate opacity-80 flex items-center gap-1.5">
                      <Wrench className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{gymNote || `Noch kein Pin für ${activeWorkout.gym}`}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPinId(ex.id);
                        setPinDraft(ex.gymSettings[activeWorkout.gym] || '');
                      }}
                      className="text-amber-400 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Pin</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Set Rows — Always accessible for fast 1-handed logging */}
              <div className="space-y-1.5">
                {ex.sets.map((st, idx) => (
                  <div
                    key={st.id}
                    className={`rounded-2xl px-2.5 py-2 border flex items-center justify-between gap-1.5 transition ${
                      st.done
                        ? 'bg-emerald-500/15 border-emerald-400/30'
                        : 'bg-black/10 dark:bg-white/[0.04] border-white/10'
                    }`}
                  >
                    {/* Set # + delete */}
                    <div className="flex items-center gap-1 w-9 shrink-0">
                      <span className="text-xs font-bold opacity-75">{idx + 1}</span>
                      {ex.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteSet(ex.id, st.id)}
                          aria-label="Satz löschen"
                          className="opacity-35 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Weight Stepper */}
                    <div className="flex items-center gap-1 flex-1 justify-center">
                      <button
                        type="button"
                        onClick={() => onUpdateSet(ex.id, st.id, 'weight', Math.max(0, st.weight - 2.5))}
                        aria-label="Gewicht verringern"
                        className="liquid-pill w-7 h-7 rounded-full flex items-center justify-center active:scale-90 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        value={st.weight}
                        onChange={(e) => onUpdateSet(ex.id, st.id, 'weight', Number(e.target.value) || 0)}
                        className="w-12 text-center bg-transparent font-mono text-xs font-bold focus:outline-none"
                      />
                      <span className="text-[10px] opacity-50 -ml-1 mr-0.5">kg</span>
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
                        onChange={(e) => onUpdateSet(ex.id, st.id, 'reps', Number(e.target.value) || 0)}
                        className="w-8 text-center bg-transparent font-mono text-xs font-bold focus:outline-none"
                      />
                      <span className="text-[10px] opacity-50 -ml-1">x</span>
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
                        st.done
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'liquid-pill opacity-75 hover:opacity-100'
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
                  className="text-cyan-400 font-semibold flex items-center gap-1 py-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Satz hinzufügen</span>
                </button>
                <button
                  type="button"
                  onClick={() => onStartRestTimer(ex.defaultRestSeconds)}
                  className="opacity-70 hover:opacity-100 flex items-center gap-1 py-1 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ex.defaultRestSeconds}s Pause</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="liquid-glass rounded-3xl p-8 text-center text-xs opacity-65">
            Keine Übungen für diesen Filter gefunden.
          </div>
        )}
      </div>
    </div>
  );
};
