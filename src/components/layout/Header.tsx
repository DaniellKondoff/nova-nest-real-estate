"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
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
  { label: "За нас", href: "/about" },
  { label: "Услуги", href: "/services" },
  { label: "Обяви", href: "/properties" },
  { label: "Контакти", href: "/contact" },
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
  // Mobile menu open/close state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  // Track overlay exit to allow closing animation before unmount
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
  // Trigger smooth enter transitions for overlay and links on the next frame after mount
  const [menuEnter, setMenuEnter] = useState<boolean>(false);

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

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      // Ensure scroll is restored if the component unmounts
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Handle Escape key to close the mobile menu when open and coordinate enter/exit animations
  useEffect(() => {
    let exitTimer: number | undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Prepare enter animation: set to hidden then reveal in next frame to animate
      setMenuEnter(false);
      requestAnimationFrame(() => {
        setMenuEnter(true);
      });
      document.addEventListener("keydown", handleKeyDown);
    } else if (!isMobileMenuOpen) {
      // Trigger exit animation and delay unmount by 200ms
      setMenuEnter(false);
      setIsAnimatingOut(true);
      exitTimer = window.setTimeout(() => {
        setIsAnimatingOut(false);
      }, 200);
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (exitTimer) {
        window.clearTimeout(exitTimer);
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Header is visible on all screens; desktop-specific elements are handled per-section
  const headerBase = "sticky top-0 z-50 transition-shadow duration-300";
  const backgroundStyling =
    // Navy background with 95% opacity + subtle bottom border + glass blur at 8px
    "bg-[#1a2642]/95 backdrop-blur-[8px] border-b border-white/10";
  const shadowStyling = isScrolled ? "shadow-[0_8px_24px_rgba(0,0,0,0.25)]" : "shadow-none";
  const textColor = "text-white font-sans";

  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  const shouldRenderMobileMenu = isMobileMenuOpen || isAnimatingOut;

  return (
    <>
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
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const baseClasses =
                  "text-white text-base font-medium px-3 py-2 rounded-md transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]";
                const hoverClasses = "hover:bg-[#d4af37]/10 hover:scale-105";
                const activeClasses =
                  "bg-[#d4af37]/15 text-[#d4af37] font-semibold underline decoration-2 decoration-[#d4af37] underline-offset-4";

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[baseClasses, hoverClasses, active ? activeClasses : ""].join(" ")}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right (mobile): Hamburger menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Затвори меню" : "Отвори меню"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="h-12 w-12 p-2 rounded-lg bg-transparent hover:bg-[#d4af37]/10 transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
            >
              {/* Three lines hamburger that animates into an X when open */}
              <span className="relative flex h-full w-full flex-col items-center justify-center gap-[5px]" aria-hidden="true">
                {/* Top line: rotates 45° and moves to center when open */}
                <span
                  className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "translate-y-[7px] rotate-45" : "translate-y-0 rotate-0"
                  }`}
                />
                {/* Middle line: fades and scales out when open */}
                <span
                  className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                  }`}
                />
                {/* Bottom line: rotates -45° and moves to center when open */}
                <span
                  className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : "translate-y-0 rotate-0"
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Right (desktop): Call-to-action area */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Phone number - hidden on lg, visible on xl */}
            <a
              href="tel:+359XXXXXXXXX"
              className="hidden xl:flex items-center gap-2 text-white transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642] hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]"
              aria-label="Позвънете на нашия телефон"
            >
              <Phone className="w-5 h-5 text-[#d4af37]" aria-hidden="true" />
              <span className="font-medium text-[15px]">+359 XXX XXX XXX</span>
            </a>

            {/* CTA Button */}
            <Link
              href="/contact"
              className="rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c49b33] px-6 py-2.5 text-[15px] font-semibold text-[#1a2642] shadow-md transition-all duration-200 ease-in-out hover:from-[#e0bd4d] hover:to-[#e0bd4d] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
              aria-label="Свържете се с нас"
            >
              Свържете се
            </Link>
          </div>
        </div>
      </div>
      </header>

      {/* Mobile full-screen overlay menu */}
      {shouldRenderMobileMenu && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className={[
            // Fixed full-screen container below the header (z-50 header vs z-40 overlay)
            "fixed inset-0 z-40 lg:hidden overflow-auto",
            // Navy background with opacity and glass blur
            "bg-[#1a2642]/[0.98] backdrop-blur-[8px]",
            // Animate opacity and scale for GPU-accelerated transitions
            "origin-top will-change-transform will-change-opacity",
            menuEnter && isMobileMenuOpen
              ? "opacity-100 scale-100 transition-all duration-300 ease-out"
              : "opacity-0 scale-95 transition-all duration-200 ease-in",
          ].join(" ")}
        >
          {/* Inner layout container: max width, centered, padded, full-height column */}
          <div className="mx-auto h-full max-w-[400px] px-6 pt-8 flex flex-col justify-between">
            {/* Navigation links */}
            <nav aria-label="Mobile navigation" className="mt-20">
              <ul className="flex flex-col gap-2">
                {navItems.map((item, index) => {
                  const active = isActive(item.href);
                  const baseLink =
                    "block w-full text-2xl font-semibold rounded-xl px-5 py-4 text-white border-l-4 border-transparent transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]";
                  const hoverLink = "hover:bg-[#d4af37]/10 hover:translate-x-2"; // 8px to the right
                  const activeLink = active
                    ? "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]"
                    : "";
                  const visibility = menuEnter && isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5";
                  const delay = (index + 1) * 50; // 50ms stagger between links

                  return (
                    <li key={item.href} style={{ transitionDelay: `${delay}ms` }}>
                      <Link
                        href={item.href}
                        onClick={toggleMobileMenu}
                        className={[baseLink, hoverLink, activeLink, visibility].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Divider */}
            <hr className="my-8 w-full border-t border-[#d4af37]/20" />

            {/* Contact info & CTA */}
            <div className="pb-8">
              <a
                href="tel:+359XXXXXXXXX"
                className="mb-4 inline-flex items-center gap-3 text-white text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                aria-label="Позвънете на нашия телефон"
                onClick={toggleMobileMenu}
              >
                <Phone className="w-6 h-6 text-[#d4af37]" aria-hidden="true" />
                <span>+359 XXX XXX XXX</span>
              </a>

              <div>
                <Link
                  href="/contact"
                  onClick={toggleMobileMenu}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c49b33] py-4 text-lg font-semibold text-[#1a2642] shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                  aria-label="Свържете се с нас"
                >
                  Свържете се
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;


