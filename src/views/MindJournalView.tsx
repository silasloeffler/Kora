import React, { useState } from 'react';
import { Brain, Check, Heart, Moon, Sparkles, Zap } from 'lucide-react';
import { JournalEntry } from '../types/kora';

interface MindJournalViewProps {
  entries: JournalEntry[];
  isGeneratingReflection: boolean;
  onSaveEntry: (entry: {
    mood: number;
    energy: number;
    stress: number;
    sleepQuality: number;
    tags: string[];
    note: string;
  }) => void;
}

const PRESET_TAGS = [
  'Fokus',
  'Comeback',
  'Guter Schlaf',
  'Müde',
  'Hoher Stress',
  'Vagus-Ruhe',
  'Schulter schonen',
  'Rest Day',
  'Motivation'
];

export const MindJournalView: React.FC<MindJournalViewProps> = ({
  entries,
  isGeneratingReflection,
  onSaveEntry
}) => {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(4);
  const [sleepQuality, setSleepQuality] = useState(8);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fokus']);
  const [note, setNote] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() && selectedTags.length === 0) return;
    onSaveEntry({
      mood: Math.round(mood),
      energy: Math.round(energy),
      stress: Math.round(stress),
      sleepQuality: Math.round(sleepQuality),
      tags: selectedTags,
      note: note.trim() || 'Tages-Check-in ohne Zusatznotiz.'
    });
    setNote('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const renderLiquidBar = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    icon: React.ReactNode
  ) => {
    const pct = Math.min(100, Math.max(8, ((value - 1) / 9) * 100));
    const displayValue = Math.round(value);
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-medium flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
          </span>
          <span className="font-mono font-semibold tabular-nums">{displayValue}/10</span>
        </div>
        <div className="h-9 rounded-2xl kora-liquid-bar-track p-1 flex items-center select-none">
          <div
            className="kora-liquid-bar-fill h-full rounded-xl relative flex items-center justify-end pr-1"
            style={{ width: `${pct}%` }}
          >
            <span className="w-5 h-5 rounded-lg bg-white/85 dark:bg-white/90 shadow-sm pointer-events-none shrink-0" />
          </div>
          <input
            type="range"
            aria-label={label}
            min={1}
            max={10}
            step={0.05}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="px-1">
        <p className="text-xs font-medium kora-muted">Mental Health &amp; Nervensystem</p>
        <h2 className="text-[26px] leading-tight font-bold tracking-tight mt-0.5">
          Tagebuch
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass rounded-[24px] p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderLiquidBar(
            'Stimmung',
            mood,
            setMood,
            <Heart className="w-3.5 h-3.5 text-accent" />
          )}
          {renderLiquidBar(
            'Energie',
            energy,
            setEnergy,
            <Zap className="w-3.5 h-3.5 kora-muted" />
          )}
          {renderLiquidBar(
            'Stress',
            stress,
            setStress,
            <Brain className="w-3.5 h-3.5 kora-muted" />
          )}
          {renderLiquidBar(
            'Schlafqualität',
            sleepQuality,
            setSleepQuality,
            <Moon className="w-3.5 h-3.5 kora-muted" />
          )}
        </div>

        <div className="space-y-2 pt-1 border-t kora-hairline-divider">
          <p className="text-xs font-medium kora-muted">Kontext &amp; Körpergefühl</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    active ? 'btn-primary' : 'liquid-pill kora-muted hover:opacity-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="mind-note" className="block text-xs font-medium kora-muted">
            Gedanken, Regeneration &amp; körperliche Signale
          </label>
          <textarea
            id="mind-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Wie fühlst du dich heute körperlich & mental? Gibt es Schwachstellen, Muskelkater oder Stressfaktoren?"
            className="w-full rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border kora-hairline-divider p-3 text-xs leading-relaxed focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isGeneratingReflection}
          className="btn-primary w-full min-h-[46px] py-3.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 transition"
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4 text-accent" />
              <span>Gespeichert &amp; Reflexion aktualisiert</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-accent" />
              <span>
                {isGeneratingReflection
                  ? 'Kora reflektiert...'
                  : 'Eintrag speichern & KI-Reflexion'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Journal History */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider kora-muted px-1">
          Verlauf ({entries.length})
        </h3>
        {entries
          .slice()
          .reverse()
          .map((entry) => (
            <article key={entry.id} className="liquid-glass rounded-[24px] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold">{entry.dateKey}</span>
                <span className="text-[11px] font-mono kora-muted tabular-nums">
                  Check-in
                </span>
              </div>

              {/* Mini Liquid Glass Metric Bars */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Mood', val: entry.mood },
                  { label: 'Energie', val: entry.energy },
                  { label: 'Stress', val: entry.stress },
                  { label: 'Schlaf', val: entry.sleepQuality }
                ].map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] kora-muted">
                      <span>{m.label}</span>
                      <span className="font-mono tabular-nums">{m.val}</span>
                    </div>
                    <div className="h-2 rounded-full kora-liquid-bar-track overflow-hidden">
                      <div
                        className="h-full rounded-full kora-liquid-bar-fill"
                        style={{ width: `${Math.min(100, Math.max(10, m.val * 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.07] kora-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[13px] leading-relaxed opacity-90">{entry.note}</p>

              {entry.aiReflection && (
                <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-xs leading-relaxed">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Kora Reflexion</span>
                  </p>
                  <p className="opacity-85">{entry.aiReflection}</p>
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
};
