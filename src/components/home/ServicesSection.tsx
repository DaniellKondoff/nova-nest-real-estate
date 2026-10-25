import React from "react";
import { Building2, Check, FileText, Home, KeyRound, MessageCircle, Phone, ShoppingCart, TrendingUp } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const SERVICES_DATA = [
  {
    id: "property-sales",
    icon: ShoppingCart,
    title: "Продажба на имоти",
    description: "Професионална помощ при продажбата на вашия имот с максимална цена и бързи срокове",
    features: ["Оценка на имота", "Маркетинг стратегия", "Договаряне на цената"],
  },
  {
    id: "property-purchase",
    icon: Home,
    title: "Покупка на имоти",
    description: "Намираме перфектния дом според вашите критерии и бюджет",
    features: ["Персонализирано търсене", "Правни проверки", "Съпровождане до сделката"],
  },
  {
    id: "property-rental",
    icon: KeyRound,
    title: "Отдаване под наем",
    description: "Управление на вашия имот и намиране на надеждни наематели",
    features: ["Скрининг на наематели", "Договори за наем", "Управление на имота"],
  },
  {
    id: "property-leasing",
    icon: Building2,
    title: "Наемане на имоти",
    description: "Богат избор от апартаменти и къщи за наем в различни райони",
    features: ["Верифицирани имоти", "Гъвкави условия", "Бърза процедура"],
  },
  {
    id: "market-consulting",
    icon: TrendingUp,
    title: "Консултации и пазарен анализ",
    description: "Споделяме експертни съвети и пазарни тенденции, за да вземете информирано решение.",
    features: ["Пазарни тенденции", "Анализ на цените", "Експертни препоръки"],
  },
  {
    id: "legal-support",
    icon: FileText,
    title: "Правна подкрепа",
    description: "Пълно юридическо обслужване при сделки с недвижими имоти",
    features: ["Проверка на документи", "Изготвяне на договори", "Нотариални услуги"],
  },
] as const;

/** Services – server component. Mobile: compact cards with icon + title on one row. */
export default function ServicesSection({ id }: { id?: string }) {
  return (
    <Section id={id || "services"} aria-labelledby="services-heading" className="scroll-mt-[var(--header-h)]">
      <SectionHeading
        id="services-heading"
        eyebrow="Нашите услуги"
        title="Професионални услуги за недвижими имоти"
        description="Пълен спектър от услуги с професионален подход и персонализирано обслужване."
        className="reveal"
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {SERVICES_DATA.map(({ id: serviceId, icon: Icon, title, description, features }) => (
          <li
            key={serviceId}
            aria-labelledby={`service-${serviceId}`}
            className="reveal group flex flex-col rounded-card border border-border bg-white p-5 shadow-card transition-[box-shadow,border-color] hover:border-accent/40 hover:shadow-lift sm:p-7"
          >
            <div className="flex items-center gap-4 sm:flex-col sm:items-start">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary transition-colors group-hover:bg-accent sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 text-accent transition-colors group-hover:text-primary sm:h-7 sm:w-7" aria-hidden="true" />
              </span>
              <h3 id={`service-${serviceId}`} className="text-lg font-bold leading-snug text-primary sm:text-xl">
                {title}
              </h3>
            </div>
            <p className="mt-3 leading-relaxed text-charcoal/75">{description}</p>
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm font-medium text-charcoal">
                  <Check className="h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="reveal mt-10 flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-accent to-accent-dark px-6 py-10 text-center sm:mt-14 md:flex-row md:justify-between md:px-12 md:text-left">
        <div>
          <h3 className="text-h3 font-bold text-primary sm:text-2xl">Не намирате това, което търсите?</h3>
          <p className="mt-2 max-w-xl text-primary/80">
            Свържете се с нас за безплатна консултация – ще намерим най-доброто решение за вас.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <a href="#contact">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Безплатна консултация
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full border-primary/30 bg-white/30 sm:w-auto">
            <a href={`tel:${site.contact.phone}`}>
              <Phone className="h-5 w-5" aria-hidden="true" />
              Обадете се
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
}
