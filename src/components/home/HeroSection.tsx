"use client";

/**
 * HeroSection component
 *
 * Purpose: Renders the main landing hero section for Nova Nest Real Estate with a
 * background image and responsive Bulgarian typography. Features a two-column layout
 * with content on the left and search form on the right.
 *
 * Accessibility: Uses semantic HTML and includes an aria-label on the main section.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Star, MapPin, Users } from "lucide-react";
import PropertySearchForm from "@/components/forms/PropertySearchForm";

export interface HeroSectionProps {
  id?: string;
}

/**
 * Renders the hero section with background image and two-column layout.
 */
export default function HeroSection({ id }: HeroSectionProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id={id}
      aria-label="Hero section"
      className="relative w-full min-h-[85vh] lg:min-h-[90vh] xl:min-h-[95vh] scroll-mt-[80px] overflow-hidden"
    >
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 scale-110 transform-gpu">
          <Image
            src="/images/hero-building.jpg"
            alt="Beautiful building in Stara Zagora"
            fill
            className="object-cover transition-transform duration-[20s] ease-out hover:scale-105"
            priority
            sizes="100vw"
          />
        </div>
        
        {/* Enhanced gradient overlay with multiple layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2642]/85 via-[#2c3e50]/75 to-[#1a2642]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {/* Floating stars */}
        <div className="absolute top-20 left-10 animate-pulse">
          <Star className="h-4 w-4 text-[#d4af37]/60" />
        </div>
        <div className="absolute top-32 right-20 animate-pulse delay-1000">
          <Star className="h-3 w-3 text-[#d4af37]/40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-2000">
          <Star className="h-5 w-5 text-[#d4af37]/50" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[85vh] lg:min-h-[90vh] xl:min-h-[95vh] items-center py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full items-center">
            {/* Left Column - Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-sm font-medium">Персонализиран подход</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#d4af37]" />
                  <span className="text-sm font-medium">Стара Загора</span>
                </div>
              </div>

              <h1 className="font-bold tracking-tight text-white leading-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl mb-8">
                <span className="block">Открийте своето</span>
                <span className="block bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
                  ново гнездо
                </span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-white/90 font-normal">
                  в Стара Загора
                </span>
              </h1>

              <p className="text-white/90 leading-relaxed text-lg sm:text-xl lg:text-2xl xl:text-3xl mb-12 max-w-2xl mx-auto lg:mx-0 font-light">
                Професионални услуги за недвижими имоти с индивидуален подход и експертни съвети за вашия идеален дом
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/properties"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#f4d03f] px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[#d4af37]/25 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 relative overflow-hidden"
                  aria-label="Търси имоти сега"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f4d03f] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Search className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Търси имоти сега</span>
                  <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
                  aria-label="Свържи се с нас"
                >
                  <span>Свържи се с нас</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Stats Section */}
              <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#d4af37] mb-2">95%</div>
                  <div className="text-sm text-white/80">Успешни сделки</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#d4af37] mb-2">24/7</div>
                  <div className="text-sm text-white/80">Съдействие на клиентите</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#d4af37] mb-2">100%</div>
                  <div className="text-sm text-white/80">Доверие</div>
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Search Form */}
            <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="w-full max-w-lg">
                <div className="relative">
                  {/* Glow effect behind form */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/20 to-[#f4d03f]/20 rounded-2xl blur-lg opacity-75" />
                  <div className="relative">
                    <PropertySearchForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
          <span className="text-sm font-medium">Прокрутете надолу</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}


