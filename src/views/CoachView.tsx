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
  'Analysiere meine Schwachstellen & Kraft-Dysbalancen',
  'Erstelle einen 45-Min Express-Plan für heute',
  'Wie passt mein Re-Entry heute zu HRV & Schlaf?',
  'Stelle mir eine Mental-Reflexionsfrage für heute Abend'
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
      {/* Kora Core Agent Header */}
      <div className="liquid-glass rounded-3xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full kora-orb animate-kora-orb flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">Kora AI Core</h2>
            <p className="text-[11px] opacity-70">
              {hasGeminiKey
                ? `Live verbunden • ${modelName} (@google/genai)`
                : 'Lokaler Smart-Coach (Gemini Key optional in Settings)'}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            hasGeminiKey
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              : 'liquid-pill opacity-80'
          }`}
        >
          {hasGeminiKey ? 'Gemini Live' : 'Offline Core'}
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isSending}
            onClick={() => onSendMessage(q)}
            className="shrink-0 liquid-pill rounded-full px-3 py-1.5 text-[11px] font-semibold hover:scale-[1.02] transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Stream */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3 max-h-[44vh] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isProactive = msg.role === 'proactive';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : isProactive
                    ? 'bg-indigo-500/15 border border-indigo-400/30'
                    : 'bg-black/15 dark:bg-white/[0.07] border border-white/10'
                }`}
              >
                {isProactive && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1">
                    <BellRing className="w-3 h-3" />
                    <span>Proaktiver Cron Check-in</span>
                  </p>
                )}
                {msg.content}

                {msg.suggestedPlan && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/15 space-y-2">
                    <p className="font-bold text-cyan-300">{msg.suggestedPlan.name}</p>
                    <p className="text-[11px] opacity-75">{msg.suggestedPlan.subtitle}</p>
                    <button
                      type="button"
                      onClick={() => {
                        onApplySuggestedPlan(msg.suggestedPlan!);
                        setAppliedPlanIds((prev) => ({ ...prev, [msg.id]: true }));
                      }}
                      className="px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                    >
                      {appliedPlanIds[msg.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Plan übernommen!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>In Train-Tab übernehmen ({msg.suggestedPlan.exerciseIds.length} Übungen)</span>
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
          <div className="text-xs opacity-60 italic px-2">Kora analysiert Trainings- &amp; Gesundheitsdaten...</div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="liquid-glass-elevated rounded-full p-1.5 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frag Kora zu Training, Schwachstellen, Schlaf oder Mental..."
          className="flex-1 bg-transparent px-3.5 py-2 text-xs focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          aria-label="Nachricht senden"
          className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Always-On Cron Scheduler */}
      <div className="liquid-glass rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Always-On Cron Check-ins</span>
            </h3>
            <p className="text-[11px] opacity-65">Proaktive Agent-Impulse basierend auf Health Connect &amp; Journal</p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewCron((v) => !v)}
            className="liquid-pill px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cron</span>
          </button>
        </div>

        {showNewCron && (
          <form onSubmit={handleCreateCron} className="p-3 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={cronName}
                onChange={(e) => setCronName(e.target.value)}
                placeholder="Titel (z. B. Mittagspulse)"
                className="col-span-2 liquid-pill rounded-xl px-2.5 py-2 focus:outline-none"
              />
              <input
                type="time"
                value={cronTime}
                onChange={(e) => setCronTime(e.target.value)}
                className="liquid-pill rounded-xl px-2 py-2 focus:outline-none"
              />
            </div>
            <input
              type="text"
              required
              value={cronPrompt}
              onChange={(e) => setCronPrompt(e.target.value)}
              placeholder="Prompt für den proaktiven Agent..."
              className="w-full liquid-pill rounded-xl px-2.5 py-2 focus:outline-none"
            />
            <button type="submit" className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold cursor-pointer">
              Cron-Job aktivieren
            </button>
          </form>
        )}

        <div className="space-y-2">
          {cronSchedules.map((job) => (
            <div
              key={job.id}
              className="p-3 rounded-2xl bg-black/10 dark:bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold truncate">{job.name}</span>
                  <span className="text-[10px] font-mono opacity-60 px-1.5 py-0.5 rounded bg-white/10">
                    {job.timeLabel}
                  </span>
                </div>
                <p className="text-[11px] opacity-65 truncate mt-0.5">
                  {job.lastSummary || job.promptTemplate}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onRunCronNow(job.id)}
                  disabled={isSending}
                  title="Jetzt proaktiv ausführen"
                  className="liquid-pill px-2.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Run</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCron(job.id)}
                  className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold cursor-pointer ${
                    job.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'liquid-pill opacity-60'
                  }`}
                >
                  {job.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
