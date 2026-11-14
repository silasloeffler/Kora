import { GoogleGenAI } from '@google/genai';
import {
  CoachMessage,
  CronSchedule,
  Exercise,
  HealthConnectDailyMetric,
  JournalEntry,
  SuggestedPlanPayload,
  WorkoutPlan,
  WorkoutSessionRecord
} from '../types/kora';

export interface CoachContextSnapshot {
  userName: string;
  currentGym: string;
  exercises: Exercise[];
  plans: WorkoutPlan[];
  history: WorkoutSessionRecord[];
  journal: JournalEntry[];
  healthMetrics: HealthConnectDailyMetric[];
}

function buildSystemInstruction(ctx: CoachContextSnapshot): string {
  const latestHealth = ctx.healthMetrics.slice(-1)[0];
  const latestJournal = ctx.journal.slice(-3);
  const exerciseSummary = ctx.exercises
    .map((ex) => {
      const currentMax = Math.max(...ex.sets.map((s) => s.weight), 0);
      const pct = ex.topWeight ? Math.round((currentMax / ex.topWeight) * 100) : null;
      return `- ${ex.id} | ${ex.name} (${ex.category}): aktuell ${currentMax}kg vs Peak ${ex.topWeight ?? '-'}kg${pct ? ` (${pct}%)` : ''}, Ziel: ${ex.targetWeight || '-'}kg`;
    })
    .join('\n');

  const journalText = latestJournal
    .map(
      (j) =>
        `[${j.dateKey}] Stimmung ${j.mood}/10, Energie ${j.energy}/10, Stress ${j.stress}/10, Schlaf ${j.sleepQuality}/10, Tags: ${j.tags.join(', ')} — "${j.note}"`
    )
    .join('\n');

  const historyText = ctx.history
    .slice(-4)
    .map((h) => `[${h.dateLabel}] ${h.gym} | ${h.planName} | ${h.totalSets} Sätze | ${h.totalVolumeKg} kg Volumen`)
    .join('\n');

  return [
    `Du bist Kora, der ganzheitliche KI-Coach & Wellness-Core für ${ctx.userName}.`,
    `Du verbindest Krafttraining (TechnoGym / freie Gewichte), Regeneration (Health Connect) und Mental Health (Tagebuch, Stress, Schlaf).`,
    `Antworte auf Deutsch, empathisch, präzise, motivierend und datenbasiert (max. 160 Wörter, klare Bulletpoints wenn sinnvoll).`,
    `Aktuelles Studio: ${ctx.currentGym}.`,
    latestHealth
      ? `Heutige Health-Connect-Daten: Readiness ${latestHealth.readinessScore}/100, Schlaf ${latestHealth.sleepHours}h (Score ${latestHealth.sleepScore}), HRV ${latestHealth.hrvMs}ms, Ruhepuls ${latestHealth.restingHrBpm}bpm, Schritte ${latestHealth.steps}.`
      : 'Keine aktuellen Health-Connect-Daten vorhanden.',
    `\nÜbungs-Repertoire & Kraftstand:\n${exerciseSummary}`,
    `\nLetzte Workouts:\n${historyText || 'Noch keine gespeicherten Sessions'}`,
    `\nLetzte Tagebucheinträge:\n${journalText || 'Noch keine Einträge'}`,
    `\nWenn der Nutzer nach einem neuen oder angepassten Trainingsplan fragt, hänge am Ende exakt einen JSON-Block im Format \`\`\`kora-plan\n{"name":"...","subtitle":"...","exerciseIds":["..."]}\n\`\`\` an und nutze ausschließlich gültige Exercise-IDs aus der Liste oben.`
  ].join('\n');
}

