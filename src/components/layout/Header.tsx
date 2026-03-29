import Link from "next/link";
import { Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { site } from "@/config/site";
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
  { label: "Имоти", href: "/properties" },
  { label: "За нас", href: "/#about" },
  { label: "Услуги", href: "/#services" },
  { label: "Контакти", href: "/#contact" },
];

/**
 * Desktop-only sticky header for Nova Nest Real Estate.
 * - Navy background with opacity and blur
 * - Three sections: logo, nav, CTA
 * - Scroll shadow handled by HeaderScrollClient (client island)
 * - Mobile menu handled by HeaderMobileMenuClient (client island via portal)
 */
export default function Header({ className, navItems = DEFAULT_NAV_ITEMS }: HeaderProps) {
  const headerBase = "sticky top-0 left-0 right-0 z-50 transition-shadow duration-300 w-full";
  const backgroundStyling = "bg-[#1a2642]/95 backdrop-blur-[8px] border-b border-white/10";
  const textColor = "text-white font-sans";

  return (
    <header
      className={[headerBase, backgroundStyling, textColor, className].filter(Boolean).join(" ")}
      role="banner"
    >
      {/* Client island: adds box-shadow on scroll via an absolute overlay */}
      <HeaderScrollClient />

      {/* Container with max width 1280px and horizontal padding 24px */}
      <div className="mx-auto max-w-[1280px] px-6" style={{ height: 80 }}>
        {/* Flex layout: logo (left) | nav (center) | cta (right) */}
        <div className="flex h-full items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <div className="lg:hidden">
              <Logo size="md" priority />
            </div>
            <div className="hidden lg:block">
              <Logo size="lg" priority />
            </div>
          </div>

          {/* Center: Desktop navigation – server-rendered for SEO */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white text-base font-medium px-3 py-2 rounded-md transition-all duration-200 ease-in-out hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: mobile hamburger (client) + desktop CTA (SSR) */}
          <div className="flex items-center gap-4">
            {/* Client island: hamburger button + mobile overlay portal */}
            <HeaderMobileMenuClient navItems={navItems} />

            {/* Desktop CTA – server-rendered */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={`tel:${site.contact.phone}`}
                className="hidden xl:flex items-center gap-2 text-white transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642] hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]"
                aria-label="Позвънете на нашия телефон"
              >
                <Phone className="w-5 h-5 text-[#d4af37]" aria-hidden="true" />
                <span className="font-medium text-[15px]">{site.contact.phoneDisplay}</span>
              </a>
              <Link
                href="/#contact"
                className="rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c49b33] px-6 py-2.5 text-[15px] font-semibold text-[#1a2642] shadow-md transition-all duration-200 ease-in-out hover:from-[#e0bd4d] hover:to-[#e0bd4d] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                aria-label="Свържете се с нас"
              >
                Свържете се
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
