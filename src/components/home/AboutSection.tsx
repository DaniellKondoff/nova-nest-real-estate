"use client";

import { Card } from "@/components/ui/card";
import { Shield, Users, Eye, Zap } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: "Професионализъм",
      description: "Работим с най-високи стандарти и етични принципи в областта на недвижимите имоти.",
      ariaLabel: "Професионализъм - Високи стандарти в недвижимите имоти"
    },
    {
      icon: Users,
      title: "Личен подход",
      description: "Всеки клиент е уникален за нас и получава индивидуално внимание и грижа.",
      ariaLabel: "Личен подход - Индивидуално внимание за всеки клиент"
    },
    {
      icon: Eye,
      title: "Прозрачност",
      description: "Осигуряваме пълна прозрачност в процеса и честни съвети за всяка сделка.",
      ariaLabel: "Прозрачност - Честни съвети и прозрачен процес"
    },
    {
      icon: Zap,
      title: "Иновации",
      description: "Използваме най-съвременните технологии за по-ефективно обслужване.",
      ariaLabel: "Иновации - Съвременни технологии за ефективно обслужване"
    }
  ];

  return (
    <section 
      id="about"
      className={`py-16 md:py-20 lg:py-24 bg-gradient-to-br from-slate-50 to-gray-100 ${inter.variable}`}
      aria-labelledby="about-heading"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 
            id="about-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-nova-blue mb-4 leading-tight"
          >
            Nova Nest Real Estate
          </h2>
          <p className="text-lg md:text-xl text-nova-blue/80 mb-6 md:mb-8 font-medium">
            Вашият доверен партньор
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-base md:text-lg leading-relaxed text-nova-gray-dark">
              Ние сме водеща агенция за недвижими имоти в Стара Загора с богат опит и дълбоко познаване на местния пазар. 
              Нашата мисия е да помогнем на хората да намерят перфектното място, което да наричат "дом" - 
              тяхното ново гнездо.
            </p>
          </div>
        </header>

        {/* Value Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card 
                key={index} 
                className="p-6 text-center shadow-medium hover:shadow-large transition-smooth group"
              >
                {/* Icon Circle Container */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-bounce"
                  style={{backgroundColor: '#d4af37'}}
                >
                  <Icon className="w-8 h-8 text-nova-blue" />
                </div>
                
                {/* Title */}
                <h4 className="text-base md:text-lg lg:text-xl font-bold text-nova-blue mb-3 leading-tight whitespace-nowrap">
                  {value.title}
                </h4>
                
                {/* Description */}
                <p className="text-nova-gray-dark leading-relaxed">
                  {value.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <div 
            className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-large text-white hover:shadow-xl transition-shadow duration-300"
            role="complementary"
            aria-labelledby="cta-heading"
          >
            <h3 
              id="cta-heading"
              className="text-xl md:text-2xl font-bold mb-4"
            >
              Защо да изберете Nova Nest?
            </h3>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
              С над 10 години опит в сферата на недвижимите имоти, ние сме помогнали на стотици семейства 
              да намерят перфектния дом в Стара Загора. Нашият експертен екип познава всеки квартал и 
              може да ви предложи най-добрите възможности на пазара.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;


