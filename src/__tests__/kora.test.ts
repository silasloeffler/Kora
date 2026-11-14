import { describe, expect, it } from 'vitest';
import {
  adjustWallClockTimer,
  computeRemainingSeconds,
  formatSecondsClock,
  startWallClockTimer
} from '../services/timer';
import { mergeActiveWorkoutRecovery } from '../services/storage';
import { computeReadinessScore } from '../services/healthConnect';
import { extractSuggestedPlan, isCronScheduleDueToday } from '../services/aiCoach';
import { DEMO_SEED } from '../data/demoSeed';
import { createExerciseFromCatalogItem, EXERCISE_CATALOG } from '../data/exerciseCatalog';
import { isForbiddenPath } from '../../scripts/privacy-check.mjs';

describe('Wall-Clock Rest Timer (Background-safe across YouTube switches)', () => {
  it('computes exact remaining seconds from targetEndTime timestamp', () => {
    const startNow = 1_700_000_000_000;
    const timer = startWallClockTimer(90, startNow);
    expect(timer.restTimerTargetEndTime).toBe(startNow + 90_000);

    // User switches to YouTube for 42 seconds, app gets killed & reopened:
    const after42s = startNow + 42_000;
    expect(computeRemainingSeconds(timer.restTimerTargetEndTime, null, 90, after42s)).toBe(48);
    expect(formatSecondsClock(48)).toBe('00:48');

    // Past completion time clamps cleanly at 0
    expect(computeRemainingSeconds(timer.restTimerTargetEndTime, null, 90, startNow + 120_000)).toBe(0);
  });

  it('adjusts running and paused timers cleanly', () => {
    const now = 1_700_000_000_000;
    const adjusted = adjustWallClockTimer(now + 30_000, null, 90, 15, now);
    expect(adjusted.restTimerTargetEndTime).toBe(now + 45_000);
    expect(adjusted.restTimerTotalSeconds).toBe(90);

    const pausedAdj = adjustWallClockTimer(null, 20, 90, -15, now);
    expect(pausedAdj.restTimerPausedRemaining).toBe(5);
  });
});

describe('0-Click Instant Workout Recovery', () => {
  it('prefers the newer synchronous recovery pointer after OS process kill', () => {
    const dbState = {
      ...DEMO_SEED.activeWorkout,
      isWorkoutActive: false,
      focusedExerciseId: null,
      lastUpdatedAt: 1000
    };
    const syncRecovery = {
      ...DEMO_SEED.activeWorkout,
      isWorkoutActive: true,
      focusedExerciseId: 'demo_lat_pulldown',
      gym: 'Metro Gym',
      lastUpdatedAt: 2500
    };

    const merged = mergeActiveWorkoutRecovery(dbState, syncRecovery);
    expect(merged.isWorkoutActive).toBe(true);
    expect(merged.focusedExerciseId).toBe('demo_lat_pulldown');
    expect(merged.gym).toBe('Metro Gym');
  });
});

describe('Health Connect Readiness & Proactive Cron Engine', () => {
  it('computes higher readiness for solid sleep & HRV and lower readiness under high stress', () => {
    const high = computeReadinessScore({
      sleepHours: 8.1,
      hrvMs: 70,
      restingHrBpm: 53,
      recentMood: 9,
      recentStress: 2
    });
    const low = computeReadinessScore({
      sleepHours: 5.5,
      hrvMs: 38,
      restingHrBpm: 68,
      recentMood: 4,
      recentStress: 9
    });
    expect(high).toBeGreaterThan(low);
    expect(high).toBeLessThanOrEqual(99);
    expect(low).toBeGreaterThanOrEqual(25);
  });

  it('evaluates daily cron check-ins accurately without double firing', () => {
    const cron = {
      id: 'cron_test',
      name: 'Morning Readiness',
      cronExpression: '0 8 * * *',
      timeLabel: '08:00 Täglich',
      category: 'readiness' as const,
      promptTemplate: 'Check',
      enabled: true,
      lastRunAt: null
    };

    const morningBefore = new Date(2026, 10, 14, 7, 45, 0).getTime();
    const morningAfter = new Date(2026, 10, 14, 8, 15, 0).getTime();
    expect(isCronScheduleDueToday(cron, morningBefore)).toBe(false);
    expect(isCronScheduleDueToday(cron, morningAfter)).toBe(true);

    const alreadyRan = { ...cron, lastRunAt: new Date(2026, 10, 14, 8, 5, 0).getTime() };
    expect(isCronScheduleDueToday(alreadyRan, morningAfter)).toBe(false);
  });

  it('extracts 1-click AI suggested workout plans safely using valid exercise IDs', () => {
    const aiReply = [
      'Hier ist dein 45-Min Express-Plan:',
      '```kora-plan',
      '{"name":"Express Core","subtitle":"Schnell","exerciseIds":["demo_leg_press","demo_chest_press","non_existent_id"]}',
      '```'
    ].join('\n');

    const parsed = extractSuggestedPlan(aiReply, DEMO_SEED.exercises);
    expect(parsed.cleanText).toBe('Hier ist dein 45-Min Express-Plan:');
    expect(parsed.suggestedPlan?.name).toBe('Express Core');
    expect(parsed.suggestedPlan?.exerciseIds).toEqual(['demo_leg_press', 'demo_chest_press']);
  });
});

describe('Exercise Catalog (80+ structured exercises)', () => {
  it('provides at least 80 unique exercises across all 6 muscle groups', () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThanOrEqual(80);
    const categories = new Set(EXERCISE_CATALOG.map((c) => c.category));
    expect(categories).toEqual(new Set(['Beine', 'Rücken', 'Brust', 'Schultern', 'Arme', 'Core']));
    const ids = new Set(EXERCISE_CATALOG.map((c) => c.id));
    expect(ids.size).toBe(EXERCISE_CATALOG.length);
  });

  it('materializes an active Exercise with prefilled sets and optional gym note', () => {
    const sample = EXERCISE_CATALOG[0];
    const ex = createExerciseFromCatalogItem(sample, 'Giga Gym Berlin');
    expect(ex.name).toBe(sample.name);
    expect(ex.sets.length).toBe(sample.defaultSets);
    expect(ex.sets.every((s) => !s.done)).toBe(true);
    if (sample.defaultNote) {
      expect(ex.gymSettings['Giga Gym Berlin']).toBe(sample.defaultNote);
    }
  });
});

describe('Privacy Guard (Personal Data Separation)', () => {
  it('blocks personal data screenshots, feedback folders, local seeds, HTML prototypes, Kora.apk, and env files', () => {
    expect(isForbiddenPath('Data/Screenshot_20261114-112845.png')).toBe(true);
    expect(isForbiddenPath('Feedback/Screenshot_20261114-195040.png')).toBe(true);
    expect(isForbiddenPath('Screenshot_20261114-195040.png')).toBe(true);
    expect(isForbiddenPath('personal-data/silas-seed.local.json')).toBe(true);
    expect(isForbiddenPath('public/personal-seed.local.json')).toBe(true);
    expect(isForbiddenPath('technogym_workout_logger.html')).toBe(true);
    expect(isForbiddenPath('Kora.apk')).toBe(true);
    expect(isForbiddenPath('.env.local')).toBe(true);
  });

  it('allows public app source files and .env.example', () => {
    expect(isForbiddenPath('src/App.tsx')).toBe(false);
    expect(isForbiddenPath('src/data/demoSeed.ts')).toBe(false);
    expect(isForbiddenPath('src/data/exerciseCatalog.ts')).toBe(false);
    expect(isForbiddenPath('.env.example')).toBe(false);
  });
});
