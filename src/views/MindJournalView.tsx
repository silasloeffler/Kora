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
      mood,
      energy,
      stress,
      sleepQuality,
      tags: selectedTags,
      note: note.trim() || 'Tages-Check-in ohne Zusatznotiz.'
    });
    setNote('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    icon: React.ReactNode
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </span>
        <span className="font-mono font-semibold tabular-nums">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );

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
          {renderSlider(
            'Stimmung',
            mood,
            setMood,
            <Heart className="w-3.5 h-3.5 text-accent" />
          )}
          {renderSlider(
            'Energie',
            energy,
            setEnergy,
            <Zap className="w-3.5 h-3.5 kora-muted" />
          )}
          {renderSlider(
            'Stress',
            stress,
            setStress,
            <Brain className="w-3.5 h-3.5 kora-muted" />
          )}
          {renderSlider(
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
            <article key={entry.id} className="liquid-glass rounded-[24px] p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold">{entry.dateKey}</span>
                <div className="flex items-center gap-2 text-[11px] font-mono kora-muted tabular-nums">
                  <span>Mood {entry.mood}/10</span>
                  <span>•</span>
                  <span>Energie {entry.energy}/10</span>
                  <span>•</span>
                  <span>Stress {entry.stress}/10</span>
                </div>
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
