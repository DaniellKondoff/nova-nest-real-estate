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
const PHONE_LINE_PATTERN = /📞[^\n]*/g;

function renderAssistantContent(content: string, isStreaming?: boolean) {
  const properties = parsePropertyLines(content);

  // Extract phone footer lines so we can pin them after the cards
  const phoneLines = content.match(PHONE_LINE_PATTERN) ?? [];
  const phoneFooter = phoneLines[phoneLines.length - 1] ?? null;

  // Strip property lines and phone lines from prose
  const propertyLinePattern = /^.*ID:\s*\d+.*\/properties\/\d+.*$/gm;
  const textOnly = content
    .replace(propertyLinePattern, "")
    .replace(PHONE_LINE_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (properties.length === 0) {
    return (
      <>
        <p className="whitespace-pre-wrap break-words">{textOnly || content}</p>
        {phoneFooter && (
          <p className="whitespace-pre-wrap break-words mt-2 text-[0.8125rem] sm:text-xs text-primary/85 font-medium">{phoneFooter}</p>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-accent/60 ml-0.5 animate-pulse rounded-sm align-middle" />
        )}
      </>
    );
  }

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
      {phoneFooter && (
        <p className="whitespace-pre-wrap break-words text-[0.8125rem] sm:text-xs text-primary/85 font-medium">{phoneFooter}</p>
      )}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-accent/60 ml-0.5 animate-pulse rounded-sm align-middle" />
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
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[0.9375rem] sm:text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-accent to-[#c49b33] text-[#1a2642] rounded-tr-sm shadow-gold font-semibold"
            : "bg-[#f4f6fb] text-primary font-medium rounded-tl-sm shadow-subtle border border-primary/10"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          renderAssistantContent(content, isStreaming)
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent to-[#c49b33] flex items-center justify-center mt-0.5 shadow-gold">
          <span className="text-[#1a2642] text-[10px] font-bold">ВИЕ</span>
        </div>
      )}
    </div>
  );
}
