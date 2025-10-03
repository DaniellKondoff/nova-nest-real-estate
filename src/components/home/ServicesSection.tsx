"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ShoppingCart, 
  KeyRound, 
  Building2, 
  Calculator, 
  FileText,
  ArrowRight
} from "lucide-react";

const ServicesSection = ({ id }: { id?: string }) => {
  const services = [
    {
      icon: ShoppingCart,
      title: "Продажба на имоти",
      description: "Професионална помощ при продажбата на вашия имот с максимална цена и бързи сроков",
      features: ["Оценка на имота", "Маркетинг стратегия", "Договаряне на цената"]
    },
    {
      icon: Home,
      title: "Покупка на имоти",
      description: "Намираме перфектния дом според вашите критерии и бюджет",
      features: ["Персонализирана търсене", "Правни проверки", "Съпровождане до сделката"]
    },
    {
      icon: KeyRound,
      title: "Отдаване под наем",
      description: "Управление на вашия имот и намиране на надеждни наематели",
      features: ["Скрининг на наематели", "Договори за наем", "Управление на имота"]
    },
    {
      icon: Building2,
      title: "Наемане на имоти",
      description: "Богат избор от апартаменти и къщи за наем в различни райони",
      features: ["Верифицирани имоти", "Гъвкави условия", "Бърза процедура"]
    },
    {
      icon: Calculator,
      title: "Оценка на имоти",
      description: "Професионална оценка на пазарната стойност на недвижими имоти",
      features: ["Пазарен анализ", "Детайлен доклад", "Консултация с експерт"]
    },
    {
      icon: FileText,
      title: "Правна подкрепа",
      description: "Пълно юридическо обслужване при сделки с недвижими имоти",
      features: ["Проверка на документи", "Изготвяне на договори", "Нотариални услуги"]
    }
  ];

  return (
    <section id={id || "services"} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Нашите услуги
          </h2>
          <p className="text-xl text-charcoal max-w-2xl mx-auto">
            Предлагаме пълен спектър от услуги в областта на недвижимите имоти
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="p-6 shadow-lift hover:shadow-card transition-all duration-300 group">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-out" style={{backgroundColor: '#d4af37'}}>
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
                <p className="text-charcoal mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-charcoal">
                      <div className="w-1.5 h-1.5 rounded-full mr-2" style={{backgroundColor: '#d4af37'}}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="p-8 rounded-2xl shadow-card" style={{backgroundColor: '#d4af37'}}>
            <h3 className="text-2xl font-bold text-primary mb-4">
              Не намирате това, което търсите?
            </h3>
            <p className="text-primary mb-6 max-w-xl mx-auto">
              Свържете се с нас за персонализирана консултация и ние ще намерим най-доброто решение за вас
            </p>
            <Button variant="secondary" size="lg" className="bg-gray-800 hover:bg-gray-900 text-white border-0">
              Безплатна консултация
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;


