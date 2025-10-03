"use client";
import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ShoppingCart, 
  KeyRound, 
  Building2, 
  Calculator, 
  FileText,
  ArrowRight,
  CheckCircle
} from "lucide-react";

// Memoized service data for performance
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
    features: ["Персонализирана търсене", "Правни проверки", "Съпровождане до сделката"],
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
    id: "property-valuation",
    icon: Calculator,
    title: "Оценка на имоти",
    description: "Професионална оценка на пазарната стойност на недвижими имоти",
    features: ["Пазарен анализ", "Детайлен доклад", "Консултация с експерт"],
    ariaLabel: "Услуги за оценка на недвижими имоти"
  },
  {
    id: "legal-support",
    icon: FileText,
    title: "Правна подкрепа",
    description: "Пълно юридическо обслужване при сделки с недвижими имоти",
    features: ["Проверка на документи", "Изготвяне на договори", "Нотариални услуги"],
    ariaLabel: "Правни услуги за недвижими имоти"
  }
] as const;

// Memoized ServiceCard component for better performance
const ServiceCard = memo(({ 
  service, 
  index 
}: { 
  service: (typeof SERVICES_DATA)[number]; 
  index: number; 
}) => {
  const Icon = service.icon;
  
  const handleCardClick = useCallback(() => {
    // Add analytics or navigation logic here
    console.log(`Service card clicked: ${service.id}`);
  }, [service.id]);

  return (
    <Card 
      className="group relative p-6 h-full shadow-lift hover:shadow-card transition-all duration-300 ease-out cursor-pointer focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2"
      onClick={handleCardClick}
      role="article"
      aria-labelledby={`service-title-${service.id}`}
      aria-describedby={`service-description-${service.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Icon Container with improved accessibility */}
      <div 
        className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-out"
        style={{backgroundColor: '#d4af37'}}
        aria-hidden="true"
      >
        <Icon 
          className="w-7 h-7 text-primary" 
          aria-hidden="true"
        />
      </div>
      
      {/* Title with proper heading hierarchy */}
      <h3 
        id={`service-title-${service.id}`}
        className="text-xl font-bold text-primary mb-3 leading-tight"
      >
        {service.title}
      </h3>
      
      {/* Description with improved readability */}
      <p 
        id={`service-description-${service.id}`}
        className="text-charcoal mb-4 leading-relaxed text-base"
      >
        {service.description}
      </p>
      
      {/* Features list with better visual hierarchy */}
      <ul className="space-y-2" role="list" aria-label={`Основни услуги за ${service.title}`}>
        {service.features.map((feature, idx) => (
          <li 
            key={`${service.id}-feature-${idx}`}
            className="flex items-start text-sm text-charcoal"
          >
            <CheckCircle 
              className="w-4 h-4 text-accent mr-3 mt-0.5 flex-shrink-0" 
              aria-hidden="true"
            />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Subtle hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

const ServicesSection = ({ id }: { id?: string }) => {

  const handleConsultationClick = useCallback(() => {
    // Add analytics tracking
    console.log('Free consultation CTA clicked');
    // Navigate to contact form or open modal
  }, []);

  return (
    <section 
      id={id || "services"} 
      className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden"
      aria-labelledby="services-heading"
      role="region"
    >
      {/* Background decoration for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header with improved typography and spacing */}
        <header className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 
            id="services-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6 leading-tight tracking-tight"
          >
            Нашите услуги
          </h2>
          <p className="text-lg sm:text-xl text-charcoal max-w-3xl mx-auto leading-relaxed">
            Предлагаме пълен спектър от услуги в областта на недвижимите имоти с професионален подход и персонализирано обслужване
          </p>
        </header>

        {/* Services Grid with improved responsive design */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          role="grid"
          aria-label="Списък с услуги"
        >
          {SERVICES_DATA.map((service, index) => (
            <div 
              key={service.id}
              role="gridcell"
              className="animate-in fade-in-0 slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <ServiceCard service={service} index={index} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div 
            className="p-8 rounded-2xl shadow-card"
            style={{backgroundColor: '#d4af37'}}
            role="complementary"
            aria-labelledby="cta-heading"
          >
            <h3 
              id="cta-heading"
              className="text-2xl font-bold text-primary mb-4"
            >
              Не намирате това, което търсите?
            </h3>
            <p className="text-primary/80 mb-6 max-w-xl mx-auto">
              Свържете се с нас за персонализирана консултация и ние ще намерим най-доброто решение за вас
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-gray-800 hover:bg-gray-900 text-white border-0"
              onClick={handleConsultationClick}
              aria-describedby="cta-description"
            >
              Безплатна консултация
            </Button>
            <p id="cta-description" className="sr-only">
              Ще бъдете пренасочени към форма за контакт за безплатна консултация
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;


