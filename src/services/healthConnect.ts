import { HealthConnectDailyMetric, JournalEntry, WorkoutSessionRecord } from '../types/kora';

export interface ReadinessInput {
  sleepHours: number;
  hrvMs: number;
  restingHrBpm: number;
  recentMood?: number;
  recentStress?: number;
}

export function computeReadinessScore(input: ReadinessInput): number {
  const sleepFactor = Math.min(1, Math.max(0, input.sleepHours / 8.0)) * 35;
  const hrvFactor = Math.min(1, Math.max(0, (input.hrvMs - 30) / 50)) * 35;
  const rhrFactor = Math.min(1, Math.max(0, (75 - input.restingHrBpm) / 25)) * 15;
  const moodBonus = ((input.recentMood ?? 7) / 10) * 10;
  const stressPenalty = ((input.recentStress ?? 4) / 10) * 8;

  const raw = Math.round(sleepFactor + hrvFactor + rhrFactor + moodBonus + (8 - stressPenalty));
  return Math.max(25, Math.min(99, raw));
}

interface NativeHealthConnectBridge {
  readDailySummary?: () => Promise<Partial<HealthConnectDailyMetric> | null>;
}

function getNativeHealthConnectBridge(): NativeHealthConnectBridge | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor;
  const plugin = cap?.Plugins?.HealthConnect as NativeHealthConnectBridge | undefined;
  return plugin ?? null;
}

export function isHealthConnectBridgeNative(): boolean {
  return getNativeHealthConnectBridge() !== null;
}

export async function syncHealthConnectTelemetry(
  existing: HealthConnectDailyMetric[],
  journal: JournalEntry[],
  history: WorkoutSessionRecord[]
): Promise<{
  metrics: HealthConnectDailyMetric[];
  latest: HealthConnectDailyMetric;
  mode: 'native_bridge' | 'adaptive_sync';
}> {
  const todayKey = new Date().toISOString().slice(0, 10);
  const latestJournal = journal.slice(-1)[0];
  const latestWorkout = history.slice(-1)[0];
  const trainedYesterday =
    latestWorkout && Date.now() - latestWorkout.completedAt < 36 * 3600_000;

  const nativeBridge = getNativeHealthConnectBridge();
  if (nativeBridge?.readDailySummary) {
    try {
      const nativeData = await nativeBridge.readDailySummary();
      if (nativeData) {
        const sleepHours = Number(nativeData.sleepHours ?? 7.5);
        const hrvMs = Number(nativeData.hrvMs ?? 60);
        const restingHrBpm = Number(nativeData.restingHrBpm ?? 56);
        const metric: HealthConnectDailyMetric = {
          dateKey: todayKey,
          sleepHours,
          sleepScore: Number(nativeData.sleepScore ?? Math.min(98, Math.round((sleepHours / 8) * 90))),
          hrvMs,
          restingHrBpm,
          steps: Number(nativeData.steps ?? 6500),
          activeCalories: Number(nativeData.activeCalories ?? 350),
          readinessScore:
            nativeData.readinessScore ??
            computeReadinessScore({
              sleepHours,
              hrvMs,
              restingHrBpm,
              recentMood: latestJournal?.mood,
              recentStress: latestJournal?.stress
            }),
          source: 'health_connect_bridge',
          syncedAt: Date.now()
        };
        const filtered = existing.filter((m) => m.dateKey !== todayKey);
        const metrics = [...filtered, metric].slice(-14);
        return { metrics, latest: metric, mode: 'native_bridge' };
      }
    } catch {
      // Fallback to adaptive sync if native plugin throws
    }
  }

  const prev = existing.find((m) => m.dateKey === todayKey) ?? existing.slice(-1)[0];
  const baseSleep = prev?.sleepHours ?? 7.6;
  const baseHrv = prev?.hrvMs ?? 61;
  const baseRhr = prev?.restingHrBpm ?? 56;
  const baseSteps = prev?.steps ?? 5800;

  const sleepHours = Number(
    Math.max(5.8, Math.min(8.8, baseSleep + (trainedYesterday ? 0.15 : 0.05))).toFixed(1)
  );
  const hrvMs = Math.round(Math.max(42, Math.min(78, baseHrv + (trainedYesterday ? -1 : 2))));
  const restingHrBpm = Math.round(Math.max(50, Math.min(68, baseRhr)));
  const steps = Math.min(18000, baseSteps + 640);
  const activeCalories = Math.round((prev?.activeCalories ?? 300) + 45);
  const sleepScore = Math.min(98, Math.round((sleepHours / 8.2) * 92));
  const readinessScore = computeReadinessScore({
    sleepHours,
    hrvMs,
    restingHrBpm,
    recentMood: latestJournal?.mood,
    recentStress: latestJournal?.stress
  });

  const updated: HealthConnectDailyMetric = {
    dateKey: todayKey,
    sleepHours,
    sleepScore,
    hrvMs,
    restingHrBpm,
    steps,
    activeCalories,
    readinessScore,
    source: 'simulated_sync',
    syncedAt: Date.now()
  };

  const withoutToday = existing.filter((m) => m.dateKey !== todayKey);
  const metrics = [...withoutToday, updated].slice(-14);
  return { metrics, latest: updated, mode: 'adaptive_sync' };
}
