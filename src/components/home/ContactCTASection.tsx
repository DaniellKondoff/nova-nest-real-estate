import * as React from "react";
import { CheckCircle, Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { Section, SectionHeading } from "@/components/ui/section";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export interface ContactCTASectionProps {
  className?: string;
  id?: string;
}

const PROMISES = [
  "Отговаряме в рамките на 24 часа",
  "Безплатна първична консултация",
  "Индивидуално отношение към всеки клиент",
];

/**
 * Contact – navy band. Mobile: form first, then big tappable contact rows.
 * Desktop: form (3/5) + contact info (2/5).
 */
export default function ContactCTASection({ className, id }: ContactCTASectionProps): React.ReactElement {
  const rows = [
    { icon: Phone, label: "Телефон", value: site.contact.phoneDisplay, href: `tel:${site.contact.phone}` },
    { icon: Mail, label: "Имейл", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: MapPin, label: "Адрес", value: site.contact.address },
    {
      icon: Clock,
      label: "Работно време",
      value: `Пон–Пет ${site.contact.businessHours.weekdays} · Съб ${site.contact.businessHours.saturday}`,
    },
  ];

  return (
    <Section
      id={id}
      tone="navy"
      aria-labelledby="contact-cta-heading"
      className={cn("relative scroll-mt-[var(--header-h)] overflow-hidden bg-gradient-to-br from-primary via-primary-light to-primary", className)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <SectionHeading
        id="contact-cta-heading"
        eyebrow="Свържете се с нас"
        title="Готови сме да ви помогнем"
        description="Свържете се с нас за безплатна консултация и персонализирани решения."
        inverted
        className="reveal relative"
      />

      <div className="relative grid gap-8 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <ul className="space-y-2" aria-label="Директни методи за контакт">
            {rows.map(({ icon: Icon, label, value, href }) => {
              const inner = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-white/60">{label}</span>
                    <span className="block break-words font-semibold text-white">{value}</span>
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      className="flex min-h-16 items-center gap-4 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:ring-accent/40"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="flex min-h-16 items-center gap-4 rounded-2xl p-3">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <ul className="space-y-3 border-t border-white/10 pt-6">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/85">
                <CheckCircle className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
