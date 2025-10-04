"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Clock, ChevronUp, MessageCircle, Home, Building2, Star, Users } from "lucide-react";

/**
 * Footer – Nova Nest Real Estate
 * - Gradient background with gold accents, white text
 * - Responsive grid: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
 * - Accessible markup with semantic <footer>, headings, and focus styles
 */
export default function Footer() {
  // Navigation routes aligned with header
  const quickLinks: { label: string; href: `/${string}` | "/" | `#${string}` }[] = [
    { label: "Начало", href: "/" },
    { label: "За нас", href: "/#about" },
    { label: "Услуги", href: "/#services" },
    { label: "Обяви", href: "/properties" },
    { label: "Контакти", href: "/#contact" },
  ];

  const services: { label: string; icon: any }[] = [
    { label: "Продажба на имоти", icon: Home },
    { label: "Купуване на имоти", icon: Building2 },
    { label: "Наемане", icon: Star },
    { label: "Оценка на имоти", icon: Users },
  ];

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
    <footer className="bg-gradient-to-br from-[#1a2642] to-[#2c3e50] text-white" aria-label="Долна част на сайта">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d78c] bg-clip-text text-transparent mb-2">
                Nova Nest
              </h3>
              <p className="text-sm text-white/80 -mt-1">Real Estate</p>
            </div>
            <p className="text-white/90 mb-6 leading-relaxed">
              Професионални услуги в областта на недвижимите имоти в Стара Загора. 
              Вашият доверен партньор за намиране на перфектното гнездо.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#d4af37]">Бързи връзки</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 text-sm block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#d4af37]">Услуги</h4>
            <ul className="space-y-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <li key={index} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                    <span className="text-white/80 text-sm">{service.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#d4af37]">Контакти</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/90 text-sm">
                    ул. Цар Симеон Велики 123<br />
                    Стара Загора 6000
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-white/90">+359 42 123 456</p>
                  <p className="text-white/80">+359 888 123 456</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-white/90">info@novanest.bg</p>
                  <p className="text-white/80">office@novanest.bg</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 bg-white/20 border-0 h-px" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/80">
            © {currentYear} Nova Nest Real Estate. Всички права запазени.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-white/80 hover:text-[#d4af37] transition-colors duration-200">
              Политика за поверителност
            </Link>
            <Link href="/terms" className="text-white/80 hover:text-[#d4af37] transition-colors duration-200">
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
          "rounded-full border border-white/20 shadow-lg",
          "bg-[#d4af37] text-white",
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


