"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import type { Neighborhood } from "@/lib/queries/neighborhoods";

interface NeighborhoodHeroProps {
  neighborhood: Neighborhood;
  propertyCount: number;
}

/**
 * Hero section for neighborhood landing pages
 * Features navy gradient background with neighborhood information
 */
export default function NeighborhoodHero({ 
  neighborhood, 
  propertyCount 
}: NeighborhoodHeroProps) {
  const scrollToProperties = () => {
    const propertiesSection = document.getElementById("properties");
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const description = neighborhood.description 
    ? neighborhood.description.substring(0, 200) + (neighborhood.description.length > 200 ? "..." : "")
    : `Квартал ${neighborhood.name_bg} в Стара Загора предлага разнообразни жилищни възможности.`;

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Navy gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2642] via-[#2a3a5c] to-[#1a2642]" />
      
      {/* Optional background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-repeat" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Имоти в{" "}
            <span className="text-[#d4af37]">{neighborhood.name_bg}</span>
          </h1>
          
          {/* Property count */}
          <div className="mb-8">
            <span className="inline-block bg-[#d4af37] text-[#1a2642] px-6 py-3 rounded-full text-lg font-semibold">
              {propertyCount} активни обяви
            </span>
          </div>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
          
          {/* CTA Button */}
          <Button
            onClick={scrollToProperties}
            size="lg"
            className="bg-[#d4af37] hover:bg-[#b8941f] text-[#1a2642] font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Разгледай обяви
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <ArrowDown className="h-6 w-6" />
      </div>
    </section>
  );
}
