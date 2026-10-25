"use client";

import React from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps): React.ReactElement {
  const [copied, setCopied] = React.useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled or share failed — silently ignore
      }
      return;
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently ignore
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Споделете имота"
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-primary transition-colors hover:border-primary"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          <span>Копирано!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden />
          <span>Споделете</span>
        </>
      )}
    </button>
  );
}
