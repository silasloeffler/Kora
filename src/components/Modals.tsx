import React, { useState } from 'react';
import {
  Activity,
  Check,
  Database,
  Download,
  KeyRound,
  Moon,
  Palette,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Upload,
  X
} from 'lucide-react';
import { AppSettings, Exercise, ExercisePattern, LogoVariant, MuscleCategory } from '../types/kora';
import { formatSecondsClock } from '../services/timer';
import { ExerciseIllustration } from './ExerciseIllustration';
import { ACCENT_PALETTE, KoraLogo, LOGO_VARIANTS } from './KoraLogo';
import {
  createExerciseFromCatalogItem,
  EXERCISE_CATALOG,
  ExerciseCatalogItem
} from '../data/exerciseCatalog';

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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
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
          <p className="text-[11px] font-semibold uppercase tracking-widest kora-muted">Satzpause</p>
          <p className="text-[11px] kora-muted mt-0.5">Läuft im Hintergrund exakt weiter</p>
        </div>

        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="6" className="opacity-15" fill="none" />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="var(--kora-accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-semibold tracking-tight">
              {formatSecondsClock(remainingSeconds)}
            </span>
            <span className="text-[10px] uppercase tracking-widest kora-muted mt-1">
              {remainingSeconds === 0 ? 'Zeit um' : isRunning ? 'Läuft' : 'Bereit'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {[60, 75, 90, 120].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => onSelectDuration(sec)}
              className={`py-2 rounded-xl font-medium transition cursor-pointer ${
                totalSeconds === sec ? 'btn-primary' : 'liquid-pill kora-muted'
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
            className="liquid-pill min-h-[44px] px-3.5 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex-1 min-h-[44px] rounded-2xl btn-primary font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            type="button"
            onClick={() => onAdjust(15)}
            className="liquid-pill min-h-[44px] px-3.5 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            +15s
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Zurücksetzen"
            className="liquid-pill min-h-[44px] px-3.5 rounded-2xl text-xs cursor-pointer"
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
  existingExerciseNames: string[];
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

const CATALOG_CATEGORIES: Array<'Alle' | MuscleCategory> = [
  'Alle',
  'Brust',
  'Rücken',
  'Beine',
  'Schultern',
  'Arme',
  'Core'
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  activeGym,
  existingExerciseNames,
  onClose,
  onSave
}) => {
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'Alle' | MuscleCategory>('Alle');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Custom form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MuscleCategory>('Rücken');
  const [pattern, setPattern] = useState<ExercisePattern>('seated_row');
  const [targetWeight, setTargetWeight] = useState('50');
  const [topWeight, setTopWeight] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const existingNormalized = new Set(existingExerciseNames.map((n) => n.toLowerCase()));

  const filteredCatalog = EXERCISE_CATALOG.filter((item) => {
    if (catFilter !== 'Alle' && item.category !== catFilter) return false;
    if (!search.trim()) return true;
    return `${item.name} ${item.category} ${item.equipment} ${item.primaryMuscle}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleAddFromCatalog = (item: ExerciseCatalogItem) => {
    const newEx = createExerciseFromCatalogItem(item, activeGym);
    onSave(newEx);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
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
      gymSettings: note.trim() ? { [activeGym]: note.trim() } : {},
      defaultRestSeconds: 90,
      sets: [
        { id: `s_${Date.now()}_1`, weight: baseWeight, reps: 10, done: false },
        { id: `s_${Date.now()}_2`, weight: baseWeight, reps: 10, done: false },
        { id: `s_${Date.now()}_3`, weight: baseWeight, reps: 10, done: false }
      ]
    };
    onSave(newEx);
    setName('');
    setNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="liquid-glass-elevated rounded-3xl p-5 w-full max-w-md space-y-3.5 max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Übung hinzufügen</h3>
            <p className="text-[11px] kora-muted">{EXERCISE_CATALOG.length} Übungen im Katalog</p>
          </div>
          <button type="button" onClick={onClose} className="liquid-pill w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full liquid-pill shrink-0">
          <button
            type="button"
            onClick={() => setMode('catalog')}
            className={`py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
              mode === 'catalog' ? 'btn-primary' : 'kora-muted'
            }`}
          >
            Übungskatalog ({EXERCISE_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
              mode === 'custom' ? 'btn-primary' : 'kora-muted'
            }`}
          >
            Eigene Übung
          </button>
        </div>

        {mode === 'catalog' ? (
          <>
            <div className="liquid-pill rounded-2xl px-3 py-2 flex items-center gap-2 shrink-0">
              <Search className="w-3.5 h-3.5 kora-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Übung, Muskel oder Gerät suchen (z. B. Kabelzug, Ringe)..."
                className="flex-1 bg-transparent text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {CATALOG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatFilter(cat)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer ${
                    catFilter === cat ? 'btn-primary' : 'liquid-pill kora-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto divide-y kora-hairline-divider pr-0.5">
              {filteredCatalog.map((item) => {
                const alreadyInPlan =
                  existingNormalized.has(item.name.toLowerCase()) || addedIds[item.id];
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ExerciseIllustration pattern={item.pattern} className="w-11 h-9 shrink-0 opacity-85" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        <p className="text-[11px] kora-muted truncate">
                          {item.category} • {item.equipment} • {item.primaryMuscle}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFromCatalog(item)}
                      className={`shrink-0 min-h-[38px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                        alreadyInPlan ? 'liquid-pill kora-muted' : 'btn-primary'
                      }`}
                    >
                      {alreadyInPlan ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{alreadyInPlan ? 'Im Plan' : 'Plan'}</span>
                    </button>
                  </div>
                );
              })}
              {filteredCatalog.length === 0 && (
                <p className="py-8 text-center text-xs kora-muted">Keine passende Übung gefunden.</p>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmitCustom} className="space-y-3 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 rounded-2xl liquid-pill">
              <ExerciseIllustration pattern={pattern} className="w-16 h-12 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">S/W Vektor-Vorschau</p>
                <p className="text-[11px] kora-muted">Minimalistische Darstellung im Dark &amp; Light Mode.</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block kora-muted font-medium mb-1">Übungsname / Gerät</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z. B. TechnoGym Chest Incline"
                  className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block kora-muted font-medium mb-1">Muskelgruppe</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MuscleCategory)}
                    className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none bg-transparent"
                  >
                    {(['Beine', 'Rücken', 'Brust', 'Schultern', 'Arme', 'Core'] as MuscleCategory[]).map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block kora-muted font-medium mb-1">S/W Grafik</label>
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value as ExercisePattern)}
                    className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none bg-transparent"
                  >
                    {PATTERNS.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block kora-muted font-medium mb-1">Start-Ziel (kg)</label>
                  <input
                    type="text"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="z. B. 50-60"
                    className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block kora-muted font-medium mb-1">Früherer Peak (kg)</label>
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
                <label className="block kora-muted font-medium mb-1">Sitzeinstellung / Notiz ({activeGym})</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="z. B. Sitz Stufe 4, Brustpolster 2"
                  className="w-full liquid-pill rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl liquid-pill text-xs font-semibold cursor-pointer">
                Abbrechen
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl btn-primary font-semibold text-xs cursor-pointer">
                Speichern
              </button>
            </div>
          </form>
        )}
      </div>
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-elevated rounded-3xl p-5 w-full max-w-md space-y-4 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Kora Design &amp; Daten</h3>
            <p className="text-[11px] kora-muted">Look, Akzentfarbe, Logo &amp; Offline-Speicher</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme + Custom Contrast / Accent Color + Logo Picker */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-4 text-xs">
          {/* Dark / Light Switch */}
          <div className="space-y-1.5">
            <span className="font-semibold block">Modus</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-black/[0.06] dark:bg-white/[0.06]">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`min-h-[38px] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  settings.theme === 'dark' ? 'btn-primary' : 'kora-muted'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark OLED</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`min-h-[38px] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  settings.theme === 'light' ? 'btn-primary' : 'kora-muted'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light Glass</span>
              </button>
            </div>
          </div>

          {/* Contrast / Accent Color Palette */}
          <div className="space-y-2 pt-2 border-t kora-hairline-divider">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-accent" />
                <span>Kontrastfarbe</span>
              </span>
              <span className="text-[11px] font-mono kora-muted uppercase">
                {settings.accentColor}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              {ACCENT_PALETTE.map((preset) => {
                const selected =
                  settings.accentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onUpdateSettings({ accentColor: preset.hex })}
                    aria-label={preset.label}
                    title={preset.label}
                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                      selected
                        ? 'ring-2 ring-offset-2 ring-offset-transparent ring-current scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {selected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}

              <label
                title="Eigene Farbe frei wählen"
                className="w-9 h-9 rounded-full liquid-pill flex items-center justify-center cursor-pointer hover:scale-105 transition overflow-hidden relative"
              >
                <input
                  type="color"
                  aria-label="Freie Akzentfarbe wählen"
                  value={settings.accentColor}
                  onChange={(e) => onUpdateSettings({ accentColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Plus className="w-4 h-4" />
              </label>
            </div>
          </div>

          {/* 4 Core Dot Logo Concepts */}
          <div className="space-y-2 pt-2 border-t kora-hairline-divider">
            <span className="font-semibold block">Kora Core-Logo (4 Entwürfe)</span>
            <div className="grid grid-cols-2 gap-2">
              {LOGO_VARIANTS.map((v) => {
                const active = settings.logoVariant === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onUpdateSettings({ logoVariant: v.id as LogoVariant })}
                    className={`p-3 rounded-2xl text-left flex flex-col gap-2 cursor-pointer transition ${
                      active
                        ? 'bg-black/[0.08] dark:bg-white/[0.11] kora-focus-ring'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <KoraLogo variant={v.id} className="w-9 h-9" />
                      {active && (
                        <span className="w-5 h-5 rounded-full btn-accent flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-tight">{v.name}</p>
                      <p className="text-[10px] kora-muted leading-snug mt-0.5">{v.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gemini API Key Section */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Gemini KI-Coach Key (nur lokal)
            </span>
            <span className="text-[10px] kora-muted">{settings.geminiModel}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              placeholder="AIza... (optional)"
              className="flex-1 liquid-pill rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="px-3 py-2 rounded-xl btn-primary font-semibold text-xs cursor-pointer flex items-center gap-1"
            >
              {savedKeyTick ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{savedKeyTick ? 'Gespeichert' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Gyms */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2.5 text-xs">
          <p className="font-semibold">Studios</p>
          <div className="flex flex-wrap gap-1.5">
            {settings.gyms.map((g) => (
              <span key={g} className="liquid-pill px-2.5 py-1 rounded-full text-[11px]">
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
              className="liquid-pill px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Health Connect */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-accent" />
              Google Health Connect Bridge
            </span>
            <button
              type="button"
              onClick={() => onUpdateSettings({ healthConnectConnected: !settings.healthConnectConnected })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                settings.healthConnectConnected ? 'btn-primary' : 'liquid-pill'
              }`}
            >
              {settings.healthConnectConnected ? 'Aktiv' : 'Pausiert'}
            </button>
          </div>
          <p className="text-[11px] kora-muted leading-relaxed">
            Bereit für native Android Health Connect Sync (Schlaf, HRV, Ruhepuls, Schritte) und adaptive Web-Telemetrie.
          </p>
        </div>

        {/* Backup & Seed Management */}
        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={onExportBackup}
            className="w-full liquid-pill py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Vollständiges JSON-Backup exportieren</span>
          </button>

          <label className="w-full liquid-pill py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
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
                className="py-2 px-3 rounded-xl btn-primary font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
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
