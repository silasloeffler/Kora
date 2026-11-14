export function computeRemainingSeconds(
  targetEndTime: number | null,
  pausedRemaining: number | null,
  defaultSeconds: number,
  now: number = Date.now()
): number {
  if (targetEndTime !== null) {
    return Math.max(0, Math.ceil((targetEndTime - now) / 1000));
  }
  if (pausedRemaining !== null) {
    return Math.max(0, Math.round(pausedRemaining));
  }
  return Math.max(0, Math.round(defaultSeconds));
}

export function startWallClockTimer(
  durationSeconds: number,
  now: number = Date.now()
): {
  restTimerTargetEndTime: number;
  restTimerTotalSeconds: number;
  restTimerPausedRemaining: null;
} {
  const safeDuration = Math.max(5, Math.round(durationSeconds));
  return {
    restTimerTargetEndTime: now + safeDuration * 1000,
    restTimerTotalSeconds: safeDuration,
    restTimerPausedRemaining: null
  };
}

export function adjustWallClockTimer(
  targetEndTime: number | null,
  pausedRemaining: number | null,
  totalSeconds: number,
  deltaSeconds: number,
  now: number = Date.now()
): {
  restTimerTargetEndTime: number | null;
  restTimerTotalSeconds: number;
  restTimerPausedRemaining: number | null;
} {
  if (targetEndTime !== null) {
    const currentRem = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
    const nextRem = Math.max(5, currentRem + deltaSeconds);
    return {
      restTimerTargetEndTime: now + nextRem * 1000,
      restTimerTotalSeconds: Math.max(totalSeconds, nextRem),
      restTimerPausedRemaining: null
    };
  }
  const baseRem = pausedRemaining ?? totalSeconds;
  const nextRem = Math.max(5, baseRem + deltaSeconds);
  return {
    restTimerTargetEndTime: null,
    restTimerTotalSeconds: Math.max(totalSeconds, nextRem),
    restTimerPausedRemaining: nextRem
  };
}

export function formatSecondsClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatElapsedMinutes(startedAt: number | null, now: number = Date.now()): string {
  if (!startedAt) return '0 Min';
  const mins = Math.max(0, Math.floor((now - startedAt) / 60_000));
  if (mins < 60) return `${mins} Min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${h}h ${rem}m`;
}
