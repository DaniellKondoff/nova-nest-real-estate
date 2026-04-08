"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/design-tokens";
import { ChatMessage } from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Здравейте! Аз съм AI асистентът на Nova Nest. Мога да ви помогна да намерите имот в Стара Загора. Опишете какво търсите.",
};

const SUGGESTIONS = [
  "Двустаен апартамент под наем до 500 евро",
  "Тристаен апартамент за продажба",
  "Имот в Центъра до 80 000 евро",
];

const MAX_CHARS = 500;
const COUNTER_THRESHOLD = 400;
const MAX_MESSAGES = 50;
const REQUEST_TIMEOUT_MS = 30_000;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isStreaming || isWaiting) return;

    // Session message cap
    if (messages.length >= MAX_MESSAGES) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Достигнахте лимита на съобщенията за тази сесия. Моля, презаредете страницата за нов разговор.",
        },
      ]);
      return;
    }

    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsWaiting(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: history.slice(-10) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // First chunk received — swap waiting indicator for streaming bubble
      setIsWaiting(false);
      setIsStreaming(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]" || payload === "[ERROR]") break;

          try {
            const chunk: string = JSON.parse(payload);
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                next[next.length - 1] = { ...last, content: last.content + chunk };
              }
              return next;
            });
          } catch {
            // skip malformed SSE chunk
          }
        }
      }
    } catch (err) {
      setIsWaiting(false);
      const isAbort = (err as Error).name === "AbortError";
      if (!isAbort || timedOut) {
        const errorContent = timedOut
          ? "Заявката отне твърде дълго. Моля, опитайте отново."
          : "Съжалявам, възникна грешка. Моля, опитайте отново.";
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && last.content === "") {
            next[next.length - 1] = { role: "assistant", content: errorContent };
          } else {
            next.push({ role: "assistant", content: errorContent });
          }
          return next;
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, isWaiting, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToggle = () => {
    if (isOpen) abortRef.current?.abort();
    setIsOpen((v) => !v);
  };

  const isBusy = isStreaming || isWaiting;
  const showCounter = input.length >= COUNTER_THRESHOLD;
  const isAtLimit = input.length >= MAX_CHARS;
  const isOnlyWelcome = messages.length === 1;

  return (
    <>
      {/* ── Floating panel ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right", boxShadow: "0 20px 60px rgba(26,38,66,0.18), 0 4px 16px rgba(26,38,66,0.08)" }}
            className={cn(
              "fixed z-50",
              // Mobile: full-screen panel
              "inset-0 sm:inset-auto",
              // Desktop: fixed 380×560, anchored bottom-right
              "sm:bottom-[6.5rem] sm:right-4",
              "sm:w-[380px] sm:h-[560px]",
              "flex flex-col overflow-hidden",
              "bg-gradient-to-b from-white to-[#f5f7ff] sm:rounded-2xl border border-primary/10"
            )}
            role="dialog"
            aria-label="AI имотен асистент"
            aria-modal="false"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-[#1a2642]/95 backdrop-blur-[8px] sm:rounded-t-2xl flex-shrink-0 border-b border-white/10 relative overflow-hidden">
              {/* Subtle gold shimmer line at bottom — mirrors site header accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
              {/* Logo-style icon badge — gold gradient circle matching site CTA */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-[#c49b33] flex items-center justify-center shadow-gold flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-[#1a2642]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight tracking-wide">Nova Nest Асистент</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <p className="text-white/50 text-[11px] tracking-wide">AI имотен консултант</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Затвори чата"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3 min-h-0 bg-white">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={
                    isStreaming && i === messages.length - 1 && msg.role === "assistant"
                  }
                />
              ))}

              {/* Typing indicator — shown while waiting for first chunk */}
              {isWaiting && (
                <div className="flex gap-2 w-full justify-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <span className="text-accent text-xs font-bold">N</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1 shadow-subtle border border-primary/8">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-accent/70 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestion chips — only shown on welcome state */}
              {isOnlyWelcome && !isBusy && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-left text-sm sm:text-xs text-[#1a2642] font-medium bg-white hover:bg-[#fffdf4] border border-[#1a2642]/20 hover:border-accent/40 rounded-xl px-3 py-2.5 transition-all duration-200 shadow-subtle hover:shadow-gold active:bg-[#fffdf4] active:shadow-gold relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-accent before:to-accent/60 before:rounded-l-xl"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div className="flex-shrink-0 px-3 pt-2 border-t border-primary/8" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
              <div className="flex items-end gap-2 bg-white rounded-xl px-3 py-2 border border-[#1a2642]/20 focus-within:border-[#d4af37] focus-within:shadow-gold transition-all duration-200 overflow-hidden">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) setInput(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишете вашето търсене..."
                  rows={1}
                  disabled={isBusy}
                  maxLength={MAX_CHARS}
                  className="flex-1 min-w-0 bg-transparent text-sm text-[#1a2642] font-medium placeholder:text-[#1a2642]/50 resize-none outline-none leading-6 min-h-[2rem] sm:min-h-[1.5rem] max-h-24 overflow-y-auto"
                  aria-label="Съобщение до асистента"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isBusy}
                  className={cn(
                    "flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all",
                    input.trim() && !isBusy
                      ? "bg-[#d4af37] text-white shadow-gold"
                      : "bg-[#e8eaf2] text-[#1a2642]/40 cursor-not-allowed border border-[#1a2642]/10"
                  )}
                  aria-label="Изпрати съобщение"
                >
                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Char counter */}
              {showCounter && (
                <p className={cn(
                  "text-right text-[10px] mt-1 pr-0.5",
                  isAtLimit ? "text-red-500 font-medium" : "text-gray-400"
                )}>
                  {input.length}/{MAX_CHARS}
                </p>
              )}

              <p className="text-center text-[#1a2642]/60 tracking-wide text-[11px] mt-1.5 font-medium">
                Nova Nest Real Estate Assistant — помага ви да намерите идеалния имот в Стара Загора.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle button ─────────────────────────────────────────── */}
      <div className={cn("fixed bottom-20 right-3 sm:right-4 z-50", isOpen && "hidden sm:flex")}>
        <button
          onClick={handleToggle}
          aria-label={isOpen ? "Затвори чата" : "Отвори AI асистент"}
          aria-expanded={isOpen}
          className={cn(
            "relative z-0 flex items-center justify-center",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            isOpen ? "scale-95" : "hover:scale-110 active:scale-95"
          )}
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "9999px",
            background: "#1a2642",
            boxShadow: isOpen
              ? "0 4px 16px rgba(26,38,66,0.40)"
              : "0 6px 24px rgba(26,38,66,0.45), 0 2px 8px rgba(26,38,66,0.25)",
            "--speed": "1.5s",
          } as React.CSSProperties}
        >
          {/* Shimmer layer — gold arc rotating around perimeter (closed state) */}
          {!isOpen && (
            <>
              {/* Spinning conic gradient — full coverage behind button */}
              <div
                className="animate-spin-around pointer-events-none absolute -inset-1"
                style={{
                  borderRadius: "9999px",
                  background: "conic-gradient(from 0deg, transparent 0deg, #d4af37 60deg, #f0d78c 90deg, #d4af37 120deg, transparent 180deg, transparent 360deg)",
                  zIndex: -2,
                  "--speed": "1.5s",
                } as React.CSSProperties}
              />
              {/* Navy inset fill — shows only the border ring of the gradient */}
              <div
                className="absolute pointer-events-none"
                style={{
                  inset: "3px",
                  borderRadius: "9999px",
                  background: "#1a2642",
                  zIndex: -1,
                }}
              />
            </>
          )}
          {/* Icon */}
          <span className={cn("relative z-10 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0")}>
            {isOpen
              ? <X className="w-5 h-5 text-white" />
              : <MessageCircle className="w-5 h-5 text-white" />
            }
          </span>
        </button>
      </div>
    </>
  );
}
