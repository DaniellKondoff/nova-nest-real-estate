"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Home, MapPin, AlertCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/Typography";
import { getApprovedTestimonials, type Testimonial } from "@/lib/queries/testimonials";

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  location?: string;
  rating: number;
  quote: string;
  avatar?: string;
  propertyType?: string;
}

interface TestimonialsSectionProps extends React.ComponentPropsWithoutRef<"section"> {
  heading?: string;
  subheading?: string;
  autoplay?: boolean;
  className?: string;
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
          <AvatarFallback className="bg-[#1a2642] text-[#d4af37]">
            {testimonial.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-lg">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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

const MarqueeTestimonials = ({ testimonials }: { testimonials: TestimonialData[] }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<number | null>(null);
  
  // Duplicate testimonials to ensure seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  
  // Don't render if no testimonials
  if (testimonials.length === 0) {
    return null;
  }
  
  React.useEffect(() => {
    if (!marqueeRef.current) return;
    
    const element = marqueeRef.current;
    let startTime: number;
    let currentPosition = 0;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      if (!isHovered) {
        const elapsed = timestamp - startTime;
        const progress = (elapsed / 30000) % 1; // 30 seconds duration
        currentPosition = progress * -50; // Move by 50% (half the duplicated content)
        element.style.transform = `translateX(${currentPosition}%)`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    console.log('Starting marquee animation with', duplicatedTestimonials.length, 'testimonials');
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, duplicatedTestimonials.length]);
  
  return (
    <div className="relative w-full overflow-hidden py-8">
      <div 
        ref={marqueeRef}
        className="flex gap-6"
        style={{
          width: '200%' // Double width to accommodate duplicated content
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {duplicatedTestimonials.map((testimonial, i) => (
          <div key={`marquee-${i}`} className="flex-shrink-0 w-[320px] sm:w-[360px]">
            <TestimonialCardComponent testimonial={testimonial} />
          </div>
        ))}
      </div>
      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
};

const CarouselTestimonials = ({ 
  testimonials, 
  autoplay 
}: { 
  testimonials: TestimonialData[]; 
  autoplay: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, currentIndex]);

  return (
    <div className="relative max-w-4xl mx-auto px-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TestimonialCardComponent testimonial={testimonials[currentIndex]} />
              {testimonials[(currentIndex + 1) % testimonials.length] && (
                <div className="hidden md:block">
                  <TestimonialCardComponent 
                    testimonial={testimonials[(currentIndex + 1) % testimonials.length]} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          onClick={handlePrev}
          variant="secondary"
          size="sm"
          className="h-10 w-10 rounded-full border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1a2642]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "w-8 bg-[#d4af37]" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        <Button
          onClick={handleNext}
          variant="secondary"
          size="sm"
          className="h-10 w-10 rounded-full border-[#d4af37] hover:bg-[#d4af37] hover:text-[#1a2642]"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export function TestimonialsSection({
  heading = "Какво казват нашите клиенти",
  subheading = "Доверени от стотици доволни собственици и инвеститори",
  autoplay = true,
  className,
  ...rest
}: TestimonialsSectionProps) {
  const [data, setData] = React.useState<TestimonialData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"marquee" | "carousel">("carousel");

  React.useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      setLoading(true);
      setError(null);
      try {
        const res = await getApprovedTestimonials(12);
        if (!cancelled) {
          // Transform the data to match our new interface
          const transformedData: TestimonialData[] = res.map((testimonial: Testimonial) => ({
            id: testimonial.id,
            name: testimonial.clientName,
            role: testimonial.role || "Клиент",
            rating: testimonial.rating,
            quote: testimonial.testimonial,
            avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 1000000000}?w=150&h=150&fit=crop&crop=face`,
            propertyType: "Недвижим имот"
          }));
          setData(transformedData);
        }
      } catch (e: unknown) {
        if (!cancelled) setError("Не успяхме да заредим отзивите. Моля, опитайте отново.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

  return (
    <Section
      tone="white"
      className={cn("w-full py-16 md:py-24 px-4 bg-background", className)}
      aria-label="Testimonials section"
      {...rest}
    >
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#1a2642]/10 border border-[#d4af37]/20">
            <Star className="h-4 w-4 fill-[#d4af37] text-[#d4af37]" />
            <span className="text-sm font-medium text-[#1a2642]">Клиентски отзиви</span>
          </div>
          <Heading as="h2" size="h2" weight="semibold" color="primary" className="tracking-wide mb-4">
            {heading}
          </Heading>
          <Text as="p" size="lg" color="gray" className="text-lg text-muted-foreground">
            {subheading}
          </Text>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]"></div>
          </div>
        ) : error ? (
          <div className="mt-4 rounded-md border p-6 text-center border-black/10 text-charcoal/80">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <AlertCircle className="h-5 w-5 text-accent" />
            </div>
            <p>Не успяхме да заредим отзивите. Моля, опитайте отново.</p>
          </div>
        ) : data.length === 0 ? (
          <div className="mt-4 rounded-md border p-6 text-center border-black/10 text-charcoal/70">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <p>Все още няма добавени отзиви.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-8">
              <Button
                variant={viewMode === "carousel" ? "primary" : "secondary"}
                onClick={() => setViewMode("carousel")}
                className="rounded-full"
              >
                Карусел
              </Button>
              <Button
                variant={viewMode === "marquee" ? "primary" : "secondary"}
                onClick={() => setViewMode("marquee")}
                className="rounded-full"
              >
                Маркиз
              </Button>
            </div>

            {viewMode === "marquee" ? (
              <MarqueeTestimonials testimonials={data} />
            ) : (
              <CarouselTestimonials testimonials={data} autoplay={autoplay} />
            )}

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-8 p-6 rounded-xl bg-muted/50 border border-border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a2642]">500+</p>
                  <p className="text-sm text-muted-foreground">Доволни клиенти</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <p className="text-3xl font-bold text-[#1a2642]">4.9</p>
                    <Star className="h-6 w-6 fill-[#d4af37] text-[#d4af37]" />
                  </div>
                  <p className="text-sm text-muted-foreground">Средна оценка</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a2642]">€2M+</p>
                  <p className="text-sm text-muted-foreground">Продадени имоти</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

export default TestimonialsSection;


