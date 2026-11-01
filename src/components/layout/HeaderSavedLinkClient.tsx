"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useSavedIds } from "@/lib/saved/store";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const SAVED_PAGE_PATH = site.pages.saved;

/**
 * Header shortcut to "Избрани имоти" – appears only once something is saved (empty on the server render),
 * so the first tap on a heart gives visible feedback in the header.
 */
export default function HeaderSavedLinkClient() {
  const count = useSavedIds().length;
  const current = usePathname() === SAVED_PAGE_PATH;
  if (count === 0) return null;

  return (
    <Link
      href={SAVED_PAGE_PATH}
      aria-label={`Избрани имоти (${count})`}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white ring-1 ring-accent/40 transition-colors",
        "hover:bg-white/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        current && "bg-white/10"
      )}
    >
      <Heart className="h-5 w-5 fill-accent text-accent" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold tabular-nums text-primary ring-2 ring-primary"
      >
        {count}
      </span>
    </Link>
  );
}
