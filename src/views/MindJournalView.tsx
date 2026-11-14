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
    icon: React.ReactNode,
    accentClass: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </span>
        <span className={`font-mono font-bold ${accentClass}`}>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400 cursor-pointer"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="px-1">
        <p className="text-xs opacity-60 font-medium">Mental Health &amp; Nervensystem</p>
        <h2 className="text-xl font-bold tracking-tight">Tagebuch &amp; Mind Core</h2>
      </div>

      <form onSubmit={handleSubmit} className="liquid-glass rounded-3xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSlider(
            'Stimmung / Mood',
            mood,
            setMood,
            <Heart className="w-3.5 h-3.5 text-rose-400" />,
            'text-rose-400'
          )}
          {renderSlider(
            'Energie-Level',
            energy,
            setEnergy,
            <Zap className="w-3.5 h-3.5 text-amber-400" />,
            'text-amber-400'
          )}
          {renderSlider(
            'Stress / Belastung',
            stress,
            setStress,
            <Brain className="w-3.5 h-3.5 text-purple-400" />,
            'text-purple-400'
          )}
          {renderSlider(
            'Schlafqualität',
            sleepQuality,
            setSleepQuality,
            <Moon className="w-3.5 h-3.5 text-cyan-400" />,
            'text-cyan-400'
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold opacity-75">Kontext &amp; Körpergefühl</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40'
                      : 'liquid-pill opacity-70 hover:opacity-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="mind-note" className="block text-xs font-semibold opacity-75">
            Reflexion, Gedanken &amp; körperliche Signale
          </label>
          <textarea
            id="mind-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Wie fühlst du dich heute körperlich & mental? Gibt es Schwachstellen, Muskelkater oder Stressfaktoren?"
            className="w-full rounded-2xl bg-black/15 dark:bg-black/25 border border-white/15 p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          />
        </div>

        <button
          type="submit"
          disabled={isGeneratingReflection}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-60"
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Gespeichert &amp; Kora-Impuls aktualisiert</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {isGeneratingReflection ? 'Kora reflektiert...' : 'Eintrag speichern & KI-Reflexion'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Journal History */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 px-1">
          Verlauf ({entries.length})
        </h3>
        {entries
          .slice()
          .reverse()
          .map((entry) => (
            <article key={entry.id} className="liquid-glass rounded-3xl p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold">{entry.dateKey}</span>
                <div className="flex items-center gap-2 text-[11px] font-mono opacity-80">
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
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 opacity-85"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs leading-relaxed opacity-90">{entry.note}</p>

              {entry.aiReflection && (
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 text-xs leading-relaxed">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Kora Reflexion</span>
                  </p>
                  <p className="opacity-90">{entry.aiReflection}</p>
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
};
