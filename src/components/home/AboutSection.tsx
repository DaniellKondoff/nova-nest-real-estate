"use client";

import { Card } from "@/components/ui/card";
import { Shield, Users, Eye, Zap, Star, Award, TrendingUp, Heart } from "lucide-react";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('about');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

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

  const stats = [
    { icon: Star, value: "500+", label: "Доволни клиенти", color: "text-nova-blue" },
    { icon: Award, value: "10+", label: "Години опит", color: "text-nova-blue" },
    { icon: TrendingUp, value: "95%", label: "Успешни сделки", color: "text-nova-blue" },
    { icon: Heart, value: "24/7", label: "Поддръжка", color: "text-nova-blue" }
  ];

  return (
    <section 
      id="about"
      className={`relative py-20 md:py-28 lg:py-32 overflow-hidden ${inter.variable}`}
      aria-labelledby="about-heading"
      role="region"
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with enhanced animations */}
        <header className={`text-center mb-16 md:mb-20 lg:mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-nova-blue text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Водеща агенция в Стара Загора
          </div>
          
          <h2 
            id="about-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-nova-blue mb-6 leading-tight"
          >
            Nova Nest Real Estate
          </h2>
          
          <p className="text-xl md:text-2xl text-nova-blue/80 mb-8 font-medium">
            Вашият доверен партньор за перфектния дом
          </p>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed text-nova-gray-dark">
              Ние сме водеща агенция за недвижими имоти в Стара Загора с богат опит и дълбоко познаване на местния пазар. 
              Нашата мисия е да помогнем на хората да намерят перфектното място, което да наричат "дом" - 
              тяхното ново гнездо.
            </p>
          </div>
        </header>

        {/* Stats Section */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-r from-blue-100 to-white">
                  <Icon className="w-6 h-6 text-nova-blue" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-nova-blue mb-1">{stat.value}</div>
                <div className="text-sm md:text-base text-nova-gray-dark font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Value Cards Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card 
                key={index} 
                className={`group relative p-8 text-center bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Enhanced Icon Container */}
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                    style={{backgroundColor: '#d4af37'}}
                  >
                    <Icon className="w-10 h-10 text-nova-blue" />
                  </div>
                  
                  {/* Title */}
                  <h4 className="text-lg md:text-xl font-bold text-nova-blue mb-4 leading-tight group-hover:text-nova-blue transition-colors duration-300">
                    {value.title}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-nova-gray-dark leading-relaxed group-hover:text-nova-gray-dark transition-colors duration-300">
                    {value.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r from-blue-200 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-gradient-to-r from-blue-200 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className={`text-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div 
            className="relative p-8 md:p-12 rounded-3xl overflow-hidden"
            role="complementary"
            aria-labelledby="cta-heading"
          >
            {/* Background with multiple gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.2),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
            
            {/* Content */}
            <div className="relative z-10 text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Надежден партньор от 2014 г.
              </div>
              
              <h3 
                id="cta-heading"
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-white"
              >
                Защо да изберете Nova Nest?
              </h3>
              
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                С над 10 години опит в сферата на недвижимите имоти, ние сме помогнали на стотици семейства 
                да намерят перфектния дом в Стара Загора. Нашият експертен екип познава всеки квартал и 
                може да ви предложи най-добрите възможности на пазара.
              </p>

              {/* Call to action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 py-4 bg-gradient-to-r from-nova-blue to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  Започнете търсенето
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  Свържете се с нас
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;


