import React from "react";
import { Card } from "@/components/ui/card";
import {
  Home,
  ShoppingCart,
  KeyRound,
  Building2,
  TrendingUp,
  FileText,
  CheckCircle,
  Star,
} from "lucide-react";
import { ServicesCTAButton } from "./ServicesCTAButton";

const SERVICES_DATA = [
  {
    id: "property-sales",
    icon: ShoppingCart,
    title: "Продажба на имоти",
    description: "Професионална помощ при продажбата на вашия имот с максимална цена и бързи срокове",
    features: ["Оценка на имота", "Маркетинг стратегия", "Договаряне на цената"],
    ariaLabel: "Услуги за продажба на недвижими имоти"
  },
  {
    id: "property-purchase",
    icon: Home,
    title: "Покупка на имоти",
    description: "Намираме перфектния дом според вашите критерии и бюджет",
    features: ["Персонализирано търсене", "Правни проверки", "Съпровождане до сделката"],
    ariaLabel: "Услуги за покупка на недвижими имоти"
  },
  {
    id: "property-rental",
    icon: KeyRound,
    title: "Отдаване под наем",
    description: "Управление на вашия имот и намиране на надеждни наематели",
    features: ["Скрининг на наематели", "Договори за наем", "Управление на имота"],
    ariaLabel: "Услуги за отдаване на имоти под наем"
  },
  {
    id: "property-leasing",
    icon: Building2,
    title: "Наемане на имоти",
    description: "Богат избор от апартаменти и къщи за наем в различни райони",
    features: ["Верифицирани имоти", "Гъвкави условия", "Бърза процедура"],
    ariaLabel: "Услуги за наемане на недвижими имоти"
  },
  {
    id: "market-consulting",
    icon: TrendingUp,
    title: "Консултации и пазарен анализ",
    description: "Споделяме експертни съвети и пазарни тенденции, за да вземете информирано решение.",
    features: ["Пазарни тенденции", "Анализ на цените", "Експертни препоръки"],
    ariaLabel: "Услуги за консултации и пазарен анализ на недвижими имоти"
  },
  {
    id: "legal-support",
    icon: FileText,
    title: "Правна подкрепа",
    description: "Пълно юридическо обслужване при сделки с недвижими имоти",
    features: ["Проверка на документи", "Изготвяне на договори", "Нотариални услуги"],
    ariaLabel: "Правни услуги за недвижими имоти"
  },
] as const;

const ServiceCard = ({
  service,
}: {
  service: (typeof SERVICES_DATA)[number];
}) => {
  const Icon = service.icon;

  return (
    <Card
      className="group relative p-8 h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden"
      role="article"
      aria-labelledby={`service-title-${service.id}`}
      aria-describedby={`service-description-${service.id}`}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Icon Container */}
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out shadow-lg"
          style={{backgroundColor: '#d4af37'}}
          aria-hidden="true"
        >
          <Icon
            className="w-8 h-8 text-white drop-shadow-sm"
            aria-hidden="true"
          />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800/10 group-hover:bg-gray-800/20 transition-colors duration-300" />
      </div>

      <h3
        id={`service-title-${service.id}`}
        className="text-2xl font-bold mb-4 leading-tight group-hover:text-gray-800 transition-colors duration-300"
        style={{color: '#1a2642'}}
      >
        {service.title}
      </h3>

      <p
        id={`service-description-${service.id}`}
        className="text-charcoal mb-6 leading-relaxed text-base group-hover:text-gray-700 transition-colors duration-300"
      >
        {service.description}
      </p>

      <ul className="space-y-3" role="list" aria-label={`Основни услуги за ${service.title}`}>
        {service.features.map((feature, idx) => (
          <li
            key={`${service.id}-feature-${idx}`}
            className="flex items-start text-sm text-charcoal group-hover:text-gray-700 transition-colors duration-300"
          >
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle
                className="w-3 h-3 text-white"
                aria-hidden="true"
              />
            </div>
            <span className="leading-relaxed font-medium">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};

const ServicesSection = ({ id }: { id?: string }) => {
  return (
    <section
      id={id || "services"}
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50/30 relative overflow-hidden"
      aria-labelledby="services-heading"
      role="region"
    >
      <div className="absolute inset-0 bg-white pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <header className="text-center mb-16 sm:mb-20 lg:mb-24">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{backgroundColor: '#d4af37'}}
            >
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{color: '#1a2642'}}>
              Нашите услуги
            </span>
          </div>
          <h2
            id="services-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight"
            style={{color: '#1a2642'}}
          >
            Професионални услуги
            <span className="block mt-2" style={{color: '#1a2642'}}>за недвижими имоти</span>
          </h2>
          <p className="text-xl sm:text-2xl text-charcoal max-w-4xl mx-auto leading-relaxed">
            Предлагаме пълен спектър от услуги в областта на недвижимите имоти с професионален подход и персонализирано обслужване
          </p>
        </header>

        {/* Services Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
          role="grid"
          aria-label="Списък с услуги"
        >
          {SERVICES_DATA.map((service, index) => (
            <div
              key={service.id}
              role="gridcell"
              className="animate-in fade-in-0 slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div
            className="relative p-8 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto"
            style={{backgroundColor: '#d4af37'}}
            role="complementary"
            aria-labelledby="cta-heading"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />

            <div className="relative z-10">
              <h3
                id="cta-heading"
                className="text-2xl font-bold text-white mb-4 leading-tight"
              >
                Не намирате това, което търсите?
              </h3>

              <p className="text-white/90 mb-6 max-w-xl mx-auto leading-relaxed">
                Свържете се с нас за персонализирана консултация и ние ще намерим най-доброто решение за вас
              </p>

              <ServicesCTAButton />

              <p id="cta-description" className="sr-only">
                Ще бъде отворена форма за заявка за безплатна консултация
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
