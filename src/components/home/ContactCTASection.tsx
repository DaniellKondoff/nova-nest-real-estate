"use client";

import * as React from "react";
import { cn } from "@/lib/design-tokens";
import { Heading, Text } from "@/components/ui/typography";
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle, Star } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { site } from "@/config/site";

export interface ContactCTASectionProps {
  className?: string;
  showForm?: boolean; // Toggle form visibility
  compactMode?: boolean; // Reduced padding variant
  id?: string; // Optional id for anchor navigation
}

/**
 * ContactCTASection – Encourages visitors to get in touch with clear actions.
 * - Navy gradient background (135deg): from #1a2642 to #2c3e50
 * - Two-column layout on desktop (form left 60%, info right 40%)
 * - Accessible structure with semantic headings
 */
export default function ContactCTASection({
  className,
  showForm = true,
  compactMode = false,
  id,
}: ContactCTASectionProps): React.ReactElement {
  const verticalPadding = compactMode ? "py-16 md:py-20" : "py-24 md:py-32";

  // Generate mailto with pre-filled subject and body
  const mailtoUrl = `mailto:${site.contact.email}?subject=${encodeURIComponent('Запитване за недвижими имоти - Nova Nest')}&body=${encodeURIComponent('Здравейте,\n\nИнтересувам се от вашите услуги за недвижими имоти.\n\nМоля, свържете се с мен за повече информация.\n\nБлагодаря!')}`;

  // Debug logging
  React.useEffect(() => {
    console.log('ContactCTASection loaded with:', {
      phone: site.contact.phone,
      phoneDisplay: site.contact.phoneDisplay,
      email: site.contact.email,
      mailtoUrl: mailtoUrl
    });
  }, []);

  return (
    <section
      id={id}
      aria-labelledby="contact-cta-heading"
      className={cn(
        "relative w-full overflow-hidden",
        // Enhanced gradient with more depth
        "bg-gradient-to-br from-[#1a2642] via-[#2c3e50] to-[#1a2642]",
        verticalPadding,
        "scroll-mt-[80px]",
        className
      )}
    >
      {/* Enhanced background pattern with animated elements */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Primary pattern */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_20%,#ffffff,transparent_40%),radial-gradient(circle_at_80%_30%,#ffffff,transparent_35%)]" />
        {/* Secondary pattern for depth */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_60%_80%,#d4af37,transparent_30%)]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,transparent_98%,rgba(255,255,255,0.1)_100%),linear-gradient(0deg,transparent_98%,rgba(255,255,255,0.1)_100%)] bg-[length:20px_20px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Area with enhanced styling */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Star className="h-4 w-4 text-[#d4af37]" />
            <span>Професионални услуги</span>
          </div>
          
          <Heading
            as="h2"
            id="contact-cta-heading"
            size="h2"
            weight="semibold"
            color="white"
            className="tracking-[-0.02em] mb-6"
          >
            Готови сме да ви помогнем
          </Heading>
          <Text
            as="p"
            size="xl"
            color="white"
            align="center"
            className="mx-auto max-w-2xl text-white/90 leading-relaxed"
          >
            Нашият екип от експерти е на ваше разположение. Свържете се с нас за безплатна консултация и персонализирани решения.
          </Text>
        </div>

        {/* Grid Layout with enhanced spacing */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-5 lg:gap-16">
          {/* Form Area – left (60%) */}
          <div className="lg:col-span-3">
            {showForm ? (
              <div className="relative">
                {/* Form container with enhanced styling */}
                <div className="relative rounded-2xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl ring-1 ring-white/20">
                  {/* Subtle accent border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/20 to-transparent p-[1px]">
                    <div className="h-full w-full rounded-2xl bg-white/95" />
                  </div>
                  <div className="relative">
                    <ContactForm
                      onSubmit={async (data) => {
                        // eslint-disable-next-line no-console
                        console.log("CTA submit:", data);
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-white backdrop-blur-sm">
                <p>Формулярът е скрит (showForm=false). Тук ще бъде вмъкнат компонентът.</p>
              </div>
            )}
          </div>

          {/* Contact Info – right (40%) */}
          <div className="lg:col-span-2">
            <div className="space-y-12">
              {/* Direct Contact Methods */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-6 ring-1 ring-white/10">
                <h3 className="text-white text-xl font-semibold leading-tight mb-6 flex items-center gap-2">
                  <div className="h-1 w-8 bg-[#d4af37] rounded-full" />
                  Бърз контакт
                </h3>
                <ul className="space-y-6" aria-label="Директни методи за контакт">
                  <li className="group flex items-start gap-4 transition-all duration-200 hover:translate-x-1">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30 transition-all duration-200 group-hover:bg-[#d4af37]/30 group-hover:scale-105">
                      <Phone className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                    </span>
                    <div className="text-white">
                      <p className="font-semibold text-white">Телефон</p>
                      <p className="text-white/85 mt-1">{site.contact.phoneDisplay}</p>
                    </div>
                  </li>
                  <li className="group flex items-start gap-4 transition-all duration-200 hover:translate-x-1">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30 transition-all duration-200 group-hover:bg-[#d4af37]/30 group-hover:scale-105">
                      <Mail className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                    </span>
                    <div className="text-white">
                      <p className="font-semibold text-white">Имейл</p>
                      <p className="text-white/85 mt-1">{site.contact.email}</p>
                    </div>
                  </li>
                  <li className="group flex items-start gap-4 transition-all duration-200 hover:translate-x-1">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30 transition-all duration-200 group-hover:bg-[#d4af37]/30 group-hover:scale-105">
                      <MapPin className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                    </span>
                    <div className="text-white">
                      <p className="font-semibold text-white">Адрес</p>
                      <p className="text-white/85 mt-1">{site.contact.address}</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Trust Indicators */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-6 ring-1 ring-white/10">
                <h3 className="text-white text-xl font-semibold leading-tight mb-6 flex items-center gap-2">
                  <div className="h-1 w-8 bg-[#d4af37] rounded-full" />
                  С какво помагаме
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="group rounded-xl border border-white/15 bg-white/5 p-4 text-white transition-all duration-200 hover:bg-white/10 hover:border-white/25">
                    <div className="flex items-center gap-3 text-white">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30">
                        <CheckCircle className="h-3 w-3 text-[#d4af37]" aria-hidden="true" />
                      </div>
                      <span className="font-medium">Отговаряме в рамките на 24 часа</span>
                    </div>
                  </div>
                  <div className="group rounded-xl border border-white/15 bg-white/5 p-4 text-white transition-all duration-200 hover:bg-white/10 hover:border-white/25">
                    <div className="flex items-center gap-3 text-white">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30">
                        <CheckCircle className="h-3 w-3 text-[#d4af37]" aria-hidden="true" />
                      </div>
                      <span className="font-medium">Безплатна първична консултация</span>
                    </div>
                  </div>
                  <div className="group rounded-xl border border-white/15 bg-white/5 p-4 text-white transition-all duration-200 hover:bg-white/10 hover:border-white/25">
                    <div className="flex items-center gap-3 text-white">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30">
                        <CheckCircle className="h-3 w-3 text-[#d4af37]" aria-hidden="true" />
                      </div>
                      <span className="font-medium">Индивидуално отношение към всеки клиент</span>
                    </div>
                  </div>
                  <div className="group rounded-xl border border-white/15 bg-white/5 p-4 text-white transition-all duration-200 hover:bg-white/10 hover:border-white/25">
                    <div className="flex items-center gap-3 text-white">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37]/20 ring-1 ring-[#d4af37]/30">
                        <CheckCircle className="h-3 w-3 text-[#d4af37]" aria-hidden="true" />
                      </div>
                      <span className="font-medium">Опит, който личи във всеки детайл</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


