"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/config/site";
import type { SiteNavLink, SiteNavOperation } from "@/lib/seo/nav-links";
import { listingCountLabel } from "@/lib/seo/landing";
import { cn } from "@/lib/utils";

interface HeaderMobileMenuClientProps {
  operations: SiteNavOperation[];
  neighborhoods: SiteNavLink[];
}

const SECONDARY_LINKS = [
  { label: "Всички имоти", href: "/properties/" },
  { label: "Услуги", href: "/#services" },
  { label: "За нас", href: "/#about" },
  { label: "Контакти", href: "/#contact" },
];

const FOCUSABLE = "a[href], button:not([disabled])";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{children}</p>;
}

/**
 * Mobile hamburger button + menu panel below the header (portal to document.body).
 * - Opens instantly (CSS transition), sections: buy/rent tiles, property types, neighborhoods, secondary links
 * - Call / contact actions pinned to the bottom (thumb zone)
 * - Back button / Esc close it; focus is trapped between the hamburger and the panel
 */
export default function HeaderMobileMenuClient({ operations, neighborhoods }: HeaderMobileMenuClientProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const pendingHref = useRef<string | null>(null);

  useEffect(() => setMounted(true), []);

  /** Closing pops our history entry; the popstate listener does the rest */
  const close = useCallback(() => {
    if (pushed.current) window.history.back();
    else setOpen(false);
  }, []);

  // While open: history entry (back closes), scroll lock, Esc + focus trap
  useEffect(() => {
    if (!open) return;
    if (!pushed.current) {
      window.history.pushState({ mobileMenu: true }, "");
      pushed.current = true;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onPopState = () => {
      pushed.current = false;
      setOpen(false);
      const href = pendingHref.current;
      pendingHref.current = null;
      if (href) router.push(href);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current || !buttonRef.current) return;
      const items = [buttonRef.current, ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (current <= 0 ? items.length - 1 : current - 1) : (current + 1) % items.length;
      e.preventDefault();
      items[next].focus();
    };

    window.addEventListener("popstate", onPopState);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, router]);

  // Focus back to the hamburger when the menu closes from inside
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open && (!document.activeElement || document.activeElement === document.body || panelRef.current?.contains(document.activeElement))) {
      buttonRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  // Navigation that bypassed onLinkClick (e.g. browser forward) – just close
  useEffect(() => {
    pushed.current = false;
    setOpen(false);
  }, [pathname]);

  /** Pop the menu entry first, then navigate – keeps the history stack clean */
  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !pushed.current) return;
    e.preventDefault();
    pendingHref.current = e.currentTarget.getAttribute("href");
    window.history.back();
  };

  const isCurrent = (href: string) => pathname === href;
  // Buy / rent tiles; "Всички имоти" fills the row when only one operation has listings
  const tiles = operations.map((op) => ({ title: op.operation === "sale" ? "Купи" : "Наеми", href: op.href, count: op.count }));
  if (tiles.length < 2) {
    tiles.push({ title: "Всички имоти", href: "/properties/", count: operations.reduce((sum, op) => sum + op.count, 0) });
  }
  const chipClass =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-medium ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "Затвори меню" : "Отвори меню"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="h-11 w-11 rounded-xl p-2 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
      >
        <span className="relative flex h-full w-full flex-col items-center justify-center gap-[5px]" aria-hidden="true">
          <span className={cn("block h-0.5 w-6 rounded-full bg-white transition-transform duration-300", open && "translate-y-[7px] rotate-45")} />
          <span className={cn("block h-0.5 w-6 rounded-full bg-white transition-[opacity,scale] duration-300", open && "scale-x-0 opacity-0")} />
          <span className={cn("block h-0.5 w-6 rounded-full bg-white transition-transform duration-300", open && "-translate-y-[7px] -rotate-45")} />
        </span>
      </button>

      {mounted &&
        createPortal(
          <div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Меню"
            inert={!open}
            className={cn(
              "fixed inset-x-0 bottom-0 top-[var(--header-h)] z-50 flex flex-col bg-primary text-white lg:hidden",
              "transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:transition-none",
              open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
            )}
          >
            <nav aria-label="Мобилна навигация" className="flex-1 overflow-y-auto overscroll-contain">
              <div className="mx-auto max-w-md space-y-7 px-4 pb-6 pt-5">
                <div className="grid grid-cols-2 gap-3">
                  {tiles.map((tile) => (
                    <Link
                      key={tile.href}
                      href={tile.href}
                      onClick={onLinkClick}
                      aria-current={isCurrent(tile.href) ? "page" : undefined}
                      className="group flex min-h-24 flex-col justify-between rounded-card bg-white/5 p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-[current=page]:ring-accent"
                    >
                      <span className="text-xl font-semibold">{tile.title}</span>
                      <span className="flex items-center justify-between text-sm text-white/65">
                        {tile.count > 0 ? listingCountLabel(tile.count) : "Разгледайте"}
                        <ArrowRight className="h-4 w-4 text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>

                {operations
                  .filter((op) => op.categories.length > 0)
                  .map((op) => (
                    <div key={op.operation}>
                      <SectionTitle>{op.label}</SectionTitle>
                      <ul className="flex flex-wrap gap-2">
                        {op.categories.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={onLinkClick}
                              aria-current={isCurrent(c.href) ? "page" : undefined}
                              className={cn(
                                chipClass,
                                isCurrent(c.href) ? "bg-accent text-primary ring-accent" : "bg-white/5 ring-white/15 hover:bg-white/10"
                              )}
                            >
                              {c.label}
                              <span className={cn("text-xs tabular-nums", isCurrent(c.href) ? "text-primary/70" : "text-white/50")}>{c.count}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                {neighborhoods.length > 0 && (
                  <div>
                    <SectionTitle>Популярни квартали</SectionTitle>
                    <ul className="grid grid-cols-2 gap-x-3">
                      {neighborhoods.map((n) => (
                        <li key={n.href}>
                          <Link
                            href={n.href}
                            onClick={onLinkClick}
                            aria-current={isCurrent(n.href) ? "page" : undefined}
                            className="flex min-h-11 items-center justify-between gap-2 border-b border-white/10 text-[15px] text-white/85 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-[current=page]:text-accent"
                          >
                            <span className="truncate">{n.label}</span>
                            <span className="text-xs tabular-nums text-white/45">{n.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {SECONDARY_LINKS.filter((item) => !tiles.some((t) => t.href === item.href)).map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onLinkClick}
                        aria-current={isCurrent(item.href) ? "page" : undefined}
                        className="flex min-h-12 items-center justify-between text-lg font-medium transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-[current=page]:text-accent"
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4 text-white/40" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Thumb-zone actions */}
            <div className="shrink-0 border-t border-white/10 bg-primary-dark/60 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
              <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
                <a
                  href={`tel:${site.contact.phone}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl font-semibold ring-1 ring-accent/60 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Обадете се: ${site.contact.phoneDisplay}`}
                >
                  <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
                  Обади се
                </a>
                <Link
                  href="/#contact"
                  onClick={onLinkClick}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-accent font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  Свържете се
                </Link>
              </div>
              <p className="mt-2 text-center text-xs text-white/55">
                Пон–Пет {site.contact.businessHours.weekdays} · Съб {site.contact.businessHours.saturday}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
