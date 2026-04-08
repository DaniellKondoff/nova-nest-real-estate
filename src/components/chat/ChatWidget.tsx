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
            style={{ transformOrigin: "bottom right" }}
            className={cn(
              "fixed z-50",
              // Mobile: full-screen panel
              "inset-0 sm:inset-auto",
              // Desktop: fixed 380×560, anchored bottom-right
              "sm:bottom-[4.5rem] sm:right-4",
              "sm:w-[380px] sm:h-[560px]",
              "flex flex-col",
              "bg-white sm:rounded-2xl shadow-card border border-gray-100"
            )}
            role="dialog"
            aria-label="AI имотен асистент"
            aria-modal="false"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary sm:rounded-t-2xl flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">Nova Nest Асистент</p>
                <p className="text-white/60 text-xs">AI имотен консултант</p>
              </div>
              <button
                onClick={handleToggle}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Затвори чата"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3 min-h-0">
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
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
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
                      className="text-left text-xs text-primary/70 bg-gray-50 hover:bg-accent/10 hover:text-primary border border-gray-200 hover:border-accent/30 rounded-xl px-3 py-2 transition-all duration-150"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-gray-100">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-primary/40 transition-colors">
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
                  className="flex-1 bg-transparent text-sm text-primary placeholder:text-gray-400 resize-none outline-none leading-6 min-h-[1.5rem] max-h-24 overflow-y-auto"
                  aria-label="Съобщение до асистента"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isBusy}
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    input.trim() && !isBusy
                      ? "bg-accent text-white hover:bg-accent/90 shadow-gold"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
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

              <p className="text-center text-gray-400 text-[10px] mt-1.5">
                Powered by Claude AI · Nova Nest
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle button ─────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        aria-label={isOpen ? "Затвори чата" : "Отвори AI асистент"}
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-4 right-3 sm:right-4 z-50",
          "flex items-center justify-center",
          "shadow-lift transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          isOpen
            ? "bg-primary text-white scale-95"
            : "bg-accent text-white hover:scale-110 active:scale-95"
        )}
        style={{ width: "3.25rem", height: "3.25rem", borderRadius: "9999px" }}
      >
        <span className={cn("transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0")}>
          {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </span>
      </button>
    </>
  );
}
