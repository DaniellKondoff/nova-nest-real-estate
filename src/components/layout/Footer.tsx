import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Clock } from "lucide-react";

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

  return (
    <footer className="w-full bg-[#1a2642] text-white font-sans" aria-label="Долна част на сайта">
      {/*
        Container: centered with max width 1280px, horizontal padding 24px.
        Vertical padding: 48px on mobile (py-12), 64px on desktop (lg:py-16).
      */}
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
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

            {/* Social media icons: horizontal with 16px gap */}
            <div className="mt-6 flex items-center gap-4" aria-label="Социални мрежи">
              <Link
                href="#"
                aria-label="Фейсбук"
                className={`text-white/80 transition-colors duration-200 hover:text-[#d4af37] ${focusRing}`}
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="#"
                aria-label="Инстаграм"
                className={`text-white/80 transition-colors duration-200 hover:text-[#d4af37] ${focusRing}`}
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="#"
                aria-label="Линкедин"
                className={`text-white/80 transition-colors duration-200 hover:text-[#d4af37] ${focusRing}`}
              >
                <Linkedin className="w-5 h-5" aria-hidden="true" />
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
            © 2024 Nova Nest Real Estate. Всички права запазени.
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
    </footer>
  );
}


