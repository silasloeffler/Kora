import React, { useState } from 'react';
import { BellRing, Check, Clock, Play, Plus, Send, Sparkles } from 'lucide-react';
import { CoachMessage, CronSchedule, SuggestedPlanPayload } from '../types/kora';

interface CoachViewProps {
  messages: CoachMessage[];
  cronSchedules: CronSchedule[];
  hasGeminiKey: boolean;
  modelName: string;
  isSending: boolean;
  onSendMessage: (prompt: string) => void;
  onApplySuggestedPlan: (plan: SuggestedPlanPayload) => void;
  onToggleCron: (cronId: string) => void;
  onRunCronNow: (cronId: string) => void;
  onAddCron: (schedule: Omit<CronSchedule, 'id' | 'lastRunAt'>) => void;
}

const QUICK_PROMPTS = [
  'Analysiere meine Schwachstellen & Dysbalancen',
  'Erstelle einen 45-Min Express-Plan für heute',
  'Wie passt mein Training heute zu HRV & Schlaf?',
  'Stelle mir eine Reflexionsfrage für heute Abend'
];

export const CoachView: React.FC<CoachViewProps> = ({
  messages,
  cronSchedules,
  hasGeminiKey,
  modelName,
  isSending,
  onSendMessage,
  onApplySuggestedPlan,
  onToggleCron,
  onRunCronNow,
  onAddCron
}) => {
  const [input, setInput] = useState('');
  const [appliedPlanIds, setAppliedPlanIds] = useState<Record<string, boolean>>({});
  const [showNewCron, setShowNewCron] = useState(false);
  const [cronName, setCronName] = useState('');
  const [cronTime, setCronTime] = useState('12:30');
  const [cronPrompt, setCronPrompt] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input.trim());
    setInput('');
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
    <div className="space-y-4">
      {/* Minimalist Coach Header */}
      <div className="liquid-glass rounded-[24px] p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-full kora-orb animate-kora-orb flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#1d1d1f]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight">Kora Coach</h2>
            <p className="text-xs kora-muted truncate">
              {hasGeminiKey
                ? `${modelName} • Kontext & Health Sync`
                : 'Lokaler Core-Coach (Gemini Key in Settings)'}
            </p>
          </div>
        </div>
        <span className="liquid-pill text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
          {hasGeminiKey && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          <span>{hasGeminiKey ? 'Live' : 'Lokal'}</span>
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isSending}
            onClick={() => onSendMessage(q)}
            className="shrink-0 liquid-pill rounded-full min-h-[38px] px-4 py-2 text-xs font-medium hover:opacity-80 transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Stream */}
      <div className="liquid-glass rounded-[24px] p-4 space-y-3 max-h-[44vh] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isProactive = msg.role === 'proactive';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'btn-primary font-medium'
                    : isProactive
                    ? 'bg-black/[0.05] dark:bg-white/[0.08]'
                    : 'bg-black/[0.03] dark:bg-white/[0.05]'
                }`}
              >
                {isProactive && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1 flex items-center gap-1">
                    <BellRing className="w-3 h-3" />
                    <span>Proaktiver Check-in</span>
                  </p>
                )}
                {msg.content}

                {msg.suggestedPlan && (
                  <div className="mt-2.5 pt-2.5 border-t kora-hairline-divider space-y-2">
                    <p className="font-semibold">{msg.suggestedPlan.name}</p>
                    <p className="text-xs kora-muted">{msg.suggestedPlan.subtitle}</p>
                    <button
                      type="button"
                      onClick={() => {
                        onApplySuggestedPlan(msg.suggestedPlan!);
                        setAppliedPlanIds((prev) => ({ ...prev, [msg.id]: true }));
                      }}
                      className="btn-accent px-3.5 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {appliedPlanIds[msg.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Plan übernommen</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            In Train übernehmen ({msg.suggestedPlan.exerciseIds.length} Übungen)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="text-xs kora-muted italic px-1">
            Kora analysiert Trainings- &amp; Gesundheitsdaten...
          </div>
        )}
      </div>

      {/* Floating Glass Chat Input */}
      <form
        onSubmit={handleSend}
        className="liquid-glass-elevated rounded-full p-1.5 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frag Kora zu Training, Schwachstellen oder Schlaf..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          aria-label="Nachricht senden"
          className="btn-accent w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Always-On Cron Scheduler */}
      <div className="liquid-glass rounded-[24px] overflow-hidden divide-y kora-hairline-divider">
        <div className="p-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              <span>Always-On Cron Check-ins</span>
            </h3>
            <p className="text-[11px] kora-muted mt-0.5">
              Proaktive Impulse aus Health Connect &amp; Tagebuch
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewCron((v) => !v)}
            className="liquid-pill min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cron</span>
          </button>
        </div>

        {showNewCron && (
          <form
            onSubmit={handleCreateCron}
            className="p-4 bg-black/[0.02] dark:bg-white/[0.02] space-y-2.5 text-xs"
          >
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={cronName}
                onChange={(e) => setCronName(e.target.value)}
                placeholder="Titel (z. B. Mittagspuls)"
                className="col-span-2 liquid-pill rounded-xl px-3 py-2 focus:outline-none"
              />
              <input
                type="time"
                value={cronTime}
                onChange={(e) => setCronTime(e.target.value)}
                className="liquid-pill rounded-xl px-2.5 py-2 focus:outline-none"
              />
            </div>
            <input
              type="text"
              required
              value={cronPrompt}
              onChange={(e) => setCronPrompt(e.target.value)}
              placeholder="Prompt für den proaktiven Agent..."
              className="w-full liquid-pill rounded-xl px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-full font-semibold cursor-pointer"
            >
              Cron-Job aktivieren
            </button>
          </form>
        )}

        {cronSchedules.map((job) => (
          <div key={job.id} className="px-4 py-3 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{job.name}</span>
                <span className="text-[10px] font-mono kora-muted px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] shrink-0">
                  {job.timeLabel}
                </span>
              </div>
              <p className="text-[11px] kora-muted truncate mt-0.5">
                {job.lastSummary || job.promptTemplate}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onRunCronNow(job.id)}
                disabled={isSending}
                title="Jetzt proaktiv ausführen"
                className="liquid-pill min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-accent" />
                <span>Run</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleCron(job.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                  job.enabled ? 'btn-accent' : 'liquid-pill kora-muted'
                }`}
              >
                {job.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
