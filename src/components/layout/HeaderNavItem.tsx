"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderNavItemProps {
  label: string;
  href: string;
  /** Path prefixes that mark this item as the current section */
  match?: string[];
  /** Optional dropdown panel (server-rendered children) */
  children?: React.ReactNode;
}

/**
 * Desktop nav item: real link + gold underline for the current section.
 * The dropdown opens via CSS (hover / focus-within); this island only closes it
 * after a client navigation or on Escape, which CSS alone cannot do.
 */
export default function HeaderNavItem({ label, href, match = [], children }: HeaderNavItemProps) {
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLLIElement>(null);
  const lastPathname = useRef(pathname);
  const [closed, setClosed] = useState(false);
  const active = match.some((prefix) => pathname.startsWith(prefix));

  // After navigating from the panel the pointer/focus is still inside it – keep it shut until they leave
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (ref.current?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    setClosed(true);
  }, [pathname]);

  return (
    <li
      ref={ref}
      className="group relative"
      data-closed={closed || undefined}
      onMouseLeave={() => setClosed(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setClosed(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !children) return;
        setClosed(true);
        e.currentTarget.querySelector<HTMLElement>("a")?.focus();
      }}
    >
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex h-11 items-center gap-1 rounded-lg px-3 text-[15px] font-medium text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          active && "text-white"
        )}
      >
        {label}
        {children && (
          <ChevronDown
            className="h-4 w-4 text-white/60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180 group-data-closed:rotate-0! motion-reduce:transition-none"
            aria-hidden="true"
          />
        )}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-accent transition-transform duration-300 motion-reduce:transition-none",
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          )}
        />
      </Link>

      {children && (
        <div
          className={cn(
            "invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-[opacity,translate,visibility] duration-200 motion-reduce:transition-none",
            "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
            "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
            "group-data-closed:invisible! group-data-closed:opacity-0!"
          )}
        >
          {children}
        </div>
      )}
    </li>
  );
}
