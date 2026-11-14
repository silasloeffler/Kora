import React, { useState } from 'react';
import {
  Activity,
  Check,
  Database,
  Download,
  KeyRound,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { AppSettings, Exercise, ExercisePattern, MuscleCategory } from '../types/kora';
import { formatSecondsClock } from '../services/timer';
import { ExerciseIllustration } from './ExerciseIllustration';

interface TimerModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onClose: () => void;
  onToggle: () => void;
  onReset: () => void;
  onSelectDuration: (seconds: number) => void;
  onAdjust: (delta: number) => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  remainingSeconds,
  totalSeconds,
  isRunning,
  onClose,
  onToggle,
  onReset,
  onSelectDuration,
  onAdjust
}) => {
  if (!isOpen) return null;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const fraction = totalSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds)) : 0;
  const offset = circumference - fraction * circumference;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-elevated rounded-3xl p-6 w-full max-w-xs text-center space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Timer schließen"
          className="absolute top-4 right-4 liquid-pill w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Wall-Clock Rest Timer</p>
          <p className="text-[11px] opacity-50 mt-0.5">Läuft auch bei YouTube-Wechsel exakt weiter</p>
        </div>

        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" className="opacity-15" fill="none" />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-cyan-400 transition-all duration-300"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold tracking-tight">
              {formatSecondsClock(remainingSeconds)}
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-60 mt-1">
              {remainingSeconds === 0 ? 'Zeit um!' : isRunning ? 'Läuft...' : 'Bereit'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {[60, 75, 90, 120].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => onSelectDuration(sec)}
              className={`py-2 rounded-xl font-semibold transition cursor-pointer ${
                totalSeconds === sec
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                  : 'liquid-pill opacity-80 hover:opacity-100'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjust(-15)}
            className="liquid-pill py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            type="button"
            onClick={() => onAdjust(15)}
            className="liquid-pill py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer"
          >
            +15s
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Zurücksetzen"
            className="liquid-pill py-2.5 px-3 rounded-xl text-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddExerciseModalProps {
  isOpen: boolean;
  activeGym: string;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

const PATTERNS: Array<{ id: ExercisePattern; label: string }> = [
  { id: 'chest_press', label: 'Brustpresse' },
  { id: 'lat_pulldown', label: 'Latzug' },
  { id: 'seated_row', label: 'Rudern' },
  { id: 'leg_press', label: 'Beinpresse' },
  { id: 'leg_extension', label: 'Beinstrecker' },
  { id: 'leg_curl', label: 'Beinbeuger' },
  { id: 'shoulder_press', label: 'Schulter' },
  { id: 'lateral_raise', label: 'Seitheben' },
  { id: 'bicep_curl', label: 'Bizeps' },
  { id: 'tricep_pushdown', label: 'Trizeps' },
  { id: 'back_extension', label: 'Rückenstrecker' },
  { id: 'core_crunch', label: 'Core' }
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  activeGym,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MuscleCategory>('Rücken');
  const [pattern, setPattern] = useState<ExercisePattern>('seated_row');
  const [targetWeight, setTargetWeight] = useState('50');
  const [topWeight, setTopWeight] = useState('');
  const [pinNote, setPinNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const baseWeight = Number(targetWeight.split('-')[0]) || 40;
    const newEx: Exercise = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      category,
      pattern,
      primaryMuscle: category,
      targetWeight: targetWeight.trim() || String(baseWeight),
      topWeight: topWeight ? Number(topWeight) : null,
      gymSettings: pinNote.trim() ? { [activeGym]: pinNote.trim() } : {},
      defaultRestSeconds: 90,
      sets: [
        { id: `s_${Date.now()}_1`, weight: baseWeight, reps: 10, done: false },
        { id: `s_${Date.now()}_2`, weight: baseWeight, reps: 10, done: false },
        { id: `s_${Date.now()}_3`, weight: baseWeight, reps: 10, done: false }
      ]
    };
    onSave(newEx);
    setName('');
    setPinNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="liquid-glass-elevated rounded-3xl p-5 w-full max-w-sm space-y-3.5 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Neue Übung anlegen</h3>
          <button type="button" onClick={onClose} className="liquid-pill w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10">
          <ExerciseIllustration pattern={pattern} className="w-16 h-12 shrink-0" />
          <div className="text-xs opacity-80">
            <p className="font-semibold">S/W Vektor-Vorschau</p>
            <p className="text-[11px] opacity-70">Minimalistische Visualisierung passt sich Dark &amp; Light Mode an.</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block opacity-70 font-semibold mb-1">Übungsname / Gerät</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. TechnoGym Chest Incline"
              className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block opacity-70 font-semibold mb-1">Muskelgruppe</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MuscleCategory)}
                className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none bg-transparent"
              >
                {(['Beine', 'Rücken', 'Brust', 'Schultern', 'Arme', 'Core'] as MuscleCategory[]).map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block opacity-70 font-semibold mb-1">S/W Grafik</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value as ExercisePattern)}
                className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none bg-transparent"
              >
                {PATTERNS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block opacity-70 font-semibold mb-1">Start-Ziel (kg)</label>
              <input
                type="text"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="z. B. 50-60"
                className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="block opacity-70 font-semibold mb-1">Früherer Peak (kg)</label>
              <input
                type="number"
                step="0.5"
                value={topWeight}
                onChange={(e) => setTopWeight(e.target.value)}
                placeholder="z. B. 90"
                className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block opacity-70 font-semibold mb-1">Geräte-Pin für {activeGym}</label>
            <input
              type="text"
              value={pinNote}
              onChange={(e) => setPinNote(e.target.value)}
              placeholder="z. B. Sitz Stufe 4, Brustpolster 2"
              className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl liquid-pill text-xs font-semibold cursor-pointer">
            Abbrechen
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-pointer">
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  hasPersonalLocalSeed: boolean;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onSwitchSeed: (source: 'personal' | 'demo') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  hasPersonalLocalSeed,
  onClose,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onSwitchSeed
}) => {
  const [newGym, setNewGym] = useState('');
  const [apiKeyDraft, setApiKeyDraft] = useState(settings.geminiApiKey);
  const [savedKeyTick, setSavedKeyTick] = useState(false);

  if (!isOpen) return null;

  const handleAddGym = () => {
    const trimmed = newGym.trim();
    if (!trimmed || settings.gyms.includes(trimmed)) return;
    onUpdateSettings({ gyms: [...settings.gyms, trimmed] });
    setNewGym('');
  };

  const handleSaveKey = () => {
    onUpdateSettings({ geminiApiKey: apiKeyDraft.trim() });
    setSavedKeyTick(true);
    setTimeout(() => setSavedKeyTick(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-elevated rounded-3xl p-5 w-full max-w-md space-y-4 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Kora Kern &amp; Daten</h3>
            <p className="text-[11px] opacity-65">Offline-First IndexedDB • Strikte Datenschutz-Trennung</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-pill w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="p-3.5 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              Gemini KI-Coach Key (nur lokal gespeichert)
            </span>
            <span className="text-[10px] opacity-60">{settings.geminiModel}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              placeholder="AIza... (optional, sonst lokaler Smart-Coach)"
              className="flex-1 liquid-pill rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              {savedKeyTick ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{savedKeyTick ? 'Gespeichert' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Gyms */}
        <div className="p-3.5 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 space-y-2.5 text-xs">
          <p className="font-bold">Deine Fitnessstudios (pro Studio eigene Pin-Notizen)</p>
          <div className="flex flex-wrap gap-1.5">
            {settings.gyms.map((g) => (
              <span key={g} className="liquid-pill px-2.5 py-1 rounded-full text-[11px] font-medium">
                {g}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGym}
              onChange={(e) => setNewGym(e.target.value)}
              placeholder="Neues Studio hinzufügen..."
              className="flex-1 liquid-pill rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddGym}
              className="liquid-pill px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Health Connect & Profile Switch */}
        <div className="p-3.5 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Google Health Connect Bridge
            </span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ healthConnectConnected: !settings.healthConnectConnected })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                settings.healthConnectConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'liquid-pill'
              }`}
            >
              {settings.healthConnectConnected ? 'Aktiv' : 'Pausiert'}
            </button>
          </div>
          <p className="text-[11px] opacity-65 leading-relaxed">
            In der Capacitor Android APK verbindet sich Kora direkt mit Android Health Connect (Schlaf, HRV, Ruhepuls, Schritte). Im Browser steht dir die adaptive Live-Telemetrie zur Verfügung.
          </p>
        </div>

        {/* Backup & Seed Management */}
        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={onExportBackup}
            className="w-full liquid-pill py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Vollständiges JSON-Backup exportieren</span>
          </button>

          <label className="w-full liquid-pill py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>JSON-Backup wiederherstellen</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportBackup(file);
              }}
            />
          </label>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {hasPersonalLocalSeed && (
              <button
                type="button"
                onClick={() => onSwitchSeed('personal')}
                className="py-2 px-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Silas Seed laden</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSwitchSeed('demo')}
              className={`py-2 px-3 rounded-xl liquid-pill font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                hasPersonalLocalSeed ? '' : 'col-span-2'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Portfolio Demo laden</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
