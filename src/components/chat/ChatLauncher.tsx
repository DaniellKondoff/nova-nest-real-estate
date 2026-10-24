"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";

// The full widget (framer-motion, streaming logic) is only downloaded on intent.
const loadChatWidget = () => import("./ChatWidget").then((m) => m.ChatWidget);
const ChatWidget = dynamic(loadChatWidget, { ssr: false });

/**
 * Lightweight floating button that lazy-loads the AI chat widget.
 * Keeps the chat JS out of the initial bundle on every public page.
 */
export function ChatLauncher() {
  const [activated, setActivated] = useState(false);

  if (activated) return <ChatWidget defaultOpen />;

  return (
    <div className="fixed bottom-[calc(5rem+var(--fab-offset))] right-3 z-50 sm:right-4">
      <button
        type="button"
        onClick={() => setActivated(true)}
        onPointerEnter={() => void loadChatWidget()}
        onFocus={() => void loadChatWidget()}
        aria-label="Отвори AI асистент"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_24px_rgba(26,38,66,0.45)] ring-[3px] ring-accent sm:h-14 sm:w-14 transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
