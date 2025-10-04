"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Clock, ChevronUp, MessageCircle } from "lucide-react";

/**
 * Footer – Nova Nest Real Estate
 * - Navy background, gold accents, white text
 * - Responsive grid: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
 * - Accessible markup with semantic <footer>, headings, and focus styles
 */
export default function Footer() {
  // Navigation routes aligned with header
  const quickLinks: { label: string; href: `/${string}` | "/" }[] = [
    { label: "Начало", href: "/" },
    { label: "За нас", href: "/about" },
    { label: "Услуги", href: "/services" },
    { label: "Обяви", href: "/properties" },
    { label: "Контакти", href: "/contact" },
  ];

  const services: { label: string; href: `/${string}` }[] = [
    { label: "Продажба", href: "/services" },
    { label: "Покупка", href: "/services" },
    { label: "Наем", href: "/services" },
    { label: "Оценка", href: "/services" },
    { label: "Консултации", href: "/services" },
  ];

  // Reusable focus ring classes (gold ring with navy offset)
  const focusRing =
    "outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]";

  // Link base styles for lists (dimmed white, slide on hover)
  const listLinkBase =
    `text-white/80 text-sm transition-all duration-200 ease-out hover:text-[#d4af37] hover:translate-x-1 ${focusRing}`;


  // Back-to-top visibility state
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const scrollTickingRef = useRef<boolean>(false);


  // Back-to-top scroll listener with lightweight throttle
  useEffect(() => {
    const onScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;
      window.requestAnimationFrame(() => {
        setShowBackToTop(window.scrollY > 300);
        scrollTickingRef.current = false;
      });
    };

    // Run once to initialize
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dynamic year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1a2642] text-white font-sans" aria-label="Долна част на сайта">
      {/*
        Container: centered with max width 1280px, horizontal padding 24px.
        Vertical padding: 48px on mobile (py-12), 64px on desktop (lg:py-16).
      */}
      <div className="mx-auto max-w-[1280px] px-5 md:px-6 py-10 md:py-12 lg:py-16 2xl:max-w-[1440px]">
        {/* Grid: mobile-first single column; tablet 2 cols (24px col / 40px row); desktop 4 cols (32px gap) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-6 md:gap-y-10 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Company Info */}
          <section aria-labelledby="footer-company" className="space-y-4">
            {/* Logo: light variant, small size for footer, no priority (below fold) */}
            <div className="mb-4">
              <Logo variant="light" size="sm" priority={false} />
            </div>

            {/* Company description: dimmed white, max width 250px */}
            <p className="text-white/80 text-sm leading-relaxed max-w-[250px]">
              Вашият надежден партньор за недвижими имоти в Стара Загора
            </p>

            {/* Social media icons: larger tap targets with hover scale/color */}
            <div className="mt-6 flex items-center gap-3" aria-label="Социални мрежи">
              <Link
                href="https://facebook.com/novanest"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Фейсбук (отваря в нов раздел)"
                className={[
                  "w-10 h-10 inline-flex items-center justify-center rounded-md",
                  "text-white/80 transition-all duration-200",
                  "hover:text-[#d4af37] hover:scale-110 active:scale-95 active:opacity-80",
                  focusRing,
                ].join(" ")}
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://instagram.com/novanest"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Инстаграм (отваря в нов раздел)"
                className={[
                  "w-10 h-10 inline-flex items-center justify-center rounded-md",
                  "text-white/80 transition-all duration-200",
                  "hover:text-[#d4af37] hover:scale-110 active:scale-95 active:opacity-80",
                  focusRing,
                ].join(" ")}
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://linkedin.com/company/novanest"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Линкедин (отваря в нов раздел)"
                className={[
                  "w-10 h-10 inline-flex items-center justify-center rounded-md",
                  "text-white/80 transition-all duration-200",
                  "hover:text-[#d4af37] hover:scale-110 active:scale-95 active:opacity-80",
                  focusRing,
                ].join(" ")}
              >
                <Linkedin className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://wa.me/359XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="УотсАп (отваря в нов раздел)"
                className={[
                  "w-10 h-10 inline-flex items-center justify-center rounded-md",
                  "text-white/80 transition-all duration-200",
                  "hover:text-[#d4af37] hover:scale-110 active:scale-95 active:opacity-80",
                  focusRing,
                ].join(" ")}
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Column 2: Quick Links */}
          <nav aria-labelledby="footer-quick-links">
            <h3 id="footer-quick-links" className="text-[15px] md:text-base font-semibold mb-4 md:mb-5">
              Бързи връзки
            </h3>
            <ul className="space-y-2.5 md:space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={[listLinkBase, "inline-flex items-center px-3 py-2 min-h-[44px]"].join(" ")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Services */}
          <nav aria-labelledby="footer-services">
            <h3 id="footer-services" className="text-[15px] md:text-base font-semibold mb-4 md:mb-5">
              Услуги
            </h3>
            <ul className="space-y-2.5 md:space-y-3">
              {services.map((svc) => (
                <li key={svc.label}>
                  <Link href={svc.href} className={[listLinkBase, "inline-flex items-center px-3 py-2 min-h-[44px]"].join(" ")}>
                    {svc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Contact */}
          <section aria-labelledby="footer-contact">
            <h3 id="footer-contact" className="text-[15px] md:text-base font-semibold mb-4 md:mb-5">
              Контакти
            </h3>
            <div className="space-y-4 text-white/80 text-sm">
              {/* Phone */}
              <a
                href="tel:+359XXXXXXXXX"
                className={`flex items-start gap-3 hover:text-white transition-colors duration-200 active:opacity-80 ${focusRing}`}
                aria-label="Телефон за контакт"
              >
                <Phone className="w-[18px] h-[18px] text-[#d4af37] flex-shrink-0" aria-hidden="true" />
                <span>+359 XXX XXX XXX</span>
              </a>

              {/* Email */}
              <a
                href="mailto:info@novanest.bg"
                className={`flex items-start gap-3 hover:text-white transition-colors duration-200 active:opacity-80 ${focusRing}`}
                aria-label="Имейл адрес"
              >
                <Mail className="w-[18px] h-[18px] text-[#d4af37] flex-shrink-0" aria-hidden="true" />
                <span>info@novanest.bg</span>
              </a>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-[18px] h-[18px] text-[#d4af37] flex-shrink-0" aria-hidden="true" />
                <span>ул. [Адрес], Стара Загора 6000</span>
              </div>

              {/* Working hours */}
              <div className="flex items-start gap-3">
                <Clock className="w-[18px] h-[18px] text-[#d4af37] flex-shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <p>Пон - Пет: 9:00 - 18:00</p>
                  <p>Събота: 10:00 - 15:00</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Divider between main footer and copyright */}
        <hr className="my-8 md:my-12 w-full border-t border-[#d4af37]/20" />

        {/*
          Copyright:
          - Mobile: centered column
          - Desktop: row with space-between
        */}
        <div className="flex flex-col items-center text-center gap-4 md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-white/60">
            © {currentYear} Nova Nest Real Estate. Всички права запазени.
          </p>

          {/* Legal links – hidden on mobile, visible on desktop */}
          <div className="hidden md:flex items-center text-sm text-white/60">
            <Link href="/privacy" className={`transition-colors duration-200 hover:text-[#d4af37] ${focusRing}`}>
              Политика за поверителност
            </Link>
            <span className="px-2" aria-hidden>
              |
            </span>
            <Link href="/terms" className={`transition-colors duration-200 hover:text-[#d4af37] ${focusRing}`}>
              Условия за ползване
            </Link>
          </div>
        </div>
      </div>

      {/* Back-to-top floating button */}
      <button
        type="button"
        onClick={handleBackToTop}
        aria-label="Върни се в началото"
        className={[
          "fixed z-40",
          // Mobile-first positioning
          "right-5 bottom-5 lg:right-8 lg:bottom-8",
          "rounded-full border border-[rgba(26,38,66,0.1)] shadow-lg",
          "bg-[#d4af37] text-[#1a2642]",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#d4af37]",
          // Size: 44px on mobile, 48px on desktop
          "w-11 h-11 lg:w-12 lg:h-12",
          // Visibility animation
          showBackToTop ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
          // Hover/active elev
          "hover:-translate-y-1 hover:shadow-xl active:scale-95 active:opacity-80 active:-translate-y-0.5 active:shadow-md",
        ].join(" ")}
      >
        <ChevronUp className="w-6 h-6 mx-auto" aria-hidden="true" />
      </button>
    </footer>
  );
}


