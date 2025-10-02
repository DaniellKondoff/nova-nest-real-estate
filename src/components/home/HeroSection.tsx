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

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import PropertySearchForm from "@/components/forms/PropertySearchForm";

export interface HeroSectionProps {
  id?: string;
}

/**
 * Renders the hero section with background image and two-column layout.
 */
export default function HeroSection({ id }: HeroSectionProps): React.ReactElement {
  return (
    <section
      id={id}
      aria-label="Hero section"
      className="relative w-full min-h-[600px] lg:min-h-[700px] scroll-mt-[80px] overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-building.jpg"
          alt="Beautiful building in Stara Zagora"
          fill
          className="object-cover"
          priority
        />
        {/* Blue gradient overlay for better text readability and design consistency */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2642]/80 to-[#2c3e50]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[600px] lg:min-h-[700px] items-center py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h1
                className="font-bold tracking-tight text-white leading-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-6"
              >
                Открийте своето ново гнездо в Стара Загора
              </h1>

              <p
                className="text-white/90 leading-relaxed text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Професионални услуги за недвижими имоти с индивидуален подход и експертни съвети
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/properties"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#c49d2f] hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
                  aria-label="Търси имоти сега"
                >
                  <Search className="h-5 w-5" />
                  Търси имоти сега
                </Link>
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-gray-600 hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
                  aria-label="Свържи се с нас"
                >
                  Свържи се с нас
                </button>
              </div>
            </div>

            {/* Right Column - Search Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <PropertySearchForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


