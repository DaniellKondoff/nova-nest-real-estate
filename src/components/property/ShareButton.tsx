"use client";

import React from "react";
import { Share2, Copy, Check } from "lucide-react";

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
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors duration-200"
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
