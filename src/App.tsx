import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppSettings,
  AppTab,
  CoachMessage,
  CronSchedule,
  Exercise,
  KoraSnapshot,
  SuggestedPlanPayload,
  WorkoutSessionRecord
} from './types/kora';
import {
  cloneSnapshot,
  exportSnapshotToJson,
  fetchPersonalSeedIfPresent,
  loadInitialSnapshot,
  parseImportedSnapshot,
  persistSnapshot,
  switchSeedProfile,
  writeSyncTheme
} from './services/storage';
import {
  adjustWallClockTimer,
  computeRemainingSeconds,
  startWallClockTimer
} from './services/timer';
import { syncHealthConnectTelemetry } from './services/healthConnect';
import { askKoraCoach, isCronScheduleDueToday } from './services/aiCoach';
import { FloatingWorkoutPill, KoraDock, TopGlassHeader } from './components/FloatingChrome';
import { AddExerciseModal, SettingsModal, TimerModal } from './components/Modals';
import { CoreDashboardView } from './views/CoreDashboardView';
import { TrainView } from './views/TrainView';
import { MindJournalView } from './views/MindJournalView';
import { CoachView } from './views/CoachView';
import { InsightsView } from './views/InsightsView';

export function App() {
  const [snapshot, setSnapshot] = useState<KoraSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('core');
  const [recoveredBannerVisible, setRecoveredBannerVisible] = useState(false);
  const [hasPersonalLocalSeed, setHasPersonalLocalSeed] = useState(false);

  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(90);
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [isSendingCoach, setIsSendingCoach] = useState(false);
  const [hasUnreadProactive, setHasUnreadProactive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerFinishedAlertedRef = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const playCompletionBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Ignore audio errors when autoplay is blocked
    }
  }, []);

  // Apply theme class on document root
  useEffect(() => {
    if (!snapshot) return;
    const theme = snapshot.settings.theme;
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    writeSyncTheme(theme);
  }, [snapshot?.settings.theme]);

  // Initial load + 0-Click Instant Workout Recovery
  useEffect(() => {
    let mounted = true;
    async function boot() {
      const [{ snapshot: loaded, recoveredActiveWorkout }, personalCheck] = await Promise.all([
        loadInitialSnapshot(),
        fetchPersonalSeedIfPresent()
      ]);
      if (!mounted) return;
      setHasPersonalLocalSeed(Boolean(personalCheck));
      setSnapshot(loaded);

      if (recoveredActiveWorkout) {
        setActiveTab('train');
        setRecoveredBannerVisible(true);
        window.setTimeout(() => setRecoveredBannerVisible(false), 4000);
      }

      // Check due cron jobs proactively on cold boot
      const dueCrons = loaded.cronSchedules.filter((c) => isCronScheduleDueToday(c));
      if (dueCrons.length > 0) {
        const firstDue = dueCrons[0];
        const result = await askKoraCoach({
          prompt: firstDue.promptTemplate,
          apiKey: loaded.settings.geminiApiKey,
          model: loaded.settings.geminiModel,
          context: {
            userName: loaded.settings.userName,
            currentGym: loaded.activeWorkout.gym,
            exercises: loaded.exercises,
            plans: loaded.plans,
            history: loaded.history,
            journal: loaded.journal,
            healthMetrics: loaded.healthMetrics
          },
          triggerSource: `cron:${firstDue.id}`
        });
        if (!mounted) return;
        setSnapshot((prev) => {
          if (!prev) return prev;
          const next = cloneSnapshot(prev);
          next.coachMessages.push(result.message);
          next.cronSchedules = next.cronSchedules.map((c) =>
            c.id === firstDue.id
              ? { ...c, lastRunAt: Date.now(), lastSummary: result.message.content.slice(0, 90) }
              : c
          );
          void persistSnapshot(next);
          return next;
        });
        setHasUnreadProactive(true);
      }
    }
    void boot();
    return () => {
      mounted = false;
    };
  }, []);

  const commitSnapshot = useCallback((updater: (draft: KoraSnapshot) => void) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      const next = cloneSnapshot(prev);
      updater(next);
      next.activeWorkout.lastUpdatedAt = Date.now();
      void persistSnapshot(next);
      return next;
    });
  }, []);

  // Wall-clock Rest Timer Loop + visibilitychange wakeup sync
  useEffect(() => {
    if (!snapshot) return;

    const syncClock = () => {
      const aw = snapshot.activeWorkout;
      const rem = computeRemainingSeconds(
        aw.restTimerTargetEndTime,
        aw.restTimerPausedRemaining,
        aw.restTimerTotalSeconds
      );
      setRemainingSeconds(rem);

      if (aw.restTimerTargetEndTime !== null && rem === 0 && !timerFinishedAlertedRef.current) {
        timerFinishedAlertedRef.current = true;
        playCompletionBeep();
        showToast('Pause beendet — nächster Satz!');
        commitSnapshot((draft) => {
          draft.activeWorkout.restTimerTargetEndTime = null;
          draft.activeWorkout.restTimerPausedRemaining = 0;
        });
      }
    };

    syncClock();
    const interval = window.setInterval(syncClock, 500);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        syncClock();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [snapshot, playCompletionBeep, showToast, commitSnapshot]);

  if (!snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full kora-orb animate-kora-orb" />
          <p className="text-xs font-semibold tracking-wide opacity-75">Kora Core wird geladen...</p>
        </div>
      </div>
    );
  }

  const latestHealth = snapshot.healthMetrics.slice(-1)[0];
  const latestJournal = snapshot.journal.slice(-1)[0];
  const latestCoachMsg = snapshot.coachMessages.slice(-1)[0];
  const isTimerRunning = snapshot.activeWorkout.restTimerTargetEndTime !== null;
  const focusedExercise = snapshot.exercises.find(
    (e) => e.id === snapshot.activeWorkout.focusedExerciseId
  );

  const handleStartRestTimer = (seconds: number) => {
    timerFinishedAlertedRef.current = false;
    const started = startWallClockTimer(seconds);
    commitSnapshot((draft) => {
      draft.activeWorkout.restTimerTargetEndTime = started.restTimerTargetEndTime;
      draft.activeWorkout.restTimerTotalSeconds = started.restTimerTotalSeconds;
      draft.activeWorkout.restTimerPausedRemaining = null;
    });
  };

  const handleToggleTimer = () => {
    const aw = snapshot.activeWorkout;
    if (aw.restTimerTargetEndTime !== null) {
      const rem = computeRemainingSeconds(aw.restTimerTargetEndTime, null, aw.restTimerTotalSeconds);
      commitSnapshot((draft) => {
        draft.activeWorkout.restTimerTargetEndTime = null;
        draft.activeWorkout.restTimerPausedRemaining = rem;
      });
    } else {
      const startFrom =
        aw.restTimerPausedRemaining && aw.restTimerPausedRemaining > 0
          ? aw.restTimerPausedRemaining
          : aw.restTimerTotalSeconds;
      handleStartRestTimer(startFrom);
    }
  };

  const handleAdjustTimer = (delta: number) => {
    const aw = snapshot.activeWorkout;
    timerFinishedAlertedRef.current = false;
    const nextTimer = adjustWallClockTimer(
      aw.restTimerTargetEndTime,
      aw.restTimerPausedRemaining,
      aw.restTimerTotalSeconds,
      delta
    );
    commitSnapshot((draft) => {
      draft.activeWorkout.restTimerTargetEndTime = nextTimer.restTimerTargetEndTime;
      draft.activeWorkout.restTimerTotalSeconds = nextTimer.restTimerTotalSeconds;
      draft.activeWorkout.restTimerPausedRemaining = nextTimer.restTimerPausedRemaining;
    });
  };

  const handleResetTimer = () => {
    timerFinishedAlertedRef.current = false;
    commitSnapshot((draft) => {
      draft.activeWorkout.restTimerTargetEndTime = null;
      draft.activeWorkout.restTimerPausedRemaining = draft.activeWorkout.restTimerTotalSeconds;
    });
  };

  const handleStartWorkout = (planId?: string) => {
    commitSnapshot((draft) => {
      draft.activeWorkout.isWorkoutActive = true;
      if (planId) draft.activeWorkout.activePlanId = planId;
      draft.activeWorkout.startedAt = draft.activeWorkout.startedAt ?? Date.now();
      const plan = draft.plans.find((p) => p.id === draft.activeWorkout.activePlanId);
      if (plan && plan.exerciseIds.length > 0 && !draft.activeWorkout.focusedExerciseId) {
        draft.activeWorkout.focusedExerciseId = plan.exerciseIds[0];
      }
    });
    setActiveTab('train');
  };

  const handleFinishWorkout = () => {
    const plan = snapshot.plans.find((p) => p.id === snapshot.activeWorkout.activePlanId) ?? snapshot.plans[0];
    const planIds = new Set(plan?.exerciseIds ?? []);
    const completedSummary = snapshot.exercises
      .filter((ex) => planIds.has(ex.id))
      .map((ex) => {
        const doneSets = ex.sets.filter((s) => s.done);
        if (doneSets.length === 0) return null;
        const maxWeight = Math.max(...doneSets.map((s) => s.weight));
        const volumeKg = doneSets.reduce((acc, s) => acc + s.weight * s.reps, 0);
        return {
          exerciseId: ex.id,
          name: ex.name,
          category: ex.category,
          sets: doneSets.length,
          maxWeight,
          volumeKg
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (completedSummary.length === 0) {
      showToast('Bitte hake zuerst mindestens einen Satz ab.');
      return;
    }

    const now = Date.now();
    const startedAt = snapshot.activeWorkout.startedAt ?? now - 40 * 60_000;
    const totalVolumeKg = completedSummary.reduce((acc, s) => acc + s.volumeKg, 0);
    const totalSets = completedSummary.reduce((acc, s) => acc + s.sets, 0);

    const record: WorkoutSessionRecord = {
      id: `sess_${now}`,
      startedAt,
      completedAt: now,
      dateLabel: new Date(now).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      gym: snapshot.activeWorkout.gym,
      planName: plan?.name ?? 'Workout',
      durationMinutes: Math.max(1, Math.round((now - startedAt) / 60_000)),
      totalVolumeKg: Math.round(totalVolumeKg),
      totalSets,
      summary: completedSummary
    };

    commitSnapshot((draft) => {
      draft.history.push(record);
      // Update topWeight if new PR was hit, then reset done flags while keeping working weights
      draft.exercises.forEach((ex) => {
        const match = completedSummary.find((s) => s.exerciseId === ex.id);
        if (match && (ex.topWeight === null || match.maxWeight > ex.topWeight)) {
          ex.topWeight = match.maxWeight;
        }
        ex.sets.forEach((s) => {
          s.done = false;
        });
      });
      draft.activeWorkout.isWorkoutActive = false;
      draft.activeWorkout.startedAt = null;
      draft.activeWorkout.focusedExerciseId = null;
      draft.activeWorkout.restTimerTargetEndTime = null;
      draft.activeWorkout.restTimerPausedRemaining = null;
    });

    showToast('Workout gespeichert & Progression aktualisiert!');
    setActiveTab('insights');
  };

  const handleSyncHealth = async () => {
    setIsSyncingHealth(true);
    const res = await syncHealthConnectTelemetry(
      snapshot.healthMetrics,
      snapshot.journal,
      snapshot.history
    );
    commitSnapshot((draft) => {
      draft.healthMetrics = res.metrics;
    });
    setIsSyncingHealth(false);
    showToast(
      res.mode === 'native_bridge'
        ? `Health Connect synchronisiert (${res.latest.readinessScore}% Ready)`
        : `Health Telemetry aktualisiert (${res.latest.readinessScore}% Ready)`
    );
  };

  const handleSendCoachMessage = async (prompt: string, triggerSource?: string) => {
    if (!triggerSource) {
      const userMsg: CoachMessage = {
        id: `u_${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: Date.now()
      };
      commitSnapshot((draft) => {
        draft.coachMessages.push(userMsg);
      });
    }

    setIsSendingCoach(true);
    const prevId = [...snapshot.coachMessages]
      .reverse()
      .find((m) => Boolean(m.interactionId))?.interactionId;

    const result = await askKoraCoach({
      prompt,
      apiKey: snapshot.settings.geminiApiKey,
      model: snapshot.settings.geminiModel,
      previousInteractionId: prevId,
      context: {
        userName: snapshot.settings.userName,
        currentGym: snapshot.activeWorkout.gym,
        exercises: snapshot.exercises,
        plans: snapshot.plans,
        history: snapshot.history,
        journal: snapshot.journal,
        healthMetrics: snapshot.healthMetrics
      },
      triggerSource
    });

    commitSnapshot((draft) => {
      draft.coachMessages.push(result.message);
    });
    setIsSendingCoach(false);
    return result.message;
  };

  const handleRunCronNow = async (cronId: string) => {
    const job = snapshot.cronSchedules.find((c) => c.id === cronId);
    if (!job) return;
    const msg = await handleSendCoachMessage(job.promptTemplate, `cron:${job.id}`);
    commitSnapshot((draft) => {
      draft.cronSchedules = draft.cronSchedules.map((c) =>
        c.id === cronId
          ? { ...c, lastRunAt: Date.now(), lastSummary: msg.content.slice(0, 90) }
          : c
      );
    });
    showToast(`Proaktiver Check-in "${job.name}" ausgeführt`);
  };

  const handleSaveJournal = async (entryInput: {
    mood: number;
    energy: number;
    stress: number;
    sleepQuality: number;
    tags: string[];
    note: string;
  }) => {
    const id = `j_${Date.now()}`;
    const dateKey = new Date().toISOString().slice(0, 10);
    commitSnapshot((draft) => {
      draft.journal.push({
        id,
        createdAt: Date.now(),
        dateKey,
        ...entryInput
      });
    });

    const reflectionPrompt = `Der Nutzer hat einen neuen Mental-Health-Tagebuch-Eintrag erstellt: Mood ${entryInput.mood}/10, Energie ${entryInput.energy}/10, Stress ${entryInput.stress}/10, Schlaf ${entryInput.sleepQuality}/10, Tags: ${entryInput.tags.join(', ')}. Notiz: "${entryInput.note}". Gib eine einfühlsame, 2-Satz-Reflexion für Körper & Geist.`;
    const reply = await askKoraCoach({
      prompt: reflectionPrompt,
      apiKey: snapshot.settings.geminiApiKey,
      model: snapshot.settings.geminiModel,
      context: {
        userName: snapshot.settings.userName,
        currentGym: snapshot.activeWorkout.gym,
        exercises: snapshot.exercises,
        plans: snapshot.plans,
        history: snapshot.history,
        journal: snapshot.journal,
        healthMetrics: snapshot.healthMetrics
      },
      triggerSource: 'journal:reflection'
    });

    commitSnapshot((draft) => {
      const target = draft.journal.find((j) => j.id === id);
      if (target) {
        target.aiReflection = reply.message.content;
      }
    });
  };

  const handleApplySuggestedPlan = (payload: SuggestedPlanPayload) => {
    const newId = `plan_ai_${Date.now()}`;
    commitSnapshot((draft) => {
      draft.plans.unshift({
        id: newId,
        name: payload.name,
        subtitle: payload.subtitle,
        badge: 'Kora KI',
        exerciseIds: payload.exerciseIds,
        createdBy: 'ai'
      });
      draft.activeWorkout.activePlanId = newId;
    });
    showToast(`Plan "${payload.name}" übernommen!`);
  };

  const handleExportBackup = () => {
    const json = exportSnapshotToJson(snapshot);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportiert');
  };

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseImportedSnapshot(text);
      await persistSnapshot(parsed);
      setSnapshot(parsed);
      setSettingsOpen(false);
      showToast('Backup erfolgreich wiederhergestellt!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Backup ungültig');
    }
  };

  const handleSwitchSeed = async (source: 'personal' | 'demo') => {
    const next = await switchSeedProfile(source);
    setSnapshot(next);
    setSettingsOpen(false);
    showToast(source === 'personal' ? 'Silas Seed geladen' : 'Portfolio Demo geladen');
  };

  const showFloatingWorkoutPill =
    snapshot.activeWorkout.isWorkoutActive ||
    isTimerRunning ||
    (snapshot.activeWorkout.restTimerPausedRemaining !== null &&
      snapshot.activeWorkout.restTimerPausedRemaining > 0 &&
      snapshot.activeWorkout.restTimerPausedRemaining !== snapshot.activeWorkout.restTimerTotalSeconds);

  return (
    <div className="relative min-h-screen pb-40">
      {/* Ambient Mesh Background */}
      <div className="kora-ambient-canvas" aria-hidden="true" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 liquid-glass-elevated rounded-full px-4 py-2 text-xs font-bold shadow-xl pointer-events-none">
          {toastMsg}
        </div>
      )}

      {/* Floating Top Glass Header */}
      <TopGlassHeader
        userName={snapshot.settings.userName}
        activeGym={snapshot.activeWorkout.gym}
        gyms={snapshot.settings.gyms}
        theme={snapshot.settings.theme}
        readinessScore={latestHealth?.readinessScore ?? 85}
        onChangeGym={(gym) => {
          commitSnapshot((draft) => {
            draft.activeWorkout.gym = gym;
          });
          showToast(`Studio: ${gym}`);
        }}
        onToggleTheme={() =>
          commitSnapshot((draft) => {
            draft.settings.theme = draft.settings.theme === 'dark' ? 'light' : 'dark';
          })
        }
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto w-full max-w-xl px-3.5 pt-3">
        {activeTab === 'core' && (
          <CoreDashboardView
            userName={snapshot.settings.userName}
            activeGym={snapshot.activeWorkout.gym}
            activeWorkout={snapshot.activeWorkout}
            plans={snapshot.plans}
            latestHealth={latestHealth}
            latestCoachMessage={latestCoachMsg}
            latestJournal={latestJournal}
            history={snapshot.history}
            isSyncingHealth={isSyncingHealth}
            onSyncHealth={() => void handleSyncHealth()}
            onStartWorkout={handleStartWorkout}
            onResumeWorkout={() => setActiveTab('train')}
            onNavigateTab={(tab) => {
              if (tab === 'coach') setHasUnreadProactive(false);
              setActiveTab(tab);
            }}
            onRunProactiveCheckin={() => {
              const firstCron = snapshot.cronSchedules[0];
              if (firstCron) void handleRunCronNow(firstCron.id);
              setActiveTab('coach');
            }}
          />
        )}

        {activeTab === 'train' && (
          <TrainView
            exercises={snapshot.exercises}
            plans={snapshot.plans}
            activeWorkout={snapshot.activeWorkout}
            recoveredBannerVisible={recoveredBannerVisible}
            onSelectPlan={(planId) =>
              commitSnapshot((draft) => {
                draft.activeWorkout.activePlanId = planId;
              })
            }
            onStartWorkout={() => handleStartWorkout()}
            onFinishWorkout={handleFinishWorkout}
            onFocusExercise={(exerciseId) =>
              commitSnapshot((draft) => {
                draft.activeWorkout.focusedExerciseId = exerciseId || null;
                if (exerciseId) {
                  draft.activeWorkout.isWorkoutActive = true;
                  draft.activeWorkout.startedAt = draft.activeWorkout.startedAt ?? Date.now();
                }
              })
            }
            onUpdateSet={(exId, setId, field, value) =>
              commitSnapshot((draft) => {
                draft.activeWorkout.isWorkoutActive = true;
                draft.activeWorkout.startedAt = draft.activeWorkout.startedAt ?? Date.now();
                draft.activeWorkout.focusedExerciseId = exId;
                const ex = draft.exercises.find((e) => e.id === exId);
                const st = ex?.sets.find((s) => s.id === setId);
                if (st) st[field] = value;
              })
            }
            onToggleSetDone={(exId, setId) => {
              let completedNow = false;
              let restSec = 90;
              commitSnapshot((draft) => {
                draft.activeWorkout.isWorkoutActive = true;
                draft.activeWorkout.startedAt = draft.activeWorkout.startedAt ?? Date.now();
                draft.activeWorkout.focusedExerciseId = exId;
                const ex = draft.exercises.find((e) => e.id === exId);
                const st = ex?.sets.find((s) => s.id === setId);
                if (st) {
                  st.done = !st.done;
                  st.completedAt = st.done ? Date.now() : undefined;
                  completedNow = st.done;
                  restSec = ex?.defaultRestSeconds ?? 90;
                }
              });
              if (completedNow) {
                handleStartRestTimer(restSec);
              }
            }}
            onAddSet={(exId) =>
              commitSnapshot((draft) => {
                const ex = draft.exercises.find((e) => e.id === exId);
                if (!ex) return;
                const last = ex.sets.slice(-1)[0];
                ex.sets.push({
                  id: `set_${Date.now()}`,
                  weight: last?.weight ?? 40,
                  reps: last?.reps ?? 10,
                  done: false
                });
              })
            }
            onDeleteSet={(exId, setId) =>
              commitSnapshot((draft) => {
                const ex = draft.exercises.find((e) => e.id === exId);
                if (!ex || ex.sets.length <= 1) return;
                ex.sets = ex.sets.filter((s) => s.id !== setId);
              })
            }
            onUpdatePinNote={(exId, gym, note) => {
              commitSnapshot((draft) => {
                const ex = draft.exercises.find((e) => e.id === exId);
                if (ex) {
                  ex.gymSettings[gym] = note;
                }
              });
              showToast('Notiz gespeichert');
            }}
            onRemoveExerciseFromPlan={(exId) =>
              commitSnapshot((draft) => {
                const plan = draft.plans.find((p) => p.id === draft.activeWorkout.activePlanId);
                if (plan) {
                  plan.exerciseIds = plan.exerciseIds.filter((id) => id !== exId);
                }
              })
            }
            onOpenAddExercise={() => setAddExerciseOpen(true)}
            onStartRestTimer={handleStartRestTimer}
            onAskAiPlanAdapter={() => {
              setActiveTab('coach');
              void handleSendCoachMessage('Erstelle einen 45-Min Express-Plan für heute');
            }}
          />
        )}

        {activeTab === 'mind' && (
          <MindJournalView
            entries={snapshot.journal}
            isGeneratingReflection={isSendingCoach}
            onSaveEntry={(entry) => void handleSaveJournal(entry)}
          />
        )}

        {activeTab === 'coach' && (
          <CoachView
            messages={snapshot.coachMessages}
            cronSchedules={snapshot.cronSchedules}
            hasGeminiKey={Boolean(snapshot.settings.geminiApiKey.trim())}
            modelName={snapshot.settings.geminiModel}
            isSending={isSendingCoach}
            onSendMessage={(p) => void handleSendCoachMessage(p)}
            onApplySuggestedPlan={handleApplySuggestedPlan}
            onToggleCron={(cronId) =>
              commitSnapshot((draft) => {
                draft.cronSchedules = draft.cronSchedules.map((c) =>
                  c.id === cronId ? { ...c, enabled: !c.enabled } : c
                );
              })
            }
            onRunCronNow={(cronId) => void handleRunCronNow(cronId)}
            onAddCron={(newCron) =>
              commitSnapshot((draft) => {
                const item: CronSchedule = {
                  ...newCron,
                  id: `cron_${Date.now()}`,
                  lastRunAt: null
                };
                draft.cronSchedules.push(item);
              })
            }
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            exercises={snapshot.exercises}
            history={snapshot.history}
            healthMetrics={snapshot.healthMetrics}
            onDeleteHistory={(sessionId) =>
              commitSnapshot((draft) => {
                draft.history = draft.history.filter((h) => h.id !== sessionId);
              })
            }
          />
        )}
      </main>

      {/* Floating Rest Timer & Active Workout Mini-Pill */}
      <FloatingWorkoutPill
        isVisible={showFloatingWorkoutPill}
        exerciseName={focusedExercise?.name ?? 'Aktives Training'}
        startedAt={snapshot.activeWorkout.startedAt}
        remainingSeconds={remainingSeconds}
        totalSeconds={snapshot.activeWorkout.restTimerTotalSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={handleToggleTimer}
        onAdd15s={() => handleAdjustTimer(15)}
        onOpenTimerModal={() => setTimerModalOpen(true)}
        onJumpToWorkout={() => setActiveTab('train')}
        onDismissTimer={() =>
          commitSnapshot((draft) => {
            draft.activeWorkout.restTimerTargetEndTime = null;
            draft.activeWorkout.restTimerPausedRemaining = null;
          })
        }
      />

      {/* Floating Bottom Pill Navigation Dock */}
      <KoraDock
        activeTab={activeTab}
        hasUnreadProactive={hasUnreadProactive}
        isWorkoutActive={snapshot.activeWorkout.isWorkoutActive}
        onSelectTab={(tab) => {
          if (tab === 'coach') setHasUnreadProactive(false);
          setActiveTab(tab);
        }}
      />

      {/* Modals */}
      <TimerModal
        isOpen={timerModalOpen}
        remainingSeconds={remainingSeconds}
        totalSeconds={snapshot.activeWorkout.restTimerTotalSeconds}
        isRunning={isTimerRunning}
        onClose={() => setTimerModalOpen(false)}
        onToggle={handleToggleTimer}
        onReset={handleResetTimer}
        onSelectDuration={(sec) => handleStartRestTimer(sec)}
        onAdjust={handleAdjustTimer}
      />

      <AddExerciseModal
        isOpen={addExerciseOpen}
        activeGym={snapshot.activeWorkout.gym}
        existingExerciseNames={snapshot.exercises.map((e) => e.name)}
        onClose={() => setAddExerciseOpen(false)}
        onSave={(newEx: Exercise) => {
          commitSnapshot((draft) => {
            draft.exercises.push(newEx);
            const plan = draft.plans.find((p) => p.id === draft.activeWorkout.activePlanId);
            if (plan) plan.exerciseIds.push(newEx.id);
          });
          showToast(`"${newEx.name}" hinzugefügt`);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        settings={snapshot.settings}
        hasPersonalLocalSeed={hasPersonalLocalSeed}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={(patch: Partial<AppSettings>) =>
          commitSnapshot((draft) => {
            draft.settings = { ...draft.settings, ...patch };
          })
        }
        onExportBackup={handleExportBackup}
        onImportBackup={(f) => void handleImportBackup(f)}
        onSwitchSeed={(source) => void handleSwitchSeed(source)}
      />
    </div>
  );
}

export default App;
