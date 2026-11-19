import React, { useEffect, useRef, useState } from 'react';
import { Check, Clock, Plus, Send } from 'lucide-react';
import { CoachMessage, SuggestedPlanPayload } from '../types/kora';
import { KoraBadge, KoraLogo } from '../components/KoraLogo';
import { PageHeader, RichText } from '../components/ui';

interface CoachViewProps {
  messages: CoachMessage[];
  hasGeminiKey: boolean;
  modelName: string;
  isSending: boolean;
  onSendMessage: (prompt: string) => void;
  onApplySuggestedPlan: (plan: SuggestedPlanPayload) => void;
  onOpenSettings: () => void;
}

const QUICK_PROMPTS = [
  'Analysiere meine Schwachstellen & Dysbalancen',
  'Erstelle einen 45-Min Express-Plan für heute',
  'Wie passt mein Training heute zu HRV & Schlaf?',
  'Stelle mir eine Reflexionsfrage für heute Abend'
];

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const CoachView: React.FC<CoachViewProps> = ({
  messages,
  hasGeminiKey,
  modelName,
  isSending,
  onSendMessage,
  onApplySuggestedPlan,
  onOpenSettings
}) => {
  const [input, setInput] = useState('');
  const [appliedPlanIds, setAppliedPlanIds] = useState<Record<string, boolean>>({});
  const chatListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isSending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="space-y-3.5">
      <PageHeader
        leading={<KoraBadge size="md" />}
        eyebrow={hasGeminiKey ? `${modelName} • Live Coach` : 'Lokaler Core-Coach'}
        title="Kora Coach"
        action={
          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[44px] rounded-full liquid-pill px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                hasGeminiKey ? 'bg-accent' : 'bg-current opacity-40'
              }`}
            />
            <Clock className="w-3.5 h-3.5 kora-muted shrink-0" />
            <span>Automatisierung</span>
          </button>
        }
      />

      {/* Dedicated Chat Container */}
      <div className="liquid-glass rounded-[28px] p-3.5 sm:p-4 flex flex-col gap-3">
        {/* Scrollable Message List */}
        <div
          ref={chatListRef}
          className="h-[38vh] min-h-[220px] max-h-[380px] overflow-y-auto no-scrollbar space-y-3.5 pr-0.5"
        >
          <div className="flex items-center gap-3 py-1">
            <div className="h-[0.5px] flex-1 bg-[var(--kora-hairline)]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider kora-muted px-2.5 py-1 rounded-full liquid-pill">
              Chat gestartet
            </span>
            <div className="h-[0.5px] flex-1 bg-[var(--kora-hairline)]" />
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isProactive = msg.role === 'proactive';
            const timeLabel = formatMessageTime(msg.createdAt);

            if (isUser) {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-medium kora-muted px-1 tabular-nums">
                    Du • {timeLabel}
                  </span>
                  <div className="max-w-[85%] btn-accent rounded-2xl rounded-tr-sm px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line">
                    <RichText text={msg.content} />
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className="mt-4 shrink-0">
                  <KoraBadge size="sm" />
                </div>
                <div className="flex flex-col items-start gap-1 min-w-0 max-w-[85%]">
                  <span className="text-[10px] font-medium kora-muted px-1 tabular-nums">
                    {isProactive ? 'Kora • Check-in' : 'Kora'} • {timeLabel}
                  </span>
                  <div className="liquid-pill rounded-2xl rounded-tl-sm px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line">
                    <RichText text={msg.content} />

                    {msg.suggestedPlan && (
                      <div className="mt-3 pt-2.5 border-t kora-hairline-divider space-y-2">
                        <p className="font-semibold">{msg.suggestedPlan.name}</p>
                        <p className="text-xs kora-muted">{msg.suggestedPlan.subtitle}</p>
                        <button
                          type="button"
                          onClick={() => {
                            onApplySuggestedPlan(msg.suggestedPlan!);
                            setAppliedPlanIds((prev) => ({ ...prev, [msg.id]: true }));
                          }}
                          className="btn-accent min-h-[42px] px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
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
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-start gap-2.5">
              <KoraBadge size="sm" />
              <div className="liquid-pill rounded-2xl rounded-tl-sm px-4 py-3 text-xs kora-muted flex items-center gap-2">
                <KoraLogo className="w-4 h-4 animate-kora-breath" />
                <span>Kora analysiert Trainings- &amp; Gesundheitsdaten...</span>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Quick Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t kora-hairline-divider">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isSending}
              onClick={() => onSendMessage(q)}
              className="kora-chip shrink-0 rounded-full min-h-[40px] px-3.5 py-1.5 text-xs active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Prominent Chat Input Bar */}
        <form
          onSubmit={handleSend}
          className="liquid-pill rounded-full min-h-[48px] p-1 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frag Kora zu Training, Schwachstellen oder Schlaf..."
            className="flex-1 bg-transparent px-3.5 py-2 text-[13px] focus:outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            aria-label="Nachricht senden"
            className="btn-accent w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
