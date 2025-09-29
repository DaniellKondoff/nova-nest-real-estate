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

  // Newsletter form state
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const successTimerRef = useRef<number | null>(null);

  // Back-to-top visibility state
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const scrollTickingRef = useRef<boolean>(false);

  // Email validator – basic format check
  const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Handle form submit – simulate async submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate email
    if (!isValidEmail(email)) {
      setError("Моля, въведете валиден имейл адрес.");
      setSubmitSuccess(false);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // Simulate API request latency
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSubmitSuccess(true);
      setEmail("");

      // Auto-hide success after 3 seconds
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
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
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        {/* Newsletter subscription – centered, gold-tinted card */}
        <section className="mb-12">
          <div className="mx-auto w-full max-w-[600px] rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-6 py-6 lg:px-8 lg:py-8">
            <h3 className="text-xl font-semibold text-white text-center mb-2">Абонирайте се за новини</h3>
            <p className="text-sm text-white/80 text-center mb-5">Получавайте най-новите обяви и новини директно на вашия имейл</p>
            <form onSubmit={handleSubmit} noValidate>
              {/* Input + button: vertical on mobile, horizontal on desktop */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">Имейл адрес</label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Вашият имейл адрес"
                    aria-invalid={!!error}
                    aria-describedby={error ? "newsletter-error" : undefined}
                    className={[
                      "w-full",
                      "rounded-lg border bg-white/10",
                      "border-white/20 text-white placeholder-white/60",
                      "px-4 py-3 text-[15px]",
                      "transition-colors duration-200",
                      "focus:border-[#d4af37] focus:bg-white/15",
                      "focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#1a2642]",
                    ].join(" ")}
                  />
                  {error ? (
                    <p id="newsletter-error" role="alert" className="mt-2 text-sm text-rose-300">
                      {error}
                    </p>
                  ) : null}
                </div>
                <div className="sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={[
                      "w-full sm:w-auto whitespace-nowrap",
                      "rounded-lg px-8 py-3 text-[15px] font-semibold",
                      "bg-gradient-to-r from-[#d4af37] to-[#c49b33] text-[#1a2642]",
                      "shadow-md transition-all duration-200 ease-out",
                      "hover:-translate-y-0.5 hover:shadow-lg hover:from-[#e0bd4d] hover:to-[#e0bd4d]",
                      "active:-translate-y-0 active:shadow",
                      isSubmitting ? "opacity-80 cursor-not-allowed" : "",
                      focusRing,
                    ].join(" ")}
                  >
                    {isSubmitting ? "Изпращане..." : "Абонирай се"}
                  </button>
                </div>
              </div>
              {/* Success message */}
              {submitSuccess ? (
                <p aria-live="polite" className="mt-3 text-sm text-[#e0bd4d]">
                  Благодаря! Абонирахте се успешно.
                </p>
              ) : null}
            </form>
          </div>
        </section>
        {/*
          Responsive grid:
          - Mobile (<768px): 1 column, 40px gap (gap-10)
          - Tablet (768–1023px): 2 columns, 32px col gap & 48px row gap (md:gap-x-8 md:gap-y-12)
          - Desktop (≥1024px): 4 columns, 32px gap (lg:gap-8)
        */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-4 lg:gap-8">
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
                  "hover:text-[#d4af37] hover:scale-110",
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
                  "hover:text-[#d4af37] hover:scale-110",
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
                  "hover:text-[#d4af37] hover:scale-110",
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
                  "hover:text-[#d4af37] hover:scale-110",
                  focusRing,
                ].join(" ")}
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Column 2: Quick Links */}
          <nav aria-labelledby="footer-quick-links">
            <h3 id="footer-quick-links" className="text-base font-semibold mb-5">
              Бързи връзки
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={listLinkBase}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Services */}
          <nav aria-labelledby="footer-services">
            <h3 id="footer-services" className="text-base font-semibold mb-5">
              Услуги
            </h3>
            <ul className="space-y-3">
              {services.map((svc) => (
                <li key={svc.label}>
                  <Link href={svc.href} className={listLinkBase}>
                    {svc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Contact */}
          <section aria-labelledby="footer-contact">
            <h3 id="footer-contact" className="text-base font-semibold mb-5">
              Контакти
            </h3>
            <div className="space-y-4 text-white/80 text-sm">
              {/* Phone */}
              <a
                href="tel:+359XXXXXXXXX"
                className={`flex items-start gap-3 hover:text-white transition-colors duration-200 ${focusRing}`}
                aria-label="Телефон за контакт"
              >
                <Phone className="w-[18px] h-[18px] text-[#d4af37] flex-shrink-0" aria-hidden="true" />
                <span>+359 XXX XXX XXX</span>
              </a>

              {/* Email */}
              <a
                href="mailto:info@novanest.bg"
                className={`flex items-start gap-3 hover:text-white transition-colors duration-200 ${focusRing}`}
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
          "right-6 bottom-6 lg:right-8 lg:bottom-8",
          "rounded-full border border-[rgba(26,38,66,0.1)] shadow-lg",
          "bg-[#d4af37] text-[#1a2642]",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#d4af37]",
          // Size: 44px on mobile, 48px on desktop
          "w-11 h-11 lg:w-12 lg:h-12",
          // Visibility animation
          showBackToTop ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
          // Hover/active elev
          "hover:-translate-y-1 hover:shadow-xl active:-translate-y-0.5 active:shadow-md",
        ].join(" ")}
      >
        <ChevronUp className="w-6 h-6 mx-auto" aria-hidden="true" />
      </button>
    </footer>
  );
}