export function extractSuggestedPlan(
  text: string,
  availableExercises: Exercise[]
): { cleanText: string; suggestedPlan?: SuggestedPlanPayload } {
  const regex = /```kora-plan\s*([\s\S]*?)```/i;
  const match = text.match(regex);
  if (!match) return { cleanText: text.trim() };

  const validIds = new Set(availableExercises.map((e) => e.id));
  try {
    const parsed = JSON.parse(match[1].trim()) as Partial<SuggestedPlanPayload>;
    const filteredIds = (parsed.exerciseIds ?? []).filter((id) => validIds.has(id));
    if (parsed.name && filteredIds.length > 0) {
      return {
        cleanText: text.replace(regex, '').trim(),
        suggestedPlan: {
          name: parsed.name,
          subtitle: parsed.subtitle || 'Von Kora KI zusammengestellt',
          exerciseIds: filteredIds
        }
      };
    }
  } catch {
    // Ignore malformed suggestion block
  }
  return { cleanText: text.replace(regex, '').trim() };
}

function buildLocalFallbackReply(
  prompt: string,
  ctx: CoachContextSnapshot,
  triggerSource?: string
): { content: string; suggestedPlan?: SuggestedPlanPayload } {
  const lower = prompt.toLowerCase();
  const latestHealth = ctx.healthMetrics.slice(-1)[0];
  const latestJournal = ctx.journal.slice(-1)[0];

  const ratios = ctx.exercises
    .filter((ex) => ex.topWeight && ex.topWeight > 0)
    .map((ex) => {
      const current = Math.max(...ex.sets.map((s) => s.weight), 0);
      return {
        ex,
        current,
        ratio: current / (ex.topWeight as number)
      };
    })
    .sort((a, b) => a.ratio - b.ratio);

  if (lower.includes('45') || lower.includes('express') || lower.includes('plan')) {
    const picked = ctx.exercises.slice(0, 6).map((e) => e.id);
    return {
      content: `Ich habe dir für **${ctx.currentGym}** einen kompakten 45-Minuten Express-Plan zusammengestellt (Fokus auf große Verbundgeräte mit 90s Pause). Bei einer Readiness von **${latestHealth?.readinessScore ?? 82}/100** startest du kontrolliert im Re-Entry-Bereich und sparst unnötige Ermüdung.`,
      suggestedPlan: {
        name: `Kora Express (${ctx.currentGym.split(' ')[0]})`,
        subtitle: '6 Core-Geräte • ca. 45 Min • Fokus saubere Technik',
        exerciseIds: picked
      }
    };
  }

  if (lower.includes('schwach') || lower.includes('dysbal') || lower.includes('analy')) {
    const lowest = ratios.slice(0, 3);
    const highest = ratios.slice(-2);
    const lines = lowest
      .map(
        (r) =>
          `• **${r.ex.name}**: aktuell ${r.current} kg vs. Peak ${r.ex.topWeight} kg (${Math.round(r.ratio * 100)}%)`
      )
      .join('\n');
    const topLines = highest
      .map((r) => `${r.ex.name} (${Math.round(r.ratio * 100)}%)`)
      .join(', ');
    return {
      content: `**Kora Kraft- & Balance-Analyse:**\nDie größte Lücke zu deinem früheren Peak liegt aktuell bei:\n${lines || '• Noch ausreichend Daten im Aufbau'}\n\nStark erhalten geblieben sind: ${topLines || 'Basisübungen'}.\nEmpfehlung: Bleib 2–3 Wochen bei kontrollierten 10–12 Wdh. (RIR 2), damit Sehnen & ZNS mit der Kraft nachziehen.`
    };
  }

  if (triggerSource?.includes('evening') || lower.includes('mental') || lower.includes('tagebuch')) {
    const stressNote =
      latestJournal && latestJournal.stress >= 6
        ? `Dein letzter Stresswert lag bei ${latestJournal.stress}/10 — plane heute Abend 10 Min ruhiges Atmen ohne Screens ein.`
        : `Deine Stress-Balance wirkt mit ${latestJournal?.stress ?? 4}/10 stabil.`;
    return {
      content: `**Abend-Check-in (Mental Core):**\n${stressNote}\n\nReflexionsfrage für dein Tagebuch heute:\n*„Welche eine Sache hat dir heute im Training oder Alltag spürbar Energie zurückgegeben — und was darfst du für morgen loslassen?“*`
    };
  }

  return {
    content: `**Kora Morning & Recovery Briefing (${ctx.currentGym}):**\n• **Readiness:** ${latestHealth?.readinessScore ?? 84}/100 (Schlaf ${latestHealth?.sleepHours ?? 7.6} h, HRV ${latestHealth?.hrvMs ?? 62} ms)\n• **Mental Baseline:** Stimmung ${latestJournal?.mood ?? 8}/10, Energie ${latestJournal?.energy ?? 7}/10\n• **Fokus heute:** Sauberes Re-Entry-Volumen ohne Muskelversagen. Hinterlege optional deinen Gemini API-Key in den Einstellungen für noch tiefere Live-Analysen mit \`gemini-3.8-flash\`.`
  };
}

