"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();

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

  // Handle Escape key to close the mobile menu when open
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
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

  // Framer Motion animation variants
  // Timing constants for link staggering and chained animations
  const linkStagger = prefersReducedMotion ? 0 : 0.08; // 80ms between links
  const linkDelayChildren = prefersReducedMotion ? 0 : 0.1; // first link starts after 100ms
  const linkDuration = prefersReducedMotion ? 0 : 0.4; // 400ms per link
  const linksTotal = linkDelayChildren + linkStagger * Math.max(navItems.length - 1, 0) + linkDuration;
  const dividerDelay = prefersReducedMotion ? 0 : linksTotal + 0.5; // divider after links + 500ms
  const contactDelay = prefersReducedMotion ? 0 : dividerDelay + 0.6; // contact after divider + 600ms

  const overlayVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : -20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : -20,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.2 },
    },
  } as const;

  const linksContainerVariants = {
    hidden: {},
    visible: {
      transition: prefersReducedMotion
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: linkStagger, delayChildren: linkDelayChildren },
    },
  } as const;

  const linkItemVariants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : -30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: linkDuration },
    },
  } as const;

  const dividerVariants = {
    hidden: { opacity: 0, scaleX: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.4, delay: dividerDelay },
    },
  } as const;

  const contactVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.4, delay: contactDelay },
    },
  } as const;

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

      {/* Mobile full-screen overlay menu with Framer Motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            className={[
              // Fixed full-screen container below the header (z-50 header vs z-40 overlay)
              "fixed inset-0 z-40 lg:hidden overflow-auto",
              // Navy background with opacity and glass blur
              "bg-[#1a2642]/[0.98] backdrop-blur-[8px]",
              // GPU-friendly rendering
              "origin-top will-change-transform will-change-opacity transform-gpu",
            ].join(" ")}
          >
            {/* Inner layout container: max width, centered, padded, full-height column */}
            <div className="mx-auto h-full max-w-[400px] px-6 pt-8 flex flex-col justify-between">
              {/* Navigation links */}
              <nav aria-label="Mobile navigation" className="mt-20">
                <motion.ul
                  variants={linksContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-2"
                >
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    const baseLink =
                      "block w-full text-2xl font-semibold rounded-xl px-5 py-4 text-white border-l-4 border-transparent transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]";
                    const hoverLink = "hover:bg-[#d4af37]/10 hover:translate-x-2 hover:scale-[1.02]"; // subtle slide + scale
                    const activeLink = active
                      ? "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]"
                      : "";

                    return (
                      <motion.li
                        key={item.href}
                        variants={linkItemVariants}
                        className="will-change-transform will-change-opacity transform-gpu"
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={[baseLink, hoverLink, activeLink].join(" ")}
                          aria-current={active ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>

              {/* Divider */}
              <motion.hr
                className="my-8 w-full border-t border-[#d4af37]/20 origin-center"
                initial="hidden"
                animate="visible"
                variants={dividerVariants}
                style={{ transformOrigin: "center" }}
              />

              {/* Contact info & CTA */}
              <motion.div
                className="pb-8 will-change-transform will-change-opacity transform-gpu"
                initial="hidden"
                animate="visible"
                variants={contactVariants}
              >
                <a
                  href="tel:+359XXXXXXXXX"
                  className="mb-4 inline-flex items-center gap-3 text-white text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                  aria-label="Позвънете на нашия телефон"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Phone className="w-6 h-6 text-[#d4af37]" aria-hidden="true" />
                  <span>+359 XXX XXX XXX</span>
                </a>

                <div>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c49b33] py-4 text-lg font-semibold text-[#1a2642] shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                    aria-label="Свържете се с нас"
                  >
                    Свържете се
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;


