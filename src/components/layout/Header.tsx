import Link from "next/link";
import { Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { containerClass } from "@/components/ui/section";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import HeaderScrollClient from "./HeaderScrollClient";
import HeaderMobileMenuClient from "./HeaderMobileMenuClient";

interface NavLinkItem {
  label: string;
  href: string;
}

interface HeaderProps {
  /** Optional extra class names for the outer header container */
  className?: string;
  /** Navigation links to render in the center section */
  navItems?: NavLinkItem[];
}

const DEFAULT_NAV_ITEMS: NavLinkItem[] = [
  { label: "Начало", href: "/" },
  { label: "Имоти", href: "/properties/" },
  { label: "За нас", href: "/#about" },
  { label: "Услуги", href: "/#services" },
  { label: "Контакти", href: "/#contact" },
];

/**
 * Sticky site header (server component).
 * - Height follows the --header-h CSS var (64px mobile, 80px desktop)
 * - Scroll shadow handled by HeaderScrollClient (client island)
 * - Mobile menu handled by HeaderMobileMenuClient (client island via portal)
 */
export default function Header({ className, navItems = DEFAULT_NAV_ITEMS }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10 bg-primary/95 text-white backdrop-blur-md supports-[backdrop-filter]:bg-primary/90",
        className
      )}
      role="banner"
    >
      <HeaderScrollClient />

      <div className={cn(containerClass, "flex h-[var(--header-h)] items-center justify-between gap-4")}>
        <Logo size="md" priority className="lg:[&>img]:h-12" />

        {/* Desktop navigation – server-rendered for SEO */}
        <nav className="hidden lg:block" aria-label="Основна навигация">
          <ul className="flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-[15px] font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          {/* Phone: icon button on mobile/tablet, full number on xl */}
          <a
            href={`tel:${site.contact.phone}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:w-auto xl:gap-2 xl:px-3"
            aria-label={`Обадете се: ${site.contact.phoneDisplay}`}
          >
            <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="hidden text-[15px] font-medium xl:inline">{site.contact.phoneDisplay}</span>
          </a>

          <Link
            href="/#contact"
            className="hidden h-11 items-center rounded-xl bg-accent px-5 text-[15px] font-semibold text-primary shadow-gold transition-colors hover:bg-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary lg:inline-flex"
          >
            Свържете се
          </Link>

          <HeaderMobileMenuClient navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
