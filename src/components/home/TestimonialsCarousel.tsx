"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Home, MapPin } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  location?: string;
  rating: number;
  quote: string;
  avatar?: string;
  propertyType?: string;
}

const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
  <div className={cn("flex items-center gap-0.5", className)}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-[#d4af37] text-[#d4af37]" : "text-muted-foreground/30"
        )}
      />
    ))}
  </div>
);

const TestimonialCardComponent = ({ testimonial }: { testimonial: TestimonialData }) => (
  <Card className="bg-card border-border shadow-lg h-full">
    <CardContent className="p-6 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-14 w-14 border-2 border-[#d4af37]">
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback className="bg-[#1a2642] text-white">
            {testimonial.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-lg">{testimonial.name}</h4>
          {testimonial.location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-[#d4af37]" />
              <span className="text-xs text-muted-foreground">{testimonial.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <StarRating rating={testimonial.rating} />
        <span className="text-sm font-medium text-foreground">{testimonial.rating.toFixed(1)}</span>
      </div>

      {testimonial.propertyType && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <Home className="h-3 w-3 text-[#d4af37]" />
          <span>{testimonial.propertyType}</span>
        </div>
      )}

      <blockquote className="text-muted-foreground leading-relaxed flex-1">
        "{testimonial.quote}"
      </blockquote>
    </CardContent>
  </Card>
);

interface TestimonialsCarouselProps {
  testimonials: TestimonialData[];
  autoplay: boolean;
}

export function TestimonialsCarousel({ testimonials, autoplay }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const computeItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 768) setItemsPerView(1);
      else if (width < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    computeItemsPerView();
    window.addEventListener("resize", computeItemsPerView);
    return () => window.removeEventListener("resize", computeItemsPerView);
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerView);
  const maxIndex = Math.max(0, totalPages - 1);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    setCurrentIndex((idx) => Math.min(idx, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (autoplay && totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, totalPages]);

  const getCurrentTestimonials = () => {
    const start = currentIndex * itemsPerView;
    const end = start + itemsPerView;
    return testimonials.slice(start, end);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="relative min-h-[400px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            <div className={cn(
              "grid gap-6",
              itemsPerView === 1 ? "grid-cols-1" :
              itemsPerView === 2 ? "grid-cols-1 md:grid-cols-2" :
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
              {getCurrentTestimonials().map((testimonial, index) => (
                <TestimonialCardComponent
                  key={`${currentIndex}-${index}`}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={handlePrev}
            variant="secondary"
            size="sm"
            className="h-10 w-10 rounded-full border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1a2642]"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-[#d4af37]"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
          <Button
            onClick={handleNext}
            variant="secondary"
            size="sm"
            className="h-10 w-10 rounded-full border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1a2642]"
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
