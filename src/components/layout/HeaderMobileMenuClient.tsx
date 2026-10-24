"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { site } from "@/config/site";

interface NavLinkItem {
  label: string;
  href: string;
}

/**
 * Mobile hamburger button + full-screen overlay menu.
 * The overlay is rendered via a React portal (appended to document.body)
 * so it can be a sibling of <header> without requiring a client wrapper.
 */
export default function HeaderMobileMenuClient({ navItems }: { navItems: NavLinkItem[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : (pathname?.startsWith(href) ?? false);

  // Animation timing constants
  const linkStagger = prefersReducedMotion ? 0 : 0.08;
  const linkDelayChildren = prefersReducedMotion ? 0 : 0.1;
  const linkDuration = prefersReducedMotion ? 0 : 0.4;
  const linksTotal = linkDelayChildren + linkStagger * Math.max(navItems.length - 1, 0) + linkDuration;
  const dividerDelay = prefersReducedMotion ? 0 : linksTotal + 0.5;
  const contactDelay = prefersReducedMotion ? 0 : dividerDelay + 0.6;

  const overlayVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : -20 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3 },
    },
    exit: {
      opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : -20,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.2 },
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
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -30 },
    visible: {
      opacity: 1, x: 0,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: linkDuration },
    },
  } as const;

  const dividerVariants = {
    hidden: { opacity: 0, scaleX: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1, scaleX: 1,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: dividerDelay },
    },
  } as const;

  const contactVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1, y: 0,
      transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: contactDelay },
    },
  } as const;

  return (
    <>
      {/* Hamburger button – renders in place inside the header flex row */}
      <div className="flex items-center lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Затвори меню" : "Отвори меню"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          className="h-11 w-11 p-2 rounded-xl bg-transparent hover:bg-accent/10 transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span className="relative flex h-full w-full flex-col items-center justify-center gap-[5px]" aria-hidden="true">
            <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "translate-y-[7px] rotate-45" : "translate-y-0 rotate-0"}`} />
            <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"}`} />
            <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : "translate-y-0 rotate-0"}`} />
          </span>
        </button>
      </div>

      {/* Mobile overlay – appended to document.body via portal */}
      {mounted &&
        createPortal(
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
                  "fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 lg:hidden overflow-y-auto overscroll-contain",
                  "bg-primary/[0.98] backdrop-blur-md",
                  "origin-top will-change-transform will-change-opacity transform-gpu",
                ].join(" ")}
              >
                <div className="mx-auto flex min-h-full max-w-md flex-col justify-between px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                  {/* Navigation links */}
                  <nav aria-label="Мобилна навигация">
                    <motion.ul
                      variants={linksContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col gap-2"
                    >
                      {navItems.map((item) => {
                        const active = isActive(item.href);
                        const baseLink =
                          "flex min-h-14 w-full items-center text-xl font-semibold rounded-xl px-5 py-3 text-white border-l-4 border-transparent transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary";
                        const hoverLink = "hover:bg-accent/10 active:bg-accent/15";
                        const activeLink = active ? "bg-accent/15 text-accent border-accent" : "";
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
                    className="my-8 w-full border-t border-accent/20 origin-center"
                    initial="hidden"
                    animate="visible"
                    variants={dividerVariants}
                    style={{ transformOrigin: "center" }}
                  />

                  {/* Contact info & CTA */}
                  <motion.div
                    className="will-change-transform will-change-opacity transform-gpu"
                    initial="hidden"
                    animate="visible"
                    variants={contactVariants}
                  >
                    <a
                      href={`tel:${site.contact.phone}`}
                      className="mb-4 flex min-h-12 items-center gap-3 rounded-xl px-1 text-white text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                      aria-label="Позвънете на нашия телефон"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Phone className="w-6 h-6 text-accent" aria-hidden="true" />
                      <span>{site.contact.phoneDisplay}</span>
                    </a>
                    <div>
                      <Link
                        href="/#contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-accent py-4 text-lg font-semibold text-primary shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                        aria-label="Свържете се с нас"
                      >
                        Свържете се
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
