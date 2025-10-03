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
      description: "Работим с най-високи стандарти и етични принципи в областта на недвижимите имоти."
    },
    {
      icon: Users,
      title: "Личен подход",
      description: "Всеки клиент е уникален за нас и получава индивидуално внимание и грижа."
    },
    {
      icon: Eye,
      title: "Прозрачност",
      description: "Осигуряваме пълна прозрачност в процеса и честни съвети за всяка сделка."
    },
    {
      icon: Zap,
      title: "Иновации",
      description: "Използваме най-съвременните технологии за по-ефективно обслужване."
    }
  ];

  return (
    <section className={`py-20 bg-nova-gray ${inter.variable}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-nova-blue mb-4">
            Nova Nest Real Estate
          </h2>
          <p className="text-xl text-nova-blue/80 mb-8">
            Вашият доверен партньор
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed text-nova-gray-dark">
              Ние сме водеща агенция за недвижими имоти в Стара Загора с богат опит и дълбоко познаване на местния пазар. 
              Нашата мисия е да помогнем на хората да намерят перфектното място, което да наричат "дом" - 
              тяхното ново гнездо.
            </p>
          </div>
        </div>

        {/* Value Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="p-4 text-center shadow-medium hover:shadow-large transition-smooth group">
                {/* Icon Circle Container */}
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-bounce">
                  <Icon className="w-7 h-7 text-nova-blue" />
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-bold text-nova-blue mb-2 leading-tight">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-nova-gray-dark leading-relaxed">
                  {value.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-large text-white">
            <h3 className="text-2xl font-bold mb-4">
              Защо да изберете Nova Nest?
            </h3>
            <p className="text-lg text-white max-w-2xl mx-auto">
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


