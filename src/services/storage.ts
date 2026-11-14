import Dexie, { type Table } from 'dexie';
import { DEMO_SEED } from '../data/demoSeed';
import { ActiveWorkoutState, KoraSnapshot } from '../types/kora';

const ACTIVE_SESSION_LS_KEY = 'kora_active_workout_v1';
const THEME_LS_KEY = 'kora_theme_v1';
const ACCENT_LS_KEY = 'kora_accent_v1';

interface SnapshotRow {
  id: string;
  snapshot: KoraSnapshot;
  updatedAt: number;
}

class KoraDatabase extends Dexie {
  snapshots!: Table<SnapshotRow, string>;

  constructor() {
    super('KoraWellnessCoreDB');
    this.version(1).stores({
      snapshots: 'id, updatedAt'
    });
  }
}

export const koraDb = new KoraDatabase();

export function cloneSnapshot(snapshot: KoraSnapshot): KoraSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as KoraSnapshot;
}

export function mergeActiveWorkoutRecovery(
  base: ActiveWorkoutState,
  candidate: ActiveWorkoutState | null
): ActiveWorkoutState {
  if (!candidate) return base;
  if (candidate.lastUpdatedAt > base.lastUpdatedAt) {
    return candidate;
  }
  return base;
}

export function readSyncActiveWorkout(): ActiveWorkoutState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveWorkoutState;
    if (typeof parsed.isWorkoutActive !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSyncActiveWorkout(activeWorkout: ActiveWorkoutState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_SESSION_LS_KEY, JSON.stringify(activeWorkout));
  } catch {
    // Ignore storage quota errors in restricted webviews
  }
}

export function readSyncTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  try {
    const t = window.localStorage.getItem(THEME_LS_KEY);
    return t === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function writeSyncTheme(theme: 'dark' | 'light'): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_LS_KEY, theme);
  } catch {
    // Ignore
  }
}

export function writeSyncAccent(accentColor: string): void {
  if (typeof window === 'undefined') return;
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : '#fa2d48';
  try {
    window.localStorage.setItem(ACCENT_LS_KEY, safeColor);
    document.documentElement.style.setProperty('--kora-accent', safeColor);
  } catch {
    // Ignore
  }
}

export async function fetchPersonalSeedIfPresent(): Promise<KoraSnapshot | null> {
  if (typeof fetch === 'undefined') return null;
  try {
    const response = await fetch('/personal-seed.local.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const data = (await response.json()) as Partial<KoraSnapshot>;
    if (!Array.isArray(data.exercises) || !Array.isArray(data.plans)) return null;
    return data as KoraSnapshot;
  } catch {
    return null;
  }
}

function applyEnvDefaults(snapshot: KoraSnapshot): KoraSnapshot {
  const envApiKey =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY
      ? String(import.meta.env.VITE_GEMINI_API_KEY)
      : '';
  if (envApiKey && !snapshot.settings.geminiApiKey) {
    snapshot.settings.geminiApiKey = envApiKey;
  }
  snapshot.settings.accentColor = snapshot.settings.accentColor || '#fa2d48';
  snapshot.settings.logoVariant = snapshot.settings.logoVariant || 'yinyang';
  return snapshot;
}

export async function loadInitialSnapshot(): Promise<{
  snapshot: KoraSnapshot;
  recoveredActiveWorkout: boolean;
}> {
  try {
    const existing = await koraDb.snapshots.get('primary');
    if (existing?.snapshot) {
      const snap = applyEnvDefaults(cloneSnapshot(existing.snapshot));
      const syncActive = readSyncActiveWorkout();
      snap.activeWorkout = mergeActiveWorkoutRecovery(snap.activeWorkout, syncActive);
      writeSyncTheme(snap.settings.theme);
      writeSyncAccent(snap.settings.accentColor);
      return {
        snapshot: snap,
        recoveredActiveWorkout: snap.activeWorkout.isWorkoutActive
      };
    }
  } catch {
    // Fallback to seeding if IndexedDB is blocked
  }

  const personal = await fetchPersonalSeedIfPresent();
  const initial = applyEnvDefaults(cloneSnapshot(personal ?? DEMO_SEED));
  writeSyncTheme(initial.settings.theme);
  writeSyncAccent(initial.settings.accentColor);
  writeSyncActiveWorkout(initial.activeWorkout);

  try {
    await koraDb.snapshots.put({
      id: 'primary',
      snapshot: initial,
      updatedAt: Date.now()
    });
  } catch {
    // Non-fatal
  }

  return {
    snapshot: initial,
    recoveredActiveWorkout: initial.activeWorkout.isWorkoutActive
  };
}

export async function persistSnapshot(snapshot: KoraSnapshot): Promise<void> {
  writeSyncActiveWorkout(snapshot.activeWorkout);
  writeSyncTheme(snapshot.settings.theme);
  writeSyncAccent(snapshot.settings.accentColor);
  try {
    await koraDb.snapshots.put({
      id: 'primary',
      snapshot,
      updatedAt: Date.now()
    });
  } catch {
    // Non-fatal fallback
  }
}

export async function switchSeedProfile(source: 'personal' | 'demo'): Promise<KoraSnapshot> {
  let next: KoraSnapshot;
  if (source === 'personal') {
    const personal = await fetchPersonalSeedIfPresent();
    next = cloneSnapshot(personal ?? DEMO_SEED);
  } else {
    next = cloneSnapshot(DEMO_SEED);
  }
  applyEnvDefaults(next);
  await persistSnapshot(next);
  return next;
}

export function exportSnapshotToJson(snapshot: KoraSnapshot): string {
  const safeCopy = cloneSnapshot(snapshot);
  // Strip API key from exported backup by default for safety
  safeCopy.settings.geminiApiKey = '';
  return JSON.stringify(safeCopy, null, 2);
}

export function parseImportedSnapshot(rawJson: string): KoraSnapshot {
  const parsed = JSON.parse(rawJson) as Partial<KoraSnapshot>;
  if (!Array.isArray(parsed.exercises) || !Array.isArray(parsed.plans)) {
    throw new Error('Ungültige Kora-Backup-Datei: exercises oder plans fehlen.');
  }
  return {
    ...cloneSnapshot(DEMO_SEED),
    ...parsed,
    settings: {
      ...DEMO_SEED.settings,
      ...(parsed.settings ?? {})
    },
    activeWorkout: {
      ...DEMO_SEED.activeWorkout,
      ...(parsed.activeWorkout ?? {})
    }
  } as KoraSnapshot;
}
