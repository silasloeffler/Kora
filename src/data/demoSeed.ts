import { KoraSnapshot } from '../types/kora';

const now = Date.now();
const dayMs = 86_400_000;
const toDateKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);

export const DEMO_SEED: KoraSnapshot = {
  exercises: [
    {
      id: 'demo_leg_press',
      name: 'Leg Press (Machine)',
      category: 'Beine',
      pattern: 'leg_press',
      primaryMuscle: 'Quadrizeps & Gluteus',
      targetWeight: '100-115',
      topWeight: 150,
      topSummary: '3x10 @ 150 kg',
      gymSettings: {
        'Studio North': 'Sitz Pos. 4 • Fußplatte mittig',
        'Metro Gym': 'Sitz Pos. 3 • Rückenlehne flach'
      },
      defaultRestSeconds: 90,
      sets: [
        { id: 'd_lp_1', weight: 100, reps: 10, done: false },
        { id: 'd_lp_2', weight: 105, reps: 10, done: false },
        { id: 'd_lp_3', weight: 110, reps: 8, done: false }
      ]
    },
    {
      id: 'demo_lat_pulldown',
      name: 'Vertical Traction / Latzug',
      category: 'Rücken',
      pattern: 'lat_pulldown',
      primaryMuscle: 'Latissimus & Bizeps',
      targetWeight: '55-65',
      topWeight: 85,
      topSummary: '3x10 @ 85 kg',
      gymSettings: {
        'Studio North': 'Sitzhöhe 4 • Polster fest',
        'Metro Gym': 'Sitzhöhe 5 • weiter Griff'
      },
      defaultRestSeconds: 90,
      sets: [
        { id: 'd_lat_1', weight: 55, reps: 10, done: false },
        { id: 'd_lat_2', weight: 60, reps: 10, done: false },
        { id: 'd_lat_3', weight: 65, reps: 8, done: false }
      ]
    },
    {
      id: 'demo_chest_press',
      name: 'Chest Press',
      category: 'Brust',
      pattern: 'chest_press',
      primaryMuscle: 'Pectoralis Major & Trizeps',
      targetWeight: '45-55',
      topWeight: 75,
      topSummary: '3x10 @ 75 kg',
      gymSettings: {
        'Studio North': 'Sitzhöhe 3 • Griffe Brustmitte',
        'Metro Gym': 'Sitzhöhe 3 • Pin Neutral'
      },
      defaultRestSeconds: 90,
      sets: [
        { id: 'd_cp_1', weight: 45, reps: 10, done: false },
        { id: 'd_cp_2', weight: 50, reps: 10, done: false },
        { id: 'd_cp_3', weight: 50, reps: 8, done: false }
      ]
    },
    {
      id: 'demo_seated_row',
      name: 'Seated Low Row',
      category: 'Rücken',
      pattern: 'seated_row',
      primaryMuscle: 'Mittlerer Rücken & Rhomboiden',
      targetWeight: '50-60',
      topWeight: 80,
      topSummary: '3x10 @ 80 kg',
      gymSettings: {
        'Studio North': 'Brustpolster 2 • Parallelgriff',
        'Metro Gym': 'Brustpolster 3'
      },
      defaultRestSeconds: 90,
      sets: [
        { id: 'd_sr_1', weight: 50, reps: 10, done: false },
        { id: 'd_sr_2', weight: 55, reps: 10, done: false },
        { id: 'd_sr_3', weight: 55, reps: 10, done: false }
      ]
    },
    {
      id: 'demo_shoulder_press',
      name: 'Shoulder Press',
      category: 'Schultern',
      pattern: 'shoulder_press',
      primaryMuscle: 'Vordere & mittlere Schulter',
      targetWeight: '30-35',
      topWeight: 50,
      topSummary: '3x10 @ 50 kg',
      gymSettings: {
        'Studio North': 'Sitz tief • voller Bewegungsradius'
      },
      defaultRestSeconds: 90,
      sets: [
        { id: 'd_sp_1', weight: 30, reps: 10, done: false },
        { id: 'd_sp_2', weight: 35, reps: 10, done: false },
        { id: 'd_sp_3', weight: 35, reps: 8, done: false }
      ]
    },
    {
      id: 'demo_leg_curl',
      name: 'Seated Leg Curl',
      category: 'Beine',
      pattern: 'leg_curl',
      primaryMuscle: 'Beinbeuger (Hamstrings)',
      targetWeight: '45-55',
      topWeight: 75,
      topSummary: '3x12 @ 75 kg',
      gymSettings: {
        'Studio North': 'Rückenlehne 3 • Rolle über Achillessehne'
      },
      defaultRestSeconds: 75,
      sets: [
        { id: 'd_lc_1', weight: 45, reps: 12, done: false },
        { id: 'd_lc_2', weight: 50, reps: 10, done: false }
      ]
    },
    {
      id: 'demo_triceps_cable',
      name: 'Triceps Pushdown (Cable)',
      category: 'Arme',
      pattern: 'tricep_pushdown',
      primaryMuscle: 'Trizeps',
      targetWeight: '25-30',
      topWeight: 40,
      topSummary: '3x12 @ 40 kg',
      gymSettings: {
        'Studio North': 'Seilgriff • Ellbogen fixiert'
      },
      defaultRestSeconds: 60,
      sets: [
        { id: 'd_tp_1', weight: 25, reps: 12, done: false },
        { id: 'd_tp_2', weight: 30, reps: 12, done: false }
      ]
    }
  ],
  plans: [
    {
      id: 'plan_demo_fullbody',
      name: 'Full-Body Foundation',
      subtitle: 'Balanced 45-min machine & cable workout',
      badge: 'Core Plan',
      exerciseIds: [
        'demo_leg_press',
        'demo_lat_pulldown',
        'demo_chest_press',
        'demo_seated_row',
        'demo_shoulder_press',
        'demo_leg_curl',
        'demo_triceps_cable'
      ],
      createdBy: 'preset'
    },
    {
      id: 'plan_demo_upper',
      name: 'Upper Body Push/Pull',
      subtitle: 'Chest, back, shoulders & arms focus',
      badge: 'Upper',
      exerciseIds: [
        'demo_lat_pulldown',
        'demo_chest_press',
        'demo_seated_row',
        'demo_shoulder_press',
        'demo_triceps_cable'
      ],
      createdBy: 'preset'
    }
  ],
  history: [
    {
      id: 'hist_demo_1',
      startedAt: now - 4 * dayMs,
      completedAt: now - 4 * dayMs + 48 * 60_000,
      dateLabel: 'Vor 4 Tagen • 18:15',
      gym: 'Studio North',
      planName: 'Full-Body Foundation',
      durationMinutes: 48,
      totalVolumeKg: 11450,
      totalSets: 18,
      summary: [
        { exerciseId: 'demo_leg_press', name: 'Leg Press (Machine)', category: 'Beine', sets: 3, maxWeight: 110, volumeKg: 3050 },
        { exerciseId: 'demo_lat_pulldown', name: 'Vertical Traction / Latzug', category: 'Rücken', sets: 3, maxWeight: 65, volumeKg: 1720 },
        { exerciseId: 'demo_chest_press', name: 'Chest Press', category: 'Brust', sets: 3, maxWeight: 50, volumeKg: 1350 }
      ]
    },
    {
      id: 'hist_demo_2',
      startedAt: now - 2 * dayMs,
      completedAt: now - 2 * dayMs + 44 * 60_000,
      dateLabel: 'Vor 2 Tagen • 17:40',
      gym: 'Metro Gym',
      planName: 'Upper Body Push/Pull',
      durationMinutes: 44,
      totalVolumeKg: 9820,
      totalSets: 15,
      summary: [
        { exerciseId: 'demo_lat_pulldown', name: 'Vertical Traction / Latzug', category: 'Rücken', sets: 3, maxWeight: 67.5, volumeKg: 1840 },
        { exerciseId: 'demo_chest_press', name: 'Chest Press', category: 'Brust', sets: 3, maxWeight: 52.5, volumeKg: 1410 },
        { exerciseId: 'demo_shoulder_press', name: 'Shoulder Press', category: 'Schultern', sets: 3, maxWeight: 35, volumeKg: 980 }
      ]
    }
  ],
  journal: [
    {
      id: 'j_demo_1',
      createdAt: now - dayMs,
      dateKey: toDateKey(now - dayMs),
      mood: 8,
      energy: 7,
      stress: 3,
      sleepQuality: 8,
      tags: ['Fokus', 'Guter Schlaf', 'Recovery'],
      note: 'Ruhiger Tag mit solidem Schlaf. Schulter fühlt sich frei an, bereit für progressive Steigerung.',
      aiReflection: 'Stabile Schlaf- und HRV-Basis. Ideal für kontrollierte Volumensteigerung im Oberkörper.'
    }
  ],
  healthMetrics: [
    { dateKey: toDateKey(now - 6 * dayMs), sleepHours: 6.8, sleepScore: 76, hrvMs: 52, restingHrBpm: 58, steps: 7400, activeCalories: 390, readinessScore: 74, source: 'simulated_sync', syncedAt: now - 6 * dayMs },
    { dateKey: toDateKey(now - 5 * dayMs), sleepHours: 7.4, sleepScore: 82, hrvMs: 58, restingHrBpm: 56, steps: 9200, activeCalories: 510, readinessScore: 81, source: 'simulated_sync', syncedAt: now - 5 * dayMs },
    { dateKey: toDateKey(now - 4 * dayMs), sleepHours: 7.1, sleepScore: 79, hrvMs: 55, restingHrBpm: 57, steps: 8600, activeCalories: 610, readinessScore: 78, source: 'simulated_sync', syncedAt: now - 4 * dayMs },
    { dateKey: toDateKey(now - 3 * dayMs), sleepHours: 7.8, sleepScore: 86, hrvMs: 62, restingHrBpm: 55, steps: 6900, activeCalories: 340, readinessScore: 85, source: 'simulated_sync', syncedAt: now - 3 * dayMs },
    { dateKey: toDateKey(now - 2 * dayMs), sleepHours: 7.2, sleepScore: 80, hrvMs: 57, restingHrBpm: 56, steps: 10100, activeCalories: 580, readinessScore: 80, source: 'simulated_sync', syncedAt: now - 2 * dayMs },
    { dateKey: toDateKey(now - 1 * dayMs), sleepHours: 7.9, sleepScore: 88, hrvMs: 65, restingHrBpm: 54, steps: 8100, activeCalories: 410, readinessScore: 87, source: 'simulated_sync', syncedAt: now - 1 * dayMs },
    { dateKey: toDateKey(now), sleepHours: 7.6, sleepScore: 85, hrvMs: 63, restingHrBpm: 55, steps: 5420, activeCalories: 280, readinessScore: 84, source: 'simulated_sync', syncedAt: now }
  ],
  coachMessages: [
    {
      id: 'coach_welcome_demo',
      role: 'proactive',
      triggerSource: 'cron:morning_readiness',
      createdAt: now - 3600_000,
      content: 'Guten Morgen! Deine Health-Connect-Readiness liegt heute bei 84/100 (7,6 h Schlaf, HRV 63 ms). Dein Full-Body-Plan ist bereit — starte sauber mit kontrolliertem Tempo.'
    }
  ],
  cronSchedules: [
    {
      id: 'cron_morning',
      name: 'Morning Readiness & HRV Check-in',
      cronExpression: '0 8 * * *',
      timeLabel: '08:00 Täglich',
      category: 'readiness',
      promptTemplate: 'Analysiere meine letzten Health Connect Daten (Schlaf, HRV, Ruhepuls) und meinen letzten Tagebucheintrag. Gib mir eine präzise Tagesempfehlung für Training oder Regeneration.',
      enabled: true,
      lastRunAt: now - 3600_000,
      lastSummary: 'Readiness 84/100 — Training empfohlen.'
    },
    {
      id: 'cron_preworkout',
      name: 'Pre-Workout Gym Primer',
      cronExpression: '0 17 * * 1,3,5',
      timeLabel: '17:00 Mo/Mi/Fr',
      category: 'workout',
      promptTemplate: 'Bereite meinen heutigen Trainingsfokus vor: Welche Zielgewichte sollte ich anvisieren und worauf muss ich bei meinen Schwachstellen achten?',
      enabled: true,
      lastRunAt: null
    },
    {
      id: 'cron_evening_mental',
      name: 'Evening Mental Unwind & Journal',
      cronExpression: '30 21 * * *',
      timeLabel: '21:30 Täglich',
      category: 'mental',
      promptTemplate: 'Stelle mir eine kurze, tiefgehende Reflexionsfrage für mein Mental-Health-Tagebuch basierend auf meinem heutigen Trainingsvolumen und Stresslevel.',
      enabled: true,
      lastRunAt: null
    }
  ],
  activeWorkout: {
    isWorkoutActive: false,
    activePlanId: 'plan_demo_fullbody',
    gym: 'Studio North',
    startedAt: null,
    focusedExerciseId: null,
    restTimerTargetEndTime: null,
    restTimerTotalSeconds: 90,
    restTimerPausedRemaining: null,
    lastUpdatedAt: now
  },
  settings: {
    theme: 'dark',
    userName: 'Athlete',
    gyms: ['Studio North', 'Metro Gym', 'Home Gym'],
    defaultRestSeconds: 90,
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    healthConnectConnected: true,
    notificationsEnabled: true,
    activeSeedSource: 'demo'
  }
};
