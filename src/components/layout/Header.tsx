import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { containerClass } from "@/components/ui/section";
import { site } from "@/config/site";
import { getSiteNavLinks, type SiteNavLink } from "@/lib/seo/nav-links";
import { cn } from "@/lib/utils";
import HeaderScrollClient from "./HeaderScrollClient";
import HeaderMobileMenuClient from "./HeaderMobileMenuClient";
import HeaderNavItem from "./HeaderNavItem";

interface HeaderProps {
  /** Optional extra class names for the outer header container */
  className?: string;
}

/** Plain links after the property sections (home page anchors) */
const SECONDARY_NAV_ITEMS = [
  { label: "Услуги", href: "/#services" },
  { label: "За нас", href: "/#about" },
];

const MAX_HEADER_NEIGHBORHOODS = 6;

/** Dropdown panel for a nav item – server-rendered so every landing link is in the HTML */
function NavPanel({ title, all, links }: { title: string; all: SiteNavLink; links: SiteNavLink[] }) {
  return (
    <div className="w-[34rem] overflow-hidden rounded-card bg-white text-primary shadow-lift ring-1 ring-black/5">
      <div className="grid grid-cols-[1fr_12rem]">
        <div className="p-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors hover:bg-muted hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="truncate">{link.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{link.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={all.href}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-accent-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {all.label} ({all.count})
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-4 bg-primary p-5 text-white">
          <div>
            <p className="font-semibold">Продавате или отдавате имот?</p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">Безплатна оценка и консултация.</p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-primary transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            Свържете се
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Sticky site header (server component).
 * - Height follows the --header-h CSS var (64px mobile, 80px desktop) – sticky offsets depend on it, so it never changes
 * - Desktop: Продажби / Наеми / Имоти with CSS dropdowns linking the keyword landing pages (only non-empty ones)
 * - Scroll state handled by HeaderScrollClient, mobile menu by HeaderMobileMenuClient (client islands)
 */
export default async function Header({ className }: HeaderProps) {
  const { operations, neighborhoods } = await getSiteNavLinks();
  const topNeighborhoods = neighborhoods.slice(0, MAX_HEADER_NEIGHBORHOODS);
  const totalCount = operations.reduce((sum, op) => sum + op.count, 0);
  const allProperties: SiteNavLink = { label: "Всички имоти", href: "/properties/", count: totalCount };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-white transition-[border-color,box-shadow] duration-300",
        "data-scrolled:border-accent/25 data-scrolled:shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
        className
      )}
      role="banner"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-primary"
      >
        Към съдържанието
      </a>
      <HeaderScrollClient />

      <div className={cn(containerClass, "flex h-[var(--header-h)] items-center justify-between gap-4")}>
        <Logo size="md" priority className="lg:[&>img]:h-12" />

        {/* Desktop navigation – server-rendered for SEO */}
        <nav className="hidden lg:block" aria-label="Основна навигация">
          <ul className="flex items-center gap-1 xl:gap-2">
            {operations.map((op) => (
              <HeaderNavItem
                key={op.operation}
                label={op.operation === "sale" ? "Продажби" : "Наеми"}
                href={op.href}
                match={[op.href]}
              >
                {op.categories.length > 0 && (
                  <NavPanel title={`${op.label} по вид`} all={op} links={op.categories} />
                )}
              </HeaderNavItem>
            ))}
            <HeaderNavItem
              label="Имоти"
              href={allProperties.href}
              match={[allProperties.href, ...topNeighborhoods.map((n) => n.href)]}
            >
              {topNeighborhoods.length > 0 && (
                <NavPanel title="Имоти по квартал" all={allProperties} links={topNeighborhoods} />
              )}
            </HeaderNavItem>
            {SECONDARY_NAV_ITEMS.map((item) => (
              <HeaderNavItem key={item.href} label={item.label} href={item.href} />
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Phone: gold-ringed icon button on mobile/tablet, number + hours on xl */}
          <a
            href={`tel:${site.contact.phone}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white ring-1 ring-accent/40 transition-colors hover:bg-white/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:w-auto xl:gap-3 xl:rounded-xl xl:px-3 xl:ring-0"
            aria-label={`Обадете се: ${site.contact.phoneDisplay}`}
          >
            <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="hidden flex-col leading-tight xl:flex">
              <span className="text-[15px] font-semibold tabular-nums">{site.contact.phoneDisplay}</span>
              <span className="text-xs text-white/60">Пон–Пет {site.contact.businessHours.weekdays}</span>
            </span>
          </a>

          <Link
            href="/#contact"
            className="hidden h-11 items-center rounded-xl bg-accent px-5 text-[15px] font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary lg:inline-flex"
          >
            Свържете се
          </Link>

          <HeaderMobileMenuClient operations={operations} neighborhoods={topNeighborhoods} />
        </div>
      </div>
    </header>
  );
}
