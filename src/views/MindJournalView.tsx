import React, { useState } from 'react';
import { Brain, Check, Heart, Moon, Zap } from 'lucide-react';
import { JournalEntry } from '../types/kora';
import { KoraLogo } from '../components/KoraLogo';
import { PageHeader, RichText } from '../components/ui';

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
          <span className="font-mono font-semibold tabular-nums kora-muted">{displayValue}/10</span>
        </div>
        <div className="h-8 rounded-full kora-liquid-bar-track p-0.5 flex items-center select-none">
          <div
            className="kora-liquid-bar-fill h-full rounded-full"
            style={{ width: `${pct}%` }}
          />
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
    <div className="space-y-4">
      <PageHeader
        eyebrow="Mental Health & Nervensystem"
        title="Tagebuch"
      />

      <form onSubmit={handleSubmit} className="liquid-glass rounded-[24px] p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

        <div className="space-y-2 pt-2 border-t kora-hairline-divider">
          <p className="text-xs font-medium kora-muted">Kontext &amp; Körpergefühl</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`kora-chip ${
                    active ? 'is-active' : ''
                  } min-h-[40px] px-3.5 py-1.5 rounded-full text-xs cursor-pointer active:scale-95 transition`}
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
            className="w-full rounded-2xl liquid-pill p-3 text-xs leading-relaxed focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isGeneratingReflection}
          className="btn-accent w-full min-h-[48px] py-3 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 transition"
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Gespeichert &amp; Reflexion aktualisiert</span>
            </>
          ) : (
            <>
              <KoraLogo mono className="w-4 h-4" />
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
        <h3 className="kora-eyebrow px-1">
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
                    <div className="h-1.5 rounded-full kora-liquid-bar-track overflow-hidden">
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
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full liquid-pill kora-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[13px] leading-relaxed opacity-90">{entry.note}</p>

              {entry.aiReflection && (
                <div className="p-3 rounded-2xl liquid-pill text-xs leading-relaxed">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1 flex items-center gap-1.5">
                    <KoraLogo className="w-3.5 h-3.5" />
                    <span>Kora Reflexion</span>
                  </p>
                  <p className="opacity-85">
                    <RichText text={entry.aiReflection} />
                  </p>
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
};
