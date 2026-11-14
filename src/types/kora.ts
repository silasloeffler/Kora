export type ThemeMode = 'dark' | 'light';

export type LogoVariant = 'yinyang' | 'eclipse' | 'orbital' | 'monogram' | 'compass';

export type AppTab = 'core' | 'train' | 'mind' | 'coach' | 'insights';

export type MuscleCategory =
  | 'Beine'
  | 'Rücken'
  | 'Brust'
  | 'Schultern'
  | 'Arme'
  | 'Core';

export type ExercisePattern =
  | 'leg_press'
  | 'hack_squat'
  | 'leg_extension'
  | 'leg_curl'
  | 'hip_abduction'
  | 'lunge'
  | 'squat'
  | 'lat_pulldown'
  | 'seated_row'
  | 'back_extension'
  | 'chest_press'
  | 'butterfly'
  | 'shoulder_press'
  | 'lateral_raise'
  | 'bicep_curl'
  | 'tricep_pushdown'
  | 'dip'
  | 'core_crunch';

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  done: boolean;
  completedAt?: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleCategory;
  pattern: ExercisePattern;
  primaryMuscle: string;
  targetWeight: string;
  topWeight: number | null;
  topSummary?: string;
  gymSettings: Record<string, string>;
  defaultRestSeconds: number;
  sets: ExerciseSet[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  exerciseIds: string[];
  createdBy: 'preset' | 'user' | 'ai';
}

export interface WorkoutSessionExerciseSummary {
  exerciseId: string;
  name: string;
  category: MuscleCategory;
  sets: number;
  maxWeight: number;
  volumeKg: number;
}

export interface WorkoutSessionRecord {
  id: string;
  startedAt: number;
  completedAt: number;
  dateLabel: string;
  gym: string;
  planName: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  summary: WorkoutSessionExerciseSummary[];
}

export interface ActiveWorkoutState {
  isWorkoutActive: boolean;
  activePlanId: string;
  gym: string;
  startedAt: number | null;
  focusedExerciseId: string | null;
  restTimerTargetEndTime: number | null;
  restTimerTotalSeconds: number;
  restTimerPausedRemaining: number | null;
  lastUpdatedAt: number;
}

export interface JournalEntry {
  id: string;
  createdAt: number;
  dateKey: string;
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
  tags: string[];
  note: string;
  aiReflection?: string;
}

export interface HealthConnectDailyMetric {
  dateKey: string;
  sleepHours: number;
  sleepScore: number;
  hrvMs: number;
  restingHrBpm: number;
  steps: number;
  activeCalories: number;
  readinessScore: number;
  source: 'health_connect_bridge' | 'simulated_sync' | 'manual';
  syncedAt: number;
}

export interface SuggestedPlanPayload {
  name: string;
  subtitle: string;
  exerciseIds: string[];
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant' | 'proactive';
  content: string;
  createdAt: number;
  triggerSource?: string;
  interactionId?: string;
  suggestedPlan?: SuggestedPlanPayload;
}

export interface CronSchedule {
  id: string;
  name: string;
  cronExpression: string;
  timeLabel: string;
  category: 'readiness' | 'workout' | 'mental';
  promptTemplate: string;
  enabled: boolean;
  lastRunAt: number | null;
  lastSummary?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: string;
  logoVariant: LogoVariant;
  userName: string;
  gyms: string[];
  defaultRestSeconds: number;
  geminiApiKey: string;
  geminiModel: string;
  healthConnectConnected: boolean;
  notificationsEnabled: boolean;
  activeSeedSource: 'personal' | 'demo';
}

export interface KoraSnapshot {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  history: WorkoutSessionRecord[];
  journal: JournalEntry[];
  healthMetrics: HealthConnectDailyMetric[];
  coachMessages: CoachMessage[];
  cronSchedules: CronSchedule[];
  activeWorkout: ActiveWorkoutState;
  settings: AppSettings;
}
