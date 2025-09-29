"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";

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
  { label: "Имоти", href: "/imoti" },
  { label: "За нас", href: "/za-nas" },
  { label: "Контакт", href: "/kontakt" },
];

/**
 * Desktop-only sticky header for Nova Nest Real Estate.
 * - Navy background with opacity and blur
 * - Three sections: logo, nav, CTA
 * - Adds shadow after 10px scroll (smooth transition)
 * - Hidden on screens smaller than lg breakpoint
 */
const Header: React.FC<HeaderProps> = ({ className, navItems = DEFAULT_NAV_ITEMS }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Track scroll depth to toggle an elevated shadow style
  useEffect(() => {
    const handleScroll = () => {
      // When the page is scrolled more than 10px, we enable the shadow
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      // Cleanup listener on component unmount to prevent leaks
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const headerBase = "sticky top-0 z-50 hidden lg:block transition-shadow duration-300";
  const backgroundStyling =
    // Navy background with 95% opacity + subtle bottom border + glass blur at 8px
    "bg-[#1a2642]/95 backdrop-blur-[8px] border-b border-white/10";
  const shadowStyling = isScrolled ? "shadow-[0_8px_24px_rgba(0,0,0,0.25)]" : "shadow-none";
  const textColor = "text-white font-sans";

  return (
    <header
      className={[headerBase, backgroundStyling, shadowStyling, textColor, className].filter(Boolean).join(" ")}
      role="banner"
    >
      {/* Container with max width 1280px and horizontal padding 24px */}
      <div className="mx-auto max-w-[1280px] px-6" style={{ height: 80 }}>
        {/* Flex layout with three main sections: logo (left), nav (center), cta (right) */}
        <div className="flex h-full items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" aria-label="Nova Nest Real Estate - home" className="outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]/0 rounded">
              <Logo />
            </Link>
          </div>

          {/* Center: Primary navigation */}
          <nav aria-label="Primary" className="flex items-center">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]/0"
                  >
                    <span className="text-[15px] font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: Call-to-action area */}
          <div className="flex items-center gap-3">
            <Link
              href="/imoti"
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]/0"
              aria-label="Виж всички имоти"
            >
              Виж имоти
            </Link>
            <Link
              href="/kontakt"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#1a2642] outline-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]/0"
              aria-label="Свържи се с нас"
            >
              Контакт
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


