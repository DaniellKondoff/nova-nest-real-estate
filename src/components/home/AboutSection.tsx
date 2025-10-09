"use client";

import { Card } from "@/components/ui/card";
import { Shield, Users, Eye, Zap, Star, Award, TrendingUp, Heart } from "lucide-react";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Navigation handlers
  const handleStartSearch = () => {
    router.push("/properties");
  };

  const handleContactUs = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    { icon: Star, value: "Десетки", label: "доволни клиенти", color: "text-nova-blue" },
    { icon: Award, value: "100%", label: "Качество", color: "text-nova-blue" },
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
      {/* Background with animated gradient - darker on mobile for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-gray-200 md:from-slate-50 md:to-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with enhanced animations */}
        <header className={`text-center mb-16 md:mb-20 lg:mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white md:bg-gradient-to-r md:from-blue-100 md:to-indigo-100 border-2 border-slate-300 md:border-0 text-nova-blue text-sm font-bold md:font-medium mb-6 shadow-sm" style={{color: '#1a2642'}}>
            <Star className="w-4 h-4" style={{color: '#1a2642'}} />
            Водеща агенция в Стара Загора
          </div>
          
          <h2 
            id="about-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black md:font-bold text-nova-blue mb-6 leading-tight drop-shadow-sm"
            style={{color: '#1a2642'}}
          >
            Nova Nest Real Estate
          </h2>
          
          <p className="text-xl md:text-2xl text-nova-blue mb-8 font-bold md:font-medium drop-shadow-sm" style={{color: '#1a2642'}}>
            Вашият доверен партньор за перфектния дом
          </p>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed text-slate-900 md:text-nova-gray-dark font-semibold md:font-normal">
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
                className="text-center p-6 rounded-2xl bg-white border-2 border-slate-300 md:border md:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:bg-white/80 md:backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100 border-2 border-blue-300 md:border md:bg-gradient-to-r md:from-blue-100 md:to-white">
                  <Icon className="w-6 h-6" style={{color: '#1a2642'}} />
                </div>
                <div className="text-2xl md:text-3xl font-black md:font-bold text-nova-blue mb-1" style={{color: '#1a2642'}}>{stat.value}</div>
                <div className="text-sm md:text-base text-slate-900 md:text-nova-gray-dark font-bold md:font-medium">{stat.label}</div>
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
                className={`group relative p-8 text-center bg-white border-2 border-slate-300 md:border-0 md:bg-white/90 md:backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
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
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-2 border-slate-300 md:border-0"
                    style={{backgroundColor: '#d4af37'}}
                  >
                    <Icon className="w-10 h-10" style={{color: '#1a2642'}} />
                  </div>
                  
                  {/* Title */}
                  <h4 className="text-lg md:text-xl font-black md:font-bold text-nova-blue mb-4 leading-tight group-hover:text-nova-blue transition-colors duration-300" style={{color: '#1a2642'}}>
                    {value.title}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-slate-900 md:text-nova-gray-dark leading-relaxed font-semibold md:font-normal group-hover:text-nova-gray-dark transition-colors duration-300">
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
            className="relative p-8 md:p-12 rounded-3xl overflow-hidden shadow-xl"
            role="complementary"
            aria-labelledby="cta-heading"
          >
            {/* Background with multiple gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.2),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
            
            {/* Content */}
            <div className="relative z-10 text-white">
              
              <h3 
                id="cta-heading"
                className="text-2xl md:text-3xl lg:text-4xl font-black md:font-bold mb-6 text-white drop-shadow-md"
              >
                Защо да изберете Nova Nest?
              </h3>
              
              <p className="text-base md:text-lg lg:text-xl text-white max-w-3xl mx-auto leading-relaxed mb-8 font-semibold md:font-normal drop-shadow-sm md:text-white/90">
                С над 10 години опит в сферата на недвижимите имоти, ние сме помогнали на стотици семейства 
                да намерят перфектния дом в Стара Загора. Нашият експертен екип познава всеки квартал и 
                може да ви предложи най-добрите възможности на пазара.
              </p>

              {/* Call to action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleStartSearch}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-nova-blue to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  aria-label="Започнете търсенето на имоти"
                >
                  Започнете търсенето
                </button>
                <button 
                  onClick={handleContactUs}
                  className="w-full sm:w-auto px-8 py-4 bg-nova-blue md:bg-white/10 md:backdrop-blur-sm text-white font-black md:font-semibold rounded-xl border-2 border-white md:border-white/20 hover:bg-slate-800 md:hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md"
                  aria-label="Свържете се с нас за повече информация"
                >
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


