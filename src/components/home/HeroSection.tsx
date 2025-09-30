/**
 * HeroSection component
 *
 * Purpose: Renders the main landing hero section for Nova Nest Real Estate with a navy
 * gradient background and responsive Bulgarian typography. The structure follows a
 * three-layer layout (section → container → content wrapper) and is fully responsive.
 *
 * Accessibility: Uses semantic HTML and includes an aria-label on the main section.
 */

import React from "react";
import Link from "next/link";
import PropertySearchForm from "@/components/forms/PropertySearchForm";

export interface HeroSectionProps {
  id?: string;
}

/**
 * Renders the hero section with gradient background and Bulgarian typography.
 */
export default function HeroSection({ id }: HeroSectionProps): React.ReactElement {
  return (
    <section
      id={id}
      aria-label="Hero section"
      className="relative w-full bg-gradient-to-br from-[#1a2642] to-[#2c3e50] min-h-[600px] lg:min-h-[700px] scroll-mt-[80px]"
    >
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[600px] lg:min-h-[700px] flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="w-full">
            <h1
              className="text-center font-semibold tracking-tight text-white leading-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto mb-6"
            >
              Открийте своето ново гнездо в Стара Загора
            </h1>

            <p
              className="text-center text-white/90 leading-relaxed text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto"
            >
              Професионални услуги за недвижими имоти с индивидуален подход и експертни съвети
            </p>

            {/* CTA Button: centered below heading/subheading */}
            <div className="mt-8 flex w-full items-center justify-center">
              <Link
                href="/properties"
                className="rounded-lg bg-[#d4af37] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-[#c49d2f] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2642]"
                aria-label="Разгледайте имотите"
              >
                Разгледайте имотите
              </Link>
            </div>
          </div>

          <div className="w-full mt-10 lg:mt-12">
            <PropertySearchForm />
          </div>
        </div>
      </div>
    </section>
  );
}


