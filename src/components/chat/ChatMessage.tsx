"use client";

import { cn } from "@/lib/design-tokens";
import { PropertyCard, parsePropertyLines } from "./PropertyCard";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

/**
 * Splits assistant content into text segments and property-line segments.
 * Property lines (containing "ID:" and "/properties/") are rendered as cards;
 * everything else renders as plain text.
 */
function renderAssistantContent(content: string, isStreaming?: boolean) {
  const properties = parsePropertyLines(content);

  if (properties.length === 0) {
    return (
      <>
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-primary/40 ml-0.5 animate-pulse rounded-sm align-middle" />
        )}
      </>
    );
  }

  // Strip property lines from the text so they don't render twice
  const propertyLinePattern = /^.*ID:\s*\d+.*\/properties\/\d+.*$/gm;
  const textOnly = content.replace(propertyLinePattern, "").replace(/\n{3,}/g, "\n\n").trim();

  return (
    <div className="space-y-2">
      {textOnly && (
        <p className="whitespace-pre-wrap break-words">{textOnly}</p>
      )}
      <div className="space-y-1.5">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-primary/40 ml-0.5 animate-pulse rounded-sm align-middle" />
      )}
    </div>
  );
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-2 w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mt-0.5">
          <span className="text-accent text-xs font-bold">N</span>
        </div>
      )}

      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-accent text-white rounded-tr-sm"
            : "bg-gray-100 text-primary rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          renderAssistantContent(content, isStreaming)
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
          <span className="text-primary/60 text-xs font-semibold">Вие</span>
        </div>
      )}
    </div>
  );
}