export async function askKoraCoach(params: {
  prompt: string;
  apiKey: string;
  model: string;
  previousInteractionId?: string;
  context: CoachContextSnapshot;
  triggerSource?: string;
}): Promise<{
  message: CoachMessage;
  usedLiveGemini: boolean;
}> {
  const { prompt, apiKey, model, previousInteractionId, context, triggerSource } = params;

  if (!apiKey.trim()) {
    const fallback = buildLocalFallbackReply(prompt, context, triggerSource);
    return {
      usedLiveGemini: false,
      message: {
        id: `msg_${Date.now()}`,
        role: triggerSource ? 'proactive' : 'assistant',
        content: fallback.content,
        createdAt: Date.now(),
        triggerSource,
        suggestedPlan: fallback.suggestedPlan
      }
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const interaction = await ai.interactions.create({
      model: model || 'gemini-3.8-flash',
      system_instruction: buildSystemInstruction(context),
      input: prompt,
      ...(previousInteractionId ? { previous_interaction_id: previousInteractionId } : {})
    });

    const rawText = interaction.output_text || 'Keine Antwort erhalten.';
    const { cleanText, suggestedPlan } = extractSuggestedPlan(rawText, context.exercises);

    return {
      usedLiveGemini: true,
      message: {
        id: `msg_${Date.now()}`,
        role: triggerSource ? 'proactive' : 'assistant',
        content: cleanText,
        createdAt: Date.now(),
        triggerSource,
        interactionId: interaction.id,
        suggestedPlan
      }
    };
  } catch (err) {
    const fallback = buildLocalFallbackReply(prompt, context, triggerSource);
    const reason = err instanceof Error ? err.message : 'Verbindungsfehler';
    return {
      usedLiveGemini: false,
      message: {
        id: `msg_${Date.now()}`,
        role: triggerSource ? 'proactive' : 'assistant',
        content: `${fallback.content}\n\n_(Hinweis: Live-Gemini nicht erreichbar: ${reason})_`,
        createdAt: Date.now(),
        triggerSource,
        suggestedPlan: fallback.suggestedPlan
      }
    };
  }
}

export function isCronScheduleDueToday(schedule: CronSchedule, now: number = Date.now()): boolean {
  if (!schedule.enabled) return false;
  const parts = schedule.cronExpression.trim().split(/\s+/);
  if (parts.length < 5) return false;

  const minute = Number(parts[0]);
  const hour = Number(parts[1]);
  const dayOfWeekPart = parts[4];
  if (Number.isNaN(minute) || Number.isNaN(hour)) return false;

  const current = new Date(now);
  const currentDay = current.getDay(); // 0 = Sun, 1 = Mon ...

  if (dayOfWeekPart !== '*') {
    const allowedDays = dayOfWeekPart.split(',').map((d) => Number(d.trim()));
    if (!allowedDays.includes(currentDay)) return false;
  }

  const scheduledToday = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
    hour,
    minute,
    0,
    0
  ).getTime();

  if (now < scheduledToday) return false;

  if (schedule.lastRunAt && schedule.lastRunAt >= scheduledToday) {
    return false;
  }

  return true;
}
