import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  Clock,
  Compass,
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
  Sun,
  Upload,
  X
} from 'lucide-react';
import {
  AppSettings,
  CronSchedule,
  Exercise,
  ExercisePattern,
  MuscleCategory
} from '../types/kora';
import { formatSecondsClock } from '../services/timer';
import { ExerciseIllustration } from './ExerciseIllustration';
import {
  ACCENT_PALETTE,
  KoraBadge,
  KoraLogo,
  LOGO_VARIANTS,
  normalizeLogoVariant
} from './KoraLogo';
import { Segmented } from './ui';
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

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const fraction = totalSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds)) : 0;
  const offset = circumference - fraction * circumference;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-elevated kora-sheet rounded-3xl p-6 w-full max-w-xs text-center space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Timer schließen"
          className="absolute top-4 right-4 liquid-pill w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <p className="kora-eyebrow">Satzpause</p>
          <p className="text-[11px] kora-muted mt-0.5">Läuft im Hintergrund exakt weiter</p>
        </div>

        <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="4.5"
              className="opacity-12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="var(--kora-accent)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[42px] font-light tracking-wider tabular-nums leading-none">
              {formatSecondsClock(remainingSeconds)}
            </span>
            <span className="text-[10px] uppercase tracking-widest kora-muted mt-2">
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
              className={`kora-chip ${
                totalSeconds === sec ? 'is-active' : ''
              } min-h-[42px] py-2 rounded-full cursor-pointer active:scale-95 transition`}
            >
              {sec}s
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjust(-15)}
            className="liquid-pill min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex-1 min-h-[44px] rounded-full btn-accent font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            type="button"
            onClick={() => onAdjust(15)}
            className="liquid-pill min-h-[44px] px-3.5 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition"
          >
            +15s
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Zurücksetzen"
            className="liquid-pill w-11 h-11 rounded-full text-xs flex items-center justify-center cursor-pointer active:scale-95 transition shrink-0"
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
        className="liquid-glass-elevated kora-sheet rounded-3xl p-5 w-full max-w-md space-y-3.5 max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Übung hinzufügen</h3>
            <p className="text-[11px] kora-muted">{EXERCISE_CATALOG.length} Übungen im Katalog</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Modal schließen"
            className="liquid-pill w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs (same Segmented component as Train filter) */}
        <Segmented
          className="shrink-0"
          options={[
            { id: 'catalog', label: `Übungskatalog (${EXERCISE_CATALOG.length})` },
            { id: 'custom', label: 'Eigene Übung' }
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === 'catalog' ? (
          <>
            <div className="liquid-pill rounded-full min-h-[44px] px-3.5 py-2 flex items-center gap-2 shrink-0">
              <Search className="w-4 h-4 kora-muted shrink-0" />
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
                  className={`kora-chip ${
                    catFilter === cat ? 'is-active' : ''
                  } shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-full text-[11px] cursor-pointer active:scale-95 transition`}
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
                      <ExerciseIllustration
                        pattern={item.pattern}
                        className="w-11 h-9 shrink-0 opacity-85"
                      />
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
                      className={`shrink-0 min-h-[42px] px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95 transition ${
                        alreadyInPlan ? 'liquid-pill kora-muted' : 'btn-accent'
                      }`}
                    >
                      {alreadyInPlan ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
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
                <p className="text-[11px] kora-muted">
                  Minimalistische Darstellung im Dark &amp; Light Mode.
                </p>
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
                  <div className="relative liquid-pill rounded-xl px-3 h-11 flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-xs font-medium truncate">{category}</span>
                    <ChevronDown className="w-4 h-4 kora-muted shrink-0" />
                    <select
                      aria-label="Muskelgruppe"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MuscleCategory)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      {(
                        ['Beine', 'Rücken', 'Brust', 'Schultern', 'Arme', 'Core'] as MuscleCategory[]
                      ).map((cat) => (
                        <option key={cat} value={cat} className="bg-neutral-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block kora-muted font-medium mb-1">S/W Grafik</label>
                  <div className="relative liquid-pill rounded-xl px-3 h-11 flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-xs font-medium truncate">
                      {PATTERNS.find((p) => p.id === pattern)?.label ?? pattern}
                    </span>
                    <ChevronDown className="w-4 h-4 kora-muted shrink-0" />
                    <select
                      aria-label="S/W Grafik"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value as ExercisePattern)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      {PATTERNS.map((p) => (
                        <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                <label className="block kora-muted font-medium mb-1">
                  Sitzeinstellung / Notiz ({activeGym})
                </label>
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
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[44px] py-2.5 rounded-full liquid-pill text-xs font-semibold cursor-pointer active:scale-95 transition"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] py-2.5 rounded-full btn-accent font-semibold text-xs cursor-pointer active:scale-95 transition"
              >
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
  cronSchedules: CronSchedule[];
  isSendingCoach?: boolean;
  hasPersonalLocalSeed: boolean;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onToggleCron: (cronId: string) => void;
  onRunCronNow: (cronId: string) => void;
  onAddCron: (schedule: Omit<CronSchedule, 'id' | 'lastRunAt'>) => void;
  onTestNotification: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onSwitchSeed: (source: 'personal' | 'demo') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  cronSchedules,
  isSendingCoach = false,
  hasPersonalLocalSeed,
  onClose,
  onUpdateSettings,
  onToggleCron,
  onRunCronNow,
  onAddCron,
  onTestNotification,
  onExportBackup,
  onImportBackup,
  onSwitchSeed
}) => {
  const [newGym, setNewGym] = useState('');
  const [apiKeyDraft, setApiKeyDraft] = useState(settings.geminiApiKey);
  const [savedKeyTick, setSavedKeyTick] = useState(false);
  const [showNewCron, setShowNewCron] = useState(false);
  const [cronName, setCronName] = useState('');
  const [cronTime, setCronTime] = useState('12:30');
  const [cronPrompt, setCronPrompt] = useState('');

  useEffect(() => {
    setApiKeyDraft(settings.geminiApiKey);
  }, [settings.geminiApiKey, isOpen]);

  if (!isOpen) return null;

  const activeLogoVariant = normalizeLogoVariant(settings.logoVariant);

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

  const handleCreateCron = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cronName.trim() || !cronPrompt.trim()) return;
    const [hh, mm] = cronTime.split(':').map((n) => Number(n) || 0);
    onAddCron({
      name: cronName.trim(),
      cronExpression: `${mm} ${hh} * * *`,
      timeLabel: `${cronTime} Täglich`,
      category: 'readiness',
      promptTemplate: cronPrompt.trim(),
      enabled: true
    });
    setCronName('');
    setCronPrompt('');
    setShowNewCron(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="liquid-glass-elevated kora-sheet rounded-3xl p-5 w-full max-w-md space-y-4 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Kora Design &amp; Daten</h3>
            <p className="text-[11px] kora-muted">Look, Logos, Benachrichtigungen &amp; Coach</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Einstellungen schließen"
            className="liquid-pill w-11 h-11 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme + Custom Contrast / Accent Color + Selectable Logo Variants */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-4 text-xs">
          {/* Dark / Light Switch using Segmented */}
          <div className="space-y-1.5">
            <span className="font-semibold block">Modus</span>
            <Segmented
              options={[
                {
                  id: 'dark',
                  label: (
                    <>
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark OLED</span>
                    </>
                  )
                },
                {
                  id: 'light',
                  label: (
                    <>
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light Glass</span>
                    </>
                  )
                }
              ]}
              value={settings.theme}
              onChange={(t) => onUpdateSettings({ theme: t })}
            />
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

          {/* 2x2 Logo Exploration Picker */}
          <div className="space-y-2 pt-2 border-t kora-hairline-divider">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Kora Logo-Variante</span>
              <span className="text-[10px] kora-muted">Nothing OS Grau-Badge</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LOGO_VARIANTS.map((v) => {
                const selected = activeLogoVariant === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onUpdateSettings({ logoVariant: v.id })}
                    aria-pressed={selected}
                    className={`rounded-2xl p-2.5 text-left flex items-center gap-2.5 cursor-pointer active:scale-98 transition ${
                      selected
                        ? 'kora-chip is-active ring-1 ring-[var(--kora-accent)]/50'
                        : 'liquid-pill hover:opacity-90'
                    }`}
                  >
                    <KoraBadge size="md" variant={v.id} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-tight truncate">{v.name}</p>
                      <p className="text-[10px] kora-muted line-clamp-2 mt-0.5 leading-snug">
                        {v.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Notifications (Outside the App) */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-accent" />
              <span>Push außerhalb der App</span>
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })
              }
              className={`min-h-[40px] px-3.5 rounded-full text-[11px] font-semibold cursor-pointer active:scale-95 transition ${
                settings.notificationsEnabled ? 'kora-chip is-active' : 'liquid-pill kora-muted'
              }`}
            >
              {settings.notificationsEnabled ? 'Aktiv' : 'Aus'}
            </button>
          </div>
          <p className="text-[11px] kora-muted leading-relaxed">
            Benachrichtigt dich am Satzpausen-Ende und bei Coach Check-ins zuverlässig auf dem
            Sperrbildschirm — auch wenn du in YouTube oder Spotify bist.
          </p>
          <button
            type="button"
            onClick={onTestNotification}
            className="w-full min-h-[44px] px-3.5 rounded-full liquid-pill font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition hover:opacity-90"
          >
            <Bell className="w-3.5 h-3.5 text-accent" />
            <span>Test-Push senden</span>
          </button>
        </div>

        {/* Coach Automatisierungen (Cron Schedules moved from CoachView) */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>Coach Automatisierungen</span>
              </span>
              <p className="text-[10px] kora-muted mt-0.5">
                Proaktive Check-ins aus Health Connect &amp; Tagebuch
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewCron((v) => !v)}
              className="kora-chip is-active min-h-[38px] px-3 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cron</span>
            </button>
          </div>

          {showNewCron && (
            <form onSubmit={handleCreateCron} className="space-y-2 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={cronName}
                  onChange={(e) => setCronName(e.target.value)}
                  placeholder="Titel (z. B. Mittagspuls)"
                  className="col-span-2 liquid-pill rounded-xl px-3 min-h-[40px] focus:outline-none"
                />
                <input
                  type="time"
                  value={cronTime}
                  onChange={(e) => setCronTime(e.target.value)}
                  className="liquid-pill rounded-xl px-2.5 min-h-[40px] focus:outline-none"
                />
              </div>
              <input
                type="text"
                required
                value={cronPrompt}
                onChange={(e) => setCronPrompt(e.target.value)}
                placeholder="Prompt für den proaktiven Coach..."
                className="w-full liquid-pill rounded-xl px-3 min-h-[40px] focus:outline-none"
              />
              <button
                type="submit"
                className="btn-accent w-full min-h-[44px] rounded-full font-semibold cursor-pointer active:scale-95 transition"
              >
                Cron-Job aktivieren
              </button>
            </form>
          )}

          <div className="divide-y kora-hairline-divider">
            {cronSchedules.map((job) => (
              <div key={job.id} className="py-2.5 first:pt-1 last:pb-0 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold truncate">{job.name}</span>
                    <span className="text-[10px] font-mono kora-muted px-2 py-0.5 rounded-full liquid-pill shrink-0">
                      {job.timeLabel}
                    </span>
                  </div>
                  <p className="text-[10px] kora-muted truncate mt-0.5">
                    {job.lastSummary || job.promptTemplate}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRunCronNow(job.id)}
                    disabled={isSendingCoach}
                    title="Jetzt proaktiv ausführen"
                    className="liquid-pill min-h-[40px] px-3 rounded-full text-[11px] font-medium flex items-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-45"
                  >
                    <Play className="w-3 h-3 text-accent fill-current" />
                    <span>Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleCron(job.id)}
                    className={`min-h-[40px] px-3 rounded-full text-[11px] font-semibold cursor-pointer active:scale-95 transition ${
                      job.enabled ? 'kora-chip is-active' : 'liquid-pill kora-muted'
                    }`}
                  >
                    {job.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini API Key Section */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Gemini KI-Coach Key (nur lokal)</span>
            </span>
            <span className="text-[10px] kora-muted">{settings.geminiModel}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              placeholder="AIza... (optional)"
              className="flex-1 liquid-pill rounded-full px-3.5 min-h-[44px] text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="min-h-[44px] px-4 rounded-full btn-accent font-semibold text-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition"
            >
              {savedKeyTick ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <KoraLogo mono className="w-3.5 h-3.5" />
              )}
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
              className="flex-1 liquid-pill rounded-full px-3.5 min-h-[44px] text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddGym}
              className="kora-chip is-active min-h-[44px] px-4 rounded-full text-xs cursor-pointer active:scale-95 transition"
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
              <span>Google Health Connect Bridge</span>
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ healthConnectConnected: !settings.healthConnectConnected })
              }
              className={`min-h-[40px] px-3.5 rounded-full text-[11px] font-semibold cursor-pointer active:scale-95 transition ${
                settings.healthConnectConnected ? 'kora-chip is-active' : 'liquid-pill kora-muted'
              }`}
            >
              {settings.healthConnectConnected ? 'Aktiv' : 'Pausiert'}
            </button>
          </div>
          <p className="text-[11px] kora-muted leading-relaxed">
            Bereit für native Android Health Connect Sync (Schlaf, HRV, Ruhepuls, Schritte) und
            adaptive Web-Telemetrie.
          </p>
        </div>

        {/* Backup & Seed Management */}
        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={onExportBackup}
            className="w-full liquid-pill min-h-[44px] py-2.5 px-3 rounded-full font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>Vollständiges JSON-Backup exportieren</span>
          </button>

          <label className="w-full liquid-pill min-h-[44px] py-2.5 px-3 rounded-full font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition">
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
                className="min-h-[44px] py-2.5 px-3 rounded-full kora-chip is-active flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Silas Seed laden</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSwitchSeed('demo')}
              className={`min-h-[44px] py-2.5 px-3 rounded-full liquid-pill font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition ${
                hasPersonalLocalSeed ? '' : 'col-span-2'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Portfolio Demo laden</span>
            </button>
          </div>
        </div>

        {/* Roadmap (Down the Line) */}
        <div className="p-3.5 rounded-2xl liquid-pill space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span>Roadmap (Down the Line)</span>
            </span>
            <span className="text-[10px] kora-muted">ROADMAP.md</span>
          </div>
          <div className="space-y-2 divide-y kora-hairline-divider">
            {[
              {
                title: 'Dynamic Island / Live Capsule für Poco',
                desc: 'Timer & aktiver Satz unter HyperOS / Android'
              },
              {
                title: 'Gewichts-Progression über die Zeit',
                desc: 'Kraft-Kurven, e1RM & Volumen-Verlauf'
              },
              {
                title: 'Dynamischer Workout-Startscreen',
                desc: 'Core-Ansicht passt sich aktivem Training an'
              }
            ].map((item) => (
              <div
                key={item.title}
                className="pt-2 first:pt-0 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="text-[10px] kora-muted truncate">{item.desc}</p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full liquid-pill kora-muted">
                  Geplant
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
