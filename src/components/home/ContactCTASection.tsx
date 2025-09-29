"use client";

import * as React from "react";
import { cn } from "@/lib/design-tokens";
import { Heading, Text } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";

export interface ContactCTASectionProps {
  className?: string;
  showForm?: boolean; // Toggle form visibility
  compactMode?: boolean; // Reduced padding variant
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
}: ContactCTASectionProps): React.ReactElement {
  const verticalPadding = compactMode ? "py-12 md:py-16" : "py-20 md:py-24";

  return (
    <section
      aria-labelledby="contact-cta-heading"
      className={cn(
        "relative w-full",
        // 135deg gradient approximation using to-br
        "bg-gradient-to-br from-[#1a2642] to-[#2c3e50]",
        verticalPadding,
        className
      )}
    >
      {/* Optional subtle pattern/overlay for depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,#ffffff,transparent_30%),radial-gradient(circle_at_80%_30%,#ffffff,transparent_25%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header Area */}
        <div className="mx-auto max-w-3xl text-center">
          <Heading
            as="h2"
            id="contact-cta-heading"
            size="h2"
            weight="semibold"
            color="white"
            className="tracking-[-0.02em]"
          >
            Готови сме да ви помогнем
          </Heading>
          <Text
            as="p"
            size="lg"
            color="white"
            align="center"
            className="mt-4 text-white/85"
          >
            Нашият екип от експерти е на ваше разположение. Свържете се с нас за безплатна консултация.
          </Text>
        </div>

        {/* Grid Layout */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-5">
          {/* Form Area – left (60%) */}
          <div className="lg:col-span-3">
            {showForm ? (
              <Card
                variant="elevated"
                className={cn(
                  "bg-white/95 backdrop-blur-sm",
                  "focus-within:ring-2 focus-within:ring-[#d4af37] focus-within:ring-offset-2 focus-within:ring-offset-transparent"
                )}
              >
                <div className="p-6 md:p-8">
                  {/* Placeholder for ContactForm component to be integrated next */}
                  <div className="rounded-md border border-[#cbd5e1] bg-white p-6 md:p-8 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#1a2642] leading-tight">
                          Формуляр за контакт
                        </h3>
                        <p className="mt-2 text-[#475569]">
                          Тук ще бъде интегриран компонентът за контактна форма.
                        </p>
                      </div>
                      <div className="hidden sm:block" aria-hidden="true">
                        <ArrowRight className="h-6 w-6 text-[#d4af37]" />
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="h-11 rounded-md border border-[#cbd5e1] bg-white/60" />
                      <div className="h-11 rounded-md border border-[#cbd5e1] bg-white/60" />
                      <div className="h-11 rounded-md border border-[#cbd5e1] bg-white/60 sm:col-span-2" />
                      <div className="h-24 rounded-md border border-[#cbd5e1] bg-white/60 sm:col-span-2" />
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Button className="bg-[#d4af37] text-white hover:bg-[#b8960e] focus-visible:ring-[#d4af37]">
                        Изпрати запитване
                      </Button>
                      <Button variant="secondary" className="border-white/30 text-white bg-transparent hover:bg-[#d4af37] hover:text-white">
                        Обади се директно
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="rounded-md border border-white/20 bg-white/10 p-6 md:p-8 text-white">
                <p>Формулярът е скрит (showForm=false). Тук ще бъде вмъкнат компонентът.</p>
              </div>
            )}
          </div>

          {/* Contact Info – right (40%) */}
          <div className="lg:col-span-2">
            <div className="space-y-10">
              {/* Direct Contact Methods */}
              <div>
                <h3 className="text-white text-xl font-semibold leading-tight">Бърз контакт</h3>
                <ul className="mt-4 space-y-6" aria-label="Директни методи за контакт">
                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15">
                      <Phone className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                    </span>
                    <div className="text-white">
                      <p className="font-medium">Телефон</p>
                      <p className="text-white/85">+359 XXX XXX XXX</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15">
                      <Mail className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                    </span>
                    <div className="text-white">
                      <p className="font-medium">Имейл</p>
                      <p className="text-white/85">info@novanest.bg</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15">
                      <MapPin className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                    </span>
                    <div className="text-white">
                      <p className="font-medium">Адрес</p>
                      <p className="text-white/85">ул. [Адрес], Стара Загора 6000</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Trust Indicators */}
              <div>
                <h3 className="text-white text-xl font-semibold leading-tight">С какво помагаме</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-md border border-white/15 bg-white/5 p-4 text-white">
                    <div className="inline-flex items-center gap-2 text-white">
                      <div className="h-2 w-2 rounded-full bg-[#d4af37]" aria-hidden="true" />
                      <span className="font-medium">Отговаряме в рамките на 24 часа</span>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/15 bg-white/5 p-4 text-white">
                    <div className="inline-flex items-center gap-2 text-white">
                      <div className="h-2 w-2 rounded-full bg-[#d4af37]" aria-hidden="true" />
                      <span className="font-medium">Безплатна първична консултация</span>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/15 bg-white/5 p-4 text-white">
                    <div className="inline-flex items-center gap-2 text-white">
                      <div className="h-2 w-2 rounded-full bg-[#d4af37]" aria-hidden="true" />
                      <span className="font-medium">Сертифицирани експерти</span>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/15 bg-white/5 p-4 text-white">
                    <div className="inline-flex items-center gap-2 text-white">
                      <div className="h-2 w-2 rounded-full bg-[#d4af37]" aria-hidden="true" />
                      <span className="font-medium">Над 10 години опит</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-white text-xl font-semibold leading-tight">Работно време</h3>
                <div className="mt-4 flex items-start gap-4 text-white">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15">
                    <Clock className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-white/90">Понеделник - Петък: 9:00 - 18:00</p>
                    <p className="text-white/90">Събота: 10:00 - 15:00</p>
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


