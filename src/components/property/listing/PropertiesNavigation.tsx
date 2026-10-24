"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationContextValue {
  isPending: boolean;
  navigate: (href: string, options?: { scroll?: boolean }) => void;
}

const NavigationContext = React.createContext<NavigationContextValue | null>(null);

/**
 * Wraps the /properties UI so filter/sort/page changes run inside a transition:
 * the server re-renders the listing while the current results stay visible (dimmed).
 */
export function PropertiesNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const navigate = React.useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      startTransition(() => {
        router.push(href, { scroll: options?.scroll ?? false });
      });
    },
    [router]
  );

  const value = React.useMemo(() => ({ isPending, navigate }), [isPending, navigate]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function usePropertiesNavigation(): NavigationContextValue {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) throw new Error("usePropertiesNavigation must be used inside PropertiesNavigationProvider");
  return ctx;
}

/** Results wrapper: dims and marks busy while a navigation is pending. */
export function PendingResults({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isPending } = usePropertiesNavigation();
  return (
    <div
      aria-busy={isPending || undefined}
      className={cn("relative transition-opacity duration-200", isPending && "pointer-events-none opacity-50", className)}
    >
      {isPending && (
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-[var(--header-h)] z-40 h-0.5 overflow-hidden bg-accent/20"
        >
          <div className="h-full w-1/3 animate-[progress_1s_ease-in-out_infinite] bg-accent" />
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Real <a href> (crawlable, works without JS) that navigates inside the listing transition
 * on a plain left-click.
 */
export function ListingLink({
  href,
  scrollToTop = false,
  className,
  children,
  ...rest
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: string; scrollToTop?: boolean }) {
  const { navigate } = usePropertiesNavigation();
  return (
    <Link
      href={href}
      scroll={false}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
        if (scrollToTop) document.getElementById("listing-top")?.scrollIntoView({ behavior: "smooth" });
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
